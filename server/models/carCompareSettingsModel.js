import mongoose from "mongoose";

const article = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  alt: String,
}, { _id: false });

export default mongoose.model("CarCompareSettings", new mongoose.Schema({
  _id: String,
  research: { type: Boolean, default: false },
  summary: { type: Boolean, default: false },
  articles: { type: [article], default: undefined },
}, { timestamps: true }));
