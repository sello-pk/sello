import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@redux/config";
import { api } from "./api";
import {
  getAccessToken,
  clearTokens,
  refreshAccessToken,
  shouldRefreshToken,
} from "@utils/tokenRefresh";
import { clearAuthSession } from "@utils/tokenManager.js";

// Track if we're currently refreshing to avoid multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise = null;

export const adminApi = createApi({
  reducerPath: "adminApi",
  // Optimize caching configuration
  keepUnusedDataFor: 60, // Keep unused data for 60 seconds (default is 60)
  refetchOnMountOrArgChange: false, // Don't refetch on mount if data exists
  refetchOnFocus: false, // Don't refetch on window focus
  refetchOnReconnect: true, // Refetch on reconnect
  baseQuery: async (args, api, extraOptions) => {
    try {
      const baseResult = await fetchBaseQuery({
        baseUrl: API_BASE_URL,
        credentials: "include",
        timeout: 300000, // 5 minutes global timeout for all admin requests
        prepareHeaders: (headers, { extra }) => {
          const token = getAccessToken();
          if (token) {
            headers.set("Authorization", `Bearer ${token}`);
          }
          // Don't set Content-Type for FormData - browser will set it automatically with boundary
          // Check if body is FormData
          const body = args?.body || extra?.body;
          if (!(body instanceof FormData)) {
            headers.set("Content-Type", "application/json");
          }
          return headers;
        },
      })(args, api, extraOptions);

      // Handle 401 errors - try to refresh token
      if (baseResult.error && baseResult.error.status === 401) {
        const url = args?.url || "";

        // Try to refresh token (stored in httpOnly cookie) if this isn't an auth endpoint
        if (shouldRefreshToken(401, url)) {
          try {
            // If already refreshing, wait for that promise
            if (isRefreshing && refreshPromise) {
              await refreshPromise;
            } else if (!isRefreshing) {
              // Start refresh process
              isRefreshing = true;
              refreshPromise = refreshAccessToken();

              try {
                await refreshPromise;
              } finally {
                isRefreshing = false;
                refreshPromise = null;
              }
            }

            // Retry original request with new token
            const newToken = getAccessToken();
            if (newToken) {
              return fetchBaseQuery({
                baseUrl: API_BASE_URL,
                credentials: "include",
                prepareHeaders: (headers) => {
                  headers.set("Authorization", `Bearer ${newToken}`);
                  const body = args?.body;
                  if (!(body instanceof FormData)) {
                    headers.set("Content-Type", "application/json");
                  }
                  return headers;
                },
              })(args, api, extraOptions);
            }
          } catch {
            // Refresh failed, clear tokens and let it fall through to 401 handling
            clearTokens();
            localStorage.removeItem("user");
            clearAuthSession();
          }
        }

        // Safely extract error data from backend response (if any)
        const errorData = (baseResult.error && baseResult.error.data) || {};

        // Only clear token for auth-related endpoints
        if (url.includes("/admin/") || url.includes("/auth/")) {
          clearTokens();
          localStorage.removeItem("user");
          clearAuthSession();

          // Return a modified error that components can handle
          baseResult.error = {
            ...baseResult.error,
            data: {
              ...baseResult.error.data,
              message:
                errorData?.message ||
                "Authentication failed. Please login again.",
              shouldRedirect: true,
            },
          };
        }

        // Ensure error message is properly extracted from backend response
        if (
          errorData?.message &&
          (!baseResult.error.data || !baseResult.error.data.message)
        ) {
          baseResult.error.data = {
            ...(baseResult.error.data || {}),
            message: errorData.message,
          };
        }
        // Don't redirect automatically - let components handle it
      }

      // Handle network errors — same actionable copy as main api (uploads often time out)
      if (
        baseResult.error &&
        (baseResult.error.status === "FETCH_ERROR" ||
          baseResult.error.error === "TypeError: Failed to fetch")
      ) {
        const isFormData = args?.body instanceof FormData;
        const message = isFormData
          ? "Upload didn't finish — try smaller files or fewer images, wait a minute, then retry."
          : "Request couldn't complete. Check your connection and try again.";
        return {
          error: {
            status: "FETCH_ERROR",
            data: {
              message,
              code: isFormData ? "UPLOAD_TIMEOUT_OR_NETWORK" : "NETWORK",
              error: baseResult.error.error || "Failed to fetch",
            },
            originalStatus: "FETCH_ERROR",
          },
        };
      }

      return baseResult;
    } catch (error) {
      return {
        error: {
          status: "FETCH_ERROR",
          data: {
            message:
              "Request couldn't complete. If uploading, try smaller files and retry.",
            error: error?.message || "Failed to fetch",
          },
          originalStatus: "FETCH_ERROR",
        },
      };
    }
  },
  tagTypes: [
    "Admin",
    "Users",
    "Cars",
    "Dealers",
    "Categories",
    "Blogs",
    "Notifications",
    "Chats",
    "Analytics",
    "Settings",
    "Promotions",
    "SupportChat",
    "ContactForms",
    "CustomerRequests",
    "Banners",
    "Testimonials",
    "Roles",
    "Invites",
    "SubscriptionPlans",
    "Valuations",
    "Auctions",
  ],
  endpoints: (builder) => ({
    // Dashboard
    getDashboardStats: builder.query({
      query: () => "/admin/dashboard",
      providesTags: ["Admin"],
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => {
        // Handle error responses from backend
        const errorData = response?.data || response;
        return {
          status: response?.status || "FETCH_ERROR",
          data: {
            message: errorData?.message || "Failed to load dashboard data",
            error: errorData?.error,
          },
          originalStatus: response?.status,
        };
      },
    }),

    // Users
    getAllUsers: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/admin/users?${searchParams}`;
      },
      providesTags: ["Users"],
      transformResponse: (response) => response?.data || response,
    }),
    getUserById: builder.query({
      query: (userId) => `/admin/users/${userId}`,
      providesTags: ["Users"],
      transformResponse: (response) => response?.data || response,
    }),
    updateUser: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: `/admin/users/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/admin/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),

    // Listings (Cars)
    getAllListings: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/admin/listings?${searchParams}`;
      },
      providesTags: ["Cars"],
      transformResponse: (response) => response?.data || response,
    }),
    approveCar: builder.mutation({
      query: ({ carId, isApproved, rejectionReason }) => ({
        url: `/admin/listings/${carId}/approve`,
        method: "PUT",
        body: { isApproved, rejectionReason },
      }),
      invalidatesTags: ["Cars"],
    }),
    featureCar: builder.mutation({
      query: ({ carId, featured }) => ({
        url: `/admin/listings/${carId}/feature`,
        method: "PUT",
        body: { featured },
      }),
      invalidatesTags: ["Cars"],
    }),
    deleteCar: builder.mutation({
      query: (carId) => ({
        url: `/admin/listings/${carId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cars"],
    }),
    promoteCar: builder.mutation({
      query: ({ carId, duration = 7, chargeUser = true, priority = 100 }) => ({
        url: `/cars/${carId}/admin-promote`,
        method: "POST",
        body: { duration, chargeUser, priority },
      }),
      invalidatesTags: ["Cars"],
      transformResponse: (response) => response?.data || response,
    }),
    getListingHistory: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/admin/listings/history?${searchParams}`;
      },
      providesTags: ["Cars"],
      transformResponse: (response) => response?.data || response,
    }),
    getAuditLogs: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/admin/audit-logs?${searchParams}`;
      },
      providesTags: ["AuditLogs"],
      transformResponse: (response) => response?.data || response,
    }),

    // Dealers
    getAllDealers: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/admin/dealers?${searchParams}`;
      },
      providesTags: ["Dealers"],
      transformResponse: (response) => response?.data || response,
    }),
    verifyDealer: builder.mutation({
      query: ({ userId, verified }) => ({
        url: `/admin/dealers/${userId}/verify`,
        method: "PUT",
        body: { verified },
      }),
      invalidatesTags: ["Dealers", "Users"], // Also invalidate Users so dealer dashboard refreshes
    }),
    getAuctionAccessRequests: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/admin/auction-access/requests?${searchParams}`;
      },
      providesTags: ["Dealers", "Users"],
      transformResponse: (response) => response?.data || response,
    }),
    reviewAuctionAccessRequest: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: `/admin/auction-access/review/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Dealers", "Users"],
    }),

    // Categories - Cache for longer as it's relatively static data
    getAllCategories: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/categories?${searchParams}`;
      },
      providesTags: ["Categories"],
      transformResponse: (response) => response?.data || response,
      keepUnusedDataFor: 0, // Disable caching to ensure fresh list after adds
    }),
    createCategory: builder.mutation({
      query: (data) => {
        // If data is FormData, don't set Content-Type (browser will set it with boundary)
        const isFormData = data instanceof FormData;
        return {
          url: "/categories",
          method: "POST",
          body: data,
          ...(isFormData
            ? {}
            : { headers: { "Content-Type": "application/json" } }),
        };
      },
      invalidatesTags: ["Categories"],
    }),
    updateCategory: builder.mutation({
      query: ({ categoryId, data }) => {
        // If data is FormData, don't set Content-Type (browser will set it with boundary)
        const isFormData = data instanceof FormData;
        return {
          url: `/categories/${categoryId}`,
          method: "PUT",
          body: data,
          ...(isFormData
            ? {}
            : { headers: { "Content-Type": "application/json" } }),
        };
      },
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: builder.mutation({
      query: (categoryId) => ({
        url: `/categories/${categoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories"],
    }),

    // Blogs
    getAllBlogs: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/blogs?${searchParams}`;
      },
      providesTags: ["Blogs"],
      transformResponse: (response) => response?.data || response,
      // Refetch when component mounts or args change to ensure fresh data
      refetchOnMountOrArgChange: true,
    }),
    createBlog: builder.mutation({
      query: (formData) => ({
        url: "/blogs",
        method: "POST",
        body: formData,
        timeout: 300000, // 5 minutes timeout for blog creation with images
      }),
      invalidatesTags: ["Blogs"], // Invalidate admin cache
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Manually invalidate public API cache for blogs - this ensures client-side blog pages refresh immediately
          dispatch(api.util.invalidateTags(["Blog"]));
        } catch {
          // Error handling is done by the mutation itself
        }
      },
      transformResponse: (response) => response?.data || response,
    }),
    updateBlog: builder.mutation({
      query: ({ blogId, formData }) => ({
        url: `/blogs/${blogId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Blogs"], // Invalidate admin cache
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Manually invalidate public API cache for blogs - this ensures client-side blog pages refresh immediately
          dispatch(api.util.invalidateTags(["Blog"]));
        } catch {
          // Error handling is done by the mutation itself
        }
      },
      transformResponse: (response) => response?.data || response,
    }),
    deleteBlog: builder.mutation({
      query: (blogId) => ({
        url: `/blogs/${blogId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blogs"], // Invalidate admin cache
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Manually invalidate public API cache for blogs using store
          dispatch(api.util.invalidateTags(["Blog"]));
        } catch {
          // Error handling is done by the mutation itself
        }
      },
      transformResponse: (response) => response?.data || response,
    }),

    // Notifications
    getAllNotifications: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/notifications?${searchParams}`;
      },
      providesTags: ["Notifications"],
      transformResponse: (response) => response?.data || response,
    }),
    createNotification: builder.mutation({
      query: (data) => ({
        url: "/notifications",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Notifications"],
    }),
    deleteNotification: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications"],
    }),

    // Chat Monitoring
    getAllChats: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/chat?${searchParams}`;
      },
      providesTags: ["Chats"],
      transformResponse: (response) => response?.data || response,
    }),
    getChatMessages: builder.query({
      query: ({ chatId, ...params }) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/chat/${chatId}/messages?${searchParams}`;
      },
      providesTags: ["Chats"],
      transformResponse: (response) => response?.data || response,
    }),
    getChatStatistics: builder.query({
      query: () => "/chat/statistics",
      providesTags: ["Chats"],
      transformResponse: (response) => response?.data || response,
    }),
    getAllMessages: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/chat/messages/all?${searchParams}`;
      },
      providesTags: ["Chats"],
      transformResponse: (response) => response?.data || response,
    }),
    sendChatMessage: builder.mutation({
      query: ({ chatId, message }) => ({
        url: `/chat/${chatId}/messages`,
        method: "POST",
        body: { message },
      }),
      invalidatesTags: ["Chats"],
    }),
    deleteChatMessage: builder.mutation({
      query: (messageId) => ({
        url: `/chat/messages/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chats"],
    }),
    editChatMessage: builder.mutation({
      query: ({ messageId, message }) => ({
        url: `/chat/messages/${messageId}`,
        method: "PUT",
        body: { message },
      }),
      invalidatesTags: ["Chats"],
    }),

    // Analytics
    getAnalytics: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/admin/analytics/summary${searchParams ? `?${searchParams}` : ""}`;
      },
      providesTags: ["Analytics"],
      transformResponse: (response) => response?.data || response,
    }),

    // Promotions
    getAllPromotions: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/billing/promotions?${searchParams}`;
      },
      providesTags: ["Promotions"],
      transformResponse: (response) => response?.data || response,
    }),
    getPromotionById: builder.query({
      query: (promotionId) => `/billing/promotions/${promotionId}`,
      providesTags: ["Promotions"],
      transformResponse: (response) => response?.data || response,
    }),
    createPromotion: builder.mutation({
      query: (data) => ({
        url: "/billing/promotions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Promotions"],
    }),
    updatePromotion: builder.mutation({
      query: ({ promotionId, ...data }) => ({
        url: `/billing/promotions/${promotionId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Promotions"],
    }),
    deletePromotion: builder.mutation({
      query: (promotionId) => ({
        url: `/billing/promotions/${promotionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Promotions"],
    }),
    getPromotionStats: builder.query({
      query: () => "/billing/promotions/statistics",
      providesTags: ["Promotions"],
      transformResponse: (response) => response?.data || response,
    }),

    // Settings
    // Settings APIs (no longer used in UI, kept for backwards compatibility)

    // Chatbot
    getChatbotConfig: builder.query({
      query: () => "/chatbot/config",
      providesTags: ["Settings"],
      transformResponse: (response) => response?.data || response,
    }),
    updateChatbotConfig: builder.mutation({
      query: (data) => ({
        url: "/chatbot/config",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),
    getChatbotStats: builder.query({
      query: () => "/chatbot/statistics",
      providesTags: ["Settings"],
      transformResponse: (response) => response?.data || response,
    }),
    getQuickReplies: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/chatbot/quick-replies?${searchParams}`;
      },
      providesTags: ["Settings"],
      transformResponse: (response) => response?.data || response,
    }),
    createQuickReply: builder.mutation({
      query: (data) => ({
        url: "/chatbot/quick-replies",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),
    updateQuickReply: builder.mutation({
      query: ({ replyId, ...data }) => ({
        url: `/chatbot/quick-replies/${replyId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),
    deleteQuickReply: builder.mutation({
      query: (replyId) => ({
        url: `/chatbot/quick-replies/${replyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Settings"],
    }),
    useQuickReply: builder.mutation({
      query: (replyId) => ({
        url: `/chatbot/quick-replies/${replyId}/use`,
        method: "POST",
      }),
      invalidatesTags: ["Settings"],
    }),

    // Support Chat (Admin)
    getAllSupportChats: builder.query({
      query: (params = {}) => {
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined)
        );
        const searchParams = new URLSearchParams(cleanParams).toString();
        return `/support-chat/admin?${searchParams}`;
      },
      providesTags: ["SupportChat"],
      transformResponse: (response) => {
        return response?.data || response;
      },
    }),
    getSupportChatMessagesAdmin: builder.query({
      query: (chatId) => `/support-chat/${chatId}/messages`,
      providesTags: ["SupportChat"],
      transformResponse: (response) => {
        // Handle response format: { success, message, data: [...] }
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        // If already an array, return as is
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      },
    }),
    sendAdminResponse: builder.mutation({
      query: ({ chatId, message }) => ({
        url: `/support-chat/${chatId}/admin-response`,
        method: "POST",
        body: { message },
      }),
      invalidatesTags: ["SupportChat"],
    }),
    updateSupportChatStatus: builder.mutation({
      query: ({ chatId, status, priority }) => ({
        url: `/support-chat/${chatId}/status`,
        method: "PUT",
        body: { status, priority },
      }),
      invalidatesTags: ["SupportChat"],
    }),

    // Contact Forms
    getAllContactForms: builder.query({
      query: (params = {}) => {
        // Remove undefined values
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(
            ([, v]) => v !== undefined && v !== null && v !== ""
          )
        );
        const searchParams = new URLSearchParams(cleanParams).toString();
        return `/contact-form${searchParams ? `?${searchParams}` : ""}`;
      },
      providesTags: ["ContactForms"],
      transformResponse: (response) => {
        // Backend returns: { success: true, data: { contactForms: [...], pagination: {...} } }
        // Return the data object directly so contactForms and pagination are accessible
        if (response && response.data) {
          return response.data;
        }
        // Fallback: if response is already the data object
        return response;
      },
    }),
    getContactFormById: builder.query({
      query: (id) => `/contact-form/${id}`,
      providesTags: ["ContactForms"],
      transformResponse: (response) => response?.data || response,
    }),
    convertToChat: builder.mutation({
      query: (id) => ({
        url: `/contact-form/${id}/convert-to-chat`,
        method: "POST",
      }),
      invalidatesTags: ["ContactForms", "SupportChat"],
    }),
    updateContactFormStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/contact-form/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["ContactForms"],
    }),
    deleteContactForm: builder.mutation({
      query: (id) => ({
        url: `/contact-form/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ContactForms"],
    }),

    // Customer Requests
    getAllCustomerRequests: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/customer-requests?${searchParams}`;
      },
      providesTags: ["CustomerRequests"],
      transformResponse: (response) => response?.data || response,
    }),
    getCustomerRequestById: builder.query({
      query: (requestId) => `/customer-requests/${requestId}`,
      providesTags: ["CustomerRequests"],
      transformResponse: (response) => response?.data || response,
    }),
    getCustomerRequestStatistics: builder.query({
      query: () => "/customer-requests/statistics",
      providesTags: ["CustomerRequests"],
      transformResponse: (response) => response?.data || response,
    }),
    updateCustomerRequest: builder.mutation({
      query: ({ requestId, ...data }) => ({
        url: `/customer-requests/${requestId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CustomerRequests"],
    }),
    addCustomerRequestResponse: builder.mutation({
      query: ({ requestId, message }) => ({
        url: `/customer-requests/${requestId}/response`,
        method: "POST",
        body: { message },
      }),
      invalidatesTags: ["CustomerRequests"],
    }),
    deleteCustomerRequest: builder.mutation({
      query: (requestId) => ({
        url: `/customer-requests/${requestId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CustomerRequests"],
    }),

    // Banners
    getAllBanners: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/banners?${searchParams}`;
      },
      providesTags: ["Banners"],
      transformResponse: (response) => response?.data || response,
    }),
    getBannerById: builder.query({
      query: (bannerId) => `/banners/${bannerId}`,
      providesTags: ["Banners"],
      transformResponse: (response) => response?.data || response,
    }),
    createBanner: builder.mutation({
      query: (formData) => ({
        url: "/banners",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Banners"], // Will also invalidate public API cache
    }),
    updateBanner: builder.mutation({
      query: ({ bannerId, formData }) => ({
        url: `/banners/${bannerId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Banners"], // Will also invalidate public API cache
    }),
    deleteBanner: builder.mutation({
      query: (bannerId) => ({
        url: `/banners/${bannerId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Banners"], // Will also invalidate public API cache
    }),

    // Comments
    getBlogCommentsAdmin: builder.query({
      query: (blogId) => `/blogs/${blogId}/comments`, // Public endpoint lists approved, admin needs all? Wait, we made a specific admin route
    }),
    getAllComments: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/blogs/comments/all?${searchParams}`;
      },
      providesTags: ["Comments"],
      transformResponse: (response) => response?.data || response,
    }),
    updateCommentStatus: builder.mutation({
      query: ({ commentId, status }) => ({
        url: `/blogs/comments/${commentId}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Comments", "Blog"],
    }),
    deleteComment: builder.mutation({
      query: (commentId) => ({
        url: `/blogs/comments/${commentId}/admin`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comments", "Blog"],
    }),

    // Blog Analytics
    getBlogAnalytics: builder.query({
      query: ({ blogId, days = 30 }) =>
        `/blogs/${blogId}/analytics?days=${days}`,
    }),

    // Testimonials
    getAllTestimonials: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/testimonials?${searchParams}`;
      },
      providesTags: ["Testimonials"],
      transformResponse: (response) => response?.data || response,
    }),
    getTestimonialById: builder.query({
      query: (testimonialId) => `/testimonials/${testimonialId}`,
      providesTags: ["Testimonials"],
      transformResponse: (response) => response?.data || response,
    }),
    createTestimonial: builder.mutation({
      query: (formData) => ({
        url: "/testimonials/admin",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Testimonials", "Testimonial"], // Invalidate both admin and public cache
    }),
    updateTestimonial: builder.mutation({
      query: ({ testimonialId, formData }) => ({
        url: `/testimonials/${testimonialId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Testimonials", "Testimonial"], // Invalidate both admin and public cache
    }),
    deleteTestimonial: builder.mutation({
      query: (testimonialId) => ({
        url: `/testimonials/${testimonialId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Testimonials", "Testimonial"], // Invalidate both admin and public cache
    }),

    // Roles & Permissions
    getAllRoles: builder.query({
      query: () => "/roles",
      providesTags: ["Roles"],
      transformResponse: (response) => response?.data || response,
      keepUnusedDataFor: 60, // Cache roles for 1 minute (reduced from 5 minutes)
    }),
    getRoleById: builder.query({
      query: (roleId) => `/roles/${roleId}`,
      providesTags: ["Roles"],
      transformResponse: (response) => response?.data || response,
    }),
    createRole: builder.mutation({
      query: (data) => ({
        url: "/roles",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Roles"],
    }),
    updateRole: builder.mutation({
      query: ({ roleId, ...data }) => ({
        url: `/roles/${roleId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Roles"],
    }),
    deleteRole: builder.mutation({
      query: (roleId) => ({
        url: `/roles/${roleId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Roles"],
      // Force refetch after deletion
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          // Force immediate refetch
          dispatch(adminApi.util.invalidateTags(["Roles"]));
        } catch (error) {
          console.error("Delete role error:", error);
        }
      },
    }),
    getPermissionMatrix: builder.query({
      query: () => "/roles/matrix",
      providesTags: ["Roles"],
      transformResponse: (response) => response?.data || response,
    }),
    inviteUser: builder.mutation({
      query: (data) => ({
        url: "/roles/invite",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Invites", "Users"],
    }),
    getAllInvites: builder.query({
      query: () => "/roles/invites/all",
      providesTags: ["Invites"],
      transformResponse: (response) => response?.data || response,
    }),
    // Public invite endpoints (no auth required)
    getInviteByToken: builder.query({
      query: (token) => `/roles/invite/${token}`,
      transformResponse: (response) => response?.data || response,
    }),
    acceptInvite: builder.mutation({
      query: ({ token, password }) => ({
        url: `/roles/invite/${token}/accept`,
        method: "POST",
        body: { password },
      }),
      transformResponse: (response) => {
        // Server returns: { success, message, data: { user, token, accessToken, refreshToken } }
        // Refresh token is stored in httpOnly cookie; just return data
        if (response?.data) {
          return response.data;
        }
        return response;
      },
    }),

    // Payment Management
    getAllPayments: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/billing/admin/payments?${searchParams}`;
      },
      providesTags: ["Payments"],
      transformResponse: (response) => response?.data || response,
    }),
    getAllSubscriptions: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/billing/admin/subscriptions?${searchParams}`;
      },
      providesTags: ["Subscriptions"],
      transformResponse: (response) => response?.data || response,
    }),
    adminUpdateSubscription: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: `/billing/admin/subscriptions/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Subscriptions", "Users"],
      transformResponse: (response) => response?.data || response,
    }),
    adminCancelSubscription: builder.mutation({
      query: (userId) => ({
        url: `/billing/admin/subscriptions/${userId}`,
        method: "PUT",
        body: { isActive: false },
      }),
      invalidatesTags: ["Subscriptions", "Users"],
      transformResponse: (response) => response?.data || response,
    }),

    // Subscription Plans Management
    getAllSubscriptionPlans: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/billing/subscription-plans?${searchParams}`;
      },
      providesTags: ["SubscriptionPlans"],
      transformResponse: (response) => response?.data || response,
      keepUnusedDataFor: 300, // Cache subscription plans for 5 minutes (relatively static)
    }),
    getSubscriptionPlanById: builder.query({
      query: (planId) => `/billing/subscription-plans/${planId}`,
      providesTags: ["SubscriptionPlans"],
      transformResponse: (response) => response?.data || response,
    }),
    createSubscriptionPlan: builder.mutation({
      query: (data) => ({
        url: "/billing/subscription-plans",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SubscriptionPlans"],
    }),
    updateSubscriptionPlan: builder.mutation({
      query: ({ planId, ...data }) => ({
        url: `/billing/subscription-plans/${planId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["SubscriptionPlans"],
    }),
    deleteSubscriptionPlan: builder.mutation({
      query: (planId) => ({
        url: `/billing/subscription-plans/${planId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SubscriptionPlans"],
    }),
    toggleSubscriptionPlanStatus: builder.mutation({
      query: (planId) => ({
        url: `/billing/subscription-plans/${planId}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: ["SubscriptionPlans"],
    }),

    // Account Deletion Requests Management
    getAllDeletionRequests: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/account-deletion/admin/all?${searchParams}`;
      },
      providesTags: ["DeletionRequests"],
      transformResponse: (response) => response?.data || response,
    }),
    getDeletionRequestStats: builder.query({
      query: () => "/account-deletion/admin/stats",
      providesTags: ["DeletionRequests"],
      transformResponse: (response) => response?.data || response,
    }),
    reviewDeletionRequest: builder.mutation({
      query: ({ requestId, ...data }) => ({
        url: `/account-deletion/admin/review/${requestId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["DeletionRequests", "Users"],
      transformResponse: (response) => response?.data || response,
    }),

    // Valuation Management
    getAllValuationsAdmin: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `/valuations/admin/all?${searchParams}`;
      },
      providesTags: ["Valuations"],
      transformResponse: (response) => response?.data || response,
    }),
    deleteValuationAdmin: builder.mutation({
      query: (id) => ({
        url: `/valuations/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Valuations"],
    }),

    // ═══════════════════════════ Admin Auction Endpoints ═══════════════════

    getAuctionDashboard: builder.query({
      query: () => "/auctions/admin/dashboard",
      providesTags: ["Auctions"],
      transformResponse: (response) => response?.data || response,
    }),
    adminCreateAuction: builder.mutation({
      query: (data) => ({
        url: "/auctions/admin/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auctions"],
    }),
    adminUpdateAuction: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/auctions/admin/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Auctions"],
    }),
    adminGoLive: builder.mutation({
      query: (id) => ({
        url: `/auctions/admin/${id}/go-live`,
        method: "PUT",
      }),
      invalidatesTags: ["Auctions"],
    }),
    adminEndAuction: builder.mutation({
      query: (id) => ({
        url: `/auctions/admin/${id}/end`,
        method: "PUT",
      }),
      invalidatesTags: ["Auctions"],
    }),
    adminCancelAuction: builder.mutation({
      query: (id) => ({
        url: `/auctions/admin/${id}/cancel`,
        method: "PUT",
      }),
      invalidatesTags: ["Auctions"],
    }),
    adminApproveAuctionCar: builder.mutation({
      query: (id) => ({
        url: `/auctions/admin/car/${id}/approve`,
        method: "PUT",
      }),
      invalidatesTags: ["Auctions"],
    }),
    adminRejectAuctionCar: builder.mutation({
      query: (id) => ({
        url: `/auctions/admin/car/${id}/reject`,
        method: "PUT",
      }),
      invalidatesTags: ["Auctions"],
    }),
    adminPlaceOfflineBid: builder.mutation({
      query: (data) => ({
        url: "/auctions/admin/offline-bid",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auctions"],
    }),
    adminGetAllTokenPayments: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.append("status", params.status);
        return `/auctions/admin/token-payments?${searchParams.toString()}`;
      },
      providesTags: ["Auctions"],
      transformResponse: (response) => response?.data || response,
    }),
    adminVerifyTokenPayment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/auctions/admin/token-payments/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Auctions"],
    }),
    adminGetAllAuctionCars: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.auctionId) searchParams.append("auctionId", params.auctionId);
        if (params.status) searchParams.append("status", params.status);
        return `/auctions/admin/cars?${searchParams.toString()}`;
      },
      providesTags: ["Auctions"],
      transformResponse: (response) => response?.data || response,
    }),
    adminUpdateInspection: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/auctions/admin/car/${id}/inspection`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Auctions"],
    }),
    adminAddCarToAuction: builder.mutation({
      query: (data) => ({
        url: "/auctions/admin/add-car",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auctions"],
    }),
    adminUpdateAuctionCar: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/auctions/admin/car/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Auctions"],
    }),
    adminDeleteAuctionCar: builder.mutation({
      query: (id) => ({
        url: `/auctions/admin/car/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Auctions"],
    }),
    adminGetAllEscrows: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.append("status", params.status);
        if (params.overdue) searchParams.append("overdue", params.overdue);
        return `/auctions/admin/escrows?${searchParams.toString()}`;
      },
      providesTags: ["Auctions"],
      transformResponse: (response) => response?.data || response,
    }),
    adminUpdateEscrowStatus: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/auctions/admin/escrow/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Auctions"],
    }),
    adminRefundToken: builder.mutation({
      query: (id) => ({
        url: `/auctions/admin/token-refund/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Auctions"],
    }),
    adminBulkRefundTokens: builder.mutation({
      query: (data) => ({
        url: "/auctions/admin/bulk-refund",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auctions"],
    }),
    getPaymentStats: builder.query({
      query: () => "/auctions/admin/payment-stats",
      providesTags: ["Auctions"],
      transformResponse: (response) => response?.data || response,
    }),
    getAuctionSettings: builder.query({
      query: () => "/auctions/admin/auction-settings",
      providesTags: ["Auctions"],
      transformResponse: (response) => response?.data || response,
    }),
    updateAuctionSettings: builder.mutation({
      query: (body) => ({
        url: "/auctions/admin/auction-settings",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Auctions"],
    }),
    getInspectionBookings: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.append("status", params.status);
        if (params.from) searchParams.append("from", params.from);
        if (params.to) searchParams.append("to", params.to);
        return `/admin/inspection-bookings?${searchParams.toString()}`;
      },
      providesTags: ["Auctions"],
      transformResponse: (response) => response?.data || response,
    }),
    updateInspectionBooking: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/inspection-bookings/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Auctions"],
    }),
    getAuctionExtensions: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.auctionId) searchParams.append("auctionId", params.auctionId);
        return `/auctions/admin/auction-extensions?${searchParams.toString()}`;
      },
      providesTags: ["Auctions"],
      transformResponse: (response) => response?.data || response,
    }),
    getSecurityEvents: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.resolved) searchParams.append("resolved", params.resolved);
        if (params.type) searchParams.append("type", params.type);
        if (params.limit) searchParams.append("limit", params.limit);
        return `/auctions/admin/security-events?${searchParams.toString()}`;
      },
      providesTags: ["Auctions"],
      transformResponse: (response) => response?.data || response,
    }),

    // ═══════════════════════════ Admin Payment/Wallet Endpoints ═══════════════
    adminGetAllWallets: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append("page", params.page);
        if (params.limit) searchParams.append("limit", params.limit);
        return `/payments/admin/wallets?${searchParams.toString()}`;
      },
      providesTags: ["Auctions"],
      transformResponse: (response) => response?.data || response,
    }),
    adminUpdateWalletBalance: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: `/payments/admin/wallet/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Auctions"],
    }),
    adminGetAllDeposits: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.append("status", params.status);
        return `/payments/admin/deposits?${searchParams.toString()}`;
      },
      providesTags: ["Auctions"],
      transformResponse: (response) => response?.data || response,
    }),
    adminProcessDeposit: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/payments/admin/deposit/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Auctions"],
    }),
    adminGetAllRefunds: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.append("status", params.status);
        return `/payments/admin/refunds?${searchParams.toString()}`;
      },
      providesTags: ["Auctions"],
      transformResponse: (response) => response?.data || response,
    }),
    adminProcessRefund: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/payments/admin/refund/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Auctions"],
    }),
    adminGetPlatformSettings: builder.query({
      query: () => "/payments/admin/settings",
      providesTags: ["Auctions"],
      transformResponse: (response) => response?.data || response,
    }),
    adminUpdatePlatformSettings: builder.mutation({
      query: (data) => ({
        url: "/payments/admin/settings",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Auctions"],
    }),
    adminGetAuditLog: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append("page", params.page);
        if (params.limit) searchParams.append("limit", params.limit);
        if (params.type) searchParams.append("type", params.type);
        if (params.userId) searchParams.append("userId", params.userId);
        return `/payments/admin/audit-log?${searchParams.toString()}`;
      },
      providesTags: ["Auctions"],
      transformResponse: (response) => response?.data || response,
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetAllListingsQuery,
  useApproveCarMutation,
  useFeatureCarMutation,
  useDeleteCarMutation,
  usePromoteCarMutation,
  useGetAllDealersQuery,
  useVerifyDealerMutation,
  useGetAuctionAccessRequestsQuery,
  useReviewAuctionAccessRequestMutation,
  useGetAuditLogsQuery,
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAllBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useGetBlogCommentsAdminQuery,
  useGetAllCommentsQuery,
  useUpdateCommentStatusMutation,
  useDeleteCommentMutation,
  useGetBlogAnalyticsQuery,
  useGetAllNotificationsQuery,
  useCreateNotificationMutation,
  useDeleteNotificationMutation,
  useGetAllChatsQuery,
  useGetChatMessagesQuery,
  useGetChatStatisticsQuery,
  useGetAllMessagesQuery,
  useSendChatMessageMutation,
  useDeleteChatMessageMutation,
  useEditChatMessageMutation,
  useGetAnalyticsQuery,
  useGetAllPromotionsQuery,
  useGetPromotionByIdQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
  useGetPromotionStatsQuery,
  // settings hooks removed (page deleted)
  useGetChatbotConfigQuery,
  useUpdateChatbotConfigMutation,
  useGetChatbotStatsQuery,
  useGetQuickRepliesQuery,
  useCreateQuickReplyMutation,
  useUpdateQuickReplyMutation,
  useDeleteQuickReplyMutation,
  useUseQuickReplyMutation,
  useGetAllSupportChatsQuery,
  useGetSupportChatMessagesAdminQuery,
  useSendAdminResponseMutation,
  useUpdateSupportChatStatusMutation,
  useGetAllContactFormsQuery,
  useGetContactFormByIdQuery,
  useConvertToChatMutation,
  useUpdateContactFormStatusMutation,
  useDeleteContactFormMutation,
  useGetAllCustomerRequestsQuery,
  useGetCustomerRequestByIdQuery,
  useGetCustomerRequestStatisticsQuery,
  useUpdateCustomerRequestMutation,
  useAddCustomerRequestResponseMutation,
  useDeleteCustomerRequestMutation,
  useGetAllBannersQuery,
  useGetBannerByIdQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useGetAllTestimonialsQuery,
  useGetTestimonialByIdQuery,
  useCreateTestimonialMutation,
  useUpdateTestimonialMutation,
  useDeleteTestimonialMutation,
  useGetAllRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetPermissionMatrixQuery,
  useInviteUserMutation,
  useGetAllInvitesQuery,
  useGetInviteByTokenQuery,
  useAcceptInviteMutation,
  useGetAllPaymentsQuery,
  useGetAllSubscriptionsQuery,
  useAdminUpdateSubscriptionMutation,
  useAdminCancelSubscriptionMutation,
  useGetAllSubscriptionPlansQuery,
  useGetSubscriptionPlanByIdQuery,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
  useToggleSubscriptionPlanStatusMutation,
  useGetAllDeletionRequestsQuery,
  useGetDeletionRequestStatsQuery,
  useReviewDeletionRequestMutation,
  useGetAllValuationsAdminQuery,
  useDeleteValuationAdminMutation,
  useGetAuctionDashboardQuery,
  useAdminCreateAuctionMutation,
  useAdminUpdateAuctionMutation,
  useAdminGoLiveMutation,
  useAdminEndAuctionMutation,
  useAdminCancelAuctionMutation,
  useAdminApproveAuctionCarMutation,
  useAdminRejectAuctionCarMutation,
  useAdminPlaceOfflineBidMutation,
  useAdminGetAllTokenPaymentsQuery,
  useAdminVerifyTokenPaymentMutation,
  useAdminGetAllAuctionCarsQuery,
  useAdminUpdateAuctionCarMutation,
  useAdminDeleteAuctionCarMutation,
  useAdminUpdateInspectionMutation,
  useAdminAddCarToAuctionMutation,
  useAdminGetAllEscrowsQuery,
  useAdminUpdateEscrowStatusMutation,
  useAdminRefundTokenMutation,
  useAdminBulkRefundTokensMutation,
  useGetPaymentStatsQuery,
  useGetAuctionSettingsQuery,
  useUpdateAuctionSettingsMutation,
  useGetInspectionBookingsQuery,
  useUpdateInspectionBookingMutation,
  useGetAuctionExtensionsQuery,
  useGetSecurityEventsQuery,
  useAdminGetAllWalletsQuery,
  useAdminUpdateWalletBalanceMutation,
  useAdminGetAllDepositsQuery,
  useAdminProcessDepositMutation,
  useAdminGetAllRefundsQuery,
  useAdminProcessRefundMutation,
  useAdminGetPlatformSettingsQuery,
  useAdminUpdatePlatformSettingsMutation,
  useAdminGetAuditLogQuery,
} = adminApi;
