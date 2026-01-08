import React from "react";
import HelpArticlePage from "./HelpArticlePage";

const Safety = () => {
  const content = (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Safety Guidelines</h2>
        <p className="text-gray-700 mb-4">
          Your safety is our priority. Follow these guidelines when buying or selling:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li><strong>Meet in Public:</strong> Always meet in a safe, public location for viewings</li>
          <li><strong>Bring a Friend:</strong> Consider bringing someone with you for safety</li>
          <li><strong>Verify Identity:</strong> Verify the seller's identity and vehicle documentation</li>
          <li><strong>Inspect Thoroughly:</strong> Always inspect the vehicle in person before purchasing</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Security Features</h2>
        <p className="text-gray-700 mb-4">
          We provide several security features:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Verified seller badges for trusted dealers</li>
          <li>User verification and profile verification</li>
          <li>Secure messaging system</li>
          <li>Report suspicious activity feature</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Reporting Issues</h2>
        <p className="text-gray-700 mb-4">
          If you encounter any safety or security concerns:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
          <li>Report the issue immediately through our contact form</li>
          <li>Contact our support team at info@sello.ae</li>
          <li>In case of fraud, contact local authorities</li>
          <li>We will investigate and take appropriate action</li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Protection</h2>
        <p className="text-gray-700 mb-4">
          We protect your personal information:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Encrypted data transmission</li>
          <li>Secure payment processing</li>
          <li>Privacy-focused design</li>
          <li>Regular security audits</li>
        </ul>
      </section>
    </div>
  );

  return (
    <HelpArticlePage
      title="Safety & Security"
      content={content}
      category="Safety"
    />
  );
};

export default Safety;
