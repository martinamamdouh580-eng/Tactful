#  Price Drop Notifier

Embeddable widget for e-commerce price drop notifications.

## Quick Start
1. Install: `npm install`
2. Build widget: `cd widget && node build.js`
3. Start server: `node server/index.js`
4. Open: http://localhost:3000/demo

## Features
- Vanilla JS (no frameworks)
- 12KB gzipped bundle
- CSP compliant demo
- Amazon/eBay userscript
- Random delay simulation (0.8-2.8s)

## API
POST /subscribe-price-drop
Content-Type: application/json
Body: {"email":"...","product":{"name":"...","price":"...","url":"..."}}

Responses: 200, 400, 409, 500
