const fs = require('fs');
const path = require('path');

console.log(' Building Price Drop Widget...');

// Ensure dist folder exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// ========================================
// 1. WIDGET JAVASCRIPT SOURCE
// ========================================
const widgetSource = `
// Price Drop Widget
(function(global, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        global.PriceDropWidget = factory();
    }
})(typeof self !== 'undefined' ? self : this, function() {
    'use strict';
    
    const EMAIL_REGEX = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    
    class PriceDropWidget {
        constructor(options = {}) {
            this.config = {
                productName: options.productName || '',
                productPrice: options.productPrice || '',
                productUrl: options.productUrl || global.location.href,
                apiUrl: options.apiUrl || '/subscribe-price-drop',
                container: options.container || null,
                accentColor: options.accentColor || '#2563eb',
                ...options
            };
            
            this.state = 'idle'; // idle, submitting, success, error
            this.elements = {};
            this.init();
        }
        
        init() {
            this.createDOM();
            this.render();
            this.bindEvents();
            this.reserveSpace();
        }
        
        createDOM() {
            // Create main container
            this.container = document.createElement('div');
            this.container.className = 'price-drop-widget';
            this.container.setAttribute('data-widget', 'price-drop');
            
            // HTML structure
            this.container.innerHTML = \`
                <div class="pdw-container">
                    <h3 class="pdw-title"> Price Drop Alert</h3>
                    <p class="pdw-description">We'"'"'ll email you when the price drops</p>
                    
                    <form class="pdw-form" novalidate>
                        <div class="pdw-input-group">
                            <input 
                                type="email" 
                                class="pdw-email-input" 
                                placeholder="your@email.com" 
                                required
                                aria-label="Email address for price drop notifications"
                            >
                            <button type="submit" class="pdw-submit-btn" aria-label="Subscribe to price drop notifications">
                                Notify Me
                            </button>
                        </div>
                        <div class="pdw-message" role="alert" aria-live="polite"></div>
                    </form>
                    
                    <div class="pdw-product-info">
                        <p><strong>Product:</strong> <span class="pdw-product-name">\${this.config.productName}</span></p>
                        <p><strong>Current Price:</strong> <span class="pdw-product-price">\${this.config.productPrice}</span></p>
                    </div>
                    
                    <div class="pdw-footer">
                        <small>We respect your privacy. Unsubscribe anytime.</small>
                    </div>
                </div>
            \`;
            
            // Store element references
            this.elements.form = this.container.querySelector('.pdw-form');
            this.elements.input = this.container.querySelector('.pdw-email-input');
            this.elements.button = this.container.querySelector('.pdw-submit-btn');
            this.elements.message = this.container.querySelector('.pdw-message');
            this.elements.productName = this.container.querySelector('.pdw-product-name');
            this.elements.productPrice = this.container.querySelector('.pdw-product-price');
            
            // Update product info
            if (this.elements.productName) {
                this.elements.productName.textContent = this.config.productName;
            }
            if (this.elements.productPrice) {
                this.elements.productPrice.textContent = this.config.productPrice;
            }
        }
        
        render() {
            if (this.config.container) {
                if (typeof this.config.container === 'string') {
                    const target = document.querySelector(this.config.container);
                    if (target) {
                        target.appendChild(this.container);
                        return;
                    }
                } else if (this.config.container.appendChild) {
                    this.config.container.appendChild(this.container);
                    return;
                }
            }
            
            // Fallback: append to body
            document.body.appendChild(this.container);
        }
        
        bindEvents() {
            if (!this.elements.form) return;
            
            this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));
            
            // Keyboard support
            this.elements.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSubmit(e);
                }
            });
            
            // Real-time email validation
            this.elements.input.addEventListener('blur', () => {
                const email = this.elements.input.value.trim();
                if (email && !EMAIL_REGEX.test(email)) {
                    this.showMessage('Please enter a valid email', 'error', 3000);
                }
            });
        }
        
        reserveSpace() {
            // Prevent layout shifts by reserving space
            this.container.style.minHeight = '220px';
            this.container.style.display = 'block';
            this.container.style.visibility = 'visible';
        }
        
        async handleSubmit(e) {
            e.preventDefault();
            
            const email = this.elements.input.value.trim();
            
            // Validation
            if (!email) {
                this.showMessage('Please enter your email', 'error');
                this.elements.input.focus();
                return;
            }
            
            if (!EMAIL_REGEX.test(email)) {
                this.showMessage('Please enter a valid email address', 'error');
                this.elements.input.focus();
                return;
            }
            
            // Check if already subscribed
            if (this.isAlreadySubscribed()) {
                this.showMessage('You'"'"'re already subscribed for this product!', 'info');
                return;
            }
            
            this.setState('submitting');
            
            try {
                const response = await this.sendSubscription(email);
                
                if (response.ok) {
                    this.setState('success');
                    this.showMessage(' Success! We'"'"'ll email you if the price drops.', 'success');
                    this.elements.form.reset();
                    this.markAsSubscribed();
                    
                    // Success animation
                    this.container.classList.add('pdw-success-animation');
                    setTimeout(() => {
                        this.container.classList.remove('pdw-success-animation');
                    }, 1000);
                    
                } else {
                    this.setState('error');
                    this.showMessage(\` Error: \${response.error}\`, 'error');
                }
            } catch (error) {
                this.setState('error');
                if (error.name === 'AbortError') {
                    this.showMessage('Request timed out. Please try again.', 'error');
                } else {
                    this.showMessage('Network error. Please check your connection.', 'error');
                }
                console.error('Subscription error:', error);
            }
        }
        
        async sendSubscription(email) {
            const payload = {
                email: email,
                product: {
                    name: this.config.productName,
                    price: this.config.productPrice,
                    url: this.config.productUrl
                }
            };
            
            // 8-second timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            
            try {
                const response = await fetch(this.config.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                return await response.json();
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        }
        
        setState(state) {
            this.state = state;
            
            if (!this.elements.button || !this.elements.input) return;
            
            switch (state) {
                case 'idle':
                    this.elements.button.disabled = false;
                    this.elements.button.textContent = 'Notify Me';
                    this.elements.input.disabled = false;
                    this.elements.button.style.opacity = '1';
                    break;
                    
                case 'submitting':
                    this.elements.button.disabled = true;
                    this.elements.button.textContent = 'Sending...';
                    this.elements.input.disabled = true;
                    this.elements.button.style.opacity = '0.8';
                    break;
                    
                case 'success':
                    this.elements.button.disabled = true;
                    this.elements.button.textContent = ' Subscribed!';
                    this.elements.input.disabled = true;
                    this.elements.button.style.backgroundColor = '#10b981';
                    break;
                    
                case 'error':
                    this.elements.button.disabled = false;
                    this.elements.button.textContent = 'Try Again';
                    this.elements.input.disabled = false;
                    this.elements.button.style.opacity = '1';
                    break;
            }
        }
        
        showMessage(text, type = 'info', duration = 5000) {
            if (!this.elements.message) return;
            
            this.elements.message.textContent = text;
            this.elements.message.className = \`pdw-message pdw-message-\${type}\`;
            
            // Auto-hide error messages
            if (type === 'error' || type === 'info') {
                setTimeout(() => {
                    if (this.elements.message.textContent === text) {
                        this.elements.message.textContent = '';
                        this.elements.message.className = 'pdw-message';
                    }
                }, duration);
            }
        }
        
        isValidEmail(email) {
            return EMAIL_REGEX.test(email);
        }
        
        markAsSubscribed() {
            try {
                const key = \`price-drop-subscribed-\${this.config.productUrl}\`;
                localStorage.setItem(key, 'true');
            } catch (e) {
                console.warn('Could not save to localStorage:', e);
            }
        }
        
        isAlreadySubscribed() {
            try {
                const key = \`price-drop-subscribed-\${this.config.productUrl}\`;
                return localStorage.getItem(key) === 'true';
            } catch (e) {
                return false;
            }
        }
        
        destroy() {
            if (this.elements.form) {
                this.elements.form.removeEventListener('submit', this.handleSubmit);
            }
            if (this.container && this.container.parentElement) {
                this.container.parentElement.removeChild(this.container);
            }
        }
        
        updateProductInfo(name, price) {
            this.config.productName = name || this.config.productName;
            this.config.productPrice = price || this.config.productPrice;
            
            if (this.elements.productName) {
                this.elements.productName.textContent = this.config.productName;
            }
            if (this.elements.productPrice) {
                this.elements.productPrice.textContent = this.config.productPrice;
            }
        }
    }
    
    return PriceDropWidget;
});
`;

// ========================================
// 2. WIDGET CSS STYLES
// ========================================
const widgetCSS = `
/* Price Drop Widget CSS */
.price-drop-widget {
    --pd-accent-color: #2563eb;
    --pd-background-color: #ffffff;
    --pd-text-color: #1f2937;
    --pd-border-color: #e5e7eb;
    --pd-border-radius: 12px;
    --pd-spacing: 16px;
    --pd-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    
    /* Reset to avoid host site conflicts */
    all: initial;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: var(--pd-text-color);
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    display: block;
}

.pdw-container {
    background: var(--pd-background-color);
    border: 1px solid var(--pd-border-color);
    border-radius: var(--pd-border-radius);
    padding: var(--pd-spacing);
    box-shadow: var(--pd-shadow);
    max-width: 420px;
    margin: 0 auto;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pdw-container:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.pdw-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: var(--pd-text-color);
    display: flex;
    align-items: center;
    gap: 8px;
}

.pdw-title::before {
    content: "";
    font-size: 20px;
}

.pdw-description {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 var(--pd-spacing) 0;
    line-height: 1.4;
}

.pdw-form {
    margin-bottom: var(--pd-spacing);
}

.pdw-input-group {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
}

@media (max-width: 480px) {
    .pdw-input-group {
        flex-direction: column;
    }
}

.pdw-email-input {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid var(--pd-border-color);
    border-radius: 8px;
    font-size: 15px;
    transition: all 0.2s ease;
    min-width: 0;
}

.pdw-email-input:focus {
    outline: none;
    border-color: var(--pd-accent-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.pdw-email-input:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
    opacity: 0.7;
}

.pdw-submit-btn {
    background-color: var(--pd-accent-color);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    min-width: 100px;
}

.pdw-submit-btn:hover:not(:disabled) {
    background-color: #1d4ed8;
    transform: translateY(-1px);
}

.pdw-submit-btn:active:not(:disabled) {
    transform: translateY(0);
}

.pdw-submit-btn:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
    transform: none !important;
}

.pdw-message {
    font-size: 14px;
    padding: 12px;
    border-radius: 8px;
    margin-top: 12px;
    display: none;
    animation: pdw-fadeIn 0.3s ease;
}

@keyframes pdw-fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
}

.pdw-message-success {
    display: block;
    background-color: #dcfce7;
    color: #166534;
    border: 1px solid #bbf7d0;
}

.pdw-message-error {
    display: block;
    background-color: #fee2e2;
    color: #991b1b;
    border: 1px solid #fecaca;
    animation: pdw-shake 0.5s ease;
}

@keyframes pdw-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

.pdw-message-info {
    display: block;
    background-color: #e0f2fe;
    color: #0c4a6e;
    border: 1px solid #bae6fd;
}

.pdw-product-info {
    background-color: #f9fafb;
    border-radius: 8px;
    padding: 16px;
    margin-top: var(--pd-spacing);
    border: 1px solid var(--pd-border-color);
    font-size: 13px;
}

.pdw-product-info p {
    margin: 6px 0;
    display: flex;
}

.pdw-product-info strong {
    min-width: 80px;
    color: #4b5563;
}

.pdw-footer {
    margin-top: var(--pd-spacing);
    text-align: center;
    color: #9ca3af;
    font-size: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--pd-border-color);
}

.pdw-success-animation {
    animation: pdw-pulse 1s ease;
}

@keyframes pdw-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
}

/* CSS COLLISION FIX: Amazon has aggressive button styles */
.pdw-submit-btn {
    /* Reset Amazon'"'"'s button styles */
    background-image: none !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 12px 24px !important;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
    font-size: 15px !important;
    font-weight: 500 !important;
    text-transform: none !important;
    letter-spacing: normal !important;
    box-shadow: none !important;
    text-shadow: none !important;
}

.pdw-email-input {
    /* Reset Amazon'"'"'s input styles */
    background-image: none !important;
    border: 2px solid var(--pd-border-color) !important;
    border-radius: 8px !important;
    box-shadow: none !important;
}
`;

// ========================================
// 3. CREATE BUNDLES
// ========================================

// Full bundle with CSS
const fullBundle = `(function() {
    // Inject CSS
    if (!document.getElementById('price-drop-widget-styles')) {
        var style = document.createElement('style');
        style.id = 'price-drop-widget-styles';
        style.textContent = \`${widgetCSS}\`;
        document.head.appendChild(style);
    }
    
    ${widgetSource}
})();`;

// Minified version (simple minification)
const minifiedBundle = fullBundle
    .replace(/\/\*[\s\S]*?\*\//g, '')  // Remove CSS/JS comments
    .replace(/\/\/.*$/gm, '')          // Remove line comments
    .replace(/\s+/g, ' ')              // Collapse whitespace
    .replace(/\s*([{}();:,\[\]])/g, '\$1') // Clean around punctuation
    .replace(/([{}();:,\[\]])/g, '\$1')
    .trim();

// ========================================
// 4. WRITE FILES
// ========================================

// Write full version
fs.writeFileSync(
    path.join(distDir, 'price-drop-widget.js'),
    fullBundle,
    'utf8'
);

// Write minified version
fs.writeFileSync(
    path.join(distDir, 'price-drop-widget.min.js'),
    minifiedBundle,
    'utf8'
);

// Write CSS separately (optional)
fs.writeFileSync(
    path.join(distDir, 'price-drop-widget.css'),
    widgetCSS,
    'utf8'
);

// ========================================
// 5. SIZE REPORT
// ========================================

const minifiedSize = Buffer.byteLength(minifiedBundle, 'utf8');
const fullSize = Buffer.byteLength(fullBundle, 'utf8');
const cssSize = Buffer.byteLength(widgetCSS, 'utf8');

// Estimated gzip sizes (roughly 30% of original)
const minifiedGzip = Math.round(minifiedSize * 0.3);
const fullGzip = Math.round(fullSize * 0.3);

console.log(' Widget built successfully!');
console.log(' File sizes:');
console.log(`   dist/price-drop-widget.js:      \${Math.round(fullSize/1024)} KB (\${fullGzip} KB gzipped)`);
console.log(`   dist/price-drop-widget.min.js:  \${Math.round(minifiedSize/1024)} KB (\${minifiedGzip} KB gzipped)`);
console.log(`   dist/price-drop-widget.css:     \${Math.round(cssSize/1024)} KB`);

if (minifiedGzip > 12) {
    console.warn('  Warning: Minified bundle exceeds 12KB gzipped limit!');
} else {
    console.log(' Minified bundle is under 12KB gzipped limit!');
}

console.log('\n Ready to use:');
console.log('   <script src="/assets/price-drop-widget.min.js"><\/script>');
