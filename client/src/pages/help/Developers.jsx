import React from "react";
import HelpArticlePage from "./HelpArticlePage";

const Developers = () => {
  const content = (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">API Documentation</h2>
        <p className="text-gray-700 mb-4">
          Sello provides API access for developers:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li><strong>RESTful API:</strong> Access listings, search, and user data</li>
          <li><strong>Authentication:</strong> OAuth 2.0 and API key authentication</li>
          <li><strong>Rate Limits:</strong> Generous rate limits for API requests</li>
          <li><strong>Webhooks:</strong> Real-time notifications for events</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Getting Started</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
          <li>Register for API access through your account settings</li>
          <li>Generate your API key</li>
          <li>Review API documentation and endpoints</li>
          <li>Start integrating with your application</li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Developer Resources</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Complete API documentation</li>
          <li>Code examples and SDKs</li>
          <li>Developer support forum</li>
          <li>Sandbox environment for testing</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Developer Support</h2>
        <p className="text-gray-700 mb-4">
          For API access and developer questions:
        </p>
        <ul className="list-none space-y-2 text-gray-700">
          <li>📧 Email: developers@sello.ae</li>
          <li>📞 Phone: +971 45 061 300</li>
          <li>📚 Documentation: docs.sello.ae</li>
        </ul>
      </section>
    </div>
  );

  return (
    <HelpArticlePage
      title="Developer Resources"
      content={content}
      category="Developers"
    />
  );
};

export default Developers;
