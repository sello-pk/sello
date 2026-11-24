import whatIsOnlineVehicleVerification from "../../../assets/vehicleVerification/whatIsOnlineVehicleVerification.webp";
import whatIsMTMISandHowDoesItRelatetoVehicleVerification from "../../../assets/vehicleVerification/whatIsMTMISandHowDoesItRelatetoVehicleVerification.webp";
import { fuelPriceGuides } from "../../../utils/fuelPricesContent.js";

const existingImages = [whatIsOnlineVehicleVerification, whatIsMTMISandHowDoesItRelatetoVehicleVerification];

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
