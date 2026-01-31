import { FaCar, FaBus, FaTruck, FaVanShuttle, FaMotorcycle, FaPlug, FaTractor } from "react-icons/fa6";
import { categoriesBlogsImages } from "../assets/assets";

export const vehicleCategoryConfig = {
  car: {
    label: "Car",
    title: "Cars",
    description: "Cars, sedans, SUVs, and other passenger vehicles",
    icon: FaCar,
    bgImage: "/assets/categories/carCat.svg",
    blogImage: categoriesBlogsImages.carCatBlog,
    blogImage2: categoriesBlogsImages.carCatBlog2,
    blogs: [
      {
        id: 1,
        tag: "Buying Guide",
        title: "How to Choose the Right Used Car in Pakistan (2026 Guide)",
        author: "Sello Expert",
        date: "Jan 18, 2026",
        readTime: "15 min",
        content: `Let's face it—buying a used car in Pakistan isn't just about saving money. It's about dodging headaches...`
      },
      // ... more blogs can be added here
    ]
  },
  bus: {
    label: "Bus",
    title: "Buses",
    description: "Buses and commercial passenger vehicles",
    icon: FaBus,
    bgImage: "/assets/categories/busCat.svg",
    blogImage: categoriesBlogsImages.busCatBlog,
    blogImage2: categoriesBlogsImages.busCatBlog2,
    blogs: [
       {
        id: 1,
        tag: "Buying Guide",
        title: "How to Buy Right Bus in Pakistan – 2026 Guide",
        author: "Sello Expert",
        date: "Jan 18, 2026",
        readTime: "15 min",
        content: `Buying a bus in Pakistan isn't a small decision. Whether you're running a transport business...`
      }
    ]
  },
  truck: {
    label: "Truck",
    title: "Trucks",
    description: "Trucks, haulers, and heavy commercial vehicles",
    icon: FaTruck,
    bgImage: "/assets/categories/truckCat.svg",
    blogImage: categoriesBlogsImages.truckCatBlog,
    blogImage2: categoriesBlogsImages.truckCatBlog2,
  },
  van: {
    label: "Van",
    title: "Vans",
    description: "Vans, minivans, and small cargo vehicles",
    icon: FaVanShuttle,
    bgImage: "/assets/categories/vanCat.svg",
    blogImage: categoriesBlogsImages.vanCatBlog,
    blogImage2: categoriesBlogsImages.vanCatBlog2,
  },
  bike: {
    label: "Bike",
    title: "Bikes",
    description: "Motorcycles, scooters, and two-wheelers",
    icon: FaMotorcycle,
    bgImage: "/assets/categories/bikeCat.svg",
    blogImage: categoriesBlogsImages.bikeCatBlog,
    blogImage2: categoriesBlogsImages.bikeCatBlog2,
  },
  "e-bike": {
    label: "E-bike",
    title: "E-bikes",
    description: "Electric bikes, scooters, and eco-friendly rides",
    icon: FaPlug,
    bgImage: "/assets/categories/ebikeCat.svg",
    blogImage: categoriesBlogsImages.ebikeCatBlog,
    blogImage2: categoriesBlogsImages.ebikeCatBlog2,
  },
  farm: {
    label: "Farm",
    title: "Farm Vehicles",
    description: "Tractors, harvesters, and agricultural equipment",
    icon: FaTractor,
    bgImage: "/assets/categories/farmCat.svg",
    blogImage: categoriesBlogsImages.farmCatBlog,
    blogImage2: categoriesBlogsImages.farmCatBlog2,
  }
};
