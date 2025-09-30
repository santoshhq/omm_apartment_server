# PowerShell script to create MongoDB collections via API calls
Write-Host "🗄️ CREATING MONGODB COLLECTIONS" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$baseURL = "http://localhost:8080/api"
$adminId = "68d664d7d84448fff5dc3a8b"

Write-Host "🚀 Starting collection creation process..." -ForegroundColor Yellow
Write-Host ""

# Function to make API calls
function Invoke-ApiCall($method, $url, $body = $null) {
    try {
        $headers = @{"Content-Type" = "application/json"}
        if ($body) {
            $response = Invoke-RestMethod -Uri $url -Method $method -Headers $headers -Body $body
        } else {
            $response = Invoke-RestMethod -Uri $url -Method $method -Headers $headers
        }
        return $response
    } catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# 1. Create Amenity Collection
Write-Host "1️⃣ Creating Amenity collection..." -ForegroundColor Green
$amenityData = @{
    name = "Sample Swimming Pool"
    description = "A sample amenity to create the collection"
    capacity = 50
    location = "Ground Floor"
    hourlyRate = 25.00
    imagePaths = @("https://example.com/pool.jpg")
    features = @("Heated Water", "Pool Lights", "Changing Rooms")
    active = $true
} | ConvertTo-Json

$amenityResponse = Invoke-ApiCall -method "POST" -url "$baseURL/amenities/admin/$adminId" -body $amenityData
if ($amenityResponse) {
    Write-Host "   ✅ Amenity collection created with document ID: $($amenityResponse.data.amenity.id)" -ForegroundColor Green
}

# Wait a moment
Start-Sleep -Seconds 1

# 2. Create EventCard Collection
Write-Host ""
Write-Host "2️⃣ Creating EventCard collection..." -ForegroundColor Green
$eventCardData = @{
    title = "Sample Community Event"
    description = "A sample event to create the collection"
    eventType = "Meeting"
    eventDate = "2025-12-15T18:00:00.000Z"
    location = "Community Hall"
    organizer = "Community Committee"
    maxAttendees = 100
    registrationRequired = $true
    ticketPrice = 10.00
    contactInfo = "events@community.com"
    images = @("https://example.com/event.jpg")
    tags = @("Community", "Meeting", "Sample")
    isActive = $true
} | ConvertTo-Json

$eventResponse = Invoke-ApiCall -method "POST" -url "$baseURL/event-cards/admin/$adminId" -body $eventCardData
if ($eventResponse) {
    Write-Host "   ✅ EventCard collection created with document ID: $($eventResponse.data.eventCard.id)" -ForegroundColor Green
}

# Wait a moment
Start-Sleep -Seconds 1

# 3. Check existing collections
Write-Host ""
Write-Host "3️⃣ Checking existing AdminMember collections..." -ForegroundColor Green
$membersResponse = Invoke-ApiCall -method "GET" -url "$baseURL/admin-members/admin/$adminId"
if ($membersResponse) {
    Write-Host "   ✅ AdminMemberProfile and AdminMemberCredentials collections exist" -ForegroundColor Green
    Write-Host "   📊 Total members: $($membersResponse.data.totalMembers)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 COLLECTION CREATION PROCESS COMPLETED!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Collections that should now exist in MongoDB Compass:" -ForegroundColor Cyan
Write-Host "   1. ✅ amenities (from Amenity model)" -ForegroundColor White
Write-Host "   2. ✅ eventcards (from EventCard model)" -ForegroundColor White
Write-Host "   3. ✅ adminmemberprofiles (from AdminMemberProfile model)" -ForegroundColor White
Write-Host "   4. ✅ adminmembercredentials (from AdminMemberCredentials model)" -ForegroundColor White
Write-Host "   5. ✅ adminsignups (from Signup model)" -ForegroundColor White

Write-Host ""
Write-Host "🔍 Check MongoDB Compass now!" -ForegroundColor Yellow
Write-Host "   Database: omm_server" -ForegroundColor White
Write-Host "   Collections should be visible with sample data" -ForegroundColor White

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")