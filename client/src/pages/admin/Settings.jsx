import React, { useState } from "react";
import AdminLayout from "../../components/features/admin/AdminLayout";
import GeneralSettingsTab from "../../components/features/admin/settings/GeneralSettingsTab";
import UserRolesTab from "../../components/features/admin/settings/UserRolesTab";
import { CompareSettings } from "../../components/features/admin/CarCompareManagement.jsx";
import { useGetMeQuery } from "../../redux/services/api";
import { canAccessMenu } from "../../utils/roleAccess";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general"); // 'general' or 'roles'
  const { data: user } = useGetMeQuery();
  const canManageCompare = canAccessMenu(user, "/admin/car-catalog");

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Settings
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mt-1">
              Configure your marketplace settings
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab("general")}
              className={`whitespace-nowrap px-4 sm:px-6 py-2 rounded-md font-medium text-sm transition-all ${
                activeTab === "general"
                  ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              General Settings
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={`whitespace-nowrap px-4 sm:px-6 py-2 rounded-md font-medium text-sm transition-all ${
                activeTab === "roles"
                  ? "bg-primary-500 dark:bg-primary-500 text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              User Role
            </button>
            {canManageCompare && <button type="button" onClick={() => setActiveTab("compare")}
              className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ${activeTab === "compare" ? "bg-white text-slate-950 shadow-sm" : "text-gray-600 dark:text-gray-300"}`}>
              Car Compare
            </button>}
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-fade-in">
          {activeTab === "compare" && canManageCompare ? <CompareSettings aiOnly /> : activeTab === "roles" ? <UserRolesTab /> : <GeneralSettingsTab />}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
