import React from "react";
import HelpArticlePage from "./HelpArticlePage";

const PaymentMethods = () => {
  const content = (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accepted Payment Methods</h2>
        <p className="text-gray-700 mb-4">
          Sello accepts the following payment methods for subscriptions and premium features:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Credit & Debit Cards</h3>
            <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Bank Transfer</h3>
            <p className="text-sm text-gray-600">Direct bank transfers</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Processing</h2>
        <p className="text-gray-700 mb-4">
          All payments are processed securely:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Payments are processed through secure payment gateways</li>
          <li>Your card information is encrypted and never stored</li>
          <li>Transactions are PCI DSS compliant</li>
          <li>You'll receive email confirmation for all transactions</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Subscription Payments</h2>
        <p className="text-gray-700 mb-4">
          For subscription plans:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Subscriptions are billed automatically on a monthly basis</li>
          <li>You can cancel auto-renewal anytime from your account settings</li>
          <li>Your subscription remains active until the end of the billing period</li>
          <li>Payment history is available in your profile</li>
        </ul>
      </section>
    </div>
  );

  return (
    <HelpArticlePage
      title="Payment Methods"
      content={content}
      category="Payments"
    />
  );
};

export default PaymentMethods;
