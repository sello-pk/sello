import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL } from "../redux/config";
import { getAccessToken } from "../utils/tokenRefresh";

/**
 * Custom hook for managing subscription settings
 * Ensures admin-only control and proper state management
 */
const useSubscriptionSettings = () => {
  const { user } = useSelector((state) => state.auth);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch subscription settings from server
  const fetchSettings = useCallback(async () => {
    if (!user || user.role !== "admin") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await axios.get(`${API_BASE_URL}/settings`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const fetchedSettings = {};
        const flatSettings = response.data.data.flat || [];

        flatSettings.forEach((s) => {
          let parsedValue = s.value;
          if (s.type === "boolean") {
            parsedValue =
              s.value === true || s.value === "true" || s.value === 1;
          } else if (s.type === "number") {
            parsedValue = Number(s.value) || 0;
          }
          fetchedSettings[s.key] = parsedValue;
        });

        setSettings(fetchedSettings);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to load settings";
      setError(errorMessage);
      console.error("Settings fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update a single setting (admin only)
  const updateSetting = useCallback(
    async (key, value) => {
      if (!user || user.role !== "admin") {
        toast.error("Only administrators can update settings");
        return false;
      }

      // Protected settings check
      const protectedSettings = [
        "paymentSystemEnabled",
        "showSubscriptionPlans",
        "showSubscriptionTab",
        "showPaymentHistory",
        "enableAutoRenewal",
        "requirePaymentApproval",
      ];

      if (protectedSettings.includes(key)) {
        console.warn("Attempt to modify protected setting", {
          userId: user._id,
          userRole: user.role,
          key,
          value,
        });
      }

      try {
        const token = getAccessToken();
        if (!token) {
          throw new Error("Authentication required");
        }

        const settingData = {
          key,
          value,
          category: "payment",
          type: typeof value === "boolean" ? "boolean" : "string",
        };

        await axios.post(`${API_BASE_URL}/settings`, settingData, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Update local state
        setSettings((prev) => ({
          ...prev,
          [key]: value,
        }));

        toast.success(`Setting "${key}" updated successfully`);
        return true;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to update setting";
        toast.error(errorMessage);
        console.error("Setting update error:", err);
        return false;
      }
    },
    [user]
  );

  // Reset settings to defaults (admin only)
  const resetSettings = useCallback(async () => {
    if (!user || user.role !== "admin") {
      toast.error("Only administrators can reset settings");
      return false;
    }

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      // Call reset script endpoint
      await axios.post(
        `${API_BASE_URL}/admin/reset-subscription-settings`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refetch settings
      await fetchSettings();
      toast.success("Settings reset to defaults");
      return true;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to reset settings";
      toast.error(errorMessage);
      console.error("Settings reset error:", err);
      return false;
    }
  }, [user, fetchSettings]);

  // Clear settings (called on logout)
  const clearSettings = useCallback(() => {
    setSettings(null);
    setError(null);
    setLoading(false);
  }, []);

  // Auto-fetch on mount and user change
  useEffect(() => {
    if (user) {
      fetchSettings();
    } else {
      clearSettings();
    }
  }, [user, fetchSettings, clearSettings]);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSetting,
    resetSettings,
    clearSettings,
    isAdmin: user?.role === "admin",
  };
};

export default useSubscriptionSettings;
