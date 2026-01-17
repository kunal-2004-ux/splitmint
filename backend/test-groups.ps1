# Test Groups Module

$baseUrl = "http://localhost:3000/api"
$email = "test@splitmint.com"
$password = "password123"

# 1. Login to get token
Write-Host "1. Logging in..." -ForegroundColor Cyan
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.token
    $headers = @{
        Authorization = "Bearer $token"
    }
    Write-Host "   Login successful!" -ForegroundColor Green
} catch {
    Write-Host "   Login failed: $_" -ForegroundColor Red
    exit
}

# 2. Create Group
Write-Host "`n2. Creating Group..." -ForegroundColor Cyan
$createBody = @{
    name = "Weekend Trip"
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "$baseUrl/groups" -Method POST -Headers $headers -Body $createBody -ContentType "application/json"
    $groupId = $createResponse.data.group.id
    Write-Host "   Group created! ID: $groupId" -ForegroundColor Green
    
    # Verify ownerId is NOT in response
    if ($createResponse.data.group.ownerId) {
        Write-Host "   WARNING: ownerId leaked in response!" -ForegroundColor Yellow
    } else {
        Write-Host "   Security Check: ownerId not leaked in response." -ForegroundColor Green
    }
} catch {
    Write-Host "   Create failed: $_" -ForegroundColor Red
    exit
}

# 3. List Groups
Write-Host "`n3. Listing Groups..." -ForegroundColor Cyan
try {
    $listResponse = Invoke-RestMethod -Uri "$baseUrl/groups" -Method GET -Headers $headers
    $count = $listResponse.data.groups.Count
    Write-Host "   Found $count groups." -ForegroundColor Green
} catch {
    Write-Host "   List failed: $_" -ForegroundColor Red
}

# 4. Get Group Details
Write-Host "`n4. Getting Group Details..." -ForegroundColor Cyan
try {
    $getResponse = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId" -Method GET -Headers $headers
    $fetchedName = $getResponse.data.group.name
    Write-Host "   Fetched group: $fetchedName" -ForegroundColor Green
} catch {
    Write-Host "   Get failed: $_" -ForegroundColor Red
}

# 5. Update Group
Write-Host "`n5. Updating Group..." -ForegroundColor Cyan
$updateBody = @{
    name = "Amazing Weekend Trip"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId" -Method PUT -Headers $headers -Body $updateBody -ContentType "application/json"
    $updatedName = $updateResponse.data.group.name
    Write-Host "   Updated name: $updatedName" -ForegroundColor Green
} catch {
    Write-Host "   Update failed: $_" -ForegroundColor Red
}

# 6. Create User B and Try Access (Security Test)
Write-Host "`n6. Security Test: Access by User B..." -ForegroundColor Cyan
$userBEmail = "hacker@splitmint.com"
$registerBody = @{
    email = $userBEmail
    password = "password123"
} | ConvertTo-Json

try {
    # Try register (ignore if exists)
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -ErrorAction SilentlyContinue
} catch {}

try {
    $loginBResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $registerBody -ContentType "application/json"
    $tokenB = $loginBResponse.data.token
    $headersB = @{
        Authorization = "Bearer $tokenB"
    }
    
    # Try to get User A's group
    Invoke-RestMethod -Uri "$baseUrl/groups/$groupId" -Method GET -Headers $headersB
    Write-Host "   SECURITY FAIL: User B could access User A's group!" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host "   Security Check Passed: User B got 403 Forbidden" -ForegroundColor Green
    } else {
        Write-Host "   Unexpected error: $statusCode" -ForegroundColor Yellow
    }
}

# 7. Delete Group
Write-Host "`n7. Deleting Group..." -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "$baseUrl/groups/$groupId" -Method DELETE -Headers $headers
    Write-Host "   Group deleted successfully." -ForegroundColor Green
} catch {
    Write-Host "   Delete failed: $_" -ForegroundColor Red
}

Write-Host "`n✅ All Tests Completed!" -ForegroundColor Cyan
