import mongoose from 'mongoose';
import Category from '../models/categoryModel.js';
import dotenv from 'dotenv';

dotenv.config();

const vehicleTypes = [
    { name: "Car", slug: "car", description: "Cars, Sedans, SUVs, and other passenger vehicles", order: 1 },
    { name: "Bus", slug: "bus", description: "Buses and commercial passenger vehicles", order: 2 },
    { name: "Truck", slug: "truck", description: "Trucks and heavy-duty vehicles", order: 3 },
    { name: "Van", slug: "van", description: "Vans and utility vehicles", order: 4 },
    { name: "Bike", slug: "bike", description: "Motorcycles and bikes", order: 5 },
    { name: "E-bike", slug: "e-bike", description: "Electric bikes and scooters", order: 6 },
    // Must match carModel / categoryController — listings page uses API categories when non-empty
    { name: "Farm", slug: "farm", description: "Farm vehicles and agricultural equipment", order: 7 },
];

const initializeVehicleCategories = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sello-db';
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB");

        for (const vehicleType of vehicleTypes) {
            // Check if category already exists
            const existing = await Category.findOne({ 
                slug: vehicleType.slug, 
                type: "vehicle" 
            });

            if (existing) {
                console.log(`⏭️  Category "${vehicleType.name}" already exists, skipping...`);
                // Update if needed
                existing.name = vehicleType.name;
                existing.description = vehicleType.description;
                existing.order = vehicleType.order;
                existing.isActive = true;
                await existing.save();
                console.log(`✅ Updated category "${vehicleType.name}"`);
            } else {
                const category = await Category.create({
                    name: vehicleType.name,
                    slug: vehicleType.slug,
                    description: vehicleType.description,
                    type: "vehicle",
                    subType: null,
                    parentCategory: null,
                    isActive: true,
                    order: vehicleType.order,
                });
                console.log(`✅ Created category "${vehicleType.name}"`);
            }
        }

        console.log("\n🎉 Vehicle categories initialized successfully!");
        console.log("Categories created:");
        vehicleTypes.forEach(vt => {
            console.log(`  - ${vt.name} (${vt.slug})`);
        });

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("❌ Error initializing vehicle categories:", error);
        process.exit(1);
    }
};

initializeVehicleCategories();

