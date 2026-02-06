const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
// app.use(express.static(path.join(__dirname, '../')));
// Add this line - serve HTML files from root
app.use(express.static(__dirname + '/..'));
// In-memory subscription store (in production, use a database)
const subscriptions = new Map();

// ========================================
// PRICE DROP SUBSCRIPTION ENDPOINT
// ========================================
app.post('/subscribe-price-drop', (req, res) => {
    try {
        const { email, product } = req.body;

        // Validation
        if (!email || !email.includes('@')) {
            return res.status(400).json({
                ok: false,
                error: 'Invalid email address'
            });
        }

        if (!product || !product.name) {
            return res.status(400).json({
                ok: false,
                error: 'Product information is required'
            });
        }

        // Create subscription key
        const subscriptionKey = `${email}-${product.url}`;

        // Check if already subscribed
        if (subscriptions.has(subscriptionKey)) {
            return res.status(409).json({
                ok: false,
                error: 'Already subscribed to this product'
            });
        }

        // Store subscription
        subscriptions.set(subscriptionKey, {
            email,
            product,
            subscribedAt: new Date().toISOString()
        });

        console.log(`✅ New subscription: ${email} for ${product.name}`);
        console.log(`📊 Total subscriptions: ${subscriptions.size}`);

        // Success response
        res.status(200).json({
            ok: true,
            message: 'Successfully subscribed to price drops',
            subscription: subscriptionKey
        });

    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({
            ok: false,
            error: 'Internal server error'
        });
    }
});
// ========================================
//  Serve working-demo.html ENDPOINTS
// ========================================
// Serve working-demo.html
app.get('/working-demo.html', (req, res) => {
    const filePath = path.join(__dirname, '../working-demo.html');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        // Create it on the fly
        res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Working Demo</title></head>
        <body>
            <h1>✅ Widget is Working!</h1>
            <p>Widget loaded successfully</p>
            <div id="widget"></div>
            <script src="/widget/dist/price-drop-widget.min.js"></script>
            <script>
                new PriceDropWidget({
                    productName: "Test Product",
                    productPrice: "$ 99.99",
                    container: "#widget"
                });
            </script>
        </body>
        </html>
        `);
    }
});
// ========================================
// ADMIN ENDPOINTS
// ========================================

// Get all subscriptions
app.get('/admin/subscriptions', (req, res) => {
    const subscriptionsList = Array.from(subscriptions.entries()).map(([key, value]) => ({
        key,
        ...value
    }));

    res.json({
        total: subscriptionsList.length,
        subscriptions: subscriptionsList
    });
});

// Get subscriptions for a specific product
app.get('/admin/subscriptions/:productUrl', (req, res) => {
    const { productUrl } = req.params;
    const decodedUrl = decodeURIComponent(productUrl);

    const filtered = Array.from(subscriptions.entries())
        .filter(([_, value]) => value.product.url === decodedUrl)
        .map(([key, value]) => ({ key, ...value }));

    res.json({
        productUrl: decodedUrl,
        count: filtered.length,
        subscriptions: filtered
    });
});

// Delete a subscription
app.delete('/admin/subscriptions/:key', (req, res) => {
    const { key } = req.params;
    
    if (subscriptions.has(key)) {
        subscriptions.delete(key);
        res.json({ ok: true, message: 'Subscription deleted' });
    } else {
        res.status(404).json({ ok: false, error: 'Subscription not found' });
    }
});

// ========================================
// DEMO PAGE
// ========================================

app.get('/', (req, res) => {
    const demoHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Price Drop Widget Demo</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .container {
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                max-width: 900px;
                width: 100%;
                padding: 40px;
            }

            .header {
                text-align: center;
                margin-bottom: 40px;
            }

            h1 {
                color: #1f2937;
                margin-bottom: 10px;
                font-size: 28px;
            }

            .subtitle {
                color: #6b7280;
                font-size: 16px;
            }

            .demo-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-bottom: 40px;
            }

            @media (max-width: 768px) {
                .demo-grid {
                    grid-template-columns: 1fr;
                    gap: 30px;
                }
            }

            .demo-section h2 {
                color: #1f2937;
                font-size: 18px;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #e5e7eb;
            }

            .product {
                background: #f9fafb;
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 20px;
                border: 1px solid #e5e7eb;
            }

            .product-image {
                width: 100%;
                height: 180px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 48px;
                margin-bottom: 15px;
            }

            .product-name {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 5px;
            }

            .product-price {
                font-size: 20px;
                color: #10b981;
                font-weight: bold;
                margin-bottom: 15px;
            }

            #widget-container-1,
            #widget-container-2 {
                min-height: 280px;
            }

            .footer {
                text-align: center;
                padding-top: 30px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }

            .code-block {
                background: #1f2937;
                color: #e5e7eb;
                padding: 15px;
                border-radius: 8px;
                font-size: 12px;
                overflow-x: auto;
                margin-top: 10px;
            }

            .code-block code {
                font-family: 'Monaco', 'Courier New', monospace;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>💸 Price Drop Widget Demo</h1>
                <p class="subtitle">Get notified when prices drop on your favorite products</p>
            </div>

            <div class="demo-grid">
                <!-- Product 1: Laptop -->
                <div class="demo-section">
                    <h2>Product 1: Premium Laptop</h2>
                    <div class="product">
                        <div class="product-image">💻</div>
                        <div class="product-name">ProBook 15" Ultra</div>
                        <div class="product-price">$ 999.99</div>
                        <div id="widget-container-1"></div>
                    </div>
                </div>

                <!-- Product 2: Headphones -->
                <div class="demo-section">
                    <h2>Product 2: Wireless Headphones</h2>
                    <div class="product">
                        <div class="product-image">🎧</div>
                        <div class="product-name">SoundMax Pro</div>
                        <div class="product-price">$ 299.99</div>
                        <div id="widget-container-2"></div>
                    </div>
                </div>
            </div>

            <div class="footer">
                <p>✅ Integration test page | Check admin panel at <strong>/admin/subscriptions</strong></p>
            </div>
        </div>

        <!-- Load the widget -->
        <script src="/widget/dist/price-drop-widget.min.js"></script>

        <script>
            // Initialize first widget
            const widget1 = new PriceDropWidget({
                productName: 'ProBook 15" Ultra',
                productPrice: '$ 1,299.99',
                productUrl: 'https://example.com/probook-15-ultra',
                container: '#widget-container-1',
                apiUrl: '/subscribe-price-drop'
            });

            // Initialize second widget
            const widget2 = new PriceDropWidget({
                productName: 'SoundMax Pro',
                productPrice: '$ 299.99',
                productUrl: 'https://example.com/soundmax-pro',
                container: '#widget-container-2',
                apiUrl: '/subscribe-price-drop'
            });

            console.log('✅ Both widgets initialized successfully');
        </script>
    </body>
    </html>
    `;

    res.send(demoHTML);
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: 'The requested endpoint does not exist'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
    console.log('');
    console.log('🚀 Price Drop Widget Server');
    console.log('─'.repeat(50));
    console.log(`📍 Server running at: http://localhost:${PORT}`);
    console.log(`🎯 Demo page: http://localhost:${PORT}/`);
    console.log(`📊 Admin API: http://localhost:${PORT}/admin/subscriptions`);
    console.log('');
    console.log('Available endpoints:');
    console.log('  POST   /subscribe-price-drop     - Subscribe to price drops');
    console.log('  GET    /admin/subscriptions       - View all subscriptions');
    console.log('  GET    /admin/subscriptions/:url  - View subscriptions for product');
    console.log('  DELETE /admin/subscriptions/:key  - Remove a subscription');
    console.log('─'.repeat(50));
    console.log('');
});
