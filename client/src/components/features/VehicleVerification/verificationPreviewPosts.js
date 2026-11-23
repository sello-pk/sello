import whatIsOnlineVehicleVerification from "../../../assets/vehicleVerification/whatIsOnlineVehicleVerification.webp";
import whatIsMTMISandHowDoesItRelatetoVehicleVerification from "../../../assets/vehicleVerification/whatIsMTMISandHowDoesItRelatetoVehicleVerification.webp";

export const verificationPreviewPosts = [
  {
    id: 1,
    stepNumber: "01",
    title: "What Is Online Vehicle Verification?",
    category: "Online Verification",
    readTime: "5 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: whatIsOnlineVehicleVerification,
    excerpt:
      "Online vehicle verification is a process which goes over available info related to a vehicle via relevant and authorized sources. What is put out may include registration info, vehicle specs, registration status, and other key records which vary by province.",
    fullContent: `Before you buy a car don’t base your decision only on what the seller tells you. A car may look great in pictures or pass a brief inspection, but we also suggest that you check the registration and other details to rule out any issues.

An online car registration check  is a great tool for when you are purchasing a used car. It allows buyers to see that what the seller is saying is in fact what is on record.`,
  },
  {
    id: 2,
    stepNumber: "02",
    title: "What Is MTMIS and How Does It Relate to Vehicle Verification?",
    category: "MTMIS System",
    readTime: "6 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: whatIsMTMISandHowDoesItRelatetoVehicleVerification,
    excerpt:
      "MTMIS, which stands for Motor Transport Management Information System, is an online vehicle verification tool which we put up for use in obtaining vehicle registration and related info. Via the various provincial vehicle registration and Excise boards users may check out details of a registered car or motorcycle.",
    fullContent: `In different provinces and at the hands of different authorities the info which is put out may vary. As a whole a vehicle check up may see to it that users look over registration info which includes what make and model of vehicle it is, registration date, engine info, chassis info, and tax or token status.

For a car buyer which is a used car you can use this info as a tool in your research. It enables buyers to check out what the seller says against what the registration records and reports show before you buy.

However, in that we are only at the start of the purchase process with online vehicle verification it is also true that for a full picture you should include a physical inspection, document check, price compare, and proper transfer of ownership.`,
  },
];

export function createVerificationPreviewPosts(overrides) {
  return verificationPreviewPosts.map((post) => ({
    ...post,
    ...overrides[post.id],
    id: post.id,
    stepNumber: post.stepNumber,
  }));
}
