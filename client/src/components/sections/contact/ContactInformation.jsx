import React from "react";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { FaPhoneAlt, FaClock, FaWhatsapp } from "react-icons/fa";
import { FiMail, FiPhone, FiMapPin, FiClock } from "react-icons/fi";

const ContactInformation = () => {
  const contactInfo = [
    {
      icon: FiMail,
      title: "Email Address",
      items: [
        {
          label: "General Inquiries",
          value: "info@sello.pk",
          link: "mailto:info@sello.pk",
        },
        {
          label: "Support",
          value: "support@sello.pk",
          link: "mailto:support@sello.pk",
        },
      ],
      color: "bg-primary-50 text-primary-600",
    },
    {
      icon: FiPhone,
      title: "Phone Number",
      items: [
        {
          label: "Support Line",
          value: "+923122221474",
          link: "tel:+923122221474",
        },
        {
          label: "WhatsApp",
          value: "+92 313 4211023",
          link: "https://wa.me/923134211023",
        },
      ],
      color: "bg-green-50 text-green-600",
    },
    {
      icon: FiMapPin,
      title: "Office Address",
      items: [
        {
          label: "Head Office",
          value: "RFJW+4XR Okara, Pakistan",
          link: null,
        },
      ],
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: FiClock,
      title: "Business Hours",
      items: [
        { label: "Sunday - Thursday", value: "9:00 AM - 6:00 PM", link: null },
        { label: "Friday", value: "9:00 AM - 1:00 PM", link: null },
        { label: "Saturday", value: "Closed", link: null },
      ],
      color: "bg-primary-50 text-primary-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r  from-bg-primary-400 to-bg-primary-500 rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Contact Information
        </h2>
        <p className="text-gray-600 mb-8">
          We are with you at every step of the way. Our team will guide you for
          any of your questions or concerns.
        </p>

        <div className="space-y-6">
          {contactInfo.map((info, index) => {
            const IconComponent = info.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className={`${info.color} p-3 rounded-lg flex-shrink-0`}>
                    <IconComponent size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {info.title}
                    </h3>
                    <div className="space-y-2">
                      {info.items.map((item, itemIndex) => (
                        <div key={itemIndex}>
                          {item.link ? (
                            <a
                              href={item.link}
                              className="block text-gray-700 hover:text-primary-500 transition-colors"
                              target={item.label === "WhatsApp" ? "_blank" : "_self"}
                              rel={item.label === "WhatsApp" ? "noopener noreferrer" : ""}
                            >
                              <span className="text-sm font-medium text-gray-500 block mb-1">
                                {item.label}:
                              </span>
                              <span className="text-base inline-flex items-center gap-2">
                                {item.value}
                                {item.label === "WhatsApp" && <FaWhatsapp size={16} />}
                              </span>
                            </a>
                          ) : (
                            <div>
                              <span className="text-sm font-medium text-gray-500 block mb-1">
                                {item.label}:
                              </span>
                              <span className="text-base text-gray-700">
                                {item.value}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Help Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-400 rounded-2xl shadow-xl p-8 text-white">
        <h3 className="text-xl font-bold mb-3">24/7 Support Available</h3>
        <p className="text-primary-100 mb-4">
          Get support as soon as you need it.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="tel:+923122221474"
            className="inline-flex items-center gap-2 bg-white text-primary-500 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <FiPhone size={20} />
            Call Now: +923122221474
          </a>
          <a
            href="https://wa.me/923134211023"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            <FaWhatsapp size={20} />
            WhatsApp: +92 313 4211023
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactInformation;
