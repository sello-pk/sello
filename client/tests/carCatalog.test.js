import assert from "node:assert/strict";
import test from "node:test";
import { catalogGroups, catalogResultUrl, parseCatalogSelection, readCatalogSelection, tokenFor, withMake, withModel } from "../src/utils/carCatalog.js";
const id = (n) => String(n).repeat(24);
test("dependent selectors reset stale model and variant selections", () => {
  const make = { _id: id(1), name: "Toyota" };
  const model = { _id: id(2), name: "Corolla" };
  const selection = { make, model, variant: { _id: id(3), name: "Altis" } };
  assert.deepEqual(withMake(make), { make, model: null, variant: null });
  assert.equal(withModel(selection, model).variant, null);
  assert.equal(tokenFor(selection), "v-"+id(3));
  assert.equal(tokenFor(withModel(selection, model)), "m-"+id(2));
});
test("links preserve order and support distinct same-model versions", () => {
  const tokens = ["v-"+id(3), "v-"+id(4), "m-"+id(2)];
  assert.deepEqual(parseCatalogSelection(new URL(catalogResultUrl(tokens), "https://sello.pk").searchParams.get("vehicles")), tokens);
  assert.equal(parseCatalogSelection(tokens[0]), null);
  assert.equal(parseCatalogSelection([...tokens,tokens[0]].join(",")), null);
  assert.equal(parseCatalogSelection([tokens[0],tokens[0]].join(",")), null);
  assert.deepEqual(readCatalogSelection({ getItem: () => { throw new Error("denied"); } }), []);
});
test("feature states and missing values remain distinct", () => {
  const make = { name: "Toyota" };
  const model = { name: "Corolla" };
  const group = catalogGroups([
    { make, model, variant: { features: { abs: "standard", sunroof: "optional", isofix: "unavailable" }, specifications: { engineCapacityCc: 1600 } } },
    { make, model, variant: { features: { abs: "notApplicable" }, specifications: { engineCapacityCc: 1800 } } },
  ]);
  assert.deepEqual(group.find(([title]) => title === "Safety")[1], [["ABS",["Standard","Not applicable"]],["ISOFIX",["Not available",null]]]);
  assert.deepEqual(group.find(([title]) => title === "Exterior")[1], [["Sunroof",["Optional",null]]]);
});
