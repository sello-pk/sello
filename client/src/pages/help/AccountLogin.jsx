import React from "react";
import HelpArticlePage from "./HelpArticlePage";

const AccountLogin = () => {
  const content = (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Creating an Account</h2>
        <p className="text-gray-700 mb-4">
          To create an account on Sello, follow these simple steps:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
          <li>Click on the "Sign Up" button in the top right corner</li>
          <li>Enter your email address and create a secure password</li>
          <li>Fill in your personal information (name, phone number)</li>
          <li>Verify your email address through the confirmation link sent to your inbox</li>
          <li>Complete your profile setup</li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Logging In</h2>
        <p className="text-gray-700 mb-4">
          To log in to your account:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
          <li>Click on the "Login" button</li>
          <li>Enter your email address and password</li>
          <li>Click "Sign In" to access your account</li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Forgot Password?</h2>
        <p className="text-gray-700 mb-4">
          If you've forgotten your password:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
          <li>Click on "Forgot Password" on the login page</li>
          <li>Enter your registered email address</li>
          <li>Check your email for the password reset link</li>
          <li>Click the link and create a new password</li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Security</h2>
        <p className="text-gray-700 mb-4">
          Keep your account secure by:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Using a strong, unique password</li>
          <li>Never sharing your login credentials</li>
          <li>Logging out when using shared devices</li>
          <li>Enabling two-factor authentication if available</li>
        </ul>
      </section>
    </div>
  );

  return (
    <HelpArticlePage
      title="Account & Login"
      content={content}
      category="Account Management"
    />
  );
};

export default AccountLogin;
