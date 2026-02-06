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
    populateFields: [{ path: 'author', select: 'name email' }, { path: 'category', select: 'name slug image' }],
    useCloudinary: true,
    idParam: 'blogId',
    uploadField: 'featuredImage'
});

export const { 
    delete: deleteBlog, 
    update: updateBlog 
} = blogBase;

export const createBlog = async (req, res) => {
    try {
        const { title, content, category, tags, status, excerpt, readTime, isFeatured } = req.body;
        if (!title || !content) return res.status(400).json({ success: false, message: "Title and content required." });

        let imageUrl = null;
        if (req.file) {
            const { uploadCloudinary } = await import('../utils/cloudinary.js');
            imageUrl = await uploadCloudinary(req.file.buffer);
        }

        const blog = await Blog.create({
            title, 
            content, 
            excerpt: excerpt || content.substring(0, 150).replace(/<[^>]*>?/gm, '') + '...',
            category: category || null, 
            tags: typeof tags === 'string' ? JSON.parse(tags) : tags,
            status: status || 'draft',
            featuredImage: imageUrl,
            isFeatured: isFeatured === 'true',
            readTime: parseInt(readTime) || 5,
            author: req.user._id,
            slug: title.toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '') + '-' + Date.now().toString().slice(-4)
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
        
        // Build Filter Query
        const query = {};
        
        // DEBUG: Log which database we are using
        if (mongoose.connection.db) {
            console.log(`[DEBUG] Fetching blogs from database: ${mongoose.connection.db.databaseName}`);
            const count = await Blog.countDocuments({});
            console.log(`[DEBUG] Total blogs in collection (all statuses): ${count}`);
        }

        // Handle admin "all" vs public default "published"
        if (status && status !== 'all') {
            query.status = status;
        } else if (!status) {
            query.status = "published";
        }
        
        if (category && mongoose.Types.ObjectId.isValid(category)) {
            query.category = category;
        }
        
        if (req.query.isFeatured !== undefined) {
            query.isFeatured = req.query.isFeatured === 'true';
        }

        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [{ title: regex }, { excerpt: regex }, { content: regex }];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [blogs, total, stats] = await Promise.all([
            Blog.find(query)
                .populate('author', 'name email')
                .populate('category', 'name slug image')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Blog.countDocuments(query),
            Blog.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ])
        ]);

        // Transform stats into a cleaner object
        const metrics = {
            total: await Blog.countDocuments(),
            published: 0,
            draft: 0,
            pending: 0,
            archived: 0,
            scheduled: 0
        };
        stats.forEach(s => {
            if (s._id) metrics[s._id] = s.count;
        });
            
        return res.status(200).json({ 
            success: true, 
            data: {
                blogs,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit)),
                    limit: parseInt(limit)
                },
                stats: metrics
            }
        });
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
        const { type, subType, parentCategory, isActive, vehicleType } = req.query;

        const query = {};
        if (type) query.type = type;
        if (subType) query.subType = subType;
        if (parentCategory) query.parentCategory = parentCategory;
        if (isActive !== undefined) query.isActive = isActive === "true" || isActive === true;
        if (vehicleType) query.vehicleType = vehicleType;

        const [categories, postCounts] = await Promise.all([
            Category.find(query)
                .populate("createdBy", "name email")
                .populate("parentCategory", "name slug vehicleType")
                .sort({ order: 1, createdAt: -1 })
                .lean(),
            Blog.aggregate([
                { $group: { _id: "$category", count: { $sum: 1 } } }
            ])
        ]);

        // Map post counts to categories
        const countMap = {};
        postCounts.forEach(c => {
            if (c._id) countMap[c._id.toString()] = c.count;
        });

        const data = categories.map(cat => ({
            ...cat,
            postCount: countMap[cat._id.toString()] || 0
        }));

        return res.status(200).json({ success: true, data });
    } catch (err) {
        Logger.error("Get All Categories Error", err);
        console.error("Get All Categories Detailed Error:", err);
        return res.status(500).json({ 
            success: false, 
            message: "Server error.",
            error: process.env.NODE_ENV === "development" ? err.message : undefined
        });
    }
};
