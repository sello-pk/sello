import mongoose from 'mongoose';
const configSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'main' },
  fuelPrice: Number, fuelDate: Date, fuelSource: String,
  sections: [{ title: String, description: String, image: String, alt: String }],
  draftSections: [{ title: String, description: String, image: String, alt: String }],
}, { timestamps: true });
export const CompareConfig = mongoose.model('CompareConfig', configSchema);
