import 'dotenv/config';
import connectDB from '../lib/mongodb.js';
import User from '../models/User.js';
import SellerProfile from '../models/SellerProfile.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import SellerFulfillment from '../models/SellerFulfillment.js';
import { hashPassword } from '../lib/auth.js';

async function seed() {
  console.log('Connecting to database...');
  await connectDB();

  // 1. Categories
  const categoriesData = [
    {
      name: 'Home Decor',
      slug: 'home-decor',
      description: 'Artisanal accents, macrame hangings, brass diyas, and handcrafted table runners.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Jewelry',
      slug: 'jewelry',
      description: 'Handmade silver filigree, terracotta earrings, brass chokers, and semi-precious beadwork.',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Handmade Pottery',
      slug: 'handmade-pottery',
      description: 'Wheel-thrown ceramic cups, glazed terracotta planters, and traditional clay vases.',
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Clothing & Textiles',
      slug: 'clothing-and-textiles',
      description: 'Block-printed cotton dupattas, khadi shirts, handwoven pashminas, and kantha jackets.',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Wooden Crafts',
      slug: 'wooden-crafts',
      description: 'Hand-carved sheesham spice boxes, wooden serving platters, and teak keepsake trays.',
      image: 'https://images.unsplash.com/photo-1546484475-7f7bd55792da?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Paintings & Art',
      slug: 'paintings-and-art',
      description: 'Original Madhubani folklore art, Pichwai cow paintings, and watercolor botanicals.',
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Handmade Bags',
      slug: 'handmade-bags',
      description: 'Eco-friendly braided jute totes, organic cotton sling bags, and embroidered clutches.',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Gifts & Accessories',
      slug: 'gifts-and-accessories',
      description: 'Soy wax aroma candles, leather journals, handmade soap bars, and brass bookmarks.',
      image: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?q=80&w=800&auto=format&fit=crop',
    },
  ];

  console.log('Seeding categories...');
  const categoryMap = {};
  for (const cat of categoriesData) {
    const saved = await Category.findOneAndUpdate({ slug: cat.slug }, cat, {
      upsert: true,
      new: true,
    });
    categoryMap[cat.slug] = saved;
  }

  // 2. Demo Users & Artisans
  console.log('Seeding demo accounts...');
  const defaultPassword = 'ArtisanPass123!';
  const hashedPassword = await hashPassword(defaultPassword);
  const customerPassword = await hashPassword('CustomerPass123!');

  // Demo Customer
  const customerUser = await User.findOneAndUpdate(
    { email: 'customer@kalakart.com' },
    {
      name: 'Aarav Sharma',
      email: 'customer@kalakart.com',
      passwordHash: customerPassword,
      role: 'customer',
      phone: '+919876500001',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
      addresses: [
        {
          name: 'Aarav Sharma',
          phone: '+919876500001',
          street: '404 Green Valley Apartments, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
          isDefault: true,
        },
      ],
    },
    { upsert: true, new: true }
  );

  // 5 Artisans
  const artisansData = [
    {
      user: {
        name: 'Priya Sharma',
        email: 'artisan.priya@kalakart.com',
        phone: '+919811122233',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
      },
      shop: {
        shopName: 'Mitti & Clay Studio',
        slug: 'mitti-and-clay-studio',
        description:
          'Passionate ceramic artist shaping earth and water into functional stoneware and decorative terracotta for soulful modern living spaces.',
        location: 'Khurja, Uttar Pradesh',
        logo: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=300&auto=format&fit=crop',
        banner: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1200&auto=format&fit=crop',
        applicationStatus: 'approved',
        approvedAt: new Date(),
      },
    },
    {
      user: {
        name: 'Rajesh Suthar',
        email: 'artisan.rajesh@kalakart.com',
        phone: '+919822233344',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
      },
      shop: {
        shopName: 'Marwar Woodcrafts',
        slug: 'marwar-woodcrafts',
        description:
          'Third-generation wood artisan crafting sustainably harvested Sheesham and Teak wood heirloom kitchenware and home decor.',
        location: 'Jodhpur, Rajasthan',
        logo: 'https://images.unsplash.com/photo-1546484475-7f7bd55792da?q=80&w=300&auto=format&fit=crop',
        banner: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1200&auto=format&fit=crop',
        applicationStatus: 'approved',
        approvedAt: new Date(),
      },
    },
    {
      user: {
        name: 'Ananya Sen',
        email: 'artisan.ananya@kalakart.com',
        phone: '+919833344455',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
      },
      shop: {
        shopName: 'Dhaaga Handloom Weaves',
        slug: 'dhaaga-handloom-weaves',
        description:
          'Dedicated weaver community reviving ancient natural-dye block printing, handwoven Bengal cottons, and heirloom Kantha embroidery.',
        location: 'Shantiniketan, West Bengal',
        logo: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=300&auto=format&fit=crop',
        banner: 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?q=80&w=1200&auto=format&fit=crop',
        applicationStatus: 'approved',
        approvedAt: new Date(),
      },
    },
    {
      user: {
        name: 'Kabir Varma',
        email: 'artisan.kabir@kalakart.com',
        phone: '+919844455566',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
      },
      shop: {
        shopName: 'Rupak Silver & Brass',
        slug: 'rupak-silver-brass',
        description:
          'Handmade tribal ornaments, oxidized 92.5 sterling silver filigree, and hammered brass adornments inspired by heritage folk motifs.',
        location: 'Cuttack, Odisha',
        logo: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=300&auto=format&fit=crop',
        banner: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop',
        applicationStatus: 'approved',
        approvedAt: new Date(),
      },
    },
    {
      user: {
        name: 'Meera Chundawat',
        email: 'artisan.meera@kalakart.com',
        phone: '+919855566677',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop',
      },
      shop: {
        shopName: 'Chitrakala Folk Atelier',
        slug: 'chitrakala-folk-atelier',
        description:
          'Creating vibrant Madhubani, Warli, and Pichwai paintings using handmade bamboo brushes and organic natural mineral pigments on handmade paper.',
        location: 'Udaipur, Rajasthan',
        logo: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=300&auto=format&fit=crop',
        banner: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop',
        applicationStatus: 'approved',
        approvedAt: new Date(),
      },
    },
  ];

  const artisanProfiles = [];

  for (const art of artisansData) {
    const userDoc = await User.findOneAndUpdate(
      { email: art.user.email },
      {
        ...art.user,
        passwordHash: hashedPassword,
        role: 'seller',
        isActive: true,
      },
      { upsert: true, new: true }
    );

    const profileDoc = await SellerProfile.findOneAndUpdate(
      { userId: userDoc._id },
      {
        ...art.shop,
        userId: userDoc._id,
      },
      { upsert: true, new: true }
    );

    artisanProfiles.push({ user: userDoc, profile: profileDoc });
  }

  // 3. Products (24 unique authentic handmade products)
  console.log('Seeding 24 handmade products...');
  const productsData = [
    // Priya (Mitti & Clay Studio) - Pottery & Decor
    {
      artisanIdx: 0,
      categorySlug: 'handmade-pottery',
      name: 'Speckled Terracotta Serving Bowl Set',
      slug: 'speckled-terracotta-serving-bowl-set',
      description:
        'Individually wheel-thrown from native riverbed clay and finished with a non-toxic matte speckled white glaze. Microwave and dishwasher safe, perfect for warm curries, salads, and mindful meals.',
      images: [
        'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop',
      ],
      price: 1450,
      compareAtPrice: 1800,
      stock: 18,
      materials: 'Natural river clay, food-grade mineral glaze',
      dimensions: 'Diameter 7.5 in, Height 3.2 in',
      weight: '850 g',
      preparationTime: '2-3 business days',
      averageRating: 4.9,
      reviewCount: 14,
    },
    {
      artisanIdx: 0,
      categorySlug: 'handmade-pottery',
      name: 'Fluted Ceramic Matcha & Chai Mug',
      slug: 'fluted-ceramic-matcha-chai-mug',
      description:
        'An ergonomically sculpted stoneware mug with a tactile ribbed body and a wide, comfortable handle. Finished in a warm oatmeal glaze with subtle clay speckles.',
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?q=80&w=800&auto=format&fit=crop',
      ],
      price: 650,
      compareAtPrice: 850,
      stock: 25,
      materials: 'Stoneware clay, reactive glaze',
      dimensions: '350 ml capacity, 9 cm height',
      weight: '320 g',
      preparationTime: '1-2 business days',
      averageRating: 4.8,
      reviewCount: 9,
    },
    {
      artisanIdx: 0,
      categorySlug: 'home-decor',
      name: 'Earthen Ribbed Terracotta Planter',
      slug: 'earthen-ribbed-terracotta-planter',
      description:
        'Hand-turned terracotta planter with natural breathable porous walls that promote healthy root aeration. Includes a drainage hole and matching saucer.',
      images: [
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?q=80&w=800&auto=format&fit=crop',
      ],
      price: 920,
      compareAtPrice: 1150,
      stock: 14,
      materials: 'Sun-baked terracotta clay',
      dimensions: 'Height 6 in, Top Rim 6.5 in',
      weight: '1.2 kg',
      preparationTime: '2-4 business days',
      averageRating: 4.7,
      reviewCount: 11,
    },
    {
      artisanIdx: 0,
      categorySlug: 'home-decor',
      name: 'Rustic Terracotta Oil Pourer & Bud Vase',
      slug: 'rustic-terracotta-oil-pourer-bud-vase',
      description:
        'A graceful dual-purpose pitcher that can be used for olive oil dispensing or as an earthy minimalist bud vase for dried botanical stems.',
      images: [
        'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?q=80&w=800&auto=format&fit=crop',
      ],
      price: 780,
      compareAtPrice: 950,
      stock: 12,
      materials: 'Unglazed terracotta with waterproof interior seal',
      dimensions: 'Height 7 in, Base 4 in',
      weight: '450 g',
      preparationTime: '2 business days',
      averageRating: 4.6,
      reviewCount: 5,
    },

    // Rajesh (Marwar Woodcrafts) - Wood & Kitchen
    {
      artisanIdx: 1,
      categorySlug: 'wooden-crafts',
      name: 'Hand-Carved Sheesham Wood Spice Box (Masala Dabba)',
      slug: 'hand-carved-sheesham-wood-spice-box',
      description:
        'A traditional nine-compartment Indian spice chest hand-carved with floral jaali filigree on the lid. Preserves the aroma of spices and adds rustic regal warmth to any kitchen.',
      images: [
        'https://images.unsplash.com/photo-1546484475-7f7bd55792da?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=800&auto=format&fit=crop',
      ],
      price: 1850,
      compareAtPrice: 2400,
      stock: 10,
      materials: 'Seasoned Indian Rosewood (Sheesham), brass latch',
      dimensions: '8.5 x 8.5 x 2.8 inches',
      weight: '980 g',
      preparationTime: '3-4 business days',
      averageRating: 5.0,
      reviewCount: 22,
    },
    {
      artisanIdx: 1,
      categorySlug: 'wooden-crafts',
      name: 'Live-Edge Acacia Serving Platter & Board',
      slug: 'live-edge-acacia-serving-platter-board',
      description:
        'Sustainably sourced single-block acacia wood charcuterie board featuring rich contrasting wood grain and polished live edges. Conditioned with edible beeswax and walnut oil.',
      images: [
        'https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800&auto=format&fit=crop',
      ],
      price: 1290,
      compareAtPrice: 1650,
      stock: 15,
      materials: 'Wild Acacia hardwood, pure beeswax finish',
      dimensions: '16 x 8 x 0.8 inches',
      weight: '1.1 kg',
      preparationTime: '2-3 business days',
      averageRating: 4.8,
      reviewCount: 16,
    },
    {
      artisanIdx: 1,
      categorySlug: 'wooden-crafts',
      name: 'Carved Teakwood Decorative Coaster Set (6 pcs)',
      slug: 'carved-teakwood-decorative-coaster-set',
      description:
        'Hexagonal teakwood coasters engraved with sacred geometric mandala motifs. Includes a custom matching storage stand.',
      images: [
        'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800&auto=format&fit=crop',
      ],
      price: 590,
      compareAtPrice: 750,
      stock: 30,
      materials: 'Reclaimed Teak wood',
      dimensions: 'Diameter 4 in each',
      weight: '400 g',
      preparationTime: '1-2 business days',
      averageRating: 4.7,
      reviewCount: 8,
    },
    {
      artisanIdx: 1,
      categorySlug: 'gifts-and-accessories',
      name: 'Artisan Wood & Brass Desk Organizer Tray',
      slug: 'artisan-wood-and-brass-desk-organizer-tray',
      description:
        'Sleek compartmentalized tray for fountain pens, watch, keys, and everyday pocket essentials. Crafted with precision dovetail joints.',
      images: [
        'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=800&auto=format&fit=crop',
      ],
      price: 1100,
      compareAtPrice: 1400,
      stock: 12,
      materials: 'Sheesham wood, brushed antique brass',
      dimensions: '10 x 6 x 1.2 inches',
      weight: '520 g',
      preparationTime: '2-3 business days',
      averageRating: 4.9,
      reviewCount: 7,
    },

    // Ananya (Dhaaga Handloom Weaves) - Textiles & Bags
    {
      artisanIdx: 2,
      categorySlug: 'clothing-and-textiles',
      name: 'Indigo Dabu Hand-Block Printed Cotton Stole',
      slug: 'indigo-dabu-hand-block-printed-cotton-stole',
      description:
        'Authentic mud-resist Dabu block printed stole dyed in natural fermented indigo vats on gossamer soft Mulmul cotton. Accented with playful hand-twisted fringe.',
      images: [
        'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1528458876861-544fd1761a91?q=80&w=800&auto=format&fit=crop',
      ],
      price: 1350,
      compareAtPrice: 1750,
      stock: 22,
      materials: '100% Organic Mulmul cotton, natural indigo dye',
      dimensions: '200 x 60 cm',
      weight: '180 g',
      preparationTime: '2 business days',
      averageRating: 4.9,
      reviewCount: 19,
    },
    {
      artisanIdx: 2,
      categorySlug: 'clothing-and-textiles',
      name: 'Bengal Kantha Embroidered Cushion Cover',
      slug: 'bengal-kantha-embroidered-cushion-cover',
      description:
        'Layers of upcycled handloom cotton stitched together with thousands of vibrant running Kantha stitches by rural women artisans. Reversible and unique.',
      images: [
        'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=800&auto=format&fit=crop',
      ],
      price: 850,
      compareAtPrice: 1100,
      stock: 16,
      materials: 'Upcycled vintage handloom cotton, anchor threads',
      dimensions: '16 x 16 inches',
      weight: '210 g',
      preparationTime: '2-3 business days',
      averageRating: 4.8,
      reviewCount: 12,
    },
    {
      artisanIdx: 2,
      categorySlug: 'handmade-bags',
      name: 'Braided Jute & Vegan Leather Market Tote',
      slug: 'braided-jute-vegan-leather-market-tote',
      description:
        'Sturdy eco-friendly shopper tote hand-braided from Golden Bengal jute fibre. Features reinforced vegan tan leather shoulder straps and an inner zipper pocket.',
      images: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
      ],
      price: 1690,
      compareAtPrice: 2200,
      stock: 14,
      materials: 'Natural unbleached jute, cruelty-free vegan leather, cotton lining',
      dimensions: '15 x 14 x 5 inches',
      weight: '680 g',
      preparationTime: '2-4 business days',
      averageRating: 4.9,
      reviewCount: 18,
    },
    {
      artisanIdx: 2,
      categorySlug: 'handmade-bags',
      name: 'Kutch Mirror Work Canvas Sling Bag',
      slug: 'kutch-mirror-work-canvas-sling-bag',
      description:
        'Boho crossbody bag ornamented with authentic Abhala mirror embroidery and resham thread geometric stitches. Features an adjustable strap and zip closure.',
      images: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
      ],
      price: 1150,
      compareAtPrice: 1500,
      stock: 20,
      materials: 'Heavy duck cotton canvas, acrylic mirrors, brass hardware',
      dimensions: '9 x 8 x 2.5 inches',
      weight: '310 g',
      preparationTime: '1-2 business days',
      averageRating: 4.7,
      reviewCount: 10,
    },

    // Kabir (Rupak Silver & Brass) - Jewelry & Brass
    {
      artisanIdx: 3,
      categorySlug: 'jewelry',
      name: 'Oxidized Silver Jhumka with Filigree Petals',
      slug: 'oxidized-silver-jhumka-with-filigree-petals',
      description:
        'Traditional Odishan Tarakasi silver filigree work reimagined in floral tiered bell jhumkas with gentle tinkling ghungroo beads. Hypoallergenic and nickel-free.',
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
      ],
      price: 1950,
      compareAtPrice: 2500,
      stock: 8,
      materials: '92.5 Sterling silver with antique oxidized finish',
      dimensions: 'Length 6.5 cm, Width 3 cm',
      weight: '24 g (pair)',
      preparationTime: '3-4 business days',
      averageRating: 4.9,
      reviewCount: 25,
    },
    {
      artisanIdx: 3,
      categorySlug: 'jewelry',
      name: 'Hammered Brass Solar Choker Necklace',
      slug: 'hammered-brass-solar-choker-necklace',
      description:
        'A striking statement collar necklace forged and planished by hand from pure solid brass sheet. Clear-coated with an organic lacquer to resist tarnish.',
      images: [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
      ],
      price: 1400,
      compareAtPrice: 1900,
      stock: 11,
      materials: 'Solid bell brass, adjustable black cord tie',
      dimensions: 'Diameter 4.8 inches (flexible fit)',
      weight: '62 g',
      preparationTime: '2-3 business days',
      averageRating: 4.6,
      reviewCount: 8,
    },
    {
      artisanIdx: 3,
      categorySlug: 'home-decor',
      name: 'Handcrafted Brass Peacock Oil Lamp (Kuthu Vilakku)',
      slug: 'handcrafted-brass-peacock-oil-lamp',
      description:
        'Lost-wax cast solid brass diya crowned with a majestic open-winged Mayil (peacock). Fills the home with auspicious warmth and traditional radiance.',
      images: [
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
      ],
      price: 2200,
      compareAtPrice: 2800,
      stock: 7,
      materials: 'Heavy cast yellow brass',
      dimensions: 'Height 9 inches, Base 4 inches',
      weight: '1.4 kg',
      preparationTime: '3-5 business days',
      averageRating: 5.0,
      reviewCount: 15,
    },
    {
      artisanIdx: 3,
      categorySlug: 'jewelry',
      name: 'Raw Raw Quartz & Brass Wire Wrap Ring',
      slug: 'raw-quartz-brass-wire-wrap-ring',
      description:
        'A natural unpolished Himalayan clear quartz crystal point nestled in hand-hammered raw jeweler brass wire. Each ring is entirely unique.',
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
      ],
      price: 750,
      compareAtPrice: 950,
      stock: 20,
      materials: 'Himalayan natural quartz, tarnish-resistant brass wire',
      dimensions: 'Adjustable band (sizes 6-9)',
      weight: '8 g',
      preparationTime: '1-2 business days',
      averageRating: 4.7,
      reviewCount: 9,
    },

    // Meera (Chitrakala Folk Atelier) - Art & Gifts
    {
      artisanIdx: 4,
      categorySlug: 'paintings-and-art',
      name: 'Hand-Painted Madhubani Tree of Life (Framed)',
      slug: 'hand-painted-madhubani-tree-of-life-framed',
      description:
        'Intricate Mithila artwork painted using nib pens and natural pigments on handmade pulp paper. Depicts the flourishing Tree of Life with songbirds, peacock pairs, and lotus flowers.',
      images: [
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop',
      ],
      price: 3200,
      compareAtPrice: 4200,
      stock: 5,
      materials: 'Handmade cotton rag paper, natural vegetable inks, glass teak frame',
      dimensions: '14 x 18 inches (with frame)',
      weight: '1.6 kg',
      preparationTime: '5-7 business days',
      averageRating: 5.0,
      reviewCount: 30,
    },
    {
      artisanIdx: 4,
      categorySlug: 'paintings-and-art',
      name: 'Pichwai Holy Cow with Lotus Vignette',
      slug: 'pichwai-holy-cow-with-lotus-vignette',
      description:
        'Detailed Rajasthan Pichwai painting rendered with 24K real gold dust detailing and stone colors on starched cotton fabric. Symbolizes prosperity, love, and divine grace.',
      images: [
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop',
      ],
      price: 3800,
      compareAtPrice: 4800,
      stock: 4,
      materials: 'Handwoven khadi fabric, pure gold foil dust, mineral pigments',
      dimensions: '16 x 20 inches',
      weight: '900 g',
      preparationTime: '4-6 business days',
      averageRating: 4.9,
      reviewCount: 14,
    },
    {
      artisanIdx: 4,
      categorySlug: 'gifts-and-accessories',
      name: 'Hand-Poured Soy Wax Botanical Candle (Sandalwood & Jasmine)',
      slug: 'hand-poured-soy-wax-botanical-candle',
      description:
        'Slow-burning 100% natural soy candle infused with Mysore sandalwood and night-blooming mogra jasmine essential oils. Topped with dried marigold petals in an upcycled amber glass jar.',
      images: [
        'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=crop',
      ],
      price: 680,
      compareAtPrice: 850,
      stock: 35,
      materials: 'Soy wax, lead-free cotton wick, therapeutic grade essential oils',
      dimensions: '220 g (approx 45 hrs burn time)',
      weight: '450 g',
      preparationTime: '1-2 business days',
      averageRating: 4.8,
      reviewCount: 28,
    },
    {
      artisanIdx: 4,
      categorySlug: 'gifts-and-accessories',
      name: 'Handbound Leather Journal with Deckle Edge Paper',
      slug: 'handbound-leather-journal-with-deckle-edge-paper',
      description:
        'Vintage style diary bound in supple vegetable-tanned buffalo leather, featuring 200 pages of unlined handmade acid-free deckle-edge cotton rag paper suitable for watercolors and fountain pens.',
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
      ],
      price: 1190,
      compareAtPrice: 1500,
      stock: 18,
      materials: 'Vegetable-tanned distressed leather, tree-free cotton paper',
      dimensions: '7 x 5 inches, 200 pages',
      weight: '380 g',
      preparationTime: '1-2 business days',
      averageRating: 4.9,
      reviewCount: 21,
    },

    // Additional cross-category variety
    {
      artisanIdx: 0,
      categorySlug: 'home-decor',
      name: 'Macrame Bohemian Wall Hanging with Driftwood Rod',
      slug: 'macrame-bohemian-wall-hanging-driftwood',
      description:
        'Intricately knotted with 100% unbleached natural cotton cords on a genuine found river driftwood rod. Brings warm bohemian texture and calming Scandinavian aesthetics to bedrooms and living rooms.',
      images: [
        'https://images.unsplash.com/photo-1522758971460-1d21eed7dc1d?q=80&w=800&auto=format&fit=crop',
      ],
      price: 1550,
      compareAtPrice: 1950,
      stock: 10,
      materials: 'Natural cotton rope, natural river driftwood',
      dimensions: 'Width 18 in, Length 30 in',
      weight: '550 g',
      preparationTime: '3-4 business days',
      averageRating: 4.8,
      reviewCount: 13,
    },
    {
      artisanIdx: 1,
      categorySlug: 'wooden-crafts',
      name: 'Hand-Turned Wooden Mortar & Pestle Set',
      slug: 'hand-turned-wooden-mortar-and-pestle-set',
      description:
        'Carved from hard seasoned neem wood, known for natural antibacterial properties. Ideal for crushing whole spices, garlic, ginger, and coarse sea salts.',
      images: [
        'https://images.unsplash.com/photo-1546484475-7f7bd55792da?q=80&w=800&auto=format&fit=crop',
      ],
      price: 720,
      compareAtPrice: 900,
      stock: 20,
      materials: 'Single piece wild Neem wood',
      dimensions: 'Mortar height 4.5 in, Pestle length 6 in',
      weight: '620 g',
      preparationTime: '1-2 business days',
      averageRating: 4.7,
      reviewCount: 6,
    },
    {
      artisanIdx: 2,
      categorySlug: 'clothing-and-textiles',
      name: 'Handwoven Pashmina Wool Reversible Wrap',
      slug: 'handwoven-pashmina-wool-reversible-wrap',
      description:
        'Sublimely soft Himalayan cashmere pashmina shawl woven on wooden handlooms with a subtle herringbone weave. Feathery light yet cozy and warm.',
      images: [
        'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop',
      ],
      price: 3600,
      compareAtPrice: 4800,
      stock: 6,
      materials: '100% Himalayan Pashmina Cashmere Wool',
      dimensions: '210 x 75 cm',
      weight: '210 g',
      preparationTime: '3-5 business days',
      averageRating: 5.0,
      reviewCount: 17,
    },
    {
      artisanIdx: 3,
      categorySlug: 'jewelry',
      name: 'Hand-Cut Terracotta Clay Bead Tribal Choker',
      slug: 'hand-cut-terracotta-clay-bead-tribal-choker',
      description:
        'Handmade baked clay beads hand-painted in rich earthy pigments and strung with brass spacers. A striking fusion of terracotta earthiness and tribal boldness.',
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
      ],
      price: 890,
      compareAtPrice: 1150,
      stock: 15,
      materials: 'Fired terracotta clay, braided thread dori, brass accents',
      dimensions: 'Adjustable neck circumference 14-22 in',
      weight: '48 g',
      preparationTime: '2-3 business days',
      averageRating: 4.7,
      reviewCount: 11,
    },
  ];

  const createdProducts = [];
  for (const item of productsData) {
    const artisan = artisanProfiles[item.artisanIdx];
    const category = categoryMap[item.categorySlug];

    const prodDoc = await Product.findOneAndUpdate(
      { slug: item.slug },
      {
        sellerId: artisan.user._id,
        sellerProfileId: artisan.profile._id,
        categoryId: category._id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        images: item.images,
        price: item.price,
        compareAtPrice: item.compareAtPrice,
        stock: item.stock,
        materials: item.materials,
        dimensions: item.dimensions,
        weight: item.weight,
        preparationTime: item.preparationTime,
        averageRating: item.averageRating,
        reviewCount: item.reviewCount,
        status: 'active',
      },
      { upsert: true, new: true }
    );

    createdProducts.push(prodDoc);
  }

  // 4. Coupons
  console.log('Seeding discount coupons...');
  const couponsData = [
    {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minimumOrderValue: 500,
      maximumDiscount: 300,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      usageLimit: 500,
      usageCount: 12,
      isActive: true,
    },
    {
      code: 'KALA15',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minimumOrderValue: 1200,
      maximumDiscount: 500,
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      usageLimit: 250,
      usageCount: 8,
      isActive: true,
    },
    {
      code: 'FLAT200',
      discountType: 'FIXED',
      discountValue: 200,
      minimumOrderValue: 1500,
      maximumDiscount: 200,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      usageLimit: 100,
      usageCount: 5,
      isActive: true,
    },
  ];

  for (const c of couponsData) {
    await Coupon.findOneAndUpdate({ code: c.code }, c, { upsert: true, new: true });
  }

  // 5. Sample demo order with seller fulfillment & sample review for Aarav
  console.log('Seeding sample completed order for demo tracking & review...');
  const sampleProduct = createdProducts[0]; // Terracotta Bowl
  const sampleProduct2 = createdProducts[4]; // Sheesham Wood Box

  const existingOrder = await Order.findOne({ userId: customerUser._id });
  if (!existingOrder) {
    const sampleOrder = await Order.create({
      userId: customerUser._id,
      items: [
        {
          productId: sampleProduct._id,
          sellerId: sampleProduct.sellerId,
          productNameSnapshot: sampleProduct.name,
          productImageSnapshot: sampleProduct.images[0],
          unitPriceSnapshot: sampleProduct.price,
          quantity: 1,
          lineTotal: sampleProduct.price,
        },
        {
          productId: sampleProduct2._id,
          sellerId: sampleProduct2.sellerId,
          productNameSnapshot: sampleProduct2.name,
          productImageSnapshot: sampleProduct2.images[0],
          unitPriceSnapshot: sampleProduct2.price,
          quantity: 1,
          lineTotal: sampleProduct2.price,
        },
      ],
      addressSnapshot: customerUser.addresses[0],
      subtotal: sampleProduct.price + sampleProduct2.price,
      shippingAmount: 0,
      discountAmount: 100,
      totalAmount: sampleProduct.price + sampleProduct2.price - 100,
      couponCode: 'WELCOME10',
      paymentMethod: 'COD',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      statusHistory: [
        { status: 'ORDER_PLACED', note: 'Order placed by customer via Cash on Delivery' },
        { status: 'CONFIRMED', note: 'Order confirmed by seller' },
        { status: 'PROCESSING', note: 'Handcrafted items carefully packed with eco-bubble' },
        { status: 'SHIPPED', note: 'Dispatched via Artisan Express Logistics' },
        { status: 'OUT_FOR_DELIVERY', note: 'Out for delivery with local courier' },
        { status: 'DELIVERED', note: 'Package delivered safely to recipient' },
      ],
    });

    // Create fulfillments for each seller
    await SellerFulfillment.create({
      orderId: sampleOrder._id,
      sellerId: sampleProduct.sellerId,
      items: [
        {
          productId: sampleProduct._id,
          productNameSnapshot: sampleProduct.name,
          productImageSnapshot: sampleProduct.images[0],
          unitPriceSnapshot: sampleProduct.price,
          quantity: 1,
          lineTotal: sampleProduct.price,
        },
      ],
      fulfillmentStatus: 'DELIVERED',
      deliveredAt: new Date(),
      statusHistory: [
        { status: 'DELIVERED', note: 'Delivered to customer' },
      ],
    });

    await SellerFulfillment.create({
      orderId: sampleOrder._id,
      sellerId: sampleProduct2.sellerId,
      items: [
        {
          productId: sampleProduct2._id,
          productNameSnapshot: sampleProduct2.name,
          productImageSnapshot: sampleProduct2.images[0],
          unitPriceSnapshot: sampleProduct2.price,
          quantity: 1,
          lineTotal: sampleProduct2.price,
        },
      ],
      fulfillmentStatus: 'DELIVERED',
      deliveredAt: new Date(),
      statusHistory: [
        { status: 'DELIVERED', note: 'Delivered to customer' },
      ],
    });

    // Add a verified customer review
    await Review.findOneAndUpdate(
      { userId: customerUser._id, productId: sampleProduct._id, orderId: sampleOrder._id },
      {
        userId: customerUser._id,
        productId: sampleProduct._id,
        orderId: sampleOrder._id,
        rating: 5,
        comment:
          'Absolute masterpiece! The speckled glaze is even more gorgeous in person than on screen. Arrived safely wrapped in compostable hay packaging.',
      },
      { upsert: true }
    );
  }

  console.log('Database seeded successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
