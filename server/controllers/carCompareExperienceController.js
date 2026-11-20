import { randomUUID } from "node:crypto";
import Review, { CarCompareResearchLease } from "../models/carCompareReviewModel.js";
import Settings from "../models/carCompareSettingsModel.js";
import Variant from "../models/carCatalogVariantModel.js";
import { parseCatalogTokens, resolveComparisonDetails, resolveVehicles } from "./carCatalogController.js";
import { chooseComparisonEvidence, compareModelsWithAi, comparisonAiConfigured, missingResearchFields, researchComparison, searchUsedAskingPrices, validateComparisonFields } from "../utils/carCompareResearch.js";
import { escapeRegex } from "../utils/helpers.js";
import Logger from "../utils/logger.js";

const id = "car-compare";
const cooldown = 7 * 86400000;
const inFlight = new Map();
const recommendations = new Map();
const ok = (res, data) => res.json({ success: true, data });
const invalid = (res, message) => res.status(400).json({ success: false, message });
const settings = async () => (await Settings.findById(id).lean()) || { research: comparisonAiConfigured(), summary: comparisonAiConfigured() };
const objectId = (value) => /^[a-f0-9]{24}$/i.test(value || "");
const safeImage = (value) => typeof value === "string" && value.length <= 1000 &&
  (/^\/(?!\/)[a-z0-9/_\-.]+$/i.test(value) || /^https:\/\/(?:res\.cloudinary\.com|(?:www\.)?sello\.pk)\/[a-z0-9/_.,%~-]+$/i.test(value));
const identityFor = ({ make, model, variant }) => [make.name, model.name, variant.year, variant.name, variant.generation].filter(Boolean).join(" ");
const handle = (fn) => async (req, res) => {
  try { await fn(req, res); }
  catch (error) {
    Logger.error("Car Compare request failed", { name: error.name, code: error.code });
    res.status(500).json({ success: false, message: "Car Compare could not complete this request." });
  }
};

export const getComparisonSettings = handle(async (_req, res) => {
  const data = await settings();
  ok(res, { research: Boolean(data.research), summary: Boolean(data.summary), articles: data.articles || [] });
});

export const saveComparisonSettings = handle(async (req, res) => {
  const { research, summary, articles } = req.body ?? {};
  if (typeof research !== "boolean" || typeof summary !== "boolean") return invalid(res, "Choose both AI settings.");
  const update = { research, summary };
  if (articles !== undefined) {
    if (!Array.isArray(articles) || articles.length !== 4 || articles.some((article) =>
      !article || ![["title", 120], ["description", 1800], ["alt", 200]].every(([key, max]) =>
        typeof article[key] === "string" && article[key].trim() && article[key].length <= max) || !safeImage(article.image))) {
      return invalid(res, "Provide exactly four complete articles with approved image URLs.");
    }
    update.articles = articles.map(({ title, description, image, alt }) => ({
      title: title.trim(), description: description.trim(), image, alt: alt.trim(),
    }));
    if (new Set(update.articles.map(({ title }) => title.toLowerCase())).size !== 4 ||
        new Set(update.articles.map(({ description }) => description.toLowerCase())).size !== 4) {
      return invalid(res, "The four articles need unique titles and descriptions.");
    }
  }
  ok(res, await Settings.findByIdAndUpdate(id, { $set: update }, { upsert: true, new: true, runValidators: true }).lean());
});

function publicOverlay(record, exposePending, missing) {
  const pending = exposePending && record?.status === "pending"
    ? Object.fromEntries(Object.entries(record.proposals || {}).filter(([key]) => missing.includes(key)).map(([key, proposal]) => [key, proposal.value]))
    : {};
  return { approved: record?.approved || {}, pending };
}

async function research(entry, record, missing) {
  if (!entry.variant.year || !missing.length || record?.status === "pending" ||
      (record?.researchedAt && Date.now() - +new Date(record.researchedAt) < cooldown)) return record;
  const key = String(entry.variant._id);
  if (inFlight.has(key)) return inFlight.get(key);
  const work = (async () => {
    if (!comparisonAiConfigured()) return record;
    const owner = randomUUID();
    try {
      await CarCompareResearchLease.updateOne({ _id: key, expiresAt: { $lte: new Date() } }, {
        $set: { owner, expiresAt: new Date(Date.now() + 45000) },
      }, { upsert: true });
    } catch (error) {
      if (error.code === 11000) return record;
      throw error;
    }
    try {
      const latest = await Review.findOne({ variantId: key }).lean();
      if (latest?.status === "pending" || (latest?.researchedAt && Date.now() - +new Date(latest.researchedAt) < cooldown)) return latest;
      const requested = missingResearchFields(entry.variant, latest?.approved);
      const identity = identityFor(entry);
      const proposals = await researchComparison(identity, requested);
      if (!proposals) return latest;
      const version = latest ? { _id: latest._id, updatedAt: latest.updatedAt } : { variantId: key, updatedAt: { $exists: false } };
      try {
        return await Review.findOneAndUpdate(version, {
          $set: { identity, requested, proposals, researchedAt: new Date(), status: Object.keys(proposals).length ? "pending" : latest?.status || "rejected" },
          $setOnInsert: { variantId: key },
        }, { new: true, upsert: !latest }).lean();
      } catch (error) {
        if (error.code === 11000) return Review.findOne({ variantId: key }).lean();
        throw error;
      }
    } finally {
      await CarCompareResearchLease.deleteOne({ _id: key, owner }).catch(() => {});
    }
  })().catch(() => record).finally(() => inFlight.delete(key));
  inFlight.set(key, work);
  return work;
}

export const getComparisonOverlay = handle(async (req, res) => {
  const tokens = parseCatalogTokens(req.query.vehicles);
  if (!tokens) return invalid(res, "Select two or three vehicles.");
  const [data, entries] = await Promise.all([settings(), resolveVehicles(tokens)]);
  const variants = entries.filter((entry) => !entry.unavailable && entry.variant);
  const records = await Review.find({ variantId: { $in: variants.map(({ variant }) => variant._id) } }).lean();
  const byVariant = new Map(records.map((record) => [String(record.variantId), record]));
  const exposePending = Boolean(data.research && req.query.research === "true");
  const overlays = await Promise.all(variants.map(async (entry) => {
    const record = byVariant.get(String(entry.variant._id));
    const missing = missingResearchFields(entry.variant, record?.approved);
    const resolved = exposePending ? await research(entry, record, missing) : record;
    return [entry.token, publicOverlay(resolved, exposePending, missing)];
  }));
  res.set("Cache-Control", "private, no-store");
  ok(res, Object.fromEntries(overlays));
});

const priorities = new Set(["general", "fuel", "maintenance", "resale", "comfort", "performance", "family"]);
const marketPrices = new Map();
export const getMarketPrices = handle(async (req, res) => {
  const tokens = parseCatalogTokens(req.query.vehicles);
  if (!tokens) return invalid(res, "Choose two or three cars.");
  if (!(await settings()).research || !comparisonAiConfigured()) return ok(res, {});
  const entries = (await resolveVehicles(tokens)).filter((entry) => !entry.unavailable && (entry.year || entry.variant?.year));
  const prices = await Promise.all(entries.map(async (entry) => {
    let cached = marketPrices.get(entry.token);
    if (!cached || cached.expires <= Date.now()) {
      cached = { work: searchUsedAskingPrices(entry), expires: Date.now() + 6 * 3600000 };
      if (marketPrices.size >= 256) marketPrices.delete(marketPrices.keys().next().value);
      marketPrices.set(entry.token, cached);
    }
    try { return [entry.token, await cached.work]; }
    catch {
      if (marketPrices.get(entry.token) === cached) marketPrices.delete(entry.token);
      return [entry.token, { failed: true }];
    }
  }));
  return ok(res, Object.fromEntries(prices));
});

export const getBuyingRecommendation = handle(async (req, res) => {
  const tokens = parseCatalogTokens(req.body?.vehicles);
  const priority = req.body?.priority || "general";
  if (!tokens || !priorities.has(priority)) return invalid(res, "Choose a valid comparison and priority.");
  if (!(await settings()).summary) return ok(res, []);
  const available = (await resolveComparisonDetails(tokens)).filter((entry) => !entry.unavailable);
  const entries = available.filter((entry) => entry.variant);
  if (req.body?.mode === "overview") {
    if (available.length < 2) return ok(res, []);
    const reviews = await Review.find({ variantId: { $in: entries.map(({ variant }) => variant._id) } }).lean();
    const approved = new Map(reviews.map((record) => [String(record.variantId), record.approved]));
    const cars = available.map((entry) => ({
      vehicle: entry.variant ? identityFor(entry) : [entry.year, entry.make.name, entry.model.name].filter(Boolean).join(" "),
      specifications: { ...entry.variant?.specifications, ...approved.get(String(entry.variant?._id)) },
      features: entry.variant?.features, pricePkr: entry.variant?.price?.amount, priceType: entry.variant?.price?.type,
      publishedTrims: entry.publishedTrims,
    }));
    const key = JSON.stringify(["overview", priority, cars]);
    let cached = recommendations.get(key);
    if (!cached || cached.expiresAt <= Date.now()) {
      if (recommendations.size >= 100) recommendations.delete(recommendations.keys().next().value);
      cached = { work: compareModelsWithAi(cars, priority), expiresAt: Date.now() + 300000 };
      recommendations.set(key, cached);
    }
    try {
      const result = await cached.work;
      if (result.length !== cars.length) throw new Error("Incomplete comparison");
      return ok(res, result);
    } catch {
      if (recommendations.get(key) === cached) recommendations.delete(key);
      return res.status(503).json({ success: false, message: "AI comparison is temporarily unavailable." });
    }
  }
  if (entries.length < 2) return ok(res, []);
  const reviews = await Review.find({ variantId: { $in: entries.map(({ variant }) => variant._id) } }).lean();
  const records = new Map(reviews.map(({ variantId, approved }) => [String(variantId), approved]));
  const specs = entries.map(({ variant }) => ({ ...variant.specifications, ...records.get(String(variant._id)) }));
  const prices = entries.map(({ variant }) => variant.price);
  if (prices.every((price) => price?.type && price.type === prices[0]?.type && !price.upperAmount)) {
    specs.forEach((specification, index) => { specification.newPricePkr = prices[index].amount; });
  }
  const metrics = [
    ["newPricePkr", "PKR reference price", false, "Worth a closer look if purchase budget is your priority."],
    ["combinedKmPerL", "km/L combined", true, "Travels further per litre in the reported combined cycle."],
    ["cityKmPerL", "km/L city", true, "Worth a closer look if most of your driving is in the city."],
    ["highwayKmPerL", "km/L highway", true, "Travels further per litre in the reported highway cycle."],
    ["consumptionKwhPer100Km", "kWh/100 km", false, "Uses less electricity per kilometre at the reported figures."],
    ["maintenanceCostPkr", "PKR estimated maintenance", false, "Has the lower recorded maintenance estimate."],
    ["horsepowerHp", "hp", true, "Offers the most rated power among the selected cars."],
    ["bootL", "L boot capacity", true, "Offers more measured luggage volume for family trips."],
    ["seats", "seats", true, "Accommodates more passengers on paper."],
    ["airbagCount", "airbags", true, "Compare the positions of the airbags and other safety equipment before deciding."],
  ];
  const facts = metrics.flatMap(([key, unit, higher, reason]) => {
    const values = specs.map((specification) => specification[key]);
    if (values.some((value) => !Number.isFinite(value)) || new Set(values).size !== values.length) return [];
    const target = higher ? Math.max(...values) : Math.min(...values);
    const winner = entries[values.indexOf(target)];
    return [{ vehicle: identityFor(winner), value: target, unit, comparison: higher ? "Highest" : "Lowest", reason }];
  });
  const fingerprint = JSON.stringify([priority, facts]);
  const cached = recommendations.get(fingerprint);
  let work = cached?.expiresAt > Date.now() ? cached.work : null;
  if (!work) {
    work = chooseComparisonEvidence(facts, priority).catch(() => []);
    if (recommendations.size >= 100) recommendations.delete(recommendations.keys().next().value);
    recommendations.set(fingerprint, { work, expiresAt: Date.now() + 300000 });
  }
  const result = await work;
  ok(res, result || []);
});

export const listComparisonReviews = handle(async (req, res) => {
  const query = {};
  if (["pending", "approved", "manual", "rejected"].includes(req.query.status)) query.status = req.query.status;
  if (typeof req.query.q === "string" && req.query.q.trim()) query.identity = { $regex: escapeRegex(req.query.q.trim().slice(0, 100)), $options: "i" };
  ok(res, await Review.find(query).sort({ updatedAt: -1 }).limit(100).lean());
});

export const reviewComparison = handle(async (req, res) => {
  const { id: variantId } = req.params;
  const { action, values, version: expectedVersion } = req.body ?? {};
  if (!objectId(variantId) || !["approve", "manual", "reject", "delete"].includes(action)) return invalid(res, "Choose a valid review action.");
  const [entry] = await resolveVehicles([`v-${variantId}`]);
  const record = await Review.findOne({ variantId }).lean();
  if (expectedVersion && (!record?.updatedAt || new Date(record.updatedAt).toISOString() !== expectedVersion)) {
    return res.status(409).json({ success: false, message: "The review changed. Refresh and retry." });
  }
  if (action === "delete") {
    if (!record || Object.keys(record.approved || {}).length || req.body.confirm !== true) return invalid(res, "Only unapproved review data can be permanently deleted with confirmation.");
    const removed = await Review.deleteOne({ _id: record._id, updatedAt: record.updatedAt });
    return removed.deletedCount ? ok(res, null) : res.status(409).json({ success: false, message: "The review changed. Refresh and retry." });
  }
  if (!entry?.variant || !(await Variant.exists({ _id: variantId, published: true }))) return invalid(res, "Choose a published catalogue version.");
  if (["approve", "reject"].includes(action) && record?.status !== "pending") return invalid(res, "This review is no longer pending.");
  const proposed = Object.fromEntries(Object.entries(record?.proposals || {}).map(([key, field]) => [key, field.value]));
  const fields = action === "approve" ? proposed : values;
  const checked = validateComparisonFields(fields);
  if (action !== "reject" && (!Object.keys(checked).length || Object.keys(checked).length !== Object.keys(fields || {}).length)) return invalid(res, "Enter valid specifications in the expected units.");
  const prior = record?.approved || {};
  const added = action === "approve" ? Object.fromEntries(Object.entries(checked).filter(([key]) =>
    prior[key] == null && entry.variant.specifications?.[key] == null && entry.variant.features?.[key] == null)) : checked;
  const approved = action === "reject" ? prior : { ...prior, ...added };
  if (approved.usedMinPkr != null && approved.usedMaxPkr != null && approved.usedMinPkr > approved.usedMaxPkr) return invalid(res, "Used price maximum must be at least the minimum.");
  const reviewedAt = new Date();
  const version = record ? { _id: record._id, updatedAt: record.updatedAt } : { variantId, updatedAt: { $exists: false } };
  const result = await Review.findOneAndUpdate(version, {
    $set: { approved, identity: identityFor(entry), reviewedBy: req.user._id, status: { approve: "approved", manual: "manual", reject: "rejected" }[action] },
    $setOnInsert: { variantId },
    $push: { history: { $each: [{ action, by: req.user._id, at: reviewedAt, values: action === "reject" ? proposed : added, sources: record?.proposals, market: "PK" }] } },
  }, { new: true, upsert: !record }).lean();
  if (!result) return res.status(409).json({ success: false, message: "The review changed. Refresh and retry." });
  ok(res, result);
});
