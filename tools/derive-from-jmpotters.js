/*
 * ZETRA build transform: derives the pharmaceutical clone from the JMPOTTERS reference.
 * - Copies the storefront page set + shared JS/CSS
 * - Removes all other category pages and rewrites every reference to them -> healthcare.html
 * - Rebrands all text to ZETRA ("Health is Wealth")
 * - Adds the new Supabase schema file
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', '..', 'jmpotters-reference');
const DST = path.join(__dirname, '..');

const HTML_PAGES = ['index.html', 'healthcare.html', 'product.html', 'cart.html', 'checkout.html',
  'invoice.html', 'login.html', 'register.html', 'account.html', 'contact.html', 'admindashboardpro.html'];
const SHARED_ASSETS = ['app.js', 'theme.js', 'theme.css', 'account-auth.js'];

const REMOVED = ['mensfootwear', 'womensfootwear', 'bags', 'accessories', 'household', 'kids'];

// ---- Text replacements (ordered) ------------------------------------------
const REPLACEMENTS = [
  // Specific strings first
  ['hello@jmpotters.com', 'hello@zetrahealth.com'],
  ['+234 813 958 3320', '+1 581 705 5013'],
  ['2348139583320', '2348000000000'],
  ['jmpotters_user', 'zetra_user'],
  ['Premium Fashion & Lifestyle', 'Healthcare & Wellness'],
  // index.html copy rewrites (before brand replace so originals still in file)
  ['We curate premium fashion and lifestyle pieces that blend timeless elegance with modern functionality.',
   'We stock genuine pharmaceuticals, supplements and wellness essentials that blend trusted quality with everyday value.'],
  ['From our handpicked footwear collections to our carefully designed accessories, every product is selected with one goal — to help you express your unique style with confidence.',
   'From everyday medicines to vitamins and personal care, every product is selected with one goal — to keep you and your family healthy with confidence.'],
  ['<span>Sustainable Materials</span>', '<span>Genuine Products</span>'],
  ['<h2>Shop the Look</h2>', '<h2>Health Essentials</h2>'],
  ['Curated collections for every occasion', 'Carefully selected for every need'],
  ['Fresh drops just for you', 'Fresh stock just for you'],
  ['Our most loved products this season', 'Our most trusted products this season'],
  ['Subscribe to get exclusive offers, new collection alerts, and style inspiration delivered to your inbox.',
   'Subscribe to get exclusive offers and new product alerts delivered to your inbox.'],
  ['Premium fashion and lifestyle products for the modern individual. Quality you can trust, style you\'ll love.',
   'Trusted pharmaceutical products and health essentials for you and your family. Genuine products, delivered fast.'],
  // Testimonials
  ['"Absolutely love my new sneakers! The quality is amazing and they look even better in person. Will definitely be ordering again."',
   '"Absolutely love the supplements I ordered! Genuine products and they arrived quicker than I expected. Will definitely be ordering again."'],
  ['"The handbag I ordered exceeded my expectations. The craftsmanship is top-tier and it arrived faster than I expected. Highly recommend!"',
   '"The wellness bundle I ordered exceeded my expectations. Genuine products and it arrived faster than I expected. Highly recommend!"'],
  ['"Finally found a store that understands quality. The household collection is beautiful and adds such elegance to my home. Love it!"',
   '"Finally found a store that understands quality. The healthcare range is affordable and everything arrived in perfect condition. Love it!"'],
  ['"Best online shopping experience I\'ve had in Nigeria. The kids\' collection is adorable and well-made. My daughter loves her new shoes!"',
   '"Best online health shop I\'ve used in Nigeria. The products are genuine and well packaged, and my whole family now orders from here!"'],
  ['"I bought accessories for a wedding and received so many compliments. The quality speaks for itself. JMPOTTERS is now my go-to store."',
   '"I bought multivitamins and baby care products and received them the next day. The quality speaks for itself. ZETRA is now my go-to store."'],
  // Logo / placeholder assets
  ['assets/logos/logo1.png', 'assets/logos/zetra-logo.svg'],
  ['assets/images/placeholder.jpg', 'assets/images/placeholder.svg'],
  // Brand (case variants)
  ['JMPOTTERS', 'ZETRA'],
  ['Jmpotters', 'Zetra'],
  ['jmpotters', 'zetra'],
];

// JS-side raw links to removed pages -> healthcare.html
const REMOVEDPAGE_RE = new RegExp(`\\b(${REMOVED.join('|')})\\.html\\b`, 'g');

function copy(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}


// Pass 2: neutralise removed categories inside JS logic & admin forms
const JS_CLEANUPS = [
  // footwear gating expressions evaluate to false on the pharma site (exact literals; regex broke on nested parens)
  [/const FOOTWEAR_SLUGS = \['mensfootwear',\s*'womensfootwear'\];/g, 'const FOOTWEAR_SLUGS = [];'],
  [/var footwearSlugs = \['mensfootwear',\s*'womensfootwear'\];/g, 'var footwearSlugs = [];'],
  // page-to-category fallbacks -> healthcare
  [/'product':\s*'mensfootwear'/g, "'product': 'healthcare'"],
  [/\|\|\s*'mensfootwear'(;|\s*\()/g, "|| 'healthcare'$1"],
  ["return 'mensfootwear';", "return 'healthcare';"],
  ["['mensfootwear', 'womensfootwear'].includes(categorySlug)", "false"],
  ["const pageLabels={index:'Homepage',mensfootwear:\"Men's Footwear\",womensfootwear:\"Women's Footwear\",bags:'Bags',accessories:'Accessories',household:'Household',kids:'Kids',healthcare:'Healthcare'};", "const pageLabels={index:'Homepage',healthcare:'Healthcare'};"],
  ["'mensfootwear': 'mensfootwear/',\r\n                'womensfootwear': '',\r\n                'bags': '',\r\n                'household': 'household2/',\r\n                'kids': 'kids/',\r\n                'accessories': 'accessories/',\r\n                'healthcare': ''\r\n", "'healthcare': ''\r\n"],
  ["'mensfootwear': 'mensfootwear',\r\n                'womensfootwear': 'womensfootwear',\r\n                'bags': 'bags',\r\n                'household': 'household',\r\n                'kids': 'kids',\r\n                'accessories': 'accessories',\r\n                'healthcare': 'healthcare'\r\n", "'healthcare': 'healthcare'\r\n"],
  // removed page options in admin selects: <option value="bags">Bags</option>
  [new RegExp('<option[^>]*value="(' + REMOVED.join('|') + ')"[^>]*>[^<]*</option>', 'g'), ''],
  // removed keys in JS object literals (label / path maps) - exact literals
  ["'mensfootwear': 'mensfootwear/',\r\n            'womensfootwear': '',\r\n            'bags': '',\r\n            'household': 'household2/',\r\n            'kids': 'kids/',\r\n            'accessories': 'accessories/',\r\n", ""],
  ["'mensfootwear': 'mensfootwear',\r\n            'womensfootwear': 'womensfootwear',\r\n            'bags': 'bags',\r\n            'household': 'household',\r\n            'kids': 'kids',\r\n            'accessories': 'accessories',\r\n", ""],
  ["{mensfootwear:'mensfootwear/', womensfootwear:'', bags:'', household:'household2/', kids:'kids/', accessories:'accessories/', healthcare:''}", "{healthcare:''}"],
  ["'mensfootwear': \"Men's Footwear\", 'womensfootwear': \"Women's Footwear\",\r\n            'bags': 'Bags', 'accessories': 'Accessories', 'household': 'Household',\r\n            'kids': 'Kids & Babies', 'healthcare': 'Healthcare'\r\n", "'healthcare': 'Healthcare'\r\n"],
  ["['mensfootwear', 'womensfootwear'].indexOf(categorySlug) !== -1", "false"],
  ["['mensfootwear', 'womensfootwear'].includes(currentProduct.category_slug || getCurrentCategory())", "false"],
  ["['mensfootwear', 'womensfootwear'].indexOf(product.category_slug || getCurrentCategory()) !== -1", "false"],
  ["(item.category_slug === 'mensfootwear' || item.category_slug === 'womensfootwear')", "false"],
];

function transformFile(p) {
  let t = fs.readFileSync(p, 'utf8');
  if (p.endsWith('.html')) {
    // Remove nav <li> blocks that point at removed category pages (incl. inline icon spans)
    t = t.replace(new RegExp(`<li[^>]*>\\s*<a[^>]*href="(${REMOVED.join('|')})\\.html"[^>]*>[\\s\\S]{0,300}?</a>\\s*</li>`, 'g'), '');
  }
  for (const [from, to] of REPLACEMENTS) {
    t = t.split(from).join(to);
  }
  for (const [re, to] of JS_CLEANUPS) t = t.replace(re, to);
  console.log('OBJLIT matches(' + path.basename(p) + '):', (t.match(JS_CLEANUPS[8][0]) || []).length);
  // Any remaining refs to removed pages -> healthcare.html
  t = t.replace(REMOVEDPAGE_RE, 'healthcare.html');
  fs.writeFileSync(p, t, 'utf8');
}

(function main() {
  for (const f of HTML_PAGES) copy(path.join(SRC, f), path.join(DST, f));
  for (const f of SHARED_ASSETS) copy(path.join(SRC, f), path.join(DST, f));
  copy(path.join(SRC, 'vercel.json'), path.join(DST, 'vercel.json'));

  for (const f of [...HTML_PAGES, ...SHARED_ASSETS]) transformFile(path.join(DST, f));
  console.log('Copied + transformed', HTML_PAGES.length + SHARED_ASSETS.length, 'files');
})();
