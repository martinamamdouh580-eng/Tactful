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
    
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    class PriceDropWidget {
        constructor(options = {}) {
            this.config = {
                productName: options.productName || 'Product Name',
                productPrice: options.productPrice || '$0.00',
                productUrl: options.productUrl || window.location.href,
                apiUrl: options.apiUrl || '/subscribe-price-drop',
                container: options.container || null
            };
            
            this.state = 'idle';
            this.init();
        }
        
        init() {
            this.createWidget();
            this.render();
            this.bindEvents();
        }
        
        createWidget() {
            this.container = document.createElement('div');
            this.container.className = 'price-drop-widget';
            
            this.container.innerHTML = `
                <div class="pdw-container">
                    <div class="pdw-product-header">
                        <div class="pdw-product-title">${this.config.productName}</div>
                        <div class="pdw-product-price">${this.config.productPrice}</div>
                    </div>
                    
                    <div class="pdw-alert-section">
                        <div class="pdw-alert-title">Price Drop Alert</div>
                        <div class="pdw-alert-description">Get notified when price drops</div>
                        
                        <form class="pdw-form-simple">
                            <div class="pdw-input-row">
                                <input 
                                    type="email" 
                                    class="pdw-email-input-simple" 
                                    placeholder="your@email.com"
                                    required
                                    aria-label="Email address"
                                >
                                <button type="submit" class="pdw-submit-btn-simple">
                                    Notify Me
                                </button>
                            </div>
                            <div class="pdw-message" role="alert" aria-live="polite"></div>
                        </form>
                    </div>
                </div>
            `;
            
            this.emailInput = this.container.querySelector('.pdw-email-input-simple');
            this.submitBtn = this.container.querySelector('.pdw-submit-btn-simple');
            this.messageEl = this.container.querySelector('.pdw-message');
            this.form = this.container.querySelector('.pdw-form-simple');
        }
        
        render() {
            if (this.config.container) {
                if (typeof this.config.container === 'string') {
                    const target = document.querySelector(this.config.container);
                    if (target) target.appendChild(this.container);
                } else if (this.config.container.appendChild) {
                    this.config.container.appendChild(this.container);
                }
            } else {
                document.body.appendChild(this.container);
            }
        }
        
        bindEvents() {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            
            // Keyboard support
            this.emailInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSubmit(e);
                }
            });
        }
        
        async handleSubmit(e) {
            e.preventDefault();
            
            const email = this.emailInput.value.trim();
            
            // Validation
            if (!email) {
                this.showMessage('Please enter your email', 'error');
                this.emailInput.focus();
                return;
            }
            
            if (!EMAIL_REGEX.test(email)) {
                this.showMessage('Please enter a valid email address', 'error');
                this.emailInput.focus();
                return;
            }
            
            // Check localStorage for previous subscription
            const storageKey = `price-drop-${this.config.productUrl}`;
            if (localStorage.getItem(storageKey) === email) {
                this.showMessage('You are already subscribed for this product!', 'info');
                return;
            }
            
            // Update UI state
            this.setState('submitting');
            
            try {
                const response = await this.sendSubscription(email);
                
                if (response.ok) {
                    this.setState('success');
                    this.showMessage('✓ Success! We\'ll email you if the price drops.', 'success');
                    this.form.reset();
                    localStorage.setItem(storageKey, email);
                } else {
                    this.setState('error');
                    this.showMessage(`✗ ${response.error || 'Subscription failed'}`, 'error');
                }
            } catch (error) {
                this.setState('error');
                this.showMessage('✗ Network error. Please try again.', 'error');
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
            
            // Timeout after 8 seconds
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
            
            switch (state) {
                case 'idle':
                    this.submitBtn.disabled = false;
                    this.submitBtn.textContent = 'Notify Me';
                    this.emailInput.disabled = false;
                    break;
                    
                case 'submitting':
                    this.submitBtn.disabled = true;
                    this.submitBtn.textContent = 'Sending...';
                    this.emailInput.disabled = true;
                    break;
                    
                case 'success':
                    this.submitBtn.disabled = true;
                    this.submitBtn.textContent = '✓ Subscribed';
                    this.emailInput.disabled = true;
                    break;
                    
                case 'error':
                    this.submitBtn.disabled = false;
                    this.submitBtn.textContent = 'Try Again';
                    this.emailInput.disabled = false;
                    break;
            }
        }
        
        showMessage(text, type = 'info') {
            this.messageEl.textContent = text;
            this.messageEl.className = `pdw-message ${type}`;
            this.messageEl.classList.add('visible');
            
            // Auto-hide non-success messages
            if (type !== 'success') {
                setTimeout(() => {
                    this.messageEl.classList.remove('visible');
                }, 5000);
            }
        }
        
        updateProduct(name, price) {
            this.config.productName = name;
            this.config.productPrice = price;
            
            const titleEl = this.container.querySelector('.pdw-product-title');
            const priceEl = this.container.querySelector('.pdw-product-price');
            
            if (titleEl) titleEl.textContent = name;
            if (priceEl) priceEl.textContent = price;
        }
        
        destroy() {
            if (this.container && this.container.parentElement) {
                this.container.parentElement.removeChild(this.container);
            }
        }
    }
    
    return PriceDropWidget;
});