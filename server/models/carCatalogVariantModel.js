import mongoose from "mongoose";

const source = {
  sourceUrl: { type: String, required: true },
  verifiedAt: { type: Date, required: true },
};
const priceSchema = new mongoose.Schema({
  amount: Number,
  upperAmount: Number,
  type: String,
  effectiveDate: Date,
  ...source,
}, { _id: false });

const schema = new mongoose.Schema({
  modelId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  name: { type: String, required: true },
  generation: String,
  year: Number,
  image: String,
  price: { type: priceSchema, default: null },
  specifications: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  features: { type: Map, of: String, default: {} },
  published: { type: Boolean, default: false },
  comparisonGroup: String,
  ...source,
}, { timestamps: true });

schema.index({ modelId: 1, name: 1, year: 1, generation: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });
schema.index({ modelId: 1, published: 1, name: 1 });
schema.index({ published: 1, comparisonGroup: 1 });
export default mongoose.model("CarCatalogVariant", schema);
