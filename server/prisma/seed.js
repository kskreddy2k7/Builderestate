const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const CITIES = {
  HYDERABAD: ['Financial District', 'Gachibowli', 'HITEC City', 'Kokapet', 'Narsingi', 'Kondapur', 'Tellapur'],
  BENGALURU: ['Whitefield', 'Sarjapur', 'Electronic City', 'Hebbal', 'Yelahanka', 'Devanahalli', 'Koramangala'],
  MUMBAI: ['BKC', 'Worli', 'Powai', 'Lower Parel', 'Bandra', 'Andheri'],
  CHENNAI: ['OMR', 'ECR', 'Velachery', 'Sholinganallur', 'Porur'],
  PUNE: ['Hinjewadi', 'Baner', 'Kharadi', 'Wakad'],
  DELHI_NCR: ['Gurgaon', 'Noida', 'Dwarka Expressway', 'Greater Noida'],
};

const PROP_TYPES = [
  { type: 'VILLA', name: 'Luxury Villa' },
  { type: 'APARTMENT', name: 'Premium Apartment' },
  { type: 'SMART_HOME', name: 'Smart Home' },
  { type: 'SKY_VILLA', name: 'Sky Villa' },
  { type: 'PENTHOUSE', name: 'Luxury Penthouse' },
  { type: 'COMMERCIAL', name: 'Commercial Office' },
  { type: 'RETAIL', name: 'Retail Space' },
  { type: 'FARM_HOUSE', name: 'Farm House' },
  { type: 'PLOT', name: 'Urban Plot' },
  { type: 'WEEKEND_VILLA', name: 'Weekend Villa' }
];

const BUILDERS = ['Prestige Group', 'Brigade Group', 'Sobha Realty', 'Godrej Properties', 'Lodha', 'DLF'];

const PROJECT_SUFFIXES = ['Aura', 'Heights', 'Greens', 'Vista', 'Majestic', 'County', 'Springs', 'Palms', 'Meadows', 'Residency', 'Towers'];

const CITY_BASE_IMAGES = {
  HYDERABAD: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00', // Glass towers
  BENGALURU: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', // Green smart community
  MUMBAI: 'https://images.unsplash.com/photo-1504297050568-910d24c426d3', // Skyscrapers
  CHENNAI: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b', // Coastal villa
  PUNE: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf', // Contemporary residency
  DELHI_NCR: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab' // Business district towers
};

async function main() {
  console.log('Clearing database tables...');
  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.propertyImage.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Creating users...');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Password@123', salt);

  const admin = await prisma.user.create({
    data: {
      name: 'Prestige Platform Manager',
      email: 'admin@buildestate.in',
      phone: '+919876543210',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const builder = await prisma.user.create({
    data: {
      name: 'Prestige Group Developers',
      email: 'builder@buildestate.in',
      phone: '+919999988888',
      password: hashedPassword,
      role: 'BUILDER',
    },
  });

  const buyer = await prisma.user.create({
    data: {
      name: 'Rohan Sharma',
      email: 'buyer@buildestate.in',
      phone: '+918888877777',
      password: hashedPassword,
      role: 'BUYER',
    },
  });

  console.log('Users created.');

  console.log('Seeding 12 core builder projects...');
  const projects = [];
  const projectLocations = [
    { city: 'Hyderabad', loc: 'Kokapet', name: 'Prestige Kokapet Lakefront' },
    { city: 'Hyderabad', loc: 'Financial District', name: 'DLF Celestial Towers' },
    { city: 'Bengaluru', loc: 'Whitefield', name: 'Sobha Royal Meadows' },
    { city: 'Bengaluru', loc: 'Hebbal', name: 'Brigade Golden Vista' },
    { city: 'Mumbai', loc: 'Worli', name: 'Lodha Crown Worli Seafront' },
    { city: 'Mumbai', loc: 'BKC', name: 'Godrej Premium Offices' },
    { city: 'Pune', loc: 'Hinjewadi', name: 'Prestige Hinjewadi TechCounty' },
    { city: 'Pune', loc: 'Baner', name: 'Brigade Baner Palms' },
    { city: 'Chennai', loc: 'OMR', name: 'DLF OMR Heights' },
    { city: 'Chennai', loc: 'ECR', name: 'Sobha ECR Coastal Springs' },
    { city: 'Delhi NCR', loc: 'Gurgaon', name: 'DLF Cybercity Residency' },
    { city: 'Delhi NCR', loc: 'Noida', name: 'Godrej Noida Golf Meadows' }
  ];

  for (let i = 0; i < projectLocations.length; i++) {
    const projData = projectLocations[i];
    const project = await prisma.project.create({
      data: {
        name: projData.name,
        description: `Premium integrated township under development by top architects, offering elite amenities in the heart of ${projData.loc}, ${projData.city}.`,
        location: `${projData.loc}, ${projData.city}`,
        builderId: builder.id,
      },
    });
    projects.push(project);
  }

  console.log('Seeding 105 premium properties dynamically...');
  const propertyTypes = ['VILLA', 'APARTMENT', 'HOUSE', 'LAND']; // Prisma enum compatible types

  // Let's generate 105 properties
  for (let i = 1; i <= 105; i++) {
    const builderName = BUILDERS[i % BUILDERS.length];
    const projectSuffix = PROJECT_SUFFIXES[i % PROJECT_SUFFIXES.length];
    
    // Pick city and location
    const cityKeys = Object.keys(CITIES);
    const cityKey = cityKeys[i % cityKeys.length];
    const city = cityKey.charAt(0) + cityKey.slice(1).toLowerCase();
    const locations = CITIES[cityKey];
    const location = locations[i % locations.length];

    // Pick type
    const typeObj = PROP_TYPES[i % PROP_TYPES.length];
    const prismaType = propertyTypes[i % propertyTypes.length]; // VILLA, APARTMENT, HOUSE, LAND

    // Title & description
    const title = `${builderName} ${projectSuffix} ${typeObj.name} in ${location}`;
    const description = `This exclusive ${typeObj.name.toLowerCase()} offers an unmatched living experience in the premium locality of ${location}, ${city}. Designed with gold accents, large floor-to-ceiling windows, private access elevators, modular kitchens, and private balconies overlooking the city skyline.`;

    // Price scaling
    let price = 8500000; // 85 Lakhs base
    if (typeObj.type === 'SKY_VILLA' || typeObj.type === 'PENTHOUSE') {
      price = 45000000 + (i * 300000); // 4.5 Cr to 7.5 Cr
    } else if (typeObj.type === 'VILLA' || typeObj.type === 'FARM_HOUSE') {
      price = 28000000 + (i * 200000); // 2.8 Cr to 4.8 Cr
    } else if (typeObj.type === 'PLOT' || typeObj.type === 'LAND') {
      price = 5500000 + (i * 100000); // 55 L to 1.5 Cr
    } else {
      price = 11000000 + (i * 150000); // 1.1 Cr to 2.5 Cr
    }

    // BHK / Sizes
    const bedrooms = typeObj.type === 'PLOT' || typeObj.type === 'RETAIL' ? 0 : (2 + (i % 4)); // 2 to 5 BHK
    const bathrooms = bedrooms === 0 ? 0 : bedrooms + 1;
    const area = bedrooms === 0 ? 1200 + (i * 15) : bedrooms * 850 + (i * 10);

    // Pick city base image and add unique signature
    const baseImg = CITY_BASE_IMAGES[cityKey] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6';
    const primaryUrl = `${baseImg}?auto=format&fit=crop&w=800&q=80&sig=ext_${cityKey.toLowerCase()}_${i}`;
    const secondaryUrl1 = `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80&sig=int_${cityKey.toLowerCase()}_${i}`;
    const secondaryUrl2 = `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80&sig=pool_${cityKey.toLowerCase()}_${i}`;

    // Pick associated project if city matches
    const matchingProject = projects.find(p => p.location.includes(city));
    const projectId = matchingProject ? matchingProject.id : null;

    await prisma.property.create({
      data: {
        title,
        description,
        price,
        address: `${i * 10 + 2}, Gold Avenue, ${location}`,
        city,
        type: prismaType,
        bedrooms,
        bathrooms,
        area,
        status: i === 12 ? 'SOLD' : 'AVAILABLE', // Make one sold to test reports
        builderId: builder.id,
        projectId,
        images: {
          create: [
            { url: primaryUrl },
            { url: secondaryUrl1 },
            { url: secondaryUrl2 }
          ]
        }
      }
    });
  }

  // Seeding one active booking for reports
  console.log('Seeding transaction log reports...');
  const sampleProp = await prisma.property.findFirst({
    where: { status: 'SOLD' },
  });

  if (sampleProp) {
    const booking = await prisma.booking.create({
      data: {
        propertyId: sampleProp.id,
        buyerId: buyer.id,
        amount: sampleProp.price * 0.1, // 10%
        status: 'CONFIRMED',
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: sampleProp.price * 0.1,
        status: 'SUCCESS',
        reference: 'TXN-INDIA-9827110',
      },
    });
  }

  console.log('Database seeded successfully with 105 Indian luxury listings!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
