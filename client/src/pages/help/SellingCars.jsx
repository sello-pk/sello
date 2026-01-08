import React from "react";
import HelpArticlePage from "./HelpArticlePage";

const SellingCars = () => {
  const content = (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Sell Your Car on Sello</h2>
        <p className="text-gray-700 mb-4">
          Follow these steps to successfully sell your vehicle:
        </p>
        <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
          <li><strong>Create Account:</strong> Sign up or log in to your Sello account</li>
          <li><strong>Click "Post Ad":</strong> Navigate to the "Create Post" or "Post Ad" section</li>
          <li><strong>Fill Vehicle Details:</strong> Enter all vehicle information including make, model, year, mileage, price, and specifications</li>
          <li><strong>Upload Photos:</strong> Add multiple high-quality photos from different angles (interior, exterior, engine, etc.)</li>
          <li><strong>Add Description:</strong> Write a detailed description highlighting key features and condition</li>
          <li><strong>Set Location:</strong> Specify your location for local buyers</li>
          <li><strong>Publish Listing:</strong> Review and publish your listing</li>
          <li><strong>Manage Inquiries:</strong> Respond to buyer questions and schedule viewings</li>
          <li><strong>Complete Sale:</strong> Finalize the transaction and mark listing as sold</li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tips for Sellers</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Take clear, well-lit photos from multiple angles</li>
          <li>Be honest about the vehicle's condition</li>
          <li>Set a competitive price based on market research</li>
          <li>Respond quickly to buyer inquiries</li>
          <li>Keep your listing updated</li>
          <li>Consider using premium features to boost visibility</li>
          <li>Prepare all documentation before listing</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Your Listing</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Edit your listing anytime from "My Listings"</li>
          <li>Boost your listing to increase visibility</li>
          <li>Mark as sold when the vehicle is purchased</li>
          <li>Delete listings that are no longer available</li>
          <li>Track views and inquiries in your dashboard</li>
        </ul>
      </section>
    </div>
  );

  return (
    <HelpArticlePage
      title="Selling Cars"
      content={content}
      category="Selling"
    />
  );
};

export default SellingCars;
