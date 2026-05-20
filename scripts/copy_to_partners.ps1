# Script PowerShell automatizado para replicação do core da calculadora para as instâncias SaaS dos parceiros
# Este script copia os fontes do core base, substitui programaticamente as strings de marca e injeta os ativos visuais exclusivos (logo e favicon).

$partners = @{
    "d_cred"       = "D Cred"
    "credpara"     = "CredPara"
    "melhor_credi" = "Melhor Credi"
}

# Itens e diretórios que não devem ser replicados do core base para as pastas de parceiros
$excludeList = @(
    "node_modules", 
    "dist", 
    ".git", 
    "saas", 
    "saas_assets", 
    "scripts", 
    ".env", 
    ".env.example", 
    "metadata.json", 
    "antigravity-*.zip", 
    "simulador-dist-*.zip", 
    ".gemini"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "INICIANDO A REPLICAÇÃO AUTOMATIZADA DE PARCEIROS SAAS v1.2.3" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

foreach ($partnerKey in $partners.Keys) {
    $partnerName = $partners[$partnerKey]
    $destFolder = "saas/$partnerKey"
    
    Write-Host ""
    Write-Host ">>> Processando parceiro: $partnerName ($destFolder)..." -ForegroundColor Yellow
    
    # 1. Limpeza do diretório de destino
    if (Test-Path $destFolder) {
        Write-Host "   - Removendo diretório anterior..." -ForegroundColor DarkGray
        Remove-Item -Path $destFolder -Recurse -Force -ErrorAction SilentlyContinue
    }
    New-Item -Path $destFolder -ItemType Directory -Force | Out-Null
    
    # 2. Cópia recursiva dos fontes base do core
    Write-Host "   - Copiando código-fonte do core base..." -ForegroundColor DarkGray
    $items = Get-ChildItem -Path . -Exclude $excludeList
    foreach ($item in $items) {
        $destPath = Join-Path $destFolder $item.Name
        Copy-Item -Path $item.FullName -Destination $destPath -Recurse -Force
    }
    
    # 3. Substituição programática de strings de marca em src/App.tsx
    $appFile = "$destFolder/src/App.tsx"
    if (Test-Path $appFile) {
        Write-Host "   - Customizando strings de marca no App.tsx..." -ForegroundColor DarkGray
        $content = Get-Content -Path $appFile -Raw
        
        # Substitui o título dinâmico da aba do navegador no useEffect
        $content = $content.Replace('document.title = "Empresta BH - Calculadora";', "document.title = `"$partnerName - Calculadora`";")
        
        # Substitui a marca no copyright do rodapé
        $content = $content.Replace('Empresta BH ©', "$partnerName ©")
        
        # Substitui a marca no título do PNG exportado usando regex com lookbehind para máxima precisão
        $content = $content -replace '(?<=fontSize:\s*''24px'',\s*fontWeight:\s*''800''\s*\}\}>\s*\r?\n\s*)Empresta BH', $partnerName
        
        # Grava as modificações de volta no arquivo
        [System.IO.File]::WriteAllText($appFile, $content, [System.Text.Encoding]::UTF8)
        Write-Host "   - Customização de strings concluída!" -ForegroundColor Green
    } else {
        Write-Warning "   - ATENÇÃO: Arquivo $appFile não encontrado!"
    }
    
    # 4. Injeção de ativos visuais exclusivos (logo e favicon)
    $assetsSourceFolder = "saas_assets/$partnerKey"
    $publicFolder = "$destFolder/public"
    
    if (Test-Path $assetsSourceFolder) {
        Write-Host "   - Injetando logo e favicon customizados..." -ForegroundColor DarkGray
        if (Test-Path "$assetsSourceFolder/logo.png") {
            Copy-Item -Path "$assetsSourceFolder/logo.png" -Destination "$publicFolder/logo.png" -Force
            Write-Host "     * logo.png copiado com sucesso!" -ForegroundColor DarkGreen
        }
        if (Test-Path "$assetsSourceFolder/favicon.png") {
            Copy-Item -Path "$assetsSourceFolder/favicon.png" -Destination "$publicFolder/favicon.png" -Force
            Write-Host "     * favicon.png copiado com sucesso!" -ForegroundColor DarkGreen
        }
    } else {
        Write-Warning "   - ATENÇÃO: Diretório de ativos $assetsSourceFolder não encontrado!"
    }
    
    Write-Host ">>> Parceiro $partnerName replicado e customizado!" -ForegroundColor Green
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "REPLICAÇÃO CONCLUÍDA COM SUCESSO PARA TODOS OS PARCEIROS!" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
