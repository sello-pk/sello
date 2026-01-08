import React from "react";
import HelpArticlePage from "./HelpArticlePage";

const Features = () => {
  const content = (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Platform Features</h2>
        <p className="text-gray-700 mb-4">
          Sello offers a comprehensive set of features:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Search & Filter</h3>
            <p className="text-sm text-gray-600">Advanced search with multiple filters for make, model, price, location, and more</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Save Listings</h3>
            <p className="text-sm text-gray-600">Save your favorite listings to view and compare later</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Direct Messaging</h3>
            <p className="text-sm text-gray-600">Chat directly with sellers through our secure messaging system</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Listing Boost</h3>
            <p className="text-sm text-gray-600">Promote your listings to get more visibility and inquiries</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Mobile App</h3>
            <p className="text-sm text-gray-600">Access Sello on the go with our mobile applications</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Notifications</h3>
            <p className="text-sm text-gray-600">Get notified about new listings, messages, and updates</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Premium Features</h2>
        <p className="text-gray-700 mb-4">
          Unlock additional features with subscription plans:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Unlimited listings</li>
          <li>Priority customer support</li>
          <li>Advanced analytics</li>
          <li>Listing boost credits</li>
          <li>Featured listing badges</li>
        </ul>
      </section>
    </div>
  );

  return (
    <HelpArticlePage
      title="Platform Features"
      content={content}
      category="Features"
    />
  );
};

export default Features;
