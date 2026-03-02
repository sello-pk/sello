export const PERMISSION_KEYS = [
  "manageUsers",
  "createRoles",
  "editRoles",
  "deleteRoles",
  "inviteUsers",
  "resetPasswords",
  "viewListings",
  "createListings",
  "approveListings",
  "editListings",
  "deleteListings",
  "featureListings",
  "viewDealers",
  "createDealers",
  "approveDealers",
  "editDealers",
  "deleteDealers",
  "manageDealerSubscriptions",
  "viewDealerPerformance",
  "manageBlogs",
  "publishBlogs",
  "deleteBlogs",
  "moderateComments",
  "managePromotions",
  "viewTestimonials",
  "manageTestimonials",
  "createPushNotifications",
  "sendPushNotifications",
  "accessChatbot",
  "viewChatbotLogs",
  "manageSupportTickets",
  "respondToInquiries",
  "escalateIssues",
  "managePlatformSettings",
  "manageLogo",
  "manageLanguage",
  "manageCurrency",
  "manageCommission",
  "manageIntegrations",
  "viewAnalytics",
  "viewFinancialReports",
  "managePayments",
  "viewAuctions",
  "manageAuctions",
  "createReports",
  "exportReports",
  "manageCategories",
  "viewCategories",
  "createCategories",
  "editCategories",
  "deleteCategories",
  "manageCarTypes",
  "editReports",
  "deleteReports",
  "createChatLogs",
  "editChatLogs",
  "deleteChatLogs",
  "createSupportTickets",
  "deleteSupportTickets",
  "viewInquiries",
  "createInquiries",
  "editInquiries",
  "deleteInquiries",
  "viewBlogs",
  "createBlogs",
  "editBlogs",
  "viewPromotions",
  "createPromotions",
  "editPromotions",
  "deletePromotions",
  "viewNotifications",
  "createNotifications",
  "editNotifications",
  "deleteNotifications",
  "viewSettings",
  "createSettings",
  "editSettings",
  "deleteSettings",
  "manageBanners",
  "viewAuditLogs",
  "viewUserProfiles",
  "viewFullUserProfiles",
  "accessSensitiveAreas",
];

const ALL_FALSE_PERMISSIONS = PERMISSION_KEYS.reduce((acc, key) => {
  acc[key] = false;
  return acc;
}, {});

const createPermissionMap = (enabled = []) => {
  const next = { ...ALL_FALSE_PERMISSIONS };
  enabled.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(next, key)) {
      next[key] = true;
    }
  });
  return next;
};

export const SYSTEM_FULL_ACCESS_ROLE_NAMES = ["Owner", "Super Admin"];
export const SYSTEM_ROLE_NAMES = [
  "Owner",
  "Admin Manager",
  "Finance Manager",
  "Content Manager",
  "Content Writer",
  "Listings Moderator",
  "Support Agent",
  "Marketing Manager",
  "Analytics Viewer",
];

export const LEGACY_ROLE_NAME_MAP = {
  "Super Admin": "Owner",
  "Marketing Team": "Marketing Manager",
  "Blogs/Content Agent": "Content Writer",
  Moderator: "Listings Moderator",
  "Dealer Manager": "Listings Moderator",
};

export const sanitizePermissionMap = (input = {}) =>
  PERMISSION_KEYS.reduce((acc, key) => {
    acc[key] = Boolean(input?.[key]);
    return acc;
  }, {});

export const isSystemRoleName = (roleName = "") =>
  SYSTEM_ROLE_NAMES.includes(roleName);

export const resolveCanonicalRoleName = (roleName = "") =>
  LEGACY_ROLE_NAME_MAP[roleName] || roleName;

const ownerPermissions = createPermissionMap(PERMISSION_KEYS);

const adminManagerPermissions = createPermissionMap([
  "manageUsers",
  "inviteUsers",
  "resetPasswords",
  "viewListings",
  "createListings",
  "approveListings",
  "editListings",
  "deleteListings",
  "featureListings",
  "viewDealers",
  "createDealers",
  "approveDealers",
  "editDealers",
  "deleteDealers",
  "manageDealerSubscriptions",
  "viewDealerPerformance",
  "viewBlogs",
  "createBlogs",
  "editBlogs",
  "deleteBlogs",
  "manageBlogs",
  "publishBlogs",
  "moderateComments",
  "viewCategories",
  "createCategories",
  "editCategories",
  "deleteCategories",
  "manageCategories",
  "manageCarTypes",
  "viewPromotions",
  "createPromotions",
  "editPromotions",
  "deletePromotions",
  "managePromotions",
  "viewTestimonials",
  "manageTestimonials",
  "viewNotifications",
  "createNotifications",
  "editNotifications",
  "deleteNotifications",
  "createPushNotifications",
  "sendPushNotifications",
  "accessChatbot",
  "viewChatbotLogs",
  "createChatLogs",
  "editChatLogs",
  "deleteChatLogs",
  "manageSupportTickets",
  "createSupportTickets",
  "deleteSupportTickets",
  "respondToInquiries",
  "escalateIssues",
  "viewInquiries",
  "createInquiries",
  "editInquiries",
  "deleteInquiries",
  "viewAnalytics",
  "viewFinancialReports",
  "createReports",
  "exportReports",
  "viewAuditLogs",
  "viewAuctions",
  "manageAuctions",
  "viewSettings",
  "managePlatformSettings",
  "manageLogo",
  "manageLanguage",
  "manageCurrency",
  "manageBanners",
  "viewUserProfiles",
  "viewFullUserProfiles",
]);

const financeManagerPermissions = createPermissionMap([
  "viewAnalytics",
  "viewFinancialReports",
  "createReports",
  "exportReports",
  "managePayments",
  "manageCommission",
  "viewSettings",
]);

const contentManagerPermissions = createPermissionMap([
  "viewAnalytics",
  "viewCategories",
  "editCategories",
  "viewBlogs",
  "createBlogs",
  "editBlogs",
  "deleteBlogs",
  "manageBlogs",
  "publishBlogs",
  "moderateComments",
  "viewTestimonials",
  "manageTestimonials",
]);

const contentWriterPermissions = createPermissionMap([
  "viewBlogs",
  "createBlogs",
  "editBlogs",
  "moderateComments",
]);

const listingsModeratorPermissions = createPermissionMap([
  "viewAnalytics",
  "viewListings",
  "approveListings",
  "editListings",
  "featureListings",
  "viewDealers",
  "viewAuctions",
  "manageAuctions",
]);

const supportAgentPermissions = createPermissionMap([
  "viewAnalytics",
  "viewListings",
  "viewDealers",
  "viewUserProfiles",
  "accessChatbot",
  "viewChatbotLogs",
  "manageSupportTickets",
  "respondToInquiries",
  "viewInquiries",
  "createInquiries",
  "editInquiries",
]);

const marketingManagerPermissions = createPermissionMap([
  "viewAnalytics",
  "viewListings",
  "viewPromotions",
  "createPromotions",
  "editPromotions",
  "deletePromotions",
  "managePromotions",
  "viewNotifications",
  "createNotifications",
  "editNotifications",
  "deleteNotifications",
  "createPushNotifications",
  "sendPushNotifications",
]);

const analyticsViewerPermissions = createPermissionMap([
  "viewAnalytics",
  "viewFinancialReports",
  "viewAuditLogs",
]);

export const CANONICAL_ROLE_PRESETS = {
  Owner: {
    name: "Owner",
    displayName: "Owner",
    accessLevel: "FULL",
    purpose:
      "Full ownership control. Can manage all modules including roles, payments, and integrations.",
    permissions: ownerPermissions,
    restrictions: [],
    isPreset: true,
  },
  "Admin Manager": {
    name: "Admin Manager",
    displayName: "Admin Manager",
    accessLevel: "FULL",
    purpose:
      "Runs day-to-day operations with broad control except ultra-sensitive owner-only actions.",
    permissions: adminManagerPermissions,
    restrictions: [
      "Cannot create, edit, or delete system roles unless explicitly granted",
      "Cannot manage payment settings or API integrations by default",
    ],
    isPreset: true,
  },
  "Finance Manager": {
    name: "Finance Manager",
    displayName: "Finance Manager",
    accessLevel: "MEDIUM_HIGH",
    purpose: "Manages payments, financial reporting, and finance-related dashboards.",
    permissions: financeManagerPermissions,
    restrictions: ["No listing, content, or user administration access by default"],
    isPreset: true,
  },
  "Content Manager": {
    name: "Content Manager",
    displayName: "Content Manager",
    accessLevel: "MEDIUM_HIGH",
    purpose: "Owns editorial operations for blogs, categories, and testimonials.",
    permissions: contentManagerPermissions,
    restrictions: ["No payment or role management access"],
    isPreset: true,
  },
  "Content Writer": {
    name: "Content Writer",
    displayName: "Content Writer",
    accessLevel: "MEDIUM",
    purpose: "Creates and edits blog content with limited editorial permissions.",
    permissions: contentWriterPermissions,
    restrictions: ["No role, payment, or platform settings access"],
    isPreset: true,
  },
  "Listings Moderator": {
    name: "Listings Moderator",
    displayName: "Listings Moderator",
    accessLevel: "MEDIUM_HIGH",
    purpose: "Moderates listings and auction lifecycle operations.",
    permissions: listingsModeratorPermissions,
    restrictions: ["No role, payment, or platform settings access"],
    isPreset: true,
  },
  "Support Agent": {
    name: "Support Agent",
    displayName: "Support Agent",
    accessLevel: "MEDIUM",
    purpose: "Handles customer support, request resolution, and chat oversight.",
    permissions: supportAgentPermissions,
    restrictions: ["No role, payment, or platform settings access"],
    isPreset: true,
  },
  "Marketing Manager": {
    name: "Marketing Manager",
    displayName: "Marketing Manager",
    accessLevel: "MEDIUM_HIGH",
    purpose: "Owns campaigns, promotions, and customer communication.",
    permissions: marketingManagerPermissions,
    restrictions: ["No role, payment, or platform settings access"],
    isPreset: true,
  },
  "Analytics Viewer": {
    name: "Analytics Viewer",
    displayName: "Analytics Viewer",
    accessLevel: "MEDIUM",
    purpose: "Read-only analytics and audit visibility.",
    permissions: analyticsViewerPermissions,
    restrictions: ["Read-only role; no create/edit/delete operations"],
    isPreset: true,
  },
};
