import React from "react";
import SEO from "../../components/common/SEO";

const OurPrivacyPolicy = () => {
  return (
    <>
      <SEO
        title="Privacy Policy - Your Data Protection Rights | Sello.pk"
        description="Sello.pk privacy policy explains how we collect, use, and protect your personal information when you buy or sell cars on our platform, including cookies and Google AdSense."
        keywords="privacy policy, data protection, personal information, user privacy, cookies, Google AdSense, car marketplace"
        canonical="https://sello.pk/privacy-policy"
      />
      <h1 className="sr-only">Privacy Policy - Sello.pk</h1>
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-12">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-800">
          <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
            Privacy Policy – Sello.pk
          </h1>
          <section className="mb-8">
            <p className="mb-4 text-sm text-gray-500 text-center">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </section>

          <section className="mb-8">
            <p className="mb-4">
              At Sello.pk, we are committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, store, and share
              information when you use our website or related services to buy or
              sell vehicles in Pakistan.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              1. Information We Collect
            </h2>
            <p className="mb-2">When you use Sello.pk we may collect:</p>
            <ul className="list-disc list-inside mb-2 space-y-1">
              <li>Name, phone number, and email address</li>
              <li>Location and city related to listings or searches</li>
              <li>Device, browser, and approximate IP-related technical data</li>
              <li>Vehicle listings and related content you submit</li>
              <li>Messages exchanged on the platform</li>
              <li>
                Cookie and similar technology data used for security, analytics,
                and advertising (see Cookies &amp; Advertising below)
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              2. Why We Collect Your Information
            </h2>
            <ul className="list-disc list-inside mb-2 space-y-1">
              <li>To deliver, operate, and improve our marketplace services</li>
              <li>To verify accounts and help prevent fraud and abuse</li>
              <li>To send service updates and, if you opt in, promotions</li>
              <li>
                To measure site performance and show relevant advertising
                (including Google AdSense)
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              3. Data Protection, Security &amp; Sharing
            </h2>
            <ul className="list-disc list-inside mb-2 space-y-1">
              <li>SSL/TLS encryption protects data in transit</li>
              <li>
                Account and listing data are stored on secured servers with
                restricted access
              </li>
              <li>
                We do <strong>not</strong> sell your personal contact details as
                a product
              </li>
              <li>
                We use trusted service providers who process data on our behalf
                or as independent controllers for advertising/analytics, for
                example Google (Analytics, AdSense, Tag Manager), Microsoft
                Clarity, Meta (Facebook Pixel), TikTok, and similar tools. Those
                providers have their own privacy policies
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Your Rights</h2>
            <ul className="list-disc list-inside mb-2 space-y-1">
              <li>Request access to your personal data</li>
              <li>Request removal of your account and related data</li>
              <li>Cancel marketing communications at any time</li>
              <li>
                Opt out of personalized advertising via the links in the
                Advertising section below
              </li>
              <li>Contact our support team for privacy requests</li>
            </ul>
          </section>

          <section className="mb-8" id="cookies">
            <h2 className="text-2xl font-semibold mb-4">
              5. Cookies &amp; Similar Technologies
            </h2>
            <p className="mb-2">
              <strong>What are cookies?</strong> Cookies are small files stored
              on your device. We also use related technologies (pixels, local
              storage, tags) for the same purposes.
            </p>
            <p className="mb-2">
              <strong>How we use them</strong>
            </p>
            <ul className="list-disc list-inside mb-2 space-y-1">
              <li>Essential: login sessions, security, and core site features</li>
              <li>
                Analytics: understand traffic and improve the product (for
                example Google Analytics, Microsoft Clarity)
              </li>
              <li>
                Advertising: serve and measure ads, including Google AdSense
                advertising cookies
              </li>
            </ul>
            <p className="mb-2">
              You can control cookies in your browser settings. Blocking some
              cookies may limit site features. Where we show a cookie notice, you
              can acknowledge it before non-essential advertising and analytics
              tags load.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Third-Party Tools</h2>
            <p className="mb-2">
              We may use third-party analytics and advertising tools to monitor
              performance, understand how the site is used, and fund the
              platform through ads. Examples include Google Analytics, Google
              Tag Manager, Google AdSense, Microsoft Clarity, Meta Pixel, and
              TikTok Pixel.
            </p>

            <h3
              id="advertising"
              className="text-xl font-semibold mt-6 mb-3 scroll-mt-24"
            >
              Advertising (Google AdSense)
            </h3>
            <p className="mb-2">
              Sello.pk may show ads served by Google AdSense. Third-party
              vendors, including Google, use cookies to serve ads based on a
              user&apos;s prior visits to your website or other websites.
              Google&apos;s use of advertising cookies enables it and its
              partners to serve ads to you based on your visit to Sello.pk
              and/or other sites on the Internet.
            </p>
            <ul className="list-disc list-inside mb-2 space-y-1">
              <li>
                You may opt out of personalized advertising by visiting{" "}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 underline"
                >
                  Google Ads Settings
                </a>
                .
              </li>
              <li>
                Learn how Google uses information from sites that use its
                services:{" "}
                <a
                  href="https://policies.google.com/technologies/partner-sites"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 underline"
                >
                  How Google uses data when you use our partners&apos; sites or
                  apps
                </a>
                .
              </li>
              <li>
                You can also opt out of some third-party vendors&apos; use of
                cookies for personalized advertising at{" "}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 underline"
                >
                  www.aboutads.info
                </a>
                .
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              7. Refund &amp; Dispute Policy for Paid Features
            </h2>
            <ul className="list-disc list-inside mb-2 space-y-1">
              <li>
                Refunds may be given when a Sello.pk technical issue prevents
                delivery of a paid service (for example a premium or featured
                listing).
              </li>
              <li>
                No refunds for user errors, fake or misleading listings, or
                voluntary removal of paid promotions.
              </li>
              <li>Raise payment disputes within 7 days of payment.</li>
              <li>
                Buyers and sellers are responsible for verifying transactions
                between themselves.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              8. Changes to This Privacy Policy
            </h2>
            <p className="mb-2">
              We may update this Privacy Policy from time to time. When we do,
              we will post the revised policy on this page with an updated
              effective date. Continued use of the site after changes means you
              accept the revised policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p className="mb-2">
              For privacy concerns, data requests, or disputes, contact:
            </p>
            <p className="mb-1">
              <strong>Sello Team</strong>
            </p>
            <p className="mb-1">
              Email:{" "}
              <a
                href="mailto:support@sello.pk"
                className="text-primary-500 underline"
              >
                support@sello.pk
              </a>
            </p>
            <p className="mb-1">
              Email:{" "}
              <a
                href="mailto:info@sello.pk"
                className="text-primary-500 underline"
              >
                info@sello.pk
              </a>
            </p>
            <p className="mb-1">Phone: +92 312 2221474</p>
            <p className="mb-1">WhatsApp: +92 313 4211023</p>
            <p className="mb-1">Address: Gateway Mall, Okara 56300, Pakistan</p>
          </section>

          <p className="mt-10 text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} Sello.pk. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
};

export default OurPrivacyPolicy;
