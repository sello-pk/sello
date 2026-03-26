import multer from "multer";
import path from "path";
import {
  LISTING_MAX_IMAGES,
  LISTING_MAX_FILE_BYTES,
} from "../constants/listingUpload.js";

const storage = multer.memoryStorage(); // ✅ Store file in memory

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedTypes = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];

  if (!allowedTypes.includes(ext)) {
    return cb(
      new Error("Only images (jpg, jpeg, png, webp) and PDF files are allowed"),
      false
    );
  }

  // Additional MIME type check
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error("Invalid file type. Only images and PDF files are allowed"),
      false
    );
  }

  cb(null, true);
};

// Standardized field names to prevent "Unexpected field" errors
const STANDARD_FIELDS = {
  // User uploads
  avatar: 'avatar',
  
  // Dealer uploads - use consistent naming
  businessLicense: 'businessLicense', // Primary field name
  showroomImages: 'showroomImages',
  
  // Verification uploads
  frontDocument: 'frontDocument',
  backDocument: 'backDocument',
  
  // Auction uploads
  documents: 'documents',
  inspectionReport: 'inspectionReport',
  damageImages: 'damageImages',
  images: 'images'
};

// Field aliases for backward compatibility
const FIELD_ALIASES = {
  'businessLicenseFile': STANDARD_FIELDS.businessLicense,
  'license': STANDARD_FIELDS.businessLicense,
  'cnicFile': STANDARD_FIELDS.businessLicense
};

// Helper to normalize field names
const normalizeFieldName = (field) => {
  return FIELD_ALIASES[field] || field;
};

export const upload = multer({
  storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: LISTING_MAX_FILE_BYTES, // 35MB per file (total per listing enforced in controller)
    files: LISTING_MAX_IMAGES, // 15 images per listing
    fieldSize: 10 * 1024 * 1024, // 10MB for other fields
  },
});

// Single file upload for avatars
export const uploadSingle = multer({
  storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for avatars
    files: 1,
  },
});

// Dealer profile uploads - standardized field configuration with aliases
export const uploadDealerProfile = multer({
  storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for dealer documents
    files: 12, // 1 avatar + 1 license + 10 showroom images
    fieldSize: 10 * 1024 * 1024,
  },
}).fields([
  { name: STANDARD_FIELDS.avatar, maxCount: 1 },
  { name: STANDARD_FIELDS.businessLicense, maxCount: 1 },
  { name: 'businessLicenseFile', maxCount: 1 }, // Alias for backward compatibility
  { name: 'license', maxCount: 1 }, // Alias for backward compatibility
  { name: 'cnicFile', maxCount: 1 }, // Alias for backward compatibility
  { name: STANDARD_FIELDS.showroomImages, maxCount: 10 }
]);

// Dealer request uploads - simplified with aliases
export const uploadDealerRequest = multer({
  storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for dealer documents
    files: 4, // Allow all license field aliases
    fieldSize: 10 * 1024 * 1024,
  },
}).fields([
  { name: STANDARD_FIELDS.businessLicense, maxCount: 1 },
  { name: 'businessLicenseFile', maxCount: 1 }, // Alias for backward compatibility
  { name: 'license', maxCount: 1 }, // Alias for backward compatibility
  { name: 'cnicFile', maxCount: 1 } // Alias for backward compatibility
]);

// Auction access request uploads
export const uploadAuctionAccess = multer({
  storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 35 * 1024 * 1024, // 35MB for documents
    files: 14, // 10 documents + 4 license field aliases
    fieldSize: 20 * 1024 * 1024,
  },
}).fields([
  { name: STANDARD_FIELDS.documents, maxCount: 10 },
  { name: STANDARD_FIELDS.businessLicense, maxCount: 1 },
  { name: 'businessLicenseFile', maxCount: 1 }, // Alias for backward compatibility
  { name: 'license', maxCount: 1 }, // Alias for backward compatibility
  { name: 'cnicFile', maxCount: 1 } // Alias for backward compatibility
]);

// Verification uploads
export const uploadVerification = multer({
  storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for verification docs
    files: 2,
    fieldSize: 5 * 1024 * 1024,
  },
}).fields([
  { name: STANDARD_FIELDS.frontDocument, maxCount: 1 },
  { name: STANDARD_FIELDS.backDocument, maxCount: 1 }
]);

// Auction submit-car can include:
// - images: max LISTING_MAX_IMAGES (15)
// - inspectionReport: 1 PDF
// - damageImages: 5
// - documents: 5
// Total max files = 15 + 1 + 5 + 5 = 26
export const MAX_AUCTION_SUBMIT_FILES = 26;

export const auctionSubmitCarUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: LISTING_MAX_FILE_BYTES,
    files: MAX_AUCTION_SUBMIT_FILES,
    fieldSize: 20 * 1024 * 1024,
  },
});

// Helper functions for field handling
export const getStandardFields = () => STANDARD_FIELDS;
export const getFieldAliases = () => FIELD_ALIASES;
