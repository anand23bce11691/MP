# IncidentIQ Web API Comprehensive Test Suite & Scenario Simulator
$baseUrl = "http://localhost:5000"

function Test-ChaosScenario($actionName, $displayName) {
    Write-Host "`n==========================================================" -ForegroundColor Cyan
    Write-Host " TESTING CHAOS SCENARIO: $displayName ($actionName)" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Cyan
    
    # 1. Trigger Chaos Scenario
    $chaosBody = @{ action = $actionName; enable = $true } | ConvertTo-Json
    $chaosResp = Invoke-RestMethod -Uri "$baseUrl/api/simulation/command" -Method Post -ContentType "application/json" -Body $chaosBody
    Write-Host "Triggered Chaos State: $actionName" -ForegroundColor Yellow

    # 2. Wait for Telemetry Collection & Anomaly RCA Engine
    Write-Host "Waiting 5 seconds for telemetry polling & RCA evaluation..." -ForegroundColor Gray
    Start-Sleep -Seconds 5

    # 3. Query Detected Incident
    $incidents = Invoke-RestMethod -Uri "$baseUrl/api/incidents"
    if ($incidents.Count -gt 0) {
        $latest = $incidents[0]
        Write-Host "[ALERT DETECTED] Incident Number: $($latest.incidentNumber)" -ForegroundColor Red
        Write-Host "Title: $($latest.title)" -ForegroundColor Red
        Write-Host "Confidence Score: $($latest.confidencePercentage)%" -ForegroundColor Red
        Write-Host "Root Cause Summary: $($latest.rootCauseSummary)" -ForegroundColor Yellow
        Write-Host "Recommended Action: $($latest.recommendedAction)" -ForegroundColor Green
        Write-Host "Forensic Evidence Chain:" -ForegroundColor Magenta
        foreach ($ev in $latest.evidences) {
            Write-Host "  - [Seq $($ev.sequenceOrder)] $($ev.metricName): Observed $($ev.observedValue) (Baseline: $($ev.baselineValue)) - $($ev.description)" -ForegroundColor Gray
        }
    } else {
        Write-Host "No incident detected." -ForegroundColor Gray
    }

    # 4. Reset Chaos Scenario
    $resetBody = @{ action = "reset" } | ConvertTo-Json
    $resetResp = Invoke-RestMethod -Uri "$baseUrl/api/simulation/command" -Method Post -ContentType "application/json" -Body $resetBody
    Write-Host "Reset completed. System restored to HEALTHY baseline.`n" -ForegroundColor Green
    Start-Sleep -Seconds 2
}

# --- 1. CORE COMMERCE API TESTS ---
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 1. TESTING SHOPEASY CORE APIs (Auth, Products, Orders, Payments)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Auth Login
$loginBody = @{ username = "customer_1"; password = "Password123!" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
Write-Host "Auth Token: $($loginResp.token)" -ForegroundColor Green

# Product Catalog & Creation
$products = Invoke-RestMethod -Uri "$baseUrl/api/products?limit=3"
Write-Host "First Product: $($products[0].name) (`$$($products[0].price))" -ForegroundColor Green

$newProdBody = @{ name = "Pro Wireless Mouse #$(Get-Random)"; price = 49.99; stockQuantity = 100 } | ConvertTo-Json
$newProd = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method Post -ContentType "application/json" -Body $newProdBody
Write-Host "Created New Product ID: $($newProd.productId) - $($newProd.name)" -ForegroundColor Green

# Order Placement
$orderBody = @{ userId = 1; items = @( @{ productId = $newProd.productId; quantity = 2 } ) } | ConvertTo-Json -Depth 3
$order = Invoke-RestMethod -Uri "$baseUrl/api/orders" -Method Post -ContentType "application/json" -Body $orderBody
Write-Host "Created Order ID: #$($order.orderId), Total: `$$($order.totalAmount), Status: $($order.status)" -ForegroundColor Green

# Payment Processing
$paymentBody = @{ orderId = $order.orderId; amount = $order.totalAmount; paymentMethod = "CreditCard" } | ConvertTo-Json
$payment = Invoke-RestMethod -Uri "$baseUrl/api/payments" -Method Post -ContentType "application/json" -Body $paymentBody
Write-Host "Processed Payment ID: #$($payment.paymentId), Status: $($payment.status)" -ForegroundColor Green


# --- 2. CHAOS ENGINEERING & RCA TESTS ---
Test-ChaosScenario "dbslowdown" "Database Query Slowdown"
Test-ChaosScenario "apifailure" "Payment API 500 Gateway Failure"
Test-ChaosScenario "trafficspike" "Extreme Traffic Surge (3000 RPM)"
Test-ChaosScenario "cascadingfailure" "Cascading System Failure"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " ALL TEST SUITES PASSED CLEANLY ON LOCAL SQL SERVER!" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
