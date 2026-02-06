Write-Host "Testing API Response Variants..." -ForegroundColor Cyan
Write-Host "================================="

$testCases = @(
    @{email="good@test.com"; expected="Success"},
    @{email="bad-email"; expected="400 Bad Request"},
    @{email="duplicate@test.com"; expected="409 Conflict"},
    @{email="server@test.com"; expected="500 Error"}
)

foreach ($test in $testCases) {
    Write-Host "`nTesting: $($test.email) (Expected: $($test.expected))" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/subscribe-price-drop" -Method Post -Headers @{"Content-Type"="application/json"} -Body ('{"email":"' + $test.email + '","product":{"name":"Test","price":"$99","url":"http://test.com"}}') -ErrorAction Stop
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "  Response: $($response.Content)" -ForegroundColor Green
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        $content = $_.ErrorDetails.Message
        Write-Host "  Status: $status" -ForegroundColor Red
        Write-Host "  Response: $content" -ForegroundColor Red
    }
    Start-Sleep -Seconds 1
}
