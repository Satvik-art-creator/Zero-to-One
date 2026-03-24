const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Company = require('./models/Company');
const companies = require('./data/companies_seed.json');

dotenv.config({ path: path.join(__dirname, '.env') });

const seedCompanies = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    await Company.deleteMany({});
    const inserted = await Company.insertMany(companies);
    console.log(`✅ Seeded ${inserted.length} companies successfully.`);

    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seedCompanies();
