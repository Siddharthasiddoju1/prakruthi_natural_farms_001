import { prisma } from "./prisma";

interface SeedProductInput {
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  stockQty: number;
  organicTag: string;
}

const defaultProducts: SeedProductInput[] = [
  {
    name: "A2 Cow Milk",
    category: "Cow Milk",
    description: "Daily fresh A2 milk from native cows.",
    price: 78,
    unit: "liter",
    stockQty: 300,
    organicTag: "Natural"
  },
  {
    name: "Fresh Curd",
    category: "Curd",
    description: "Set curd from farm-fresh milk.",
    price: 65,
    unit: "500g",
    stockQty: 220,
    organicTag: "Natural"
  },
  {
    name: "Desi Ghee",
    category: "Ghee",
    description: "Traditional bilona ghee.",
    price: 620,
    unit: "500ml",
    stockQty: 90,
    organicTag: "Farm Made"
  },
  {
    name: "Organic Vegetable Basket",
    category: "Organic Vegetables",
    description: "Seasonal, chemical-free vegetables.",
    price: 199,
    unit: "basket",
    stockQty: 160,
    organicTag: "Organic"
  },
  {
    name: "Farm Fresh Eggs",
    category: "Farm Fresh Products",
    description: "Country eggs from free-range hens.",
    price: 120,
    unit: "12 pcs",
    stockQty: 140,
    organicTag: "Farm Fresh"
  }
];

export async function ensureSeedProducts(force = false) {
  const currentCount = await prisma.product.count();

  if (currentCount > 0 && !force) {
    return { inserted: 0, skipped: true, totalProducts: currentCount };
  }

  if (force && currentCount > 0) {
    await prisma.product.deleteMany({});
  }

  await prisma.product.createMany({
    data: defaultProducts
  });

  const totalProducts = await prisma.product.count();
  return { inserted: defaultProducts.length, skipped: false, totalProducts };
}
