import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Initializing database...");
  
  try {
    // Test database connection
    await prisma.$executeRaw`SELECT 1`;
    console.log("✅ Database connection successful");
    
    // Seed sample data if empty
    const productCount = await prisma.product.count();
    
    if (productCount === 0) {
      console.log("📦 Seeding sample products...");
      await prisma.product.createMany({
        data: [
          {
            name: "A2 Cow Milk",
            category: "Milk",
            description: "100% pure A2 cow milk",
            price: 78,
            unit: "1 Liter",
            stockQty: 100,
            organicTag: "100% Organic",
          },
          {
            name: "Fresh Curd",
            category: "Dairy",
            description: "Made from fresh milk daily",
            price: 65,
            unit: "500g",
            stockQty: 50,
            organicTag: "Fresh Daily",
          },
          {
            name: "Desi Ghee",
            category: "Ghee",
            description: "Pure desi ghee from cow milk",
            price: 620,
            unit: "500ml",
            stockQty: 30,
            organicTag: "Pure Desi",
          },
          {
            name: "Organic Veg Basket",
            category: "Vegetables",
            description: "Mix of seasonal organic vegetables",
            price: 199,
            unit: "Per Basket",
            stockQty: 75,
            organicTag: "Fresh Farm",
          },
          {
            name: "Farm Fresh Eggs",
            category: "Eggs",
            description: "Free range farm fresh eggs",
            price: 120,
            unit: "12 Eggs",
            stockQty: 60,
            organicTag: "Free Range",
          },
        ],
      });
      console.log("✅ Products seeded successfully");
    } else {
      console.log(`📦 Database already has ${productCount} products`);
    }
    
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
