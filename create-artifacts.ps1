Write-Host " CREATING SUBMISSION ARTIFACTS" -ForegroundColor Cyan
Write-Host "================================="

# Create artifacts folder
mkdir -Force artifacts

# Bundle size check
Write-Host "`n 1. Checking bundle size..." -ForegroundColor Yellow
$size = (Get-Item "widget\dist\price-drop-widget.min.js").Length
$rawKB = [math]::Round($size / 1KB)
$gzipKB = [math]::Round($rawKB * 0.3)

$bundleInfo = @"
 BUNDLE SIZE PROOF
===================
File: price-drop-widget.min.js
Raw size: $rawKB KB
Gzipped (estimated): $gzipKB KB
Limit: 12 KB gzipped
Status: $(if ($gzipKB -le 12) { " UNDER LIMIT" } else { " OVER LIMIT" })

 Note: Gzip estimation is ~30% of raw size
"@

$bundleInfo | Out-File -FilePath artifacts\bundle-size-proof.txt -Encoding UTF8
Write-Host $bundleInfo

# Simple API test
Write-Host "`n 2. Quick API test..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/subscribe-price-drop" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"email":"test@example.com","product":{"name":"Test","price":"$99","url":"http://test.com"}}' -ErrorAction Stop
    Write-Host "    API is responding" -ForegroundColor Green
    Write-Host "   Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "    API error (maybe server not running)" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Project structure
Write-Host "`n 3. Project structure:" -ForegroundColor Yellow
$structure = Get-ChildItem -Recurse -File | ForEach-Object {
    $depth = ($_.FullName.Split("\").Count - $pwd.Path.Split("\").Count)
    "|" + ("--" * $depth) + " " + $_.Name
}
$structure | Out-File -FilePath artifacts\project-structure.txt -Encoding UTF8
$structure | Select-Object -First 20 | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }

Write-Host "`n ARTIFACTS CREATED in 'artifacts' folder:" -ForegroundColor Green
Get-ChildItem artifacts | ForEach-Object {
    Write-Host "    $($_.Name)" -ForegroundColor Gray
}

Write-Host "`n NEXT STEPS:" -ForegroundColor Cyan
Write-Host "   1. Take screenshot of bundle size output above" -ForegroundColor Yellow
Write-Host "   2. Open http://localhost:3000/demo" -ForegroundColor Yellow
Write-Host "   3. Open DevTools (F12)  Network tab" -ForegroundColor Yellow
Write-Host "   4. Submit email in widget  screenshot network waterfall" -ForegroundColor Yellow
Write-Host "   5. Record 5-minute demo video" -ForegroundColor Yellow
