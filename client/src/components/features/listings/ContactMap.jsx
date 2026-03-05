import React from "react";
import { FiPhone, FiMail, FiMapPin, FiClock } from "react-icons/fi";

const ContactCard = ({ contact }) => (
  <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm">
    <h2 className="text-2xl font-bold text-gray-900 mb-2">{contact.title}</h2>
    <p className="text-sm text-gray-600 mb-6">{contact.subtitle}</p>

    {/* Phone */}
    <a
      href={`tel:${contact.phone}`}
      className="flex items-center gap-3 bg-primary-50 text-primary-500 px-4 py-3 rounded-lg hover:bg-primary-100 mb-4 transition-colors group"
    >
      <FiPhone className="text-lg group-hover:scale-110 transition-transform" />
      <span className="font-medium">{contact.phone}</span>
    </a>

    {/* Email */}
    <a
      href={`mailto:${contact.email}`}
      className="flex items-center gap-3 bg-gray-50 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-100 mb-4 transition-colors group"
    >
      <FiMail className="text-lg group-hover:scale-110 transition-transform" />
      <span className="font-medium">{contact.email}</span>
    </a>

    {/* Address */}
    <div className="flex items-start gap-3 bg-gray-50 px-4 py-3 rounded-lg mb-4">
      <FiMapPin className="text-lg text-gray-600 mt-0.5" />
      <span className="text-sm text-gray-700">{contact.address}</span>
    </div>

    {/* Hours */}
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-center gap-2 mb-3">
        <FiClock className="text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-700">Business Hours</h3>
      </div>
      <ul className="text-sm text-gray-600 space-y-1.5">
        {contact.hours.map((h) => (
          <li key={h.day} className="flex justify-between">
            <span>{h.day}:</span>
            <span className="font-medium text-gray-900">{h.hours}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const ContactMap = () => {
  const contact = {
    title: "Visit Our Office",
    subtitle: "Sello Head Office",
    phone: "+923134211023",
    email: "info@sello.pk",
    address: "RFJW+4XR Okara, Pakistan",
    hours: [
      { day: "Sunday - Thursday", hours: "9:00 AM - 6:00 PM" },
      { day: "Friday", hours: "9:00 AM - 1:00 PM" },
      { day: "Saturday", hours: "Closed" },
    ],
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3426.010708762713!2d73.49483107558429!3d30.830366074537356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzDCsDQ5JzQ5LjMiTiA3M8KwMjknNTAuNyJF!5e0!3m2!1sen!2s!4v1772727762737!5m2!1sen!2s",
  };

  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] rounded-2xl overflow-hidden shadow-2xl">
      {/* Map */}
      <iframe
        title="Sello.pk Office Location"
        src={contact.mapUrl}
        className="absolute inset-0 w-full h-full border-0"
        loading="lazy"
        allowFullScreen
      />

      {/* Card Overlay */}
      <div className="absolute right-4 top-6 md:right-16 md:top-16 z-10">
        <ContactCard contact={contact} />
      </div>
    </section>
  );
};

export default ContactMap;
