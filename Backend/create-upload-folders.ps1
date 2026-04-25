# Create organized upload folder structure
# Run this script from the Backend folder: .\create-upload-folders.ps1

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Creating Organized Upload Folder Structure" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$baseFolder = "uploads"
$documentTypes = @(
    "personal-photos",
    "national-ids",
    "medical-reports",
    "proofs",
    "passports",
    "salary-slips",
    "student-proofs",
    "media",
    "advertisements",
    "other"
)

$userTypes = @(
    "members",
    "team-members",
    "staff",
    "participants"
)

$createdCount = 0

foreach ($docType in $documentTypes) {
    foreach ($userType in $userTypes) {
        $folderPath = Join-Path -Path $baseFolder -ChildPath "$docType\$userType"
        
        if (-not (Test-Path -Path $folderPath)) {
            New-Item -Path $folderPath -ItemType Directory -Force | Out-Null
            Write-Host "✅ Created: $folderPath" -ForegroundColor Green
            $createdCount++
        } else {
            Write-Host "⏭️  Exists:  $folderPath" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Folder structure created successfully!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Structure:" -ForegroundColor White
Write-Host "   uploads/" -ForegroundColor White
Write-Host "   - personal-photos/ (members, team-members, staff, participants)" -ForegroundColor Gray
Write-Host "   - national-ids/ (members, team-members, staff, participants)" -ForegroundColor Gray
Write-Host "   - medical-reports/ (members, team-members, staff, participants)" -ForegroundColor Gray
Write-Host "   - proofs/ (members, team-members, staff, participants)" -ForegroundColor Gray
Write-Host "   - passports/ (members, team-members, staff, participants)" -ForegroundColor Gray
Write-Host "   - salary-slips/ (members, team-members, staff, participants)" -ForegroundColor Gray
Write-Host "   - student-proofs/ (members, team-members, staff, participants)" -ForegroundColor Gray
Write-Host "   - media/ (members, team-members, staff, participants)" -ForegroundColor Gray
Write-Host "   - advertisements/ (members, team-members, staff, participants)" -ForegroundColor Gray
Write-Host "   - other/ (members, team-members, staff, participants)" -ForegroundColor Gray
Write-Host ""
Write-Host "Total folders created/verified: 40 (10 document types x 4 user types)" -ForegroundColor Green
Write-Host ""
