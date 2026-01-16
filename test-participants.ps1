# Test Participants Module

$baseUrl = "http://localhost:3000/api"
$email = "test@splitmint.com"
$password = "password123"

# 1. Login to get token
Write-Host "1. Logging in..." -ForegroundColor Cyan
$loginBody = @{ email = $email; password = $password } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.token
$headers = @{ Authorization = "Bearer $token" }

# 2. Setup: Create a Group for testing
Write-Host "`n2. Creating Test Group..." -ForegroundColor Cyan
$createGroupBody = @{ name = "Dinner Party" } | ConvertTo-Json
$groupResponse = Invoke-RestMethod -Uri "$baseUrl/groups" -Method POST -Headers $headers -Body $createGroupBody -ContentType "application/json"
$groupId = $groupResponse.data.group.id
Write-Host "   Group created: $groupId" -ForegroundColor Green

# 3. Add Participants (Normal Case)
Write-Host "`n3. Adding 3 Participants..." -ForegroundColor Cyan
$names = @("Alice", "Bob", "Charlie")
foreach ($name in $names) {
    $body = @{ name = $name } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/participants" -Method POST -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "   Added: $($res.data.participant.name)" -ForegroundColor Green
}

# 4. List Participants
Write-Host "`n4. Listing Participants..." -ForegroundColor Cyan
$listRes = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/participants" -Method GET -Headers $headers
$count = $listRes.data.participants.Count
if ($count -eq 3) {
    Write-Host "   Success: Found $count participants" -ForegroundColor Green
} else {
    Write-Host "   FAIL: Expected 3, found $count" -ForegroundColor Red
}

# 5. Security Test 1: Max Limit (Add 5th - actually 4th here because we added 3. Wait, logic is max 4 participants total including me? No, max 4 participants in the list.)
# Actually requirements say: "max 4 participants total (primary user + max 3 others)" -- Wait, usually participants model stores everyone OR just others?
# Requirement said: "A Group can have max 4 participants total"
# Let's try to add a 4th one (David).
Write-Host "`n5. Testing Max Limit (Adding 4th participant - David)..." -ForegroundColor Cyan
try {
    $body = @{ name = "David" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/participants" -Method POST -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "   Added 4th participant (David)" -ForegroundColor Green
} catch {
    Write-Host "   Failed to add 4th: $_" -ForegroundColor Yellow
}

# Now try 5th (Eve) - Should Fail
Write-Host "`n6. Testing Max Limit Exceeded (Adding 5th - Eve)..." -ForegroundColor Cyan
try {
    $body = @{ name = "Eve" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/participants" -Method POST -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "   FAIL: Should not support 5 participants!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 409) {
        Write-Host "   Success: Got 409 Conflict (Limit Exceeded)" -ForegroundColor Green
    } else {
        Write-Host "   Unexpected Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 7. Update Participant
Write-Host "`n7. Updating Participant (Alice -> Alice Modified)..." -ForegroundColor Cyan
$pId = $listRes.data.participants[0].id
$updateBody = @{ name = "Alice Modified"; color = "#FF0000" } | ConvertTo-Json
$updateRes = Invoke-RestMethod -Uri "$baseUrl/participants/$pId" -Method PUT -Headers $headers -Body $updateBody -ContentType "application/json"
if ($updateRes.data.participant.name -eq "Alice Modified") {
    Write-Host "   Success: Name updated" -ForegroundColor Green
} else {
    Write-Host "   FAIL: Name not updated" -ForegroundColor Red
}

# 8. Remove Participant
Write-Host "`n8. Removing Participant..." -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "$baseUrl/participants/$pId" -Method DELETE -Headers $headers
    Write-Host "   Success: Participant removed" -ForegroundColor Green
} catch {
    Write-Host "   FAIL: Could not remove participant" -ForegroundColor Red
}

Write-Host "`n✅ Verification Complete!" -ForegroundColor Cyan
