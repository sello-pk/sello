import React from "react";
import HelpArticlePage from "./HelpArticlePage";

const Billing = () => {
  const content = (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Subscription Billing</h2>
        <p className="text-gray-700 mb-4">
          How subscription billing works:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Subscriptions are billed monthly on the same date you first subscribed</li>
          <li>You'll receive an email receipt for each payment</li>
          <li>Payment history is available in your profile under "Subscription"</li>
          <li>Auto-renewal can be enabled or disabled anytime</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Billing Information</h2>
        <p className="text-gray-700 mb-4">
          Update your billing information:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
          <li>Go to your Profile → Subscription section</li>
          <li>Click on "Manage Billing" or "Payment Methods"</li>
          <li>Update your payment method or billing address</li>
          <li>Save your changes</li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Issues</h2>
        <p className="text-gray-700 mb-4">
          If you experience payment problems:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Check that your payment method is valid and has sufficient funds</li>
          <li>Verify your billing address matches your payment method</li>
          <li>Contact your bank or card issuer if the payment is declined</li>
          <li>Contact our support team for assistance</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refunds</h2>
        <p className="text-gray-700 mb-4">
          Refund requests:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Contact support within 7 days of payment for refund consideration</li>
          <li>Refunds are processed within 7-14 business days</li>
          <li>Refund eligibility is subject to our terms and conditions</li>
        </ul>
      </section>
    </div>
  );

  return (
    <HelpArticlePage
      title="Billing & Membership"
      content={content}
      category="Billing"
    />
  );
};

export default Billing;
