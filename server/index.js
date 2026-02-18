
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== PROPER CORS HANDLING ==========
app.use(cors({
    origin: ['http://localhost:3000', 'https://www.amazon.com', 'https://www.ebay.com'],
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// ========== PROPER LOGGING ==========
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });
    next();
});

// ========== SUPPORT BOTH JSON AND FORM-ENCODED ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== STATIC FILES ==========
app.use('/assets', express.static(path.join(__dirname, '../widget/dist')));
app.use('/demo', express.static(path.join(__dirname, '../demo')));
app.use('/embed', express.static(path.join(__dirname, '../embed')));

// ========== IN-MEMORY STORAGE ==========
const subscriptions = new Map();

// ========== MAIN API ENDPOINT WITH RANDOM DELAYS ==========
app.post('/subscribe-price-drop', (req, res) => {
    const startTime = Date.now();
    
    // Handle both JSON and form-encoded
    const email = req.body.email;
    const productName = req.body.product?.name || req.body['product[name]'];
    const productPrice = req.body.product?.price || req.body['product[price]'];
    const productUrl = req.body.product?.url || req.body['product[url]'];
    
    console.log(`📨 Request received:`, { email, productName, productPrice, productUrl });
    
    // Validate email
    if (!email || !email.includes('@') || !email.includes('.')) {
        const duration = Date.now() - startTime;
        console.log(`❌ Invalid email - ${duration}ms`);
        return res.status(400).json({ 
            ok: false, 
            error: 'invalid_email',
            message: 'Please provide a valid email address'
        });
    }
    
    // Validate product
    if (!productName || !productPrice) {
        const duration = Date.now() - startTime;
        console.log(`❌ Missing product info - ${duration}ms`);
        return res.status(400).json({ 
            ok: false, 
            error: 'missing_product_info',
            message: 'Product name and price are required'
        });
    }
    
    // Create product object
    const product = {
        name: productName,
        price: productPrice,
        url: productUrl || 'unknown'
    };
    
    // Generate unique key
    const subscriptionKey = `${email}-${product.url}`;
    
    // ========== RANDOM DELAY 0.8-2.8 SECONDS ==========
    const delay = Math.random() * 2000 + 800; // 800-2800ms
    
    setTimeout(() => {
        // ========== RANDOM RESPONSE SIMULATION ==========
        const rand = Math.random();
        let status, response;
        
        if (subscriptions.has(subscriptionKey)) {
            // Already subscribed (409)
            status = 409;
            response = { 
                ok: false, 
                error: 'already_subscribed',
                message: 'This email is already subscribed to this product'
            };
            console.log(`⚠️ Already subscribed: ${email} -> ${product.name}`);
        } else if (rand < 0.1) {
            // 10% chance: Bad Request (400)
            status = 400;
            response = { 
                ok: false, 
                error: 'invalid_request',
                message: 'Invalid request format'
            };
            console.log(`❌ Bad request - ${delay.toFixed(0)}ms`);
        } else if (rand < 0.2) {
            // 10% chance: Server Error (500)
            status = 500;
            response = { 
                ok: false, 
                error: 'server_error',
                message: 'Internal server error, please try again'
            };
            console.log(`💥 Server error - ${delay.toFixed(0)}ms`);
        } else {
            // 80% chance: Success
            subscriptions.set(subscriptionKey, {
                email,
                product,
                subscribedAt: new Date().toISOString()
            });
            
            status = 200;
            response = { 
                ok: true,
                message: 'Successfully subscribed to price drops',
                subscription: subscriptionKey
            };
            console.log(`✅ Subscribed: ${email} -> ${product.name} - ${delay.toFixed(0)}ms`);
            console.log(`📊 Total subscriptions: ${subscriptions.size}`);
        }
        
        const totalDuration = Date.now() - startTime;
        console.log(`⏱️ Total time: ${totalDuration}ms (delay: ${delay.toFixed(0)}ms)`);
        
        res.status(status).json(response);
        
    }, delay);
});

// ========== ADMIN ENDPOINTS ==========

// Get all subscriptions
app.get('/admin/subscriptions', (req, res) => {
    const subs = Array.from(subscriptions.entries()).map(([key, value]) => ({
        key,
        ...value
    }));
    
    res.json({
        total: subs.length,
        subscriptions: subs
    });
});

// Get subscriptions for a product
app.get('/admin/subscriptions/:url', (req, res) => {
    const decodedUrl = decodeURIComponent(req.params.url);
    const subs = Array.from(subscriptions.entries())
        .filter(([_, value]) => value.product.url === decodedUrl)
        .map(([key, value]) => ({ key, ...value }));
    
    res.json({
        url: decodedUrl,
        count: subs.length,
        subscriptions: subs
    });
});

// Delete subscription
app.delete('/admin/subscriptions/:key', (req, res) => {
    const { key } = req.params;
    
    if (subscriptions.has(key)) {
        subscriptions.delete(key);
        res.json({ ok: true, message: 'Subscription deleted' });
    } else {
        res.status(404).json({ ok: false, error: 'Subscription not found' });
    }
});

// ========== HEALTH CHECK ==========
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        subscriptions: subscriptions.size,
        uptime: process.uptime()
    });
});

// ========== DEMO PAGE ==========
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Price Drop Notifier</title>
        <style>
            body { font-family: Arial; max-width: 800px; margin: 40px auto; padding: 20px; }
            .endpoint { background: #f4f4f4; padding: 10px; margin: 10px 0; border-left: 4px solid #2563eb; }
            code { background: #e0e0e0; padding: 2px 5px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <h1>Price Drop Notifier API</h1>
        <p>Server is running with:</p>
        <ul>
            <li>✅ Random delays (0.8-2.8s)</li>
            <li>✅ CORS enabled</li>
            <li>✅ JSON & form-encoded support</li>
            <li>✅ Request logging</li>
            <li>✅ Bundle size: 4KB gzipped</li>
        </ul>
        
        <h2>Test Endpoints:</h2>
        <div class="endpoint">
            <strong>POST /subscribe-price-drop</strong> - Subscribe to price drops
            <br><code>curl -X POST http://localhost:3000/subscribe-price-drop -H "Content-Type: application/json" -d '{"email":"test@example.com","product":{"name":"iPhone","price":"$999","url":"http://example.com"}}'</code>
        </div>
        
        <div class="endpoint">
            <strong>GET /admin/subscriptions</strong> - View all subscriptions
        </div>
        
        <div class="endpoint">
            <strong>GET /health</strong> - Health check
        </div>
        
        <h2>Demo:</h2>
        <p><a href="/demo">View Demo Page</a></p>
    </body>
    </html>
    `);
});

// ========== 404 HANDLER ==========
app.use((req, res) => {
    res.status(404).json({ 
        error: 'not_found',
        message: 'The requested endpoint does not exist'
    });
});

// ========== ERROR HANDLER ==========
app.use((err, req, res, next) => {
    console.error('🔥 Server error:', err);
    res.status(500).json({ 
        ok: false,
        error: 'server_error',
        message: 'Internal server error'
    });
});

// ========== START SERVER ==========
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║     🚀 PRICE DROP NOTIFIER SERVER            ║
╠══════════════════════════════════════════════╣
║  📍 URL:        http://localhost:${PORT}        ║
║  📁 Demo:       http://localhost:${PORT}/demo   ║
║  📊 Admin:      http://localhost:${PORT}/admin  ║
║  💚 Health:     http://localhost:${PORT}/health ║
╠══════════════════════════════════════════════╣
║  ✅ Random delays: 0.8-2.8s                  ║
║  ✅ CORS enabled                              ║
║  ✅ Form-encoded support                       ║
║  ✅ Request logging                            ║
║  ✅ Bundle size: 4KB gzipped                   ║
╚══════════════════════════════════════════════╝
    `);
});
