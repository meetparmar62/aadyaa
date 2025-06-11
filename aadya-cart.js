/**
 * Aadya E-commerce Cart Functionality
 * Handles adding products to cart, removing products, and updating cart display
 */

// Initialize cart from localStorage when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    setupAddToCartButtons();
    setupCartIcon();
    
    // Also set up a mutation observer to handle dynamically added buttons
    setupMutationObserver();
});

// Function to update cart count display
function updateCartCount() {
    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
        const cart = getCart();
        cartCount.textContent = cart.length;
    }
}

// Get cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem("aadya_cart") || "[]");
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem("aadya_cart", JSON.stringify(cart));
    updateCartCount();
}

// Add product to cart
function addToCart(product) {
    const cart = getCart();
    
    // Check if product already exists in cart
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex > -1) {
        // Increase quantity if product already in cart
        cart[existingProductIndex].quantity += 1;
    } else {
        // Add new product to cart
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart(cart);
    showNotification(`Added ${product.name} to cart!`);
}

// Remove product from cart
function removeFromCart(productId) {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.id !== productId);
    saveCart(updatedCart);
}

// Setup event listeners for all Add to Cart buttons
function setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
    
    addToCartButtons.forEach(button => {
        // Skip if this button already has our event listener
        if (button.hasAttribute('data-cart-initialized')) {
            return;
        }
        
        // Mark this button as initialized
        button.setAttribute('data-cart-initialized', 'true');
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get product info from parent product card
            const productCard = this.closest('.product-card');
            if (!productCard) {
                console.error('Could not find parent product card');
                return;
            }
            
            const productId = productCard.dataset.productId || generateProductId();
            const productNameElement = productCard.querySelector('h3');
            const productPriceElement = productCard.querySelector('.product-price');
            const productImageElement = productCard.querySelector('img');
            
            if (!productNameElement || !productPriceElement || !productImageElement) {
                console.error('Missing required product elements');
                return;
            }
            
            const productName = productNameElement.textContent;
            const productPrice = productPriceElement.textContent.replace('₹', '').trim();
            const productImage = productImageElement.src;
            
            const product = {
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage
            };
            
            addToCart(product);
        });
    });
}

// Generate a unique product ID when one isn't provided in the HTML
function generateProductId() {
    return 'product_' + Math.random().toString(36).substr(2, 9);
}

// Setup cart icon click event to redirect to cart page
function setupCartIcon() {
    const cartIcon = document.getElementById('cart-icon');
    
    if (cartIcon) {
        // Remove any existing click handlers
        cartIcon.replaceWith(cartIcon.cloneNode(true));
        
        // Get the newly cloned element
        const newCartIcon = document.getElementById('cart-icon');
        
        newCartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            // Redirect to cart page
            window.location.href = 'cart.html';
        });
    }
}

// Redirect to cart page (replaces the old modal functionality)
function showCartModal() {
    window.location.href = 'cart.html';
}

// Show notification when product is added to cart
function showNotification(message) {
    let notification = document.getElementById('cart-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'cart-notification';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = 'var(--accent-coral, #FF7F50)';
        notification.style.color = '#fff';
        notification.style.padding = '15px 25px';
        notification.style.borderRadius = '8px';
        notification.style.zIndex = '1000';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        notification.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
        notification.style.fontWeight = 'bold';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
    
    // Update cart count in the header
    updateCartCount();
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
    }, 3000);
}

// Set up mutation observer to watch for dynamically added "Add to Cart" buttons
function setupMutationObserver() {
    // Create a MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver(function(mutations) {
        let shouldSetupButtons = false;
        
        // Check if any of the mutations involve adding nodes
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                shouldSetupButtons = true;
            }
        });
        
        // If nodes were added, re-setup the "Add to Cart" buttons
        if (shouldSetupButtons) {
            setupAddToCartButtons();
        }
    });
    
    // Start observing the document body for DOM changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// CSS for cart modal
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .product-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        
        .product-modal-overlay.show {
            opacity: 1;
            visibility: visible;
        }
        
        .product-modal {
            background-color: #fff;
            border-radius: 15px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            padding: 30px;
            position: relative;
        }
        
        [data-theme="dark"] .product-modal {
            background-color: #013328;
            color: #E3DCD2;
        }
        
        /* Remove scrollbar for WebKit browsers */
        .product-modal::-webkit-scrollbar {
            width: 6px;
        }
        
        .product-modal::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
        }
        
        .product-modal::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
        }
    `;
    document.head.appendChild(style);
});
