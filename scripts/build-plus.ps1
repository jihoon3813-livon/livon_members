$ErrorActionPreference = "Stop"

$workspaceRoot = (Get-Item -Path $PSScriptRoot).Parent.FullName
$sourceDir = Join-Path $workspaceRoot "hoon\livon-careplus"
$targetDist = Join-Path $workspaceRoot "dist\plus"

Write-Host "=== LivOn Care Plus Landing Build Start ===" -ForegroundColor Cyan
Write-Host "Source: $sourceDir"
Write-Host "Target: $targetDist"

if (-not (Test-Path $sourceDir)) {
    throw "Source folder does not exist: $sourceDir"
}

if (Test-Path $targetDist) {
    Remove-Item -Path $targetDist -Recurse -Force
}
New-Item -ItemType Directory -Path $targetDist -Force | Out-Null

$itemsToCopy = @("index.html", "styles.css", "app.js", "assets")
foreach ($item in $itemsToCopy) {
    $srcPath = Join-Path $sourceDir $item
    if (Test-Path $srcPath) {
        Copy-Item -Path $srcPath -Destination $targetDist -Recurse -Force
    }
}

$distIndexPath = Join-Path $targetDist "index.html"
$html = [System.IO.File]::ReadAllText($distIndexPath, [System.Text.Encoding]::UTF8)
$html = $html.Replace('href="styles.css"', 'href="/plus/styles.css"')
$html = $html.Replace('src="app.js"', 'src="/plus/app.js"')
$html = $html.Replace('href="assets/', 'href="/plus/assets/')
$html = $html.Replace('src="assets/', 'src="/plus/assets/')
[System.IO.File]::WriteAllText($distIndexPath, $html, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "=== Care Plus Landing Build Completed Successfully ===" -ForegroundColor Green
Write-Host "Output: $distIndexPath"
