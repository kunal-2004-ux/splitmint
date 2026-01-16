# Test Expenses Module

$baseUrl = "http://localhost:3000/api"
$email = "test@splitmint.com"
$password = "password123"

Write-Host "=== EXPENSES MODULE TEST ===" -ForegroundColor Cyan

# 1. Login to get token
Write-Host "`n1. Logging in..." -ForegroundColor Cyan
$loginBody = @{ email = $email; password = $password } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.token
$headers = @{ Authorization = "Bearer $token" }
Write-Host "   [OK] Logged in successfully" -ForegroundColor Green

# 2. Setup: Create a Group
Write-Host "`n2. Creating Test Group..." -ForegroundColor Cyan
$createGroupBody = @{ name = "Weekend Trip" } | ConvertTo-Json
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

# 4. Test EQUAL Split Mode
Write-Host "`n4. Testing EQUAL Split Mode..." -ForegroundColor Cyan
Write-Host "   Creating expense: 100 dollars split equally among 3 people" -ForegroundColor Yellow
$equalExpenseBody = @{
    payerId = $aliceId
    amount = 10000  # $100.00 in cents
    description = "Dinner at restaurant"
    date = "2026-01-16T20:00:00Z"
    splitMode = "EQUAL"
    splits = @($aliceId, $bobId, $charlieId)
} | ConvertTo-Json
$equalExpense = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/expenses" -Method POST -Headers $headers -Body $equalExpenseBody -ContentType "application/json"
Write-Host "   [OK] Expense created: $($equalExpense.data.expense.id)" -ForegroundColor Green

# Verify split amounts
$splits = $equalExpense.data.expense.splits
$aliceSplit = ($splits | Where-Object { $_.participantId -eq $aliceId }).shareAmount
$bobSplit = ($splits | Where-Object { $_.participantId -eq $bobId }).shareAmount
$charlieSplit = ($splits | Where-Object { $_.participantId -eq $charlieId }).shareAmount

Write-Host "   Split breakdown:" -ForegroundColor Yellow
Write-Host "     Alice (payer): $([math]::Round($aliceSplit/100, 2))" -ForegroundColor White
Write-Host "     Bob: $([math]::Round($bobSplit/100, 2))" -ForegroundColor White
Write-Host "     Charlie: $([math]::Round($charlieSplit/100, 2))" -ForegroundColor White

$total = $aliceSplit + $bobSplit + $charlieSplit
if ($total -eq 10000) {
    Write-Host "   [OK] Split totals match expense amount" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] Split totals ($total) don't match expense (10000)" -ForegroundColor Red
}

# 5. Test CUSTOM Split Mode
Write-Host "`n5. Testing CUSTOM Split Mode..." -ForegroundColor Cyan
Write-Host "   Creating expense: 150 dollars with custom splits" -ForegroundColor Yellow
$customExpenseBody = @{
    payerId = $bobId
    amount = 15000  # $150.00
    description = "Hotel booking"
    date = "2026-01-16T21:00:00Z"
    splitMode = "CUSTOM"
    splits = @(
        @{ participantId = $aliceId; shareAmount = 5000 },   # $50
        @{ participantId = $bobId; shareAmount = 7000 },     # $70
        @{ participantId = $charlieId; shareAmount = 3000 }  # $30
    )
} | ConvertTo-Json -Depth 3
$customExpense = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/expenses" -Method POST -Headers $headers -Body $customExpenseBody -ContentType "application/json"
Write-Host "   [OK] Expense created: $($customExpense.data.expense.id)" -ForegroundColor Green

# 6. Test PERCENTAGE Split Mode
Write-Host "`n6. Testing PERCENTAGE Split Mode..." -ForegroundColor Cyan
Write-Host "   Creating expense: 99 dollars with percentage splits" -ForegroundColor Yellow
$percentageExpenseBody = @{
    payerId = $charlieId
    amount = 9900  # $99.00
    description = "Gas for trip"
    date = "2026-01-16T22:00:00Z"
    splitMode = "PERCENTAGE"
    splits = @(
        @{ participantId = $aliceId; percentage = 40 },
        @{ participantId = $bobId; percentage = 35 },
        @{ participantId = $charlieId; percentage = 25 }
    )
} | ConvertTo-Json -Depth 3
$percentageExpense = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/expenses" -Method POST -Headers $headers -Body $percentageExpenseBody -ContentType "application/json"
Write-Host "   [OK] Expense created: $($percentageExpense.data.expense.id)" -ForegroundColor Green

# Verify percentage splits
$pctSplits = $percentageExpense.data.expense.splits
$alicePct = ($pctSplits | Where-Object { $_.participantId -eq $aliceId }).shareAmount
$bobPct = ($pctSplits | Where-Object { $_.participantId -eq $bobId }).shareAmount
$charliePct = ($pctSplits | Where-Object { $_.participantId -eq $charlieId }).shareAmount

Write-Host "   Split breakdown:" -ForegroundColor Yellow
Write-Host "     Alice (40%): $([math]::Round($alicePct/100, 2))" -ForegroundColor White
Write-Host "     Bob (35%): $([math]::Round($bobPct/100, 2))" -ForegroundColor White
Write-Host "     Charlie (25%, payer): $([math]::Round($charliePct/100, 2))" -ForegroundColor White

$pctTotal = $alicePct + $bobPct + $charliePct
if ($pctTotal -eq 9900) {
    Write-Host "   [OK] Split totals match expense amount" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] Split totals ($pctTotal) don't match expense (9900)" -ForegroundColor Red
}

# 7. List All Expenses
Write-Host "`n7. Listing All Expenses..." -ForegroundColor Cyan
$listResponse = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/expenses" -Method GET -Headers $headers
$expenseCount = $listResponse.data.expenses.Count
Write-Host "   [OK] Found $expenseCount expenses" -ForegroundColor Green

# 8. Update Expense
Write-Host "`n8. Updating Expense..." -ForegroundColor Cyan
$expenseId = $equalExpense.data.expense.id
$updateBody = @{
    description = "Dinner at fancy restaurant (updated)"
    amount = 12000  # Changed from $100 to $120
} | ConvertTo-Json
$updateResponse = Invoke-RestMethod -Uri "$baseUrl/expenses/$expenseId" -Method PUT -Headers $headers -Body $updateBody -ContentType "application/json"
if ($updateResponse.data.expense.description -like "*updated*") {
    Write-Host "   [OK] Expense updated successfully" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] Expense not updated" -ForegroundColor Red
}

# 9. Test Validation: Invalid Split Total (CUSTOM)
Write-Host "`n9. Testing Validation: Invalid Split Total..." -ForegroundColor Cyan
try {
    $invalidBody = @{
        payerId = $aliceId
        amount = 10000
        description = "Invalid expense"
        date = "2026-01-16T23:00:00Z"
        splitMode = "CUSTOM"
        splits = @(
            @{ participantId = $aliceId; shareAmount = 5000 },
            @{ participantId = $bobId; shareAmount = 4000 }  # Only 9000, should be 10000
        )
    } | ConvertTo-Json -Depth 3
    Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/expenses" -Method POST -Headers $headers -Body $invalidBody -ContentType "application/json"
    Write-Host "   [FAIL] Should have rejected invalid split total" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "   [OK] Correctly rejected invalid split total (400)" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 10. Test Validation: Invalid Percentage Total
Write-Host "`n10. Testing Validation: Invalid Percentage Total..." -ForegroundColor Cyan
try {
    $invalidPctBody = @{
        payerId = $aliceId
        amount = 10000
        description = "Invalid percentage"
        date = "2026-01-16T23:00:00Z"
        splitMode = "PERCENTAGE"
        splits = @(
            @{ participantId = $aliceId; percentage = 50 },
            @{ participantId = $bobId; percentage = 40 }  # Only 90%, should be 100%
        )
    } | ConvertTo-Json -Depth 3
    Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/expenses" -Method POST -Headers $headers -Body $invalidPctBody -ContentType "application/json"
    Write-Host "   [FAIL] Should have rejected invalid percentage total" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "   [OK] Correctly rejected invalid percentage total (400)" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 11. Delete Expense
Write-Host "`n11. Deleting Expense..." -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "$baseUrl/expenses/$expenseId" -Method DELETE -Headers $headers
    Write-Host "   [OK] Expense deleted successfully" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] Could not delete expense" -ForegroundColor Red
}

# 12. Verify Deletion
Write-Host "`n12. Verifying Deletion..." -ForegroundColor Cyan
$finalList = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/expenses" -Method GET -Headers $headers
$finalCount = $finalList.data.expenses.Count
if ($finalCount -eq ($expenseCount - 1)) {
    Write-Host "   [OK] Expense count reduced from $expenseCount to $finalCount" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] Expected $($expenseCount - 1) expenses, found $finalCount" -ForegroundColor Red
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Cyan
