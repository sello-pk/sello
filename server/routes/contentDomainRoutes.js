import express from "express";
import { auth, authorize } from "../middlewares/authMiddleware.js";
import { hasAnyPermission, hasPermission } from "../middlewares/permissionMiddleware.js";
import { upload } from "../middlewares/multer.js";
import {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  createPublicReview,
  subscribeNewsletter,
  unsubscribeNewsletter,
  getAllSubscribers,
  getAllBlogs,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getAllCategories,
} from "../controllers/contentDomainController.js";
import {
  createComment,
  getBlogComments,
  getAllComments,
  updateCommentStatus,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

/* -------------------------------- BANNERS --------------------------------- */
router.get("/banners", getAllBanners);
router.get("/banners/:bannerId", getBannerById);
router.post(
  "/banners",
  auth,
  authorize("admin"),
  hasPermission("manageBanners"),
  upload.single("image"),
  createBanner,
);
router.put(
  "/banners/:bannerId",
  auth,
  authorize("admin"),
  hasPermission("manageBanners"),
  upload.single("image"),
  updateBanner,
);
router.delete(
  "/banners/:bannerId",
  auth,
  authorize("admin"),
  hasPermission("manageBanners"),
  deleteBanner,
);

/* ------------------------------ TESTIMONIALS ------------------------------ */
router.get("/testimonials", getAllTestimonials);
router.get("/testimonials/:testimonialId", getTestimonialById);
router.post("/testimonials", auth, upload.single("image"), createPublicReview); // Public submission
router.post(
  "/testimonials/admin",
  auth,
  authorize("admin"),
  hasAnyPermission("manageTestimonials", "viewTestimonials"),
  upload.single("image"),
  createTestimonial,
); // Admin submission
router.put(
  "/testimonials/:testimonialId",
  auth,
  authorize("admin"),
  hasAnyPermission("manageTestimonials", "viewTestimonials"),
  upload.single("image"),
  updateTestimonial,
);
router.delete(
  "/testimonials/:testimonialId",
  auth,
  authorize("admin"),
  hasAnyPermission("manageTestimonials", "viewTestimonials"),
  deleteTestimonial,
);

/* ------------------------------- NEWSLETTER ------------------------------- */
router.post("/newsletter/subscribe", subscribeNewsletter);
router.post("/newsletter/unsubscribe", unsubscribeNewsletter);
router.get(
  "/newsletter/subscribers",
  auth,
  authorize("admin"),
  hasAnyPermission("viewInquiries", "manageUsers"),
  getAllSubscribers,
);

/* --------------------------------- BLOGS ---------------------------------- */
// Public blog endpoints (no auth required)
router.get("/blogs/slug/:slug", getBlogBySlug); // More specific to avoid conflicts

// Blog endpoints that work for both public and admin (public access)
router.get("/blogs/:blogId", getBlogById); // Works for both public and admin access
router.get("/blogs", getAllBlogs); // Public access - shows different data based on user role

// Admin-only blog endpoints
router.post(
  "/blogs",
  auth,
  authorize("admin"),
  hasAnyPermission("createBlogs", "manageBlogs"),
  upload.single("featuredImage"),
  createBlog,
);
router.put(
  "/blogs/:blogId",
  auth,
  authorize("admin"),
  hasAnyPermission("editBlogs", "manageBlogs"),
  upload.single("featuredImage"),
  updateBlog,
);
router.delete(
  "/blogs/:blogId",
  auth,
  authorize("admin"),
  hasAnyPermission("deleteBlogs", "manageBlogs"),
  deleteBlog,
);

/* ------------------------------ BLOG COMMENTS ----------------------------- */
// Public comment endpoints (require authentication)
router.get("/blogs/:blogId/comments", auth, getBlogComments);
router.post("/blogs/:blogId/comments", auth, createComment);
router.delete("/blogs/comments/:commentId", auth, deleteComment);
router.get(
  "/blogs/comments/all",
  auth,
  authorize("admin"),
  hasAnyPermission("moderateComments", "manageBlogs"),
  getAllComments,
);
router.put(
  "/blogs/comments/:commentId/status",
  auth,
  authorize("admin"),
  hasAnyPermission("moderateComments", "manageBlogs"),
  updateCommentStatus,
);
router.delete(
  "/blogs/comments/:commentId/admin",
  auth,
  authorize("admin"),
  hasAnyPermission("moderateComments", "manageBlogs"),
  deleteComment,
);

/* ------------------------------- CATEGORIES ------------------------------- */
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

router.get("/categories", getAllCategories);
router.post(
  "/categories",
  auth,
  authorize("admin"),
  hasAnyPermission("manageCategories", "createCategories"),
  upload.single("image"),
  createCategory,
);
router.put(
  "/categories/:categoryId",
  auth,
  authorize("admin"),
  hasAnyPermission("manageCategories", "editCategories"),
  upload.single("image"),
  updateCategory,
);
router.delete(
  "/categories/:categoryId",
  auth,
  authorize("admin"),
  hasAnyPermission("manageCategories", "deleteCategories"),
  deleteCategory,
);

export default router;
