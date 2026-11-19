import test from "node:test";
import assert from "node:assert/strict";
import reducer, { addComparisonCar, removeComparisonCar, setComparisonCars, setComparisonReplacement } from "../src/redux/carCompareSlice.js";
import { cleanCompareIds, comparisonGroups, getHighlights, hasDifference, parseCompareSearch, readCompareStorage, specNumber } from "../src/utils/carCompare.js";

const ids = Array.from({ length: 5 }, (_, i) => i.toString(16).repeat(24));

test("selection validates, deduplicates, caps, replaces, removes and clears", () => {
  let state = reducer(undefined, addComparisonCar("invalid"));
  assert.deepEqual(state.ids, []);
  for (const id of [...ids, ids[0]]) state = reducer(state, addComparisonCar(id));
  assert.deepEqual(state.ids, ids.slice(0, 4));
  state = reducer(state, setComparisonReplacement(ids[1]));
  state = reducer(state, addComparisonCar(ids[4]));
  assert.deepEqual(state.ids, [ids[0], ids[4], ids[2], ids[3]]);
  state = reducer(state, removeComparisonCar(ids[2]));
  assert.deepEqual(state.ids, [ids[0], ids[4], ids[3]]);
  assert.deepEqual(reducer(state, setComparisonCars([])).ids, []);
});

test("storage and URL restoration handle valid, corrupt and unavailable input", () => {
  assert.deepEqual(cleanCompareIds([...ids, ids[0]]), ids.slice(0, 4));
  assert.deepEqual(readCompareStorage({ getItem: () => JSON.stringify(ids) }).ids, ids.slice(0, 4));
  assert.deepEqual(readCompareStorage({ getItem: () => "{" }), { ids: [], storageUnavailable: false });
  assert.deepEqual(readCompareStorage({ getItem: () => { throw new Error("denied"); } }), { ids: [], storageUnavailable: true });
  assert.equal(parseCompareSearch(""), null);
  assert.deepEqual(parseCompareSearch("?ids="), { ids: [], error: false });
  assert.deepEqual(parseCompareSearch("?ids=" + ids.slice(0, 2).join(",")), { ids: ids.slice(0, 2), error: false });
  for (const invalid of ["?ids=bad", "?ids="+ids.join(","), "?ids="+ids[0]+","+ids[0], "?ids="+ids[0]+"&ids="+ids[1]]) {
    assert.equal(parseCompareSearch(invalid).error, true);
  }
});

test("comparison normalizes equivalent values, preserves unknowns and ranks numeric values", () => {
  assert.equal(specNumber("120,000 km", "km"), 120000);
  assert.equal(specNumber("12abc"), null);
  assert.equal(specNumber(null), null);
  assert.equal(hasDifference([null, null]), false);
  assert.equal(hasDifference(["PETROL", "petrol", null]), false);
  assert.equal(hasDifference(["Available", "Unavailable", null]), true);
  const [, safety] = comparisonGroups.find(([label]) => label === "Safety");
  const [, abs] = safety.find(([label]) => label === "ABS");
  assert.equal(abs({ features: [] }), null);
  assert.equal(abs({ features: ["ABS"] }), "Available");
  assert.equal(abs({ features: ["No ABS"] }), "Unavailable");
  const values = [
    { _id: ids[0], price: "2,000,000", year: 2020, mileage: "15,000 km" },
    { _id: ids[1], price: 2100000, year: 2021, mileage: 13000 },
    { _id: ids[2], price: "invalid", year: null, mileage: undefined },
  ];
  assert.deepEqual(getHighlights(values), [
    { id: ids[0], label: "Lowest asking price" },
    { id: ids[1], label: "Newest model year" },
    { id: ids[1], label: "Lowest mileage" },
  ]);
  assert.deepEqual(getHighlights([values[0], { ...values[0], _id: ids[1] }]), []);
});
