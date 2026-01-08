import React from "react";
import HelpArticlePage from "./HelpArticlePage";

const Sales = () => {
  const content = (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sales Tips & Strategies</h2>
        <p className="text-gray-700 mb-4">
          Maximize your sales success with these tips:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li><strong>Quality Photos:</strong> High-quality, well-lit photos significantly increase interest</li>
          <li><strong>Detailed Descriptions:</strong> Provide comprehensive information about the vehicle</li>
          <li><strong>Competitive Pricing:</strong> Research market prices and set competitive rates</li>
          <li><strong>Quick Responses:</strong> Respond to inquiries promptly to maintain buyer interest</li>
          <li><strong>Boost Visibility:</strong> Use boost features to appear at the top of search results</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pricing Strategy</h2>
        <p className="text-gray-700 mb-4">
          Tips for setting the right price:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Research similar vehicles in your area</li>
          <li>Consider vehicle condition, mileage, and age</li>
          <li>Factor in market demand</li>
          <li>Leave room for negotiation</li>
          <li>Update price if listing doesn't get attention</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Closing the Sale</h2>
        <p className="text-gray-700 mb-4">
          Best practices for finalizing sales:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Be transparent about vehicle condition</li>
          <li>Prepare all necessary documentation</li>
          <li>Arrange safe meeting locations</li>
          <li>Verify payment before transferring ownership</li>
          <li>Complete all paperwork properly</li>
        </ul>
      </section>
    </div>
  );

  return (
    <HelpArticlePage
      title="Sales Tips & Strategies"
      content={content}
      category="Sales"
    />
  );
};

export default Sales;
