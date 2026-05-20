
Remove-Item -Path 'antigravity-v1.2.10.zip' -Force -ErrorAction SilentlyContinue
Remove-Item -Path 'antigravity-v1.2.11.zip' -Force -ErrorAction SilentlyContinue

$excludePatterns = @('node_modules', '.git', '.gemini', 'antigravity-v*.zip', 'scratch')
$items = @()
foreach ($item in Get-ChildItem .) {
    $skip = $false
    foreach ($pat in $excludePatterns) {
        if ($item.Name -like $pat) { $skip = $true; break }
    }
    if (-not $skip) { $items += $item.FullName }
}

Compress-Archive -Path $items -DestinationPath 'antigravity-v1.2.11.zip' -Force
Write-Host "ZIP antigravity-v1.2.11.zip gerado com sucesso!" -ForegroundColor Green
