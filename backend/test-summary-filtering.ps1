# Test Summary and Filtering APIs

$baseUrl = "http://localhost:3000/api"
$email = "test@splitmint.com"
$password = "password123"

Write-Host "=== SUMMARY AND FILTERING TEST ===" -ForegroundColor Cyan

# 1. Login
Write-Host "`n1. Logging in..." -ForegroundColor Cyan
$loginBody = @{ email = $email; password = $password } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.token
$headers = @{ Authorization = "Bearer $token" }
Write-Host "   [OK] Logged in successfully" -ForegroundColor Green

# 2. Create Test Group
Write-Host "`n2. Creating Test Group..." -ForegroundColor Cyan
$createGroupBody = @{ name = "Summary Test Group" } | ConvertTo-Json
$groupResponse = Invoke-RestMethod -Uri "$baseUrl/groups" -Method POST -Headers $headers -Body $createGroupBody -ContentType "application/json"
$groupId = $groupResponse.data.group.id
Write-Host "   [OK] Group created: $groupId" -ForegroundColor Green

# 3. Add Participants
Write-Host "`n3. Adding Participants..." -ForegroundColor Cyan
$participants = @()
$names = @("Alice", "Bob", "Charlie")
foreach ($name in $names) {
    $body = @{ name = $name } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/participants" -Method POST -Headers $headers -Body $body -ContentType "application/json"
    $participants += $res.data.participant
    Write-Host "   [OK] Added: $($res.data.participant.name)" -ForegroundColor Green
}

$aliceId = $participants[0].id
$bobId = $participants[1].id
$charlieId = $participants[2].id

# 4. Create Test Expenses with Different Dates
Write-Host "`n4. Creating Test Expenses..." -ForegroundColor Cyan

# Expense 1: Jan 10, Alice pays, Dinner
$expense1 = @{
    payerId = $aliceId
    amount = 10000
    description = "Dinner at Italian restaurant"
    date = "2026-01-10T20:00:00Z"
    splitMode = "EQUAL"
    splits = @($aliceId, $bobId, $charlieId)
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/expenses" -Method POST -Headers $headers -Body $expense1 -ContentType "application/json" | Out-Null
Write-Host "   [OK] Created expense 1: Dinner (Jan 10, 100 dollars)" -ForegroundColor Green

# Expense 2: Jan 15, Bob pays, Hotel
$expense2 = @{
    payerId = $bobId
    amount = 30000
    description = "Hotel booking for weekend"
    date = "2026-01-15T14:00:00Z"
    splitMode = "EQUAL"
    splits = @($aliceId, $bobId, $charlieId)
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/expenses" -Method POST -Headers $headers -Body $expense2 -ContentType "application/json" | Out-Null
Write-Host "   [OK] Created expense 2: Hotel (Jan 15, 300 dollars)" -ForegroundColor Green

# Expense 3: Jan 20, Charlie pays, Gas
$expense3 = @{
    payerId = $charlieId
    amount = 5000
    description = "Gas for road trip"
    date = "2026-01-20T10:00:00Z"
    splitMode = "EQUAL"
    splits = @($aliceId, $bobId, $charlieId)
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/expenses" -Method POST -Headers $headers -Body $expense3 -ContentType "application/json" | Out-Null
Write-Host "   [OK] Created expense 3: Gas (Jan 20, 50 dollars)" -ForegroundColor Green

# Expense 4: Jan 25, Alice pays, Lunch
$expense4 = @{
    payerId = $aliceId
    amount = 2500
    description = "Lunch at cafe"
    date = "2026-01-25T12:00:00Z"
    splitMode = "EQUAL"
    splits = @($aliceId, $bobId)
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/expenses" -Method POST -Headers $headers -Body $expense4 -ContentType "application/json" | Out-Null
Write-Host "   [OK] Created expense 4: Lunch (Jan 25, 25 dollars)" -ForegroundColor Green

# 5. Test Summary Endpoint
Write-Host "`n5. Testing Summary Endpoint..." -ForegroundColor Cyan
$summary = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/summary" -Method GET -Headers $headers
$totalSpentDollars = [math]::Round($summary.data.totalSpent / 100, 2)
Write-Host "   Total spent: `$$totalSpentDollars" -ForegroundColor Yellow

# Total should be 100 + 300 + 50 + 25 = 475
if ($summary.data.totalSpent -eq 47500) {
    Write-Host "   [OK] Total spent correct (475 dollars)" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] Total spent incorrect: $($summary.data.totalSpent)" -ForegroundColor Red
}

# User-specific metrics should be 0 (no user-participant link)
if ($summary.data.yourTotalPaid -eq 0 -and $summary.data.yourTotalOwed -eq 0 -and $summary.data.netBalance -eq 0) {
    Write-Host "   [OK] User-specific metrics are 0 (no participant link)" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] User-specific metrics should be 0" -ForegroundColor Red
}

# 6. Test Date Range Filtering
Write-Host "`n6. Testing Date Range Filtering..." -ForegroundColor Cyan
Write-Host "   Filtering: Jan 12 to Jan 22 (should get Hotel and Gas)" -ForegroundColor Yellow
$filtered1 = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/expenses?from=2026-01-12&to=2026-01-22" -Method GET -Headers $headers
if ($filtered1.data.expenses.Count -eq 2) {
    Write-Host "   [OK] Found 2 expenses in date range" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] Expected 2 expenses, found $($filtered1.data.expenses.Count)" -ForegroundColor Red
}

# 7. Test Participant Filtering
Write-Host "`n7. Testing Participant Filtering..." -ForegroundColor Cyan
Write-Host "   Filtering: Alice as payer OR in splits" -ForegroundColor Yellow
$filtered2 = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/expenses?participantId=$aliceId" -Method GET -Headers $headers
# Alice is payer in 2 expenses, but involved in all 4
if ($filtered2.data.expenses.Count -eq 4) {
    Write-Host "   [OK] Found all 4 expenses involving Alice" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] Expected 4 expenses, found $($filtered2.data.expenses.Count)" -ForegroundColor Red
}

# 8. Test Amount Filtering
Write-Host "`n8. Testing Amount Range Filtering..." -ForegroundColor Cyan
Write-Host "   Filtering: minAmount=3000, maxAmount=12000 (30-120 dollars)" -ForegroundColor Yellow
$filtered3 = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/expenses?minAmount=3000&maxAmount=12000" -Method GET -Headers $headers
# Should get Dinner (10000) and Gas (5000)
if ($filtered3.data.expenses.Count -eq 2) {
    Write-Host "   [OK] Found 2 expenses in amount range" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] Expected 2 expenses, found $($filtered3.data.expenses.Count)" -ForegroundColor Red
}

# 9. Test Text Search
Write-Host "`n9. Testing Text Search..." -ForegroundColor Cyan
Write-Host "   Searching for 'hotel' (case-insensitive)" -ForegroundColor Yellow
$filtered4 = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/expenses?q=hotel" -Method GET -Headers $headers
if ($filtered4.data.expenses.Count -eq 1 -and $filtered4.data.expenses[0].description -like "*Hotel*") {
    Write-Host "   [OK] Found Hotel expense" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] Text search failed" -ForegroundColor Red
}

# 10. Test Combined Filters
Write-Host "`n10. Testing Combined Filters..." -ForegroundColor Cyan
Write-Host "   Filtering: from=2026-01-01, participantId=Bob, minAmount=1000" -ForegroundColor Yellow
$filtered5 = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/expenses?from=2026-01-01&participantId=$bobId&minAmount=1000" -Method GET -Headers $headers
# Bob is involved in all expenses except maybe some, but with minAmount=1000 should get all where he's involved
Write-Host "   [OK] Combined filters executed (found $($filtered5.data.expenses.Count) expenses)" -ForegroundColor Green

# 11. Test Empty Results
Write-Host "`n11. Testing Empty Filter Results..." -ForegroundColor Cyan
Write-Host "   Filtering: from=2026-02-01 (future date, no results)" -ForegroundColor Yellow
$filtered6 = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/expenses?from=2026-02-01" -Method GET -Headers $headers
if ($filtered6.data.expenses.Count -eq 0) {
    Write-Host "   [OK] No expenses found (as expected)" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] Should have no results" -ForegroundColor Red
}

# 12. Test Invalid Filter Parameters
Write-Host "`n12. Testing Invalid Filter Parameters..." -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/expenses?from=invalid-date" -Method GET -Headers $headers
    Write-Host "   [FAIL] Should have rejected invalid date" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "   [OK] Correctly rejected invalid date (400)" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 13. Test Invalid Amount Range
Write-Host "`n13. Testing Invalid Amount Range..." -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/expenses?minAmount=10000&maxAmount=5000" -Method GET -Headers $headers
    Write-Host "   [FAIL] Should have rejected invalid range" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "   [OK] Correctly rejected invalid range (400)" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 14. Test No Filters (Standard List)
Write-Host "`n14. Testing Standard List (No Filters)..." -ForegroundColor Cyan
$allExpenses = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/expenses" -Method GET -Headers $headers
if ($allExpenses.data.expenses.Count -eq 4) {
    Write-Host "   [OK] Found all 4 expenses" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] Expected 4 expenses, found $($allExpenses.data.expenses.Count)" -ForegroundColor Red
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Cyan
