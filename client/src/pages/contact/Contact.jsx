import { corePageSeo } from "../../utils/corePageSeo.js";
import React from "react";
import ContactForm from "../../components/sections/contact/ContactForm";
import ContactMap from "../../components/features/listings/ContactMap";
import SEO from "../../components/common/SEO";
import StructuredData from "../../components/common/StructuredData";

const Contact = () => {
  return (
    <div>
      <StructuredData.ContactPageSchema />
      <SEO {...corePageSeo.contact} />
      <div className="max-w-8xl mx-auto">
        <ContactForm />
      </div>
      <ContactMap />
    </div>
  );
};

export default Contact;
