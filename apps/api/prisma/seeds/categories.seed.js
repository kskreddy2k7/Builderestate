"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedMaterialCategories = seedMaterialCategories;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const MATERIAL_CATEGORIES = [
    { name: 'Cement & Concrete', slug: 'cement-concrete', children: ['Portland Cement', 'Ready Mix Concrete', 'Fly Ash', 'AAC Blocks'] },
    { name: 'Steel & Metals', slug: 'steel-metals', children: ['TMT Bars', 'Structural Steel', 'MS Pipes', 'GI Wire', 'Roofing Sheets'] },
    { name: 'Bricks & Masonry', slug: 'bricks-masonry', children: ['Red Bricks', 'Fly Ash Bricks', 'AAC Blocks', 'Hollow Blocks', 'Sand'] },
    { name: 'Aggregates', slug: 'aggregates', children: ['Coarse Aggregate (20mm)', 'Fine Aggregate (Sand)', 'Crushed Stone', 'Gravel'] },
    { name: 'Waterproofing', slug: 'waterproofing', children: ['Bituminous Coating', 'Crystalline Compound', 'Liquid Membrane', 'Epoxy Coating'] },
    { name: 'Electrical', slug: 'electrical', children: ['Wires & Cables', 'Conduit Pipes', 'Switch Boards', 'MCBs & Distribution Boards', 'Lighting Fixtures'] },
    { name: 'Plumbing', slug: 'plumbing', children: ['CPVC Pipes', 'UPVC Pipes', 'GI Pipes', 'Fittings', 'Sanitary Ware', 'Water Tanks'] },
    { name: 'Flooring', slug: 'flooring', children: ['Ceramic Tiles', 'Vitrified Tiles', 'Granite', 'Marble', 'Wooden Flooring'] },
    { name: 'Paints & Coatings', slug: 'paints-coatings', children: ['Interior Emulsion', 'Exterior Emulsion', 'Primer', 'Enamel Paint', 'Texture Paint'] },
    { name: 'Doors & Windows', slug: 'doors-windows', children: ['Wooden Doors', 'UPVC Windows', 'Aluminium Frames', 'Door Hardware', 'Glass'] },
    { name: 'Finishing Materials', slug: 'finishing', children: ['Putty', 'Plaster of Paris', 'Gypsum Board', 'False Ceiling', 'Adhesives & Sealants'] },
    { name: 'Safety Equipment', slug: 'safety', children: ['Helmets', 'Safety Harness', 'Gloves', 'Safety Nets', 'Scaffolding'] },
];
async function seedMaterialCategories() {
    console.log('🌱 Seeding material categories...');
    for (const cat of MATERIAL_CATEGORIES) {
        const parent = await prisma.productCategory.upsert({
            where: { slug: cat.slug },
            update: {},
            create: { name: cat.name, slug: cat.slug, isActive: true },
        });
        for (const childName of cat.children) {
            const childSlug = `${cat.slug}-${childName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            await prisma.productCategory.upsert({
                where: { slug: childSlug },
                update: {},
                create: { name: childName, slug: childSlug, parentId: parent.id, isActive: true },
            });
        }
    }
    console.log(`✅ Seeded ${MATERIAL_CATEGORIES.length} categories`);
}
//# sourceMappingURL=categories.seed.js.map