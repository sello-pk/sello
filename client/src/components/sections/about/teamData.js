import ceoImage from "../../../assets/images/team/ceo.jpg";
import contentWriterImage from "../../../assets/images/team/contentWriter.jpeg";
import managingDirectorImage from "../../../assets/images/team/managingDirector.jpeg";
import generalManagerImage from "../../../assets/images/team/generalManager.jpeg";
import developerImage from "../../../assets/images/team/developer.png";
import seoExpertImage from "../../../assets/images/team/seoExpert.jpg";
import socialMediaMarketerImage from "../../../assets/images/team/socialMediaMarketer.jpeg";

// Single source of truth for the leadership roster. Kept out of the component
// file so both the About page markup and the About page structured data read
// from the same list.
export const teamMembers = [
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
    name: "Mian Muddasar",
    position: "Managing Director",
    description:
      "Overseeing daily operations and strategic initiatives to ensure smooth business execution and sustainable growth for organization.",
    image: managingDirectorImage,
  },
  {
    id: 3,
    name: "Muhammad Awais",
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

export default teamMembers;
