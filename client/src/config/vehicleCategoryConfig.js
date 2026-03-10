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
        content: `Let's face it—buying a used car in Pakistan isn't just about saving money. It's about dodging headaches and finding a reliable ride.`,
        fullContent: `Let's face it—buying a used car in Pakistan isn't just about saving money. It's about dodging headaches and finding a reliable ride. Here's your guide to making a smart choice.

## Set a budget

Decide how much you can spend and stick to it. Include registration, insurance, and a buffer for repairs. **Stretch goals** often lead to bad decisions.

## Check history

Get the vehicle's history, verify ownership, and look for accident or flood damage. Run the chassis number and ask for service records.

## Inspect thoroughly

Take a trusted mechanic or do a thorough test drive. Check engine, brakes, suspension, and electricals. Don't skip the underbody.

## Compare listings

Use Sello to compare similar cars by price, condition, and location so you don't overpay. Market knowledge is your best tool.`,
      },
      {
        id: 2,
        tag: "Selling Guide",
        title: "How to Sell Your Car in Pakistan – Tips for Best Value",
        author: "Sello Expert",
        date: "Jan 15, 2026",
        readTime: "12 min",
        content: `Selling your car? Get the best price with the right paperwork, honest listing, and timing. Here’s how to sell your car in Pakistan.`,
        fullContent: `Selling your car in Pakistan can be smooth if you prepare well. Get the best price with the right paperwork, honest listing, and timing.

## Get your paperwork ready

- **Registration book** and transfer papers
- **Fitness** and any NOC if applicable
- **Clear dues** (installments, fines) so transfer is smooth

## Present the car well

Clean the interior and exterior. Fix small issues that buyers notice. Good photos and an honest description on Sello get more serious buyers.

## Price realistically

Check similar listings on Sello for your make, model, and year. Overpricing wastes time; underpricing loses money. Set a fair price and leave a little room to negotiate.

## Where to list

Use Sello to reach verified buyers. Respond quickly and allow test drives in a safe place. Once you agree, complete the transfer and payment through proper channels.`,
      },
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
        title: "How to Buy the Right Bus in Pakistan – 2026 Guide",
        author: "Sello Expert",
        date: "Jan 18, 2026",
        readTime: "15 min",
        content: `Buying a bus in Pakistan isn't a small decision. Whether you're running a transport business or adding to your fleet, here's what you need to know.`,
        fullContent: `Buying a bus in Pakistan isn't a small decision. Whether you're running a transport business or adding to your fleet, here's what you need to know.

## Define your use

Passenger, school, or tourism? **Capacity and comfort** requirements will narrow your options. Route and permit type matter.

## Budget and financing

Buses are a large investment. Explore financing options and total cost of ownership. Include insurance and annual fitness.

## Condition and compliance

Check fitness, route permits, and maintenance records. Non-compliant buses can cost you later in fines and downtime.

## Where to buy

Use Sello to browse verified bus listings and connect with sellers who can provide documentation. Verify ownership and any liens before payment.`,
      },
      {
        id: 2,
        tag: "Fleet Guide",
        title: "Bus Fleet Maintenance & Compliance in Pakistan",
        author: "Sello Expert",
        date: "Jan 12, 2026",
        readTime: "10 min",
        content: `Keep your buses road-worthy and compliant. Maintenance schedules, fitness, and documentation for bus operators in Pakistan.`,
        fullContent: `Keeping your buses road-worthy and compliant is essential for safety and avoiding penalties. Here's a practical guide for bus operators in Pakistan.

## Maintenance schedule

- **Oil and filters** at recommended intervals
- **Brakes and tyres** checked regularly
- **Electrical and AC** to avoid breakdowns on route

## Fitness and documentation

Renew fitness on time. Keep route permits and insurance valid. **One expired document** can ground the vehicle.

## Driver and crew

Trained drivers and basic first aid reduce risk. Log books and duty rosters help with compliance and dispute resolution.

## Where to find parts and service

Stick to authorised or reputed workshops. Use Sello to compare buses and list your own when expanding or upgrading your fleet.`,
      },
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
    blogs: [
      {
        id: 1,
        tag: "Buying Guide",
        title: "Truck Buying Guide: What to Look For in Pakistan",
        author: "Sello Expert",
        date: "Jan 15, 2026",
        readTime: "10 min",
        content: "From payload capacity to fuel efficiency, learn how to pick the right truck for your business and avoid common pitfalls in the Pakistani market.",
        fullContent: `From payload capacity to fuel efficiency, learn how to pick the right truck for your business and avoid common pitfalls in the Pakistani market.

## Payload and usage

Match the truck to your typical load and terrain. **Overloading or underusing** both cost money. Consider growth in demand.

## Engine and fuel

Diesel is common for heavy use. Check fuel efficiency and availability of parts and service in your region.

## Legal and papers

Verify registration, fitness, and any route or weight restrictions. Missing NOCs or unpaid dues can block transfer.

## Inspection

Have a mechanic check the chassis, brakes, and transmission. Repair costs on trucks are high—catch issues before you buy. Use Sello to compare listings and connect with verified sellers.`,
      },
      {
        id: 2,
        tag: "Operations",
        title: "Truck Ownership Costs & Documentation in Pakistan",
        author: "Sello Expert",
        date: "Jan 10, 2026",
        readTime: "8 min",
        content: "Registration, fitness, route permits, and total cost of ownership for truck operators in Pakistan.",
        fullContent: `Running a truck in Pakistan means staying on top of costs and paperwork. Here's what operators need to know.

## Registration and fitness

Renew **fitness** on time. Keep registration and route permits valid. Lapses lead to fines and off-road downtime.

## Permits and restrictions

Know your route and weight limits. Overloading risks fines and accidents. Route permits must match actual use.

## Total cost of ownership

- Fuel and tyres
- Repairs and maintenance
- Insurance and taxes
- Driver and helper costs

Plan for these when pricing your services or buying another truck. Use Sello to compare trucks and list when you upgrade.`,
      },
    ],
  },
  van: {
    label: "Van",
    title: "Vans",
    description: "Vans, minivans, and small cargo vehicles",
    icon: FaVanShuttle,
    bgImage: "/assets/categories/vanCat.svg",
    blogImage: categoriesBlogsImages.vanCatBlog,
    blogImage2: categoriesBlogsImages.vanCatBlog2,
    blogs: [
      {
        id: 1,
        tag: "Buying Guide",
        title: "Van Buying Guide – Passenger & Cargo Vans in Pakistan",
        author: "Sello Expert",
        date: "Jan 12, 2026",
        readTime: "8 min",
        content: "Vans are versatile. Whether you need one for passengers or cargo, this guide helps you compare options and find the best value in Pakistan.",
        fullContent: `Vans are versatile. Whether you need one for passengers or cargo, this guide helps you compare options and find the best value in Pakistan.

## Passenger vs cargo

**Passenger vans** need seating and safety features; **cargo vans** need load space and durability. Don't mix requirements or you'll compromise both.

## Engine and mileage

Consider fuel type and typical mileage. Well-maintained engines last longer and resell better. Check service history.

## Documentation

Verify ownership, registration, and any commercial permits if you're using it for business. Clear dues before transfer.

## Inspect and test drive

Check AC, doors, and suspension. Use Sello to compare similar vans before you buy. List your old van when upgrading.`,
      },
      {
        id: 2,
        tag: "Selling Guide",
        title: "Selling Your Van in Pakistan – Checklist & Pricing",
        author: "Sello Expert",
        date: "Jan 8, 2026",
        readTime: "6 min",
        content: "Prepare your van for sale: paperwork, presentation, and where to list for the best price in Pakistan.",
        fullContent: `Selling your van in Pakistan is straightforward if you prepare well. Follow this checklist for the best price.

## Paperwork

- **Registration book** and transfer papers
- **Fitness** and NOC if applicable
- Clear any **dues** or fines

## Presentation

Clean inside and out. Fix minor issues. Good photos and an honest description on Sello attract serious buyers.

## Pricing

Check similar vans on Sello for your make, model, and year. Price fairly with a little room to negotiate.

## Where to list

Use Sello to reach buyers. Allow test drives safely. Complete transfer and payment through proper channels.`,
      },
    ],
  },
  bike: {
    label: "Bike",
    title: "Bikes",
    description: "Motorcycles, scooters, and two-wheelers",
    icon: FaMotorcycle,
    bgImage: "/assets/categories/bikeCat.svg",
    blogImage: categoriesBlogsImages.bikeCatBlog,
    blogImage2: categoriesBlogsImages.bikeCatBlog2,
    blogs: [
      {
        id: 1,
        tag: "Buying Guide",
        title: "Motorcycle Buying Tips for Pakistani Riders",
        author: "Sello Expert",
        date: "Jan 10, 2026",
        readTime: "8 min",
        content: "From commuter bikes to performance machines, here's how to choose a motorcycle that fits your needs and budget in Pakistan.",
        fullContent: `From commuter bikes to performance machines, here's how to choose a motorcycle that fits your needs and budget in Pakistan.

## Purpose

Daily commute, delivery, or leisure? This decides **engine size**, fuel economy, and features. Don't overbuy or underbuy.

## New vs used

Used bikes can save money but check for accidents and engine condition. **Service history** matters. Inspect before paying.

## Spare parts

Choose brands and models with good parts availability in your city. Rare models mean expensive or delayed repairs.

## Papers and test ride

Verify registration and take a test ride. Check brakes, lights, and handling. Use Sello to compare bikes and list when you upgrade.`,
      },
      {
        id: 2,
        tag: "Maintenance",
        title: "Bike Maintenance & Spare Parts in Pakistan",
        author: "Sello Expert",
        date: "Jan 6, 2026",
        readTime: "7 min",
        content: "Keep your bike running: service intervals, parts availability, and where to find reliable mechanics in Pakistan.",
        fullContent: `Keeping your bike in good shape saves money and keeps you safe. Here's a practical guide for riders in Pakistan.

## Service intervals

Follow the manual for **oil changes**, filter replacement, and chain adjustment. Skipping service shortens engine life.

## Parts availability

Stick to brands with good dealer and parts networks. Generic parts can be hit or miss—use reputed suppliers.

## Tyres and brakes

Worn tyres and brakes cause accidents. Replace in time. Check pressure and tread regularly.

## Where to get help

Find a mechanic you trust. Keep receipts for major work—they help at resale. Use Sello when you're ready to sell or upgrade.`,
      },
    ],
  },
  "e-bike": {
    label: "E-bike",
    title: "E-bikes",
    description: "Electric bikes, scooters, and eco-friendly rides",
    icon: FaPlug,
    bgImage: "/assets/categories/ebikeCat.svg",
    blogImage: categoriesBlogsImages.ebikeCatBlog,
    blogImage2: categoriesBlogsImages.ebikeCatBlog2,
    blogs: [
      {
        id: 1,
        tag: "Buying Guide",
        title: "E-Bikes in Pakistan: A Complete Buying Guide",
        author: "Sello Expert",
        date: "Jan 8, 2026",
        readTime: "9 min",
        content: "Electric bikes and scooters are growing in Pakistan. Learn about range, charging, and which model suits your daily commute or delivery needs.",
        fullContent: `Electric bikes and scooters are growing in Pakistan. Learn about range, charging, and which model suits your daily commute or delivery needs.

## Range and battery

Check **real-world range**, not just claims. Battery warranty and replacement cost matter. Cold and hills reduce range.

## Charging

Where will you charge? Home, office, or public points? Charging time affects daily use. Plan for your typical day.

## Build and warranty

Prefer brands with service networks and clear warranty terms. Avoid no-name imports with no support.

## Compare on Sello

Filter by type, range, and price to find e-bikes and scooters that fit your needs. List your old one when upgrading.`,
      },
      {
        id: 2,
        tag: "Charging & Care",
        title: "E-Bike Battery & Charging Guide for Pakistan",
        author: "Sello Expert",
        date: "Jan 5, 2026",
        readTime: "7 min",
        content: "Maximize battery life and range: charging habits, storage, and when to replace your e-bike battery in Pakistan.",
        fullContent: `Getting the most from your e-bike battery saves money and keeps you on the road. Here's how to care for it in Pakistan.

## Charging habits

- **Avoid full discharge**; charge when around 20–30% left
- Don't leave at **100%** for days; 80–90% is better for storage
- Use the charger that came with the bike

## Storage

Store in a cool, dry place. In very hot weather, keep away from direct sun. Long storage: keep charge around 50–60%.

## When to replace

If range has dropped a lot or the battery no longer holds charge, consider replacement. Check warranty first. Use authorised or reputed suppliers.

## Compare and list on Sello

When it's time for a new e-bike, use Sello to compare models and list your current one.`,
      },
    ],
  },
  farm: {
    label: "Farm",
    title: "Farm Vehicles",
    description: "Tractors, harvesters, and agricultural equipment",
    icon: FaTractor,
    bgImage: "/assets/categories/farmCat.svg",
    blogImage: categoriesBlogsImages.farmCatBlog,
    blogImage2: categoriesBlogsImages.farmCatBlog2,
    blogs: [
      {
        id: 1,
        tag: "Buying Guide",
        title: "Farm Vehicles & Equipment: Buying Guide for Pakistan",
        author: "Sello Expert",
        date: "Jan 5, 2026",
        readTime: "11 min",
        content: "Tractors, harvesters, and agricultural equipment—what to consider when buying farm vehicles in Pakistan for reliability and resale value.",
        fullContent: `Tractors, harvesters, and agricultural equipment—what to consider when buying farm vehicles in Pakistan for reliability and resale value.

## Farm size and crops

Match **horsepower** and attachments to your land and crop type. Over- or under-specing both hurt. Plan for peak season.

## Condition and hours

Check engine hours, hydraulic systems, and tyres. Repairs on farm equipment are expensive. Get a mechanic's opinion.

## Brand and parts

Stick to brands with dealer and parts support in your region. Downtime in season costs more than the machine.

## Papers and price

Verify ownership and any liens. Use Sello to compare similar equipment and negotiate fairly. List when you upgrade.`,
      },
      {
        id: 2,
        tag: "Operations",
        title: "Tractor & Farm Equipment Maintenance in Pakistan",
        author: "Sello Expert",
        date: "Jan 2, 2026",
        readTime: "9 min",
        content: "Service schedules, parts availability, and keeping your farm equipment in top condition in Pakistan.",
        fullContent: `Keeping your farm equipment in top condition avoids costly breakdowns in the middle of season. Here's a practical guide for Pakistan.

## Service schedule

Follow the manual for **oil, filters, and hydraulics**. Log hours and stick to intervals. One missed service can lead to big repairs.

## Parts availability

Use OEM or reputed aftermarket parts. Keep critical spares for peak season. Know your nearest dealer or supplier.

## Storage and off-season

Clean and store under cover. Run periodically if not in use. Check battery and fluids before the next season.

## When to upgrade

If repair costs are high or capacity no longer matches your land, consider selling and upgrading. Use Sello to list and compare.`,
      },
    ],
  },
};
