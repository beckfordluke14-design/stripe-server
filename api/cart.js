document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL CONFIG & STATE ---
    const CHECKOUT_SESSION_URL = '/api/server';
    const appStateKey = 'atfCart_v1'; // New global key
    
    // Make cart and dom global so page-specific scripts can use them
    window.cart = [];
    window.cartTimerInterval = null;
    window.dom = new Proxy({}, { 
        get: (_, id) => document.getElementById(id.replace(/([A-Z])/g, "-$1").toLowerCase()) 
    });

    // --- GLOBAL CART FUNCTIONS ---
    window.saveState = () => {
        localStorage.setItem(appStateKey, JSON.stringify({ cart: window.cart }));
    }

    window.loadState = () => {
        const savedState = localStorage.getItem(appStateKey);
        window.cart = savedState ? JSON.parse(savedState).cart || [] : [];
    }

    window.updateCartIcon = () => {
        const totalItems = window.cart.reduce((sum, item) => sum + item.quantity, 0);
        if (window.dom.publicCartBadge) {
            window.dom.publicCartBadge.textContent = totalItems;
        }
    }

    window.renderCart = () => {
        if (!window.dom.cartItemsContainer) return; // Don't run if cart elements aren't on the page

        window.dom.cartItemsContainer.innerHTML = '';
        let subtotal = 0;
        
        if (window.cart.length === 0) {
            window.dom.cartItemsContainer.innerHTML = `<p class="text-center text-gray-500">Your cart is empty.</p>`;
        } else {
            window.cart.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'flex items-center space-x-4 py-3 border-b';
                itemEl.dataset.variantId = item.variantId;
                const price = parseFloat(item.price.replace('$', ''));
                subtotal += price * item.quantity;
                itemEl.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-md">
                    <div class="flex-grow">
                        <p class="font-semibold">${item.name}</p>
                        <p class="text-sm text-gray-500">${item.variantText}</p>
                        <p class="font-bold text-sm">${item.price}</p>
                    </div>
                    <button class="remove-item-btn text-red-500 hover:text-red-700 font-bold text-xl px-2" data-variant-id="${item.variantId}">&times;</button>
                `;
                window.dom.cartItemsContainer.appendChild(itemEl);
            });
        }
        window.dom.cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        window.updateCartIcon();
    }

    window.startCartTimer = () => {
        let duration = 10 * 60; // 10 minutes
        clearInterval(window.cartTimerInterval);
        window.cartTimerInterval = setInterval(() => {
            if (duration <= 0) {
                clearInterval(window.cartTimerInterval);
                if (window.dom.cartTimer) window.dom.cartTimer.textContent = "00:00";
                return;
            }
            duration--;
            const m = String(Math.floor(duration / 60)).padStart(2, '0');
            const s = String(duration % 60).padStart(2, '0');
            if (window.dom.cartTimer) window.dom.cartTimer.textContent = `${m}:${s}`;
        }, 1000);
    }

    // --- INITIALIZE CART & LISTENERS ---
    
    // Load the cart from storage
    window.loadState();
    
    // Render the cart contents immediately
    window.renderCart();

    // --- Global Event Listeners for Cart Panel & Checkout ---
    const openCart = () => { 
        if(window.dom.cartPanel) window.dom.cartPanel.classList.add('open'); 
        if(window.dom.cartOverlay) window.dom.cartOverlay.classList.add('open'); 
    };
    if(window.dom.publicCartButton) window.dom.publicCartButton.addEventListener('click', openCart);
    
    const closeCart = () => { 
        if(window.dom.cartPanel) window.dom.cartPanel.classList.remove('open'); 
        if(window.dom.cartOverlay) window.dom.cartOverlay.classList.remove('open'); 
    };
    if(window.dom.closeCartBtn) window.dom.closeCartBtn.addEventListener('click', closeCart);
    if(window.dom.cartOverlay) window.dom.cartOverlay.addEventListener('click', closeCart);

    if (window.dom.cartItemsContainer) {
        window.dom.cartItemsContainer.addEventListener('click', (e) => {
            if (e.target.matches('.remove-item-btn')) {
                const variantIdToRemove = e.target.dataset.variantId;
                window.cart = window.cart.filter(item => item.variantId !== variantIdToRemove);
                window.saveState();
                window.renderCart();
            }
        });
    }

    if (window.dom.checkoutBtn) {
        window.dom.checkoutBtn.addEventListener('click', async () => {
            if (window.cart.length === 0) return;
            window.dom.checkoutBtn.textContent = 'Connecting...';
            window.dom.checkoutBtn.disabled = true;

            // Track FB Event
            if(typeof fbq === 'function') fbq('track', 'InitiateCheckout');
            
            const line_items = window.cart.map(item => ({
                price_data: { currency: 'usd', product_data: { name: `${item.name} (${item.variantText})`, images: [item.image] }, unit_amount: Math.round(parseFloat(item.price.replace('$', '')) * 100) },
                quantity: item.quantity,
            }));

            try {
                const response = await fetch(CHECKOUT_SESSION_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: line_items }) });
                if (!response.ok) throw new Error('Server error');
                const { url } = await response.json();
                if (url) window.location.href = url;
            } catch (error) {
                console.error('Checkout error:', error);
            } finally {
                window.dom.checkoutBtn.textContent = 'Pay with Card';
                window.dom.checkoutBtn.disabled = false;
            }
        });
    }

    // Popup listeners (if they exist on the page)
    if(window.dom.popupContinueShopping) window.dom.popupContinueShopping.addEventListener('click', () => { window.dom.addToCartPopup.style.display = 'none'; });
    if(window.dom.popupViewCart) window.dom.popupViewCart.addEventListener('click', () => { window.dom.addToCartPopup.style.display = 'none'; openCart(); });
    if(window.dom.closePopupBtn) window.dom.closePopupBtn.addEventListener('click', () => { window.dom.addToCartPopup.style.display = 'none'; });
});
