# 🔧 Embedding the Widget

Complete guide for integrating the Price Drop Widget into your website using multiple methods.

## Method 1: Direct Script Tag

The most straightforward way to embed the widget with full control.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Page with Price Drop Widget</title>
</head>
<body>
    <h1>Product Name</h1>
    <p>Current Price: $99.99</p>
    
    <!-- Widget container -->
    <div id="price-drop-container"></div>

    <!-- Load widget script -->
    <script src="http://your-domain.com/widget/dist/price-drop-widget.min.js"></script>
    
    <!-- Initialize widget -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            new PriceDropWidget({
                productName: "Product Name",
                productPrice: "$99.99",
                productUrl: "https://example.com/product",
                container: "#price-drop-container",
                apiUrl: "http://your-domain.com/subscribe-price-drop"
            });
        });
    </script>
</body>
</html>
```

**Advantages:**
- ✅ Full control over widget initialization
- ✅ Can pass custom options
- ✅ Works with existing JavaScript
- ✅ No dependencies

**Limitations:**
- Requires inline script tags
- Manual initialization needed

---

## Method 2: Data Attributes

Auto-initialize widget using HTML data attributes (CSP-friendly).

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Page with Price Drop Widget</title>
</head>
<body>
    <h1>Product Name</h1>
    <p>Current Price: $99.99</p>
    
    <!-- Widget with data attributes -->
    <div data-price-drop-widget
         data-product-name="Premium Laptop"
         data-product-price="$1,299.99"
         data-product-url="https://example.com/laptops/premium-laptop"
         data-api-url="http://your-domain.com/subscribe-price-drop">
    </div>

    <!-- Load widget script -->
    <script src="http://your-domain.com/widget/dist/price-drop-widget.min.js"></script>
    
    <!-- Auto-initialization script (external file) -->
    <script src="/js/auto-init-widgets.js"></script>
</body>
</html>
```

**Auto-initialization script** (`auto-init-widgets.js`):
```javascript
// Auto-initialize all widgets with data attributes
document.addEventListener('DOMContentLoaded', function() {
    const widgets = document.querySelectorAll('[data-price-drop-widget]');
    
    widgets.forEach(element => {
        if (window.PriceDropWidget) {
            new PriceDropWidget({
                productName: element.dataset.productName,
                productPrice: element.dataset.productPrice,
                productUrl: element.dataset.productUrl,
                apiUrl: element.dataset.apiUrl || '/subscribe-price-drop',
                container: element
            });
        }
    });
});
```

**Advantages:**
- ✅ No inline scripts (CSP compliant)
- ✅ Declarative HTML
- ✅ Multiple widgets on one page
- ✅ Easy to use

**Limitations:**
- Requires data attribute support
- Limited customization options

---

## Method 3: Iframe Embed (Cross-domain)

For embedding on third-party sites without JavaScript access.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Third-party Site with Price Drop Widget</title>
</head>
<body>
    <h1>Product Listing</h1>
    <p>Check out this amazing product!</p>
    
    <!-- Embed widget via iframe -->
    <iframe 
        src="http://your-domain.com/embed/price-drop.html?name=Premium+Laptop&price=$1299.99&url=https://example.com/product"
        width="400"
        height="300"
        style="border: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    </iframe>

    <p>Get notified when the price drops!</p>
</body>
</html>
```

**URL Parameters:**
- `name` - Product name (URL encoded)
- `price` - Current price
- `url` - Product URL

**Example URLs:**
```
http://your-domain.com/embed/price-drop.html?name=iPhone+15+Pro&price=$999.00&url=https://example.com/iphone-15-pro

http://your-domain.com/embed/price-drop.html?name=Sony+WH-1000XM5&price=$348.00&url=https://amazon.com/dp/B08Q7QZD77
```

**Advantages:**
- ✅ Works across domains
- ✅ Sandboxed (no conflicts)
- ✅ No script injection needed
- ✅ Auto-resizes height

**Limitations:**
- Slightly larger footprint
- Limited CSS customization
- Requires message API support

---

## Method 4: Tampermonkey Userscript

Auto-inject on e-commerce sites (Amazon, eBay, AliExpress, etc.)

1. **Install Tampermonkey:**
   - Chrome: [Tampermonkey](https://chrome.google.com/webstore/detail/dhdgffkkebhmkfjojejmpbldmpobp55f)
   - Firefox: [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/)
   - Edge: [Tampermonkey](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmaeewlvlcjpindfo)

2. **Create new script with code from:**
   ```
   userscript/price-drop-injector.user.js
   ```

3. **Customize URLs:**
   ```javascript
   const CONFIG = {
       API_URL: 'http://your-domain.com/subscribe-price-drop',
       WIDGET_URL: 'http://your-domain.com/widget/dist/price-drop-widget.min.js',
       EMBED_URL: 'http://your-domain.com/embed/price-drop.html'
   };
   ```

**Advantages:**
- ✅ Auto-injects on supported sites
- ✅ No code modification needed
- ✅ Works on any site
- ✅ Per-user installation

---

## Real-World Examples

### Example 1: E-commerce Product Page

```html
<!DOCTYPE html>
<html>
<head>
    <title>Premium Laptop - Shop</title>
    <style>
        .product-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .product-info { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .product-image { background: #f0f0f0; padding: 20px; border-radius: 8px; }
        .product-details h1 { font-size: 28px; margin-bottom: 10px; }
        .price { font-size: 24px; color: #10b981; font-weight: bold; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="product-container">
        <div class="product-info">
            <div class="product-image">
                <img src="laptop.jpg" alt="Premium Laptop" style="width: 100%;">
            </div>
            <div class="product-details">
                <h1>MacBook Pro 16" M3 Max</h1>
                <div class="price">$3,499.00</div>
                <p>High-performance laptop for professionals.</p>
                
                <!-- Price Drop Widget -->
                <div id="price-drop-widget"></div>
            </div>
        </div>
    </div>

    <script src="http://your-domain.com/widget/dist/price-drop-widget.min.js"></script>
    <script>
        new PriceDropWidget({
            productName: "MacBook Pro 16\" M3 Max",
            productPrice: "$3,499.00",
            productUrl: window.location.href,
            container: "#price-drop-widget",
            apiUrl: "http://your-domain.com/subscribe-price-drop"
        });
    </script>
</body>
</html>
```

### Example 2: Sidebar Widget

```html
<aside class="sidebar">
    <h3>Price Tracking</h3>
    <div id="price-widget"></div>
</aside>

<script src="http://your-domain.com/widget/dist/price-drop-widget.min.js"></script>
<script>
    new PriceDropWidget({
        productName: document.title,
        productPrice: document.querySelector('.price').textContent,
        productUrl: window.location.href,
        container: "#price-widget",
        accentColor: "#ff6b6b"
    });
</script>
```

### Example 3: Multiple Products

```html
<div class="product-grid">
    <div class="product-card">
        <h3>Product 1</h3>
        <p>$99.99</p>
        <div class="widget" data-price-drop-widget
             data-product-name="Product 1"
             data-product-price="$99.99"
             data-product-url="https://example.com/product1"></div>
    </div>
    
    <div class="product-card">
        <h3>Product 2</h3>
        <p>$149.99</p>
        <div class="widget" data-price-drop-widget
             data-product-name="Product 2"
             data-product-price="$149.99"
             data-product-url="https://example.com/product2"></div>
    </div>
</div>

<script src="http://your-domain.com/widget/dist/price-drop-widget.min.js"></script>
<script>
    document.querySelectorAll('[data-price-drop-widget]').forEach(el => {
        new PriceDropWidget({
            productName: el.dataset.productName,
            productPrice: el.dataset.productPrice,
            productUrl: el.dataset.productUrl,
            container: el
        });
    });
</script>
```

---

## CSS Customization

### Override Colors

```css
.price-drop-widget {
    --pd-accent-color: #ff6b6b;      /* Primary color */
    --pd-background-color: #ffffff;  /* Widget background */
    --pd-text-color: #1f2937;        /* Text color */
    --pd-border-color: #e5e7eb;      /* Border color */
    --pd-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
```

### Custom Styling

```html
<style>
    .price-drop-widget {
        border: 2px solid #ff6b6b !important;
        border-radius: 16px !important;
    }
    
    .pdw-submit-btn {
        background-color: #ff6b6b !important;
        border-radius: 50px !important;
    }
</style>
```

---

## Troubleshooting

### Widget Not Showing
- Check console for errors
- Verify script URL is correct
- Ensure container element exists
- Check for CSP violations

### Script Loading Fails
- Verify domain and port
- Check CORS headers
- Try iframe fallback
- Check browser network tab

### Email Validation Issues
- Clear localStorage
- Check email format
- Verify regex pattern
- Test in different browser

---

## Testing the Widget

### Quick Test

```html
<!DOCTYPE html>
<html>
<head>
    <title>Widget Test</title>
</head>
<body>
    <h1>Test Page</h1>
    <div id="test-widget"></div>
    
    <script src="http://localhost:3000/widget/dist/price-drop-widget.min.js"></script>
    <script>
        new PriceDropWidget({
            productName: "Test Product",
            productPrice: "$99.99",
            productUrl: "https://example.com/test",
            container: "#test-widget"
        });
    </script>
</body>
</html>
```

### Browser DevTools

```javascript
// In console:
new PriceDropWidget({
    productName: "Console Test",
    productPrice: "$199.99",
    productUrl: window.location.href,
    container: document.body
});
```

---

## Performance Tips

1. **Load script asynchronously:**
   ```html
   <script async src="http://your-domain.com/widget/dist/price-drop-widget.min.js"></script>
   ```

2. **Defer initialization:**
   ```html
   <script defer src="widget.min.js"></script>
   ```

3. **Use data attributes** for CSP compliance

4. **Cache the widget script:**
   - Set cache headers on server
   - Use CDN for global distribution

---

## Support & Issues

- Check browser console for errors
- Verify API endpoint is accessible
- Check server logs
- Review README.md for more info
