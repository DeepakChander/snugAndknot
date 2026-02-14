const fs = require('fs');
const path = require('path');

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const tops = [
  { title: "Oversized Cable Knit Sweater", type: "Sweater", sub: "sweaters", tags: ["knitwear","winter","cozy"], colors: ["Cream","Charcoal","Sage"], price: 89.00, sku: "CKS" },
  { title: "Cashmere Blend Turtleneck", type: "Sweater", sub: "sweaters", tags: ["cashmere","layering","luxury"], colors: ["Ivory","Black","Dusty Rose"], price: 129.99, sku: "CBT" },
  { title: "Ribbed Merino Wool Pullover", type: "Sweater", sub: "sweaters", tags: ["merino","knitwear","essentials"], colors: ["Oatmeal","Navy","Burgundy"], price: 99.99, sku: "RMP" },
  { title: "Chunky Waffle Knit Henley", type: "Top", sub: "knits", tags: ["knitwear","casual","cozy"], colors: ["Heather Grey","Rust","Cream"], price: 74.99, sku: "CWH" },
  { title: "Brushed Flannel Button-Down", type: "Shirt", sub: "shirts", tags: ["flannel","winter","layering"], colors: ["Forest Plaid","Berry Plaid","Grey Plaid"], price: 69.99, sku: "BFB" },
  { title: "Silk-Touch Mock Neck Blouse", type: "Blouse", sub: "blouses", tags: ["silk","elegant","workwear"], colors: ["Champagne","Midnight","Blush"], price: 84.99, sku: "SMB" },
  { title: "Cloud-Soft Cropped Cardigan", type: "Cardigan", sub: "sweaters", tags: ["knitwear","layering","soft"], colors: ["Lavender","Cream","Sage"], price: 79.99, sku: "CSC" },
  { title: "Heritage Plaid Flannel Shirt", type: "Shirt", sub: "shirts", tags: ["flannel","heritage","casual"], colors: ["Red Plaid","Green Plaid","Blue Plaid"], price: 64.99, sku: "HPF" },
  { title: "Velvet Trim Knit Top", type: "Top", sub: "knits", tags: ["velvet","evening","luxe"], colors: ["Bordeaux","Emerald","Black"], price: 59.99, sku: "VTK" },
  { title: "Alpaca Blend Polo Sweater", type: "Sweater", sub: "sweaters", tags: ["alpaca","smart-casual","knitwear"], colors: ["Camel","Slate","Ivory"], price: 109.99, sku: "APS" },
  { title: "Pima Cotton Long-Sleeve Tee", type: "T-Shirt", sub: "tees", tags: ["cotton","essentials","layering"], colors: ["White","Black","Stone"], price: 39.99, sku: "PCL" },
  { title: "Boucle Textured Crop Top", type: "Top", sub: "knits", tags: ["textured","trendy","cozy"], colors: ["Pink","Cream","Lilac"], price: 54.99, sku: "BTC" },
  { title: "Organic Cotton Wrap Blouse", type: "Blouse", sub: "blouses", tags: ["organic","sustainable","chic"], colors: ["Sage","Terracotta","Ivory"], price: 72.99, sku: "OCW" },
  { title: "Mohair Blend Boyfriend Sweater", type: "Sweater", sub: "sweaters", tags: ["mohair","oversized","cozy"], colors: ["Dusty Blue","Cream","Taupe"], price: 119.99, sku: "MBS" },
  { title: "Thermal Knit Scoop Neck", type: "Top", sub: "knits", tags: ["thermal","winter","essentials"], colors: ["Charcoal","Wine","Olive"], price: 44.99, sku: "TKS" },
  { title: "Linen Blend Relaxed Shirt", type: "Shirt", sub: "shirts", tags: ["linen","breathable","casual"], colors: ["Sand","White","Slate Blue"], price: 59.99, sku: "LBR" },
  { title: "Fair Isle Pattern Pullover", type: "Sweater", sub: "sweaters", tags: ["fair-isle","holiday","knitwear"], colors: ["Nordic Blue","Cranberry","Forest"], price: 94.99, sku: "FIP" },
  { title: "Silk Charmeuse Camisole", type: "Camisole", sub: "blouses", tags: ["silk","lingerie-inspired","evening"], colors: ["Champagne","Black","Dusty Rose"], price: 49.99, sku: "SCC" },
  { title: "Cozy Sherpa-Lined Hoodie", type: "Hoodie", sub: "sweatshirts", tags: ["sherpa","warm","loungewear"], colors: ["Oatmeal","Charcoal","Sage"], price: 89.99, sku: "CSH" },
  { title: "Draped Jersey Asymmetric Top", type: "Top", sub: "knits", tags: ["jersey","modern","elegant"], colors: ["Black","Mauve","Cream"], price: 54.99, sku: "DJA" },
  { title: "Pointelle Knit Shell Top", type: "Top", sub: "knits", tags: ["pointelle","feminine","layering"], colors: ["Ivory","Blush","Sky Blue"], price: 46.99, sku: "PKS" },
  { title: "Jacquard Knit Sweater Vest", type: "Vest", sub: "sweaters", tags: ["jacquard","layering","preppy"], colors: ["Navy","Burgundy","Cream"], price: 64.99, sku: "JKV" },
  { title: "Bamboo Blend Everyday Tee", type: "T-Shirt", sub: "tees", tags: ["bamboo","sustainable","soft"], colors: ["White","Sage","Dusty Pink"], price: 34.99, sku: "BBE" },
  { title: "Embroidered Peasant Blouse", type: "Blouse", sub: "blouses", tags: ["embroidered","bohemian","feminine"], colors: ["White","Ecru","Light Blue"], price: 78.99, sku: "EPB" },
  { title: "Textured Knit Polo Shirt", type: "Polo", sub: "knits", tags: ["textured","smart-casual","knitwear"], colors: ["Stone","Navy","Olive"], price: 57.99, sku: "TKP" },
];

const bottoms = [
  { title: "Velvet Wide-Leg Trousers", type: "Trousers", sub: "trousers", tags: ["velvet","evening","wide-leg"], colors: ["Bordeaux","Forest","Black"], price: 109.99, sku: "VWL" },
  { title: "Wool Blend Tailored Pants", type: "Trousers", sub: "trousers", tags: ["wool","workwear","tailored"], colors: ["Charcoal","Camel","Navy"], price: 119.99, sku: "WBT" },
  { title: "High-Rise Corduroy Trousers", type: "Trousers", sub: "trousers", tags: ["corduroy","retro","autumn"], colors: ["Rust","Forest","Cream"], price: 89.99, sku: "HRC" },
  { title: "Cashmere Lounge Joggers", type: "Joggers", sub: "loungewear", tags: ["cashmere","loungewear","luxury"], colors: ["Heather Grey","Oatmeal","Blush"], price: 149.99, sku: "CLJ" },
  { title: "Ponte Knit Slim Trousers", type: "Trousers", sub: "trousers", tags: ["ponte","stretchy","workwear"], colors: ["Black","Navy","Charcoal"], price: 79.99, sku: "PKT" },
  { title: "Brushed Twill Palazzo Pants", type: "Trousers", sub: "trousers", tags: ["twill","wide-leg","chic"], colors: ["Sand","Olive","Black"], price: 94.99, sku: "BTP" },
  { title: "Heritage Wool Pleated Skirt", type: "Skirt", sub: "skirts", tags: ["wool","pleated","classic"], colors: ["Tartan","Charcoal","Navy"], price: 84.99, sku: "HWP" },
  { title: "Stretch Denim Straight Jeans", type: "Jeans", sub: "jeans", tags: ["denim","essentials","versatile"], colors: ["Indigo","Washed Black","Light Wash"], price: 74.99, sku: "SDS" },
  { title: "Knit Rib Midi Skirt", type: "Skirt", sub: "skirts", tags: ["knitwear","midi","cozy"], colors: ["Cream","Charcoal","Burgundy"], price: 64.99, sku: "KRM" },
  { title: "Faux Leather Cropped Trousers", type: "Trousers", sub: "trousers", tags: ["faux-leather","edgy","modern"], colors: ["Black","Cognac","Burgundy"], price: 99.99, sku: "FLC" },
  { title: "Organic Cotton Chinos", type: "Chinos", sub: "trousers", tags: ["organic","casual","sustainable"], colors: ["Khaki","Olive","Stone"], price: 69.99, sku: "OCC" },
  { title: "Herringbone Wide-Leg Pants", type: "Trousers", sub: "trousers", tags: ["herringbone","tailored","sophisticated"], colors: ["Grey","Navy","Brown"], price: 104.99, sku: "HWL" },
  { title: "Fleece-Lined Leggings", type: "Leggings", sub: "loungewear", tags: ["fleece","warm","winter"], colors: ["Black","Charcoal","Navy"], price: 49.99, sku: "FLL" },
  { title: "Satin Slip Midi Skirt", type: "Skirt", sub: "skirts", tags: ["satin","elegant","evening"], colors: ["Champagne","Black","Emerald"], price: 74.99, sku: "SSM" },
  { title: "Relaxed Linen Drawstring Pants", type: "Trousers", sub: "trousers", tags: ["linen","relaxed","resort"], colors: ["White","Sand","Sage"], price: 79.99, sku: "RLD" },
  { title: "Bouclé Tweed Mini Skirt", type: "Skirt", sub: "skirts", tags: ["tweed","chic","French"], colors: ["Pink Tweed","Black Tweed","Ivory Tweed"], price: 69.99, sku: "BTM" },
  { title: "Merino Wool Cigarette Pants", type: "Trousers", sub: "trousers", tags: ["merino","slim","workwear"], colors: ["Black","Camel","Grey"], price: 109.99, sku: "MWC" },
  { title: "Cozy Knit Wide-Leg Lounge Pants", type: "Lounge Pants", sub: "loungewear", tags: ["knitwear","loungewear","cozy"], colors: ["Oatmeal","Mauve","Sage"], price: 64.99, sku: "CKW" },
  { title: "Belted Paperbag Waist Trousers", type: "Trousers", sub: "trousers", tags: ["belted","trendy","flattering"], colors: ["Camel","Olive","Burgundy"], price: 89.99, sku: "BPW" },
  { title: "Dark Wash Bootcut Jeans", type: "Jeans", sub: "jeans", tags: ["denim","bootcut","classic"], colors: ["Dark Indigo","Black","Grey Wash"], price: 84.99, sku: "DWB" },
  { title: "Velour Track Pants", type: "Track Pants", sub: "loungewear", tags: ["velour","loungewear","retro"], colors: ["Dusty Rose","Navy","Olive"], price: 59.99, sku: "VTP" },
  { title: "Houndstooth Pencil Skirt", type: "Skirt", sub: "skirts", tags: ["houndstooth","workwear","classic"], colors: ["Black/White","Navy/Cream","Brown/Tan"], price: 74.99, sku: "HPS" },
];

const dresses = [
  { title: "Cashmere Blend Sweater Dress", type: "Dress", sub: "sweater-dresses", tags: ["cashmere","knitwear","cozy"], colors: ["Camel","Black","Burgundy"], price: 159.99, sku: "CBD" },
  { title: "Velvet Wrap Midi Dress", type: "Dress", sub: "midi-dresses", tags: ["velvet","evening","wrap"], colors: ["Emerald","Bordeaux","Midnight"], price: 139.99, sku: "VWM" },
  { title: "Ribbed Knit Bodycon Dress", type: "Dress", sub: "bodycon", tags: ["knitwear","fitted","versatile"], colors: ["Black","Charcoal","Cream"], price: 79.99, sku: "RKB" },
  { title: "Tiered Ruffle Maxi Dress", type: "Dress", sub: "maxi-dresses", tags: ["tiered","romantic","bohemian"], colors: ["Dusty Rose","Sage","Ivory"], price: 129.99, sku: "TRM" },
  { title: "Wool Blend Shift Dress", type: "Dress", sub: "shift-dresses", tags: ["wool","workwear","classic"], colors: ["Charcoal","Navy","Camel"], price: 119.99, sku: "WBS" },
  { title: "Silk-Touch Shirt Dress", type: "Dress", sub: "shirt-dresses", tags: ["silk","versatile","elegant"], colors: ["Ivory","Olive","Blush"], price: 109.99, sku: "STS" },
  { title: "Cable Knit Midi Dress", type: "Dress", sub: "sweater-dresses", tags: ["cable-knit","winter","cozy"], colors: ["Cream","Oatmeal","Sage"], price: 119.99, sku: "CKM" },
  { title: "Ponte Fit-and-Flare Dress", type: "Dress", sub: "fit-and-flare", tags: ["ponte","flattering","workwear"], colors: ["Black","Burgundy","Forest"], price: 89.99, sku: "PFF" },
  { title: "Satin Cowl-Neck Slip Dress", type: "Dress", sub: "slip-dresses", tags: ["satin","evening","luxe"], colors: ["Champagne","Black","Dusty Rose"], price: 99.99, sku: "SCS" },
  { title: "Tweed A-Line Mini Dress", type: "Dress", sub: "mini-dresses", tags: ["tweed","chic","French"], colors: ["Pink Tweed","Black Tweed","Ivory Tweed"], price: 109.99, sku: "TAM" },
  { title: "Merino Wool Turtleneck Dress", type: "Dress", sub: "sweater-dresses", tags: ["merino","turtleneck","elegant"], colors: ["Black","Charcoal","Cream"], price: 139.99, sku: "MWT" },
  { title: "Organic Cotton Wrap Dress", type: "Dress", sub: "wrap-dresses", tags: ["organic","sustainable","feminine"], colors: ["Terracotta","Sage","Navy"], price: 94.99, sku: "OCR" },
  { title: "Jacquard Evening Gown", type: "Dress", sub: "evening-dresses", tags: ["jacquard","formal","luxe"], colors: ["Gold","Emerald","Midnight"], price: 199.99, sku: "JEG" },
  { title: "Chunky Knit Tunic Dress", type: "Dress", sub: "sweater-dresses", tags: ["chunky-knit","oversized","cozy"], colors: ["Oatmeal","Charcoal","Rust"], price: 99.99, sku: "CKT" },
  { title: "Linen Blend Sundress", type: "Dress", sub: "sundresses", tags: ["linen","summer","effortless"], colors: ["White","Terracotta","Sky Blue"], price: 79.99, sku: "LBS" },
  { title: "Pleated Chiffon Midi Dress", type: "Dress", sub: "midi-dresses", tags: ["chiffon","romantic","flowing"], colors: ["Blush","Lavender","Sage"], price: 119.99, sku: "PCM" },
  { title: "Denim Pinafore Dress", type: "Dress", sub: "pinafore-dresses", tags: ["denim","casual","playful"], colors: ["Light Wash","Indigo","Black"], price: 74.99, sku: "DPD" },
  { title: "Mohair Blend Balloon-Sleeve Dress", type: "Dress", sub: "sweater-dresses", tags: ["mohair","statement","cozy"], colors: ["Lilac","Cream","Dusty Pink"], price: 149.99, sku: "MBB" },
  { title: "Corduroy Button-Front Dress", type: "Dress", sub: "shirt-dresses", tags: ["corduroy","retro","autumn"], colors: ["Rust","Forest","Cream"], price: 89.99, sku: "CBF" },
  { title: "Draped Jersey Midi Dress", type: "Dress", sub: "midi-dresses", tags: ["jersey","elegant","versatile"], colors: ["Black","Burgundy","Navy"], price: 84.99, sku: "DJM" },
];

const outerwear = [
  { title: "Wool Blend Cocoon Coat", type: "Coat", sub: "coats", tags: ["wool","cocoon","winter"], colors: ["Camel","Charcoal","Cream"], price: 249.99, sku: "WBC" },
  { title: "Quilted Puffer Jacket", type: "Jacket", sub: "jackets", tags: ["quilted","puffer","warm"], colors: ["Black","Sage","Burgundy"], price: 179.99, sku: "QPJ" },
  { title: "Faux Shearling Teddy Coat", type: "Coat", sub: "coats", tags: ["shearling","teddy","cozy"], colors: ["Cream","Camel","Chocolate"], price: 199.99, sku: "FST" },
  { title: "Double-Breasted Blazer", type: "Blazer", sub: "blazers", tags: ["tailored","workwear","classic"], colors: ["Black","Navy","Charcoal"], price: 149.99, sku: "DBB" },
  { title: "Belted Trench Coat", type: "Coat", sub: "coats", tags: ["trench","timeless","versatile"], colors: ["Khaki","Black","Navy"], price: 219.99, sku: "BTC" },
  { title: "Sherpa-Lined Denim Jacket", type: "Jacket", sub: "jackets", tags: ["denim","sherpa","casual"], colors: ["Washed Blue","Black","Light Wash"], price: 129.99, sku: "SLD" },
  { title: "Cashmere Blend Wrap Cape", type: "Cape", sub: "capes", tags: ["cashmere","elegant","layering"], colors: ["Camel","Grey","Bordeaux"], price: 189.99, sku: "CWC" },
  { title: "Cropped Bouclé Jacket", type: "Jacket", sub: "jackets", tags: ["boucle","chic","French"], colors: ["Pink","Ivory","Black"], price: 159.99, sku: "CBJ" },
  { title: "Oversized Parka with Hood", type: "Parka", sub: "parkas", tags: ["parka","waterproof","winter"], colors: ["Olive","Black","Navy"], price: 269.99, sku: "OPH" },
  { title: "Herringbone Wool Overcoat", type: "Coat", sub: "coats", tags: ["herringbone","heritage","tailored"], colors: ["Grey","Brown","Navy"], price: 279.99, sku: "HWO" },
  { title: "Faux Leather Moto Jacket", type: "Jacket", sub: "jackets", tags: ["faux-leather","edgy","iconic"], colors: ["Black","Cognac","Burgundy"], price: 139.99, sku: "FLM" },
  { title: "Lightweight Down Vest", type: "Vest", sub: "vests", tags: ["down","layering","transitional"], colors: ["Black","Olive","Stone"], price: 109.99, sku: "LDV" },
  { title: "Plaid Wool Shirt Jacket", type: "Shacket", sub: "jackets", tags: ["plaid","shacket","layering"], colors: ["Red Plaid","Grey Plaid","Green Plaid"], price: 119.99, sku: "PWS" },
  { title: "Longline Puffer Coat", type: "Coat", sub: "coats", tags: ["puffer","longline","warm"], colors: ["Black","Cream","Sage"], price: 229.99, sku: "LPC" },
  { title: "Velvet Smoking Blazer", type: "Blazer", sub: "blazers", tags: ["velvet","evening","luxe"], colors: ["Emerald","Black","Bordeaux"], price: 169.99, sku: "VSB" },
  { title: "Knit Bomber Jacket", type: "Jacket", sub: "jackets", tags: ["knit","sporty","casual"], colors: ["Grey","Navy","Olive"], price: 99.99, sku: "KBJ" },
  { title: "Cape-Sleeve Wool Poncho", type: "Poncho", sub: "capes", tags: ["poncho","bohemian","layering"], colors: ["Camel","Charcoal","Cream"], price: 139.99, sku: "CWP" },
  { title: "Waxed Cotton Field Jacket", type: "Jacket", sub: "jackets", tags: ["waxed","heritage","outdoor"], colors: ["Olive","Brown","Navy"], price: 189.99, sku: "WCF" },
];

const accessories = [
  { title: "Chunky Cable Knit Scarf", type: "Scarf", sub: "scarves", tags: ["knitwear","winter","cozy"], colors: ["Cream","Charcoal","Burgundy"], price: 49.99, sku: "CCS" },
  { title: "Cashmere Blend Beanie", type: "Beanie", sub: "hats", tags: ["cashmere","winter","warm"], colors: ["Oatmeal","Black","Dusty Rose"], price: 39.99, sku: "CBN" },
  { title: "Merino Wool Fingerless Gloves", type: "Gloves", sub: "gloves", tags: ["merino","winter","practical"], colors: ["Charcoal","Cream","Burgundy"], price: 29.99, sku: "MWF" },
  { title: "Silk-Lined Leather Gloves", type: "Gloves", sub: "gloves", tags: ["leather","silk","luxe"], colors: ["Black","Cognac","Burgundy"], price: 79.99, sku: "SLG" },
  { title: "Oversized Wool Blanket Scarf", type: "Scarf", sub: "scarves", tags: ["wool","oversized","versatile"], colors: ["Camel","Grey Plaid","Cream"], price: 59.99, sku: "OWB" },
  { title: "Faux Fur Headband", type: "Headband", sub: "hair-accessories", tags: ["faux-fur","winter","glamorous"], colors: ["Cream","Black","Blush"], price: 24.99, sku: "FFH" },
  { title: "Quilted Crossbody Bag", type: "Bag", sub: "bags", tags: ["quilted","everyday","chic"], colors: ["Black","Cream","Sage"], price: 69.99, sku: "QCB" },
  { title: "Woven Leather Belt", type: "Belt", sub: "belts", tags: ["leather","woven","classic"], colors: ["Brown","Black","Tan"], price: 44.99, sku: "WLB" },
  { title: "Mohair Blend Infinity Scarf", type: "Scarf", sub: "scarves", tags: ["mohair","cozy","soft"], colors: ["Dusty Rose","Sage","Lilac"], price: 42.99, sku: "MBI" },
  { title: "Pom-Pom Knit Beanie", type: "Beanie", sub: "hats", tags: ["knitwear","playful","winter"], colors: ["Cream","Pink","Grey"], price: 29.99, sku: "PPK" },
  { title: "Structured Leather Tote", type: "Bag", sub: "bags", tags: ["leather","workwear","timeless"], colors: ["Black","Cognac","Taupe"], price: 79.99, sku: "SLT" },
  { title: "Alpaca Blend Wrap Shawl", type: "Shawl", sub: "scarves", tags: ["alpaca","elegant","layering"], colors: ["Camel","Grey","Bordeaux"], price: 64.99, sku: "ABW" },
  { title: "Velvet Scrunchie Set", type: "Hair Accessory", sub: "hair-accessories", tags: ["velvet","trendy","set"], colors: ["Jewel Tones","Pastels","Neutrals"], price: 19.99, sku: "VSS" },
  { title: "Fair Isle Knit Mittens", type: "Mittens", sub: "gloves", tags: ["fair-isle","knitwear","festive"], colors: ["Red/Cream","Blue/White","Green/Cream"], price: 34.99, sku: "FIK" },
  { title: "Suede Bucket Hat", type: "Hat", sub: "hats", tags: ["suede","trendy","autumn"], colors: ["Tan","Olive","Black"], price: 44.99, sku: "SBH" },
  { title: "Pearl-Accent Hair Clips", type: "Hair Accessory", sub: "hair-accessories", tags: ["pearl","elegant","set"], colors: ["Gold","Silver","Rose Gold"], price: 24.99, sku: "PAH" },
  { title: "Lambswool Beret", type: "Beret", sub: "hats", tags: ["lambswool","French","chic"], colors: ["Black","Cream","Red"], price: 39.99, sku: "LWB" },
  { title: "Canvas and Leather Weekender", type: "Bag", sub: "bags", tags: ["canvas","travel","spacious"], colors: ["Olive/Brown","Navy/Tan","Grey/Black"], price: 79.99, sku: "CLW" },
  { title: "Knit Ear Warmer Headband", type: "Headband", sub: "hair-accessories", tags: ["knitwear","winter","practical"], colors: ["Cream","Blush","Grey"], price: 22.99, sku: "KEW" },
  { title: "Tartan Plaid Blanket Scarf", type: "Scarf", sub: "scarves", tags: ["tartan","heritage","cozy"], colors: ["Royal Stewart","Black Watch","Camel Check"], price: 54.99, sku: "TPB" },
];

const allProducts = [];
let id = 1;

const categories = [
  { items: tops, category: "tops" },
  { items: bottoms, category: "bottoms" },
  { items: dresses, category: "dresses" },
  { items: outerwear, category: "outerwear" },
  { items: accessories, category: "accessories" },
];

// Pre-define which IDs get special flags
const featuredIds = new Set([1,5,10,15,20,26,30,46,50,55,66,70,86,90,100]);
const newIds = new Set([3,7,12,18,23,28,33,38,43,48,53,58,63,68,73,78,83,88,93,103]);
const bestsellerIds = new Set([1,8,14,26,35,47,55,66,72,80,90,100]);
// ~30% sale items
const saleIds = new Set([2,4,7,10,13,16,19,22,25,28,31,34,37,40,43,46,49,52,55,58,61,64,67,70,73,76,79,82,85,88,91,94]);

const months = ['07','08','09','10','11','12'];

const clothingSizes = ["XS","S","M","L","XL"];

for (const cat of categories) {
  for (const item of cat.items) {
    const handle = slugify(item.title);
    const isAccessory = cat.category === "accessories";
    const sizes = isAccessory ? ["One Size"] : clothingSizes;
    const isSale = saleIds.has(id);
    const compareAtPrice = isSale ? parseFloat((item.price * (1.2 + Math.random() * 0.3)).toFixed(2)) : null;
    const month = months[id % 6];
    const day = String(((id * 3) % 28) + 1).padStart(2, '0');
    const rating = parseFloat((3.5 + ((id * 7) % 16) / 10).toFixed(1));
    const clampedRating = Math.min(rating, 5.0);
    const reviewCount = 5 + ((id * 13) % 196);

    const images = [
      { id: `img-${id}-1`, src: `/images/products/${handle}-1.jpg`, alt: `${item.title} front view`, width: 800, height: 1000 },
      { id: `img-${id}-2`, src: `/images/products/${handle}-2.jpg`, alt: `${item.title} back view`, width: 800, height: 1000 },
    ];
    if (id % 3 === 0) {
      images.push({ id: `img-${id}-3`, src: `/images/products/${handle}-3.jpg`, alt: `${item.title} detail view`, width: 800, height: 1000 });
    }

    const firstColor = item.colors[0];
    const variants = [];
    if (isAccessory) {
      variants.push({
        id: `var-${id}-1`,
        title: `One Size / ${firstColor}`,
        price: item.price,
        available: true,
        sku: `${item.sku}-${firstColor.substring(0,3).toUpperCase()}-OS`,
        color: firstColor,
        size: "One Size"
      });
      if (item.colors.length > 1) {
        variants.push({
          id: `var-${id}-2`,
          title: `One Size / ${item.colors[1]}`,
          price: item.price,
          available: true,
          sku: `${item.sku}-${item.colors[1].substring(0,3).toUpperCase()}-OS`,
          color: item.colors[1],
          size: "One Size"
        });
      }
    } else {
      variants.push({
        id: `var-${id}-1`,
        title: `XS / ${firstColor}`,
        price: item.price,
        available: true,
        sku: `${item.sku}-${firstColor.substring(0,3).toUpperCase()}-XS`,
        color: firstColor,
        size: "XS"
      });
      variants.push({
        id: `var-${id}-2`,
        title: `S / ${firstColor}`,
        price: item.price,
        available: true,
        sku: `${item.sku}-${firstColor.substring(0,3).toUpperCase()}-S`,
        color: firstColor,
        size: "S"
      });
    }

    const product = {
      id: `prod-${id}`,
      handle,
      title: item.title,
      description: generateDescription(item.title, item.type, cat.category),
      vendor: "Snug&Knot",
      productType: item.type,
      tags: item.tags,
      images,
      variants,
      price: item.price,
      ...(compareAtPrice ? { compareAtPrice } : {}),
      category: cat.category,
      subcategory: item.sub,
      colors: item.colors,
      sizes,
      featured: featuredIds.has(id),
      new: newIds.has(id),
      bestseller: bestsellerIds.has(id),
      rating: clampedRating,
      reviewCount,
      createdAt: `2025-${month}-${day}`
    };

    allProducts.push(product);
    id++;
  }
}

function generateDescription(title, type, category) {
  const descs = {
    tops: [
      `Indulge in the luxurious softness of our ${title}. Crafted from premium yarns for an exquisitely comfortable feel that transitions effortlessly from day to evening.`,
      `Our ${title} combines timeless design with modern comfort. A wardrobe essential that pairs beautifully with everything from tailored trousers to casual denim.`,
      `Wrap yourself in the cozy elegance of this ${title}. Thoughtfully designed with meticulous attention to detail for a flattering, relaxed silhouette.`,
      `Elevate your everyday style with our ${title}. Made from the finest materials for a sumptuously soft touch that feels as good as it looks.`,
      `Discover effortless sophistication with our ${title}. The perfect blend of comfort and style, designed for the modern wardrobe.`,
    ],
    bottoms: [
      `Step out in style with our ${title}. Expertly tailored for a flattering fit with a comfortable stretch that moves with you throughout the day.`,
      `Our ${title} offers the perfect combination of elegance and ease. Premium fabric drapes beautifully for a polished silhouette.`,
      `Designed for versatility, our ${title} pairs effortlessly with everything in your wardrobe. Impeccable tailoring meets everyday comfort.`,
      `Elevate your bottom half with our ${title}. Crafted from luxurious fabric with thoughtful details for a refined, put-together look.`,
      `Experience all-day comfort in our ${title}. The relaxed yet polished design makes these a go-to for both casual weekends and workdays.`,
    ],
    dresses: [
      `Make a statement in our ${title}. This beautifully crafted piece drapes elegantly, creating a silhouette that flatters every figure.`,
      `Our ${title} is the epitome of effortless elegance. From brunch to evening gatherings, this versatile piece transitions seamlessly.`,
      `Fall in love with our ${title}. Luxurious fabric and impeccable construction create a dress that feels as special as it looks.`,
      `Discover your new favorite dress in our ${title}. Thoughtfully designed with feminine details that celebrate timeless style.`,
      `Our ${title} combines modern design with classic elegance. A must-have piece for any occasion that calls for understated sophistication.`,
    ],
    outerwear: [
      `Brave the elements in style with our ${title}. Premium construction and insulation keep you warm without compromising on elegance.`,
      `Our ${title} is the ultimate layering piece. Expertly crafted from luxurious materials for warmth, comfort, and timeless appeal.`,
      `Stay cozy and chic in our ${title}. Designed to be the statement piece of your cold-weather wardrobe with impeccable attention to detail.`,
      `Wrap up in our ${title} and embrace the season. Superior craftsmanship meets modern design for outerwear that stands the test of time.`,
      `Our ${title} delivers warmth with sophistication. The perfect companion for brisk days, combining premium materials with a flattering cut.`,
    ],
    accessories: [
      `Complete your look with our ${title}. Handcrafted from premium materials for a luxurious touch that elevates any outfit.`,
      `Our ${title} adds the perfect finishing touch to your ensemble. Beautifully made with meticulous attention to quality and detail.`,
      `Discover the art of accessorizing with our ${title}. A thoughtfully designed piece that combines function with refined style.`,
      `Add a touch of elegance with our ${title}. Crafted from the finest materials for a premium feel and sophisticated aesthetic.`,
      `Our ${title} is the perfect gift for yourself or a loved one. Luxurious craftsmanship meets everyday practicality in this beautiful piece.`,
    ],
  };
  const arr = descs[category] || descs.tops;
  // deterministic pick based on title length
  return arr[title.length % arr.length];
}

const output = JSON.stringify(allProducts, null, 2);
fs.writeFileSync(path.join(__dirname, 'products.json'), output, 'utf8');
console.log(`Generated ${allProducts.length} products`);
console.log(`Featured: ${allProducts.filter(p => p.featured).length}`);
console.log(`New: ${allProducts.filter(p => p.new).length}`);
console.log(`Bestseller: ${allProducts.filter(p => p.bestseller).length}`);
console.log(`Sale items: ${allProducts.filter(p => p.compareAtPrice).length}`);
console.log(`Tops: ${allProducts.filter(p => p.category === 'tops').length}`);
console.log(`Bottoms: ${allProducts.filter(p => p.category === 'bottoms').length}`);
console.log(`Dresses: ${allProducts.filter(p => p.category === 'dresses').length}`);
console.log(`Outerwear: ${allProducts.filter(p => p.category === 'outerwear').length}`);
console.log(`Accessories: ${allProducts.filter(p => p.category === 'accessories').length}`);
