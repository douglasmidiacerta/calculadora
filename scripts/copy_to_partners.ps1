# Script PowerShell automatizado para replicação do core da calculadora para as instâncias SaaS dos parceiros
# Este script copia os fontes do core base, substitui programaticamente as strings de marca e injeta os ativos visuais exclusivos (logo e favicon).

$partners = @{
    "d_cred"       = "D Cred"
    "credpara"     = "CredPara"
    "melhorcredito"= "Melhor Crédito"
    "credsimples"  = "Cred Simples"
    "forcepay"     = "ForcePay"
    "roma"         = "Roma"
    "credfacil"    = "Cred Fácil"
    "rose"         = "Rose"
    "rtgroup"      = "RT Group"
    "ramos"        = "Ramos"
}

# Configuração de tabelas padrão de taxas de custo da máquina específicas por parceiro SaaS
$partnerTaxasCusto = @{
    "credfacil" = 'const DEFAULT_TAXAS_CUSTO: Record<string, Record<number, number>> = {
  "Master/Visa": {
    1: 4.00, 2: 5.50, 3: 6.10, 4: 6.90, 5: 7.50, 6: 8.20, 7: 9.00, 8: 9.50, 9: 10.30, 10: 11.00,
    11: 11.50, 12: 12.10, 13: 12.60, 14: 13.00, 15: 13.50, 16: 14.20, 17: 14.50, 18: 16.00,
    19: 18.00, 20: 18.30, 21: 19.00
  },
  "Elo": {
    1: 5.00, 2: 6.50, 3: 7.10, 4: 7.90, 5: 8.50, 6: 9.20, 7: 10.00, 8: 10.50, 9: 11.30, 10: 12.00,
    11: 12.50, 12: 13.10, 13: 13.60, 14: 14.00, 15: 14.50, 16: 15.20, 17: 15.50, 18: 17.00,
    19: 19.00, 20: 19.30, 21: 20.00
  }
};'

    "d_cred" = 'const DEFAULT_TAXAS_CUSTO: Record<string, Record<number, number>> = {
  "Master/Visa": {
    1: 4.00, 2: 5.50, 3: 6.10, 4: 6.90, 5: 7.50, 6: 8.20, 7: 9.00, 8: 9.50, 9: 10.30, 10: 11.00,
    11: 11.50, 12: 12.10, 13: 12.60, 14: 13.00, 15: 13.50, 16: 14.20, 17: 14.50, 18: 16.00,
    19: 18.00, 20: 18.30, 21: 19.00
  },
  "Elo": {
    1: 5.00, 2: 6.50, 3: 7.10, 4: 7.90, 5: 8.50, 6: 9.20, 7: 10.00, 8: 10.50, 9: 11.30, 10: 12.00,
    11: 12.50, 12: 13.10, 13: 13.60, 14: 14.00, 15: 14.50, 16: 15.20, 17: 15.50, 18: 17.00,
    19: 19.00, 20: 19.30, 21: 20.00
  }
};'

    "credpara" = 'const DEFAULT_TAXAS_CUSTO: Record<string, Record<number, number>> = {
  "Master/Visa": {
    1: 5.75, 2: 5.79, 3: 7.23, 4: 7.90, 5: 8.40, 6: 8.90, 7: 9.00, 8: 9.10, 9: 9.40, 10: 10.50,
    11: 10.70, 12: 11.00, 13: 12.00, 14: 13.00, 15: 14.00, 16: 14.50, 17: 15.50, 18: 16.00,
    19: 18.90, 20: 19.80, 21: 20.50
  },
  "Elo": {
    1: 6.75, 2: 6.79, 3: 8.23, 4: 8.90, 5: 9.40, 6: 9.90, 7: 10.00, 8: 10.10, 9: 10.40, 10: 11.50,
    11: 11.70, 12: 12.00, 13: 13.00, 14: 14.00, 15: 15.00, 16: 15.50, 17: 16.50, 18: 17.00,
    19: 19.90, 20: 20.80, 21: 21.50
  }
};'

    "credsimples" = 'const DEFAULT_TAXAS_CUSTO: Record<string, Record<number, number>> = {
  "Master/Visa": {
    1: 7.00, 2: 8.50, 3: 9.10, 4: 9.90, 5: 10.50, 6: 11.20, 7: 12.00, 8: 12.50, 9: 13.30, 10: 14.00,
    11: 14.50, 12: 15.10, 13: 16.10, 14: 16.50, 15: 17.00, 16: 17.80, 17: 19.50, 18: 19.50,
    19: 20.50, 20: 20.80, 21: 21.50
  },
  "Elo": {
    1: 8.50, 2: 10.00, 3: 10.60, 4: 11.40, 5: 12.00, 6: 12.70, 7: 13.50, 8: 14.00, 9: 14.80, 10: 15.50,
    11: 16.00, 12: 16.60, 13: 17.60, 14: 18.00, 15: 18.50, 16: 19.30, 17: 19.50, 18: 21.00,
    19: 21.00, 20: 21.00, 21: 21.00
  }
};'

    "melhorcredito" = 'const DEFAULT_TAXAS_CUSTO: Record<string, Record<number, number>> = {
  "Master/Visa": {
    1: 6.00, 2: 6.50, 3: 7.10, 4: 7.90, 5: 8.50, 6: 9.20, 7: 10.00, 8: 10.50, 9: 10.30, 10: 12.00,
    11: 12.50, 12: 12.50, 13: 13.60, 14: 14.00, 15: 14.50, 16: 15.20, 17: 15.50, 18: 17.00,
    19: 18.00, 20: 18.30, 21: 19.00
  },
  "Elo": {
    1: 7.00, 2: 7.50, 3: 8.10, 4: 8.90, 5: 9.50, 6: 10.20, 7: 11.00, 8: 11.50, 9: 12.30, 10: 13.00,
    11: 13.50, 12: 13.10, 13: 14.60, 14: 15.00, 15: 15.50, 16: 16.20, 17: 16.50, 18: 18.00,
    19: 19.00, 20: 19.30, 21: 20.00
  }
};'

    "roma" = 'const DEFAULT_TAXAS_CUSTO: Record<string, Record<number, number>> = {
  "Master/Visa": {
    1: 8.69, 2: 8.97, 3: 9.65, 4: 10.31, 5: 10.98, 6: 11.63, 7: 12.28, 8: 12.93, 9: 13.57, 10: 14.20,
    11: 14.82, 12: 15.45, 13: 16.06, 14: 16.67, 15: 17.27, 16: 17.87, 17: 18.47, 18: 19.05,
    19: 0.00, 20: 0.00, 21: 0.00
  },
  "Elo": {
    1: 9.10, 2: 9.46, 3: 10.14, 4: 10.80, 5: 11.47, 6: 12.12, 7: 12.77, 8: 13.42, 9: 14.06, 10: 14.69,
    11: 15.31, 12: 15.94, 13: 16.55, 14: 17.16, 15: 17.76, 16: 18.36, 17: 18.96, 18: 19.54,
    19: 0.00, 20: 0.00, 21: 0.00
  }
};'

    "rose" = 'const DEFAULT_TAXAS_CUSTO: Record<string, Record<number, number>> = {
  "Master/Visa": {
    1: 5.50, 2: 6.00, 3: 6.60, 4: 7.40, 5: 8.00, 6: 8.70, 7: 9.50, 8: 10.00, 9: 9.80, 10: 11.50,
    11: 12.00, 12: 13.00, 13: 13.10, 14: 13.50, 15: 14.00, 16: 14.70, 17: 15.00, 18: 16.50,
    19: 18.00, 20: 18.30, 21: 19.00
  },
  "Elo": {
    1: 6.50, 2: 7.00, 3: 7.10, 4: 8.40, 5: 9.00, 6: 9.70, 7: 10.50, 8: 11.00, 9: 11.80, 10: 12.00,
    11: 13.00, 12: 13.60, 13: 14.10, 14: 14.50, 15: 15.00, 16: 15.70, 17: 16.00, 18: 17.50,
    19: 19.00, 20: 19.30, 21: 20.00
  }
};'

    "ramos" = 'const DEFAULT_TAXAS_CUSTO: Record<string, Record<number, number>> = {
  "Master/Visa": {
    1: 5.50, 2: 6.00, 3: 6.60, 4: 7.40, 5: 8.00, 6: 8.70, 7: 9.50, 8: 10.00, 9: 9.80, 10: 11.50,
    11: 12.00, 12: 13.00, 13: 13.10, 14: 13.50, 15: 14.00, 16: 14.70, 17: 15.00, 18: 16.50,
    19: 18.00, 20: 18.30, 21: 19.00
  },
  "Elo": {
    1: 6.50, 2: 7.00, 3: 7.10, 4: 8.40, 5: 9.00, 6: 9.70, 7: 10.50, 8: 11.00, 9: 11.80, 10: 12.00,
    11: 13.00, 12: 13.60, 13: 14.10, 14: 14.50, 15: 15.00, 16: 15.70, 17: 16.00, 18: 17.50,
    19: 19.00, 20: 19.30, 21: 20.00
  }
};'
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
        
        # Substitui a tabela padrão de taxas de custo da máquina se configurada para o parceiro
        if ($partnerTaxasCusto.ContainsKey($partnerKey)) {
            Write-Host "   - Injetando taxas de custo customizadas..." -ForegroundColor DarkGray
            $customTaxas = $partnerTaxasCusto[$partnerKey]
            $content = $content -replace '(?s)const DEFAULT_TAXAS_CUSTO: Record<string, Record<number, number>> = \{.*?\};', $customTaxas
        }
        
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
