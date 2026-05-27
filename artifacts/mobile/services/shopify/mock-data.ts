import type { ShopifyCollection, ShopifyProduct } from "./types";

function makeProduct(
  idSuffix: string,
  handle: string,
  title: string,
  description: string,
  productType: string,
  tags: string[],
  vendor: string,
  priceAED: string,
  imageUrl?: string
): ShopifyProduct {
  return {
    id: `gid://shopify/Product/${idSuffix}`,
    handle,
    title,
    description,
    descriptionHtml: `<p>${description}</p>`,
    productType,
    tags,
    vendor,
    featuredImage: imageUrl
      ? { url: imageUrl, altText: title, width: 800, height: 800 }
      : null,
    images: {
      nodes: imageUrl
        ? [{ url: imageUrl, altText: title, width: 800, height: 800 }]
        : [],
    },
    priceRange: {
      minVariantPrice: { amount: priceAED, currencyCode: "AED" },
      maxVariantPrice: { amount: priceAED, currencyCode: "AED" },
    },
    compareAtPriceRange: null,
    variants: {
      nodes: [
        {
          id: `gid://shopify/ProductVariant/${idSuffix}01`,
          title: "Default Title",
          price: { amount: priceAED, currencyCode: "AED" },
          availableForSale: true,
          quantityAvailable: 50,
        },
      ],
    },
    availableForSale: true,
  };
}

const UGANDA_PRODUCTS: ShopifyProduct[] = [
  makeProduct("10001", "matooke-fresh-bunch", "Matooke Bunches", "Fresh green cooking bananas, unripe", "Fresh Produce", ["uganda", "fresh", "popular", "staple"], "Mekazon", "18.50"),
  makeProduct("10002", "posho-maize-flour-2kg", "Posho (Maize Flour)", "Finest white maize flour, 2kg", "Flours & Grains", ["uganda", "staple", "flour"], "Basmati Uganda", "12.00"),
  makeProduct("10003", "cassava-flour-1kg", "Cassava Flour", "Sun-dried cassava, stone-ground, 1kg", "Flours & Grains", ["uganda", "staple"], "Mekazon", "14.00"),
  makeProduct("10004", "groundnut-paste-500g", "Groundnut Paste", "Pure roasted groundnut paste, no additives, 500g", "Condiments", ["uganda", "loved", "bestseller"], "Mekazon", "16.00"),
  makeProduct("10005", "sukuma-wiki-fresh", "Sukuma Wiki", "Fresh African kale, packed crisp", "Fresh Produce", ["uganda", "kenya", "fresh"], "Mekazon", "8.00"),
  makeProduct("10006", "rolex-spice-mix-100g", "Rolex Spice Mix", "Authentic Ugandan Rolex seasoning blend, 100g", "Spices & Seasonings", ["uganda", "new", "spice"], "Mekazon", "9.50"),
  makeProduct("10007", "ugandan-chili-sauce-250ml", "Ugandan Chili Sauce", "Hot and smoky traditional chili sauce, 250ml", "Sauces", ["uganda"], "Mekazon", "11.00"),
  makeProduct("10008", "gnut-soup-mix-200g", "G-Nut Soup Mix", "Ready groundnut soup powder, 200g", "Soups & Stews", ["uganda"], "Mekazon", "13.00"),
];

const KENYA_PRODUCTS: ShopifyProduct[] = [
  makeProduct("20001", "unga-maize-flour-2kg", "Unga (Maize Flour)", "Premium Kenyan white maize flour, 2kg", "Flours & Grains", ["kenya", "staple", "popular"], "Unga Ltd", "13.50"),
  makeProduct("20002", "royco-mchuzi-mix-200g", "Royco Mchuzi Mix", "Authentic Kenyan cooking spice blend, 200g", "Spices & Seasonings", ["kenya", "must-have", "royco"], "Unilever Kenya", "8.00"),
  makeProduct("20003", "blue-band-margarine-500g", "Blue Band Margarine", "Original Kenyan Blue Band spread, 500g", "Dairy & Spreads", ["kenya", "loved", "blue-band"], "Upfield Kenya", "14.00"),
  makeProduct("20004", "kenyan-chai-masala-100g", "Kenyan Chai Masala", "Spiced tea blend with cardamom and ginger, 100g tin", "Beverages", ["kenya", "tea", "chai"], "Mekazon", "11.00"),
  makeProduct("20005", "githeri-mix-500g", "Githeri Mix", "Maize and beans, pre-soaked and ready, 500g", "Legumes & Pulses", ["kenya"], "Mekazon", "9.50"),
  makeProduct("20006", "pilau-masala-100g", "Pilau Masala", "Kenyan pilau spice blend, fragrant and bold, 100g", "Spices & Seasonings", ["kenya", "new"], "Mekazon", "10.00"),
  makeProduct("20007", "sukuma-wiki-fresh-kenya", "Sukuma Wiki", "Fresh African kale, packed crisp", "Fresh Produce", ["kenya", "fresh"], "Mekazon", "8.00"),
  makeProduct("20008", "mursik-powder-300g", "Mursik Powder", "Kalenjin-style fermented milk powder, 300g", "Dairy & Spreads", ["kenya"], "Mekazon", "19.00"),
];

const ETHIOPIA_PRODUCTS: ShopifyProduct[] = [
  makeProduct("30001", "teff-flour-1kg", "Teff Flour", "Premium white and brown teff, perfect for injera, 1kg", "Flours & Grains", ["ethiopia", "authentic", "teff"], "Abyssinia Grains", "22.00"),
  makeProduct("30002", "injera-ready-5pcs", "Injera (Ready-Made)", "Freshly made injera, same-day delivery, 5 pieces", "Ready Foods", ["ethiopia", "fresh", "injera"], "Mekazon Fresh", "28.00"),
  makeProduct("30003", "berbere-spice-blend-200g", "Berbere Spice Blend", "Bold Ethiopian berbere, 12-spice mix, 200g", "Spices & Seasonings", ["ethiopia", "must-have", "berbere"], "Ethiopica", "15.00"),
  makeProduct("30004", "shiro-powder-500g", "Shiro Powder", "Roasted chickpea powder for shiro stew, 500g", "Flours & Grains", ["ethiopia"], "Mekazon", "14.00"),
  makeProduct("30005", "ethiopian-coffee-yirgacheffe-250g", "Ethiopian Coffee", "Single-origin Yirgacheffe beans, whole, 250g", "Coffee & Tea", ["ethiopia", "loved", "coffee", "yirgacheffe"], "Kaffa Coffee", "35.00"),
  makeProduct("30006", "niter-kibbeh-300g", "Niter Kibbeh", "Spiced Ethiopian clarified butter, 300g jar", "Condiments", ["ethiopia"], "Mekazon", "18.00"),
  makeProduct("30007", "mitmita-pepper-100g", "Mitmita Pepper", "Hot Ethiopian bird's eye chili powder, 100g", "Spices & Seasonings", ["ethiopia"], "Ethiopica", "12.00"),
  makeProduct("30008", "tej-honey-wine-kit", "Tej Honey Wine Kit", "Ethiopian honey wine home brewing kit", "Specialty", ["ethiopia", "new"], "Mekazon", "32.00"),
];

const OTHER_AFRICAN_PRODUCTS: ShopifyProduct[] = [
  makeProduct("40001", "egusi-melon-seeds-500g", "Egusi (Melon Seeds)", "Dried melon seeds for Nigerian soups, 500g", "Nuts & Seeds", ["west-africa", "nigeria", "popular"], "Mekazon", "16.00"),
  makeProduct("40002", "fufu-flour-1kg", "Fufu Flour", "West African cassava and plantain blend, 1kg", "Flours & Grains", ["west-africa", "ghana", "nigeria"], "Mekazon", "14.00"),
  makeProduct("40003", "jollof-spice-mix-200g", "Jollof Spice Mix", "West African jollof rice seasoning, 200g", "Spices & Seasonings", ["west-africa", "nigeria", "ghana", "loved"], "Mekazon", "10.00"),
  makeProduct("40004", "suya-spice-blend-150g", "Suya Spice Blend", "Northern Nigerian grilling spice, 150g", "Spices & Seasonings", ["west-africa", "nigeria", "hot"], "Mekazon", "11.00"),
  makeProduct("40005", "plantain-green-bunch", "Plantain (Unripe)", "Green plantains for kelewele and chips, per bunch", "Fresh Produce", ["west-africa", "ghana", "fresh"], "Mekazon", "12.00"),
  makeProduct("40006", "ogbono-seeds-200g", "Ogbono Seeds", "African mango seeds for draw soup, 200g", "Nuts & Seeds", ["west-africa", "nigeria"], "Mekazon", "18.00"),
  makeProduct("40007", "stockfish-panla", "Stockfish (Panla)", "Norwegian dried cod, African style, per piece", "Seafood", ["west-africa", "nigeria"], "Mekazon", "24.00"),
  makeProduct("40008", "palm-oil-zomi-500ml", "Palm Oil (Zomi)", "Red palm oil, unrefined Ghanaian style, 500ml", "Oils & Fats", ["west-africa", "ghana"], "Mekazon", "15.00"),
];

function makeCollection(
  idSuffix: string,
  handle: string,
  title: string,
  description: string,
  products: ShopifyProduct[],
  imageUrl?: string
): ShopifyCollection {
  return {
    id: `gid://shopify/Collection/${idSuffix}`,
    handle,
    title,
    description,
    image: imageUrl ? { url: imageUrl, altText: title, width: 1200, height: 600 } : null,
    products: {
      nodes: products,
      pageInfo: { hasNextPage: false, endCursor: null },
    },
  };
}

export const MOCK_COLLECTIONS: Record<string, ShopifyCollection> = {
  "ugandan-products": makeCollection("1001", "ugandan-products", "Ugandan Products", "Authentic Ugandan foods and ingredients", UGANDA_PRODUCTS),
  "kenyan-products": makeCollection("1002", "kenyan-products", "Kenyan Products", "Authentic Kenyan foods and ingredients", KENYA_PRODUCTS),
  "ethiopian-products": makeCollection("1003", "ethiopian-products", "Ethiopian Products", "Authentic Ethiopian foods and ingredients", ETHIOPIA_PRODUCTS),
  "other-african-products": makeCollection("1004", "other-african-products", "Other African Products", "Pan-African foods from across the continent", OTHER_AFRICAN_PRODUCTS),
  "all-african-products": makeCollection(
    "1005",
    "all-african-products",
    "All African Products",
    "The complete African diaspora marketplace",
    [...UGANDA_PRODUCTS.slice(0, 2), ...KENYA_PRODUCTS.slice(0, 2), ...ETHIOPIA_PRODUCTS.slice(0, 2), ...OTHER_AFRICAN_PRODUCTS.slice(0, 2)]
  ),
};

export const MOCK_COLLECTION_LIST = Object.values(MOCK_COLLECTIONS).map(
  ({ id, handle, title, description, image, products }) => ({
    id,
    handle,
    title,
    description,
    image,
    productsCount: products.nodes.length,
  })
);
