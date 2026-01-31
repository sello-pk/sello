import express from "express";
import { auth, authorize } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multer.js";
import {
    getAllBanners, getBannerById, createBanner, updateBanner, deleteBanner,
    getAllTestimonials, getTestimonialById, createTestimonial, updateTestimonial, deleteTestimonial, createPublicReview,
    subscribeNewsletter, unsubscribeNewsletter, getAllSubscribers,
    getAllBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog,
    getAllCategories
} from "../controllers/contentDomainController.js";

const router = express.Router();

/* -------------------------------- BANNERS --------------------------------- */
router.get("/banners", getAllBanners);
router.get("/banners/:bannerId", getBannerById);
router.post("/banners", auth, authorize("admin"), upload.single("image"), createBanner);
router.put("/banners/:bannerId", auth, authorize("admin"), upload.single("image"), updateBanner);
router.delete("/banners/:bannerId", auth, authorize("admin"), deleteBanner);

/* ------------------------------ TESTIMONIALS ------------------------------ */
router.get("/testimonials", getAllTestimonials);
router.get("/testimonials/:testimonialId", getTestimonialById);
router.post("/testimonials", auth, upload.single("image"), createPublicReview); // Public submission
router.post("/testimonials/admin", auth, authorize("admin"), upload.single("image"), createTestimonial); // Admin submission
router.put("/testimonials/:testimonialId", auth, authorize("admin"), upload.single("image"), updateTestimonial);
router.delete("/testimonials/:testimonialId", auth, authorize("admin"), deleteTestimonial);

/* ------------------------------- NEWSLETTER ------------------------------- */
router.post("/newsletter/subscribe", subscribeNewsletter);
router.post("/newsletter/unsubscribe", unsubscribeNewsletter);
router.get("/newsletter/subscribers", auth, getAllSubscribers); // Auth only, as per original

/* --------------------------------- BLOGS ---------------------------------- */
router.get("/blogs", getAllBlogs);
router.get("/blogs/:slug", getBlogBySlug);
router.post("/blogs", auth, authorize("admin"), upload.single("image"), createBlog);
router.put("/blogs/:blogId", auth, authorize("admin"), upload.single("image"), updateBlog);
router.delete("/blogs/:blogId", auth, authorize("admin"), deleteBlog);

/* ------------------------------- CATEGORIES ------------------------------- */
router.get("/categories", getAllCategories);

export default router;
