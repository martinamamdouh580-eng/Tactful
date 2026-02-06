// Demo page widget initialization (CSP compliant - external script)
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the demo widget
    if (window.PriceDropWidget) {
        const widget = new PriceDropWidget({
            productName: 'iPhone 15 Pro',
            productPrice: '$999.00',
            productUrl: 'https://example.com/iphone-15-pro',
            apiUrl: '/subscribe-price-drop',
            container: '#widget-demo'
        });
    } else {
        console.error('PriceDropWidget not loaded');
    }
});
