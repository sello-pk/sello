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

/**
 * Multipart uploads that can be large (listings, dealer docs, auction access).
 * Used for 413 / failed-fetch messages. Nginx default client_max_body_size (1m)
 * rejects even a single phone photo — browser may show CORS + Failed to fetch.
 */
function isMultipartDocumentUpload(args) {
  if (!(args?.body instanceof FormData)) return false;
  const url = args?.url || "";
  const method = (args?.method || "GET").toUpperCase();
  if (method !== "POST" && method !== "PUT" && method !== "PATCH") return false;
  if (method === "POST" && url.startsWith("/cars") && !/\/cars\//.test(url))
    return true;
  if (method === "PUT" && /\/cars\/[^/?]+/.test(url)) return true;
  if (url.includes("/auth/register")) return true;
  if (url.includes("submit-car")) return true;
  if (url.includes("/users/auction-access/request")) return true;
  if (url.includes("/users/request-dealer")) return true;
  if (url.includes("/users/dealer-profile")) return true;
  if (url.includes("/verification/submit")) return true;
  return false;
}

function getUploadFetchMessage(url = "") {
  if (url.includes("/auctions/submit-car")) {
    return "Auction files could not be uploaded. Try smaller photos or documents and retry. If this keeps happening in production, the server upload limit may need to be increased.";
  }
  if (
    url.includes("/auth/register") ||
    url.includes("/users/dealer-profile") ||
    url.includes("/users/auction-access/request") ||
    url.includes("/users/request-dealer")
  ) {
    return "Dealer documents could not be uploaded right now. Please try again. If the issue continues in production, the server upload path should be checked.";
  }
  return "Upload could not be completed. Try smaller files and retry. If this keeps happening, the server upload limit may need to be increased.";
}

function getUpload413Message(url = "") {
  if (url.includes("/auctions/submit-car")) {
    return "Your auction upload is too large for the server to accept right now. Try smaller files. If this keeps happening in production, increase the server upload limit.";
  }
  if (
    url.includes("/auth/register") ||
    url.includes("/users/dealer-profile") ||
    url.includes("/users/auction-access/request") ||
    url.includes("/users/request-dealer")
  ) {
    return "Your dealer document upload is too large for the server to accept right now. Try a smaller file. If this keeps happening in production, increase the server upload limit.";
  }
  return "Your upload is too large for the server to accept right now. Try smaller files and retry.";
}

const MSG_FETCH_GENERIC =
  "Request couldn't complete. If you were uploading photos, try fewer or smaller images and retry. Otherwise check your connection.";

const CLIENT_UPLOAD_MAX_IMAGE_EDGE = 1920;
const CLIENT_UPLOAD_IMAGE_QUALITY = 0.78;
const CLIENT_UPLOAD_SKIP_BYTES = 450 * 1024;
const CLIENT_UPLOAD_MIN_TOTAL_BYTES = 2 * 1024 * 1024;

function isOptimizableImage(file) {
  return (
    file instanceof File &&
    typeof file.type === "string" &&
    file.type.startsWith("image/") &&
    file.type !== "image/gif" &&
    file.type !== "image/svg+xml"
  );
}

function shouldOptimizeImage(file, totalImageBytes) {
  if (!isOptimizableImage(file)) return false;
  if (file.size >= CLIENT_UPLOAD_SKIP_BYTES) return true;
  return totalImageBytes >= CLIENT_UPLOAD_MIN_TOTAL_BYTES;
}

function fileNameToWebp(name = "image.jpg") {
  return name.replace(/\.[^.]+$/, "") + ".webp";
}

async function toOptimizedWebpFile(file) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const maxSide = Math.max(bitmap.width || 1, bitmap.height || 1);
    const scale =
      maxSide > CLIENT_UPLOAD_MAX_IMAGE_EDGE
        ? CLIENT_UPLOAD_MAX_IMAGE_EDGE / maxSide
        : 1;
    const width = Math.max(1, Math.round((bitmap.width || 1) * scale));
    const height = Math.max(1, Math.round((bitmap.height || 1) * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close?.();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/webp", CLIENT_UPLOAD_IMAGE_QUALITY);
    });
    if (!blob) return file;

    // Keep original if optimization is not meaningfully smaller.
    if (blob.size >= file.size * 0.95) return file;

    return new File([blob], fileNameToWebp(file.name), {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

async function optimizeUploadFormData(
  formData,
  imageFields = ["images", "damageImages"],
) {
  if (!(formData instanceof FormData)) return formData;
  const entries = Array.from(formData.entries());
  if (!entries.length) return formData;

  const imageFieldSet = new Set(imageFields);
  const totalImageBytes = entries.reduce((sum, [key, value]) => {
    if (
      imageFieldSet.has(key) &&
      value instanceof File &&
      isOptimizableImage(value)
    ) {
      return sum + value.size;
    }
    return sum;
  }, 0);

  const processed = await Promise.all(
    entries.map(async ([key, value]) => {
      if (
        imageFieldSet.has(key) &&
        value instanceof File &&
        shouldOptimizeImage(value, totalImageBytes)
      ) {
        const optimized = await toOptimizedWebpFile(value);
        return [key, optimized];
      }
      return [key, value];
    }),
  );

  const rebuilt = new FormData();
  processed.forEach(([key, value]) => rebuilt.append(key, value));
  return rebuilt;
}

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
              void import("../../utils/tokenManager.js").then((m) =>
                m.clearAuthSession(),
              );
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and let it fall through to 401 handling
            clearTokens();
            localStorage.removeItem("user");
            void import("../../utils/tokenManager.js").then((m) =>
              m.clearAuthSession(),
            );
          }
        }

        // If refresh failed or no refresh token, clear tokens
        if (url.includes("/users/me") || url.includes("/auth/")) {
          clearTokens();
          localStorage.removeItem("user");
          void import("../../utils/tokenManager.js").then((m) =>
            m.clearAuthSession(),
          );
        }
        // Don't redirect automatically - let components handle it
      }

      // 413 Request Entity Too Large (often from proxy/nginx) — suggest fewer/smaller images
      if (
        baseResult.error &&
        (baseResult.error.originalStatus === 413 ||
          baseResult.error.status === 413)
      ) {
        const uploadAttempt = isMultipartDocumentUpload(args);
        const uploadMessage = getUpload413Message(args?.url || "");
        return {
          error: {
            status: 413,
            data: {
              message: uploadAttempt
                ? uploadMessage
                : baseResult.error?.data?.message || uploadMessage,
              code: "REQUEST_TOO_LARGE",
              error: baseResult.error?.data?.error,
            },
            originalStatus: 413,
          },
        };
      }

      // Handle network errors (Failed to fetch) — avoid blaming "internet" only; uploads often time out
      if (
        baseResult.error &&
        (baseResult.error.status === "FETCH_ERROR" ||
          baseResult.error.error === "TypeError: Failed to fetch")
      ) {
        const uploadAttempt = isMultipartDocumentUpload(args);
        const message = uploadAttempt
          ? getUploadFetchMessage(args?.url || "")
          : MSG_FETCH_GENERIC;
        if (import.meta.env.DEV && baseResult.error?.error) {
          logger.warn("FETCH_ERROR", {
            url: args?.url,
            error: baseResult.error.error,
          });
        }
        return {
          error: {
            status: "FETCH_ERROR",
            data: {
              message,
              code: uploadAttempt ? "UPLOAD_TIMEOUT_OR_NETWORK" : "NETWORK",
              error: baseResult.error.error || "Failed to fetch",
            },
            originalStatus: "FETCH_ERROR",
          },
        };
      }

      return baseResult;
    } catch (error) {
      const uploadAttempt = isMultipartDocumentUpload(args);
      return {
        error: {
          status: "FETCH_ERROR",
          data: {
            message: uploadAttempt
              ? getUploadFetchMessage(args?.url || "")
              : MSG_FETCH_GENERIC,
            code: uploadAttempt ? "UPLOAD_TIMEOUT_OR_NETWORK" : "NETWORK",
            error: error?.message || "Failed to fetch",
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
    "Auction",
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
    requestAuctionAccess: builder.mutation({
      query: (payload) => ({
        url: "/users/auction-access/request",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["User", "Auction"],
      transformResponse: (response) => response?.data || response,
    }),
    getMyAuctionAccessStatus: builder.query({
      query: () => ({
        url: "/users/auction-access/status",
        method: "GET",
      }),
      providesTags: ["User", "Auction"],
      transformResponse: (response) => response?.data || response,
    }),
    // Save/Unsave Car (Wishlist)
    saveCar: builder.mutation({
      query: (carId) => ({
        url: `/users/wishlist/${carId}`,
        method: "POST",
      }),
      invalidatesTags: ["User", "Cars"],
      transformResponse: (response) => response?.data || response,
    }),
    unsaveCar: builder.mutation({
      query: (carId) => ({
        url: `/users/wishlist/${carId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User", "Cars"],
      transformResponse: (response) => response?.data || response,
    }),
    getSavedCars: builder.query({
      query: () => ({
        url: "/users/wishlist",
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
        // Full session wipe so next login does not see cached getMe / previous user
        void import("../../utils/tokenManager.js").then((m) =>
          m.clearAuthSession(),
        );
        return { success: true };
      },
    }),

    getCars: builder.query({
      query: ({
        page = 1,
        limit = 12,
        condition,
        search,
        transmission,
        fuelType,
        bodyType,
        vehicleType,
      } = {}) => {
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

        // Add advanced filters if provided (used by listings "Browse By Types" UI)
        if (transmission) params.append("transmission", transmission);
        if (fuelType) params.append("fuelType", fuelType);
        if (bodyType) params.append("bodyType", bodyType);
        if (vehicleType) params.append("vehicleType", vehicleType);

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

    // ✅ Get Car Counts by Make (optional vehicleType to scope counts: Car, Bike, etc.)
    getCarCountsByMake: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params?.vehicleType)
          searchParams.set("vehicleType", params.vehicleType);
        const qs = searchParams.toString();
        return {
          url: `/cars/stats/counts-by-make${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
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
      queryFn: async (arg, _api, _extra, fetchWithBQ) => {
        const formData = arg instanceof FormData ? arg : arg?.formData;
        const params = arg instanceof FormData ? {} : arg?.params || {};
        const optimizedFormData = await optimizeUploadFormData(formData, [
          "images",
        ]);

        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value);
          }
        });
        const queryString = queryParams.toString();

        const result = await fetchWithBQ({
          url: `/cars${queryString ? `?${queryString}` : ""}`,
          method: "POST",
          body: optimizedFormData,
        });
        if (result.error) return { error: result.error };
        return { data: result.data };
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
      queryFn: async ({ carId, formData }, _api, _extra, fetchWithBQ) => {
        const optimizedFormData = await optimizeUploadFormData(formData, [
          "images",
        ]);
        const result = await fetchWithBQ({
          url: `/cars/${carId}`,
          method: "PUT",
          body: optimizedFormData,
        });
        if (result.error) return { error: result.error };
        return { data: result.data };
      },
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
      refetchOnMountOrArgChange: false,
    }),

    getBlogBySlug: builder.query({
      query: (slug) => `/blogs/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Blog", id: slug }],
      transformResponse: (response) => response?.data || response,
      refetchOnMountOrArgChange: false,
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
        url: "/testimonials",
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
          url: `/recommendations/recommended${searchParams ? `?${searchParams}` : ""}`,
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
        url: "/account-deletion/request",
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
    }),
    getDeletionRequestStatus: builder.query({
      query: () => "/account-deletion/status",
      transformResponse: (response) => response?.data || response,
    }),

    // ═══════════════════════════ Auction Endpoints ═══════════════════════════

    getAuctions: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.append("status", params.status);
        if (params.page) searchParams.append("page", params.page);
        if (params.limit) searchParams.append("limit", params.limit);
        return `/auctions?${searchParams.toString()}`;
      },
      providesTags: ["Auction"],
      transformResponse: (response) => response?.data || response,
    }),
    getLiveAuction: builder.query({
      query: () => "/auctions/live",
      providesTags: ["Auction"],
      transformResponse: (response) => response?.data || response,
    }),
    getAuctionById: builder.query({
      query: (id) => `/auctions/${id}`,
      providesTags: ["Auction"],
      transformResponse: (response) => response?.data || response,
    }),
    getAuctionCars: builder.query({
      query: ({ auctionId, ...params }) => {
        const searchParams = new URLSearchParams(params);
        return `/auctions/${auctionId}/cars?${searchParams.toString()}`;
      },
      providesTags: ["Auction"],
      transformResponse: (response) => response,
    }),
    getAuctionCarDetail: builder.query({
      query: (id) => `/auctions/car/${id}`,
      providesTags: ["Auction"],
      transformResponse: (response) => response?.data || response,
    }),
    getLiveAuctionByCarId: builder.query({
      query: (carId) => `/auctions/live-by-car/${carId}`,
      providesTags: ["Auction"],
      transformResponse: (response) => response?.data ?? null,
      transformErrorResponse: (response) => {
        // 404 = car not in active auction; treat as success with null
        if (response?.status === 404) return { data: null };
        return response;
      },
    }),
    getAuctionCarBids: builder.query({
      query: (args) => {
        const id = typeof args === "string" ? args : args?.auctionCarId;
        const params = typeof args === "object" && args ? args : {};
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append("page", params.page);
        if (params.limit) searchParams.append("limit", params.limit);
        if (params.sort === "oldest") searchParams.append("sort", "oldest");
        const qs = searchParams.toString();
        return `/auctions/car/${id}/bids${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Auction"],
      transformResponse: (response) => response,
    }),
    placeBid: builder.mutation({
      query: (data) => ({
        url: "/auctions/bid",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auction"],
    }),
    setProxyBid: builder.mutation({
      query: (data) => ({
        url: "/auctions/proxy-bid",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auction"],
    }),
    buyNow: builder.mutation({
      query: (data) => ({
        url: "/auctions/buy-now",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auction"],
    }),
    submitTokenPayment: builder.mutation({
      query: (data) => ({
        url: "/auctions/token-payment",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auction"],
    }),
    getTokenPaymentMeta: builder.query({
      query: () => "/auctions/token-payment/meta",
      providesTags: ["Auction"],
      transformResponse: (response) => response?.data || response,
    }),
    getMyTokenPayments: builder.query({
      query: () => "/auctions/my/token-payments",
      providesTags: ["Auction"],
      transformResponse: (response) => response?.data || response,
    }),
    addToAuctionWatchlist: builder.mutation({
      query: (data) => ({
        url: "/auctions/watchlist",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auction"],
    }),
    removeFromAuctionWatchlist: builder.mutation({
      query: (auctionCarId) => ({
        url: `/auctions/watchlist/${auctionCarId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Auction"],
    }),
    getMyAuctionWatchlist: builder.query({
      query: () => "/auctions/my/watchlist",
      providesTags: ["Auction"],
      transformResponse: (response) => response?.data || response,
    }),
    getMyBids: builder.query({
      query: () => "/auctions/my/bids",
      providesTags: ["Auction"],
      transformResponse: (response) => response?.data || response,
    }),
    getMyWonAuctions: builder.query({
      query: () => "/auctions/my/won",
      providesTags: ["Auction"],
      transformResponse: (response) => response?.data || response,
    }),
    getMyEscrows: builder.query({
      query: () => "/auctions/my/escrows",
      providesTags: ["Auction"],
      transformResponse: (response) => response?.data || response,
    }),
    getEscrowById: builder.query({
      query: (id) => `/escrow/${id}`,
      providesTags: ["Auction"],
      transformResponse: (response) => response?.data || response,
    }),
    payEscrow: builder.mutation({
      query: (body) => ({
        url: "/escrow/pay",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auction"],
    }),
    raiseEscrowDispute: builder.mutation({
      query: ({ escrowId, reason }) => ({
        url: `/escrow/${escrowId}/dispute`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["Auction"],
    }),
    getMyAuctionResult: builder.query({
      query: (auctionCarId) => `/auctions/my/result/${auctionCarId}`,
      providesTags: ["Auction"],
      transformResponse: (response) => response?.data || response,
    }),
    getMyWalletTransactions: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append("page", params.page);
        if (params.limit) searchParams.append("limit", params.limit);
        return `/auctions/my/transactions?${searchParams.toString()}`;
      },
      providesTags: ["Auction"],
      transformResponse: (response) => response?.data || response,
    }),
    submitCarToAuction: builder.mutation({
      queryFn: async (data, _api, _extra, fetchWithBQ) => {
        const file = data?.inspectionReportFile;
        if (file instanceof File) {
          const form = new FormData();
          form.append("inspectionReport", file);
          [
            "auctionId",
            "carId",
            "startingBid",
            "reservePrice",
            "buyNowPrice",
            "title",
            "description",
            "make",
            "model",
            "year",
            "condition",
            "price",
            "colorExterior",
            "colorInterior",
            "fuelType",
            "engineCapacity",
            "transmission",
            "mileage",
            "features",
            "regionalSpec",
            "bodyType",
            "country",
            "city",
            "location",
            "vehicleType",
            "vehicleTypeCategory",
            "videoUrls",
            "geoLocation",
            "contactNumber",
            "warranty",
            "ownerType",
          ].forEach((key) => {
            const v = data[key];
            if (v === undefined || v === null) return;
            form.append(key, typeof v === "object" ? JSON.stringify(v) : v);
          });
          if (data.images?.length) {
            data.images.forEach((img) => {
              if (img instanceof File) form.append("images", img);
            });
          }
          if (data.damageImages?.length) {
            data.damageImages.forEach((img) => {
              if (img instanceof File) form.append("damageImages", img);
            });
          }
          if (data.documents?.length) {
            data.documents.forEach((doc) => {
              if (doc instanceof File) form.append("documents", doc);
            });
          }
          const optimizedForm = await optimizeUploadFormData(form, [
            "images",
            "damageImages",
          ]);
          const result = await fetchWithBQ({
            url: "/auctions/submit-car",
            method: "POST",
            body: optimizedForm,
          });
          if (result.error) return { error: result.error };
          return { data: result.data };
        }

        const result = await fetchWithBQ({
          url: "/auctions/submit-car",
          method: "POST",
          body: data,
        });
        if (result.error) return { error: result.error };
        return { data: result.data };
      },
      invalidatesTags: ["Auction"],
    }),
    getAuctionStats: builder.query({
      query: (auctionId) => `/auctions/${auctionId}/stats`,
      providesTags: ["Auction"],
      transformResponse: (response) => response?.data || response,
    }),
    extendAuction: builder.mutation({
      query: ({ id, minutes }) => ({
        url: `/auctions/${id}/extend`,
        method: "POST",
        body: { minutes },
      }),
      invalidatesTags: ["Auction"],
    }),
    getMyAuctionAnalytics: builder.query({
      query: () => "/auctions/my/auction-analytics",
      providesTags: ["Auction"],
      transformResponse: (response) => response?.data || response,
    }),
    getInspectionTimeSlots: builder.query({
      query: () => "/inspections/time-slots",
      transformResponse: (response) => response?.data || response,
    }),
    bookInspection: builder.mutation({
      query: (data) => ({
        url: "/inspections/book",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auction"],
    }),
    getMyInspectionBookings: builder.query({
      query: () => "/inspections/my-bookings",
      providesTags: ["Auction"],
      transformResponse: (response) => response?.data || response,
    }),

    // ═══════════════════════════ Payment / Wallet Endpoints ════════════════════
    getMyWallet: builder.query({
      query: () => "/payments/wallet",
      providesTags: ["Auction"],
      transformResponse: (response) => response?.data || response,
    }),
    createDeposit: builder.mutation({
      query: (data) => ({
        url: "/payments/deposit",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auction"],
    }),
    getMyDeposits: builder.query({
      query: () => "/payments/deposits",
      providesTags: ["Auction"],
      transformResponse: (response) => response?.data || response,
    }),
    createRefundRequest: builder.mutation({
      query: (data) => ({
        url: "/payments/refund-request",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auction"],
    }),
    getMyRefundRequests: builder.query({
      query: () => "/payments/refund-requests",
      providesTags: ["Auction"],
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
  useRequestAuctionAccessMutation,
  useGetMyAuctionAccessStatusQuery,
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
  useGetBlogBySlugQuery,
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
  useGetAuctionsQuery,
  useGetLiveAuctionQuery,
  useGetAuctionByIdQuery,
  useGetAuctionCarsQuery,
  useGetAuctionCarDetailQuery,
  useGetLiveAuctionByCarIdQuery,
  useGetAuctionCarBidsQuery,
  usePlaceBidMutation,
  useSetProxyBidMutation,
  useBuyNowMutation,
  useSubmitTokenPaymentMutation,
  useGetTokenPaymentMetaQuery,
  useGetMyTokenPaymentsQuery,
  useAddToAuctionWatchlistMutation,
  useRemoveFromAuctionWatchlistMutation,
  useGetMyAuctionWatchlistQuery,
  useGetMyBidsQuery,
  useGetMyWonAuctionsQuery,
  useGetMyEscrowsQuery,
  useGetEscrowByIdQuery,
  usePayEscrowMutation,
  useRaiseEscrowDisputeMutation,
  useGetMyAuctionResultQuery,
  useGetMyWalletTransactionsQuery,
  useSubmitCarToAuctionMutation,
  useGetAuctionStatsQuery,
  useExtendAuctionMutation,
  useGetMyAuctionAnalyticsQuery,
  useGetInspectionTimeSlotsQuery,
  useBookInspectionMutation,
  useGetMyInspectionBookingsQuery,
  useGetMyWalletQuery,
  useCreateDepositMutation,
  useGetMyDepositsQuery,
  useCreateRefundRequestMutation,
  useGetMyRefundRequestsQuery,
} = api;
