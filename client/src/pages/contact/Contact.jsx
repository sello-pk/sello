import React from "react";
import ContactForm from "../../components/sections/contact/ContactForm";
import ContactMap from "../../components/features/listings/ContactMap";
import SEO from "../../components/common/SEO";
import StructuredData from "../../components/common/StructuredData";
import { AdSenseSlot } from "../../components/ads";

const Contact = () => {
  return (
    <div>
      <StructuredData.ContactPageSchema />
      <SEO
        title="Contact Us | 24/7 Car Marketplace Support – Sello.pk"
        description="Need help buying or selling a car in Pakistan? Contact Sello.pk for fast, reliable support. We're here to guide you every step of the way."
        canonical="https://sello.pk/contact"
      />
      <div className="max-w-8xl mx-auto">
        <ContactForm />
      </div>
      <div className="px-4 sm:px-6 lg:px-8">
        <AdSenseSlot slot="contact" />
      </div>
      <ContactMap />
    </div>
  );
};

export default Contact;
