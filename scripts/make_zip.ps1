
Remove-Item -Path 'antigravity-v*.zip' -Force -ErrorAction SilentlyContinue

$excludePatterns = @('node_modules', '.git', '.gemini', 'antigravity-v*.zip', 'scratch')
$items = @()
foreach ($item in Get-ChildItem .) {
    $skip = $false
    foreach ($pat in $excludePatterns) {
        if ($item.Name -like $pat) { $skip = $true; break }
    }
    if (-not $skip) { $items += $item.FullName }
}

Compress-Archive -Path $items -DestinationPath 'antigravity-v1.3.2.zip' -Force
Write-Host "ZIP antigravity-v1.3.2.zip gerado com sucesso!" -ForegroundColor Green
