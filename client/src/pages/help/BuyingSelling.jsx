import React from "react";
import HelpArticlePage from "./HelpArticlePage";

const BuyingSelling = () => {
  const content = (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Buying a Vehicle</h2>
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="text-xl font-semibold mb-2">1. Browse Listings</h3>
            <p>Use our search filters to find vehicles by make, model, price range, location, and more. You can save your favorite listings for later.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">2. View Details</h3>
            <p>Click on any listing to see detailed information including photos, specifications, seller information, and contact details.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">3. Contact Seller</h3>
            <p>Use the contact options (call, chat, or message) to reach out to the seller directly. Ask questions and schedule a viewing.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">4. Make a Purchase</h3>
            <p>Once you've decided, coordinate with the seller to complete the transaction. Always verify the vehicle's condition and documentation.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Selling a Vehicle</h2>
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="text-xl font-semibold mb-2">1. Create a Listing</h3>
            <p>Click "Post Ad" or "Create Post" to start. Fill in all vehicle details including make, model, year, price, and upload clear photos.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">2. Add Photos</h3>
            <p>Upload multiple high-quality photos from different angles. Good photos significantly increase your listing's visibility and interest.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">3. Set Your Price</h3>
            <p>Research similar vehicles to set a competitive price. You can always negotiate with potential buyers.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">4. Manage Inquiries</h3>
            <p>Respond promptly to buyer inquiries through calls, chats, or messages. Be honest about the vehicle's condition.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">5. Complete the Sale</h3>
            <p>Once you find a buyer, arrange a meeting, verify payment, and transfer ownership documents. Mark your listing as sold when complete.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tips for Success</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Always verify the vehicle's documentation and history</li>
          <li>Meet in a safe, public location for viewings</li>
          <li>Get a professional inspection before finalizing large purchases</li>
          <li>Keep all communication records</li>
          <li>Be cautious of deals that seem too good to be true</li>
        </ul>
      </section>
    </div>
  );

  return (
    <HelpArticlePage
      title="Buying & Selling Guide"
      content={content}
      category="Buying & Selling"
    />
  );
};

export default BuyingSelling;
