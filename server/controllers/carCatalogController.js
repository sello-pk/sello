import Category from "../models/categoryModel.js";
import Variant from "../models/carCatalogVariantModel.js";
import Logger from "../utils/logger.js";
import { escapeRegex } from "../utils/helpers.js";

const oid = (value) => typeof value === "string" && /^[a-f0-9]{24}$/i.test(value);
const catalogue = (subType) => ({ type: "car", subType, vehicleType: "Car", isActive: true });
const projection = "_id name parentCategory image";
const variantFields = "_id name modelId year generation image price specifications features sourceUrl verifiedAt comparisonGroup";
const limit = 40;
const search = (query) => {
  if (query === undefined || query === "") return {};
  if (typeof query !== "string" || query.length > 80) throw new InputError("Search must be 80 characters or fewer.");
  return { name: { $regex: "^" + escapeRegex(query.trim()), $options: "i" } };
};
const ok = (res, data) => res.json({ success: true, data });
class InputError extends Error {}
const handle = (fn) => async (req, res) => {
  try { return await fn(req, res); }
  catch (error) {
    if (error instanceof InputError || error.name === "ValidationError") return res.status(400).json({ success: false, message: error.message });
    if (error.code === 11000) return res.status(409).json({ success: false, message: "That version already exists for this model and year." });
    Logger.error("Car catalogue request failed", error);
    return res.status(500).json({ success: false, message: "Could not complete the catalogue request." });
  }
};
const fail = (message) => { throw new InputError(message); };
const modelQuery = (id) => ({ ...catalogue("model"), _id: id });
const activeModel = async (id) => {
  if (!oid(id)) fail("Choose a valid model.");
  const model = await Category.findOne(modelQuery(id)).select(projection).lean();
  if (!model || !(await Category.exists({ ...catalogue("make"), _id: model.parentCategory }))) fail("This model is unavailable.");
  return model;
};

export const catalogMakes = handle(async (req, res) =>
  ok(res, await Category.find({ ...catalogue("make"), ...search(req.query.q) }).select(projection).sort({ name: 1, _id: 1 }).limit(limit).lean()));

export const catalogModels = handle(async (req, res) => {
  const { makeId, q } = req.query;
  if (!oid(makeId) || !(await Category.exists({ ...catalogue("make"), _id: makeId }))) fail("Choose an available make.");
  return ok(res, await Category.find({ ...catalogue("model"), parentCategory: makeId, ...search(q) }).select(projection).sort({ name: 1, _id: 1 }).limit(limit).lean());
});

export const catalogVariants = handle(async (req, res) => {
  const { modelId, q, year } = req.query;
  await activeModel(modelId);
  if (year !== undefined && !/^\d{4}$/.test(year)) fail("Choose a valid model year.");
  return ok(res, await Variant.find({ modelId, published: true, ...search(q), ...(year ? { year: Number(year) } : {}) }).select("_id name year generation").sort({ name: 1, year: -1, _id: 1 }).limit(limit).lean());
});

export const catalogYears = handle(async (req, res) => {
  const model = await activeModel(req.query.modelId);
  const years = await Variant.distinct("year", { modelId: model._id, published: true, year: { $ne: null } });
  return ok(res, years.filter(Number.isInteger).sort((a, b) => b - a));
});

function hideSources(entry) {
  if (!entry.variant) return entry;
  const { sourceUrl: _source, price, ...variant } = entry.variant;
  const { sourceUrl: _priceSource, ...publicPrice } = price || {};
  return { ...entry, variant: { ...variant, price: price ? publicPrice : null } };
}

export function parseCatalogTokens(value) {
  if (typeof value !== "string" || value.length > 80) return null;
  const tokens = value.toLowerCase().split(",");
  return tokens.length >= 2 && tokens.length <= 3 &&
    tokens.every((token) => /^[mv]-[a-f0-9]{24}$/.test(token)) &&
    new Set(tokens).size === tokens.length ? tokens : null;
}

export async function resolveVehicles(tokens, knownVariants) {
  const variantIds = tokens.filter((token) => token.startsWith("v-")).map((token) => token.slice(2));
  const variants = knownVariants ?? await Variant.find({ _id: { $in: variantIds }, published: true }).select(variantFields).lean();
  const modelIds = [...tokens.filter((token) => token.startsWith("m-")).map((token) => token.slice(2)), ...variants.map((variant) => variant.modelId)];
  const models = await Category.find({ ...catalogue("model"), _id: { $in: modelIds } }).select(projection).lean();
  const makes = await Category.find({ ...catalogue("make"), _id: { $in: models.map((model) => model.parentCategory) } }).select(projection).lean();
  const indexed = (records) => new Map(records.map((entry) => [String(entry._id), entry]));
  const byVariant = indexed(variants);
  const byModel = indexed(models);
  const byMake = indexed(makes);
  return tokens.map((token) => {
    const id = token.slice(2);
    const variant = token.startsWith("v-") ? byVariant.get(id) : null;
    const model = byModel.get(String(variant?.modelId ?? id));
    const make = model && byMake.get(String(model.parentCategory));
    if (!make || (token.startsWith("v-") && !variant)) return { token, unavailable: true };
    return { token, make, model, variant: variant || null };
  });
}

export const catalogComparison = handle(async (req, res) => {
  const tokens = parseCatalogTokens(req.query.vehicles);
  if (!tokens) fail("Choose two or three distinct models or versions.");
  return ok(res, (await resolveVehicles(tokens)).map(hideSources));
});

export const resolveCatalogListing = handle(async (req, res) => {
  const exact = (value, label) => ({ $regex: "^" + escapeRegex(requiredText(value, 120, label)) + "$", $options: "i" });
  const makes = await Category.find({ ...catalogue("make"), name: exact(req.query.make, "make") }).select(projection).limit(2).lean();
  if (makes.length !== 1) return ok(res, null);
  const make = makes[0];
  const models = await Category.find({ ...catalogue("model"), parentCategory: make._id, name: exact(req.query.model, "model") }).select(projection).limit(2).lean();
  if (models.length !== 1) return ok(res, null);
  const model = models[0];
  const year = typeof req.query.year === "string" && /^\d{4}$/.test(req.query.year) ? Number(req.query.year) : null;
  if (!year || !req.query.variant || /^(?:n\/?a|unknown)$/i.test(req.query.variant)) return ok(res, { make, model, variant: null });
  const matches = await Variant.find({ modelId: model._id, published: true, year, name: exact(req.query.variant, "version") }).select("_id name year generation").limit(2).lean();
  return ok(res, { make, model, variant: matches.length === 1 ? matches[0] : null });
});

export const popularCatalogComparisons = handle(async (_req, res) => {
  const variants = await Variant.find({ published: true, comparisonGroup: { $type: "string", $ne: "" } }).select(variantFields).sort({ comparisonGroup: 1, _id: 1 }).limit(60).lean();
  const vehicles = await resolveVehicles(variants.map((variant) => `v-${variant._id}`), variants);
  const groups = new Map();
  for (const entry of vehicles) {
    if (entry.unavailable) continue;
    const { price, specifications, features } = entry.variant;
    if (!price?.amount && !Object.keys(specifications || {}).length && !Object.keys(features || {}).length) continue;
    const group = entry.variant.comparisonGroup;
    const members = groups.get(group) || [];
    if (members.length < 3) members.push(entry);
    groups.set(group, members);
  }
  return ok(res, [...groups].filter(([, members]) => members.length >= 2).slice(0, 8).map(([name, vehicles]) => ({ name, vehicles: vehicles.map(hideSources) })));
});

const requiredText = (value, max, label) => {
  if (typeof value !== "string" || !value.trim() || value.length > max) fail(`Enter a valid ${label}.`);
  return value.trim();
};
const url = (value) => {
  const candidate = requiredText(value, 1000, "HTTPS URL");
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === "https:" && !parsed.username && !parsed.password) return parsed.href;
  } catch { /* handled below */ }
  fail("Enter a valid HTTPS URL.");
};
const date = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail("Enter a verification date.");
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value || parsed > new Date()) fail("Enter a valid verification date.");
  return parsed;
};
const fields = (value, type) => {
  if (value == null) return {};
  if (typeof value !== "object" || Array.isArray(value) || Object.keys(value).length > 80) fail(`Invalid ${type}.`);
  return Object.fromEntries(Object.entries(value).map(([key, field]) => {
    if (!/^[a-z][a-zA-Z0-9]{0,47}$/.test(key) || ["constructor", "prototype"].includes(key)) fail(`Invalid ${type} key.`);
    if (type === "features") {
      if (!["standard", "optional", "unavailable", "notApplicable"].includes(field)) fail("Invalid feature availability.");
    } else if (/^(?:.+(?:Cc|Hp|Nm|KmPerL|Kmh|Seconds|L|Mm|Kg|Kw|Kwh|Km|Hours|KwhPer100Km)|cylinders|valvesPerCylinder|gears|seats|doors)$/.test(key) && typeof field !== "number") {
      fail("Measurements must be numbers in the unit specified by the field name.");
    } else if (!(typeof field === "string" && field.trim() && field.length <= 100) && !(typeof field === "number" && Number.isFinite(field) && field >= 0)) {
      fail("Specification values must be short text or nonnegative numbers.");
    }
    return [key, typeof field === "string" ? field.trim() : field];
  }));
};
export function validateCatalogVariant(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) fail("Invalid catalogue record.");
  if (!oid(body.modelId)) fail("Choose a valid model.");
  if (typeof body.published !== "boolean") fail("Choose a publication status.");
  if (body.year != null && (!Number.isInteger(body.year) || body.year < 1900 || body.year > new Date().getFullYear() + 2)) fail("Enter a valid model year.");
  const result = {
    modelId: body.modelId, name: requiredText(body.name, 120, "version name"),
    generation: body.generation ? requiredText(body.generation, 80, "generation") : "",
    year: body.year ?? null, image: body.image ? url(body.image) : "",
    sourceUrl: url(body.sourceUrl), verifiedAt: date(body.verifiedAt), published: body.published,
    comparisonGroup: body.comparisonGroup ? requiredText(body.comparisonGroup, 80, "comparison group") : "",
    specifications: fields(body.specifications, "specifications"), features: fields(body.features, "features"),
    price: null,
  };
  if (body.price != null) {
    const { amount, upperAmount, type, sourceUrl, verifiedAt, effectiveDate } = body.price;
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1e9 ||
        (upperAmount != null && (!Number.isFinite(upperAmount) || upperAmount < amount || upperAmount > 1e9)) ||
        !["manufacturer", "ex_factory", "dealer", "sello_new"].includes(type)) fail("Enter a valid sourced PKR price.");
    result.price = { amount, upperAmount, type, sourceUrl: url(sourceUrl), verifiedAt: date(verifiedAt) };
    if (effectiveDate) result.price.effectiveDate = date(effectiveDate);
  }
  return result;
}

export const adminCatalogVariants = handle(async (req, res) => {
  const model = await activeModel(req.query.modelId);
  return ok(res, await Variant.find({ modelId: model._id, ...search(req.query.q) }).select(`${variantFields} published`).sort({ name: 1, year: -1 }).limit(limit).lean());
});

export const saveCatalogVariant = handle(async (req, res) => {
  const payload = validateCatalogVariant(req.body);
  await activeModel(payload.modelId);
  if (!req.params.id) return ok(res, await Variant.create(payload));
  if (!oid(req.params.id)) fail("Invalid version ID.");
  const updated = await Variant.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!updated) return res.status(404).json({ success: false, message: "Version not found." });
  return ok(res, updated);
});

// Archiving keeps existing shared IDs valid as unavailable selections.
export const archiveCatalogVariant = handle(async (req, res) => {
  if (!oid(req.params.id)) fail("Invalid version ID.");
  const updated = await Variant.findByIdAndUpdate(req.params.id, { published: false }, { new: true });
  if (!updated) return res.status(404).json({ success: false, message: "Version not found." });
  return ok(res, { id: updated._id });
});
