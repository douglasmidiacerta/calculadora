Add-Type -AssemblyName System.Drawing
try {
    $srcLogo = "c:\Users\credc\OneDrive\Documentos\calculadora\EMPRESTABHLOGO-CSxk8ONe.webp"
    $destLogoFolder = "c:\Users\credc\OneDrive\Documentos\calculadora\saas_assets\empresta_bh"
    
    if (-not (Test-Path $destLogoFolder)) {
        New-Item -ItemType Directory -Path $destLogoFolder -Force | Out-Null
    }
    
    $destLogo = "$destLogoFolder\logo.png"
    
    $srcFavicon = "c:\Users\credc\OneDrive\Documentos\calculadora\Favicon_Emprestabh-CiRpm18-.webp"
    $destFavicon = "$destLogoFolder\favicon.png"

    Write-Host "Tentando converter a logo $srcLogo..."
    $imgLogo = [System.Drawing.Image]::FromFile($srcLogo)
    $imgLogo.Save($destLogo, [System.Drawing.Imaging.ImageFormat]::Png)
    $imgLogo.Dispose()
    Write-Host "Logo convertida e salva em $destLogo!" -ForegroundColor Green

    Write-Host "Tentando converter o favicon $srcFavicon..."
    $imgFavicon = [System.Drawing.Image]::FromFile($srcFavicon)
    $imgFavicon.Save($destFavicon, [System.Drawing.Imaging.ImageFormat]::Png)
    $imgFavicon.Dispose()
    Write-Host "Favicon convertido e salvo em $destFavicon!" -ForegroundColor Green
} catch {
    Write-Error "Ocorreu um erro ao carregar/salvar as imagens da Empresta BH: $_"
}
