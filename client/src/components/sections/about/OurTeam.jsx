import React from "react";
import ceoImage from "../../../assets/images/team/ceo.jpg";
import contentWriterImage from "../../../assets/images/team/contentWriter.jpeg";
import managingDirectorImage from "../../../assets/images/team/managingDirector.jpeg";
import graphicDesignerImage from "../../../assets/images/team/graphicDesigner.jpeg";
import generalManagerImage from "../../../assets/images/team/generalManager.jpeg";
import developerImage from "../../../assets/images/team/developer.png";
import seoExpertImage from "../../../assets/images/team/seoExpert.jpg";
import socialMediaMarketerImage from "../../../assets/images/team/socialMediaMarketer.jpg";

const OurTeam = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Muhammad Adnan Amin",
      position: "Founder & CEO",
      description:
        "Leading Sello's vision and growth strategy with over 15 years of experience in automotive industry and digital transformation.",
      image: ceoImage,
    },
    {
      id: 2,
      name: "Faisal Zakria",
      position: "Managing Director",
      description:
        "Overseeing daily operations and strategic initiatives to ensure smooth business execution and sustainable growth for organization.",
      image: managingDirectorImage,
    },
    {
      id: 3,
      name: "Zain Riaz",
      position: "General Manager",
      description:
        "Driving sales growth and building strong client relationships with strategic market analysis and team leadership expertise.",
      image: generalManagerImage,
    },
    {
      id: 4,
      name: "Raza Ali",
      position: "Full Stack Software Developer",
      description:
        "Building robust and scalable web applications with modern technologies and innovative solutions to drive digital transformation.",
      image: developerImage,
    },
    {
      id: 5,
      name: "Ibtihaj Shah",
      position: "Social Media Marketer",
      description:
        "Creating engaging social media campaigns and building brand communities across multiple platforms to drive audience engagement.",
      image: socialMediaMarketerImage,
    },
    {
      id: 6,
      name: "Haris Mujahid",
      position: "Graphic Designer",
      description:
        "Creating stunning visual designs and brand identities that captivate audiences and communicate our brand message effectively.",
      image: graphicDesignerImage,
    },
    {
      id: 7,
      name: "Aznain Hameed",
      position: "SEO Expert",
      description:
        "Optimizing digital presence and search rankings with proven strategies to increase organic traffic and improve online visibility.",
      image: seoExpertImage,
    },
    {
      id: 8,
      name: "Warda Hashmi",
      position: "Content Writer",
      description:
        "Creating compelling content and stories that showcase our brand vision and connect with our audience through engaging narratives.",
      image: contentWriterImage,
    },
  ];

  return (
    <div className="py-16 lg:py-28 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <span className="text-primary-600 font-semibold text-xs uppercase tracking-widest px-6 py-3 bg-primary-50 rounded-full border border-primary-100">
              Meet The Team
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Our Team
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-24 h-0.5 bg-primary-500 rounded-full"></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <div className="w-24 h-0.5 bg-primary-500 rounded-full"></div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            The passionate people behind Sello's success
          </p>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 ease-out overflow-hidden max-w-sm mx-auto transform hover:-translate-y-2 border border-gray-100"
            >
              {/* Glow Effect on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

              {/* Top Section - Enhanced Gradient Background */}
              <div className="relative h-72 flex items-center justify-center">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4 w-16 h-16 bg-white/20 rounded-full blur-xl"></div>
                  <div className="absolute bottom-4 right-4 w-20 h-20 bg-white/15 rounded-full blur-2xl"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                {/* Profile Picture with Enhanced Styling */}
                <div className="relative z-10 w-full h-full rounded transform group-hover:scale-105 transition-transform duration-300">
                  <div className="relative w-full h-full overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover  transform group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Subtle Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              </div>

              {/* Enhanced Content Section */}
              <div className="relative p-6 pt-4 text-center">
                {/* Name with Better Typography */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight tracking-tight group-hover:text-primary-500 transition-colors duration-300">
                  {member.name.toUpperCase()}
                </h3>

                {/* Position Badge */}
                <div className="inline-flex items-center px-4 py-2 bg-primary-50 border border-primary-300 rounded-full mb-4">
                  <span className="text-sm font-semibold text-primary-500">
                    {member.position}
                  </span>
                </div>

                {/* Description with Better Readability */}
                <p className="text-sm text-gray-600 mb-6 leading-relaxed line-clamp-3 group-hover:text-gray-700 transition-colors duration-300">
                  {member.description}
                </p>

                {/* Enhanced Tag */}
                <div className="text-xs font-semibold text-gray-500 mb-6 uppercase tracking-wider">
                  Creative at Sello
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurTeam;
