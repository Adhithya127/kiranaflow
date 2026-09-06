const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@kiranaflow.com" },
    update: {},
    create: {
      email: "demo@kiranaflow.com",
      password: hashedPassword,
      name: "Demo Shopkeeper",
      phone: "9876543210",
      role: "owner",
    },
  });

  console.log("Created user:", user.email);

  const shop = await prisma.shop.upsert({
    where: { slug: "adithya-general-stores" },
    update: {},
    create: {
      name: "Adithya General Stores",
      slug: "adithya-general-stores",
      description:
        "Your trusted neighborhood store for all daily essentials. We stock fresh groceries, household items, and more at fair prices.",
      category: "general",
      phone: "9876543210",
      address: "12-3-456, Main Road",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500001",
      isOpen: true,
      userId: user.id,
    },
  });

  console.log("Created shop:", shop.name);

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { shopId_name: { shopId: shop.id, name: "Groceries" } },
      update: {},
      create: { name: "Groceries", sortOrder: 1, shopId: shop.id },
    }),
    prisma.category.upsert({
      where: { shopId_name: { shopId: shop.id, name: "Dairy & Beverages" } },
      update: {},
      create: { name: "Dairy & Beverages", sortOrder: 2, shopId: shop.id },
    }),
    prisma.category.upsert({
      where: { shopId_name: { shopId: shop.id, name: "Snacks" } },
      update: {},
      create: { name: "Snacks", sortOrder: 3, shopId: shop.id },
    }),
    prisma.category.upsert({
      where: { shopId_name: { shopId: shop.id, name: "Household" } },
      update: {},
      create: { name: "Household", sortOrder: 4, shopId: shop.id },
    }),
    prisma.category.upsert({
      where: { shopId_name: { shopId: shop.id, name: "Personal Care" } },
      update: {},
      create: { name: "Personal Care", sortOrder: 5, shopId: shop.id },
    }),
  ]);

  console.log("Created categories:", categories.length);

  const products = [
    { name: "Basmati Rice", description: "Premium quality basmati rice, 1kg pack", price: 180, mrp: 200, unit: "kg", stock: 50, categoryId: categories[0].id },
    { name: "Wheat Atta", description: "Freshly milled whole wheat flour, 5kg pack", price: 250, mrp: 280, unit: "packet", stock: 30, categoryId: categories[0].id },
    { name: "Toor Dal", description: "Premium toor dal, 1kg pack", price: 140, mrp: 160, unit: "kg", stock: 25, categoryId: categories[0].id },
    { name: "Mustard Oil", description: "Pure mustard oil, 1 litre", price: 180, mrp: 200, unit: "litre", stock: 20, categoryId: categories[0].id },
    { name: "Amul Butter", description: "Amul pasteurized butter, 100g", price: 56, mrp: 60, unit: "piece", stock: 25, categoryId: categories[1].id },
    { name: "Amul Taaza Milk", description: "Homogenised toned milk, 500ml", price: 30, mrp: 32, unit: "packet", stock: 40, categoryId: categories[1].id },
    { name: "Brooke Bond Red Label Tea", description: "Red label natural care tea, 250g", price: 68, mrp: 75, unit: "packet", stock: 35, categoryId: categories[1].id },
    { name: "Nescafe Classic Coffee", description: "Classic coffee, 50g jar", price: 175, mrp: 190, unit: "piece", stock: 15, categoryId: categories[1].id },
    { name: "Maggi Noodles", description: "2-minute masala noodles, 70g pack", price: 14, mrp: 14, unit: "piece", stock: 100, categoryId: categories[2].id },
    { name: "Lays Classic Salted Chips", description: "Classic salted potato chips, 52g", price: 20, mrp: 20, unit: "piece", stock: 40, categoryId: categories[2].id },
    { name: "Parle-G Biscuits", description: "Glucose biscuits, 80g pack", price: 10, mrp: 10, unit: "packet", stock: 120, categoryId: categories[2].id },
    { name: "Surf Excel Detergent", description: "Matic liquid detergent, 1 litre", price: 155, mrp: 175, unit: "litre", stock: 18, categoryId: categories[3].id },
    { name: "Vim Dishwash Liquid", description: "Lemon dishwash liquid, 500ml", price: 99, mrp: 110, unit: "piece", stock: 22, categoryId: categories[3].id },
    { name: "Lifebuoy Soap", description: "Total 10 soap bar, 100g", price: 38, mrp: 42, unit: "piece", stock: 50, categoryId: categories[4].id },
    { name: "Colgate Toothpaste", description: "Colgate MaxFresh, 100g", price: 85, mrp: 95, unit: "piece", stock: 30, categoryId: categories[4].id },
    { name: "Head & Shoulders Shampoo", description: "Smooth & Silky, 180ml", price: 190, mrp: 210, unit: "piece", stock: 20, categoryId: categories[4].id },
  ];

  for (const product of products) {
    const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const existingProduct = await prisma.product.findFirst({
      where: { shopId: shop.id, name: product.name },
    });
    
    if (!existingProduct) {
      await prisma.product.create({
        data: {
          ...product,
          shopId: shop.id,
          isAvailable: true,
        },
      });
    }
  }

  console.log("Created products:", products.length);
  console.log("Seed complete!");
  console.log("Login with: demo@kiranaflow.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
