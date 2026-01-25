import express from "express";
import {
  submitContactForm,
  getAllContactForms,
  getContactFormById,
  convertToChat,
  updateContactFormStatus,
  deleteContactForm,
} from "../controllers/contactFormController.js";
import { auth, authorize } from "../middlewares/authMiddleware.js";
import { hasPermission, hasAnyPermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

// Public route - submit contact form
router.post("/", submitContactForm);

// Admin routes
router.use(auth);
router.use(authorize("admin"));

router.get("/", hasPermission("viewInquiries"), getAllContactForms);
router.get("/:id", hasPermission("viewInquiries"), getContactFormById);
router.post(
  "/:id/convert-to-chat",
  hasAnyPermission("respondToInquiries", "manageSupportTickets"),
  convertToChat
);
router.put(
  "/:id/status",
  hasAnyPermission("respondToInquiries", "manageSupportTickets"),
  updateContactFormStatus
);
router.delete("/:id", hasPermission("deleteInquiries"), deleteContactForm);

export default router;
