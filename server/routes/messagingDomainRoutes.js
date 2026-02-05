import express from "express";
import { auth, authorize } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multer.js";

// Import Controllers
import {
    createSupportChat, getUserSupportChats, getSupportChatMessages, sendSupportMessage, getAllSupportChats, sendAdminResponse, updateSupportChatStatus, editSupportMessage, deleteSupportMessage
} from "../controllers/supportChatController.js";
import {
    createCarChat, getCarChats, getSellerBuyerChats, getCarChatMessages, sendCarChatMessage, editCarChatMessage, deleteCarChatMessage, getCarChatByCarId, blockUserInChat, unblockUser, getBlockedUsers
} from "../controllers/carChatController.js";
import {
    getAllChats as getAllAdminChats, getChatMessages as getAdminChatMessages, reportChat, deleteChat, getChatStatistics, sendChatMessage as sendAdminChatMessage, deleteMessage as deleteAdminChatMessage, editMessage as editAdminChatMessage, getAllMessages as getAllAdminMessages
} from "../controllers/chatController.js";
import {
    submitContactForm, getAllContactForms as getAllSubmissions, getContactFormById as getSubmissionById, updateContactFormStatus as updateSubmissionStatus, deleteContactForm as deleteSubmission, convertToChat
} from "../controllers/contactFormController.js";
import {
    getAllCustomerRequests, getCustomerRequestById, createCustomerRequest, updateCustomerRequest, addResponse as addCustomerResponse, deleteCustomerRequest, getCustomerRequestStatistics
} from "../controllers/customerRequestController.js";
import {
    getChatbotConfig, updateChatbotConfig, getChatbotStats, getQuickReplies, createQuickReply, updateQuickReply, deleteQuickReply, useQuickReply
} from '../controllers/chatbotController.js';

const router = express.Router();

/* ------------------------------ SUPPORT CHAT ------------------------------ */
router.post("/support-chat", auth, createSupportChat);
router.get("/support-chat/my-chats", auth, getUserSupportChats);
router.get("/support-chat/:chatId/messages", auth, getSupportChatMessages);
router.post("/support-chat/:chatId/messages", auth, upload.array("attachments", 5), sendSupportMessage);
router.put("/support-chat/messages/:messageId", auth, editSupportMessage);
router.delete("/support-chat/messages/:messageId", auth, deleteSupportMessage);
// Admin Support
router.get("/support-chat/admin", auth, authorize("admin"), getAllSupportChats);
router.post("/support-chat/:chatId/admin-response", auth, authorize("admin"), upload.array("attachments", 5), sendAdminResponse);
router.put("/support-chat/:chatId/status", auth, authorize("admin"), updateSupportChatStatus);

/* -------------------------------- CAR CHAT -------------------------------- */
router.use("/car-chat", auth);
router.post("/car-chat/car/:carId", createCarChat);
router.get("/car-chat/car/:carId", getCarChatByCarId);
router.get("/car-chat/my-chats", getCarChats);
router.get("/car-chat/seller/chats", getSellerBuyerChats);
router.get("/car-chat/:chatId/messages", getCarChatMessages);
router.post("/car-chat/:chatId/messages", upload.array("attachments", 5), sendCarChatMessage);
router.put("/car-chat/messages/:messageId", editCarChatMessage);
router.delete("/car-chat/messages/:messageId", deleteCarChatMessage);
router.post("/car-chat/block/:userId", blockUserInChat);
router.delete("/car-chat/block/:userId", unblockUser);
router.get("/car-chat/blocked", getBlockedUsers);

/* ------------------------------- ADMIN CHAT ------------------------------- */
router.use("/chat", auth, authorize("admin"));
router.get("/chat", getAllAdminChats);
router.get("/chat/statistics", getChatStatistics);
router.get("/chat/messages/all", getAllAdminMessages);
router.get("/chat/:chatId/messages", getAdminChatMessages);
router.post("/chat/:chatId/messages", sendAdminChatMessage);
router.put("/chat/:chatId/report", reportChat);
router.delete("/chat/:chatId", deleteChat);
router.delete("/chat/messages/:messageId", deleteAdminChatMessage);
router.put("/chat/messages/:messageId", editAdminChatMessage);

/* ------------------------------ CONTACT FORM ------------------------------ */
router.post("/contact", submitContactForm);
router.post("/contact-form", submitContactForm); // Alias for frontend
router.get("/contact", auth, authorize("admin"), getAllSubmissions);
router.get("/contact-form", auth, authorize("admin"), getAllSubmissions); // Alias for admin frontend
router.get("/contact/:id", auth, authorize("admin"), getSubmissionById);
router.get("/contact-form/:id", auth, authorize("admin"), getSubmissionById); // Alias
router.put("/contact/:id", auth, authorize("admin"), updateSubmissionStatus);
router.put("/contact-form/:id/status", auth, authorize("admin"), updateSubmissionStatus); // Match frontend status update path
router.delete("/contact/:id", auth, authorize("admin"), deleteSubmission);
router.delete("/contact-form/:id", auth, authorize("admin"), deleteSubmission); // Alias
router.post("/contact-form/:id/convert-to-chat", auth, authorize("admin"), convertToChat); // Add missing conversion route

/* --------------------------- CUSTOMER REQUESTS ---------------------------- */
router.post("/customer-requests", auth, createCustomerRequest);
// Admin
router.get("/customer-requests/statistics", auth, authorize("admin"), getCustomerRequestStatistics);
router.get("/customer-requests", auth, authorize("admin"), getAllCustomerRequests);
router.get("/customer-requests/:requestId", auth, authorize("admin"), getCustomerRequestById);
router.put("/customer-requests/:requestId", auth, authorize("admin"), updateCustomerRequest);
router.post("/customer-requests/:requestId/response", auth, authorize("admin"), addCustomerResponse);
router.delete("/customer-requests/:requestId", auth, authorize("admin"), deleteCustomerRequest);

/* -------------------------------- CHATBOT --------------------------------- */
router.use("/chatbot", auth, authorize("admin"));
router.get("/chatbot/config", getChatbotConfig);
router.put("/chatbot/config", updateChatbotConfig);
router.get("/chatbot/statistics", getChatbotStats);
router.get("/chatbot/quick-replies", getQuickReplies);
router.post("/chatbot/quick-replies", createQuickReply);
router.put("/chatbot/quick-replies/:replyId", updateQuickReply);
router.delete("/chatbot/quick-replies/:replyId", deleteQuickReply);
router.post("/chatbot/quick-replies/:replyId/use", useQuickReply);

export default router;
