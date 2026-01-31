import mongoose from 'mongoose';
import Logger from '../utils/logger.js';

/**
 * Middleware to validate MongoDB ObjectId in request parameters
 * @param {string|string[]} paramNames - Parameter name(s) to validate (default: 'id')
 * @returns {Function} Express middleware function
 */
export const validateObjectId = (paramNames = 'id') => {
  // Convert single param to array for uniform handling
  const params = Array.isArray(paramNames) ? paramNames : [paramNames];
  
  return (req, res, next) => {
    const invalidParams = [];
    
    for (const paramName of params) {
      const id = req.params[paramName];
      
      if (id && !mongoose.Types.ObjectId.isValid(id)) {
        invalidParams.push(paramName);
      }
    }
    
    if (invalidParams.length > 0) {
      Logger.warn('Invalid ObjectId in request', {
        params: invalidParams,
        values: invalidParams.map(p => req.params[p]),
        url: req.originalUrl,
        method: req.method
      });
      
      return res.status(400).json({
        success: false,
        message: `Invalid ${invalidParams.join(', ')} format. Must be a valid MongoDB ObjectId.`,
        invalidParams
      });
    }
    
    next();
  };
};

/**
 * Middleware to validate required fields in request body
 * @param {string[]} requiredFields - Array of required field names
 * @param {string} location - Where to check ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
export const validateRequiredFields = (requiredFields, location = 'body') => {
  return (req, res, next) => {
    const data = req[location];
    
    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        success: false,
        message: `Invalid request ${location}`
      });
    }
    
    const missing = requiredFields.filter(field => {
      const value = data[field];
      return value === undefined || value === null || value === '';
    });
    
    if (missing.length > 0) {
      Logger.warn('Missing required fields', {
        missing,
        location,
        url: req.originalUrl,
        method: req.method
      });
      
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
        missingFields: missing
      });
    }
    
    next();
  };
};

/**
 * Middleware to validate pagination parameters
 * @param {object} options - Validation options
 * @param {number} options.maxLimit - Maximum allowed limit (default: 100)
 * @param {number} options.defaultLimit - Default limit (default: 12)
 * @returns {Function} Express middleware function
 */
export const validatePagination = (options = {}) => {
  const { maxLimit = 100, defaultLimit = 12 } = options;
  
  return (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    
    // Validate page
    if (req.query.page && (isNaN(page) || page < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page number. Must be a positive integer.'
      });
    }
    
    // Validate limit
    if (req.query.limit) {
      if (isNaN(limit) || limit < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid limit. Must be a positive integer.'
        });
      }
      
      if (limit > maxLimit) {
        return res.status(400).json({
          success: false,
          message: `Limit exceeds maximum allowed value of ${maxLimit}.`
        });
      }
    }
    
    // Set sanitized values
    req.pagination = {
      page: page || 1,
      limit: limit || defaultLimit,
      skip: ((page || 1) - 1) * (limit || defaultLimit)
    };
    
    next();
  };
};

/**
 * Middleware to validate email format
 * @param {string} fieldName - Name of the field containing email (default: 'email')
 * @param {string} location - Where to check ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
export const validateEmail = (fieldName = 'email', location = 'body') => {
  return (req, res, next) => {
    const email = req[location][fieldName];
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} is required`
      });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }
    
    next();
  };
};

/**
 * Middleware to validate number range
 * @param {string} fieldName - Name of the field to validate
 * @param {object} options - Validation options
 * @param {number} options.min - Minimum value
 * @param {number} options.max - Maximum value
 * @param {string} options.location - Where to check ('body', 'query', 'params')
 * @param {boolean} options.required - Whether field is required
 * @returns {Function} Express middleware function
 */
export const validateNumberRange = (fieldName, options = {}) => {
  const { min, max, location = 'body', required = false } = options;
  
  return (req, res, next) => {
    const value = req[location][fieldName];
    
    if (value === undefined || value === null || value === '') {
      if (required) {
        return res.status(400).json({
          success: false,
          message: `${fieldName} is required`
        });
      }
      return next();
    }
    
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} must be a valid number`
      });
    }
    
    if (min !== undefined && numValue < min) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} must be at least ${min}`
      });
    }
    
    if (max !== undefined && numValue > max) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} must not exceed ${max}`
      });
    }
    
    next();
  };
};

export default {
  validateObjectId,
  validateRequiredFields,
  validatePagination,
  validateEmail,
  validateNumberRange
};
