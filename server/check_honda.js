import mongoose from 'mongoose';
import Category from './models/categoryModel.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './.env' });

const checkCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const cats = await Category.find({ type: 'car', subType: 'make', isActive: true, vehicleType: 'Car' });
        console.log(`Found ${cats.length} Active Car Makes:`);
        const honda = cats.find(c => c.name === 'Honda');
        if (honda) {
            console.log("Honda found in list: ", JSON.stringify(honda, null, 2));
        } else {
            console.log("Honda NOT found in list.");
            // Check if it exists but inactive?
            const inactive = await Category.findOne({ name: 'Honda' });
            console.log("Honda direct lookup:", inactive);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkCategories();
