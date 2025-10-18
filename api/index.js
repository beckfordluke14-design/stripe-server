document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const LOGO_URL_WHITE = 'https://i.imgur.com/7B5NkbX.png';
    const LOGO_URL_BLACK = 'https://i.imgur.com/mY9JuRX.png';
    
    // --- STATE MANAGEMENT ---
    let product = {};
    let reviews = [];
    let flashSaleTimerInterval = null;

    // ===============================================================================================
    //  == BALACLAVA PRODUCT DETAILS ==
    // ===============================================================================================
    const initialProduct = {
        name: 'ATF V1 "TakeOver" Balaclava [Final Run]',
        description: 'The original ATF V1 "TakeOver" design. This is the final production run of this iconic piece. One size fits all. It\'s more than an accessory, it\'s a statement.',
        ctaHeadline: 'It\'s Time For a TakeOver.',
        ctaSubheadline: 'Designs so unique, they\'re not just accessories—they\'re walking masterpieces.',
        originalPrice: '$45.00',
        theme: 'dark',
        mediaType: 'video',
        mediaUrl: 'https://www.youtube.com/embed/r6BjqteH-c8?autoplay=1&loop=1&playlist=r6BjqteH-c8&controls=0',
        bundlePrices: ['$29.95', '$24.95', '$14.95'], // Price for 1st, 2nd, and 3rd+ item
        variations: {
            'Design': [
                { option: 'V1 - Turbo Edition', image: 'https://i.imgur.com/ghpj3Nm.png' },
                { option: 'V1 - Burble Edition', image: 'https://i.imgur.com/9QcKSwf.png' },
                { option: 'V1 - Burnout Edition', image: 'https://i.imgur.com/lLIgQjD.png' }
            ]
        }
    };

    // ===============================================================================================
    //  == BALACLAVA REVIEWS ==
    // ===============================================================================================
    const initialReviews = [
        { rating: 5, title: "Essential for the TakeOver!", text: "This is the new standard for meetups. So many people asked where I got it at the last event. The quality is next level.", author: "Chris G." },
        { rating: 5, title: "Finally, a design that GETS IT.", text: "Pristine quality, and a design that actually stands out. If you want to break necks, this is it.", author: "Jayden R." },
        { rating: 5, title: "The Burble Edition is insane", text: "Looks even better in person. This is the perfect final touch for my fit when I take my car out.", author: "Leo S." }
    ];
    // ===============================================================================================

    function loadProductData() {
        product = initialProduct;
        reviews = initialReviews;
    }

    // --- UI & CART LOGIC (Page Specific) ---
    function addToCart() {
        // Use the global 'dom' and 'cart' from cart.js
        const selectedDesigns = Array.from(window.dom.interactiveBundleSelector.querySelectorAll('input:checked')).map(input => ({
            name: input.dataset.name,
            image: input.dataset.image
        }));
        
        if (selectedDesigns.length === 0) {
            alert("Please select at least one design.");
            return;
        }

        selectedDesigns.forEach(design => {
            window.cart.push({
                productId: 'balaclava-v1', // Unique ID
                variantId: `${design.name}|${Date.now()}`,
                name: product.name,
                price: product.bundlePrices[0], // Temporary price, corrected in renderCart
                image: design.image,
                variantText: design.name,
                quantity: 1
            });
        });

        // Use global functions from cart.js
        window.saveState();
        window.renderCart(); // Re-render cart panel
        showItemAddedPopup({ mediaUrl: selectedDesigns[0].image, mediaType: 'image' }, `Added <strong>${selectedDesigns.length} items</strong> to your cart!`);
        window.startCartTimer(); // Start the 10-minute cart reservation

        // Track FB Event
        if (typeof fbq === 'function') fbq('track', 'AddToCart');
    }
    
    function showItemAddedPopup(popupProduct, message) {
        clearTimeout(window.dom.popupTimeout);
        window.dom.popupProductImage.src = popupProduct.mediaUrl || 'https.placehold.co/128x128';
        window.dom.popupMessage.innerHTML = message;
        window.dom.addToCartPopup.style.display = 'block';
        window.dom.popupTimeout = setTimeout(() => { window.dom.addToCartPopup.style.display = 'none'; }, 5000);
    }

    function updateBundleSummary() {
        const selectedInputs = Array.from(window.dom.interactiveBundleSelector.querySelectorAll('input:checked'));
        const bundlePrices = product.bundlePrices.map(p => parseFloat(p.replace('$', '')));
        let total = 0;
        let originalTotal = 0;
        
        window.dom.bundleSummaryItems.innerHTML = '';
        if (selectedInputs.length > 0) {
            window.dom.bundleSummary.style.display = 'block';
            selectedInputs.forEach((input, index) => {
                let price = bundlePrices[Math.min(index, bundlePrices.length - 1)];
                total += price;
                originalTotal += parseFloat(product.originalPrice.replace('$', ''));
                const itemEl = document.createElement('div');
                itemEl.className = 'flex justify-between items-center text-sm';
                itemEl.innerHTML = `<span>Item ${index + 1}: ${input.dataset.name}</span><span class="font-bold">$${price.toFixed(2)}</span>`;
                window.dom.bundleSummaryItems.appendChild(itemEl);
            });
        } else {
            window.dom.bundleSummary.style.display = 'none';
        }
        window.dom.productPrice.textContent = `$${total.toFixed(2)}`;
        window.dom.productOriginalPrice.textContent = `$${originalTotal.toFixed(2)}`;
    }

    function renderProduct() {
        document.body.dataset.theme = product.theme || 'light';
        window.dom.headerLogo.src = (product.theme === 'light') ? LOGO_URL_BLACK : LOGO_URL_WHITE;
        window.dom.productName.textContent = product.name;
        window.dom.productDescription.textContent = product.description;
        window.dom.ctaHeadline.textContent = product.ctaHeadline;
        window.dom.ctaSubheadline.textContent = product.ctaSubheadline;
        window.dom.productBadge.textContent = 'Limited Edition Bundle Deal';

        if (product.mediaType === 'video' && product.mediaUrl) {
            window.dom.mainProductImage.style.display = 'none';
            window.dom.mainProductVideoContainer.style.display = 'block';
            window.dom.mainProductVideoContainer.innerHTML = `<iframe class="w-full h-full aspect-video" src="${product.mediaUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        } else {
            window.dom.mainProductImage.style.display = 'block';
            window.dom.mainProductVideoContainer.style.display = 'none';
            window.dom.mainProductImage.src = product.mediaUrl || 'https.placehold.co/600x600';
        }

        window.dom.interactiveBundleSelector.innerHTML = '<h4 class="font-bold text-lg text-gray-800 mb-2">Build Your Bundle & Save!</h4><div class="grid grid-cols-2 sm:grid-cols-3 gap-3"></div>';
        const gridContainer = window.dom.interactiveBundleSelector.querySelector('.grid');
        const designKey = Object.keys(product.variations)[0];

        if (designKey) {
            product.variations[designKey].forEach(variation => {
                const optionId = `bundle-opt-${variation.option.replace(/\s+/g, '-')}`;
                const optionEl = document.createElement('div');
                optionEl.className = 'bundle-image-option';
                optionEl.innerHTML = `
                    <input type="checkbox" id="${optionId}" data-name="${variation.option}" data-image="${variation.image}" class="sr-only">
                    <label for="${optionId}" class="block relative border-2 border-gray-200 rounded-lg cursor-pointer transition-all p-1">
                        <img src="${variation.image}" class="w-full h-24 object-cover rounded-md">
                        <p class="text-center text-sm font-semibold mt-1">${variation.option}</p>
                        <div class="bundle-checkmark absolute top-1 right-1 h-6 w-6 bg-white/70 rounded-full flex items-center justify-center opacity-0 transform scale-75">
                            <svg class="h-4 w-4 text-white" style="fill: var(--color-accent);" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                        </div>
                    </label>
                `;
                gridContainer.appendChild(optionEl);
                optionEl.querySelector('label').addEventListener('click', () => {
                    window.dom.mainProductImage.style.display = 'block';
                    window.dom.mainProductVideoContainer.style.display = 'none';
                    window.dom.mainProductImage.src = variation.image;
                });
            });
            
            const firstBundleOption = window.dom.interactiveBundleSelector.querySelector('input[type="checkbox"]');
            if (firstBundleOption) {
                firstBundleOption.checked = true;
            }
        }
        updateBundleSummary();
    }
    
    function renderReviews() {
        window.dom.reviewContainer.innerHTML = reviews.map(review => {
            const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
            return `<div class="border-b pb-4 last:border-b-0">
                        <div class="flex items-center mb-2"><span class="text-yellow-500">${stars}</span><strong class="ml-2 text-gray-800">${review.title}</strong></div>
                        <p class="text-gray-700">"${review.text}"</p>
                        <p class="text-sm text-gray-500 mt-2">- ${review.author}</p>
                    </div>`;
        }).join('');
    }

    // --- URGENCY & TIMERS ---
    function startFlashSaleTimer() {
        let duration = 20 * 60; // 20 minutes
        clearInterval(flashSaleTimerInterval);
        flashSaleTimerInterval = setInterval(() => {
            if (duration <= 0) {
                clearInterval(flashSaleTimerInterval);
                window.dom.countdownTimer.textContent = "00:00:00";
                return;
            }
            duration--;
            const h = String(Math.floor(duration / 3600)).padStart(2, '0');
            const m = String(Math.floor((duration % 3600) / 60)).padStart(2, '0');
            const s = String(duration % 60).padStart(2, '0');
            window.dom.countdownTimer.textContent = `${h}:${m}:${s}`;
        }, 1000);
    }
    
    function startSocialProof() {
        const locations = ["Miami, FL", "Los Angeles, CA", "London, UK", "Houston, TX", "New York, NY", "Phoenix, AZ", "Chicago, IL", "Toronto, CA", "Sydney, AU", "Berlin, DE"];
        setInterval(() => {
            const loc = locations[Math.floor(Math.random() * locations.length)];
            const name = product.name.split(' ').slice(0, 2).join(' ');
            window.dom.socialProofPopup.innerHTML = `🔥 Someone from <b>${loc}</b> just purchased a ${name}!`;
            window.dom.socialProofPopup.classList.add('show');
            setTimeout(() => { window.dom.socialProofPopup.classList.remove('show'); }, 5000);
        }, 15000);
    }
    
    // --- INITIALIZATION ---
    function initializeApp() {
        loadProductData();
        renderProduct();
        renderReviews();
        startFlashSaleTimer(); 
        startSocialProof();

        // Page-specific Event Listeners
        window.dom.addToCartButton.addEventListener('click', addToCart);
        window.dom.interactiveBundleSelector.addEventListener('change', updateBundleSummary);
    }

    initializeApp();
});
