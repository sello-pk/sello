import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  getAccessToken,
  setAccessToken,
  clearTokens,
  refreshAccessToken,
  shouldRefreshToken,
} from "@utils/tokenRefresh";
import { logger } from "@utils/logger";
import { API_BASE_URL } from "@redux/config";

// Track if we're currently refreshing to avoid multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise = null;

export const api = createApi({
  reducerPath: "api",
  // Optimize caching configuration
  keepUnusedDataFor: 5, // Reduced cache time for better navigation responsiveness
  refetchOnMountOrArgChange: true, // Refetch on mount or arg change for proper navigation
  refetchOnFocus: false, // Don't refetch on window focus
  refetchOnReconnect: true, // Refetch on reconnect
  baseQuery: async (args, api, extraOptions) => {
    try {
      const baseResult = await fetchBaseQuery({
        baseUrl: API_BASE_URL,
        credentials: "include",
        prepareHeaders: (headers, { extra, endpoint }) => {
          const token = getAccessToken();
          if (token) {
            headers.set("Authorization", `Bearer ${token}`);
          }
          // Don't set Content-Type for FormData - browser will set it with boundary
          // Check if body is FormData instance
          if (!(args?.body instanceof FormData)) {
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
              // Retry the original request with the new access token
              return fetchBaseQuery({
                baseUrl: API_BASE_URL,
                credentials: "include",
                prepareHeaders: (headers) => {
                  headers.set("Authorization", `Bearer ${newToken}`);
                  if (!(args?.body instanceof FormData)) {
                    headers.set("Content-Type", "application/json");
                  }
                  return headers;
                },
              })(args, api, extraOptions);
            } else {
              // Token refresh succeeded but no new token received - clear and fail
              clearTokens();
              localStorage.removeItem("user");
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and let it fall through to 401 handling
            clearTokens();
            localStorage.removeItem("user");
          }
        }

        // If refresh failed or no refresh token, clear tokens
        if (url.includes("/users/me") || url.includes("/auth/")) {
          clearTokens();
          localStorage.removeItem("user");
        }
        // Don't redirect automatically - let components handle it
      }

      // Handle network errors (Failed to fetch)
      if (
        baseResult.error &&
        (baseResult.error.status === "FETCH_ERROR" ||
          baseResult.error.error === "TypeError: Failed to fetch")
      ) {
        return {
          error: {
            status: "FETCH_ERROR",
            data: {
              message:
                "Unable to connect to server. Please check if the server is running and try again.",
              error: "Network error - Failed to fetch",
            },
            originalStatus: "FETCH_ERROR",
          },
        };
      }

      return baseResult;
    } catch (error) {
      // API request error
      return {
        error: {
          status: "FETCH_ERROR",
          data: {
            message:
              error.message ||
              "Network error. Please check your connection and try again.",
            error: "Failed to fetch",
          },
          originalStatus: "FETCH_ERROR",
        },
      };
    }
  },
  tagTypes: [
    "User",
    "SupportChat",
    "CarChat",
    "Notification",
    "Blog",
    "Testimonial",
    "Cars",
    "Boost",
  ],
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
      transformResponse: (response) => {
        // Backend format: { success, message, data: { user, token, accessToken, refreshToken } }
        if (response?.data) {
          // Access token will be stored explicitly where needed; refresh token is in httpOnly cookie
          return {
            message: response.message,
            user: response.data.user,
            token: response.data.token || response.data.accessToken,
            accessToken: response.data.accessToken,
          };
        }
        return response;
      },
    }),
    loginUser: builder.mutation({
      query: (userData) => ({
        url: "/auth/login",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
      transformResponse: (response) => {
        // Backend format: { success, message, data: { user, token, accessToken, refreshToken } }
        if (response?.data?.user) {
          return {
            token: response.data.token || response.data.accessToken,
            accessToken: response.data.accessToken,
            user: response.data.user,
          };
        }
        // Fallback for old format
        if (response?.token && response?.user) {
          return {
            token: response.token,
            user: response.user,
          };
        }
        return response;
      },
    }),
    googleLogin: builder.mutation({
      query: (token) => {
        if (!token || typeof token !== "string") {
          throw new Error("Invalid Google token provided");
        }
        return {
          url: "/auth/google",
          method: "POST",
          body: { token: token },
        };
      },
      invalidatesTags: ["User"],
      transformResponse: (response) => {
        // Backend format: { success, message, data: { user, token, accessToken, refreshToken } }
        if (response?.data?.user) {
          return {
            token: response.data.token || response.data.accessToken,
            accessToken: response.data.accessToken,
            user: response.data.user,
            message: response.message,
          };
        }
        // Fallback for old format
        if (response?.token && response?.user) {
          return {
            token: response.token,
            user: response.user,
            message: response.message,
          };
        }
        // If response structure is unexpected, return as is
        // Unexpected Google login response structure
        return response;
      },
      transformErrorResponse: (response, meta, arg) => {
        // Backend error format: { success: false, message: "...", error: "..." }
        // RTK Query wraps it in response.data
        const errorData = response?.data || response;

        // Return a consistent error structure
        return {
          status: response?.status || "FETCH_ERROR",
          data: {
            message:
              errorData?.message ||
              errorData?.error ||
              "Google login failed. Please try again.",
            error: errorData?.error,
            success: false,
          },
          originalStatus: response?.status,
        };
      },
    }),
    forgotPassword: builder.mutation({
      query: (emailData) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: emailData,
      }),
    }),
    verifyOTP: builder.mutation({
      query: (data) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: data, // Send email and otp in body
      }),
    }),
    resendOTP: builder.mutation({
      query: (emailData) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body: emailData,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data, // Send email and password in body
      }),
    }),
    getMe: builder.query({
      query: () => ({
        url: "/users/me",
        method: "GET",
      }),
      providesTags: ["User"],
      transformResponse: (response) => {
        // Backend format: { success: true, data: { user object } }
        if (response?.data) {
          return response.data;
        }
        // Fallback if response is already the user object
        return response;
      },
      transformErrorResponse: (response, meta, arg) => {
        // Handle error responses
        const errorData = response?.data || response;
        return {
          status: response?.status || "FETCH_ERROR",
          data: {
            message: errorData?.message || "Failed to fetch user data",
            error: errorData?.error,
          },
          originalStatus: response?.status,
        };
      },
    }),
    updateProfile: builder.mutation({
      query: (formData) => ({
        url: "/users/profile",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["User"],
      transformResponse: (response) => {
        return response?.data || response;
      },
    }),
    updateDealerProfile: builder.mutation({
      query: (formData) => ({
        url: "/users/dealer-profile",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["User"],
      transformResponse: (response) => {
        return response?.data || response;
      },
    }),
    requestSeller: builder.mutation({
      query: () => ({
        url: "/users/request-seller",
        method: "POST",
      }),
      invalidatesTags: ["User"],
      transformResponse: (response) => response?.data || response,
    }),
    requestDealer: builder.mutation({
      query: (dealerData) => ({
        url: "/users/request-dealer",
        method: "POST",
        body: dealerData,
      }),
      invalidatesTags: ["User"],
      transformResponse: (response) => response?.data || response,
    }),
    // Save/Unsave Car (Wishlist)
    saveCar: builder.mutation({
      query: (carId) => ({
        url: `/users/save-car/${carId}`,
        method: "POST",
      }),
      invalidatesTags: ["User", "Cars"],
      transformResponse: (response) => response?.data || response,
    }),
    unsaveCar: builder.mutation({
      query: (carId) => ({
        url: `/users/unsave-car/${carId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User", "Cars"],
      transformResponse: (response) => response?.data || response,
    }),
    getSavedCars: builder.query({
      query: () => ({
        url: "/users/saved-cars",
        method: "GET",
      }),
      providesTags: ["User"],
      transformResponse: (response) => response?.data || response,
    }),
    logout: builder.mutation({
      query: () => {
        return {
          url: "/auth/logout",
          method: "POST",
          // Refresh token is read server-side from httpOnly cookie
          body: {},
        };
      },
      invalidatesTags: ["User"],
      transformResponse: () => {
        // Clear tokens on successful logout
        clearTokens();
        return { success: true };
      },
    }),

    getCars: builder.query({
      query: ({ page = 1, limit = 12, condition, search } = {}) => {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        // Only add condition if it's explicitly 'new' or 'used' (not empty string or undefined)
        if (condition && (condition === "new" || condition === "used")) {
          params.append("condition", condition);
        }

        // Add search term if provided
        if (search) {
          params.append("search", search);
        }

        return {
          url: `/cars?${params.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response) => {
        const data = response?.data || response;
        return {
          cars: data?.cars || [],
          total: data?.total || 0,
          page: data?.page || 1,
          pages: data?.pages || 1,
        };
      },
      providesTags: ["Cars"],
    }),

    // ✅ Get Single Car Endpoint
    getSingleCar: builder.query({
      query: (carId) => ({
        url: `/cars/${carId}`,
        method: "GET",
      }),
      providesTags: (result, error, carId) => [{ type: "Car", id: carId }],
      transformResponse: (response) => {
        const data = response?.data || response;
        return data;
      },
    }),

    // ✅ Get Car Counts by Make
    getCarCountsByMake: builder.query({
      query: () => ({
        url: "/cars/stats/counts-by-make",
        method: "GET",
      }),
      transformResponse: (response) => {
        const data = response?.data || response;
        // The backend returns an array: [{_id: "Brand", count: 10}]
        // We need to transform it into an object: {"Brand": 10} for AllBrands.jsx
        if (Array.isArray(data)) {
          return data.reduce((acc, item) => {
            if (item._id) {
              acc[item._id] = item.count;
            }
            return acc;
          }, {});
        }

        if (typeof data === "object" && data !== null) {
          return data;
        }
        return {};
      },
    }),

    // ✅ Create Car Endpoint
    createCar: builder.mutation({
      query: (arg) => {
        // Support both direct FormData or object with formData and params
        const formData = arg instanceof FormData ? arg : arg.formData;
        const params = arg instanceof FormData ? {} : arg.params || {};

        // Build query string
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value);
          }
        });
        const queryString = queryParams.toString();

        return {
          url: `/cars${queryString ? `?${queryString}` : ""}`,
          method: "POST",
          body: formData,
          // Important: Don't set Content-Type header for FormData
          // The browser will set it with the correct boundary
          headers: {},
          // Ensure credentials are included for authenticated requests
          credentials: "include",
          // Handle file upload progress if needed
          onUploadProgress: (progressEvent) => {
            // Upload progress tracking (silent)
          },
        };
      },
      invalidatesTags: ["Cars"],
      // Add error handling
      transformErrorResponse: (response) => {
        // Car creation failed
        return response.data;
      },
    }),
    // Car Filter Endpoint , for searching cars
    // In your api.js file, fix the typo:
    getFilteredCars: builder.query({
      query: (params) => {
        const searchParams = new URLSearchParams(params).toString();
        return {
          url: `/cars/filter?${searchParams}`,
        };
      },
      transformResponse: (response) => {
        const data = response?.data || response;
        return {
          cars: data?.cars || [],
          total: data?.total || 0,
          page: data?.page || 1,
          pages: data?.pages || 1,
        };
      },
      providesTags: ["Cars"],
    }),
    // Get My Cars or My listings (with optional status filter)
    getMyCars: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params && params.status && params.status !== "all") {
          queryParams.append("status", params.status);
        }
        const queryString = queryParams.toString();
        return `/cars/my/listings${queryString ? `?${queryString}` : ""}`;
      },
      transformResponse: (response) => {
        const data = response?.data || response;
        return {
          cars: data?.cars || [],
          total: data?.total || 0,
          stats: data?.stats || { total: 0, active: 0, sold: 0, expired: 0 },
        };
      },
      providesTags: ["Cars"],
    }),

    // Support Chat Endpoints
    createSupportChat: builder.mutation({
      query: (data) => ({
        url: "/support-chat",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SupportChat"],
    }),
    getUserSupportChats: builder.query({
      query: () => "/support-chat/my-chats",
      providesTags: ["SupportChat"],
      transformResponse: (response) => response?.data || response,
    }),
    getSupportChatMessages: builder.query({
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
    sendSupportMessage: builder.mutation({
      query: ({ chatId, message }) => ({
        url: `/support-chat/${chatId}/messages`,
        method: "POST",
        body: { message },
      }),
      invalidatesTags: ["SupportChat"],
    }),

    // Car Chat Endpoints (Buyer-Seller)
    createCarChat: builder.mutation({
      query: (carId) => ({
        url: `/car-chat/car/${carId}`,
        method: "POST",
      }),
      invalidatesTags: ["CarChat"],
    }),
    getCarChatByCarId: builder.query({
      query: (carId) => `/car-chat/car/${carId}`,
      providesTags: ["CarChat"],
      transformResponse: (response) => response?.data || response,
    }),
    getCarChats: builder.query({
      query: () => "/car-chat/my-chats",
      providesTags: ["CarChat"],
      transformResponse: (response) => {
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      },
    }),
    getSellerBuyerChats: builder.query({
      query: () => "/car-chat/seller/chats",
      providesTags: ["CarChat"],
      transformResponse: (response) => {
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      },
    }),
    getCarChatMessages: builder.query({
      query: (chatId) => `/car-chat/${chatId}/messages`,
      providesTags: ["CarChat"],
      transformResponse: (response) => {
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      },
    }),
    sendCarChatMessage: builder.mutation({
      query: ({ chatId, message, messageType = "text", attachments = [] }) => ({
        url: `/car-chat/${chatId}/messages`,
        method: "POST",
        body: { message, messageType, attachments },
      }),
      invalidatesTags: ["CarChat"],
    }),
    editCarChatMessage: builder.mutation({
      query: ({ messageId, message }) => ({
        url: `/car-chat/messages/${messageId}`,
        method: "PUT",
        body: { message },
      }),
      invalidatesTags: ["CarChat"],
    }),
    deleteCarChatMessage: builder.mutation({
      query: (messageId) => ({
        url: `/car-chat/messages/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CarChat"],
    }),

    // Mark Car as Sold/Available
    markCarAsSold: builder.mutation({
      query: ({ carId, isSold, actualSalePrice }) => ({
        url: `/cars/${carId}/sold`,
        method: "PUT",
        body: { isSold, actualSalePrice },
      }),
      invalidatesTags: ["Cars", "User"],
    }),
    // Relist sold/expired car
    relistCar: builder.mutation({
      query: (carId) => ({
        url: `/cars/${carId}/relist`,
        method: "POST",
      }),
      invalidatesTags: ["Cars", "User"],
    }),

    // Edit Car
    editCar: builder.mutation({
      query: ({ carId, formData }) => ({
        url: `/cars/${carId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Cars", "User"],
      transformResponse: (response) => {
        return response?.data || response;
      },
    }),

    // Notification Endpoints
    getUserNotifications: builder.query({
      query: ({ page = 1, limit = 20, isRead } = {}) => {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        if (isRead !== undefined) params.append("isRead", String(isRead));
        return {
          url: `/notifications/me?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Notification"],
      transformResponse: (response) => {
        return response?.data || response;
      },
    }),
    markNotificationAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),
    markAllNotificationsAsRead: builder.mutation({
      query: () => ({
        url: `/notifications/read-all`,
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),

    // Blog Endpoints (Public)
    getBlogs: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append("page", params.page);
        if (params.limit) searchParams.append("limit", params.limit);
        if (params.status) searchParams.append("status", params.status);
        if (params.category) searchParams.append("category", params.category);
        if (params.search) searchParams.append("search", params.search);
        if (params.isFeatured !== undefined)
          searchParams.append("isFeatured", params.isFeatured);
        if (params.exclude) searchParams.append("exclude", params.exclude);
        return `/blogs?${searchParams.toString()}`;
      },
      providesTags: ["Blog"],
      transformResponse: (response) => {
        // Return response.data so components can access data.blogs and data.pagination directly
        return response?.data || response;
      },
      // Refetch when component mounts or args change to ensure fresh data after admin updates
      refetchOnMountOrArgChange: true,
    }),

    getBlogById: builder.query({
      query: (id) => `/blogs/${id}`,
      providesTags: (result, error, id) => [{ type: "Blog", id }],
      transformResponse: (response) => response?.data || response,
    }),

    // Categories (Public)
    getCategories: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.type) searchParams.append("type", params.type);
        if (params.isActive !== undefined)
          searchParams.append("isActive", params.isActive);
        return `/categories?${searchParams.toString()}`;
      },
      providesTags: ["Category"],
      transformResponse: (response) => response?.data || response,
    }),

    // Blog Comments (Public/User)
    getBlogComments: builder.query({
      query: ({ blogId, page = 1, limit = 10 }) =>
        `/blogs/${blogId}/comments?page=${page}&limit=${limit}`,
      providesTags: ["Comment"],
    }),
    createComment: builder.mutation({
      query: ({ blogId, content }) => ({
        url: `/blogs/${blogId}/comments`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: ["Comment"],
    }),
    deleteComment: builder.mutation({
      query: (commentId) => ({
        url: `/blogs/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comment"],
    }),

    // Banners (Public)
    getBanners: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.type) searchParams.append("type", params.type);
        if (params.position) searchParams.append("position", params.position);
        if (params.isActive !== undefined)
          searchParams.append("isActive", params.isActive);
        const queryString = searchParams.toString();
        return `/banners${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Banners"],
      transformResponse: (response) => response?.data || response,
    }),

    // Testimonials/Reviews
    getTestimonials: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.isActive !== undefined)
          searchParams.append("isActive", params.isActive);
        if (params.featured !== undefined)
          searchParams.append("featured", params.featured);
        if (params.createdBy)
          searchParams.append("createdBy", params.createdBy);
        const queryString = searchParams.toString();
        return `/testimonials${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Testimonial"],
      transformResponse: (response) => response?.data || response,
    }),
    submitReview: builder.mutation({
      query: (formData) => ({
        url: "/testimonials/submit",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Testimonial"],
      transformResponse: (response) => response?.data || response,
    }),

    // Newsletter
    subscribeNewsletter: builder.mutation({
      query: (email) => ({
        url: "/newsletter/subscribe",
        method: "POST",
        body: { email },
      }),
      transformResponse: (response) => response?.data || response,
    }),
    unsubscribeNewsletter: builder.mutation({
      query: (email) => ({
        url: "/newsletter/unsubscribe",
        method: "POST",
        body: { email },
      }),
      transformResponse: (response) => response?.data || response,
    }),

    // Valuation / Car Estimator
    createValuation: builder.mutation({
      query: (vehicleData) => ({
        url: "/valuations",
        method: "POST",
        body: vehicleData,
      }),
      transformResponse: (response) => response?.data || response,
    }),
    getValuationHistory: builder.query({
      query: () => "/valuations/my-history",
      transformResponse: (response) => response?.data || response,
    }),
    getValuationById: builder.query({
      query: (id) => `/valuations/${id}`,
      transformResponse: (response) => response?.data || response,
    }),

    // Recommendations & Similar Listings
    getSimilarListings: builder.query({
      query: (carId) => ({
        url: `/recommendations/similar/${carId}`,
        method: "GET",
      }),
      transformResponse: (response) => response?.data || response,
    }),

    // Recently Viewed
    getRecentlyViewed: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return {
          url: `/recommendations/viewed?${searchParams}`,
          method: "GET",
        };
      },
      providesTags: ["User"],
      transformResponse: (response) => response?.data || response,
    }),

    // Track Recently Viewed
    trackRecentlyViewed: builder.mutation({
      query: (carId) => ({
        url: `/recommendations/viewed/${carId}`,
        method: "POST",
      }),
    }),

    // Recommended Listings
    getRecommendedListings: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return {
          url: `/recommendations?${searchParams}`,
          method: "GET",
        };
      },
      transformResponse: (response) => response?.data || response,
    }),

    // Boost endpoints
    boostPost: builder.mutation({
      query: ({ carId, duration, useCredits = true }) => ({
        url: `/cars/${carId}/boost`,
        method: "POST",
        body: { duration, useCredits },
      }),
      invalidatesTags: ["Cars", "Car", "User"],
      transformResponse: (response) => response?.data || response,
    }),
    getBoostStatus: builder.query({
      query: (carId) => ({
        url: `/boost/${carId}/status`,
        method: "GET",
      }),
      transformResponse: (response) => response?.data || response,
    }),
    removeBoost: builder.mutation({
      query: (carId) => ({
        url: `/boost/${carId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cars"],
      transformResponse: (response) => response?.data || response,
    }),
    purchaseCredits: builder.mutation({
      query: (data) => ({
        url: "/boost/credits/purchase",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
      transformResponse: (response) => response?.data || response,
    }),
    getBoostPricing: builder.query({
      query: () => ({
        url: "/boost/pricing",
        method: "GET",
      }),
      transformResponse: (response) => response?.data || response,
    }),
    getBoostOptions: builder.query({
      query: () => ({
        url: "/cars/boost/options",
        method: "GET",
      }),
      transformResponse: (response) => response?.data || response,
    }),
    createBoostCheckout: builder.mutation({
      query: (data) => ({
        url: "/subscriptions/boost-checkout",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Boost", "User"],
      transformResponse: (response) => response?.data || response,
    }),

    // Subscription endpoints
    getSubscriptionPlans: builder.query({
      query: () => ({
        url: "/subscriptions/plans",
        method: "GET",
      }),
      transformResponse: (response) => {
        // Preserve paymentSystemEnabled flag
        return {
          data: response?.data || response,
          paymentSystemEnabled:
            response?.paymentSystemEnabled !== undefined
              ? response.paymentSystemEnabled
              : true,
        };
      },
    }),
    getMySubscription: builder.query({
      query: () => ({
        url: "/subscriptions/my-subscription",
        method: "GET",
      }),
      transformResponse: (response) => response?.data || response,
    }),
    purchaseSubscription: builder.mutation({
      query: (data) => ({
        url: "/subscriptions/purchase",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
      transformResponse: (response) => response?.data || response,
    }),
    createSubscriptionCheckout: builder.mutation({
      query: ({ plan, autoRenew = true }) => ({
        url: "/subscriptions/checkout",
        method: "POST",
        body: { plan, autoRenew },
      }),
      transformResponse: (response) => response?.data || response,
    }),
    cancelSubscription: builder.mutation({
      query: () => ({
        url: "/subscriptions/cancel",
        method: "POST",
      }),
      invalidatesTags: ["User"],
      transformResponse: (response) => response?.data || response,
    }),
    getPaymentHistory: builder.query({
      query: () => ({
        url: "/subscriptions/payment-history",
        method: "GET",
      }),
      transformResponse: (response) => response?.data || response,
    }),
    verifyPaymentSession: builder.query({
      query: (sessionId) => ({
        url: `/subscriptions/verify-payment/${sessionId}`,
        method: "GET",
      }),
      transformResponse: (response) => response?.data || response,
    }),

    // User Reviews (for sellers/users)
    addUserReview: builder.mutation({
      query: (data) => ({
        url: "/reviews",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
      transformResponse: (response) => response?.data || response,
    }),
    getUserReviews: builder.query({
      query: (userId) => ({
        url: `/reviews/user/${userId}`,
        method: "GET",
      }),
      transformResponse: (response) => response?.data || response,
    }),

    // Report endpoints
    createReport: builder.mutation({
      query: (data) => ({
        url: "/users/report",
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
    }),

    // Account Deletion endpoints
    createDeletionRequest: builder.mutation({
      query: (data) => ({
        url: "/account-deletion/request-deletion",
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
    }),
    getDeletionRequestStatus: builder.query({
      query: () => "/account-deletion/deletion-request-status",
      transformResponse: (response) => response?.data || response,
    }),
  }),
});

// ✅ Export hooks
export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useGoogleLoginMutation,
  useForgotPasswordMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useResetPasswordMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useUpdateDealerProfileMutation,
  useRequestSellerMutation,
  useRequestDealerMutation,
  useSaveCarMutation,
  useUnsaveCarMutation,
  useGetSavedCarsQuery,
  useLogoutMutation,
  useGetCarsQuery,
  useGetSingleCarQuery,
  useGetCarCountsByMakeQuery,
  useCreateCarMutation,
  useGetFilteredCarsQuery,
  useGetMyCarsQuery,
  useCreateSupportChatMutation,
  useGetUserSupportChatsQuery,
  useGetSupportChatMessagesQuery,
  useSendSupportMessageMutation,
  useCreateCarChatMutation,
  useGetCarChatByCarIdQuery,
  useGetCarChatsQuery,
  useGetSellerBuyerChatsQuery,
  useGetCarChatMessagesQuery,
  useSendCarChatMessageMutation,
  useEditCarChatMessageMutation,
  useDeleteCarChatMessageMutation,
  useMarkCarAsSoldMutation,
  useRelistCarMutation,
  useEditCarMutation,
  useGetUserNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useGetBlogsQuery,
  useGetBlogByIdQuery,
  useGetCategoriesQuery,
  useGetBannersQuery,
  useGetTestimonialsQuery,
  useSubmitReviewMutation,
  useSubscribeNewsletterMutation,
  useUnsubscribeNewsletterMutation,
  useGetSimilarListingsQuery,
  useGetRecentlyViewedQuery,
  useTrackRecentlyViewedMutation,
  useGetRecommendedListingsQuery,
  useBoostPostMutation,
  useGetBoostStatusQuery,
  useRemoveBoostMutation,
  usePurchaseCreditsMutation,
  useGetBoostPricingQuery,
  useGetBoostOptionsQuery,
  useCreateBoostCheckoutMutation,
  useCreateSubscriptionCheckoutMutation,
  useGetSubscriptionPlansQuery,
  useGetMySubscriptionQuery,
  usePurchaseSubscriptionMutation,
  useCancelSubscriptionMutation,
  useGetPaymentHistoryQuery,
  useVerifyPaymentSessionQuery,
  useAddUserReviewMutation,
  useGetUserReviewsQuery,
  useCreateReportMutation,
  useCreateDeletionRequestMutation,
  useGetDeletionRequestStatusQuery,
  useGetBlogCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useCreateValuationMutation,
  useGetValuationHistoryQuery,
  useGetValuationByIdQuery,
} = api;
