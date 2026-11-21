import express from 'express';
import rateLimit from 'express-rate-limit';
import { auth, authorize } from '../middlewares/authMiddleware.js';
import { hasPermission } from '../middlewares/permissionMiddleware.js';
import Category from '../models/categoryModel.js';
import Car from '../models/carModel.js';
import { CompareConfig } from '../models/compareModel.js';
import { getCompareMetrics } from '../services/compareMonitoring.js';
import { compareVehicles, researchVehicle, recommendation, getCompareConfig, resolveVehicle } from '../services/compareService.js';
const router = express.Router();
const handle = fn => async (req, res) => { try { res.json({ success: true, data: await fn(req) }); } catch (error) { res.status(error.status || 400).json({ success: false, message: error.message }); } };
const aiLimit = rateLimit({ windowMs: 60000, max: 12 });
router.get('/catalog', handle(async () => Category.find({ type: 'car', isActive: true, subType: { $in: ['make', 'model', 'year'] }, vehicleType: { $in: ['Car', null] } }).select('name subType parentCategory image').lean()));
router.get('/variants', handle(async req => {
  const identity = await resolveVehicle({ ...req.query, variant: 'lookup' });
  const listingVariants = await Car.distinct('variant', { make: identity.make, model: identity.model, year: identity.year });
  return [...new Set(listingVariants)].filter(value => value && value !== 'N/A');
}));
router.get('/config', handle(async () => {
  const config = await getCompareConfig();
  return { aiResearch: config.aiResearch, aiSummary: config.aiSummary, sections: config.sections, fuelPrice: config.fuelPrice, fuelDate: config.fuelDate };
}));
router.post('/results', handle(req => compareVehicles(req.body.vehicles)));
router.post('/research', aiLimit, handle(req => researchVehicle(req.body.vehicle)));
router.post('/recommendation', aiLimit, handle(req => recommendation(req.body.researchIds, req.body.priorities, req.body.costs)));
router.use('/admin', auth, authorize('admin'), hasPermission('manageCategories'));
router.get('/admin/metrics', hasPermission('managePlatformSettings'), handle(getCompareMetrics));
router.get('/admin/config', handle(getCompareConfig));
router.put('/admin/config', hasPermission('managePlatformSettings'), handle(async req => {
  const updates = {};
  if (req.body.sections) {
    if (!Array.isArray(req.body.sections) || req.body.sections.length !== 4) throw new Error('Exactly four sections are required');
    const sections = req.body.sections.map(section => {
      const clean = {};
      for (const key of ['title', 'description', 'image', 'alt']) {
        if (typeof section[key] !== 'string' || !section[key].trim() || section[key].length > 2500) throw new Error(`Each section needs ${key}`);
        clean[key] = section[key].trim();
      }
      if (!/^https:\/\//.test(clean.image) && !/^\/(?!\/)/.test(clean.image)) throw new Error('Invalid image URL');
      return clean;
    });
    if (new Set(sections.map(row => row.title)).size !== 4 || new Set(sections.map(row => row.description)).size !== 4) throw new Error('Use unique titles and descriptions');
    updates.draftSections = sections;
    if (req.body.publish === true) updates.sections = sections;
  }
  if (req.body.fuelPrice !== undefined) {
    const price = Number(req.body.fuelPrice);
    if (!Number.isFinite(price) || price <= 0 || !req.body.fuelDate || !Number.isFinite(Date.parse(req.body.fuelDate)) || !req.body.fuelSource) throw new Error('Approved fuel price needs an effective date and internal source');
    Object.assign(updates, { fuelPrice: price, fuelDate: req.body.fuelDate, fuelSource: String(req.body.fuelSource).slice(0, 2000) });
  }
  return CompareConfig.findOneAndUpdate({ key: 'main' }, { $set: updates }, { upsert: true, new: true }).lean();
}));
export default router;
