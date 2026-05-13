/**
 * Mock data seed — Sprint 1.
 *
 * Generates a plausible Helsinki food-delivery landscape:
 *   - 3 delivery platforms (Wolt, UberEats, Foodora) as labels only
 *   - ~30 curated restaurants across 6 cuisines and 6 neighborhoods
 *   - 3-5 dishes per restaurant from a cuisine-specific catalog
 *   - Each dish listed on 1-3 platforms, with price and ETA variation per platform
 *
 * Idempotent: deletes existing data before inserting.
 */
import { prisma } from './client.js';

// ----------------------------------------------------------------------------
// Static data
// ----------------------------------------------------------------------------

const PLATFORMS: Array<{ name: string; brandColor: string }> = [
  { name: 'Wolt', brandColor: '#00C2E8' },
  { name: 'UberEats', brandColor: '#06C167' },
  { name: 'Foodora', brandColor: '#D6116B' },
];

type RestaurantSeed = {
  name: string;
  cuisine: string;
  neighborhood: string;
  rating: number;
};

const RESTAURANTS: RestaurantSeed[] = [
  // Italian (5)
  { name: 'Pizza Bar Roma', cuisine: 'Italian', neighborhood: 'Kallio', rating: 4.6 },
  { name: 'Trattoria Bella', cuisine: 'Italian', neighborhood: 'Punavuori', rating: 4.4 },
  { name: 'Napoli a Kamppi', cuisine: 'Italian', neighborhood: 'Kamppi', rating: 4.7 },
  { name: 'La Forchetta', cuisine: 'Italian', neighborhood: 'Töölö', rating: 4.3 },
  { name: 'Pizzeria Quattro', cuisine: 'Italian', neighborhood: 'Hakaniemi', rating: 4.5 },

  // Asian (5)
  { name: 'Bangkok Bistro', cuisine: 'Asian', neighborhood: 'Kallio', rating: 4.5 },
  { name: 'Sushi Sora', cuisine: 'Asian', neighborhood: 'Punavuori', rating: 4.8 },
  { name: 'Pho 88', cuisine: 'Asian', neighborhood: 'Kamppi', rating: 4.4 },
  { name: 'Ramen House', cuisine: 'Asian', neighborhood: 'Hakaniemi', rating: 4.6 },
  { name: 'Wok & Roll', cuisine: 'Asian', neighborhood: 'Kruununhaka', rating: 4.2 },

  // Burgers (5)
  { name: 'Naughty BRGR', cuisine: 'Burgers', neighborhood: 'Kallio', rating: 4.5 },
  { name: 'Helsinki Burger Co.', cuisine: 'Burgers', neighborhood: 'Kamppi', rating: 4.3 },
  { name: 'Smash & Co', cuisine: 'Burgers', neighborhood: 'Punavuori', rating: 4.7 },
  { name: 'The Beef Joint', cuisine: 'Burgers', neighborhood: 'Töölö', rating: 4.4 },
  { name: 'Bistro Burger 88', cuisine: 'Burgers', neighborhood: 'Hakaniemi', rating: 4.1 },

  // Vegan (5)
  { name: 'Green Plate', cuisine: 'Vegan', neighborhood: 'Kallio', rating: 4.6 },
  { name: 'Plantbase', cuisine: 'Vegan', neighborhood: 'Punavuori', rating: 4.7 },
  { name: 'Roots & Greens', cuisine: 'Vegan', neighborhood: 'Kamppi', rating: 4.4 },
  { name: 'Vegan Kitchen', cuisine: 'Vegan', neighborhood: 'Kruununhaka', rating: 4.3 },
  { name: 'Beet Box', cuisine: 'Vegan', neighborhood: 'Töölö', rating: 4.5 },

  // Finnish (5)
  { name: 'Saaga Modern Finnish', cuisine: 'Finnish', neighborhood: 'Kruununhaka', rating: 4.8 },
  { name: 'Karelia House', cuisine: 'Finnish', neighborhood: 'Hakaniemi', rating: 4.5 },
  { name: 'Lappi Restaurant', cuisine: 'Finnish', neighborhood: 'Punavuori', rating: 4.6 },
  { name: 'Suomi Kitchen', cuisine: 'Finnish', neighborhood: 'Töölö', rating: 4.2 },
  { name: 'Aurora Bistro', cuisine: 'Finnish', neighborhood: 'Kallio', rating: 4.4 },

  // Mexican (5)
  { name: 'Cantina Helsinki', cuisine: 'Mexican', neighborhood: 'Kallio', rating: 4.3 },
  { name: 'Taqueria Don Diego', cuisine: 'Mexican', neighborhood: 'Punavuori', rating: 4.6 },
  { name: 'El Sombrero', cuisine: 'Mexican', neighborhood: 'Kamppi', rating: 4.4 },
  { name: 'Mezcal Bar', cuisine: 'Mexican', neighborhood: 'Hakaniemi', rating: 4.5 },
  { name: 'Casa Azul', cuisine: 'Mexican', neighborhood: 'Kruununhaka', rating: 4.2 },
];

type DishTemplate = { name: string; description: string; basePrice: number };

const DISH_CATALOG: Record<string, DishTemplate[]> = {
  Italian: [
    { name: 'Margherita Pizza', description: 'San Marzano tomato, mozzarella di bufala, fresh basil.', basePrice: 13.5 },
    { name: 'Quattro Formaggi', description: 'Four-cheese pizza with parmesan, gorgonzola, mozzarella, taleggio.', basePrice: 15.9 },
    { name: 'Pasta Carbonara', description: 'Guanciale, pecorino romano, egg yolk, black pepper.', basePrice: 16.5 },
    { name: 'Lasagna Bolognese', description: 'Slow-cooked ragù, béchamel, parmigiano.', basePrice: 17.9 },
    { name: 'Tiramisu', description: 'Mascarpone, espresso-soaked savoiardi, cocoa.', basePrice: 7.5 },
  ],
  Asian: [
    { name: 'Pad Thai', description: 'Rice noodles, tamarind, peanuts, lime, prawns or tofu.', basePrice: 14.9 },
    { name: 'Pho Bo', description: 'Vietnamese beef noodle soup with herbs and lime.', basePrice: 13.9 },
    { name: 'Chicken Katsu Curry', description: 'Crispy chicken cutlet over rice with Japanese curry sauce.', basePrice: 15.5 },
    { name: 'Spicy Miso Ramen', description: 'Pork broth, miso, chashu, soft-boiled egg, scallions.', basePrice: 16.5 },
    { name: 'Salmon Nigiri Set', description: '8 pieces of fresh salmon nigiri.', basePrice: 18.9 },
  ],
  Burgers: [
    { name: 'Classic Cheeseburger', description: 'Beef patty, cheddar, lettuce, tomato, house sauce.', basePrice: 14.5 },
    { name: 'Smash Double', description: 'Two smashed patties, American cheese, pickles, onion.', basePrice: 16.9 },
    { name: 'Bacon BBQ Burger', description: 'Beef patty, crispy bacon, smoked BBQ sauce, cheddar.', basePrice: 17.5 },
    { name: 'Chicken Burger', description: 'Buttermilk fried chicken, slaw, spicy mayo.', basePrice: 14.9 },
    { name: 'Sweet Potato Fries', description: 'Hand-cut, served with chipotle aioli.', basePrice: 6.5 },
  ],
  Vegan: [
    { name: 'Buddha Bowl', description: 'Quinoa, roasted veggies, avocado, tahini dressing.', basePrice: 13.9 },
    { name: 'Beyond Burger', description: 'Plant-based patty, vegan cheese, smoked tomato relish.', basePrice: 15.5 },
    { name: 'Mushroom Risotto', description: 'Creamy arborio with porcini and truffle oil.', basePrice: 16.9 },
    { name: 'Vegan Pad See Ew', description: 'Wide rice noodles, tofu, broccoli, dark soy.', basePrice: 14.5 },
    { name: 'Chocolate Mousse', description: 'Silken tofu, dark chocolate, sea salt.', basePrice: 7.9 },
  ],
  Finnish: [
    { name: 'Salmon Soup (Lohikeitto)', description: 'Creamy salmon and potato soup with dill.', basePrice: 15.9 },
    { name: 'Karelian Pasties', description: 'Rye crust filled with rice porridge, served with egg butter.', basePrice: 10.5 },
    { name: 'Reindeer Stew', description: 'Sautéed reindeer, mashed potatoes, lingonberry.', basePrice: 22.5 },
    { name: 'Smoked Vendace', description: 'Pan-fried Lake Saimaa vendace with potatoes.', basePrice: 17.9 },
    { name: 'Berry Pavlova', description: 'Meringue, whipped cream, Finnish forest berries.', basePrice: 8.5 },
  ],
  Mexican: [
    { name: 'Tacos al Pastor', description: '3 corn tortillas with marinated pork, pineapple, onion, cilantro.', basePrice: 13.5 },
    { name: 'Burrito Bowl', description: 'Rice, beans, chicken, pico de gallo, guacamole.', basePrice: 14.9 },
    { name: 'Quesadilla', description: 'Flour tortilla with melted cheese and chicken tinga.', basePrice: 12.5 },
    { name: 'Chips & Guacamole', description: 'Fresh tortilla chips with house guacamole.', basePrice: 7.9 },
    { name: 'Churros', description: 'Cinnamon sugar churros with chocolate dipping sauce.', basePrice: 6.9 },
  ],
};

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

const PICSUM_SEED = 'foodlovers';
const restaurantImage = (slug: string) => `https://picsum.photos/seed/${PICSUM_SEED}-${slug}/800/500`;
const dishImage = (slug: string) => `https://picsum.photos/seed/${PICSUM_SEED}-d-${slug}/600/400`;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const PLATFORM_PROFILES: Record<
  string,
  { priceFactor: number; feeRange: [number, number]; etaRange: [number, number] }
> = {
  Wolt: { priceFactor: 1.05, feeRange: [1.9, 3.5], etaRange: [20, 40] },
  UberEats: { priceFactor: 1.0, feeRange: [2.5, 4.5], etaRange: [25, 50] },
  Foodora: { priceFactor: 1.08, feeRange: [0.99, 2.99], etaRange: [30, 55] },
};

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;
const pickInt = (min: number, max: number) => Math.floor(randomBetween(min, max + 1));
const round2 = (n: number) => Math.round(n * 100) / 100;

// Each dish lands on 2 or 3 platforms — so the compare feature always has options.
const pickPlatformsForDish = (allPlatformIds: string[]): string[] => {
  const count = pickInt(2, 3);
  const shuffled = [...allPlatformIds].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

async function main() {
  console.log('[seed] clearing existing data…');
  await prisma.platformListing.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.platform.deleteMany();

  console.log('[seed] inserting platforms…');
  const platforms = await Promise.all(PLATFORMS.map((p) => prisma.platform.create({ data: p })));

  console.log('[seed] inserting restaurants and dishes…');
  let dishCount = 0;
  let listingCount = 0;

  for (const r of RESTAURANTS) {
    const restaurant = await prisma.restaurant.create({
      data: {
        name: r.name,
        cuisine: r.cuisine,
        neighborhood: r.neighborhood,
        rating: r.rating,
        imageUrl: restaurantImage(slugify(r.name)),
      },
    });

    const catalog = DISH_CATALOG[r.cuisine] ?? [];
    const dishesForThisRestaurant = pickInt(3, Math.min(5, catalog.length));
    const shuffledCatalog = [...catalog]
      .sort(() => Math.random() - 0.5)
      .slice(0, dishesForThisRestaurant);

    for (const t of shuffledCatalog) {
      const dish = await prisma.dish.create({
        data: {
          restaurantId: restaurant.id,
          name: t.name,
          description: t.description,
          basePrice: t.basePrice,
          imageUrl: dishImage(slugify(`${r.name}-${t.name}`)),
        },
      });
      dishCount += 1;

      const targetPlatforms = pickPlatformsForDish(platforms.map((p) => p.id));

      for (const platformId of targetPlatforms) {
        const platform = platforms.find((p) => p.id === platformId)!;
        const profile = PLATFORM_PROFILES[platform.name]!;
        const price = round2(t.basePrice * profile.priceFactor * randomBetween(0.97, 1.06));
        const deliveryFee = round2(randomBetween(profile.feeRange[0], profile.feeRange[1]));
        const deliveryMinutes = pickInt(profile.etaRange[0], profile.etaRange[1]);

        await prisma.platformListing.create({
          data: {
            dishId: dish.id,
            platformId,
            price,
            deliveryFee,
            deliveryMinutes,
            available: Math.random() > 0.05,
          },
        });
        listingCount += 1;
      }
    }
  }

  console.log('[seed] done.');
  console.log(`  platforms:   ${platforms.length}`);
  console.log(`  restaurants: ${RESTAURANTS.length}`);
  console.log(`  dishes:      ${dishCount}`);
  console.log(`  listings:    ${listingCount}`);
}

main()
  .catch((err) => {
    console.error('[seed] failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
