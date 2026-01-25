import latestSectionCarImg from "./latestSectionCarImg.png";
import newTech from "./newTech.png";
import newTech2 from "./newTech2.png";
import newTech3 from "./newTech3.png";
import newTech4 from "./newTech4.png";
import person from "./person.png";

import cate from "./cate.png";
import cate2 from "./cate2.png";
import cate3 from "./cate3.png";
import cate4 from "./cate4.png";

import bottomRevCar from "./bottomRevCar.png";
import bottomRevCar2 from "./bottomRevCar2.png";

export const blogAssets = {
  latestSectionCarImg,
  person,
  bottomRevCar,
  bottomRevCar2,
};

// New technology
export const newTechnology = [
  {
    id: 1,
    title: "A Review of Cars With Advanced Infotainment Systems",
    newTechImg: newTech,
    reviewerImg: person,
    reviewerName: "Sabir Ali",
    reviewDate: "May 12, 2023",
    readTime: "6 min read",
  },
  {
    id: 2,
    title: "Exploring the Future of Electric Vehicles",
    newTechImg: newTech2,
    reviewerImg: person,
    reviewerName: "Ayesha Khan",
    reviewDate: "June 25, 2023",
    readTime: "5 min read",
  },
  {
    id: 3,
    title: "Top 5 AI Features Transforming Automobile Safety",
    newTechImg: newTech3,
    reviewerImg: person,
    reviewerName: "Hassan Raza",
    reviewDate: "August 2, 2023",
    readTime: "7 min read",
  },
  {
    id: 4,
    title: "How 5G is Shaping Smart Car Connectivity",
    newTechImg: newTech4,
    reviewerImg: person,
    reviewerName: "Maria Ahmed",
    reviewDate: "September 10, 2023",
    readTime: "4 min read",
  },
];

// All Categories
export const categoriesBlogs = [
  {
    id: 1,
    title: "Car Review",
    description: "In-depth reviews of the latest cars",
    img: cate,
  },
  {
    id: 2,
    title: "Maintainance Tips",
    description: "Practical advice to keep your car healthy",
    img: cate2,
  },
  {
    id: 3,
    title: "Car Modification",
    description: "Creative upgrades to boost style & power",
    img: cate3,
  },
  {
    id: 4,
    title: "Driving Tips",
    description: "Smart techniques to drive safe and smooth",
    img: cate4,
  },
];

// Customers Reviews About Blogs    IN Blogs Page
export const customerReviews = [
  {
    id: 1,
    review:
      "Great platform to find reliable cars easily. I was able to explore multiple options, compare prices, and finally purchase a car without any hassle. Truly impressed with the seamless process.",
    name: "Ahmed Khan",
    country: "Pakistan",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    review:
      "The buying process was smooth and transparent from start to finish. I could clearly see all details, documents, and history of the car. Definitely one of the best online car platforms.",
    name: "Fatima Ali",
    country: "UAE",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 3,
    review:
      "Excellent customer support, highly recommend! The team responded quickly to my queries and guided me step by step. It really gave me confidence in making such an important purchase online.",
    name: "Usman Raza",
    country: "USA",
    image: "https://randomuser.me/api/portraits/men/12.jpg",
  },
  {
    id: 4,
    review:
      "Loved the variety of cars available here. From budget-friendly models to luxury vehicles, everything was listed properly. The detailed descriptions and photos made it super easy to make my decision.",
    name: "Hira Sheikh",
    country: "Canada",
    image: "https://randomuser.me/api/portraits/women/21.jpg",
  },
  {
    id: 5,
    review:
      "Easy to navigate and very user-friendly website. I quickly filtered cars by my preferences and found exactly what I was looking for. The design and functionality of the site are excellent.",
    name: "Bilal Ahmad",
    country: "UK",
    image: "https://randomuser.me/api/portraits/men/51.jpg",
  },
  {
    id: 6,
    review:
      "I sold my car quickly, hassle-free experience. The platform connected me with genuine buyers and I received a fair price. Highly recommend this service to anyone looking to sell easily.",
    name: "Sara Malik",
    country: "Australia",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
  },
];

// All Blogs Page  => Blogs Posts Component Data
export const allBlogsData = [
  {
    id: 1,
    title: "A Review of Cars With Advanced Infotainment Systems",
    description:
      "Explore the latest cars equipped with cutting-edge infotainment systems that enhance the driving experience. From touchscreens to voice control, discover how technology is transforming in-car entertainment.",
    image: bottomRevCar,
    authorImg: person,
    authorName: "Sabir Ali",
    publishDate: "May 12, 2023",
    readTime: "6 min read",
  },
  {
    id: 2,
    title: "Top 10 Electric Cars That Are Redefining the Future",
    description:
      "Electric cars are shaping the future of sustainable transport. We review the top 10 EVs that combine range, performance, and design for the eco-conscious driver.",
    image: bottomRevCar2,
    authorImg: person,
    authorName: "Amir Khan",
    publishDate: "June 4, 2023",
    readTime: "5 min read",
  },
  {
    id: 3,
    title: "The Ultimate Guide to Buying a Used Luxury Car",
    description:
      "Buying a used luxury car can save you money while giving you premium comfort. Here's what to look for before making your next purchase.",
    image: bottomRevCar2,
    authorImg: person,
    authorName: "Ayesha Noor",
    publishDate: "July 10, 2023",
    readTime: "7 min read",
  },
  {
    id: 4,
    title: "Why SUV Hybrids Are Dominating the Market",
    description:
      "SUV hybrids are quickly becoming the go-to choice for families. Learn why their balance of power, fuel efficiency, and space makes them unbeatable.",
    image: bottomRevCar,
    authorImg: person,
    authorName: "Ali Raza",
    publishDate: "August 2, 2023",
    readTime: "4 min read",
  },
  {
    id: 5,
    title: "Exploring the Rise of Autonomous Driving",
    description:
      "From lane assist to full self-driving capabilities, autonomous cars are closer than ever. We break down the technology that's changing mobility forever.",
    image: bottomRevCar2,
    authorImg: person,
    authorName: "Fatima Zahra",
    publishDate: "August 28, 2023",
    readTime: "8 min read",
  },
  {
    id: 6,
    title: "5 Must-Have Car Accessories for Every Driver",
    description:
      "Enhance your car's utility and comfort with these essential accessories — from smart dash cams to wireless chargers and more.",
    image: bottomRevCar,
    authorImg: person,
    authorName: "Hassan Ahmed",
    publishDate: "September 14, 2023",
    readTime: "3 min read",
  },
  {
    id: 7,
    title: "Understanding Car Maintenance for Beginners",
    description:
      "Car maintenance doesn't have to be scary. Learn simple tips to keep your vehicle running smoothly and avoid costly repairs.",
    image: bottomRevCar2,
    authorImg: person,
    authorName: "Zain Malik",
    publishDate: "October 1, 2023",
    readTime: "5 min read",
  },
  {
    id: 8,
    title: "The Evolution of Sports Cars: Past to Present",
    description:
      "Take a journey through time to see how sports cars evolved from raw mechanical beasts to modern high-tech performance machines.",
    image: bottomRevCar2,
    authorImg: person,
    authorName: "Sara Khan",
    publishDate: "November 20, 2023",
    readTime: "6 min read",
  },
  {
    id: 9,
    title: "Comparing Petrol vs. Diesel vs. Electric Cars",
    description:
      "Not sure which powertrain suits you best? We compare petrol, diesel, and electric cars in performance, cost, and long-term value.",
    image: bottomRevCar2,
    authorImg: person,
    authorName: "Bilal Ahmed",
    publishDate: "December 8, 2023",
    readTime: "5 min read",
  },
  {
    id: 10,
    title: "The Future of Car Design: What to Expect by 2030",
    description:
      "From aerodynamic forms to AI-assisted interiors, discover the car design trends that will dominate the next decade.",
    image: bottomRevCar,
    authorImg: person,
    authorName: "Maryam Iqbal",
    publishDate: "January 15, 2024",
    readTime: "7 min read",
  },
];

// Hardcoded blog posts for special categories (farm equipment, etc.)
export const hardcodedBlogPosts = {
  "tractor-attachments-guide": {
    _id: "tractor-attachments-guide",
    slug: "tractor-attachments-guide",
    title: "Essential Tractor Attachments: Boost Your Farm Productivity",
    content: `
            <h2>Introduction to Tractor Attachments</h2>
            <p>Tractor attachments are essential tools that can transform your farming operations, making them more efficient and productive. Whether you're a small-scale farmer or manage a large agricultural operation, the right attachments can help you maximize your tractor's versatility and value.</p>
            
            <h2>Types of Essential Tractor Attachments</h2>
            
            <h3>1. Plows and Tillage Equipment</h3>
            <p>Plows are fundamental for soil preparation. They come in various types including moldboard plows, disc plows, and chisel plows. Each serves different purposes based on your soil type and farming needs.</p>
            <ul>
                <li><strong>Moldboard Plows:</strong> Ideal for deep soil inversion and weed control</li>
                <li><strong>Disc Plows:</strong> Better for tough, hard soils and rocky conditions</li>
                <li><strong>Chisel Plows:</strong> Excellent for minimum tillage and conservation farming</li>
            </ul>
            
            <h3>2. Seeders and Planters</h3>
            <p>Modern seeders ensure precise seed placement and optimal spacing, which is crucial for crop success. They range from simple broadcast seeders to sophisticated precision planters with GPS guidance.</p>
            
            <h3>3. Mowers and Cutters</h3>
            <p>For maintaining pastures and harvesting crops, mowers are indispensable. Options include rotary mowers, flail mowers, and sickle bar mowers, each suited for different vegetation types and terrain.</p>
            
            <h3>4. Loaders and Material Handling</h3>
            <p>Front-end loaders transform your tractor into a versatile material handling machine. They're essential for moving feed, cleaning barns, and general farm maintenance.</p>
            
            <h3>5. Backhoes</h3>
            <p>Backhoe attachments provide digging capabilities for drainage, foundation work, and trenching. They're particularly valuable for farm infrastructure projects.</p>
            
            <h2>Choosing the Right Attachments</h2>
            <p>When selecting attachments, consider:</p>
            <ul>
                <li><strong>Tractor Compatibility:</strong> Ensure the attachment matches your tractor's horsepower and hydraulic capacity</li>
                <li><strong>Soil Conditions:</strong> Different soils require different implements</li>
                <li><strong>Crop Types:</strong> Match attachments to your specific crops</li>
                <li><strong>Budget Considerations:</strong> Balance quality with cost-effectiveness</li>
            </ul>
            
            <h2>Maintenance and Care</h2>
            <p>Proper maintenance extends attachment life and ensures optimal performance:</p>
            <ul>
                <li>Clean attachments after each use</li>
                <li>Check for wear and damage regularly</li>
                <li>Lubricate moving parts as recommended</li>
                <li>Store attachments properly to prevent rust</li>
            </ul>
            
            <h2>Conclusion</h2>
            <p>Investing in quality tractor attachments is investing in your farm's productivity and efficiency. Start with essential implements and gradually expand your collection based on your growing needs and budget.</p>
        `,
    excerpt:
      "Discover the most useful tractor attachments that can transform your farming operations. This comprehensive guide covers plows, tillers, mowers, loaders, backhoes, and specialized implements.",
    featuredImage:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&h=600&fit=crop",
    author: {
      name: "Farm Expert",
      image: person,
    },
    category: {
      _id: "farm-equipment",
      name: "Farm Equipment",
    },
    tags: ["tractor", "farm equipment", "attachments", "agriculture"],
    publishedAt: "2024-02-03T00:00:00.000Z",
    createdAt: "2024-02-03T00:00:00.000Z",
    readTime: 11,
    views: 1250,
    metaTitle: "Essential Tractor Attachments Guide | Farm Equipment",
    metaDescription:
      "Complete guide to tractor attachments including plows, tillers, mowers, loaders, and backhoes. Learn how to choose and maintain farm equipment.",
  },
  "seasonal-farm-equipment-care": {
    _id: "seasonal-farm-equipment-care",
    slug: "seasonal-farm-equipment-care",
    title: "Seasonal Farm Equipment Care: Year-Round Maintenance Schedule",
    content: `
            <h2>Introduction to Seasonal Equipment Care</h2>
            <p>Proper seasonal maintenance is crucial for keeping your farm equipment running efficiently year after year. This comprehensive guide will walk you through the essential maintenance tasks for each season.</p>
            
            <h2>Spring Preparation</h2>
            <p>As planting season approaches, your equipment needs to be in top condition. Spring maintenance focuses on preparing machinery for the heavy work ahead.</p>
            
            <h3>Engine and Fluid Checks</h3>
            <ul>
                <li>Change oil and filters in all equipment</li>
                <li>Check coolant levels and antifreeze condition</li>
                <li>Inspect hydraulic fluid levels and hoses</li>
                <li>Test battery health and clean terminals</li>
            </ul>
            
            <h3>Implement Preparation</h3>
            <ul>
                <li>Inspect and sharpen cutting edges on plows and cultivators</li>
                <li>Check seed meters and calibrate planting equipment</li>
                <li>Grease all fittings and moving parts</li>
                <li>Test all safety features and guards</li>
            </ul>
            
            <h2>Summer Maintenance</h2>
            <p>Summer brings intense heat and heavy usage. Regular maintenance during this season prevents breakdowns during critical farming operations.</p>
            
            <h3>Cooling System Care</h3>
            <ul>
                <li>Clean radiators and cooling fins regularly</li>
                <li>Check fan belts and cooling system pressure</li>
                <li>Monitor engine temperatures closely</li>
                <li>Ensure proper airflow to engine components</li>
            </ul>
            
            <h3>Daily Maintenance Routines</h3>
            <ul>
                <li>Check tire pressures before each use</li>
                <li>Inspect for fluid leaks</li>
                <li>Clean equipment after daily use</li>
                <li>Lubricate high-wear points</li>
            </ul>
            
            <h2>Autumn Equipment Care</h2>
            <p>As harvest season concludes, focus shifts to preparing equipment for winter storage and addressing any wear from the busy season.</p>
            
            <h3>Harvest Equipment Maintenance</h3>
            <ul>
                <li>Thoroughly clean combines and harvesters</li>
                <li>Inspect and replace worn belts and chains</li>
                <li>Check grain handling systems for damage</li>
                <li>Calibrate monitoring systems</li>
            </ul>
            
            <h3>Winter Preparation</h3>
            <ul>
                <li>Fuel stabilization for stored equipment</li>
                <li>Battery removal and maintenance</li>
                <li>Tire pressure adjustment for storage</li>
                <li>Cover and protect equipment from elements</li>
            </ul>
            
            <h2>Winter Storage Protocols</h2>
            <p>Proper winter storage prevents damage and ensures equipment is ready for spring. Follow these essential steps:</p>
            
            <h3>Engine Winterization</h3>
            <ul>
                <li>Change oil before storage</li>
                <li>Add fuel stabilizer to full tanks</li>
                <li>Fog cylinders for long-term storage</li>
                <li>Remove and store batteries indoors</li>
            </ul>
            
            <h3>Rust Prevention</h3>
            <ul>
                <li>Clean and dry all metal surfaces</li>
                <li>Apply rust preventative to exposed metal</li>
                <li>Store equipment on blocks or tires</li>
                <li>Use moisture absorbers in enclosed spaces</li>
            </ul>
            
            <h2>Maintenance Schedules and Records</h2>
            <p>Keeping detailed maintenance records helps track equipment health and plan for future needs:</p>
            <ul>
                <li>Create maintenance checklists for each season</li>
                <li>Document all repairs and parts replacements</li>
                <li>Track operating hours for service intervals</li>
                <li>Plan budget for upcoming maintenance needs</li>
            </ul>
            
            <h2>Conclusion</h2>
            <p>Consistent seasonal maintenance extends equipment life, reduces downtime, and maximizes your farming operation's efficiency. Invest time in proper care, and your equipment will serve you reliably for years to come.</p>
        `,
    excerpt:
      "Complete seasonal maintenance guide for farm equipment to ensure optimal performance year-round. Learn about spring preparation, summer maintenance, autumn care, and winter storage protocols.",
    featuredImage:
      "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&h=600&fit=crop",
    author: {
      name: "Maintenance Pro",
      image: person,
    },
    category: {
      _id: "farm-maintenance",
      name: "Farm Maintenance",
    },
    tags: ["farm equipment", "maintenance", "seasonal care", "agriculture"],
    publishedAt: "2024-01-27T00:00:00.000Z",
    createdAt: "2024-01-27T00:00:00.000Z",
    readTime: 14,
    views: 890,
    metaTitle: "Seasonal Farm Equipment Care Guide | Year-Round Maintenance",
    metaDescription:
      "Complete guide to seasonal farm equipment maintenance including spring preparation, summer care, autumn preparation, and winter storage protocols.",
  },
};
