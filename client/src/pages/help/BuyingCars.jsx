import React from "react";
import HelpArticlePage from "./HelpArticlePage";

const BuyingCars = () => {
  const content = (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Buy a Car on Sello</h2>
        <p className="text-gray-700 mb-4">
          Follow these steps to find and purchase your perfect vehicle:
        </p>
        <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
          <li><strong>Search and Filter:</strong> Use our advanced search filters to find vehicles by make, model, price, location, year, and more</li>
          <li><strong>Browse Listings:</strong> View detailed listings with photos, specifications, and seller information</li>
          <li><strong>Save Favorites:</strong> Save listings you're interested in to compare later</li>
          <li><strong>Contact Seller:</strong> Use call, chat, or message features to contact the seller</li>
          <li><strong>Schedule Viewing:</strong> Arrange a time to see the vehicle in person</li>
          <li><strong>Inspect Vehicle:</strong> Thoroughly inspect the vehicle and verify all documentation</li>
          <li><strong>Negotiate Price:</strong> Discuss the price and terms with the seller</li>
          <li><strong>Complete Purchase:</strong> Finalize the transaction and transfer ownership</li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tips for Buyers</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Set a budget before you start searching</li>
          <li>Research the make and model you're interested in</li>
          <li>Check the vehicle's history and documentation</li>
          <li>Get a professional inspection for expensive vehicles</li>
          <li>Verify the seller's identity and credentials</li>
          <li>Read reviews and ratings if available</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">What to Check</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Vehicle condition and mileage</li>
          <li>Service history and maintenance records</li>
          <li>Ownership documents and registration</li>
          <li>Any accidents or damage history</li>
          <li>Test drive the vehicle</li>
          <li>Verify all features and accessories</li>
        </ul>
      </section>
    </div>
  );

  return (
    <HelpArticlePage
      title="Buying Cars"
      content={content}
      category="Buying"
    />
  );
};

export default BuyingCars;
