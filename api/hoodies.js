document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const LOGO_URL_WHITE = 'https://i.imgur.com/7B5NkbX.png';
    const LOGO_URL_BLACK = 'https://i.imgur.com/mY9JuRX.png';
    
    // --- STATE MANAGEMENT ---
    let product = {};
    let reviews = [];
    // --- flashSaleTimerInterval REMOVED ---

    // ===============================================================================================
    //  == HOODIE PRODUCT DETAILS ==
    // ===============================================================================================
    const initialProduct = {
        name: 'ATF Signature Hoodie',
        description: 'The new standard for comfort and style. Heavyweight cotton fleece, custom tag, and our signature "TakeOver" design. Available in three essential colors.',
        ctaHeadline: 'The New Standard.',
        ctaSubheadline: 'Comfort and design, unified.',
        originalPrice: '', // No "was" price
        theme: 'dark',
        mediaType: 'image', // Default to image
        mediaUrl: 'https://i.imgur.com/v17yX27l.png', // Placeholder for first hoodie
        bundlePrices: ['$59.95'], // **** SINGLE PRICE - NO BUNDLE DISCOUNT ****
        variations: {
            'Color': [
                { option: 'Signature Black', image: 'https://i.imgur.com/v17yX27l.png' }, // Placeholder 1
                { option: 'Heather Grey', image: 'https://i.imgur.com/R3pE5aAl.png' },  // Placeholder 2
                { option: 'Midnight Blue', image: 'https://i.imgur.com/g0tS48sl.png' }  // Placeholder 3
            ]
        }
    };

    // ===============================================================================================
    //  == HOODIE REVIEWS ==
    // ===============================================================================================
    const initialReviews = [
        { rating: 5, title: "Best hoodie I own.", text: "The quality is insane. It's thick, comfortable, and the design gets compliments everywhere. Worth every penny.", author: "Mike T." },
        { rating: 5, title: "Finally!", text: "Been waiting for ATF to drop hoodies and they delivered. Fit is perfect.", author: "Sarah L." }
    ];
    // ===============================================================================================

    function loadProductData() {
        product = initialProduct;
        reviews = initialReviews;
    }

    // --- UI & CART LOGIC (Page Specific) ---
    function addToCart() {
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
                productId: 'atf-hoodie', // Unique ID
                variantId: `${design.name}|${Date.now()}`,
                name: product.name,
                price: product.bundlePrices[0], // Will always use the single price
                image: design.image,
                variantText: design.name,
                quantity: 1
            });
        });

        window.saveState();
        window.renderCart(); 
        showItemAddedPopup({ mediaUrl: selectedDesigns[0].image, mediaType: 'image' }, `Added <strong>${selectedDesigns.length} items</strong> to your cart!`);
        window.startCartTimer(); 

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
        // --- originalTotal REMOVED ---
        
        window.dom.bundleSummaryItems.innerHTML = '';
        if (selectedInputs.length > 0) {
            window.dom.bundleSummary.style.display = 'block';
            selectedInputs.forEach((input, index) => {
                let price = bundlePrices[Math.min(index, bundlePrices.length - 1)]; // This logic now just picks the one price
                total += price;
                const itemEl = document.createElement('div');
                itemEl.className = 'flex justify-between items-center text-sm';
                itemEl.innerHTML = `<span>Item ${index + 1}: ${input.dataset.name}</span><span class="font-bold">$${price.toFixed(2)}</span>`;
                window.dom.bundleSummaryItems.appendChild(itemEl);
            });
        } else {
            window.dom.bundleSummary.style.display = 'none';
        }
        window.dom.productPrice.textContent = `$${total.toFixed(2)}`;
        // --- productOriginalPrice update REMOVED ---
    }

    function renderProduct() {
        document.body.dataset.theme = product.theme || 'light';
        window.dom.headerLogo.src = (product.theme === 'light') ? LOGO_URL_BLACK : LOGO_URL_WHITE;
        window.dom.productName.textContent = product.name;
        window.dom.productDescription.textContent = product.description;
        window.dom.ctaHeadline.textContent = product.ctaHeadline;
        window.dom.ctaSubheadline.textContent = product.ctaSubheadline;
        window.dom.productBadge.textContent = 'Signature Collection'; // Changed badge

        // --- VIDEO LOGIC REMOVED ---
        window.dom.mainProductImage.style.display = 'block';
        window.dom.mainProductImage.src = product.mediaUrl;

        // Title changed
        window.dom.interactiveBundleSelector.innerHTML = '<h4 class="font-bold text-lg text-gray-800 mb-2">Choose Your Color</h4><div class="grid grid-cols-2 sm:grid-cols-3 gap-3"></div>';
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
                    // Update main image on click
                    window.dom.mainProductImage.src = variation.image;
                });
            });
            
            // Auto-select first option
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

    // --- startFlashSaleTimer REMOVED ---
    
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
        // --- startFlashSaleTimer call REMOVED ---
        startSocialProof();

        // Page-specific Event Listeners
        window.dom.addToCartButton.addEventListener('click', addToCart);
        window.dom.interactiveBundleSelector.addEventListener('change', updateBundleSummary);
    }

    initializeApp();
});
