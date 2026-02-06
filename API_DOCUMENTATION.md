# 📡 API Documentation

Complete reference for the Price Drop Notifier API endpoints.

## Base URL

```
http://localhost:3000
http://your-domain.com (production)
```

---

## Subscription Endpoint

### POST `/subscribe-price-drop`

Subscribe to price drop notifications for a specific product.

#### Request

**Method:** `POST`  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "email": "user@example.com",
  "product": {
    "name": "iPhone 15 Pro",
    "price": "$999.00",
    "url": "https://example.com/iphone-15-pro"
  }
}
```

**Field Requirements:**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| email | string | ✅ Yes | Valid email address | user@example.com |
| product.name | string | ✅ Yes | Product name (max 200 chars) | iPhone 15 Pro |
| product.price | string | ✅ Yes | Current price | $999.00 |
| product.url | string | ✅ Yes | Product URL | https://example.com/product |

#### Responses

**Success (200 OK):**
```json
{
  "ok": true,
  "message": "Successfully subscribed to price drops",
  "subscription": "user@example.com-https://example.com/iphone-15-pro"
}
```

**Already Subscribed (409 Conflict):**
```json
{
  "ok": false,
  "error": "Already subscribed to this product"
}
```

**Invalid Email (400 Bad Request):**
```json
{
  "ok": false,
  "error": "Invalid email address"
}
```

**Missing Product Info (400 Bad Request):**
```json
{
  "ok": false,
  "error": "Product information is required"
}
```

**Server Error (500):**
```json
{
  "ok": false,
  "error": "Internal server error"
}
```

#### Error Codes

| Code | Status | Description | Solution |
|------|--------|-------------|----------|
| 400 | Bad Request | Invalid email or missing fields | Check request format |
| 409 | Conflict | Already subscribed | Show "already subscribed" message |
| 500 | Server Error | Database or server issue | Retry or contact support |

#### Examples

**Using cURL:**
```bash
curl -X POST http://localhost:3000/subscribe-price-drop \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "product": {
      "name": "iPhone 15 Pro",
      "price": "$999.00",
      "url": "https://example.com/iphone-15-pro"
    }
  }'
```

**Using JavaScript (Fetch):**
```javascript
const response = await fetch('http://localhost:3000/subscribe-price-drop', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    product: {
      name: 'iPhone 15 Pro',
      price: '$999.00',
      url: 'https://example.com/iphone-15-pro'
    }
  })
});

const data = await response.json();
if (data.ok) {
  console.log('Subscribed!', data.message);
} else {
  console.error('Error:', data.error);
}
```

**Using JavaScript (Axios):**
```javascript
import axios from 'axios';

try {
  const response = await axios.post('http://localhost:3000/subscribe-price-drop', {
    email: 'user@example.com',
    product: {
      name: 'iPhone 15 Pro',
      price: '$999.00',
      url: 'https://example.com/iphone-15-pro'
    }
  });
  
  console.log(response.data);
} catch (error) {
  console.error(error.response.data.error);
}
```

**Using Python (requests):**
```python
import requests

response = requests.post('http://localhost:3000/subscribe-price-drop', json={
    'email': 'user@example.com',
    'product': {
        'name': 'iPhone 15 Pro',
        'price': '$999.00',
        'url': 'https://example.com/iphone-15-pro'
    }
})

data = response.json()
if data['ok']:
    print('Subscribed!')
else:
    print(f"Error: {data['error']}")
```

**Using Node.js:**
```javascript
const https = require('https');

const data = JSON.stringify({
  email: 'user@example.com',
  product: {
    name: 'iPhone 15 Pro',
    price: '$999.00',
    url: 'https://example.com/iphone-15-pro'
  }
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/subscribe-price-drop',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log(JSON.parse(responseData));
  });
});

req.write(data);
req.end();
```

---

## Admin Endpoints

### GET `/admin/subscriptions`

Get all subscriptions across all products.

#### Request

```bash
GET /admin/subscriptions
```

#### Response

**Success (200 OK):**
```json
{
  "total": 5,
  "subscriptions": [
    {
      "key": "user1@example.com-https://example.com/product1",
      "email": "user1@example.com",
      "product": {
        "name": "iPhone 15 Pro",
        "price": "$999.00",
        "url": "https://example.com/iphone-15-pro"
      },
      "subscribedAt": "2026-02-03T14:30:00.000Z"
    },
    {
      "key": "user2@example.com-https://example.com/product2",
      "email": "user2@example.com",
      "product": {
        "name": "MacBook Pro",
        "price": "$1,999.00",
        "url": "https://example.com/macbook-pro"
      },
      "subscribedAt": "2026-02-03T15:45:00.000Z"
    }
  ]
}
```

#### Examples

**Using cURL:**
```bash
curl http://localhost:3000/admin/subscriptions
```

**Using JavaScript:**
```javascript
const response = await fetch('http://localhost:3000/admin/subscriptions');
const data = await response.json();
console.log(`Total subscriptions: ${data.total}`);
data.subscriptions.forEach(sub => {
  console.log(`${sub.email} subscribed to ${sub.product.name}`);
});
```

---

### GET `/admin/subscriptions/:productUrl`

Get subscriptions for a specific product.

#### Request

```bash
GET /admin/subscriptions/:productUrl
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productUrl | string | ✅ Yes | URL encoded product URL |

#### Response

**Success (200 OK):**
```json
{
  "productUrl": "https://example.com/iphone-15-pro",
  "count": 3,
  "subscriptions": [
    {
      "key": "user1@example.com-https://example.com/iphone-15-pro",
      "email": "user1@example.com",
      "product": {
        "name": "iPhone 15 Pro",
        "price": "$999.00",
        "url": "https://example.com/iphone-15-pro"
      },
      "subscribedAt": "2026-02-03T14:30:00.000Z"
    }
  ]
}
```

#### Examples

**Using cURL:**
```bash
# URL encode the product URL
curl "http://localhost:3000/admin/subscriptions/https%3A%2F%2Fexample.com%2Fiphone-15-pro"
```

**Using JavaScript:**
```javascript
const productUrl = 'https://example.com/iphone-15-pro';
const encoded = encodeURIComponent(productUrl);

const response = await fetch(`http://localhost:3000/admin/subscriptions/${encoded}`);
const data = await response.json();

console.log(`Subscribers for ${data.productUrl}:`);
data.subscriptions.forEach(sub => {
  console.log(`  - ${sub.email}`);
});
```

---

### DELETE `/admin/subscriptions/:key`

Remove a subscription.

#### Request

```bash
DELETE /admin/subscriptions/:key
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| key | string | ✅ Yes | Subscription key (from subscriptions list) |

#### Response

**Success (200 OK):**
```json
{
  "ok": true,
  "message": "Subscription deleted"
}
```

**Not Found (404):**
```json
{
  "ok": false,
  "error": "Subscription not found"
}
```

#### Examples

**Using cURL:**
```bash
curl -X DELETE "http://localhost:3000/admin/subscriptions/user1@example.com-https://example.com/iphone-15-pro"
```

**Using JavaScript:**
```javascript
const subscriptionKey = 'user1@example.com-https://example.com/iphone-15-pro';

const response = await fetch(
  `http://localhost:3000/admin/subscriptions/${subscriptionKey}`,
  { method: 'DELETE' }
);

const data = await response.json();
if (data.ok) {
  console.log('Subscription deleted');
} else {
  console.error('Error:', data.error);
}
```

---

## Webhook Integration (Future)

Planned webhook support for real-time price drop notifications.

```json
{
  "event": "price_drop",
  "subscription": {
    "email": "user@example.com",
    "product": {
      "name": "iPhone 15 Pro",
      "previousPrice": "$999.00",
      "currentPrice": "$899.00",
      "url": "https://example.com/iphone-15-pro"
    },
    "timestamp": "2026-02-03T16:00:00.000Z"
  }
}
```

---

## Rate Limiting

No rate limits currently implemented. For production:

```javascript
// Planned rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

---

## CORS Policy

Current setup allows all origins:

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

For production, restrict to your domain:

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://your-domain.com');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

---

## Authentication (Future)

Planned API key authentication:

```bash
# Request with API key
curl -X POST http://your-domain.com/subscribe-price-drop \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## API Response Format

All responses follow a consistent JSON format:

**Success:**
```json
{
  "ok": true,
  "data": {},
  "message": "Success message"
}
```

**Error:**
```json
{
  "ok": false,
  "error": "Error message"
}
```

---

## Status Codes Reference

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Already subscribed |
| 500 | Server Error | Internal error |

---

## Testing the API

### Using Postman

1. **Create subscription:**
   - Method: POST
   - URL: `http://localhost:3000/subscribe-price-drop`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
   ```json
   {
     "email": "test@example.com",
     "product": {
       "name": "Test Product",
       "price": "$99.99",
       "url": "https://example.com/product"
     }
   }
   ```

2. **View subscriptions:**
   - Method: GET
   - URL: `http://localhost:3000/admin/subscriptions`

3. **Delete subscription:**
   - Method: DELETE
   - URL: `http://localhost:3000/admin/subscriptions/test@example.com-https://example.com/product`

### Using API Testing Tools

**Thunder Client (VS Code):**
```
New Request → POST → http://localhost:3000/subscribe-price-drop
Body: application/json → {...}
```

**REST Client (VS Code):**
Create `test.http`:
```http
POST http://localhost:3000/subscribe-price-drop
Content-Type: application/json

{
  "email": "test@example.com",
  "product": {
    "name": "Test Product",
    "price": "$99.99",
    "url": "https://example.com/product"
  }
}

###

GET http://localhost:3000/admin/subscriptions
```

---

## API Limits & Constraints

| Constraint | Limit |
|-----------|-------|
| Email length | 254 characters (RFC 5321) |
| Product name length | 200 characters |
| Price string length | 50 characters |
| URL length | 2048 characters |
| Request timeout | 8 seconds |
| Payload size | 1MB |

---

## Troubleshooting

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Update CORS headers in server/index.js

### 400 Bad Request
```json
{"ok": false, "error": "Invalid email address"}
```
**Solution:** Validate email format before sending

### 409 Conflict
```json
{"ok": false, "error": "Already subscribed to this product"}
```
**Solution:** Show user a friendly message instead of re-subscribing

### 500 Server Error
**Solution:** Check server logs, ensure database is available

---

## Security Best Practices

1. **Validate all inputs** on both client and server
2. **Use HTTPS** in production
3. **Implement rate limiting** to prevent abuse
4. **Sanitize email inputs** to prevent injection
5. **Use environment variables** for sensitive data
6. **Add authentication** for admin endpoints
7. **Log all requests** for audit trails
8. **Monitor API usage** for anomalies

---

## Support

For API issues:
- Check server logs: `npm run logs`
- Verify request format matches examples
- Test with cURL first before using in code
- Check browser DevTools Network tab
- Review error response message
