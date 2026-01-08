import React from "react";
import HelpArticlePage from "./HelpArticlePage";

const Managing = () => {
  const content = (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Your Listings</h2>
        <p className="text-gray-700 mb-4">
          Access and manage all your listings from the "My Listings" section:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li><strong>View All Listings:</strong> See all your active, pending, and sold listings</li>
          <li><strong>Edit Listings:</strong> Update details, photos, or price anytime</li>
          <li><strong>Delete Listings:</strong> Remove listings that are no longer available</li>
          <li><strong>Mark as Sold:</strong> Update listing status when vehicle is sold</li>
          <li><strong>Boost Listings:</strong> Promote your listings for better visibility</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard Organization</h2>
        <p className="text-gray-700 mb-4">
          Organize your dashboard:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>View statistics and analytics for your listings</li>
          <li>Track views, inquiries, and engagement</li>
          <li>Manage saved listings and favorites</li>
          <li>Access your chat conversations</li>
          <li>View payment history and subscriptions</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Bulk Actions</h2>
        <p className="text-gray-700 mb-4">
          For dealers with multiple listings:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Select multiple listings for bulk operations</li>
          <li>Update prices or status for multiple listings</li>
          <li>Delete multiple listings at once</li>
          <li>Export listing data for record keeping</li>
        </ul>
      </section>
    </div>
  );

  return (
    <HelpArticlePage
      title="Managing & Organizing"
      content={content}
      category="Management"
    />
  );
};

export default Managing;
