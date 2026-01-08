import React from "react";
import HelpArticlePage from "./HelpArticlePage";

const Payments = () => {
  const content = (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Methods</h2>
        <p className="text-gray-700 mb-4">
          Sello supports various payment methods for subscriptions and premium features:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li><strong>Credit/Debit Cards:</strong> Visa, Mastercard, and other major cards</li>
          <li><strong>Bank Transfer:</strong> Direct bank transfers for larger transactions</li>
          <li><strong>Digital Wallets:</strong> Supported digital payment platforms</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Subscription Plans</h2>
        <p className="text-gray-700 mb-4">
          We offer various subscription plans to enhance your experience:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li><strong>Basic Plan:</strong> Unlimited listings and priority support</li>
          <li><strong>Premium Plan:</strong> All Basic features plus analytics and advanced filters</li>
          <li><strong>Dealer Plan:</strong> Complete package for professional dealers</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Security</h2>
        <p className="text-gray-700 mb-4">
          Your payment information is secure:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>All transactions are encrypted and secure</li>
          <li>We use industry-standard payment processors</li>
          <li>Your card details are never stored on our servers</li>
          <li>PCI DSS compliant payment processing</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refunds</h2>
        <p className="text-gray-700 mb-4">
          Refund policy:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Subscription refunds are processed within 7-14 business days</li>
          <li>Contact support for refund requests</li>
          <li>Refunds are subject to our terms and conditions</li>
        </ul>
      </section>
    </div>
  );

  return (
    <HelpArticlePage
      title="Payments & Refunds"
      content={content}
      category="Payments"
    />
  );
};

export default Payments;
