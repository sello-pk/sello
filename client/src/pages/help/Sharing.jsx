import React from "react";
import HelpArticlePage from "./HelpArticlePage";

const Sharing = () => {
  const content = (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sharing Listings</h2>
        <p className="text-gray-700 mb-4">
          Share listings with others:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
          <li>Open any listing detail page</li>
          <li>Click the "Share" button</li>
          <li>Choose your sharing method:
            <ul className="list-disc list-inside ml-6 mt-2">
              <li>Copy link to share via email, WhatsApp, or social media</li>
              <li>Share directly to social media platforms</li>
              <li>Generate a QR code for easy sharing</li>
            </ul>
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Embedding Listings</h2>
        <p className="text-gray-700 mb-4">
          For dealers and businesses, you can embed listings:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Get embed code from listing options</li>
          <li>Copy the HTML embed code</li>
          <li>Paste into your website or blog</li>
          <li>Listing will display with live updates</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Social Media Integration</h2>
        <p className="text-gray-700 mb-4">
          Share directly to:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Facebook</li>
          <li>Twitter/X</li>
          <li>WhatsApp</li>
          <li>Email</li>
          <li>LinkedIn</li>
        </ul>
      </section>
    </div>
  );

  return (
    <HelpArticlePage
      title="Embedding & Sharing"
      content={content}
      category="Sharing"
    />
  );
};

export default Sharing;
