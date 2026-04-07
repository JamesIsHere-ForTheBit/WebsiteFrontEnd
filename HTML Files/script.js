// ============================================
// CONFIGURATION - Easy to change later
// ============================================
const CONFIG = {
    // Admin credentials - CHANGE THESE LATER when moving to real backend
    admin: {
        email: 'admin@admin.com',     // Change this later
        password: 'admin123',         // Change this later
        requireMFA: true              // Keep MFA requirement
    },
    // Security settings
    security: {
        maxLoginAttempts: 5,
        lockoutTime: 15 * 60 * 1000,  // 15 minutes
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        requireMFA: true
    },
    // API endpoints - Change these when you add backend
    api: {
        baseUrl: '', // Add your VM IP later, e.g., 'http://192.168.1.100:3000/api'
        endpoints: {
            adminLogin: '/admin/login',
            verifyMFA: '/admin/verify-mfa',
            validateSession: '/admin/validate'
        }
    }
};

// ============================================
// PRODUCT DATA
// ============================================
const products = [
    // Men's Clothing
    {
        id: 1,
        name: "Classic Fit T-Shirt",
        price: 29.99,
        category: "men",
        subcategory: "tshirts",
        image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
        description: "Premium cotton t-shirt"
    },
    {
        id: 2,
        name: "Slim Fit Jeans",
        price: 79.99,
        category: "men",
        subcategory: "jeans",
        image: "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=500",
        description: "Classic blue denim jeans"
    },
    {
        id: 4,
        name: "Leather Jacket",
        price: 199.99,
        category: "men",
        subcategory: "jackets",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
        description: "Genuine leather jacket"
    },
    
    // Women's Clothing
    {
        id: 5,
        name: "Summer Dress",
        price: 59.99,
        category: "women",
        subcategory: "dresses",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500",
        description: "Floral print summer dress"
    },
    {
        id: 6,
        name: "Cotton Top",
        price: 34.99,
        category: "women",
        subcategory: "tops",
        image: "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=500",
        description: "Breathable cotton top"
    },
    {
        id: 7,
        name: "Women's Jeans",
        price: 69.99,
        category: "women",
        subcategory: "jeans",
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500",
        description: "High-waist skinny jeans"
    },
    {
        id: 8,
        name: "Cozy Sweater",
        price: 49.99,
        category: "women",
        subcategory: "sweaters",
        image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500",
        description: "Warm knit sweater"
    },
    
    // Kids' Clothing
    {
        id: 9,
        name: "Boys Graphic Tee",
        price: 24.99,
        category: "kids",
        subcategory: "boys",
        image: "https://th.bing.com/th/id/OIP.RwLoRitTjcGIz9vi1ynzKwHaHa?w=184&h=184&c=7&r=0&o=7&pid=1.7&rm=3",
        description: "Fun graphic t-shirt"
    },
    {
        id: 10,
        name: "Girls Graphic Tee",
        price: 24.99,
        category: "kids",
        subcategory: "girls",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRbwum9PcDZWhWInkdtbYDmd-_Dph5-9UwTQ&s",
        description: "Fun graphic t-shirt"
    },
    {
        id: 11,
        name: "Baby Onesie Set",
        price: 34.99,
        category: "kids",
        subcategory: "baby",
        image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=500",
        description: "3-pack organic onesies"
    },
    {
        id: 12,
        name: "Kids Pants",
        price: 29.99,
        category: "kids",
        subcategory: "boys",
        image: "https://th.bing.com/th/id/OIP.YVfKsTCcVUxuLaDttrzcjgHaJD?w=157&h=192&c=7&r=0&o=7&pid=1.7&rm=3",
        description: "Comfortable kids pants"
    }
];

// ============================================
// PROFANITY FILTER
// ============================================
const profanityList = ['fuck', 'shit', 'ass', 'bitch', 'damn', 'hell', 'crap', 'piss'];

function containsProfanity(text) {
    const lowerText = text.toLowerCase();
    return profanityList.some(word => lowerText.includes(word));
}

function filterProfanity(text) {
    let filteredText = text;
    profanityList.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filteredText = filteredText.replace(regex, '****');
    });
    return filteredText;
}

// ============================================
// CSRF PROTECTION
// ============================================
const CSRF = {
    token: null,
    
    generateToken() {
        this.token = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('csrfToken', this.token);
        return this.token;
    },
    
    getToken() {
        if (!this.token) {
            this.token = sessionStorage.getItem('csrfToken') || this.generateToken();
        }
        return this.token;
    },
    
    protectForms() {
        document.querySelectorAll('form').forEach(form => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = '_csrf';
            input.value = this.getToken();
            form.appendChild(input);
        });
    }
};

// ============================================
// SESSION MANAGER
// ============================================
const SessionManager = {
    setSession(userData, token = null) {
        const session = {
            user: {
                id: userData.id || Date.now(),
                email: userData.email,
                name: userData.name,
                isAdmin: userData.isAdmin || false,
                role: userData.role || 'user'
            },
            token: token,
            expires: Date.now() + CONFIG.security.sessionTimeout,
            lastActivity: Date.now()
        };
        
        sessionStorage.setItem('session', JSON.stringify(session));
        return session;
    },
    
    getSession() {
        const session = JSON.parse(sessionStorage.getItem('session'));
        if (!session) return null;
        
        if (Date.now() > session.expires) {
            this.clearSession();
            return null;
        }
        
        session.lastActivity = Date.now();
        sessionStorage.setItem('session', JSON.stringify(session));
        
        return session;
    },
    
    isAdmin() {
        const session = this.getSession();
        return session?.user?.isAdmin || false;
    },
    
    clearSession() {
        sessionStorage.removeItem('session');
    },
    
    async refreshToken() {
        const session = this.getSession();
        if (!session?.token || !CONFIG.api.baseUrl) return false;
        
        try {
            const response = await fetch(CONFIG.api.baseUrl + '/refresh', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                session.token = data.token;
                session.expires = Date.now() + CONFIG.security.sessionTimeout;
                sessionStorage.setItem('session', JSON.stringify(session));
                return true;
            }
        } catch (error) {
            console.log('Token refresh failed - using demo mode');
        }
        return false;
    }
};

// ============================================
// API CLIENT
// ============================================
const API = {
    async request(endpoint, options = {}) {
        if (!CONFIG.api.baseUrl) return null;
        
        const url = CONFIG.api.baseUrl + endpoint;
        const session = SessionManager.getSession();
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (session?.token) {
            headers['Authorization'] = `Bearer ${session.token}`;
        }
        
        if (options.method && options.method !== 'GET') {
            headers['X-CSRF-Token'] = CSRF.getToken();
        }
        
        try {
            const response = await fetch(url, {
                ...options,
                headers,
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.log('API request failed - using demo mode', error);
            return null;
        }
    },
    
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },
    
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

// ============================================
// AUDIT LOGGER
// ============================================
const AuditLogger = {
    logs: [],
    
    async log(action, details, targetId = null) {
        const session = SessionManager.getSession();
        const logEntry = {
            timestamp: new Date().toISOString(),
            adminId: session?.user?.id || 'system',
            adminEmail: session?.user?.email || 'system',
            action: action,
            targetId: targetId,
            details: details,
            userAgent: navigator.userAgent
        };
        
        this.logs.unshift(logEntry);
        if (this.logs.length > 100) this.logs.pop();
        
        if (CONFIG.api.baseUrl) {
            await API.post('/audit', logEntry);
        }
        
        if (document.getElementById('auditTableBody')) {
            this.updateAuditTable();
        }
        
        return logEntry;
    },
    
    getLogs(filter = {}) {
        return this.logs.filter(log => {
            if (filter.action && log.action !== filter.action) return false;
            if (filter.adminId && log.adminId !== filter.adminId) return false;
            if (filter.date && !log.timestamp.startsWith(filter.date)) return false;
            return true;
        });
    },
    
    updateAuditTable() {
        const tbody = document.getElementById('auditTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        this.logs.slice(0, 10).forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td>${log.adminEmail}</td>
                <td>${log.action}</td>
                <td>${log.details}</td>
            `;
            tbody.appendChild(row);
        });
    },
    
    exportLogs() {
        const dataStr = JSON.stringify(this.logs, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const fileName = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
        
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = fileName;
        link.click();
        
        this.log('export', 'Exported audit log');
    }
};

// ============================================
// STATE VARIABLES
// ============================================
let cart = [];
let selectedServices = {
    giftWrap: false,
    customWording: false,
    fastDelivery: false,
    customText: ""
};
const MAX_ITEMS_PER_CUSTOMER = 10;
let isLoggedIn = false;
let isGuest = false;
let currentUser = null;
let orderHistory = [];
let loginAttempts = {};

// ============================================
// AGE VERIFICATION
// ============================================
window.onload = function() {
    document.getElementById('ageModal').style.display = 'block';
    loadProducts();
    checkExistingSession();
    CSRF.protectForms();
};

function checkExistingSession() {
    const session = SessionManager.getSession();
    if (session) {
        isLoggedIn = true;
        currentUser = session.user;
        if (session.user.isAdmin) {
            showAdminDashboard();
        } else {
            showOrderHistory();
        }
    }
}

function verifyAge(isOver18) {
    if (isOver18) {
        document.getElementById('ageModal').style.display = 'none';
    } else {
        alert("You must be 18 or older to access this site.");
        window.location.href = 'https://www.google.com';
    }
}

function showTerms() {
    alert("TERMS OF SERVICE\n\n" +
          "By using Abercrombie & Phish, you agree to:\n\n" +
          "• You are 18+ or have parental consent\n" +
          "• You will use this site respectfully\n" +
          "• We protect your privacy as outlined\n" +
          "• All sales are for school project purposes\n\n" +
          "For California residents: Special privacy protections apply to users under 18.");
}

function showPrivacy() {
    alert("PRIVACY POLICY SUMMARY\n\n" +
          "• We collect only necessary data (shipping info)\n" +
          "• Users under 18 have maximum privacy settings\n" +
          "• California residents can request data deletion\n" +
          "• No data selling to third parties\n" +
          "• COPPA compliant - parental consent under 13\n" +
          "• Data breach notifications within 45 days\n\n" +
          "For full policy, contact privacy@abercrombiephish.com");
}

// ============================================
// PRODUCT FUNCTIONS
// ============================================
function filterProducts(category, subcategory) {
    let filteredProducts = products;
    
    if (category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    if (subcategory && subcategory !== 'all' && subcategory !== 'new' && subcategory !== 'sale') {
        filteredProducts = filteredProducts.filter(p => p.subcategory === subcategory);
    } else if (subcategory === 'new') {
        filteredProducts = products.filter(p => p.subcategory === 'new');
    } else if (subcategory === 'sale') {
        filteredProducts = products.filter(p => p.subcategory === 'sale');
    }
    
    loadProducts(filteredProducts);
    document.getElementById('productGrid').scrollIntoView({ behavior: 'smooth' });
}

function loadProducts(productsToShow = products) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = '';

    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://images.unsplash.com/photo-1556909211-36987daf7b4d?w=500'">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <p class="product-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
                <button class="btn-add-to-cart" onclick="addToCart(${product.id})" ${getCartItemCount() >= MAX_ITEMS_PER_CUSTOMER ? 'disabled' : ''}>
                    Add to Cart
                </button>
            </div>
        `;
        productGrid.appendChild(productCard);
    });
}

// ============================================
// CART FUNCTIONS
// ============================================
function getCartItemCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

function updateCartCount() {
    document.getElementById('cartCount').textContent = getCartItemCount();
}

function addToCart(productId) {
    const currentCount = getCartItemCount();
    
    if (currentCount >= MAX_ITEMS_PER_CUSTOMER) {
        alert(`Sorry, you can only purchase up to ${MAX_ITEMS_PER_CUSTOMER} items total.`);
        return;
    }

    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        if (currentCount + 1 <= MAX_ITEMS_PER_CUSTOMER) {
            existingItem.quantity++;
        } else {
            alert(`Sorry, you can only purchase up to ${MAX_ITEMS_PER_CUSTOMER} items total.`);
            return;
        }
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCartCount();
    alert(`${product.name} added to cart!`);
}

function toggleCustomText() {
    const customWordingCheckbox = document.getElementById('customWording');
    const customTextContainer = document.getElementById('customTextContainer');
    
    if (customWordingCheckbox.checked) {
        customTextContainer.style.display = 'block';
    } else {
        customTextContainer.style.display = 'none';
        document.getElementById('customText').value = '';
        selectedServices.customText = '';
    }
    
    updateServices();
}

function validateCustomText() {
    const customText = document.getElementById('customText');
    const charCount = document.getElementById('charCount');
    const currentLength = customText.value.length;
    
    if (containsProfanity(customText.value)) {
        alert('Please keep your custom text appropriate and family-friendly!');
        customText.value = '';
        charCount.textContent = '0';
        selectedServices.customText = '';
        return;
    }
    
    charCount.textContent = currentLength;
    selectedServices.customText = customText.value;
    updateServices();
}

function updateServices() {
    selectedServices = {
        giftWrap: document.getElementById('giftWrap').checked,
        customWording: document.getElementById('customWording').checked,
        fastDelivery: document.getElementById('fastDelivery').checked,
        customText: document.getElementById('customText') ? document.getElementById('customText').value : ''
    };
    
    updateCartDisplay();
}

function calculateServicesTotal() {
    let total = 0;
    if (selectedServices.giftWrap) total += 9.99;
    if (selectedServices.customWording && selectedServices.customText.trim().length > 0) total += 9.99;
    if (selectedServices.fastDelivery) total += 14.99;
    return total;
}

function showCart() {
    updateCartDisplay();
    document.getElementById('cartModal').style.display = 'block';
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const servicesTotal = document.getElementById('servicesTotal');
    const cartTotal = document.getElementById('cartTotal');

    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center;">Your cart is empty</p>';
        cartSubtotal.textContent = '0.00';
        servicesTotal.textContent = '0.00';
        cartTotal.textContent = '0.00';
    } else {
        cartItems.innerHTML = '';
        let subtotal = 0;

        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)} each</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        <button class="quantity-btn" onclick="removeFromCart(${item.id})">Remove</button>
                    </div>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });

        const servicesTotalValue = calculateServicesTotal();
        const totalValue = subtotal + servicesTotalValue;

        cartSubtotal.textContent = subtotal.toFixed(2);
        servicesTotal.textContent = servicesTotalValue.toFixed(2);
        cartTotal.textContent = totalValue.toFixed(2);
    }
}

function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartCount();
            updateCartDisplay();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    updateCartDisplay();
}

// ============================================
// LOGIN/SIGNUP FUNCTIONS
// ============================================
function showSignUpForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

function showSignInForm() {
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

function handleSignIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    
    if (email && password) {
        isLoggedIn = true;
        currentUser = { 
            id: Date.now(), 
            name: email.split('@')[0], 
            email: email, 
            isAdmin: false 
        };
        
        SessionManager.setSession(currentUser);
        closeLoginModal();
        alert(`Welcome back, ${currentUser.name}!`);
        showOrderHistory();
    } else {
        alert('Invalid email or password.');
    }
}

function handleSignUp(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    
    if (password !== confirm) {
        alert('Passwords do not match!');
        return;
    }
    
    if (name && email && password) {
        isLoggedIn = true;
        currentUser = { 
            id: Date.now(), 
            name: name, 
            email: email, 
            isAdmin: false 
        };
        
        SessionManager.setSession(currentUser);
        closeLoginModal();
        alert(`Account created successfully! Welcome, ${name}!`);
        showOrderHistory();
    }
}

function showLoginModal() {
    showSignInForm();
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('signin-email').value = '';
    document.getElementById('signin-password').value = '';
}

function continueAsGuest() {
    isGuest = true;
    closeLoginModal();
    alert('Continuing as guest');
}

function logout() {
    isLoggedIn = false;
    currentUser = null;
    SessionManager.clearSession();
    document.getElementById('formerOrdersSection').style.display = 'none';
    alert('You have been logged out.');
}

// ============================================
// ORDER HISTORY
// ============================================
function saveOrderToHistory(subtotal, servicesTotal, grandTotal) {
    const order = {
        orderNumber: 'ORD' + Math.floor(Math.random() * 1000000),
        date: new Date().toLocaleDateString(),
        items: [...cart],
        services: { ...selectedServices },
        total: grandTotal
    };
    
    orderHistory.unshift(order);
    if (orderHistory.length > 5) orderHistory.pop();
}

function showOrderHistory() {
    const ordersSection = document.getElementById('formerOrdersSection');
    const ordersGrid = document.getElementById('ordersGrid');
    
    if (isLoggedIn && orderHistory.length > 0) {
        ordersSection.style.display = 'block';
        ordersGrid.innerHTML = '';
        
        orderHistory.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            
            let itemsHtml = '';
            order.items.forEach(item => {
                itemsHtml += `
                    <div class="order-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `;
            });
            
            orderCard.innerHTML = `
                <div class="order-header">
                    <span class="order-number">${order.orderNumber}</span>
                    <span class="order-date">${order.date}</span>
                </div>
                <div class="order-items">${itemsHtml}</div>
                <div class="order-total">Total: $${order.total.toFixed(2)}</div>
            `;
            
            ordersGrid.appendChild(orderCard);
        });
    } else if (isLoggedIn) {
        ordersSection.style.display = 'block';
        ordersGrid.innerHTML = '<div class="no-orders">No previous orders found.</div>';
    } else {
        ordersSection.style.display = 'none';
    }
}

// ============================================
// CHECKOUT
// ============================================
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    if (selectedServices.customWording) {
        const customText = document.getElementById('customText').value;
        if (customText.trim().length === 0) {
            alert('Please enter custom text for your shirt!');
            return;
        }
        if (containsProfanity(customText)) {
            alert('Please keep your custom text appropriate!');
            return;
        }
    }

    if (!isLoggedIn && !isGuest) {
        closeCart();
        showLoginModal();
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const servicesTotal = calculateServicesTotal();
    const grandTotal = subtotal + servicesTotal;

    if (isLoggedIn) {
        saveOrderToHistory(subtotal, servicesTotal, grandTotal);
        showOrderHistory();
    }

    showReceipt(subtotal, servicesTotal, grandTotal);
    
    cart = [];
    selectedServices = {
        giftWrap: false,
        customWording: false,
        fastDelivery: false,
        customText: ""
    };
    
    document.getElementById('giftWrap').checked = false;
    document.getElementById('customWording').checked = false;
    document.getElementById('fastDelivery').checked = false;
    document.getElementById('customTextContainer').style.display = 'none';
    document.getElementById('customText').value = '';
    document.getElementById('charCount').textContent = '0';
    
    updateCartCount();
    closeCart();
}

function showReceipt(subtotal, servicesTotal, grandTotal) {
    const receiptContent = document.getElementById('receiptContent');
    const date = new Date();
    const orderNumber = 'ORD' + Math.floor(Math.random() * 1000000);
    
    let receiptHtml = `
        <div class="receipt-thankyou">Thank you for your purchase!</div>
        <div class="receipt-item"><span>Order Number:</span><span>${orderNumber}</span></div>
        <div class="receipt-item"><span>Date:</span><span>${date.toLocaleDateString()}</span></div>
        <h3>Items Purchased:</h3>
    `;
    
    cart.forEach(item => {
        receiptHtml += `
            <div class="receipt-item">
                <span>${item.name} x${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;
    });
    
    if (servicesTotal > 0) {
        receiptHtml += `<h3>Services:</h3>`;
        if (selectedServices.giftWrap) {
            receiptHtml += `<div class="receipt-item"><span>Gift Wrapping</span><span>$9.99</span></div>`;
        }
        if (selectedServices.customWording && selectedServices.customText) {
            receiptHtml += `<div class="receipt-item"><span>Custom Wording</span><span>$9.99</span></div>`;
        }
        if (selectedServices.fastDelivery) {
            receiptHtml += `<div class="receipt-item"><span>Fast Delivery</span><span>$14.99</span></div>`;
        }
    }
    
    receiptHtml += `
        <div class="receipt-total">
            <div class="receipt-item"><span>TOTAL:</span><span>$${grandTotal.toFixed(2)}</span></div>
        </div>
    `;
    
    receiptContent.innerHTML = receiptHtml;
    document.getElementById('receiptModal').style.display = 'block';
}

function closeReceipt() {
    document.getElementById('receiptModal').style.display = 'none';
}

// ============================================
// ADMIN FUNCTIONS
// ============================================
function showAdminLogin() {
    document.getElementById('adminLoginModal').style.display = 'block';
}

function closeAdminLoginModal() {
    document.getElementById('adminLoginModal').style.display = 'none';
    document.getElementById('admin-email').value = '';
    document.getElementById('admin-password').value = '';
    document.getElementById('admin-mfa').value = '';
    document.getElementById('mfaGroup').style.display = 'none';
}

function handleAdminLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const mfa = document.getElementById('admin-mfa').value;
    const now = Date.now();
    
    if (loginAttempts[email] && 
        loginAttempts[email].count >= CONFIG.security.maxLoginAttempts &&
        now - loginAttempts[email].timestamp < CONFIG.security.lockoutTime) {
        
        const minutesLeft = Math.ceil((CONFIG.security.lockoutTime - (now - loginAttempts[email].timestamp)) / 60000);
        alert(`Too many attempts. Try again in ${minutesLeft} minutes.`);
        return;
    }
    
    if (email === CONFIG.admin.email && password === CONFIG.admin.password) {
        
        if (CONFIG.admin.requireMFA) {
            if (document.getElementById('mfaGroup').style.display !== 'block') {
                document.getElementById('mfaGroup').style.display = 'block';
                alert('Please enter MFA code (any 6 digits for demo)');
                
                if (!loginAttempts[email]) {
                    loginAttempts[email] = { count: 1, timestamp: now };
                }
                return;
            }
            
            if (mfa && mfa.length === 6) {
                delete loginAttempts[email];
                
                const session = SessionManager.setSession({
                    id: 1,
                    email: email,
                    name: 'Admin',
                    isAdmin: true,
                    role: 'super_admin'
                }, 'demo-token-' + Date.now());
                
                AuditLogger.log('admin_login', 'Admin logged in');
                completeAdminLogin(session);
            } else {
                alert('Invalid MFA code');
                
                if (!loginAttempts[email]) {
                    loginAttempts[email] = { count: 1, timestamp: now };
                } else {
                    loginAttempts[email].count++;
                    loginAttempts[email].timestamp = now;
                }
            }
        } else {
            delete loginAttempts[email];
            const session = SessionManager.setSession({
                id: 1,
                email: email,
                name: 'Admin',
                isAdmin: true
            });
            AuditLogger.log('admin_login', 'Admin logged in');
            completeAdminLogin(session);
        }
    } else {
        alert('Invalid credentials');
        
        if (!loginAttempts[email]) {
            loginAttempts[email] = { count: 1, timestamp: now };
        } else {
            loginAttempts[email].count++;
            loginAttempts[email].timestamp = now;
        }
    }
}

function completeAdminLogin(session) {
    isAdminLoggedIn = true;
    adminUser = session.user;
    
    document.querySelector('header').style.display = 'none';
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.categories').style.display = 'none';
    document.querySelector('.featured-products').style.display = 'none';
    document.querySelector('.reviews').style.display = 'none';
    document.querySelector('footer').style.display = 'none';
    document.querySelector('.chatbot-container').style.display = 'none';
    
    document.getElementById('adminDashboard').style.display = 'block';
    document.getElementById('adminEmail').textContent = adminUser.email;
    
    loadAdminData();
    closeAdminLoginModal();
}

function logoutAdmin() {
    AuditLogger.log('admin_logout', 'Admin logged out');
    
    isAdminLoggedIn = false;
    adminUser = null;
    SessionManager.clearSession();
    
    document.querySelector('header').style.display = 'block';
    document.querySelector('.hero').style.display = 'flex';
    document.querySelector('.categories').style.display = 'block';
    document.querySelector('.featured-products').style.display = 'block';
    document.querySelector('.reviews').style.display = 'block';
    document.querySelector('footer').style.display = 'block';
    document.querySelector('.chatbot-container').style.display = 'block';
    
    document.getElementById('adminDashboard').style.display = 'none';
}

function loadAdminData() {
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('activeOrders').textContent = orderHistory.length;
    document.getElementById('totalUsers').textContent = '1,234';
    document.getElementById('totalRevenue').textContent = '$45,678';
    
    loadUsers();
    loadProductsTable();
    loadOrdersTable();
    AuditLogger.updateAuditTable();
}

function loadUsers() {
    const usersTableBody = document.getElementById('usersTableBody');
    if (!usersTableBody) return;
    
    usersTableBody.innerHTML = '';
    
    const demoUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', created: '2026-03-01', status: 'active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', created: '2026-03-02', status: 'active' },
        { id: 3, name: 'Bob Wilson', email: 'bob@example.com', created: '2026-03-03', status: 'locked' }
    ];
    
    demoUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.created}</td>
            <td><span class="status-badge status-active">${user.status}</span></td>
            <td>
                <button onclick="viewUserDetails(${user.id})" class="btn-small">View</button>
                <button onclick="deleteUserPrompt(${user.id})" class="btn-small btn-danger">Delete</button>
            </td>
        `;
        usersTableBody.appendChild(row);
    });
}

function loadProductsTable() {
    const productsTableBody = document.getElementById('productsTableBody');
    if (!productsTableBody) return;
    
    productsTableBody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td><span class="status-badge status-active">Active</span></td>
        `;
        productsTableBody.appendChild(row);
    });
}

function loadOrdersTable() {
    const ordersTableBody = document.getElementById('ordersTableBody');
    if (!ordersTableBody) return;
    
    ordersTableBody.innerHTML = '';
    
    const demoOrders = [
        { orderNumber: 'ORD123456', date: '2026-03-10', items: 3, total: 149.97, status: 'Delivered' },
        { orderNumber: 'ORD123457', date: '2026-03-09', items: 2, total: 89.98, status: 'Shipped' },
        { orderNumber: 'ORD123458', date: '2026-03-08', items: 1, total: 59.99, status: 'Processing' }
    ];
    
    demoOrders.forEach(order => {
        const row = document.createElement('tr');
        let statusClass = 'status-pending';
        if (order.status === 'Delivered') statusClass = 'status-delivered';
        if (order.status === 'Shipped') statusClass = 'status-active';
        
        row.innerHTML = `
            <td>${order.orderNumber}</td>
            <td>${order.date}</td>
            <td>${order.items} items</td>
            <td>$${order.total.toFixed(2)}</td>
            <td><span class="status-badge ${statusClass}">${order.status}</span></td>
        `;
        ordersTableBody.appendChild(row);
    });
}

function viewUserDetails(userId) {
    AuditLogger.log('view_user', `Viewed details for user ${userId}`, userId);
    
    const content = `
        <p><strong>Name:</strong> John Doe</p>
        <p><strong>Email:</strong> john@example.com</p>
        <p><strong>Created:</strong> 2026-03-01</p>
        <p><strong>Last Login:</strong> 2026-03-15</p>
        <p><strong>Orders:</strong> 5</p>
        <p><strong>Total Spent:</strong> $349.95</p>
    `;
    
    document.getElementById('userDetailsContent').innerHTML = content;
    document.getElementById('userDetailsModal').style.display = 'block';
}

function closeUserDetails() {
    document.getElementById('userDetailsModal').style.display = 'none';
}

function deleteUserPrompt(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        AuditLogger.log('delete_user', `Deleted user ${userId}`, userId);
        alert(`User ${userId} deleted`);
        loadUsers();
    }
}

// ============================================
// AI CHATBOT FUNCTIONS
// ============================================
function toggleChatbot() {
    document.getElementById('chatbotWindow').classList.toggle('active');
}

function handleChatInput(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function quickQuestion(question) {
    document.getElementById('chatbotInput').value = question;
    sendMessage();
}

function sendMessage() {
    const input = document.getElementById('chatbotInput');
    let message = input.value.trim();
    
    if (message === '') return;
    
    if (containsProfanity(message)) {
        message = '****';
        addMessage(message, 'user');
        addMessage("Please keep our conversation family-friendly!", 'bot');
        input.value = '';
        return;
    }
    
    addMessage(message, 'user');
    input.value = '';
    
    setTimeout(() => {
        const response = getAIResponse(message);
        addMessage(response, 'bot');
    }, 1000);
}

function addMessage(text, sender) {
    const messages = document.getElementById('chatbotMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `<div class="message-content">${text}</div>`;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

function getAIResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('shipping')) {
        return "We offer free standard shipping (5-7 days) and express shipping for $9.99 (2-3 days). Fast delivery is available for $14.99 (1-2 days).";
    }
    if (lowerMessage.includes('return')) {
        return "We have a 30-day return policy. Items must be unworn with tags attached. Free returns on all orders!";
    }
    if (lowerMessage.includes('size')) {
        return "We carry sizes XS-3XL for adults and 2T-16 for kids. Use our size guide for exact measurements!";
    }
    if (lowerMessage.includes('discount') || lowerMessage.includes('student')) {
        return "Yes! We offer 15% student discount, 10% off first purchase, and seasonal sales up to 50% off!";
    }
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hello! 👋 How can I help you today?";
    }
    return "I'm here to help! Ask me about shipping, returns, sizes, or discounts.";
}

// ============================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// ============================================
window.onclick = function(event) {
    const modals = ['ageModal', 'loginModal', 'cartModal', 'receiptModal', 'adminLoginModal', 'userDetailsModal'];
    modals.forEach(id => {
        const modal = document.getElementById(id);
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
};