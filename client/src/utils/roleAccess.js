/**
 * Role-based access control for admin panel tabs
 * Super Admin = Full access to all tabs
 * Team members = Limited access based on their role
 */

/**
 * Check if user is Super Admin or original admin (has full access)
 * - Original admins (adminRole is null/undefined) have full access
 * - Super Admin role has full access
 * - Team members (with specific adminRole) have limited access
 */
export const isSuperAdmin = (user) => {
  if (!user || user.role !== "admin") {
    return false;
  }

  // Original admins (adminRole is null/undefined) have full access
  if (!user.adminRole || user.adminRole === null) {
    return true;
  }

  // Super Admin role has full access
  if (user.adminRole === "Super Admin") {
    return true;
  }

  // Only Super Admin and original admins get full access
  // Remove automatic full access for inviteUsers permission

  return false;
};

/**
 * Role-based menu access mapping
 * Each role can only see specific tabs
 */
const ROLE_MENU_ACCESS = {
  "Super Admin": [
    "/admin/dashboard",
    "/admin/users",
    "/admin/listings",
    "/admin/dealers",
    "/admin/categories",
    "/admin/blogs",
    "/admin/blogs/categories",
    "/admin/blogs/create",
    "/admin/blog-comments",
    "/admin/blogs/media",
    "/admin/testimonials",
    "/admin/analytics",
    "/admin/activity-log",
    "/admin/chat-monitoring",
    "/admin/support-chat",
    "/admin/customer-requests",
    "/admin/valuations",
    "/admin/auctions",
    "/admin/account-deletion-requests",
    "/admin/promotions",
    "/admin/payments",
    "/admin/notifications",
    "/admin/settings",
  ],
  Moderator: [
    "/admin/dashboard",
    "/admin/listings", // Approve/edit/reject listings
    "/admin/dealers", // View dealers, communicate
    "/admin/blogs", // Moderate blog comments
    // Categories would be under listings or separate
  ],
  "Support Agent": [
    "/admin/dashboard",
    "/admin/chat-monitoring", // Chat monitoring
    "/admin/support-chat", // Support chat interface
    "/admin/customer-requests", // Customer requests and contact forms
  ],
  "Content Manager": [
    "/admin/dashboard",
    "/admin/blogs", // Write/edit/publish blogs
    "/admin/blogs/categories",
    "/admin/blog-comments",
    "/admin/testimonials", // Manage reviews and testimonials
    "/admin/promotions", // Manage promotions
    "/admin/notifications", // Create push notifications
  ],
  "Dealer Manager": [
    "/admin/dashboard",
    "/admin/dealers", // View/approve/edit dealer profiles
    "/admin/listings", // View listings per dealer (view only)
  ],
  "Blogs/Content Agent": [
    "/admin/dashboard",
    "/admin/blogs", // Write/edit/publish blogs
    "/admin/blogs/categories",
    "/admin/blog-comments",
    "/admin/testimonials", // Manage reviews and testimonials
    "/admin/promotions", // Manage promotions
    "/admin/notifications", // Create push notifications
  ],
  "Marketing Team": [
    "/admin/dashboard",
    "/admin/blogs", // Write/edit/publish blogs
    "/admin/blogs/categories",
    "/admin/blog-comments",
    "/admin/testimonials", // Manage reviews and testimonials
    "/admin/promotions", // Manage promotions
    "/admin/notifications", // Create push notifications
  ],
  Custom: [
    "/admin/dashboard",
    // Custom roles get access based on their permissions only
    // No automatic settings access for custom roles
  ],
};

/**
 * Get allowed menu paths for a user based on their role
 */
export const getAllowedMenuPaths = (user) => {
  if (!user || user.role !== "admin") {
    return [];
  }

  // Super Admin or original admin gets all tabs
  if (isSuperAdmin(user)) {
    return ROLE_MENU_ACCESS["Super Admin"];
  }

  // Get allowed paths based on adminRole for team members
  const adminRole = user.adminRole;
  if (!adminRole) {
    // No fallback - if no adminRole, no access (unless Super Admin)
    return [];
  }

  return ROLE_MENU_ACCESS[adminRole] || [];
};

/**
 * Check if user can access a specific menu path based on their permissions
 */
export const canAccessMenu = (user, path) => {
  if (!user || user.role !== "admin") {
    return false;
  }

  // Super Admin can access everything
  if (isSuperAdmin(user)) {
    return true;
  }

  // Check permission-based access for team members
  const userPermissions = user.permissions || {};

  // Permission-based menu access mapping - ACCURATE MAPPING
  const PERMISSION_MENU_ACCESS = {
    "/admin/users": userPermissions.manageUsers || userPermissions.inviteUsers,
    "/admin/listings":
      userPermissions.viewListings ||
      userPermissions.approveListings ||
      userPermissions.editListings ||
      userPermissions.createListings ||
      userPermissions.deleteListings,
    "/admin/dealers":
      userPermissions.viewDealers ||
      userPermissions.approveDealers ||
      userPermissions.editDealers ||
      userPermissions.createDealers ||
      userPermissions.deleteDealers,
    "/admin/categories":
      userPermissions.viewCategories || userPermissions.manageCategories,
    "/admin/blogs":
      userPermissions.viewBlogs ||
      userPermissions.createBlogs ||
      userPermissions.editBlogs ||
      userPermissions.deleteBlogs ||
      userPermissions.manageBlogs ||
      userPermissions.publishBlogs ||
      userPermissions.moderateComments,
    "/admin/blog-categories":
      userPermissions.viewCategories || userPermissions.manageCategories,
    "/admin/blogs/categories":
      userPermissions.viewCategories || userPermissions.manageCategories,
    "/admin/blogs/create":
      userPermissions.createBlogs || userPermissions.manageBlogs,
    "/admin/blogs/:id/edit":
      userPermissions.editBlogs || userPermissions.manageBlogs,
    "/admin/blog-comments": userPermissions.moderateComments,
    "/admin/blogs/comments": userPermissions.moderateComments,
    "/admin/blog-media":
      userPermissions.manageBlogs || userPermissions.createBlogs,
    "/admin/blogs/media":
      userPermissions.manageBlogs || userPermissions.createBlogs,
    "/admin/testimonials":
      userPermissions.viewTestimonials || userPermissions.manageTestimonials,
    "/admin/analytics":
      userPermissions.viewAnalytics ||
      userPermissions.viewFinancialReports ||
      userPermissions.createReports ||
      userPermissions.exportReports ||
      userPermissions.deleteReports,
    "/admin/chat":
      userPermissions.accessChatbot ||
      userPermissions.viewChatbotLogs ||
      userPermissions.createChatLogs ||
      userPermissions.editChatLogs ||
      userPermissions.deleteChatLogs,
    "/admin/chat-monitoring":
      userPermissions.accessChatbot ||
      userPermissions.viewChatbotLogs ||
      userPermissions.createChatLogs ||
      userPermissions.editChatLogs ||
      userPermissions.deleteChatLogs,
    "/admin/chatbot":
      userPermissions.accessChatbot ||
      userPermissions.viewChatbotLogs ||
      userPermissions.createChatLogs ||
      userPermissions.editChatLogs ||
      userPermissions.deleteChatLogs,
    "/admin/support-chat":
      userPermissions.manageSupportTickets ||
      userPermissions.respondToInquiries ||
      userPermissions.createSupportTickets ||
      userPermissions.deleteSupportTickets,
    "/admin/support-chatbot":
      userPermissions.manageSupportTickets ||
      userPermissions.respondToInquiries ||
      userPermissions.createSupportTickets ||
      userPermissions.deleteSupportTickets,
    "/admin/customer-requests":
      userPermissions.viewInquiries ||
      userPermissions.createInquiries ||
      userPermissions.respondToInquiries ||
      userPermissions.deleteInquiries,
    "/admin/contact-form":
      userPermissions.viewInquiries ||
      userPermissions.createInquiries ||
      userPermissions.respondToInquiries ||
      userPermissions.deleteInquiries,
    "/admin/promotions":
      userPermissions.viewPromotions ||
      userPermissions.createPromotions ||
      userPermissions.editPromotions ||
      userPermissions.deletePromotions ||
      userPermissions.managePromotions,
    "/admin/payments":
      userPermissions.viewFinancialReports ||
      userPermissions.manageCommission ||
      userPermissions.managePayments,
    "/admin/notifications":
      userPermissions.viewNotifications ||
      userPermissions.createNotifications ||
      userPermissions.editNotifications ||
      userPermissions.deleteNotifications ||
      userPermissions.sendPushNotifications ||
      userPermissions.createPushNotifications,
    "/admin/settings":
      userPermissions.viewSettings ||
      userPermissions.createSettings ||
      userPermissions.editSettings ||
      userPermissions.deleteSettings ||
      userPermissions.managePlatformSettings ||
      userPermissions.manageLogo ||
      userPermissions.manageLanguage ||
      userPermissions.manageCurrency ||
      userPermissions.manageCommission,
    "/admin/activity-log": userPermissions.viewAuditLogs,
    "/admin/account-deletion-requests":
      userPermissions.viewUserProfiles || userPermissions.viewFullUserProfiles,
    "/admin/valuations":
      userPermissions.viewAnalytics ||
      userPermissions.viewFinancialReports ||
      userPermissions.viewListings,
    "/admin/auctions":
      userPermissions.viewAuctions ||
      userPermissions.manageAuctions ||
      userPermissions.viewListings,
  };

  // Check exact path permissions first
  if (Object.prototype.hasOwnProperty.call(PERMISSION_MENU_ACCESS, path)) {
    return Boolean(PERMISSION_MENU_ACCESS[path]);
  }

  // Then check nested paths (e.g. /admin/blogs/:id/edit should inherit /admin/blogs)
  for (const [basePath, allowed] of Object.entries(PERMISSION_MENU_ACCESS)) {
    if (!basePath || basePath.includes(":")) continue;
    if (path.startsWith(`${basePath}/`)) {
      return Boolean(allowed);
    }
  }

  // Fallback to role-based access for backward compatibility
  const allowedPaths = getAllowedMenuPaths(user);

  // Check exact path match
  if (allowedPaths.includes(path)) {
    return true;
  }

  // Check if path starts with any allowed path (for routes with params like /admin/support-chatbot/:chatId)
  for (const allowedPath of allowedPaths) {
    if (path.startsWith(allowedPath + "/") || path === allowedPath) {
      return true;
    }
  }

  return false;
};

// Default export for backward compatibility
export default {
  isSuperAdmin,
  getAllowedMenuPaths,
  canAccessMenu,
};
