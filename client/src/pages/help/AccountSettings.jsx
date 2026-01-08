import React from "react";
import HelpArticlePage from "./HelpArticlePage";

const AccountSettings = () => {
  const content = (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Your Profile</h2>
        <p className="text-gray-700 mb-4">
          Access your profile settings by clicking on your profile icon or navigating to "Profile" from the menu.
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li><strong>Personal Information:</strong> Update your name, email, phone number, and address</li>
          <li><strong>Profile Photo:</strong> Upload or change your profile picture</li>
          <li><strong>Password:</strong> Change your account password for security</li>
          <li><strong>Notifications:</strong> Manage email and push notification preferences</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Privacy Settings</h2>
        <p className="text-gray-700 mb-4">
          Control your privacy and visibility:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Control who can see your contact information</li>
          <li>Manage your listing visibility</li>
          <li>Set communication preferences</li>
          <li>Control data sharing settings</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Preferences</h2>
        <p className="text-gray-700 mb-4">
          Customize your experience:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Language preferences</li>
          <li>Currency settings</li>
          <li>Default search filters</li>
          <li>Email frequency settings</li>
        </ul>
      </section>
    </div>
  );

  return (
    <HelpArticlePage
      title="Account Settings"
      content={content}
      category="Account"
    />
  );
};

export default AccountSettings;
