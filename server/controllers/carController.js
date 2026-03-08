export * from "./car/actionController.js";
export * from "./car/queryController.js";

// Placeholders for not-yet-implemented endpoints
export const markCarAsSold = async (req, res) => { return res.status(501).json({ message: "Not Implemented" }); };
export const relistCar = async (req, res) => { return res.status(501).json({ message: "Not Implemented" }); };
