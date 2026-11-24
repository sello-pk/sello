import petrolPriceinPakistanToday from "../../../assets/images/petrolPriceinPakistanToday.webp";
import dieselPriceinPakistanToday from "../../../assets/images/dieselPriceinPakistanToday.webp";
import latestFuelPricesinPakistan from "../../../assets/images/latestFuelPricesinPakistan.webp";
import petroleumPriceUpdatesinPakistan from "../../../assets/images/petroleumPriceUpdatesinPakistan.webp";
import { fuelPriceGuides } from "../../../utils/fuelPricesContent.js";

const existingImages = [
  petrolPriceinPakistanToday,
  dieselPriceinPakistanToday,
  latestFuelPricesinPakistan,
  petroleumPriceUpdatesinPakistan,
];

export const fuelVerificationPosts = fuelPriceGuides.map((post, index) => ({
  ...post,
  stepNumber: String(post.id).padStart(2, "0"),
  author: "SELLO Editorial Team",
  date: "November 2026",
  readTime: "1 min read",
  image: existingImages[index % existingImages.length],
  imageAlt: "Vehicle illustration accompanying SELLO’s fuel price guide",
  fullContent: "",
}));
