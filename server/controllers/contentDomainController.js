import Banner from '../models/bannerModel.js';
import Testimonial from '../models/testimonialModel.js';
import Newsletter from '../models/newsletterModel.js';
import { Blog, BlogView } from '../models/blogModel.js';
import Category from '../models/categoryModel.js';
import mongoose from 'mongoose';
import { uploadCloudinary } from '../utils/cloudinary.js';
import sendEmail from '../utils/sendEmail.js';
import Logger from '../utils/logger.js';
import { createBaseController } from '../utils/baseController.js';

/* -------------------------------------------------------------------------- */
/*                               BANNER SECTION                               */
/* -------------------------------------------------------------------------- */

const bannerBase = createBaseController(Banner, {
    resourceName: 'Banner',
    populateFields: [{ path: 'createdBy', select: 'name email' }],
    useCloudinary: true
});

export const { 
    getAll: getAllBanners, 
    getById: getBannerById, 
    create: createBanner, 
    update: updateBanner, 
    delete: deleteBanner 
} = bannerBase;

/* -------------------------------------------------------------------------- */
/*                            TESTIMONIAL SECTION                             */
/* -------------------------------------------------------------------------- */

const testimonialBase = createBaseController(Testimonial, {
    resourceName: 'Testimonial',
    populateFields: [{ path: 'createdBy', select: 'name email' }],
    useCloudinary: true
});

export const {
    getAll: getAllTestimonials,
    getById: getTestimonialById,
    create: createTestimonial,
    update: updateTestimonial,
    delete: deleteTestimonial
} = testimonialBase;

// Custom logic for public reviews
export const createPublicReview = async (req, res) => {
    try {
        const { name, role, company, text, rating } = req.body;
        if (!name || !text) return res.status(400).json({ success: false, message: "Name and text required." });
        
        let imageUrl = null;
        if (req.file) imageUrl = await uploadCloudinary(req.file.buffer);

        const testimonial = await Testimonial.create({
            name, role, company, text, rating: rating || 5,
            image: imageUrl,
            isActive: false, // Needs approval
            createdBy: req.user?._id || null
        });

        return res.status(201).json({ success: true, message: "Review submitted for approval.", data: testimonial });
    } catch (err) {
        Logger.error("Public Review Error", err);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

/* -------------------------------------------------------------------------- */
/*                             NEWSLETTER SECTION                             */
/* -------------------------------------------------------------------------- */

export const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ success: false, message: "Invalid email." });

        const normalizedEmail = email.toLowerCase();
        let subscriber = await Newsletter.findOne({ email: normalizedEmail });

        if (subscriber) {
            if (subscriber.status === 'subscribed') return res.status(200).json({ success: true, message: "Already subscribed." });
            subscriber.status = 'subscribed';
            subscriber.subscribedAt = new Date();
            subscriber.unsubscribedAt = null;
            await subscriber.save();
        } else {
            subscriber = await Newsletter.create({ email: normalizedEmail, status: 'subscribed', source: 'website' });
        }

        try {
            await sendEmail(normalizedEmail, "Welcome up Sello Newsletter!", "<h1>Welcome!</h1><p>You have subscribed successfully.</p>");
        } catch (e) { Logger.warn("Newsletter email failed", e); }

        return res.status(201).json({ success: true, message: "Subscribed successfully.", data: subscriber });
    } catch (err) {
        Logger.error("Newsletter Error", err);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

export const unsubscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;
        const subscriber = await Newsletter.findOne({ email: email?.toLowerCase() });
        if (!subscriber) return res.status(404).json({ success: false, message: "Email not found." });

        subscriber.status = 'unsubscribed';
        subscriber.unsubscribedAt = new Date();
        await subscriber.save();

        return res.status(200).json({ success: true, message: "Unsubscribed." });
    } catch (err) {
        Logger.error("Unsubscribe Error", err);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

export const getAllSubscribers = async (req, res) => {
    try {
        const { status, page = 1, limit = 50 } = req.query;
        const query = status ? { status } : {};
        const subscribers = await Newsletter.find(query).sort({ subscribedAt: -1 }).skip((page - 1) * limit).limit(limit);
        const total = await Newsletter.countDocuments(query);
        return res.status(200).json({ success: true, data: { subscribers, total, pages: Math.ceil(total / limit) } });
    } catch (err) {
        Logger.error("Get Subscribers Error", err);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

/* -------------------------------------------------------------------------- */
/*                                BLOG SECTION                                */
/* -------------------------------------------------------------------------- */

const blogBase = createBaseController(Blog, {
    resourceName: 'Blog',
    populateFields: [{ path: 'author', select: 'name email' }],
    useCloudinary: true,
    idParam: 'blogId'
});

export const { 
    delete: deleteBlog, 
    update: updateBlog 
} = blogBase;

export const createBlog = async (req, res) => {
    try {
        const { title, content, category, tags, status } = req.body;
        if (!title || !content) return res.status(400).json({ success: false, message: "Title and content required." });

        let imageUrl = null;
        if (req.file) imageUrl = await uploadCloudinary(req.file.buffer);

        const blog = await Blog.create({
            title, 
            content, 
            category, 
            tags: typeof tags === 'string' ? JSON.parse(tags) : tags,
            status: status || 'draft',
            image: imageUrl,
            author: req.user._id,
            slug: title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now().toString().slice(-4)
        });

        return res.status(201).json({ success: true, data: blog });
    } catch (err) {
        Logger.error("Create Blog Error", err);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        const { status, category, search, page = 1, limit = 10 } = req.query;
        const query = status ? { status } : { status: 'published' };
        if (category) query.category = category;
        if (search) query.title = { $regex: search, $options: 'i' };

        const blogs = await Blog.find(query)
            .populate('author', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
            
        const total = await Blog.countDocuments(query);
        return res.status(200).json({ success: true, data: blogs, pagination: { total, pages: Math.ceil(total / limit) } });
    } catch (err) {
        Logger.error("Get Blogs Error", err);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

export const getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug }).populate('author', 'name email');
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found." });
        return res.status(200).json({ success: true, data: blog });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

/* -------------------------------------------------------------------------- */
/*                              CATEGORY SECTION                              */
/* -------------------------------------------------------------------------- */

export const getAllCategories = async (req, res) => {
    try {
        const { type } = req.query;
        const query = { parentCategory: null };
        if (type) query.type = type;
        
        const categories = await Category.find(query).populate('children');
        return res.status(200).json({ success: true, data: categories });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server error." });
    }
};
