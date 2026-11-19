import test from "node:test";
import assert from "node:assert/strict";
import Car from "../models/carModel.js";
import Logger from "../utils/logger.js";
import { getCarComparison, parseComparisonIds, comparisonResults } from "../controllers/carCompareController.js";

const ids = Array.from({ length: 5 }, (_, i) => (i + 1).toString().repeat(24));
const response = () => ({
  code: 200, headers: {},
  status(value) { this.code = value; return this; },
  set(key, value) { this.headers[key] = value; return this; },
  json(value) { this.body = value; return this; },
});

test("validates comparison IDs before database access", async () => {
  const invalid = [undefined, [], {}, "", "bad", ids.join(","), ids[0]+","+ids[0]];
  for (const input of invalid) {
    assert.equal(parseComparisonIds(input), null);
    const res = response();
    await getCarComparison({ query: { ids: input } }, res);
    assert.equal(res.code, 400);
  }
  assert.deepEqual(parseComparisonIds(ids.slice(0, 4).join(",")), ids.slice(0, 4));
});

test("executes one bounded public projection and preserves requested order", async (context) => {
  const query = {
    select(fields) { this.fields = fields; return this; },
    slice(field, count) { this.imageSlice = [field, count]; return this; },
    maxTimeMS(time) { this.limit = time; return this; },
    async lean() {
      return [
        { _id: ids[1], status: "sold", contactNumber: "private" },
        { _id: ids[0], status: "active", price: 2200000, postedBy: { email: "private" }, contactNumber: "private", images: ["https://example.test/vehicle.jpg"] },
      ];
    },
  };
  const find = context.mock.method(Car, "find", () => query);
  const res = response();
  await getCarComparison({ query: { ids: [ids[2], ids[1], ids[0]].join(",") } }, res);
  assert.equal(find.mock.callCount(), 1);
  const filter = find.mock.calls[0].arguments[0];
  assert.deepEqual(filter._id.$in, [ids[2], ids[1], ids[0]]);
  assert.deepEqual(filter.$and[0], { $or: [{ isApproved: true }, { isApproved: { $exists: false } }] });
  assert.equal(filter.status.$ne, "deleted");
  assert.equal(query.fields.includes("contactNumber"), false);
  assert.deepEqual(query.imageSlice, ["images", 1]);
  assert.ok(query.limit > 0);
  assert.equal(res.headers["Cache-Control"], "no-store");
  assert.deepEqual(res.body.data.listings, [
    { id: ids[2], status: "missing" },
    { id: ids[1], status: "unavailable" },
    { id: ids[0], status: "found", car: { _id: ids[0], status: "active", price: 2200000, images: ["https://example.test/vehicle.jpg"] } },
  ]);
});

test("marks expired/auto-deleted and sold-flag records unavailable", () => {
  const results = comparisonResults(ids.slice(0, 3), [
    { _id: ids[0], expiryDate: "2025-01-01" },
    { _id: ids[1], isAutoDeleted: true },
    { _id: ids[2], isSold: true },
  ], new Date("2026-01-01"));
  assert.ok(results.every((result) => result.status === "unavailable"));
});

test("returns a safe error when database retrieval fails", async (context) => {
  context.mock.method(Car, "find", () => { throw new Error("private database diagnostics"); });
  context.mock.method(Logger, "error", () => {});
  const res = response();
  await getCarComparison({ query: { ids: ids[0] } }, res);
  assert.equal(res.code, 500);
  assert.deepEqual(res.body, { success: false, message: "Could not load the selected cars." });
});
