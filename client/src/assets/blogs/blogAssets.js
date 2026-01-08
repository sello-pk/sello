import latestSectionCarImg from "./latestSectionCarImg.png";
import newTech from './newTech.png';
import newTech2 from './newTech2.png';
import newTech3 from './newTech3.png';
import newTech4 from './newTech4.png';
import person from './person.png';

import cate from './cate.png';
import cate2 from './cate2.png';
import cate3 from './cate3.png';
import cate4 from './cate4.png';

import bottomRevCar from './bottomRevCar.png';
import bottomRevCar2 from './bottomRevCar2.png';

export const blogAssets = {
    latestSectionCarImg,
    person,
    bottomRevCar,
    bottomRevCar2
}

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
            "Buying a used luxury car can save you money while giving you premium comfort. Here’s what to look for before making your next purchase.",
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
            "From lane assist to full self-driving capabilities, autonomous cars are closer than ever. We break down the technology that’s changing mobility forever.",
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
            "Enhance your car’s utility and comfort with these essential accessories — from smart dash cams to wireless chargers and more.",
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
            "Car maintenance doesn’t have to be scary. Learn simple tips to keep your vehicle running smoothly and avoid costly repairs.",
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


