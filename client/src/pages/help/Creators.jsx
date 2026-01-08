import React from "react";
import HelpArticlePage from "./HelpArticlePage";

const Creators = () => {
  const content = (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Content Creator Resources</h2>
        <p className="text-gray-700 mb-4">
          Resources for content creators and influencers:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li><strong>Partnership Program:</strong> Join our creator partnership program</li>
          <li><strong>Content Guidelines:</strong> Best practices for creating vehicle content</li>
          <li><strong>Promotional Tools:</strong> Access to promotional materials and assets</li>
          <li><strong>Affiliate Program:</strong> Earn commissions by referring users</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Getting Started</h2>
        <p className="text-gray-700 mb-4">
          To become a creator partner:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
          <li>Contact our partnerships team</li>
          <li>Submit your portfolio or content samples</li>
          <li>Review partnership terms and benefits</li>
          <li>Get approved and start creating</li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
        <p className="text-gray-700 mb-4">
          For creator partnerships:
        </p>
        <ul className="list-none space-y-2 text-gray-700">
          <li>📧 Email: creators@sello.ae</li>
          <li>📞 Phone: +971 45 061 300</li>
        </ul>
      </section>
    </div>
  );

  return (
    <HelpArticlePage
      title="Creators & Partnerships"
      content={content}
      category="Creators"
    />
  );
};

export default Creators;
