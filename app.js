// ====================
// IndiaMedCare APP - COMPLETE WITH SUPABASE ADS & HERO BANNERS (CROSS‑BROWSER)
// ====================
(function() {
    'use strict';
    
    if (window.ZETRA_APP_INITIALIZED) {
        console.warn('⚠️ IndiaMedCare app already initialized, skipping...');
        return;
    }
    
    console.log('🚀 IndiaMedCare app starting...');
    window.ZETRA_APP_INITIALIZED = true;
    
    // ====================
    // CONFIGURATION
    // ====================
    if (!window.ZETRA_CONFIG) {
        window.ZETRA_CONFIG = {};
    }
    
    window.ZETRA_CONFIG.supabase = {
        url: 'https://oalshkwaqaljcaqrsoqi.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hbHNoa3dhcWFsamNhcXJzb3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MDczOTQsImV4cCI6MjEwOTM4MzM5NH0.4nivGmE8NWLIlUmORYiISAV6RSs0RK3x_Ddxgawvbz4'
    };
    
    window.ZETRA_CONFIG.images = {
        baseUrl: 'https://ebuzome.github.io/ZETRA/assets/images/',
        paths: {
                        'healthcare': ''
        }
    };
    
    // Current product state
    let currentProduct = null;
    let currentSelectedQuantity = 1;
    let currentSelectedColor = null;
    let currentSelectedSize = null;
    let currentSelectedVariant = null;
    let currentProductColors = [];
    let currentProductSizes = [];
    let colorSizeMap = {};
    let sizeColorMap = {};
    
    // Checkout processing flag
    let isProcessingCheckout = false;
    
    // ===== FOOTWEAR CATEGORIES (Quick Add will be hidden for these) =====
    const FOOTWEAR_SLUGS = [];
    
    // ====================
    // NOTIFICATION SYSTEM
    // ====================
    function showNotification(message, type = 'success') {
        console.log(`${type.toUpperCase()}: ${message}`);
        
        let container = document.getElementById('zetraNotificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'zetraNotificationContainer';
            container.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        
        const notification = document.createElement('div');
        const colors = {
            success: { bg: '#f0fdf4', border: '#22c55e', text: '#166534' },
            error: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' },
            warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
            info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' }
        };
        const color = colors[type] || colors.info;
        notification.style.cssText = `
            background: ${color.bg};
            border-left: 4px solid ${color.border};
            border-radius: 12px;
            padding: 14px 18px;
            min-width: 280px;
            max-width: 380px;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease;
            pointer-events: auto;
            color: ${color.text};
            font-size: 0.875rem;
            font-weight: 500;
        `;
        notification.innerHTML = `<span>${message}</span><button style="background:none;border:none;margin-left:auto;cursor:pointer;opacity:0.6" onclick="this.parentElement.remove()">✕</button>`;
        container.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
    }
    
    // Inject slideIn animation style if not already present
    if (!document.getElementById('zetraNotificationStyles')) {
        const style = document.createElement('style');
        style.id = 'zetraNotificationStyles';
        style.textContent = `@keyframes slideIn { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }`;
        document.head.appendChild(style);
    }

    // ================================================================
    // ===== PROMO / AD STYLES (injected so the rules stay consistent ===== 
    // ===== across every storefront page without editing 11 HTML files) =====
    // ================================================================
    if (!document.getElementById('zetraPromoStyles')) {
        const promoStyle = document.createElement('style');
        promoStyle.id = 'zetraPromoStyles';
        promoStyle.textContent = `
            .ad-label {
                position: absolute !important;
                top: 12px !important;
                right: 12px !important;
                background: rgba(0, 0, 0, 0.55) !important;
                color: #ffffff !important;
                font-size: 0.65rem !important;
                padding: 4px 10px !important;
                border-radius: 6px !important;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
                font-weight: 700 !important;
                letter-spacing: 0.7px !important;
                text-transform: uppercase !important;
                backdrop-filter: blur(4px) !important;
                -webkit-backdrop-filter: blur(4px) !important;
                border: 1px solid rgba(255, 255, 255, 0.14) !important;
                z-index: 3 !important;
            }
            .ad-bottom-bar {
                position: absolute !important;
                left: 0; right: 0; bottom: 0 !important;
                padding: 18px 16px 12px !important;
                background: linear-gradient(transparent, rgba(0, 0, 0, 0.78)) !important;
                display: flex !important;
                justify-content: space-between !important;
                align-items: flex-end !important;
                gap: 14px !important;
                pointer-events: none !important;
                z-index: 2 !important;
            }
            .ad-title {
                color: #ffffff !important;
                font-size: 0.95rem !important;
                font-weight: 700 !important;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
                text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6) !important;
                flex: 1 !important;
                min-width: 0 !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                line-height: 1.3 !important;
            }
            .ad-countdown {
                display: inline-flex !important;
                align-items: center !important;
                gap: 4px !important;
                background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%) !important;
                color: #ffffff !important;
                font-size: 0.72rem !important;
                padding: 5px 10px !important;
                border-radius: 6px !important;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
                font-weight: 700 !important;
                letter-spacing: 0.3px !important;
                box-shadow: 0 2px 10px rgba(220, 38, 38, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
                animation: zetraPromoPulse 1.8s ease-in-out infinite !important;
                bottom: 14px !important;
                right: 14px !important;
                flex-shrink: 0 !important;
                z-index: 3 !important;
            }
            .ad-countdown-icon {
                font-size: 0.82rem !important;
                line-height: 1 !important;
            }
            @keyframes zetraPromoPulse {
                0%, 100% {
                    box-shadow: 0 2px 10px rgba(220, 38, 38, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2);
                    transform: scale(1);
                }
                50% {
                    box-shadow: 0 4px 22px rgba(220, 38, 38, 0.78), inset 0 1px 0 rgba(255, 255, 255, 0.3);
                    transform: scale(1.05);
                }
            }
            @media (max-width: 480px) {
                .ad-title { font-size: 0.82rem !important; }
                .ad-countdown { font-size: 0.65rem !important; padding: 4px 8px !important; }
            }
            .ad-card {
                position: relative !important;
                overflow: hidden !important;
            }
        `;
        document.head.appendChild(promoStyle);
    }
    
    // ====================
    // UTILITY FUNCTIONS
    // ====================
    function getCurrentCategory() {
        if (window.ZETRA_CONFIG && window.ZETRA_CONFIG.currentCategory) {
            return window.ZETRA_CONFIG.currentCategory;
        }
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '');
        const pageToCategory = {
                        'healthcare': 'healthcare',
            'product': 'healthcare'
        };
        return pageToCategory[page] || 'healthcare';
    }
    
    function isProductPage() {
        return window.location.pathname.includes('product.html');
    }
    
    function getSlugFromURL() {
        if (!isProductPage()) return null;
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('slug') ? decodeURIComponent(urlParams.get('slug')) : null;
    }
    
    function getImageUrl(categorySlug, imageFilename) {
        if (!imageFilename) return window.ZETRA_CONFIG.images.baseUrl + 'placeholder.jpg';
        if (imageFilename.startsWith('https://oalshkwaqaljcaqrsoqi.supabase.co')) return imageFilename;
        if (imageFilename.startsWith('http')) return imageFilename;
        const config = window.ZETRA_CONFIG.images;
        const folder = config.paths[categorySlug] || '';
        return config.baseUrl + folder + imageFilename;
    }
    
    function formatPrice(price) {
        if (price === null || price === undefined || price === '') return '$0.00';
        const n = parseFloat(price);
        if (Number.isNaN(n)) return '$0.00';
        return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function safeParseJSON(key, fallback) {
        try {
            return JSON.parse(localStorage.getItem(key)) || fallback;
        } catch (e) {
            console.error('Failed to parse ' + key + ':', e);
            localStorage.removeItem(key);
            return fallback;
        }
    }
    
    function getSupabaseClient() {
        if (window.ZETRA_SUPABASE_CLIENT) return window.ZETRA_SUPABASE_CLIENT;
        if (window.supabase && window.supabase.createClient) {
            const config = window.ZETRA_CONFIG.supabase;
            window.ZETRA_SUPABASE_CLIENT = window.supabase.createClient(config.url, config.key);
            console.log('✅ Supabase client ready');
            return window.ZETRA_SUPABASE_CLIENT;
        }
        console.error('❌ Supabase not loaded');
        return null;
    }
    
    // ====================
    // GET NEXT SEQUENTIAL ORDER NUMBER
    // ====================
    async function getNextOrderNumber() {
        const supabase = getSupabaseClient();
        if (!supabase) return '0001';
        
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('order_number')
                .order('created_at', { ascending: false })
                .limit(1);
            
            if (error) throw error;
            
            let highestNumber = 0;
            
            if (data && data.length > 0 && data[0].order_number) {
                const numericPart = String(data[0].order_number).replace(/\D/g, '');
                if (numericPart) {
                    highestNumber = parseInt(numericPart, 10);
                }
            }
            
            const nextNumber = highestNumber + 1;
            const paddedNumber = nextNumber.toString().padStart(4, '0');
            return paddedNumber;
            
        } catch (error) {
            console.error('Error getting next order number:', error);
            return Date.now().toString().slice(-4);
        }
    }
    
    // ====================
    // RECOMMENDATION ENGINE
    // ====================
    async function loadRecommendations(currentProduct) {
        try {
            const supabase = getSupabaseClient();
            if (!supabase) return [];
            
            const currentCategoryId = currentProduct.category_id;
            const currentProductName = currentProduct.name.toLowerCase();
            const currentProductId = currentProduct.id;
            
            const nameWords = currentProductName.split(' ').filter(w => w.length > 2);
            let recommendations = [];
            
            if (nameWords.length > 0) {
                let nameQuery = supabase
                    .from('products')
                    .select('id, name, price, compare_price, image_url, slug, stock, category_id, created_at')
                    .eq('is_active', true)
                    .neq('id', currentProductId);
                
                if (nameWords.length > 1) {
                    nameQuery = nameQuery.or(nameWords.map(w => `name.ilike.%${w}%`).join(','));
                } else {
                    nameQuery = nameQuery.ilike('name', `%${nameWords[0]}%`);
                }
                
                const { data: keywordMatches, error: keywordError } = await nameQuery.limit(10);
                if (keywordError) console.error('Keyword recommendations query failed:', keywordError);
                if (keywordMatches && keywordMatches.length > 0) {
                    recommendations = keywordMatches;
                }
            }
            
            if (recommendations.length < 15) {
                const needed = 15 - recommendations.length;
                const existingIds = recommendations.map(r => r.id);
                let categoryQuery = supabase
                    .from('products')
                    .select('id, name, price, compare_price, image_url, slug, stock, category_id, created_at')
                    .eq('category_id', currentCategoryId)
                    .eq('is_active', true)
                    .neq('id', currentProductId);
                
                if (existingIds.length > 0) {
                    categoryQuery = categoryQuery.not('id', 'in', `(${existingIds.join(',')})`);
                }
                
                const { data: categoryProducts, error: categoryError } = await categoryQuery.limit(needed);
                if (categoryError) console.error('Category recommendations query failed:', categoryError);
                if (categoryProducts && categoryProducts.length > 0) {
                    recommendations = [...recommendations, ...categoryProducts];
                }
            }
            
            if (recommendations.length < 15) {
                const needed = 15 - recommendations.length;
                const existingIds = recommendations.map(r => r.id);
                let randomQuery = supabase
                    .from('products')
                    .select('id, name, price, compare_price, image_url, slug, stock, category_id, created_at')
                    .eq('is_active', true)
                    .neq('id', currentProductId);
                
                if (existingIds.length > 0) {
                    randomQuery = randomQuery.not('id', 'in', `(${existingIds.join(',')})`);
                }
                
                const { data: randomProducts, error: randomError } = await randomQuery.limit(needed);
                if (randomError) console.error('Random recommendations query failed:', randomError);
                if (randomProducts && randomProducts.length > 0) {
                    recommendations = [...recommendations, ...randomProducts];
                }
            }
            
            recommendations = recommendations.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
            recommendations = recommendations.slice(0, 15);
            return recommendations;
            
        } catch (error) {
            console.error('Error loading recommendations:', error);
            return [];
        }
    }
    
    async function renderRecommendations(currentProduct) {
        const section = document.getElementById('recommendationsSection');
        const container = document.getElementById('recommendationsContainer');
        if (!section || !container) return;
        
        const recommendations = await loadRecommendations(currentProduct);
        if (recommendations.length === 0) {
            section.style.display = 'none';
            return;
        }
        
        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const categorySlug = currentProduct.category_slug || getCurrentCategory();
        
        let html = '';
        for (const product of recommendations) {
            const hasComparePrice = product.compare_price && product.compare_price > product.price;
            const discountPercent = hasComparePrice ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100) : 0;
            const imageUrl = getImageUrl(categorySlug, product.image_url);
            
            html += `
                <a href="product.html?slug=${product.slug}" class="recommendation-card">
                    <img src="${imageUrl}" alt="${product.name}" class="rec-image"
                         onerror="this.src='${window.ZETRA_CONFIG.images.baseUrl}placeholder.jpg'">
                    <div class="rec-info">
                        <div class="rec-name">${escapeHtml(product.name)}</div>
                        <div class="rec-price">${formatPrice(product.price)}</div>
                        ${hasComparePrice ? `<div class="rec-old-price" style="font-size:0.7rem;color:var(--gray-400);text-decoration:line-through;">${formatPrice(product.compare_price)}</div>` : ''}
                        ${hasComparePrice ? `<div class="rec-discount" style="font-size:0.65rem;color:#dc2626;font-weight:700;">Save ${discountPercent}%</div>` : ''}
                        <div class="text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-600'} mt-1">
                            ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </div>
                    </div>
                </a>
            `;
        }
        container.innerHTML = html;
        section.style.display = 'block';
    }
    
    // ====================
    // RENDER PRODUCT CARD (UPDATED - Quick Add only for non-footwear)
    // ====================
    function renderProductCard(product, categorySlug, now, sevenDays) {
        const imageUrl = getImageUrl(categorySlug, product.image_url);
        const wishlist = safeParseJSON('zetra_wishlist', []);
        const isInWishlist = wishlist.some(item => item.id === product.id);
        
        // Check for discount
        const hasComparePrice = product.compare_price && product.compare_price > product.price;
        const discountPercent = hasComparePrice ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100) : 0;
        
        // Check if product is new (created within last 7 days)
        const isNew = product.created_at && (now - new Date(product.created_at).getTime()) < sevenDays;
        
        // Get category name
        const catName = product.categories ? product.categories.name : '';
        
        // Stock status
        const inStock = product.stock > 0;
        
        // ===== CHECK IF THIS IS A FOOTWEAR CATEGORY =====
        // Quick Add should ONLY appear on non-footwear products
        const isFootwear = FOOTWEAR_SLUGS.indexOf(categorySlug) !== -1;
        
        // Build the product card HTML
        let html = `
            <a href="product.html?slug=${encodeURIComponent(product.slug || product.id)}" class="product-card-wrapper">
                <div class="product-card">
                    <div class="product-image">
                        <img src="${imageUrl}" alt="${escapeHtml(product.name)}" 
                             onerror="this.src='${window.ZETRA_CONFIG.images.baseUrl}placeholder.jpg'">
                        <div class="product-badges">
                            ${isNew ? '<span class="badge-new">New</span>' : ''}
                            ${hasComparePrice ? `<span class="badge-sale">-${discountPercent}%</span>` : ''}
                        </div>
                        <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" 
                                data-id="${product.id}" data-action="wishlist" 
                                aria-label="Add to wishlist">
                            <i class="icon-heart"></i>
                        </button>
                    </div>
                    <div class="product-info">
                        ${catName ? `<div class="product-cat-tag">${escapeHtml(catName)}</div>` : ''}
                        <h3 class="product-title">${escapeHtml(product.name)}</h3>
                        <div class="product-price-row">
                            <span class="product-price">${formatPrice(product.price)}</span>
                            ${hasComparePrice ? `<span class="old-price">${formatPrice(product.compare_price)}</span>` : ''}
                            ${hasComparePrice ? `<span class="discount-tag">Save ${discountPercent}%</span>` : ''}
                        </div>
                        <div class="availability ${inStock ? '' : 'out-of-stock'}">
                            <i class="icon-${inStock ? 'check-circle' : 'x-circle'}"></i> 
                            ${inStock ? 'In Stock' : 'Out of Stock'}
                        </div>
                        ${inStock && !isFootwear ? `
                            <button class="quick-add" data-product-id="${product.id}" data-product-name="${escapeHtml(product.name)}" data-product-price="${product.price}" data-product-image="${product.image_url || ''}" data-category-slug="${categorySlug}">
                                <i class="icon-plus" style="font-size:1rem"></i> Quick Add
                            </button>
                        ` : ''}
                    </div>
                </div>
            </a>
        `;
        
        return html;
    }
    
    // ====================
    // RENDER PRODUCTS
    // ====================
    function renderProducts(products, categorySlug) {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;
        
        productsGrid.innerHTML = '';
        
        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        
        // Store products in cache for wishlist functionality
        window.ZETRA_PRODUCTS_CACHE = products;
        
        products.forEach(product => {
            const cardHtml = renderProductCard(product, categorySlug, now, sevenDays);
            // Create a temporary container to parse the HTML
            const temp = document.createElement('div');
            temp.innerHTML = cardHtml;
            const cardElement = temp.firstElementChild;
            productsGrid.appendChild(cardElement);
        });
        
        setupProductInteractions();
    }
    
    // ====================
    // SETUP PRODUCT INTERACTIONS
    // ====================
    function setupProductInteractions() {
        // Wishlist buttons
        document.addEventListener('click', function(event) {
            const wishlistBtn = event.target.closest('[data-action="wishlist"]');
            if (wishlistBtn) {
                event.preventDefault();
                event.stopPropagation();
                const productId = parseInt(wishlistBtn.getAttribute('data-id'));
                const product = window.ZETRA_PRODUCTS_CACHE?.find(p => p.id === productId);
                if (product) {
                    toggleWishlist(product);
                    wishlistBtn.classList.toggle('active');
                }
            }
        });
        
        // Quick Add buttons (delegated) - only for non-footwear
        document.addEventListener('click', function(event) {
            const quickBtn = event.target.closest('.quick-add');
            if (!quickBtn) return;
            event.preventDefault();
            event.stopPropagation();
            
            const productId = parseInt(quickBtn.dataset.productId);
            const productName = quickBtn.dataset.productName || 'Product';
            const productPrice = parseFloat(quickBtn.dataset.productPrice) || 0;
            const productImage = quickBtn.dataset.productImage || '';
            const categorySlug = quickBtn.dataset.categorySlug || getCurrentCategory();
            
            // Find full product data from cache
            let product = window.ZETRA_PRODUCTS_CACHE?.find(p => p.id === productId);
            if (!product) {
                showNotification('Could not verify product stock. Please refresh and try again.', 'warning');
                return;
            }
            
            // Add to cart only after validating current availability.
            addToCart(product, 1, { category_slug: categorySlug });
        });
    }
    
    // ====================
    // LOAD PRODUCTS BY CATEGORY
    // ====================
    async function loadProductsByCategory(categorySlug) {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;
        
        productsGrid.innerHTML = '<div class="loading-spinner"><i class="icon-loader"></i><p>Loading products...</p></div>';
        
        const supabase = getSupabaseClient();
        if (!supabase) {
            productsGrid.innerHTML = '<div class="error-message">Database connection error</div>';
            return;
        }
        
        try {
            const { data: category, error: catError } = await supabase
                .from('categories')
                .select('id')
                .eq('slug', categorySlug)
                .single();
            
            if (catError || !category) throw new Error('Category not found');
            
            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('id, name, price, compare_price, image_url, stock, slug, created_at, category_id')
                .eq('category_id', category.id)
                .eq('is_active', true)
                .order('created_at', { ascending: false });
            
            if (productsError) throw productsError;
            
            if (!products || products.length === 0) {
                productsGrid.innerHTML = '<div class="no-products">No products found</div>';
                return;
            }
            
            window.ZETRA_PRODUCTS_CACHE = products;
            renderProducts(products, categorySlug);
            
        } catch (error) {
            console.error(error);
            productsGrid.innerHTML = '<div class="error-message">Error loading products</div>';
        }
    }
    
    // ====================
    // LOAD SINGLE PRODUCT
    // ====================
    async function loadSingleProductBySlug(slug) {
        console.log(`📦 Loading single product by slug: ${slug}`);
        
        const productViewer = document.getElementById('productViewer');
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        
        if (!productViewer) return;
        if (errorState) errorState.style.display = 'none';
        if (loadingState) loadingState.style.display = 'block';
        
        const supabase = getSupabaseClient();
        if (!supabase) {
            showError('Database connection error');
            return;
        }
        
        try {
            const { data: product, error: productError } = await supabase
                .from('products')
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();
            
            if (productError || !product) throw new Error('Product not found');
            
            console.log('✅ Loaded product:', product.name);
            
            const { data: category, error: categoryError } = await supabase
                .from('categories')
                .select('id, name, slug')
                .eq('id', product.category_id)
                .single();
            if (categoryError) console.error('Failed to load category:', categoryError);
            
            const { data: colors, error: colorsError } = await supabase
                .from('product_colors')
                .select('*')
                .eq('product_id', product.id)
                .order('sort_order');
            if (colorsError) console.error('Failed to load colors:', colorsError);
            
            const { data: sizes, error: sizesError } = await supabase
                .from('product_sizes')
                .select('*')
                .eq('product_id', product.id)
                .order('size_value');
            if (sizesError) console.error('Failed to load sizes:', sizesError);
            
            document.title = `${product.name} - IndiaMedCare`;
            
            currentProduct = product;
            currentProduct.category_slug = category?.slug || getCurrentCategory();
            currentProduct.category_name = category?.name || 'Category';
            currentProductColors = colors || [];
            currentProductSizes = sizes || [];
            currentSelectedQuantity = 1;
            currentSelectedColor = null;
            currentSelectedSize = null;
            
            buildColorSizeMappings(currentProductColors, currentProductSizes);
            renderProductPage(currentProduct);
            await renderRecommendations(currentProduct);
            
            if (loadingState) loadingState.style.display = 'none';
            
        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'Failed to load product');
        }
    }
    
    function showError(message) {
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const errorMessage = document.getElementById('errorMessage');
        if (loadingState) loadingState.style.display = 'none';
        if (errorState) {
            errorState.style.display = 'block';
            if (errorMessage) errorMessage.textContent = message;
        }
    }
    
    // ====================
    // RENDER PRODUCT PAGE
    // ====================
    function renderProductPage(product) {
            // v18: if product.html already set the flag, bail -- eliminates two-phase flash.
            if (window.__zetraProductRendered) { return; }


        const productViewer = document.getElementById('productViewer');
        if (!productViewer) return;
        
        const categorySlug = product.category_slug || getCurrentCategory();
        const imageUrl = getImageUrl(categorySlug, product.image_url);
        const isFootwear = false;
        const hasComparePrice = product.compare_price && product.compare_price > product.price;
        const discountPercent = hasComparePrice ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100) : 0;
        
        const wishlist = safeParseJSON('zetra_wishlist', []);
        const isInWishlist = wishlist.some(item => item.id === product.id);
        
        const stockStatus = product.stock > 10 ? 'in-stock' : (product.stock > 0 ? 'low-stock' : 'out-of-stock');
        const stockText = product.stock > 10 ? 'In Stock' : (product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock');
        
        const catName = product.category_name || 'Category';
        
        productViewer.innerHTML = `
            <div class="product-container">
                <div class="product-image-section" id="productImageSection">
                    <div class="product-image-wrapper">
                        <img src="${imageUrl}" alt="${product.name}" class="product-image"
                             onerror="this.onerror=null; this.src='${window.ZETRA_CONFIG.images.baseUrl}placeholder.jpg'">
                        ${hasComparePrice ? `
                            <div class="product-badges" style="position:absolute;top:12px;left:12px;z-index:2;display:flex;flex-direction:column;gap:6px;">
                                <span class="badge-sale" style="background:#dc2626;color:white;padding:4px 10px;border-radius:6px;font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;font-family:'Inter',sans-serif;">-${discountPercent}%</span>
                            </div>
                        ` : ''}
                        <div class="magnify-icon"><i class="icon-zoom-in"></i></div>
                    </div>
                </div>
                <div class="product-details">
                    <div class="product-cat-tag" style="font-size:0.7rem;font-weight:600;color:var(--gray-400);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;font-family:'Inter',sans-serif;">${escapeHtml(catName)}</div>
                    <h1 class="product-title">${escapeHtml(product.name)}</h1>
                    <div class="price-section">
                        <span class="current-price" style="font-size:1.5rem;font-weight:800;color:var(--gray-900);">${formatPrice(product.price)}</span>
                        ${hasComparePrice ? `<span class="original-price" style="font-size:1rem;color:var(--gray-400);text-decoration:line-through;">${formatPrice(product.compare_price)}</span>` : ''}
                        ${hasComparePrice ? `<span class="discount-badge" style="background:#dc2626;color:white;padding:2px 10px;border-radius:20px;font-size:0.75rem;font-weight:700;">-${discountPercent}%</span>` : ''}
                    </div>
                    ${hasComparePrice ? `<div style="font-size:0.8rem;color:#dc2626;font-weight:600;margin-top:-4px;">Save ${discountPercent}%</div>` : ''}
                    <div class="stock-tile">
                        <div class="stock-status ${stockStatus}">
                            <i class="${product.stock > 0 ? 'icon-check-circle' : 'icon-x-circle'}"></i>
                            <span>${stockText}</span>
                        </div>
                    </div>
                    <div class="description-tile">
                        <div class="tile-label"><i class="icon-info"></i> Description</div>
                        <div class="product-description">${product.description ? product.description.replace(/\n/g, '<br>') : 'Premium quality product from IndiaMedCare.'}</div>
                    </div>
                    ${isFootwear && currentProductColors.length > 0 ? `
                        <div class="variant-tile">
                            <div class="tile-label"><i class="icon-palette"></i> Select Color</div>
                            <div class="color-options" id="colorOptions">
                                ${currentProductColors.map(color => `<div class="color-option" data-color-id="${color.id}" data-color-name="${color.color_name}" style="${color.color_code ? 'background: ' + color.color_code + ';' : ''}">${color.color_name}</div>`).join('')}
                            </div>
                        </div>
                        <div class="variant-tile">
                            <div class="tile-label"><i class="icon-ruler"></i> Select Size</div>
                            <div class="size-options" id="sizeOptions"><div class="text-gray-400 text-sm">Please select a color first</div></div>
                        </div>
                        <div class="selection-summary" id="selectionSummary" style="display: none;">
                            <div class="selected-variant"><span id="selectedColorName"></span> - <span id="selectedSizeValue"></span></div>
                            <div class="stock-info"><i class="icon-package"></i> Available Stock: <strong id="availableStock">0</strong></div>
                        </div>
                    ` : ''}
                    <div class="quantity-tile">
                        <div class="tile-label"><i class="icon-calculator"></i> Quantity</div>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus">-</button>
                            <input type="number" id="productQuantity" value="1" min="1" max="${product.stock || 100}">
                            <button class="quantity-btn plus">+</button>
                        </div>
                        <div class="bulk-options">
                            ${[2, 3, 5, 10].map(qty => `<button class="bulk-option" data-qty="${qty}">${qty} Units</button>`).join('')}
                        </div>
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn btn-add-cart" id="pageAddToCart"><i class="icon-shopping-cart"></i> Add to Cart</button>
                        <button class="action-btn btn-wishlist ${isInWishlist ? 'active' : ''}" id="pageWishlist"><i class="icon-heart"></i> ${isInWishlist ? 'Saved' : 'Wishlist'}</button>
                    </div>
                </div>
            </div>
        `;
        
        setupProductPageInteractions();
    
        window.__zetraProductRendered = true;  // v14: signals product.html local render to skip
}
    
    function buildColorSizeMappings(colors, sizes) {
        colorSizeMap = {};
        sizeColorMap = {};
        colors.forEach(color => { colorSizeMap[color.id] = sizes.filter(size => size.color_id === color.id); });
        const uniqueSizes = [...new Set(sizes.map(s => s.size_value))];
        uniqueSizes.forEach(sizeValue => {
            const sizeVariants = sizes.filter(s => s.size_value === sizeValue);
            sizeColorMap[sizeValue] = colors.filter(color => sizeVariants.some(s => s.color_id === color.id));
        });
    }
    
    function setupProductPageInteractions() {
        if (!isProductPage()) return;
        
        const colorOptions = document.getElementById('colorOptions');
        if (colorOptions) {
            colorOptions.addEventListener('click', (e) => {
                const colorOption = e.target.closest('.color-option');
                if (!colorOption) return;
                colorOptions.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                colorOption.classList.add('selected');
                currentSelectedColor = { id: parseInt(colorOption.dataset.colorId), name: colorOption.dataset.colorName };
                updateSizeOptionsForColor(currentSelectedColor.id);
            });
        }
        
        const quantityInput = document.getElementById('productQuantity');
        const minusBtn = document.querySelector('.quantity-btn.minus');
        const plusBtn = document.querySelector('.quantity-btn.plus');
        
        if (quantityInput && minusBtn && plusBtn) {
            minusBtn.addEventListener('click', () => {
                let val = parseInt(quantityInput.value) || 1;
                if (val > 1) quantityInput.value = val - 1;
                currentSelectedQuantity = parseInt(quantityInput.value);
            });
            plusBtn.addEventListener('click', () => {
                let val = parseInt(quantityInput.value) || 1;
                const max = currentSelectedSize?.stock || currentProduct?.stock || 100;
                if (val < max) quantityInput.value = val + 1;
                currentSelectedQuantity = parseInt(quantityInput.value);
            });
            quantityInput.addEventListener('change', () => {
                let val = parseInt(quantityInput.value) || 1;
                const max = currentSelectedSize?.stock || currentProduct?.stock || 100;
                quantityInput.value = Math.max(1, Math.min(val, max));
                currentSelectedQuantity = parseInt(quantityInput.value);
            });
        }
        
        document.querySelectorAll('.bulk-option').forEach(opt => {
            opt.addEventListener('click', function() {
                document.querySelectorAll('.bulk-option').forEach(o => o.classList.remove('active'));
                this.classList.add('active');
                const qty = parseInt(this.dataset.qty);
                if (quantityInput) {
                    quantityInput.value = qty;
                    currentSelectedQuantity = qty;
                }
            });
        });
        
        const pageAddToCart = document.getElementById('pageAddToCart');
        if (pageAddToCart && currentProduct) {
            pageAddToCart.addEventListener('click', () => {
                const isFootwear = false;
                if (isFootwear && currentProductColors.length > 0) {
                    if (!currentSelectedColor) { showNotification('Please select a color', 'warning'); return; }
                    if (!currentSelectedSize) { showNotification('Please select a size', 'warning'); return; }
                    if (currentSelectedSize.stock <= 0) { showNotification('This size is out of stock', 'error'); return; }
                    if (currentSelectedQuantity > currentSelectedSize.stock) { showNotification(`Only ${currentSelectedSize.stock} units available in this size`, 'error'); return; }
                    addToCart(currentProduct, currentSelectedQuantity, {
                        color_id: currentSelectedColor.id, color_name: currentSelectedColor.name,
                        size_id: currentSelectedSize.id, size_value: currentSelectedSize.value,
                        stock: currentSelectedSize.stock,
                        variant_id: currentSelectedVariant?.id
                    });
                } else {
                    if (currentSelectedQuantity > currentProduct.stock) { showNotification(`Only ${currentProduct.stock} units available`, 'error'); return; }
                    addToCart(currentProduct, currentSelectedQuantity);
                }
            });
        }
        
        const pageWishlist = document.getElementById('pageWishlist');
        if (pageWishlist && currentProduct) {
            pageWishlist.addEventListener('click', () => {
                toggleWishlist(currentProduct);
                const isActive = pageWishlist.classList.contains('active');
                pageWishlist.classList.toggle('active');
                pageWishlist.innerHTML = `<i class="icon-heart"></i> ${isActive ? 'Wishlist' : 'Saved'}`;
            });
        }
    }
    
    function updateSizeOptionsForColor(colorId) {
        const sizeOptions = document.getElementById('sizeOptions');
        const selectionSummary = document.getElementById('selectionSummary');
        if (!sizeOptions) return;
        
        const availableSizes = colorSizeMap[colorId] || [];
        if (availableSizes.length === 0) {
            sizeOptions.innerHTML = '<div class="text-gray-400 text-sm">No sizes available for this color</div>';
            if (selectionSummary) selectionSummary.style.display = 'none';
            currentSelectedSize = null;
            currentSelectedVariant = null;
            return;
        }
        
        sizeOptions.innerHTML = availableSizes.map(size => {
            const stock = size.stock_quantity || 0;
            const disabledClass = stock === 0 ? 'disabled' : '';
            return `<div class="size-option ${disabledClass}" data-size-id="${size.id}" data-size-value="${size.size_value}" data-stock="${stock}" ${stock === 0 ? 'disabled' : ''}>${size.size_value}</div>`;
        }).join('');
        
        sizeOptions.querySelectorAll('.size-option:not(.disabled)').forEach(option => {
            option.addEventListener('click', function() {
                sizeOptions.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                currentSelectedSize = { id: parseInt(this.dataset.sizeId), value: this.dataset.sizeValue, stock: parseInt(this.dataset.stock) };
                currentSelectedVariant = currentProductSizes.find(s => s.id === currentSelectedSize.id && s.color_id === currentSelectedColor?.id);
                if (selectionSummary) selectionSummary.style.display = 'block';
                document.getElementById('selectedColorName').textContent = currentSelectedColor.name;
                document.getElementById('selectedSizeValue').textContent = currentSelectedSize.value;
                document.getElementById('availableStock').textContent = currentSelectedSize.stock;
                const qtyInput = document.getElementById('productQuantity');
                if (qtyInput) {
                    qtyInput.max = currentSelectedSize.stock;
                    if (currentSelectedQuantity > currentSelectedSize.stock) {
                        currentSelectedQuantity = currentSelectedSize.stock;
                        qtyInput.value = currentSelectedSize.stock;
                    }
                }
            });
        });
    }
    
    // ====================
    // CART FUNCTIONS
    // ====================
    function getCart() {
        try {
            return JSON.parse(localStorage.getItem('zetra_cart')) || [];
        } catch (e) {
            console.error('Failed to parse cart data:', e);
            localStorage.removeItem('zetra_cart');
            return [];
        }
    }
    
    function saveCart(cart) {
        localStorage.setItem('zetra_cart', JSON.stringify(cart));
        updateCartUI();
    }
    
    function addToCart(product, quantity = 1, options = {}) {
        let cart = getCart();
        const isVariant = options.size_id != null;
        const availableStock = Number(isVariant ? options.stock : product.stock);
        if (!Number.isFinite(availableStock) || availableStock <= 0) {
            showNotification(`${product.name}${isVariant ? ' in the selected size' : ''} is out of stock`, 'error');
            return false;
        }
        const existingQuantity = cart
            .filter(item => item.product_id === product.id && (options.size_id != null ? item.size_id === Number(options.size_id) : item.size_id == null))
            .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
        if (existingQuantity + quantity > availableStock) {
            showNotification(`Only ${Math.max(availableStock - existingQuantity, 0)} units of ${product.name} are available`, 'error');
            return false;
        }
        const cartItem = {
            product_id: product.id, quantity, name: product.name, price: product.price || 0,
            image_url: product.image_url, category_slug: options.category_slug || getCurrentCategory(),
            stock: isVariant ? availableStock : (Number(product.stock) || 0),
            // Display fields (kept for legacy compatibility & UI labels)
            color_name: options.color_name || null, size_value: options.size_value || null,
            // Stable variant identity so stock decrements target the exact DB row
            // and so the cart merge doesn't accidentally fold distinct colorways
            // (e.g. "size 42 in Black" vs "size 42 in Brown") into one line.
            size_id:  options.size_id  != null ? Number(options.size_id)  : null,
            color_id: options.color_id != null ? Number(options.color_id) : null,
            added_at: new Date().toISOString()
        };
        // Remove null/undefined identity fields before saving so the on-disk cart
        // stays clean. Non-footwear lines have size_id === null.
        if (cartItem.size_id === null)  delete cartItem.size_id;
        if (cartItem.color_id === null) delete cartItem.color_id;
        
        // Merge by (product_id, size_id) when a variant is present — size_id
        // is unique per (product, color, size) in product_sizes. Fall back to
        // (product_id) for variant-less quick-add lines. This prevents the
        // accidental folding bug where two colorways of the same numeric size
        // used to be incorrectly merged because we matched by display strings.
        const existingIndex = cart.findIndex(item => {
            if (item.product_id !== cartItem.product_id) return false;
            return (cartItem.size_id != null)
                ? item.size_id === cartItem.size_id
                : (item.size_id == null);
        });
        if (existingIndex !== -1) {
            cart[existingIndex].quantity += quantity;
            cart[existingIndex].stock = availableStock;
            showNotification(`Updated ${product.name} quantity`, 'info');
        } else {
            cart.push(cartItem);
            let text = product.name;
            if (options.color_name) text += ` (${options.color_name})`;
            if (options.size_value) text += ` - ${options.size_value}`;
            showNotification(`${text} added to cart!`, 'success');
        }
        saveCart(cart);
        openCart();
        return true;
    }
    
    function updateCartUI() {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const wishlist = safeParseJSON('zetra_wishlist', []);
        
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        const wishlistCount = document.getElementById('wishlistCount');
        if (wishlistCount) {
            wishlistCount.textContent = wishlist.length;
            wishlistCount.style.display = wishlist.length > 0 ? 'flex' : 'none';
        }
        
        updateCartPanel();
    }
    
    function cartItemStock(item) {
        const stock = Number(item.stock);
        if (Number.isFinite(stock) && stock >= 0) return Math.max(0, Math.floor(stock));
        // Legacy lines without a stock snapshot cannot be increased until a
        // refresh resolves the real value from the database.
        return Math.max(0, parseInt(item.quantity, 10) || 0);
    }

    function ensureMiniCartStyles() {
        if (document.getElementById('zetraMiniCartQtyStyles')) return;
        const style = document.createElement('style');
        style.id = 'zetraMiniCartQtyStyles';
        style.textContent = `
            .cart-item-qty{display:inline-flex;align-items:center;gap:2px;margin-top:6px;border:1px solid #e5e7eb;border-radius:999px;padding:2px;background:#fff;}
            .cart-qty-btn{width:26px;height:26px;border:none;border-radius:50%;background:#f3f4f6;color:#111827;font-size:1rem;line-height:1;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s ease,color .15s ease;}
            .cart-qty-btn:hover:not(:disabled){background:#0f3d2e;color:#fff;}
            .cart-qty-btn:disabled{opacity:.4;cursor:not-allowed;}
            .cart-qty-value{min-width:26px;text-align:center;font-size:.82rem;font-weight:700;color:#111827;font-variant-numeric:tabular-nums;}
            .cart-item-stock{font-size:.68rem;color:#9ca3af;margin-top:3px;}
        `;
        document.head.appendChild(style);
    }

    function changeCartQuantity(index, delta) {
        const cart = getCart();
        const item = cart[index];
        if (!item) return;
        const current = Math.max(0, parseInt(item.quantity, 10) || 0);
        const stock = cartItemStock(item);
        const next = current + delta;
        if (next <= 0) {
            cart.splice(index, 1);
            saveCart(cart);
            showNotification('Item removed from cart', 'info');
            return;
        }
        if (next > stock) {
            showNotification(`Only ${stock} unit${stock === 1 ? '' : 's'} available`, 'warning');
            return;
        }
        item.quantity = next;
        saveCart(cart);
    }

    async function refreshMiniCartStock() {
        const supabase = getSupabaseClient();
        if (!supabase) return false;
        let cart = getCart();
        if (cart.length === 0) return false;
        const productIds = [...new Set(cart
            .map(item => Number(item.product_id))
            .filter(id => Number.isFinite(id)))];
        if (productIds.length === 0) return false;

        try {
            const [productsResult, sizesResult] = await Promise.all([
                supabase.from('products').select('id, stock').in('id', productIds),
                supabase.from('product_sizes').select('id, product_id, stock_quantity').in('product_id', productIds)
            ]);
            const products = productsResult.data || [];
            const sizes = sizesResult.data || [];
            let changed = false;
            let adjusted = false;

            cart.forEach(item => {
                const productId = Number(item.product_id);
                let stock = null;
                if (item.size_id != null) {
                    const sizeRow = sizes.find(row => Number(row.id) === Number(item.size_id));
                    if (sizeRow) stock = Math.max(0, parseInt(sizeRow.stock_quantity, 10) || 0);
                } else if (item.size_value) {
                    const sizeRow = sizes.find(row => Number(row.product_id) === productId && String(row.size_value) === String(item.size_value));
                    if (sizeRow) stock = Math.max(0, parseInt(sizeRow.stock_quantity, 10) || 0);
                }
                if (stock === null) {
                    const productRow = products.find(row => Number(row.id) === productId);
                    if (productRow) stock = Math.max(0, parseInt(productRow.stock, 10) || 0);
                }
                if (stock === null) return;

                if (Number(item.stock) !== stock) {
                    item.stock = stock;
                    changed = true;
                }
                const quantity = Math.max(0, parseInt(item.quantity, 10) || 0);
                if (quantity > stock) {
                    item.quantity = stock;
                    changed = true;
                    adjusted = true;
                }
            });

            const remaining = cart.filter(item => (parseInt(item.quantity, 10) || 0) > 0);
            if (remaining.length !== cart.length) {
                cart = remaining;
                changed = true;
                adjusted = true;
            }

            if (changed) {
                localStorage.setItem('zetra_cart', JSON.stringify(cart));
                updateCartUI();
                if (adjusted) showNotification('Cart quantities updated to match available stock', 'warning');
            }
            return changed;
        } catch (error) {
            console.warn('Mini-cart stock refresh failed:', error);
            return false;
        }
    }

    function updateCartPanel() {
        const cart = getCart();
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (!cartItems || !cartTotal) return;

        ensureMiniCartStyles();
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
            cartTotal.textContent = '$0';
            return;
        }
        
        let html = '';
        let total = 0;
        cart.forEach((item, index) => {
            const quantity = Math.max(0, parseInt(item.quantity, 10) || 0);
            const itemTotal = (item.price || 0) * quantity;
            const stock = cartItemStock(item);
            total += itemTotal;
            let itemDesc = item.name;
            if (item.color_name) itemDesc += ` (${item.color_name})`;
            if (item.size_value) itemDesc += ` - ${item.size_value}`;
            html += `
                <div class="cart-item">
                    <div class="cart-item-image"><img src="${getImageUrl(item.category_slug, item.image_url)}" alt="${escapeHtml(item.name || '')}"></div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">${escapeHtml(itemDesc)}</div>
                        <div class="cart-item-price">${formatPrice(itemTotal)}</div>
                        <div class="cart-item-qty">
                            <button type="button" class="cart-qty-btn" data-qty-action="dec" data-index="${index}" aria-label="Decrease quantity">&minus;</button>
                            <span class="cart-qty-value" aria-live="polite">${quantity}</span>
                            <button type="button" class="cart-qty-btn" data-qty-action="inc" data-index="${index}" aria-label="Increase quantity" ${quantity >= stock ? 'disabled' : ''}>+</button>
                        </div>
                        <div class="cart-item-stock">${stock > 0 ? stock + ' in stock' : 'Out of stock'}</div>
                    </div>
                    <button class="cart-item-remove" data-index="${index}" aria-label="Remove ${escapeHtml(item.name || 'item')}"><i class="icon-trash-2"></i></button>
                </div>
            `;
        });
        
        const previousScroll = cartItems.scrollTop;
        cartItems.innerHTML = html;
        cartItems.scrollTop = previousScroll;
        cartTotal.textContent = formatPrice(total);
        
        cartItems.querySelectorAll('[data-qty-action]').forEach(btn => {
            btn.addEventListener('click', function() {
                changeCartQuantity(parseInt(this.dataset.index, 10), this.dataset.qtyAction === 'inc' ? 1 : -1);
            });
        });
        cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                let cart = getCart();
                cart.splice(parseInt(this.dataset.index), 1);
                saveCart(cart);
                showNotification('Item removed', 'info');
            });
        });
    }
    
    function openCart() {
        const cartPanel = document.getElementById('cartPanel');
        const cartOverlay = document.getElementById('cartOverlay');
        if (cartPanel) cartPanel.classList.add('active');
        if (cartOverlay) cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateCartPanel();
        refreshMiniCartStock();
    }
    
    function closeCart() {
        const cartPanel = document.getElementById('cartPanel');
        const cartOverlay = document.getElementById('cartOverlay');
        if (cartPanel) cartPanel.classList.remove('active');
        if (cartOverlay) cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    function toggleWishlist(product) {
        let wishlist = safeParseJSON('zetra_wishlist', []);
        const exists = wishlist.some(item => item.id === product.id);
        if (exists) {
            wishlist = wishlist.filter(item => item.id !== product.id);
            showNotification(`${product.name} removed from wishlist`, 'info');
        } else {
            wishlist.push({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, slug: product.slug });
            showNotification(`${product.name} added to wishlist!`, 'success');
        }
        localStorage.setItem('zetra_wishlist', JSON.stringify(wishlist));
        updateCartUI();
    }
    
    // ====================
    // RECEIPT UPLOAD TO SUPABASE STORAGE
    // ====================
    async function uploadReceiptToStorage(file, tempId) {
        const supabase = getSupabaseClient();
        if (!supabase) throw new Error('Database connection error');
        
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) throw new Error('File size exceeds 5MB limit');
        
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) throw new Error('Only JPG, PNG, WebP or PDF files are allowed');
        
        const ext = file.name.split('.').pop().toLowerCase();
        const safeName = tempId + '_' + Date.now() + '.' + ext;
        const filePath = 'receipts/' + safeName;
        
        const { data, error } = await supabase.storage
            .from('payment-receipts')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });
        
        if (error) throw new Error('Upload failed: ' + error.message);
        
        const { data: urlData } = supabase.storage
            .from('payment-receipts')
            .getPublicUrl(filePath);
        
        return urlData.publicUrl;
    }
    
    // ====================
    // CHECKOUT CONFIRMATION MODAL
    // ====================
        function showCheckoutModal() {
        const cart = getCart();
        if (cart.length === 0) {
            showNotification('Your cart is empty', 'warning');
            return;
        }

        const user = safeParseJSON('zetra_user', null) || {};
        const existing = document.getElementById('checkoutConfirmModal');
        if (existing) existing.remove();

        const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
        // Delivery is free — no shipping fee is added anywhere in the flow.
        const grandTotal = subtotal;

        let itemsHtml = '';
        cart.forEach(function (item) {
            const itemTotal = (item.price || 0) * item.quantity;
            let desc = escapeHtml(item.name);
            if (item.color_name) desc += ' (' + escapeHtml(item.color_name) + ')';
            if (item.size_value) desc += ' - ' + escapeHtml(item.size_value);
            itemsHtml += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.08);font-size:0.85rem;"><span style="flex:1;color:#e2e8f0;">' + desc + ' x' + item.quantity + '</span><span style="font-weight:600;color:#86EFAC;">$' + itemTotal.toLocaleString() + '</span></div>';
        });

        const prefillAddress = [user.address, user.city, user.state].filter(Boolean).join(', ');

        const modal = document.createElement('div');
        modal.id = 'checkoutConfirmModal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(4,12,8,0.78);z-index:20000;display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:20px;backdrop-filter:blur(10px);';
        modal.innerHTML = `
        <style>
        #checkoutConfirmModal #checkoutModalContent{max-width:600px!important;background:linear-gradient(155deg,#10251b,#172b22 55%,#1e3329)!important;border:1px solid rgba(134,239,172,0.2)!important}
        #checkoutConfirmModal #checkoutModalContent>div:first-child{border-bottom-color:rgba(134,239,172,0.18)!important;padding:22px 24px 18px!important}
        #checkoutConfirmModal #checkoutModalContent>div:nth-child(2){padding:18px 24px 24px!important;max-height:calc(100vh - 130px)!important}
        #checkoutConfirmModal .v18-card{background:rgba(255,255,255,0.045);border:1px solid rgba(203,213,225,0.12);border-radius:16px;padding:18px;margin-bottom:12px;box-shadow:0 8px 24px rgba(0,0,0,0.12)}
        #checkoutConfirmModal .v18-h{color:#86efac;font-size:0.74rem;text-transform:uppercase;letter-spacing:0.09em;margin:0 0 13px;font-weight:700;display:flex;align-items:center;gap:6px}
        #checkoutConfirmModal .v18-label{display:block;color:#cbd5e1;font-size:0.72rem;letter-spacing:0.03em;text-transform:uppercase;margin-bottom:6px;font-weight:600}
        #checkoutConfirmModal .v18-input{background:rgba(7,18,13,0.72);border:1px solid rgba(148,163,184,0.24);border-radius:11px;padding:12px 13px;width:100%;box-sizing:border-box;color:#e2e8f0;font-size:0.9rem;font-family:inherit;outline:none;resize:vertical}
        #checkoutConfirmModal .v18-input:focus{border-color:#16A34A;box-shadow:0 0 0 3px rgba(22,163,74,0.16)}
        #checkoutConfirmModal .v18-input::placeholder{color:#64748b}
        #checkoutConfirmModal .v18-pill{flex:1;padding:11px 12px;border-radius:11px;border:1px solid rgba(148,163,184,0.28);background:rgba(15,23,42,0.5);color:#cbd5e1;font-size:0.85rem;font-weight:600;cursor:pointer;transition:all .18s;font-family:inherit}
        #checkoutConfirmModal .v18-pill.on{border-color:#22C55E;background:rgba(34,197,94,0.14);color:#86EFAC;box-shadow:0 0 0 2px rgba(34,197,94,0.14)}
        #checkoutConfirmModal .v18-pill:focus-visible,#checkoutConfirmModal .v18-paycard:focus-visible{outline:2px solid #86efac;outline-offset:2px}
        #checkoutConfirmModal .v18-paycard{width:100%;display:flex;align-items:center;gap:12px;padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.2);background:rgba(7,18,13,0.45);cursor:pointer;font-family:inherit;color:#e2e8f0;text-align:left;transition:all .18s;margin-bottom:10px}
        #checkoutConfirmModal .v18-paycard:last-child{margin-bottom:0}
        #checkoutConfirmModal .v18-paycard.on{border-color:#4ade80;background:rgba(34,197,94,0.12);box-shadow:0 0 0 2px rgba(34,197,94,0.14)}
        #checkoutConfirmModal .v18-paycard strong{display:block;font-size:0.9rem;color:#f1f5f9;font-weight:700}
        #checkoutConfirmModal .v18-paycard small{display:block;color:#94a3b8;font-size:0.75rem;margin-top:2px}
        #checkoutConfirmModal .v18-payicon{width:38px;height:38px;border-radius:9px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.72rem;font-weight:800;flex-shrink:0}
        #checkoutConfirmModal .v18-tick{opacity:0;color:#22C55E;font-weight:800}
        #checkoutConfirmModal .v18-paycard.on .v18-tick{opacity:1}
        #checkoutConfirmModal #receiptUploadZone:hover{border-color:rgba(134,239,172,0.7)!important;background:rgba(34,197,94,0.08)!important}
        #checkoutConfirmModal #completeOrderBtn{border-radius:14px}
        @media(max-width:600px){#checkoutConfirmModal{padding:10px!important}#checkoutConfirmModal #checkoutModalContent>div:first-child{padding:18px 16px 14px!important}#checkoutConfirmModal #checkoutModalContent>div:nth-child(2){padding:14px 16px 18px!important;max-height:calc(100vh - 98px)!important}#checkoutConfirmModal .v18-card{padding:15px}}
        #checkoutConfirmModal .v18-input{width:100%;box-sizing:border-box;padding:11px 12px;background:rgba(15,23,42,0.6);border:1px solid rgba(148,163,184,0.28);border-radius:9px;color:#e2e8f0;font-size:0.9rem;font-family:inherit;outline:none;resize:vertical}
        #checkoutConfirmModal .v18-input:focus{border-color:#16A34A;box-shadow:0 0 0 3px rgba(22,163,74,0.16)}
        #checkoutConfirmModal .v18-input::placeholder{color:#64748b}
        #checkoutConfirmModal .v18-pill{flex:1;padding:10px 8px;border-radius:9px;border:1px solid rgba(148,163,184,0.28);background:rgba(15,23,42,0.5);color:#cbd5e1;font-size:0.85rem;font-weight:600;cursor:pointer;transition:all .18s;font-family:inherit}
        #checkoutConfirmModal .v18-pill.on{border-color:#22C55E;background:rgba(34,197,94,0.14);color:#86EFAC;box-shadow:0 0 0 2px rgba(34,197,94,0.14)}
        #checkoutConfirmModal .v18-paycard{width:100%;display:flex;align-items:center;gap:12px;padding:12px;border-radius:11px;border:1px solid rgba(148,163,184,0.28);background:rgba(15,23,42,0.5);cursor:pointer;font-family:inherit;color:#e2e8f0;text-align:left;transition:all .18s;margin-bottom:10px}
        #checkoutConfirmModal .v18-paycard:last-child{margin-bottom:0}
        #checkoutConfirmModal .v18-paycard.on{border-color:#22C55E;background:rgba(34,197,94,0.12);box-shadow:0 0 0 2px rgba(34,197,94,0.14)}
        #checkoutConfirmModal .v18-paycard strong{display:block;font-size:0.9rem;color:#f1f5f9;font-weight:700}
        #checkoutConfirmModal .v18-paycard small{display:block;color:#94a3b8;font-size:0.75rem;margin-top:2px}
        #checkoutConfirmModal .v18-payicon{width:38px;height:38px;border-radius:9px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.72rem;font-weight:800;flex-shrink:0}
        #checkoutConfirmModal .v18-tick{opacity:0;color:#22C55E;font-weight:800}
        #checkoutConfirmModal .v18-paycard.on .v18-tick{opacity:1}
        </style>
        <div id="checkoutModalContent" role="dialog" aria-modal="true" aria-labelledby="checkoutModalTitle" style="background:linear-gradient(145deg,#0f172a,#1e293b);border-radius:1.5rem;width:100%;max-width:560px;margin:auto;box-shadow:0 25px 60px rgba(0,0,0,0.5);border:1px solid rgba(99,102,241,0.2);">
            <div style="padding:24px 24px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(99,102,241,0.2);">
                <h2 id="checkoutModalTitle" style="color:#f1f5f9;font-size:1.25rem;font-weight:700;display:flex;align-items:center;gap:8px;margin:0;"><i class="icon-clipboard-check" style="color:#16A34A;"></i> Complete Your Order</h2>
                <button id="closeCheckoutModal" style="background:rgba(255,255,255,0.08);border:none;width:36px;height:36px;border-radius:50%;color:#94a3b8;cursor:pointer;font-size:1.1rem;display:flex;align-items:center;justify-content:center;"><i class="icon-x"></i></button>
            </div>
            <div style="padding:20px 24px;max-height:calc(100vh - 160px);overflow-y:auto;">

                <div class="v18-card">
                    <h3 class="v18-h"><i class="icon-truck"></i> Delivery Details</h3>
                    <div style="margin-bottom:12px;">
                        <label class="v18-label" for="v18Name">Full Name <span style="color:#ef4444;">*</span></label>
                        <input id="v18Name" class="v18-input" type="text" autocomplete="name" placeholder="e.g. Ada Obi" value="${escapeHtml(user.full_name || '')}">
                    </div>
                    <div style="margin-bottom:12px;">
                        <label class="v18-label" for="v18Location">Delivery Location <span style="color:#ef4444;">*</span></label>
                        <textarea id="v18Location" class="v18-input" rows="2" placeholder="House number, street, area, city">${escapeHtml(prefillAddress)}</textarea>
                    </div>
                    <label class="v18-label">Which number can we contact you on? <span style="color:#ef4444;">*</span></label>
                    <div style="display:flex;gap:8px;margin-bottom:12px;">
                        <button type="button" class="v18-pill on" data-channel="whatsapp">WhatsApp</button>
                        <button type="button" class="v18-pill" data-channel="telegram">Telegram</button>
                    </div>
                    <label class="v18-label" for="v18Phone" id="v18PhoneLabel">WhatsApp Number <span style="color:#ef4444;">*</span></label>
                    <input id="v18Phone" class="v18-input" type="tel" inputmode="tel" autocomplete="tel" placeholder="+234 801 234 5678" value="${escapeHtml(user.phone || '')}">
                    <p style="color:#94a3b8;font-size:0.75rem;margin:7px 0 0;">Enter the number linked to your selected WhatsApp or Telegram account. We’ll use it to confirm and deliver your order.</p>
                    <div style="margin-top:12px;">
                        <label class="v18-label" for="v18Email">Email Address <span style="color:#ef4444;">*</span></label>
                        <input id="v18Email" class="v18-input" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" value="${escapeHtml(user.email || '')}">
                        <p style="color:#94a3b8;font-size:0.75rem;margin:7px 0 0;">We’ll send your order confirmation and updates to this address.</p>
                    </div>
                </div>

                <div class="v18-card">
                    <h3 class="v18-h"><i class="icon-shopping-bag"></i> Order Summary</h3>
                    <div>${itemsHtml}</div>
                    <div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.1);">
                        <div style="display:flex;justify-content:space-between;font-size:0.85rem;color:#94a3b8;margin-bottom:4px;"><span>Subtotal</span><span>$${subtotal.toLocaleString()}</span></div>
                        <div style="display:flex;justify-content:space-between;font-size:0.85rem;color:#94a3b8;margin-bottom:4px;"><span>Delivery</span><span style="color:#86EFAC;">Free</span></div>
                        <div style="display:flex;justify-content:space-between;font-size:1.05rem;font-weight:700;color:#86EFAC;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.1);"><span>Total</span><span>$${grandTotal.toLocaleString()}</span></div>
                    </div>
                </div>

                <div class="v18-card">
                    <h3 class="v18-h"><i class="icon-credit-card"></i> Payment Method <span style="color:#ef4444;">*</span></h3>
                    <button type="button" class="v18-paycard on" data-pay="crypto">
                        <span class="v18-payicon" style="background:linear-gradient(135deg,#F7931A,#C46A00);">BTC</span>
                        <span style="flex:1;"><strong>Pay Now</strong><small>Pay with Bitcoin or USDT, then upload proof of payment</small></span>
                        <span class="v18-tick">&#10003;</span>
                    </button>
                    <button type="button" class="v18-paycard" data-pay="cash_on_delivery">
                        <span class="v18-payicon" style="background:linear-gradient(135deg,#15803D,#16A34A);"><i class="icon-banknote"></i></span>
                        <span style="flex:1;"><strong>Pay on Delivery</strong><small>Pay the courier when your order arrives</small></span>
                        <span class="v18-tick">&#10003;</span>
                    </button>
                </div>

                <div class="v18-card" id="v18CryptoBlock">
                    <h3 class="v18-h"><i class="icon-banknote"></i> Send Your Payment</h3>
                    <p style="color:#94a3b8;font-size:0.8rem;margin:0 0 12px;">Send the <strong style="color:#86EFAC;">Total</strong> in Bitcoin or USDT to the address below, then upload proof of payment.</p>
                    <label for="v16CoinSelect" style="color:#94a3b8;font-size:0.7rem;display:block;margin-bottom:4px;letter-spacing:0.04em;text-transform:uppercase;">Choose Coin</label>
                    <select id="v16CoinSelect" onchange="window.ZETRA_toggleCoinCard(this)" style="width:100%;padding:10px 12px;background:rgba(15,23,42,0.6);border:1px solid rgba(22,163,74,0.3);color:#e2e8f0;border-radius:8px;font-size:0.85rem;font-family:inherit;cursor:pointer;outline:none;">
                        <option value="btc">Bitcoin &mdash; BTC</option>
                        <option value="usdt">Tether &mdash; USDT</option>
                    </select>
                    <div id="v16BtcCard" style="display:block;margin-top:12px;background:linear-gradient(135deg,rgba(247,147,26,0.16),rgba(247,147,26,0.05));padding:14px;border-radius:10px;border-left:3px solid #F7931A;border-right:1px solid rgba(255,255,255,0.06);border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                            <div style="width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#F7931A,#C46A00);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:0.78rem;">BTC</div>
                            <div>
                                <div style="color:#f1f5f9;font-weight:600;font-size:0.9rem;">Bitcoin</div>
                                <div style="color:#94a3b8;font-size:0.7rem;"><span id="v16BtcNetwork">Bitcoin Mainnet</span></div>
                            </div>
                        </div>
                        <div style="color:#64748b;font-size:0.7rem;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:4px;">Wallet Address</div>
                        <div style="display:flex;align-items:stretch;gap:8px;">
                            <div id="v16BtcAddress" style="flex:1;background:rgba(0,0,0,0.32);padding:10px 12px;border-radius:8px;color:#fef3c7;font-weight:600;font-size:0.8rem;line-height:1.5;word-break:break-all;font-family:'SF Mono','Monaco','Cascadia Code','Roboto Mono',monospace;border:1px solid rgba(255,255,255,0.06);user-select:all;">Loading wallet&hellip;</div>
                            <button type="button" onclick="window.ZETRA_copyWallet('btc', this)" style="background:linear-gradient(135deg,#15803D,#16A34A);color:white;border:none;border-radius:8px;padding:10px 14px;font-weight:600;font-size:0.78rem;cursor:pointer;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;"><i class="icon-copy"></i> Copy</button>
                        </div>
                    </div>
                    <div id="v16UsdtCard" style="display:none;margin-top:12px;background:linear-gradient(135deg,rgba(38,161,123,0.16),rgba(38,161,123,0.05));padding:14px;border-radius:10px;border-left:3px solid #26A17B;border-right:1px solid rgba(255,255,255,0.06);border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                            <div style="width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#26A17B,#0F7A57);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:0.72rem;">USDT</div>
                            <div>
                                <div style="color:#f1f5f9;font-weight:600;font-size:0.9rem;">Tether</div>
                                <div style="color:#94a3b8;font-size:0.7rem;">Network: <span id="v16UsdtNetwork">TRC20</span></div>
                            </div>
                        </div>
                        <div style="color:#64748b;font-size:0.7rem;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:4px;">Wallet Address</div>
                        <div style="display:flex;align-items:stretch;gap:8px;">
                            <div id="v16UsdtAddress" style="flex:1;background:rgba(0,0,0,0.32);padding:10px 12px;border-radius:8px;color:#fef3c7;font-weight:600;font-size:0.8rem;line-height:1.5;word-break:break-all;font-family:'SF Mono','Monaco','Cascadia Code','Roboto Mono',monospace;border:1px solid rgba(255,255,255,0.06);user-select:all;">Loading wallet&hellip;</div>
                            <button type="button" onclick="window.ZETRA_copyWallet('usdt', this)" style="background:linear-gradient(135deg,#15803D,#16A34A);color:white;border:none;border-radius:8px;padding:10px 14px;font-weight:600;font-size:0.78rem;cursor:pointer;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;"><i class="icon-copy"></i> Copy</button>
                        </div>
                    </div>
                    <p style="color:#94a3b8;font-size:0.72rem;margin:10px 0 0;">Send the exact amount on the network shown. Crypto payments are verified manually, usually within a few hours.</p>
                </div>

                <div class="v18-card" id="v18ReceiptBlock">
                    <h3 class="v18-h"><i class="icon-receipt"></i> Upload Proof of Payment <span style="color:#ef4444;">*</span></h3>
                    <p style="color:#94a3b8;font-size:0.8rem;margin:0 0 12px;">Upload a confirmation screenshot or photo from your crypto app (JPG, PNG, WebP or PDF, max 5MB).</p>
                    <div id="receiptUploadZone" style="border:2px dashed rgba(99,102,241,0.3);border-radius:12px;padding:24px;text-align:center;cursor:pointer;transition:all 0.25s;background:rgba(99,102,241,0.04);position:relative;">
                        <input type="file" id="receiptFileInput" accept="image/jpeg,image/png,image/webp,application/pdf" style="position:absolute;top:0;left:0;width:100%;height:100%;opacity:0;cursor:pointer;">
                        <div id="receiptUploadContent">
                            <i class="icon-cloud-upload" style="font-size:2rem;color:#16A34A;margin-bottom:8px;"></i>
                            <p style="color:#e2e8f0;font-weight:500;font-size:0.9rem;">Drop proof of payment here or click to browse</p>
                            <p style="color:#94a3b8;font-size:0.75rem;margin-top:4px;">Confirmation screenshot or image · JPG, PNG, WebP or PDF · Max 5MB</p>
                        </div>
                        <div id="receiptPreview" style="display:none;">
                            <img id="receiptPreviewImg" style="max-width:200px;max-height:150px;border-radius:8px;object-fit:cover;margin-bottom:8px;" alt="Receipt preview">
                            <div id="receiptFileName" style="color:#e2e8f0;font-size:0.85rem;font-weight:500;"></div>
                            <button type="button" id="removeReceiptBtn" style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3);padding:4px 12px;border-radius:6px;font-size:0.75rem;cursor:pointer;margin-top:8px;"><i class="icon-trash-2"></i> Remove</button>
                        </div>
                    </div>
                    <div id="receiptError" style="display:none;color:#f87171;font-size:0.8rem;margin-top:8px;"></div>
                </div>

                <div class="v18-card">
                    <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;">
                        <input type="checkbox" id="termsCheckbox" style="width:18px;height:18px;margin-top:2px;accent-color:#15803D;cursor:pointer;flex-shrink:0;">
                        <span style="color:#cbd5e1;font-size:0.85rem;">I agree to the <a href="#" style="color:#16A34A;text-decoration:underline;" onclick="event.preventDefault();event.stopPropagation();">Terms and Conditions</a> of IndiaMedCare and confirm that my delivery details are correct. <span style="color:#ef4444;">*</span></span>
                    </label>
                </div>

                <button id="completeOrderBtn" disabled style="width:100%;padding:14px;background:linear-gradient(135deg,#4b5563,#374151);color:#6b7280;border:none;border-radius:12px;font-weight:700;font-size:1rem;cursor:not-allowed;transition:all 0.3s;display:flex;align-items:center;justify-content:center;gap:8px;">
                    <i class="icon-lock"></i> Place Order
                </button>
                <p id="checkoutValidationMsg" style="color:#f87171;font-size:0.8rem;text-align:center;margin-top:8px;">Please complete your delivery details and agree to the Terms &amp; Conditions.</p>
            </div>
        </div>
        `;
        document.body.appendChild(modal);
        if (window.ZETRA_applyWallets) window.ZETRA_applyWallets();

        let selectedReceiptFile = null;
        let payMethod = 'crypto';
        let contactChannel = 'whatsapp';

        const nameInput = document.getElementById('v18Name');
        const locationInput = document.getElementById('v18Location');
        const phoneInput = document.getElementById('v18Phone');
        const phoneLabel = document.getElementById('v18PhoneLabel');
        const emailInput = document.getElementById('v18Email');
        const cryptoBlock = document.getElementById('v18CryptoBlock');
        const receiptBlock = document.getElementById('v18ReceiptBlock');
        const fileInput = document.getElementById('receiptFileInput');
        const uploadZone = document.getElementById('receiptUploadZone');
        const uploadContent = document.getElementById('receiptUploadContent');
        const preview = document.getElementById('receiptPreview');
        const previewImg = document.getElementById('receiptPreviewImg');
        const fileNameEl = document.getElementById('receiptFileName');
        const removeBtn = document.getElementById('removeReceiptBtn');
        const receiptError = document.getElementById('receiptError');
        const termsCheckbox = document.getElementById('termsCheckbox');
        const completeBtn = document.getElementById('completeOrderBtn');
        const validationMsg = document.getElementById('checkoutValidationMsg');
        const closeBtn = document.getElementById('closeCheckoutModal');

        function missingFields() {
            const missing = [];
            if ((nameInput.value || '').trim().length < 2) missing.push('your full name');
            if ((locationInput.value || '').trim().length < 5) missing.push('your delivery location');
            if (String(phoneInput.value || '').replace(/\D/g, '').length < 7) {
                missing.push('a working ' + (contactChannel === 'telegram' ? 'Telegram' : 'WhatsApp') + ' number');
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(emailInput.value || '').trim())) {
                missing.push('a valid email address');
            }
            if (payMethod === 'crypto' && !selectedReceiptFile) missing.push('proof of payment');
            if (!termsCheckbox.checked) missing.push('agreeing to the Terms & Conditions');
            return missing;
        }

        function validateForm() {
            const missing = missingFields();
            const ready = missing.length === 0;
            completeBtn.disabled = !ready;
            if (ready) {
                completeBtn.style.background = 'linear-gradient(135deg,#15803D,#4f46e5)';
                completeBtn.style.color = 'white';
                completeBtn.style.cursor = 'pointer';
                completeBtn.style.boxShadow = '0 0 20px rgba(99,102,241,0.3)';
                validationMsg.style.display = 'none';
            } else {
                completeBtn.style.background = 'linear-gradient(135deg,#4b5563,#374151)';
                completeBtn.style.color = '#6b7280';
                completeBtn.style.cursor = 'not-allowed';
                completeBtn.style.boxShadow = 'none';
                validationMsg.textContent = 'Please add ' + missing.join(', ') + '.';
                validationMsg.style.display = 'block';
            }
        }

        function setPayMethod(method) {
            payMethod = method;
            modal.querySelectorAll('.v18-paycard').forEach(function (b) {
                b.classList.toggle('on', b.getAttribute('data-pay') === method);
            });
            const isCrypto = method === 'crypto';
            cryptoBlock.style.display = isCrypto ? 'block' : 'none';
            receiptBlock.style.display = isCrypto ? 'block' : 'none';
            validateForm();
        }

        function setChannel(channel) {
            contactChannel = channel;
            modal.querySelectorAll('[data-channel]').forEach(function (b) {
                b.classList.toggle('on', b.getAttribute('data-channel') === channel);
            });
            phoneLabel.innerHTML = (channel === 'telegram' ? 'Your Telegram Number' : 'Your WhatsApp Number') + ' <span style="color:#ef4444;">*</span>';
            phoneInput.placeholder = channel === 'telegram' ? '+234 801 234 5678 (Telegram)' : '+234 801 234 5678';
            validateForm();
        }

        modal.querySelectorAll('.v18-paycard').forEach(function (b) {
            b.addEventListener('click', function () { setPayMethod(b.getAttribute('data-pay')); });
        });
        modal.querySelectorAll('[data-channel]').forEach(function (b) {
            b.addEventListener('click', function () { setChannel(b.getAttribute('data-channel')); });
        });

        function handleFile(file) {
            receiptError.style.display = 'none';
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                receiptError.textContent = 'File is too large. Maximum size is 5MB.';
                receiptError.style.display = 'block';
                return;
            }
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                receiptError.textContent = 'Invalid file type. Only JPG, PNG, WebP or PDF files are allowed.';
                receiptError.style.display = 'block';
                return;
            }
            selectedReceiptFile = file;
            fileNameEl.textContent = file.name;
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    previewImg.src = e.target.result;
                    previewImg.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                previewImg.style.display = 'none';
                fileNameEl.innerHTML = '<i class="icon-file-text" style="color:#ef4444;font-size:2rem;margin-bottom:8px;display:block;"></i>' + escapeHtml(file.name);
            }
            uploadContent.style.display = 'none';
            preview.style.display = 'block';
            uploadZone.style.borderColor = 'rgba(34,197,94,0.5)';
            uploadZone.style.background = 'rgba(34,197,94,0.05)';
            validateForm();
        }

        fileInput.addEventListener('change', function () {
            if (this.files && this.files[0]) handleFile(this.files[0]);
        });

        uploadZone.addEventListener('dragover', function (e) {
            e.preventDefault();
            this.style.borderColor = 'rgba(99,102,241,0.6)';
            this.style.background = 'rgba(99,102,241,0.08)';
        });
        uploadZone.addEventListener('dragleave', function () {
            if (!selectedReceiptFile) {
                this.style.borderColor = 'rgba(99,102,241,0.3)';
                this.style.background = 'rgba(99,102,241,0.04)';
            }
        });
        uploadZone.addEventListener('drop', function (e) {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
        });

        removeBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            selectedReceiptFile = null;
            fileInput.value = '';
            uploadContent.style.display = 'block';
            preview.style.display = 'none';
            previewImg.style.display = 'none';
            uploadZone.style.borderColor = 'rgba(99,102,241,0.3)';
            uploadZone.style.background = 'rgba(99,102,241,0.04)';
            validateForm();
        });

        termsCheckbox.addEventListener('change', validateForm);
        nameInput.addEventListener('input', validateForm);
        locationInput.addEventListener('input', validateForm);
        phoneInput.addEventListener('input', validateForm);
        emailInput.addEventListener('input', validateForm);

        closeBtn.addEventListener('click', function () {
            modal.remove();
        });
        modal.addEventListener('click', function (e) {
            if (e.target === modal) modal.remove();
        });

        completeBtn.addEventListener('click', async function () {
            if (completeBtn.disabled || isProcessingCheckout) return;
            isProcessingCheckout = true;
            completeBtn.disabled = true;
            completeBtn.innerHTML = '<i class="icon-loader"></i> Processing...';
            completeBtn.style.background = 'linear-gradient(135deg,#4b5563,#374151)';
            completeBtn.style.color = '#94a3b8';

            try {
                const tempId = 'order_' + Date.now();
                const name = (nameInput.value || '').trim();
                const location = (locationInput.value || '').trim();
                const phone = (phoneInput.value || '').trim();
                const email = (emailInput.value || '').trim().toLowerCase();
                let receiptUrl = null;

                if (payMethod === 'crypto' && selectedReceiptFile) {
                    try {
                        receiptUrl = await uploadReceiptToStorage(selectedReceiptFile, tempId);
                    } catch (uploadError) {
                        console.error('Payment receipt upload failed; continuing without attachment:', uploadError);
                        showNotification(
                            'Your order can still be placed, but proof could not be attached. Please send it via ' + (contactChannel === 'telegram' ? 'Telegram' : 'WhatsApp') + ' after checkout.',
                            'warning'
                        );
                    }
                }

                const checkoutData = {
                    user_id: user.id || null,
                    email: email || user.email || '',
                    full_name: name,
                    phone: (contactChannel === 'telegram' ? 'Telegram: ' : 'WhatsApp: ') + phone,
                    address: location,
                    city: '',
                    state: '',
                    contact_method: contactChannel,
                    notes: '',
                    receipt_url: receiptUrl
                };

                const order = await createOrder(checkoutData, cart, payMethod);
                if (order) {
                    modal.remove();
                    closeCart();
                    window.location.href = 'invoice.html?order=' + order.order_number;
                } else {
                    completeBtn.disabled = false;
                    completeBtn.innerHTML = '<i class="icon-lock"></i> Place Order';
                    validateForm();
                }
            } catch (error) {
                console.error('Checkout error:', error);
                showNotification('Checkout failed: ' + error.message, 'error');
                completeBtn.disabled = false;
                completeBtn.innerHTML = '<i class="icon-lock"></i> Place Order';
                validateForm();
            } finally {
                isProcessingCheckout = false;
            }
        });

        setPayMethod('crypto');
        setChannel('whatsapp');
    }
    
    // ====================
    // ORDER CREATION
    // ====================
    async function createOrder(orderData, cart, paymentMethod) {
        const supabase = getSupabaseClient();
        if (!supabase) {
            showNotification('Database connection error', 'error');
            return null;
        }
        
        try {
            const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
            // Shipping removed per user direction (no shipping fee added anywhere).
            // grand_total == subtotal; shipping_fee == 0; invoice total stays consistent.
            const shippingFee = 0;
            const grandTotal = subtotal;
            
            const orderNumber = await getNextOrderNumber();
            
            const items = cart.map(item => ({
                product_id: item.product_id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                color_name: item.color_name,
                size_value: item.size_value,
                size_id:  item.size_id  || null,
                color_id: item.color_id || null,
                image_url: item.image_url
            }));
            
            const orderInsert = {
                order_number: orderNumber,
                user_id: orderData.user_id || null,
                user_name: orderData.full_name,
                user_email: orderData.email,
                user_phone: orderData.phone,
                full_name: orderData.full_name,
                shipping_address: orderData.address,
                city: orderData.city,
                state: orderData.state,
                total_amount: subtotal,
                shipping_fee: shippingFee,
                grand_total: grandTotal,
                status: 'pending',
                payment_status: 'pending',
                payment_method: paymentMethod || 'crypto',
                items: items,
                receipt_url: orderData.receipt_url || null,
                receipt_uploaded_at: orderData.receipt_url ? new Date().toISOString() : null,
                created_at: new Date().toISOString()
            };
            
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert(orderInsert)
                .select()
                .single();
            
            if (orderError) {
                console.error('Order error:', orderError);
                showNotification(`Order failed: ${orderError.message}`, 'error');
                return null;
            }
            
            // --- Stock decrement (best-effort, race-safe) ----------------------
            // The order is already paid and persisted; failure here does NOT void
            // the order. We surface failures via notifications and log so an admin
            // can reconcile stock manually if a race or transient error occurs.
            try {
                const stockResult = await decrementStockForOrder(cart);
                if (stockResult.failed.length > 0) {
                    console.warn('⚠️ Stock reconciliation needed for:', stockResult.failed);
                    const list = stockResult.failed.slice(0, 3).map(f =>
                        f.kind === 'size'
                            ? `${f.name || 'Variant'} (size_id ${f.size_id})`
                            : `${f.name || 'Product'} (id ${f.product_id})`
                    ).join(', ');
                    showNotification(
                        `Order ${orderNumber} placed, but stock didn't update for: ${list}. Admin will reconcile.`,
                        'warning'
                    );
                }
                // Refresh in-page product caches so availability reflects reality
                // right away if the user keeps browsing.
                applyStockResultsToCache(stockResult);
            } catch (stockErr) {
                console.error('Stock decrement crashed (order still valid):', stockErr);
                showNotification(
                    `Order ${orderNumber} placed. Stock sync failed (will be reconciled).`,
                    'warning'
                );
            }
            // --------------------------------------------------------------------
            
            localStorage.removeItem('zetra_cart');
            updateCartUI();
            showNotification(`Order ${orderNumber} placed successfully!`, 'success');
            return order;
            
        } catch (error) {
            console.error('Order creation error:', error);
            showNotification(`Failed to place order: ${error.message}`, 'error');
            return null;
        }
    }
    
    // ====================
    // STOCK DECREMENT (post-order, race-safe)
    // ====================
    // Decrements inventory for each cart line using Supabase UPDATEs whose
    // WHERE clauses guard against oversell. Because the REST API has no
    // transactional guarantees, we treat the order as the source of truth and
    // log/notify on any per-line failure so ops can reconcile.
    //
    // Branch table:
    //   * Footwear variant  (cartItem.size_id present):
    //       UPDATE product_sizes SET stock_quantity = stock_quantity - qty
    //         WHERE id = size_id AND color_id = color_id AND stock_quantity >= qty
    //       UPDATE products      SET stock          = stock          - qty
    //         WHERE id = product_id AND stock >= qty
    //     (Products.stock is decremented too so listing-card availability
    //      stays in sync with the sum of variant-level stock — the parent
    //      stock is treated as authoritative for non-variant listings.)
    //   * Non-footwear (no size_id):
    //       UPDATE products SET stock = stock - qty WHERE id = product_id AND stock >= qty
    //
    // Returns { ok:boolean, decremented:[], failed:[] } describing each cart
    // line. Each failed entry includes { kind:'size'|'product', product_id,
    // size_id, requested, reason } so the caller can build a clean notification.
    async function decrementStockForOrder(cartItems) {
        const supabase = getSupabaseClient();
        const result = { ok: true, decremented: [], failed: [] };
        if (!supabase) {
            result.ok = false;
            result.failed = (cartItems || []).map(it => ({
                kind: it.size_id != null ? 'size' : 'product',
                product_id: it.product_id, size_id: it.size_id,
                requested: it.quantity || 0, reason: 'no_database_connection'
            }));
            return result;
        }
        if (!Array.isArray(cartItems) || cartItems.length === 0) return result;
        
        // Snapshot the interested (product_id, size_id) pairs once so we can
        // refresh the local product cache for any product touched by the order.
        const productIdsToRefresh = new Set();
        const sizeIdsToRefresh = new Set();
        
        const tasks = cartItems.map(async (item) => {
            const productId = parseInt(item.product_id, 10);
            const qty = Math.max(0, parseInt(item.quantity, 10) || 0);
            if (!Number.isFinite(productId) || qty <= 0) {
                result.failed.push({
                    kind: item.size_id != null ? 'size' : 'product',
                    product_id: item.product_id, size_id: item.size_id,
                    requested: qty, reason: 'invalid_input'
                });
                return;
            }
            
            productIdsToRefresh.add(productId);
            
            const isVariant = item.size_id != null && item.color_id != null;
            
            // ---- VARIANT branch (footwear: size + color) ----
            if (isVariant) {
                const sizeId  = parseInt(item.size_id, 10);
                const colorId = parseInt(item.color_id, 10);
                sizeIdsToRefresh.add(sizeId);
                
                let newSizeStock = null;
                try {
                    // Try RPC first if the admin created one. Otherwise the
                    // read-modify-write path below handles it.
                    const { data: rpcData, error: rpcErr } = await supabase.rpc(
                        'decrement_product_size_stock',
                        { p_size_id: sizeId, p_color_id: colorId, p_qty: qty }
                    ).maybeSingle();
                    if (!rpcErr && rpcData && typeof rpcData.new_stock === 'number') {
                        newSizeStock = rpcData.new_stock;
                    }
                } catch (_) { /* RPC missing -> fall through */ }
                
                if (newSizeStock === null) {
                    // Read-modify-write fallback. This is racy in theory but
                    // the WHERE guard `gte(stock_quantity, qty)` plus an extra
                    // abort on overflow keeps us safe in practice.
                    try {
                        const { data: row, error: readErr } = await supabase
                            .from('product_sizes')
                            .select('id, stock_quantity')
                            .eq('id', sizeId)
                            .eq('color_id', colorId)
                            .maybeSingle();
                        if (readErr) throw readErr;
                        if (!row) {
                            result.failed.push({
                                kind: 'size', product_id: productId,
                                size_id: sizeId, requested: qty,
                                name: item.name, reason: 'size_row_not_found'
                            });
                            return;
                        }
                        if ((row.stock_quantity || 0) < qty) {
                            result.failed.push({
                                kind: 'size', product_id: productId,
                                size_id: sizeId, requested: qty,
                                name: item.name, reason: 'insufficient_stock_at_checkout'
                            });
                            return;
                        }
                        const target = (row.stock_quantity || 0) - qty;
                        const { data: upd, error: updErr } = await supabase
                            .from('product_sizes')
                            .update({ stock_quantity: target })
                            .eq('id', sizeId)
                            .eq('color_id', colorId)
                            .gte('stock_quantity', qty)
                            .select('id, stock_quantity')
                            .maybeSingle();
                        if (updErr) throw updErr;
                        if (!upd) {
                            // Lost a race between read and write.
                            result.failed.push({
                                kind: 'size', product_id: productId,
                                size_id: sizeId, requested: qty,
                                name: item.name, reason: 'lost_race'
                            });
                            return;
                        }
                        newSizeStock = upd.stock_quantity;
                    } catch (err) {
                        result.failed.push({
                            kind: 'size', product_id: productId,
                            size_id: sizeId, requested: qty,
                            name: item.name, reason: 'fallback_error:' + (err && err.message ? err.message : 'unknown')
                        });
                        return;
                    }
                }
                
                // Now mirror onto the parent products.stock so the listing
                // cards (which read products.stock) reflect reality.
                try {
                    const { data: prodRow, error: prodReadErr } = await supabase
                        .from('products')
                        .select('id, stock')
                        .eq('id', productId)
                        .maybeSingle();
                    if (!prodReadErr && prodRow) {
                        const target = Math.max(0, (prodRow.stock || 0) - qty);
                        await supabase
                            .from('products')
                            .update({ stock: target })
                            .eq('id', productId)
                            .gte('stock', qty);
                    }
                } catch (err) {
                    // The variant-level decrement succeeded; parent-stock mirror
                    // is best-effort and surfaced only as a soft warning.
                    console.warn('Parent products.stock mirror failed for product', productId, err);
                }
                
                result.decremented.push({
                    kind: 'size', product_id: productId, size_id: sizeId,
                    quantity: qty, new_size_stock: newSizeStock,
                    name: item.name
                });
                return;
            }
            
            // ---- NON-VARIANT branch (everything else) ----
            try {
                const { data: row, error: readErr } = await supabase
                    .from('products')
                    .select('id, stock')
                    .eq('id', productId)
                    .maybeSingle();
                if (readErr) throw readErr;
                if (!row) {
                    result.failed.push({
                        kind: 'product', product_id: productId,
                        requested: qty, name: item.name,
                        reason: 'product_row_not_found'
                    });
                    return;
                }
                if ((row.stock || 0) < qty) {
                    result.failed.push({
                        kind: 'product', product_id: productId,
                        requested: qty, name: item.name,
                        reason: 'insufficient_stock_at_checkout'
                    });
                    return;
                }
                const target = (row.stock || 0) - qty;
                const { data: upd, error: updErr } = await supabase
                    .from('products')
                    .update({ stock: target })
                    .eq('id', productId)
                    .gte('stock', qty)
                    .select('id, stock')
                    .maybeSingle();
                if (updErr) throw updErr;
                if (!upd) {
                    result.failed.push({
                        kind: 'product', product_id: productId,
                        requested: qty, name: item.name,
                        reason: 'lost_race'
                    });
                    return;
                }
                result.decremented.push({
                    kind: 'product', product_id: productId,
                    quantity: qty, new_stock: upd.stock,
                    name: item.name
                });
            } catch (err) {
                result.failed.push({
                    kind: 'product', product_id: productId,
                    requested: qty, name: item.name,
                    reason: 'fallback_error:' + (err && err.message ? err.message : 'unknown')
                });
            }
        });
        
        const settled = await Promise.allSettled(tasks);
        // Any individual task that threw (not handled internally) is recorded.
        settled.forEach((s, i) => {
            if (s.status === 'rejected') {
                const it = cartItems[i] || {};
                result.failed.push({
                    kind: it.size_id != null ? 'size' : 'product',
                    product_id: it.product_id, size_id: it.size_id,
                    requested: it.quantity, name: it.name,
                    reason: 'unhandled:' + (s.reason && s.reason.message ? s.reason.message : 'unknown')
                });
            }
        });
        
        result.ok = result.failed.length === 0;
        // Stash so a future refresh / diagnostics call can inspect it.
        window.__lastStockDecrementResult = {
            when: Date.now(),
            product_ids: Array.from(productIdsToRefresh),
            size_ids:    Array.from(sizeIdsToRefresh),
            decremented: result.decremented,
            failed:      result.failed
        };
        return result;
    }
    
    // Mirrors the latest decremented stock into the in-page caches so that the
    // very next render uses fresh numbers without an extra round-trip.
    function applyStockResultsToCache(stockResult) {
        if (!stockResult || !Array.isArray(stockResult.decremented)) return;
        
        // Update in-memory product list cache (used for wishlist / quick-add).
        if (Array.isArray(window.ZETRA_PRODUCTS_CACHE)) {
            for (const d of stockResult.decremented) {
                const hit = window.ZETRA_PRODUCTS_CACHE.find(p => p.id === d.product_id);
                if (hit && typeof d.new_stock === 'number' && d.kind === 'product') {
                    hit.stock = d.new_stock;
                }
            }
        }
        // Update the single-product detail if open.
        try {
            if (typeof currentProduct !== 'undefined' && currentProduct && currentProduct.id) {
                const d = stockResult.decremented.find(x => x.product_id === currentProduct.id && x.kind === 'product');
                if (d && typeof d.new_stock === 'number') {
                    currentProduct.stock = d.new_stock;
                    // Repaint the stock badge if a product viewer is on screen.
                    const stockEl = document.querySelector('.stock-status .stock-text, .stock-status span');
                    if (stockEl && d.new_stock <= 0) {
                        stockEl.textContent = 'Out of Stock';
                    }
                }
            }
        } catch (_) { /* currentProduct scoping guards */ }
    }
    
    async function getOrderByNumber(orderNumber) {
        const supabase = getSupabaseClient();
        if (!supabase) {
            console.error('Database connection unavailable for order lookup');
            return null;
        }
        try {
            const { data: order, error } = await supabase
                .from('orders')
                .select('*')
                .eq('order_number', orderNumber)
                .maybeSingle();
            
            if (error) throw error;
            return order;
        } catch (error) {
            console.error('Order fetch error:', error);
            return null;
        }
    }
    
    // ====================
    // PROCEED TO CHECKOUT
    // ====================
        function proceedToCheckout() {
        const cart = getCart();
        if (cart.length === 0) {
            showNotification('Your cart is empty', 'warning');
            return;
        }

        // v18: guest checkout. Name, delivery location and a WhatsApp/Telegram
        // number are collected inside the checkout modal, so there is no
        // account or saved-address gate here anymore.
        try {
            if (typeof showCheckoutModal === 'function') {
                showCheckoutModal();
                return;
            }
        } catch (_e) { /* fall through to the legacy page */ }

        window.location.href = 'checkout.html';
    }
    
    // ====================
    // HEADER FUNCTIONS
    // ====================
    function setupHeaderInteractions() {
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon && !cartIcon._cartListener) {
            cartIcon._cartListener = true;
            cartIcon.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
        }
        
        const wishlistIcon = document.getElementById('wishlistIcon');
        if (wishlistIcon && !wishlistIcon._wishlistListener) {
            wishlistIcon._wishlistListener = true;
            wishlistIcon.addEventListener('click', () => showNotification('Wishlist coming soon', 'info'));
        }
        
        const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');
        if (cartCheckoutBtn && !cartCheckoutBtn._checkoutListener) {
            cartCheckoutBtn._checkoutListener = true;
            cartCheckoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                closeCart();
                proceedToCheckout();
            });
        }
        
        const closeCartBtn = document.getElementById('closeCartBtn');
        if (closeCartBtn && !closeCartBtn._closeListener) {
            closeCartBtn._closeListener = true;
            closeCartBtn.addEventListener('click', closeCart);
        }
        
        const cartOverlay = document.getElementById('cartOverlay');
        if (cartOverlay && !cartOverlay._overlayListener) {
            cartOverlay._overlayListener = true;
            cartOverlay.addEventListener('click', closeCart);
        }
        
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });
    }
    
    // ================================================================
    // ===== SUPABASE ADS & HERO BANNER FUNCTIONS =====
    // ================================================================
    
    // Upload image to Supabase Storage (used by admin, but keep here if needed)
    async function uploadAdImage(file, folder = 'ads') {
        const supabase = getSupabaseClient();
        if (!supabase) {
            showNotification('Database connection error', 'error');
            return null;
        }
        // Validate
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            showNotification('File too large (max 5MB)', 'error');
            return null;
        }
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.type)) {
            showNotification('Invalid file type', 'error');
            return null;
        }
        try {
            const ext = file.name.split('.').pop().toLowerCase();
            const ts = Date.now();
            const rand = Math.random().toString(36).substring(2, 8);
            const fileName = `${folder}/${ts}_${rand}.${ext}`;
            const { data, error } = await supabase.storage
                .from('ad-images')
                .upload(fileName, file, { cacheControl: '3600', upsert: false });
            if (error) throw error;
            const { data: urlData } = supabase.storage.from('ad-images').getPublicUrl(fileName);
            return urlData.publicUrl;
        } catch (e) {
            console.error('Upload error:', e);
            showNotification('Upload failed: ' + e.message, 'error');
            return null;
        }
    }
    
    // Save ad to Supabase (for admin usage)
    async function saveAdToSupabase(adData) {
        const supabase = getSupabaseClient();
        if (!supabase) {
            showNotification('Database connection error', 'error');
            return null;
        }
        try {
            let result;
            if (adData.id) {
                const { data, error } = await supabase
                    .from('ads')
                    .update({
                        name: adData.name,
                        image_url: adData.image_url,
                        link_url: adData.link_url || null,
                        target_page: adData.target_page || 'all',
                        placement: adData.placement || 'after-hero',
                        image_size: adData.image_size || 'auto',
                        custom_width: adData.custom_width || null,
                        custom_height: adData.custom_height || null,
                        is_active: adData.is_active !== undefined ? adData.is_active : true,
                        start_date: adData.start_date || null,
                        end_date: adData.end_date || null,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', adData.id)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
            } else {
                const { data, error } = await supabase
                    .from('ads')
                    .insert({
                        name: adData.name,
                        image_url: adData.image_url,
                        link_url: adData.link_url || null,
                        target_page: adData.target_page || 'all',
                        placement: adData.placement || 'after-hero',
                        image_size: adData.image_size || 'auto',
                        custom_width: adData.custom_width || null,
                        custom_height: adData.custom_height || null,
                        is_active: adData.is_active !== undefined ? adData.is_active : true,
                        start_date: adData.start_date || null,
                        end_date: adData.end_date || null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();
                if (error) throw error;
                result = data;
            }
            showNotification('Ad saved successfully!', 'success');
            return result;
        } catch (e) {
            console.error('Save ad error:', e);
            showNotification('Failed to save ad: ' + e.message, 'error');
            return null;
        }
    }
    
    // Delete ad from Supabase
    async function deleteAdFromSupabase(adId) {
        const supabase = getSupabaseClient();
        if (!supabase) {
            showNotification('Database connection error', 'error');
            return false;
        }
        try {
            // Get image URL to delete from storage
            const { data: ad, error: fetchError } = await supabase
                .from('ads')
                .select('image_url')
                .eq('id', adId)
                .single();
            if (!fetchError && ad && ad.image_url) {
                const urlParts = ad.image_url.split('/');
                const fileName = urlParts.slice(urlParts.indexOf('ad-images') + 1).join('/');
                if (fileName) {
                    await supabase.storage.from('ad-images').remove([fileName]);
                }
            }
            const { error } = await supabase.from('ads').delete().eq('id', adId);
            if (error) throw error;
            showNotification('Ad deleted', 'success');
            return true;
        } catch (e) {
            console.error('Delete ad error:', e);
            showNotification('Failed to delete ad: ' + e.message, 'error');
            return false;
        }
    }
    
    // Save hero banner to Supabase
    async function saveHeroBannerToSupabase(bannerData) {
        const supabase = getSupabaseClient();
        if (!supabase) {
            showNotification('Database connection error', 'error');
            return null;
        }
        try {
            let result;
            if (bannerData.id) {
                const { data, error } = await supabase
                    .from('hero_banners')
                    .update({
                        title: bannerData.title,
                        subtitle: bannerData.subtitle || '',
                        image_url: bannerData.image_url,
                        link: bannerData.link || null,
                        target_page: bannerData.target_page || 'all',
                        is_active: bannerData.is_active !== undefined ? bannerData.is_active : true,
                        sort_order: bannerData.sort_order || 0,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', bannerData.id)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
            } else {
                const { data, error } = await supabase
                    .from('hero_banners')
                    .insert({
                        title: bannerData.title,
                        subtitle: bannerData.subtitle || '',
                        image_url: bannerData.image_url,
                        link: bannerData.link || null,
                        target_page: bannerData.target_page || 'all',
                        is_active: bannerData.is_active !== undefined ? bannerData.is_active : true,
                        sort_order: bannerData.sort_order || 0,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();
                if (error) throw error;
                result = data;
            }
            showNotification('Hero banner saved', 'success');
            return result;
        } catch (e) {
            console.error('Save hero banner error:', e);
            showNotification('Failed to save hero banner: ' + e.message, 'error');
            return null;
        }
    }
    
    // Delete hero banner from Supabase
    async function deleteHeroBannerFromSupabase(bannerId) {
        const supabase = getSupabaseClient();
        if (!supabase) {
            showNotification('Database connection error', 'error');
            return false;
        }
        try {
            const { data: banner, error: fetchError } = await supabase
                .from('hero_banners')
                .select('image_url')
                .eq('id', bannerId)
                .single();
            if (!fetchError && banner && banner.image_url) {
                const urlParts = banner.image_url.split('/');
                const fileName = urlParts.slice(urlParts.indexOf('ad-images') + 1).join('/');
                if (fileName) {
                    await supabase.storage.from('ad-images').remove([fileName]);
                }
            }
            const { error } = await supabase.from('hero_banners').delete().eq('id', bannerId);
            if (error) throw error;
            showNotification('Hero banner deleted', 'success');
            return true;
        } catch (e) {
            console.error('Delete hero banner error:', e);
            showNotification('Failed to delete hero banner: ' + e.message, 'error');
            return false;
        }
    }
    
    // ================================================================
    // ===== FIX: RENDER ADS FROM SUPABASE =====
    // ================================================================
    async function renderAdsFromSupabase(pageSlug) {
        const supabase = getSupabaseClient();
        if (!supabase) return;
        
        console.log(`📢 Rendering ads for page: ${pageSlug}`);
        
        try {
            // Fetch all active ads, then filter client-side.
            // (Supabase-js .or() calls on the same table overwrite each other, so
            // combining target_page and date range in PostgREST is unreliable. Client-side
            // filtering on a small set of active ads is simpler and safer.)
            const { data: allAds, error } = await supabase
                .from('ads')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            const now = Date.now();
            const ads = (allAds || []).filter(a => {
                if (a.target_page && a.target_page !== 'all' && a.target_page !== pageSlug) return false;
                if (a.start_date && new Date(a.start_date).getTime() > now) return false;
                if (a.end_date && new Date(a.end_date).getTime() < now) return false;
                return true;
            });
            
            console.log(`📢 Found ${ads.length} active ads for page ${pageSlug} (from ${(allAds || []).length} total active)`);
            
            // Render promos in their zones.
            // IMPORTANT: Map placement -> DOM id explicitly. The previous code
            // used zone.charAt(0).toUpperCase() + slice(1).replace('-','') which
            // produced ids like 'adZoneAfterhero' (lowercase 'h'), so the lookups
            // never resolved and promos never appeared on destination pages.
            const zones = [
                { placement: 'after-hero',        elId: 'adZoneAfterHero' },
                { placement: 'between-sections',  elId: 'adZoneBetweenSections' },
                { placement: 'before-footer',     elId: 'adZoneBeforeFooter' },
                { placement: 'sidebar',           elId: 'adZoneSidebar' }
            ];
            zones.forEach(({ placement, elId }) => {
                const el = document.getElementById(elId);
                if (!el) return;
                
                const matchingAds = (ads || []).filter(a => a.placement === placement);
                
                if (matchingAds.length === 0) {
                    el.innerHTML = '';
                    el.style.display = 'none';
                    return;
                }
                
                el.style.display = 'block';
                el.innerHTML = matchingAds.map(a => {
                    const safeName = escapeHtml(a.name || 'Promo');
                    
                    // Pre-compute image size styling (wrap + img widths).
                    const adSizeMap = {
                        'banner-sm': 320, 'banner-md': 728, 'banner-lg': 1200,
                        'square-sm': 250, 'square-md': 400, 'rect-md': 300, 'rect-lg': 600
                    };
                    let maxW = null;
                    if (a.image_size === 'custom') maxW = a.custom_width;
                    else if (a.image_size && a.image_size !== 'auto') maxW = adSizeMap[a.image_size];
                    const wrapStyle = maxW ? ` style="max-width:${maxW}px;margin:0 auto;"` : '';
                    const imgStyle  = maxW ? ` style="width:100%;height:auto;display:block;"` : '';
                    
                    const linkStart = a.link_url ? `<a href="${escapeHtml(a.link_url)}" target="_blank" rel="noopener">` : '';
                    const linkEnd   = a.link_url ? '</a>' : '';
                    
                    // Build the live countdown container. The actual time text is
                    // populated and refreshed by startPromoCountdowns() (called
                    // below). When no end_date is set, the countdown slot is hidden.
                    let countdown = '';
                    if (a.end_date && new Date(a.end_date).getTime() > Date.now()) {
                        countdown = `<div class="ad-countdown" data-end-date="${escapeHtml(a.end_date)}"><i class="icon-clock ad-countdown-icon"></i> <span class="ad-countdown-text">…</span></div>`;
                    }
                    
                    return `
                        <div class="ad-card"${wrapStyle}>
                            ${linkStart}
                            <img src="${escapeHtml(a.image_url)}" alt="${safeName}" loading="lazy"${imgStyle}>
                            ${linkEnd}
                            <span class="ad-label">Promo</span>
                            <div class="ad-bottom-bar">
                                <div class="ad-title">${safeName}</div>
                                ${countdown}
                            </div>
                        </div>
                    `;
                }).join('');
            });
            
            // Start (or refresh) the live countdown timers that tick down the
            // remaining time on every visible promo. Hides expired ones.
            startPromoCountdowns();
            
            // Fetch and render hero banners
            const { data: banners, error: bannerError } = await supabase
                .from('hero_banners')
                .select('*')
                .eq('is_active', true)
                .or(`target_page.eq.${pageSlug},target_page.eq.all`)
                .order('sort_order', { ascending: true });
            
            if (bannerError) throw bannerError;
            
            console.log(`📢 Found ${banners?.length || 0} hero banners for page ${pageSlug}`);
            
            if (banners && banners.length > 0) {
                renderHeroBanners(banners, pageSlug);
            }
            
        } catch (error) {
            console.error('Error rendering ads from Supabase:', error);
        }
    }
    
    // ================================================================
    // ===== FIX: RENDER HERO BANNERS (Only shows banners for current page) =====
    // ================================================================
    function renderHeroBanners(banners, pageSlug) {
        const heroSection = document.querySelector('section.hero') || document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');
        if (!heroSection) return;
        // The homepage uses a #heroShowcase carousel managed entirely by
        // index.html's inline script, which loads admin banners directly from
        // the hero_banners table and falls back to product images. Returning
        // here prevents us from painting a stale background image or an
        // absolutely-positioned .hero-carousel overlay on top of that
        // showcase (race-safe structural check, no globals involved).
        if (document.getElementById('heroShowcase')) return;
        
        // ===== FILTER BANNERS FOR THIS PAGE =====
        // Only show banners where target_page matches the current page.
        const pageBanners = (banners || []).filter(b => {
            return b.target_page === 'all' || b.target_page === pageSlug;
        });
        
        // If no matching banners, clear any hardcoded text and return.
        if (pageBanners.length === 0) {
            console.log(`ℹ️ No hero banners for page: ${pageSlug}, using default`);
            if (heroContent) {
                const h1 = heroContent.querySelector('h1');
                const p = heroContent.querySelector('p');
                if (h1) h1.textContent = '';
                if (p) p.textContent = '';
            }
            return;
        }
        
        // Clear any existing carousel
        const existingCarousel = heroSection.querySelector('.hero-carousel');
        if (existingCarousel) existingCarousel.remove();
        
        // Use the first matching banner as the background. Only apply the
        // dim gradient when the banner has visible text so the image is not
        // blurred out for image-only banners.
        const first = pageBanners[0];
        const firstHasText = !!(first.title || first.subtitle);
        heroSection.style.backgroundImage = firstHasText
            ? `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('${escapeHtml(first.image_url)}')`
            : `url('${escapeHtml(first.image_url)}')`;
        heroSection.style.backgroundSize = 'cover';
        heroSection.style.backgroundPosition = 'center';
        
        // Update text content if there is a hero-content container.
        if (heroContent) {
            const h1 = heroContent.querySelector('h1');
            const p = heroContent.querySelector('p');
            if (h1) h1.textContent = first.title || '';
            if (p) p.textContent = first.subtitle || '';
        }
        
        // If there are multiple matching banners, create a rotating carousel.
        if (pageBanners.length > 1) {
            const carouselDiv = document.createElement('div');
            carouselDiv.className = 'hero-carousel';
            carouselDiv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:0';
            heroSection.insertBefore(carouselDiv, heroSection.firstChild);
            
            carouselDiv.innerHTML = pageBanners.map((b, i) => {
                const hasText = !!(b.title || b.subtitle);
                // No dim gradient for image-only banners - keep the image crisp.
                const bg = hasText
                    ? `linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45)),url('${escapeHtml(b.image_url)}')`
                    : `url('${escapeHtml(b.image_url)}')`;
                return `<div class="hero-slide ${i === 0 ? 'active' : ''}"
                     style="position:absolute;top:0;left:0;width:100%;height:100%;
                            background-image:${bg};
                            background-size:cover;background-position:center;
                            opacity:${i === 0 ? '1' : '0'};
                            transition:opacity 1.5s ease-in-out">
                </div>`;
            }).join('');
            
            // Start carousel rotation
            const slides = carouselDiv.querySelectorAll('.hero-slide');
            let idx = 0;
            if (window._heroCarouselInterval) clearInterval(window._heroCarouselInterval);
            window._heroCarouselInterval = setInterval(() => {
                slides[idx].style.opacity = '0';
                idx = (idx + 1) % slides.length;
                slides[idx].style.opacity = '1';
                
                if (pageBanners[idx] && heroContent) {
                    const h1 = heroContent.querySelector('h1');
                    const p = heroContent.querySelector('p');
                    if (h1) h1.textContent = pageBanners[idx].title || '';
                    if (p) p.textContent = pageBanners[idx].subtitle || '';
                }
            }, 5000);
        }
    }
    
    // ================================================================
    // ===== LIVE PROMO COUNTDOWN (red-themed, every-1s tick)        =====
    // ================================================================
    function formatCountdown(ms) {
        const totalSec = Math.max(0, Math.floor(ms / 1000));
        const days = Math.floor(totalSec / 86400);
        const hours = Math.floor((totalSec % 86400) / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        const seconds = totalSec % 60;
        const pad = n => String(n).padStart(2, '0');
        if (days > 0)  return `${days}d ${pad(hours)}:${pad(minutes)}`;
        if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        return `${pad(minutes)}:${pad(seconds)}`;
    }

    function startPromoCountdowns() {
        function tick() {
            const now = Date.now();
            const els = document.querySelectorAll('.ad-countdown[data-end-date]');
            els.forEach(el => {
                const end = Date.parse(el.getAttribute('data-end-date'));
                if (isNaN(end)) return;
                const diff = end - now;
                if (diff <= 0) {
                    // Hide the entire ad card with a quick fade and remove it
                    // from the DOM; empty zones auto-collapse via :empty CSS.
                    const card = el.closest('.ad-card');
                    if (card) {
                        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(-6px)';
                        setTimeout(() => {
                            card.remove();
                            const zone = card.parentElement;
                            if (zone && zone.classList.contains('ad-zone') && !zone.querySelector('.ad-card')) {
                                zone.innerHTML = '';
                            }
                        }, 450);
                    }
                    return;
                }
                const text = el.querySelector('.ad-countdown-text');
                if (text) text.textContent = formatCountdown(diff);
            });
        }
        tick();
        if (window._zetraPromoInterval) clearInterval(window._zetraPromoInterval);
        window._zetraPromoInterval = setInterval(tick, 1000);
    }

    // ================================================================
    // ===== GET HERO BANNERS (for index.html fallback) =====
    // ================================================================
    async function getHeroBanners() {
        const supabase = getSupabaseClient();
        if (!supabase) return [];
        try {
            const { data, error } = await supabase
                .from('hero_banners')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('Failed to get hero banners:', e);
            return [];
        }
    }
    
    // ================================================================
    // INITIALIZATION
    // ================================================================
    async function initializePage() {
        console.log('🚀 Initializing IndiaMedCare...');
        
        getSupabaseClient();
        setupHeaderInteractions();
        updateCartUI();
        
        // Remove any stray checkout buttons
        document.querySelectorAll('#whatsappCheckout').forEach(btn => btn.remove());
        
        // Determine page slug for ads
        const pageSlug = window.ZETRA_CONFIG?.currentCategory || 'index';
        console.log(`📄 Current page slug: ${pageSlug}`);
        
        if (isProductPage()) {
            const slug = getSlugFromURL();
            if (slug) await loadSingleProductBySlug(slug);
            else window.location.href = 'index.html';
        } else {
            const category = getCurrentCategory();
            if (document.getElementById('productsGrid')) await loadProductsByCategory(category);
        }
        
        // ============================================================
        // REPLACE localStorage AD RENDERING WITH SUPABASE
        // ============================================================
        // Old localStorage code is removed; we now call Supabase.
        // The ad zone elements (adZoneAfterHero, adZoneBetweenSections, adZoneBeforeFooter)
        // are rendered by renderAdsFromSupabase.
        await renderAdsFromSupabase(pageSlug);
        
        console.log('✅ IndiaMedCare ready');
    }
    
    // ====================
    // EXPOSE TO WINDOW
    // ====================
    window.IndiaMedCare = {
        addToCart,
        showNotification,
        proceedToCheckout,
        showCheckoutModal,
        openCart,
        closeCart,
        formatPrice,
        getImageUrl,
        loadProductsByCategory,
        loadSingleProductBySlug,
        updateCartUI,
        updateCartPanel,
        getOrderByNumber,
        createOrder,
        uploadReceiptToStorage,
        // Expose new functions for admin dashboard and index.html
        uploadAdImage,
        saveAdToSupabase,
        deleteAdFromSupabase,
        saveHeroBannerToSupabase,
        deleteHeroBannerFromSupabase,
        renderAdsFromSupabase,
        renderHeroBanners,
        getHeroBanners  // Added for index.html fallback
    };
    
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializePage);
    else initializePage();
    
    console.log('✅ IndiaMedCare app loaded');
})();

// showCheckoutModal shipping removed per user direction (v4/v5)

/* v16: enrich-old-checkout-modal */
// v16: copy a bank account number to the clipboard, with animated
// checkmark on success. Falls back to a hidden-textarea + execCommand
// for browsers that block navigator.clipboard (e.g. older mobile Safari).
window.ZETRA_copyBankAccount = function (num, btnEl) {
    if (!num || !btnEl) return;
    var original = btnEl.dataset.v16Original || btnEl.innerHTML;
    btnEl.dataset.v16Original = original;
    var setState = function (kind) {
        if (kind === 'ok') {
            btnEl.innerHTML = '<i class="icon-check" style="margin-right:6px;"></i> Copied';
            btnEl.style.background = 'linear-gradient(135deg,#10b981,#059669)';
            btnEl.style.color = '#ffffff';
            btnEl.style.boxShadow = '0 0 14px rgba(16,185,129,0.5)';
            btnEl.disabled = true;
        } else if (kind === 'err') {
            btnEl.innerHTML = '<i class="icon-x" style="margin-right:6px;"></i> Try again';
            btnEl.style.background = 'linear-gradient(135deg,#ef4444,#b91c1c)';
            btnEl.style.color = '#ffffff';
            btnEl.style.boxShadow = '0 0 14px rgba(239,68,68,0.5)';
            btnEl.disabled = true;
        } else {
            btnEl.innerHTML = original;
            btnEl.disabled = false;
            btnEl.style.background = '';
            btnEl.style.color = '';
            btnEl.style.boxShadow = '';
        }
    };
    var fallback = function (text) {
        try {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.top = '0';
            ta.style.left = '0';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            var ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return ok;
        } catch (_e) { return false; }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(num).then(function () {
            setState('ok');
            setTimeout(function () { setState('reset'); }, 1800);
        }, function () {
            if (fallback(num)) { setState('ok'); setTimeout(function () { setState('reset'); }, 1800); }
            else                { setState('err'); setTimeout(function () { setState('reset'); }, 1800); }
        });
    } else if (fallback(num)) {
        setState('ok');
        setTimeout(function () { setState('reset'); }, 1800);
    } else {
        setState('err');
        setTimeout(function () { setState('reset'); }, 1800);
    }
};
// v16: toggle which crypto wallet card is visible based on the <select> choice.
window.ZETRA_toggleCoinCard = function (selectEl) {
    var which = selectEl && selectEl.value;
    var btc  = document.getElementById('v16BtcCard');
    var usdt = document.getElementById('v16UsdtCard');
    if (btc)  btc.style.display  = (which === 'btc')  ? 'block' : 'none';
    if (usdt) usdt.style.display = (which === 'usdt') ? 'block' : 'none';
};
/* v16:end helpers */
/* v16:end enrich-old-checkout-modal */

/* ===== Crypto wallet display (addresses set in the admin dashboard) ===== */
(function () {
    var SB = 'https://oalshkwaqaljcaqrsoqi.supabase.co';
    var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hbHNoa3dhcWFsamNhcXJzb3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MDczOTQsImV4cCI6MjEwOTM4MzM5NH0.4nivGmE8NWLIlUmORYiISAV6RSs0RK3x_Ddxgawvbz4';
    window.__ZETRA_WALLETS = { btc: '', btcNet: '', usdt: '', usdtNet: '' };

    window.ZETRA_applyWallets = function () {
        var w = window.__ZETRA_WALLETS;
        var b = document.getElementById('v16BtcAddress');
        var u = document.getElementById('v16UsdtAddress');
        var bn = document.getElementById('v16BtcNetwork');
        var un = document.getElementById('v16UsdtNetwork');
        if (b) b.textContent = w.btc || 'Wallet not configured — contact support';
        if (u) u.textContent = w.usdt || 'Wallet not configured — contact support';
        if (bn && w.btcNet) bn.textContent = w.btcNet;
        if (un && w.usdtNet) un.textContent = w.usdtNet;
    };

    window.ZETRA_copyWallet = function (which, btn) {
        var val = which === 'btc' ? window.__ZETRA_WALLETS.btc : window.__ZETRA_WALLETS.usdt;
        if (!val) { alert('This wallet address has not been set up yet. Please contact support.'); return; }
        if (typeof window.ZETRA_copyBankAccount === 'function') window.ZETRA_copyBankAccount(val, btn);
    };

    try {
        var local = JSON.parse(localStorage.getItem('imcCryptoWallets') || 'null');
        if (local) window.__ZETRA_WALLETS = { btc: local.btc || '', btcNet: local.btcNet || '', usdt: local.usdt || '', usdtNet: local.usdtNet || '' };
    } catch (_e) {}

    fetch(SB + '/rest/v1/store_settings?select=key,value&key=in.(crypto_btc_address,crypto_btc_network,crypto_usdt_address,crypto_usdt_network)', {
        headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY }
    }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
    }).then(function (rows) {
        var w = window.__ZETRA_WALLETS;
        (rows || []).forEach(function (x) {
            if (x.key === 'crypto_btc_address') w.btc = x.value || '';
            if (x.key === 'crypto_btc_network') w.btcNet = x.value || '';
            if (x.key === 'crypto_usdt_address') w.usdt = x.value || '';
            if (x.key === 'crypto_usdt_network') w.usdtNet = x.value || '';
        });
        window.ZETRA_applyWallets();
    }).catch(function (e) {
        console.warn('wallet settings unavailable', e);
        window.ZETRA_applyWallets();
    });
})();
