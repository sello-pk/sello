import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { FaSave, FaTimes, FaSpinner, FaInfoCircle } from "react-icons/fa";
import { API_BASE_URL } from "../../../../redux/config";
import { getAccessToken } from "../../../../utils/tokenRefresh";
import {
  PERMISSION_KEYS,
  ROLE_FORM_MODULES,
} from "../../../../constants/rbacPolicy";

const RoleForm = ({ role, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    accessLevel: "MEDIUM",
    permissions: {},
    isTeamRole: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        displayName: role.displayName,
        description: role.purpose || role.description || "",
        accessLevel: role.accessLevel || "MEDIUM",
        permissions: role.permissions || {},
        isTeamRole: role.isTeamRole || false,
      });
    } else {
      setFormData({
        name: "",
        displayName: "",
        description: "",
        accessLevel: "MEDIUM",
        permissions: {},
        isTeamRole: false,
      });
    }
  }, [role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Helper to check if a specific cell (module + action) is checked
  const isChecked = (moduleKeys, action) => {
    const keys = moduleKeys[action];
    if (!keys) return false;
    if (Array.isArray(keys)) {
      return keys.every((k) => formData.permissions[k]);
    }
    return !!formData.permissions[keys];
  };

  // Helper to toggle a specific cell
  const togglePermission = (moduleKeys, action, value) => {
    const keys = moduleKeys[action];
    if (!keys) return {};

    const updates = {};
    if (Array.isArray(keys)) {
      keys.forEach((k) => (updates[k] = value));
    } else {
      updates[keys] = value;
    }
    return updates;
  };

  const handleMatrixChange = (moduleId, action, isFullRow = false) => {
    const module = ROLE_FORM_MODULES.find((m) => m.id === moduleId);
    if (!module) return;

    setFormData((prev) => {
      const newPermissions = { ...prev.permissions };

      if (isFullRow) {
        // Toggle all actions for this module
        const actions = ["view", "create", "edit", "delete", "approve"];
        // Check if all are currently true to decide whether to toggle on or off
        const allTrue = actions.every((act) => {
          if (!module.keys[act]) return true; // Skip nulls
          return isChecked(module.keys, act);
        });

        const newValue = !allTrue;

        actions.forEach((act) => {
          Object.assign(
            newPermissions,
            togglePermission(module.keys, act, newValue),
          );
        });
      } else {
        // Toggle single action
        const currentValue = isChecked(module.keys, action);
        Object.assign(
          newPermissions,
          togglePermission(module.keys, action, !currentValue),
        );
      }

      return { ...prev, permissions: newPermissions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.displayName?.trim()) {
      toast.error("Role name is required");
      return;
    }
    if (!formData.description?.trim()) {
      toast.error("Description is required");
      return;
    }

    // Generate role name from display name if creating new role
    const roleName = role
      ? role.name
      : formData.displayName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

    const submitData = {
      name: roleName,
      displayName: formData.displayName.trim(),
      purpose: formData.description.trim(),
      accessLevel: formData.accessLevel,
      permissions: formData.permissions,
      isTeamRole: formData.isTeamRole,
    };

    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        setLoading(false);
        return;
      }
      const url = `${API_BASE_URL}/roles${role ? `/${role._id}` : ""}`;
      const method = role ? "put" : "post";

      const response = await axios[method](url, submitData, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success(`Role ${role ? "updated" : "created"} successfully!`);
        onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-900">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {role ? "Edit Role" : "New Role"}
        </h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors disabled:opacity-50"
          >
            <FaTimes size={16} className="inline mr-2" /> Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-2 bg-primary-500 hover:opacity-90 text-white rounded-lg font-bold text-lg shadow-sm hover:shadow-md transform active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <FaSave /> Save
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
        {/* Basic Info */}
        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
              Role Name
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800"
              disabled={role?.isPreset}
            />
          </div>

          <div>
            <label className="block text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800"
            />
          </div>

          {/* Team User Checkbox */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100">
                This role is for Team users
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                If you mark this option, all users who are added with this role
                will be a team user.
              </p>
            </div>
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={formData.isTeamRole}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isTeamRole: e.target.checked,
                  }))
                }
                className="w-6 h-6 border-2 border-gray-400 rounded text-primary-500 focus:ring-primary-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
          <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            Page Access Matrix
          </h4>

          <div className="space-y-3">
            {ROLE_FORM_MODULES.map((module) => {
              const isFull = ["view", "create", "edit", "delete", "approve"].every(
                (act) => {
                  if (!module.keys[act]) return true;
                  return isChecked(module.keys, act);
                },
              );

              return (
                <div
                  key={module.id}
                  className="bg-white dark:bg-gray-900 rounded-lg p-3 flex items-center shadow-sm border border-transparent dark:border-gray-700"
                >
                  <div className="w-44 font-bold text-gray-800 dark:text-gray-100 text-sm">
                    {module.label}
                  </div>

                  {/* Actions */}
                  <div className="flex-1 flex items-center justify-between px-4">
                    {/* Full */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        Full
                      </span>
                      <input
                        type="checkbox"
                        checked={isFull}
                        onChange={() =>
                          handleMatrixChange(module.id, null, true)
                        }
                        className="w-5 h-5 border-2 border-gray-300 rounded text-primary-500 focus:ring-primary-500 transition-colors"
                      />
                    </label>

                    {/* View */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        View
                      </span>
                      <input
                        type="checkbox"
                        checked={isChecked(module.keys, "view")}
                        onChange={() => handleMatrixChange(module.id, "view")}
                        className="w-5 h-5 border-2 border-gray-300 rounded text-primary-500 focus:ring-primary-500 transition-colors"
                      />
                    </label>

                    {/* Create */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        Create
                      </span>
                      <input
                        type="checkbox"
                        checked={isChecked(module.keys, "create")}
                        onChange={() => handleMatrixChange(module.id, "create")}
                        className="w-5 h-5 border-2 border-gray-300 rounded text-primary-500 focus:ring-primary-500 transition-colors"
                      />
                    </label>

                    {/* Edit */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        Edit
                      </span>
                      <input
                        type="checkbox"
                        checked={isChecked(module.keys, "edit")}
                        onChange={() => handleMatrixChange(module.id, "edit")}
                        className="w-5 h-5 border-2 border-gray-300 rounded text-primary-500 focus:ring-primary-500 transition-colors"
                      />
                    </label>

                    {/* Delete */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        Delete
                      </span>
                      <input
                        type="checkbox"
                        checked={isChecked(module.keys, "delete")}
                        onChange={() => handleMatrixChange(module.id, "delete")}
                        className="w-5 h-5 border-2 border-gray-300 rounded text-primary-500 focus:ring-primary-500 transition-colors"
                      />
                    </label>

                    {/* Approve */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        Approve
                      </span>
                      <input
                        type="checkbox"
                        checked={isChecked(module.keys, "approve")}
                        onChange={() => handleMatrixChange(module.id, "approve")}
                        className="w-5 h-5 border-2 border-gray-300 rounded text-primary-500 focus:ring-primary-500 transition-colors"
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 mt-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            Independent Permission Overrides
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">
            Use these toggles when you need exact per-permission control beyond the matrix.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PERMISSION_KEYS.map((permissionKey) => (
              <label
                key={permissionKey}
                className="flex items-center justify-between gap-3 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2"
              >
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                  {permissionKey}
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(formData.permissions?.[permissionKey])}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      permissions: {
                        ...prev.permissions,
                        [permissionKey]: e.target.checked,
                      },
                    }))
                  }
                  className="w-4 h-4 border-2 border-gray-300 rounded text-primary-500 focus:ring-primary-500 transition-colors"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleForm;
