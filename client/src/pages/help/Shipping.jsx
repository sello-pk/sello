import React from "react";
import HelpArticlePage from "./HelpArticlePage";

const Shipping = () => {
  const content = (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Vehicle Delivery Options</h2>
        <p className="text-gray-700 mb-4">
          When purchasing a vehicle, you have several delivery options:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li><strong>Local Pickup:</strong> Arrange to pick up the vehicle directly from the seller</li>
          <li><strong>Seller Delivery:</strong> Some sellers offer delivery services (terms to be discussed)</li>
          <li><strong>Third-Party Shipping:</strong> Use professional vehicle transport services</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Delivery Process</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
          <li>Coordinate delivery details with the seller</li>
          <li>Verify the vehicle's condition upon delivery</li>
          <li>Complete all necessary documentation</li>
          <li>Confirm receipt and finalize the transaction</li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Important Notes</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Always inspect the vehicle before accepting delivery</li>
          <li>Verify all documentation matches the vehicle</li>
          <li>Keep records of all delivery-related communications</li>
          <li>Report any issues immediately to the seller and our support team</li>
        </ul>
      </section>
    </div>
  );

  return (
    <HelpArticlePage
      title="Shipping & Delivery"
      content={content}
      category="Delivery"
    />
  );
};

export default Shipping;
