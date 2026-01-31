import mongoose from 'mongoose';
import Logger from './logger.js';

/**
 * Factory for creating standard CRUD controllers
 * Reduces boilerplate across dozens of files
 */
export const createBaseController = (Model, options = {}) => {
    const {
        resourceName = Model.modelName,
        searchFields = [],
        populateFields = [],
        idParam = `${resourceName.toLowerCase()}Id`,
        requireAdmin = true,
        useCloudinary = false,
        uploadField = 'image'
    } = options;

    return {
        // GET ALL
        getAll: async (req, res) => {
            try {
                const { page = 1, limit = 10, search, ...filters } = req.query;
                const query = { ...filters };

                if (search && searchFields.length > 0) {
                    query.$or = searchFields.map(field => ({
                        [field]: { $regex: search, $options: 'i' }
                    }));
                }

                // Handle boolean strings from query
                Object.keys(query).forEach(key => {
                    if (query[key] === 'true') query[key] = true;
                    if (query[key] === 'false') query[key] = false;
                });

                const docs = await Model.find(query)
                    .populate(populateFields)
                    .limit(limit * 1)
                    .skip((page - 1) * limit)
                    .sort({ createdAt: -1 });

                const count = await Model.countDocuments(query);

                return res.status(200).json({
                    success: true,
                    message: `${resourceName}s retrieved successfully.`,
                    data: docs,
                    pagination: {
                        total: count,
                        current: parseInt(page),
                        pages: Math.ceil(count / limit)
                    }
                });
            } catch (error) {
                Logger.error(`Get All ${resourceName} Error:`, error);
                return res.status(500).json({ success: false, message: "Server error." });
            }
        },

        // GET BY ID
        getById: async (req, res) => {
            try {
                const id = req.params[idParam];
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    return res.status(400).json({ success: false, message: `Invalid ${resourceName} ID.` });
                }

                const doc = await Model.findById(id).populate(populateFields);
                if (!doc) {
                    return res.status(404).json({ success: false, message: `${resourceName} not found.` });
                }

                return res.status(200).json({ success: true, data: doc });
            } catch (error) {
                Logger.error(`Get ${resourceName} Error:`, error);
                return res.status(500).json({ success: false, message: "Server error." });
            }
        },

        // CREATE
        create: async (req, res) => {
            try {
                if (requireAdmin && req.user.role !== 'admin') {
                    return res.status(403).json({ success: false, message: "Permission denied." });
                }

                const data = { ...req.body };
                
                // Handle image upload if provided
                if (useCloudinary && req.file) {
                    const { uploadCloudinary } = await import('./cloudinary.js');
                    data[uploadField] = await uploadCloudinary(req.file.buffer);
                }

                if (Model.schema.paths.createdBy) {
                    data.createdBy = req.user._id;
                }

                const doc = await Model.create(data);
                return res.status(201).json({ success: true, message: `${resourceName} created.`, data: doc });
            } catch (error) {
                Logger.error(`Create ${resourceName} Error:`, error);
                return res.status(500).json({ success: false, message: "Server error." });
            }
        },

        // UPDATE
        update: async (req, res) => {
            try {
                if (requireAdmin && req.user.role !== 'admin') {
                    return res.status(403).json({ success: false, message: "Permission denied." });
                }

                const id = req.params[idParam];
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    return res.status(400).json({ success: false, message: `Invalid ${resourceName} ID.` });
                }

                const data = { ...req.body };
                
                if (useCloudinary && req.file) {
                    const { uploadCloudinary } = await import('./cloudinary.js');
                    data[uploadField] = await uploadCloudinary(req.file.buffer);
                }

                const doc = await Model.findByIdAndUpdate(id, data, { new: true });
                if (!doc) {
                    return res.status(404).json({ success: false, message: `${resourceName} not found.` });
                }

                return res.status(200).json({ success: true, message: `${resourceName} updated.`, data: doc });
            } catch (error) {
                Logger.error(`Update ${resourceName} Error:`, error);
                return res.status(500).json({ success: false, message: "Server error." });
            }
        },

        // DELETE
        delete: async (req, res) => {
            try {
                if (requireAdmin && req.user.role !== 'admin') {
                    return res.status(403).json({ success: false, message: "Permission denied." });
                }

                const id = req.params[idParam];
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    return res.status(400).json({ success: false, message: `Invalid ${resourceName} ID.` });
                }

                const doc = await Model.findByIdAndDelete(id);
                if (!doc) {
                    return res.status(404).json({ success: false, message: `${resourceName} not found.` });
                }

                return res.status(200).json({ success: true, message: `${resourceName} deleted.` });
            } catch (error) {
                Logger.error(`Delete ${resourceName} Error:`, error);
                return res.status(500).json({ success: false, message: "Server error." });
            }
        }
    };
};
