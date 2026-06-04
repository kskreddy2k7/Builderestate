import { PrismaClient, UserRole, UserStatus, OrgType, ProjectStatus, PropertyType, PropertyStatus, TransactionType } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { seedMaterialCategories } from './seeds/categories.seed'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  console.log('🌱 Seeding BuildEstate database...')

  const password = await bcrypt.hash('Password@123', 12)

  // ─── Super Admin ──────────────────────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@buildestate.in' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@buildestate.in',
      phone: '9000000001',
      passwordHash: password,
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  })
  console.log('✅ Super admin created:', superAdmin.email)

  // ─── Platform Admin ───────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@buildestate.in' },
    update: {},
    create: {
      name: 'Platform Admin',
      email: 'admin@buildestate.in',
      phone: '9000000002',
      passwordHash: password,
      roles: [UserRole.ADMIN],
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  })

  // ─── Builder Organization & User ─────────────────────────────────────────
  const builderOrg = await prisma.organization.upsert({
    where: { slug: 'prestige-constructions' },
    update: {},
    create: {
      name: 'Prestige Constructions Pvt Ltd',
      slug: 'prestige-constructions',
      type: OrgType.BUILDER,
      gstin: '29ABCDE1234F1Z5',
      reraNumber: 'PRM/KA/RERA/1251/309',
      phone: '08040000001',
      email: 'info@prestigeconstructions.in',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
    },
  })

  const builder = await prisma.user.upsert({
    where: { email: 'builder@buildestate.in' },
    update: {},
    create: {
      name: 'Rajesh Sharma',
      email: 'builder@buildestate.in',
      phone: '9000000003',
      passwordHash: password,
      roles: [UserRole.BUILDER],
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  })

  await prisma.orgMember.upsert({
    where: { userId_orgId: { userId: builder.id, orgId: builderOrg.id } },
    update: {},
    create: { userId: builder.id, orgId: builderOrg.id, role: UserRole.BUILDER, designation: 'Managing Director' },
  })

  // ─── Broker Organization & User ───────────────────────────────────────────
  const brokerOrg = await prisma.organization.upsert({
    where: { slug: 'skyline-realty' },
    update: {},
    create: {
      name: 'Skyline Realty',
      slug: 'skyline-realty',
      type: OrgType.BROKERAGE,
      phone: '08040000002',
      email: 'info@skylinerealty.in',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
    },
  })

  const broker = await prisma.user.upsert({
    where: { email: 'broker@buildestate.in' },
    update: {},
    create: {
      name: 'Priya Nair',
      email: 'broker@buildestate.in',
      phone: '9000000004',
      passwordHash: password,
      roles: [UserRole.BROKER],
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  })

  await prisma.orgMember.upsert({
    where: { userId_orgId: { userId: broker.id, orgId: brokerOrg.id } },
    update: {},
    create: { userId: broker.id, orgId: brokerOrg.id, role: UserRole.BROKER },
  })

  // ─── Other Roles ──────────────────────────────────────────────────────────
  const roleUsers = [
    { name: 'Anand Buyer', email: 'buyer@buildestate.in', phone: '9000000005', role: UserRole.BUYER },
    { name: 'Suresh Contractor', email: 'contractor@buildestate.in', phone: '9000000006', role: UserRole.CONTRACTOR },
    { name: 'Meera Engineer', email: 'engineer@buildestate.in', phone: '9000000007', role: UserRole.SITE_ENGINEER },
    { name: 'Ramesh Supplier', email: 'supplier@buildestate.in', phone: '9000000008', role: UserRole.SUPPLIER },
  ]

  for (const u of roleUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name, email: u.email, phone: u.phone,
        passwordHash: password, roles: [u.role],
        status: UserStatus.ACTIVE, isEmailVerified: true, isPhoneVerified: true,
      },
    })
  }

  // ─── Sample Project ───────────────────────────────────────────────────────
  const project = await prisma.project.upsert({
    where: { slug: 'prestige-lakeside-residences' },
    update: {},
    create: {
      orgId: builderOrg.id,
      name: 'Prestige Lakeside Residences',
      slug: 'prestige-lakeside-residences',
      description: 'Premium lakeside living in the heart of Bengaluru',
      status: ProjectStatus.UNDER_CONSTRUCTION,
      reraNumber: 'PRM/KA/RERA/1251/310',
      totalArea: 45000,
      builtUpArea: 32000,
      numberOfTowers: 3,
      numberOfUnits: 240,
      addressLine1: 'Sarjapur Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      latitude: 12.9081,
      longitude: 77.6476,
      startDate: new Date('2023-06-01'),
      expectedCompletionDate: new Date('2026-12-31'),
      amenities: ['Swimming Pool', 'Gym', 'Club House', 'Children\'s Play Area', 'Landscaped Gardens', '24x7 Security'],
    },
  })

  // ─── Tower ────────────────────────────────────────────────────────────────
  const tower = await prisma.tower.upsert({
    where: { id: 'seed-tower-a' },
    update: {},
    create: {
      id: 'seed-tower-a',
      projectId: project.id,
      name: 'Tower A',
      numberOfFloors: 20,
      numberOfUnitsPerFloor: 4,
      totalUnits: 80,
      status: ProjectStatus.UNDER_CONSTRUCTION,
    },
  })

  // ─── Floors & Units ───────────────────────────────────────────────────────
  for (let floor = 1; floor <= 3; floor++) {
    const floorRecord = await prisma.floor.upsert({
      where: { towerId_floorNumber: { towerId: tower.id, floorNumber: floor } },
      update: {},
      create: {
        towerId: tower.id,
        floorNumber: floor,
        label: floor === 0 ? 'Ground Floor' : `${floor}${floor === 1 ? 'st' : floor === 2 ? 'nd' : 'rd'} Floor`,
      },
    })

    const unitTypes = ['2BHK', '2BHK', '3BHK', '3BHK']
    const areas = [1050, 1050, 1450, 1450]
    const prices = [7500000, 7500000, 11500000, 11500000]

    for (let u = 0; u < 4; u++) {
      await prisma.unit.upsert({
        where: { floorId_unitNumber: { floorId: floorRecord.id, unitNumber: `${floor}0${u + 1}` } },
        update: {},
        create: {
          floorId: floorRecord.id,
          unitNumber: `${floor}0${u + 1}`,
          bhkType: unitTypes[u]!,
          area: areas[u]!,
          carpetArea: Math.round(areas[u]! * 0.72),
          superBuiltUpArea: Math.round(areas[u]! * 1.25),
          basePrice: prices[u]!,
          floorRisePremium: floor * 25000,
          finalPrice: prices[u]! + floor * 25000,
          status: u === 0 && floor === 1 ? 'BOOKED' : 'AVAILABLE',
          amenities: ['Modular Kitchen', 'Vitrified Tiles', 'Branded Fittings'],
        },
      })
    }
  }

  // ─── Sample Property Listing ──────────────────────────────────────────────
  await prisma.property.upsert({
    where: { slug: 'spacious-3bhk-koramangala' },
    update: {},
    create: {
      title: 'Spacious 3BHK in Koramangala',
      slug: 'spacious-3bhk-koramangala',
      description: 'Well-maintained 3BHK apartment in prime Koramangala location with modern amenities',
      type: PropertyType.APARTMENT,
      status: PropertyStatus.ACTIVE,
      transactionType: TransactionType.RESALE,
      listedById: builder.id,
      orgId: builderOrg.id,
      addressLine1: '5th Block, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560095',
      latitude: 12.9279,
      longitude: 77.6271,
      price: 12500000,
      pricePerSqft: 9615,
      area: 1300,
      bhkType: '3BHK',
      bathrooms: 3,
      balconies: 2,
      facing: 'EAST',
      floorNumber: 7,
      totalFloors: 12,
      ageOfProperty: 4,
      amenities: ['Swimming Pool', 'Gym', 'Car Parking', 'Power Backup', 'Security'],
    },
  })

  console.log('\n✅ Seed complete!')
  
  // Seed material categories
  await seedMaterialCategories()
  console.log('\n📋 Demo credentials (password: Password@123):')
  console.log('  Super Admin : superadmin@buildestate.in')
  console.log('  Admin       : admin@buildestate.in')
  console.log('  Builder     : builder@buildestate.in')
  console.log('  Broker      : broker@buildestate.in')
  console.log('  Buyer       : buyer@buildestate.in')
  console.log('  Contractor  : contractor@buildestate.in')
  console.log('  Engineer    : engineer@buildestate.in')
  console.log('  Supplier    : supplier@buildestate.in')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => prisma.$disconnect())
