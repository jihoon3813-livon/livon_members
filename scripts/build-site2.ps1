$ErrorActionPreference = "Stop"

$workspaceRoot = (Get-Item -Path $PSScriptRoot).Parent.FullName
$sourceDir = Join-Path $workspaceRoot "hoon\livon-care-membership-antigravity"
$targetDist = Join-Path $workspaceRoot "dist\2"
$tempBuild = Join-Path $env:TEMP "livon-site2-build"

Write-Host "=== LivOn Care Membership Site 2 Build Start ===" -ForegroundColor Cyan
Write-Host "Source: $sourceDir"
Write-Host "Temp Build: $tempBuild"
Write-Host "Target: $targetDist"

if (-not (Test-Path $tempBuild)) {
    New-Item -ItemType Directory -Path $tempBuild -Force | Out-Null
}

Write-Host "[1/4] Cleaning old folders and syncing fresh source files..." -ForegroundColor Yellow
$foldersToClean = @("public", "src", "dist")
foreach ($folder in $foldersToClean) {
    $folderPath = Join-Path $tempBuild $folder
    if (Test-Path $folderPath) {
        Remove-Item -Path $folderPath -Recurse -Force
    }
}

$filesToCopy = @("public", "src", "index.html", "package.json", "package-lock.json", "postcss.config.mjs", "tsconfig.json", "vite.config.ts")
foreach ($item in $filesToCopy) {
    $srcPath = Join-Path $sourceDir $item
    if (Test-Path $srcPath) {
        Copy-Item -Path $srcPath -Destination $tempBuild -Recurse -Force
    }
}

Push-Location $tempBuild
try {
    Write-Host "[2/4] Installing npm dependencies..." -ForegroundColor Yellow
    if (-not (Test-Path (Join-Path $tempBuild "node_modules"))) {
        cmd.exe /c "npm install --no-audit"
        if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
    }

    Write-Host "[3/4] Building with Vite..." -ForegroundColor Yellow
    cmd.exe /c "npm run build"
    if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }
}
finally {
    Pop-Location
}

Write-Host "[4/4] Copying build artifacts to dist/2..." -ForegroundColor Yellow
$tempDist = Join-Path $tempBuild "dist"
if (-not (Test-Path $tempDist)) {
    throw "Build folder dist does not exist: $tempDist"
}

if (Test-Path $targetDist) {
    Remove-Item -Path $targetDist -Recurse -Force
}
New-Item -ItemType Directory -Path $targetDist -Force | Out-Null

Copy-Item -Path (Join-Path $tempDist "*") -Destination $targetDist -Recurse -Force

Write-Host "=== Site 2 Build Completed Successfully ===" -ForegroundColor Green
Write-Host "Output: $targetDist\index.html"
