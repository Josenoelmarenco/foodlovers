-- CreateTable
CREATE TABLE "restaurants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cuisine" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dishes" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "base_price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platforms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand_color" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_listings" (
    "id" TEXT NOT NULL,
    "dish_id" TEXT NOT NULL,
    "platform_id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "delivery_fee" DOUBLE PRECISION NOT NULL,
    "delivery_minutes" INTEGER NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_listings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "restaurants_cuisine_idx" ON "restaurants"("cuisine");

-- CreateIndex
CREATE INDEX "restaurants_neighborhood_idx" ON "restaurants"("neighborhood");

-- CreateIndex
CREATE INDEX "dishes_restaurant_id_idx" ON "dishes"("restaurant_id");

-- CreateIndex
CREATE INDEX "dishes_name_idx" ON "dishes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "platforms_name_key" ON "platforms"("name");

-- CreateIndex
CREATE INDEX "platform_listings_dish_id_idx" ON "platform_listings"("dish_id");

-- CreateIndex
CREATE INDEX "platform_listings_platform_id_idx" ON "platform_listings"("platform_id");

-- CreateIndex
CREATE INDEX "platform_listings_available_idx" ON "platform_listings"("available");

-- CreateIndex
CREATE UNIQUE INDEX "platform_listings_dish_id_platform_id_key" ON "platform_listings"("dish_id", "platform_id");

-- AddForeignKey
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_listings" ADD CONSTRAINT "platform_listings_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_listings" ADD CONSTRAINT "platform_listings_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
