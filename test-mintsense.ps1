# Test MintSense AI Endpoint

$baseUrl = "http://localhost:3000/api"
$email = "test@splitmint.com"
$password = "password123"

Write-Host "=== MINTSENSE AI ENDPOINT TEST ===" -ForegroundColor Cyan

# 1. Login
Write-Host "`n1. Logging in..." -ForegroundColor Cyan
$loginBody = @{ email = $email; password = $password } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.token
$headers = @{ Authorization = "Bearer $token" }
Write-Host "   [OK] Logged in successfully" -ForegroundColor Green

# 2. Create Test Group
Write-Host "`n2. Creating Test Group..." -ForegroundColor Cyan
$createGroupBody = @{ name = "MintSense Test Group" } | ConvertTo-Json
$groupResponse = Invoke-RestMethod -Uri "$baseUrl/groups" -Method POST -Headers $headers -Body $createGroupBody -ContentType "application/json"
$groupId = $groupResponse.data.group.id
Write-Host "   [OK] Group created: $groupId" -ForegroundColor Green

# 3. Add Participants
Write-Host "`n3. Adding Participants (Alice, Rahul, Neha)..." -ForegroundColor Cyan
$participants = @()
$names = @("Alice", "Rahul", "Neha")
foreach ($name in $names) {
    $body = @{ name = $name } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/participants" -Method POST -Headers $headers -Body $body -ContentType "application/json"
    $participants += $res.data.participant
    Write-Host "   [OK] Added: $($res.data.participant.name)" -ForegroundColor Green
}

# 4. Test Natural Language Input - Simple Equal Split
Write-Host "`n4. Test 1: Simple Equal Split..." -ForegroundColor Cyan
$text1 = "Paid 1200 for dinner yesterday, split equally with Rahul and Neha"
Write-Host "   Input: $text1" -ForegroundColor Yellow

$draftBody1 = @{
    groupId = $groupId
    text = $text1
} | ConvertTo-Json

try {
    $draft1 = Invoke-RestMethod -Uri "$baseUrl/ai/expense-draft" -Method POST -Headers $headers -Body $draftBody1 -ContentType "application/json"
    
    Write-Host "   Draft Generated:" -ForegroundColor Green
    Write-Host "     Amount: $($draft1.data.draft.amount) cents" -ForegroundColor White
    Write-Host "     Description: $($draft1.data.draft.description)" -ForegroundColor White
    Write-Host "     Date: $($draft1.data.draft.date)" -ForegroundColor White
    Write-Host "     Split Mode: $($draft1.data.draft.splitMode)" -ForegroundColor White
    Write-Host "     Payer: $($draft1.data.draft.payer.name)" -ForegroundColor White
    Write-Host "     Participants: $($draft1.data.draft.participants.name -join ', ')" -ForegroundColor White
    Write-Host "     Confidence: $([math]::Round($draft1.data.confidence * 100, 0))%" -ForegroundColor White
    
    if ($draft1.data.warning) {
        Write-Host "     Warning: $($draft1.data.warning)" -ForegroundColor Yellow
    }
    
    Write-Host "   [OK] Test 1 passed" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] Test 1 failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Test Natural Language Input - With Date
Write-Host "`n5. Test 2: With Specific Date..." -ForegroundColor Cyan
$text2 = "Alice paid 5000 rupees for hotel on January 15th, split with everyone"
Write-Host "   Input: $text2" -ForegroundColor Yellow

$draftBody2 = @{
    groupId = $groupId
    text = $text2
} | ConvertTo-Json

try {
    $draft2 = Invoke-RestMethod -Uri "$baseUrl/ai/expense-draft" -Method POST -Headers $headers -Body $draftBody2 -ContentType "application/json"
    
    Write-Host "   Draft Generated:" -ForegroundColor Green
    Write-Host "     Amount: $($draft2.data.draft.amount) cents" -ForegroundColor White
    Write-Host "     Description: $($draft2.data.draft.description)" -ForegroundColor White
    Write-Host "     Payer: $($draft2.data.draft.payer.name)" -ForegroundColor White
    Write-Host "     Confidence: $([math]::Round($draft2.data.confidence * 100, 0))%" -ForegroundColor White
    
    Write-Host "   [OK] Test 2 passed" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] Test 2 failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Test Invalid Participant Name
Write-Host "`n6. Test 3: Invalid Participant Name..." -ForegroundColor Cyan
$text3 = "Bob paid 2000 for lunch, split with Alice"
Write-Host "   Input: $text3" -ForegroundColor Yellow

$draftBody3 = @{
    groupId = $groupId
    text = $text3
} | ConvertTo-Json

try {
    $draft3 = Invoke-RestMethod -Uri "$baseUrl/ai/expense-draft" -Method POST -Headers $headers -Body $draftBody3 -ContentType "application/json"
    Write-Host "   [FAIL] Should have rejected invalid participant name" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "   [OK] Correctly rejected invalid participant (400)" -ForegroundColor Green
        Write-Host "     Error message includes available participants" -ForegroundColor White
    } else {
        Write-Host "   [FAIL] Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 7. Test Empty Text
Write-Host "`n7. Test 4: Empty Text Validation..." -ForegroundColor Cyan
$draftBody4 = @{
    groupId = $groupId
    text = ""
} | ConvertTo-Json

try {
    $draft4 = Invoke-RestMethod -Uri "$baseUrl/ai/expense-draft" -Method POST -Headers $headers -Body $draftBody4 -ContentType "application/json"
    Write-Host "   [FAIL] Should have rejected empty text" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "   [OK] Correctly rejected empty text (400)" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 8. Test Ownership Validation
Write-Host "`n8. Test 5: Ownership Validation..." -ForegroundColor Cyan
Write-Host "   (Skipping - would require second user account)" -ForegroundColor Yellow

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Cyan
Write-Host "`nNOTE: AI-generated drafts may vary. Review the outputs above." -ForegroundColor Yellow
