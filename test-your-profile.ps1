# PowerShell Test Script for Admin Profile: 68d66709d84448fff5dc3ab8

Write-Host "=== Testing Admin Profile Update ===" -ForegroundColor Green
Write-Host "Profile ID: 68d66709d84448fff5dc3ab8" -ForegroundColor Yellow
Write-Host "Current Name: santoshgudi asdlkjjh" -ForegroundColor Yellow
Write-Host ""

# Test 1: Get current profile
Write-Host "Test 1: Getting current profile..." -ForegroundColor Cyan
try {
    $currentProfile = Invoke-WebRequest -Uri 'http://localhost:8080/api/admin-profiles/68d66709d84448fff5dc3ab8' -Method GET
    Write-Host "Current Profile:" -ForegroundColor Green
    $currentProfile.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error getting profile: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" + "="*50 + "`n"

# Test 2: Update first name and phone
Write-Host "Test 2: Updating firstName and phone..." -ForegroundColor Cyan
$updateBody = @{
    firstName = "Santosh Updated"
    phone = "+91-9999888777"
} | ConvertTo-Json

try {
    $updateResult = Invoke-WebRequest -Uri 'http://localhost:8080/api/admin-profiles/68d66709d84448fff5dc3ab8' -Method PUT -ContentType 'application/json' -Body $updateBody
    Write-Host "Update Result:" -ForegroundColor Green
    $updateResult.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error updating profile: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" + "="*50 + "`n"

# Test 3: Get updated profile to verify changes
Write-Host "Test 3: Verifying updates..." -ForegroundColor Cyan
try {
    $updatedProfile = Invoke-WebRequest -Uri 'http://localhost:8080/api/admin-profiles/68d66709d84448fff5dc3ab8' -Method GET
    Write-Host "Updated Profile:" -ForegroundColor Green
    $updatedProfile.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error getting updated profile: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green