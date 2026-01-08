import React from "react";
import HelpArticlePage from "./HelpArticlePage";

const Enterprise = () => {
  const content = (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Enterprise Solutions</h2>
        <p className="text-gray-700 mb-4">
          Sello offers specialized solutions for dealerships and businesses:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li><strong>Dealer Accounts:</strong> Specialized accounts for professional dealers with enhanced features</li>
          <li><strong>Bulk Listing Tools:</strong> Upload and manage multiple listings efficiently</li>
          <li><strong>Analytics Dashboard:</strong> Track performance, views, and engagement metrics</li>
          <li><strong>Priority Support:</strong> Dedicated support for enterprise customers</li>
          <li><strong>Custom Branding:</strong> Showcase your dealership branding on listings</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Enterprise Features</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Unlimited listings</li>
          <li>Advanced analytics and reporting</li>
          <li>API access for integration</li>
          <li>White-label options</li>
          <li>Custom pricing packages</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Enterprise Sales</h2>
        <p className="text-gray-700 mb-4">
          Interested in enterprise solutions? Contact our sales team:
        </p>
        <ul className="list-none space-y-2 text-gray-700">
          <li>📧 Email: enterprise@sello.ae</li>
          <li>📞 Phone: +971 45 061 300</li>
          <li>💼 Schedule a demo to learn more</li>
        </ul>
      </section>
    </div>
  );

  return (
    <HelpArticlePage
      title="Enterprise Solutions"
      content={content}
      category="Enterprise"
    />
  );
};

export default Enterprise;
