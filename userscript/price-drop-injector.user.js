// ==UserScript==
// @name         Price Drop Notifier
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Injects price drop widget on Amazon and eBay product pages
// @author       Martina Mamdouh
// @match        https://www.amazon.com/*
// @match        https://www.amazon.co.uk/*
// @match        https://www.amazon.de/*
// @match        https://www.amazon.fr/*
// @match        https://www.ebay.com/*
// @match        https://www.ebay.co.uk/*
// @match        https://www.ebay.de/*
// @match        https://www.ebay.fr/*
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    
    console.log('💰 Price Drop Notifier: Script loaded');
    
    // Configuration
    const CONFIG = {
        API_URL: 'http://localhost:3000/subscribe-price-drop',
        WIDGET_URL: 'http://localhost:3000/assets/price-drop-widget.min.js',
        EMBED_URL: 'http://localhost:3000/embed/price-drop.html',
        
        // Check if on product page
        isProductPage: function() {
            const url = window.location.href;
            const host = window.location.hostname;
            
            if (host.includes('amazon')) {
                return url.includes('/dp/') || url.includes('/gp/product/');
            }
            if (host.includes('ebay')) {
                return url.includes('/itm/');
            }
            return false;
        },
        
        // Extract product info based on site
        extractProductInfo: function() {
            const host = window.location.hostname;
            let name = '', price = '';
            
            if (host.includes('amazon')) {
                // Amazon selectors
                name = document.querySelector('#productTitle')?.textContent?.trim() || '';
                
                // Handle Amazon's price format
                const priceWhole = document.querySelector('.a-price-whole')?.textContent?.trim() || '';
                const priceFraction = document.querySelector('.a-price-fraction')?.textContent?.trim() || '';
                price = priceWhole + (priceFraction ? '.' + priceFraction : '');
                
                if (price && !price.includes('$')) price = '$' + price;
            }
            
            if (host.includes('ebay')) {
                // eBay selectors
                name = document.querySelector('.x-item-title__mainTitle')?.textContent?.trim() ||
                       document.querySelector('.it-ttl')?.textContent?.trim() || '';
                
                price = document.querySelector('.x-price-primary')?.textContent?.trim() ||
                        document.querySelector('.display-price')?.textContent?.trim() || '';
            }
            
            // Clean up
            name = name.substring(0, 200).replace(/\s+/g, ' ').trim();
            price = price.replace(/\s+/g, ' ').trim();
            
            return { name, price, url: window.location.href.split('?')[0] };
        },
        
        // Find insertion point
        getInsertionPoint: function() {
            const host = window.location.hostname;
            
            if (host.includes('amazon')) {
                return document.querySelector('#apex_desktop, #desktop_qualifiedBuyBox, #buybox') || 
                       document.querySelector('.a-section.a-spacing-none') ||
                       document.body;
            }
            
            if (host.includes('ebay')) {
                return document.querySelector('.x-buy-box, .ux-layout-section, #mainContent') ||
                       document.body;
            }
            
            return document.body;
        }
    };
    
    // Only run on product pages
    if (!CONFIG.isProductPage()) {
        console.log('Price Drop: Not a product page, exiting');
        return;
    }
    
    // Wait for page to fully load
    setTimeout(() => {
        const productInfo = CONFIG.extractProductInfo();
        
        if (!productInfo.name || !productInfo.price) {
            console.log('Price Drop: Could not extract product info');
            return;
        }
        
        console.log('Price Drop: Found product:', productInfo);
        
        // Check if already subscribed
        const storageKey = `pd-sub-${productInfo.url}`;
        if (localStorage.getItem(storageKey)) {
            console.log('Price Drop: Already subscribed to this product');
            return;
        }
        
        // Create container
        const container = document.createElement('div');
        container.id = 'price-drop-widget-container';
        container.style.cssText = `
            margin: 20px 0;
            padding: 15px;
            background: white;
            border: 2px solid #2563eb;
            border-radius: 12px;
            min-height: 200px;
            position: relative;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        `;
        
        // Add loading indicator
        container.innerHTML = '<div style="text-align:center; padding:40px;">Loading price drop widget...</div>';
        
        // Insert into page
        const insertionPoint = CONFIG.getInsertionPoint();
        insertionPoint.parentNode.insertBefore(container, insertionPoint.nextSibling);
        
        // Try to load widget script
        const script = document.createElement('script');
        script.src = CONFIG.WIDGET_URL;
        
        script.onload = function() {
            if (window.PriceDropWidget) {
                container.innerHTML = ''; // Clear loading
                
                const widget = new PriceDropWidget({
                    productName: productInfo.name,
                    productPrice: productInfo.price,
                    productUrl: productInfo.url,
                    apiUrl: CONFIG.API_URL,
                    container: container
                });
                
                // Save to localStorage on success
                widget.onSubscribe = function() {
                    localStorage.setItem(storageKey, 'true');
                };
                
                console.log('Price Drop: Widget initialized successfully');
            } else {
                fallbackToIframe(container, productInfo);
            }
        };
        
        script.onerror = function() {
            fallbackToIframe(container, productInfo);
        };
        
        document.head.appendChild(script);
        
        function fallbackToIframe(container, info) {
            container.innerHTML = `
                <iframe 
                    src="${CONFIG.EMBED_URL}?name=${encodeURIComponent(info.name)}&price=${encodeURIComponent(info.price)}&url=${encodeURIComponent(info.url)}"
                    style="width:100%; height:250px; border:none; border-radius:8px;"
                ></iframe>
            `;
            console.log('Price Drop: Using iframe fallback');
        }
        
    }, 2000); // Wait 2 seconds for page to load
    
})();
