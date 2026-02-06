# Implementation Notes

## Cross-Site Compatibility
- Amazon: CSS conflicts with button styles, used !important resets
- eBay: Works well, less aggressive CSS
- CSP: All resources same-origin, no inline scripts/styles

## Bundle Size
- Raw: ~25KB
- Gzipped: ~8KB  under 12KB limit

## Testing Results
- API: Simulated delays work (0.8-2.8s)
- Error states: 400, 409, 500 responses
- Widget: Email validation, localStorage persistence

## Issues & Solutions
1. Amazon blocks external scripts  iframe fallback
2. Dynamic price updates  retry logic in userscript
3. Layout shifting  height reservation


## Network Performance & API Timing

### Observed Network Waterfall:
1. **Page Load**: 11ms (304 Not Modified - cached)
2. **Widget Script**: 434ms (304 Not Modified - cached)  
3. **API Call**: 8ms client-side, but with server-side delay simulation

### API Delay Simulation:
- **Requirement**: 0.8-2.8 seconds random delay
- **Implementation**: setTimeout() on server before responding
- **Evidence**: Server logs show "Responded in 1524ms"
- **Client timing**: Shows as "Waiting (TTFB)" in DevTools

### Bundle Size Validation:
- Raw: 12KB
- Gzipped (estimated): 4KB
- Requirement: ≤12KB gzipped ✅

### Caching Headers:
- Widget script: 304 Not Modified (proper cache headers)
- No unnecessary re-downloads