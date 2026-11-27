/** Shared Car Compare schema contract — keep identical to server/constants/carCompare.js */
export const COMPARE_SCHEMA_VERSION = 'compare-30-v1';

export const basicFields = [
  ['generation', 'Generation', 'text'],
  ['engineCc', 'Engine Capacity (CC)', 'number', 'cc'],
  ['engineType', 'Engine Type', 'text'],
  ['transmission', 'Transmission', 'text'],
  ['fuelType', 'Fuel Type', 'text'],
  ['drivetrain', 'Drivetrain', 'text'],
  ['horsepower', 'Horsepower (HP)', 'number', 'HP'],
  ['torque', 'Torque (Nm)', 'number', 'Nm'],
];

export const compareFuelTypes = [
  'Petrol', 'Diesel', 'Hybrid', 'Plug-in Hybrid (PHEV)', 'Electric (EV)', 'CNG', 'LPG', 'Other',
];

export const compareTransmissionTypes = [
  'Manual', 'Automatic', 'CVT', 'DCT / DSG', 'AMT', 'Other',
];

export const featureFields = [
  'ABS', 'EBD', 'Brake Assist', 'Airbags', 'Electronic Stability Control (ESC)',
  'Traction Control', 'Hill Start Assist', 'Rear Camera', 'Parking Sensors',
  'Cruise Control', 'Adaptive Cruise Control', 'Sunroof', 'Automatic Climate Control',
  'Rear AC Vents', 'Touchscreen Infotainment', 'Android Auto', 'Apple CarPlay',
  'Bluetooth Connectivity', 'Keyless Entry', 'Push Button Start', 'Power Windows',
  'Power Mirrors', 'Electrically Adjustable Seats', 'Leather Seats', 'Heated Seats',
  'Alloy Wheels', 'LED Headlights', 'Daytime Running Lights (DRL)', 'Fog Lights',
  'ISOFIX Child Seat Anchors',
].map((label, index) => [`f${index + 1}`, label, 'feature']);

export const fuelFields = [
  ['city', 'City Average', 'economy', 'km/L'],
  ['highway', 'Highway Average', 'economy', 'km/L'],
  ['combined', 'Combined Average', 'economy', 'km/L'],
];

export const electricFields = [
  ['batteryCapacity', 'Battery Capacity', 'number', 'kWh'],
  ['consumption', 'EV Energy Consumption', 'economy', 'kWh/100 km'],
  ['range', 'EV Range', 'economy', 'km'],
];

export const priceFields = [
  ['newPrice', 'New Car Price', 'price', 'PKR'],
  ['usedPrice', 'Used Market Price Range', 'range', 'PKR'],
];

export const compareFields = [
  ...basicFields, ...featureFields, ...fuelFields, ...electricFields, ...priceFields,
];

export const defaultCompareContent = [
  {
    title: "Compare cars in Pakistan with your daily needs in mind",
    description:
      "Start with the exact model year and variant. Compare passenger space, safety equipment and running costs against your commute, parking space and family needs. A test drive and an inspection help you assess comfort and condition before buying.",
    image: "/assets/categories/carCat.webp",
    alt: "Car for comparing everyday transport needs",
  },
  {
    title: "Understand new and used car prices in Pakistan",
    description:
      "Check the effective date of a new car price and whether it is an ex-factory amount. Registration, taxes and delivery can affect the total. Used market ranges are estimates influenced by condition, mileage and documentation. Compare equivalent variants before setting your budget.",
    image: "/assets/categories/vanCat.webp",
    alt: "Vehicle to consider when comparing purchase budgets",
  },
  {
    title: "Compare city, highway and combined fuel averages",
    description:
      "Stop-start city driving and steady highway journeys use fuel differently. Compare the average that best matches your travel. Keep manufacturer claims separate from real-world measurements, and use electricity consumption for electric vehicles.",
    image: "/assets/categories/ebikeCat.webp",
    alt: "Electric transport illustrating different energy costs",
  },
  {
    title: "Choose car specifications that matter to your family",
    description:
      "Check the safety and comfort equipment of the exact variant. Airbags, child-seat mounting points, luggage space and rear ventilation can matter more to a family than headline power. Review parts availability and service coverage alongside features you will use every day.",
    image: "/assets/categories/carCat.webp",
    alt: "Passenger car for evaluating safety and comfort features",
  },
];
