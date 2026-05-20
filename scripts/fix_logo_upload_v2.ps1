
# Script: fix_logo_upload_v2.ps1
# Substitui o bloco URL da Logomarca (linhas 1454-1463) por upload de arquivo em todos os parceiros SaaS
# Funciona com CRLF

$saasDir = "saas"
$partners = @("credfacil","credpara","credsimples","d_cred","forcepay","melhorcredito","ramos","roma","rose","rtgroup")

# Antigo conteudo das linhas que identificam o bloco
$oldLabel = 'URL da Logomarca'
$oldInputStart = 'type="text"'
$oldInputEnd = 'focus:ring-4 focus:ring-amber-500/10"'

$newBlockLines = @(
    '                      <div>',
    '                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Logomarca (Anexar Arquivo)</label>',
    '                        <div className="flex flex-col gap-3">',
    '                          <input ',
    '                            type="file"',
    '                            accept="image/*"',
    '                            onChange={(e) => {',
    '                              const file = e.target.files?.[0];',
    '                              if (file) {',
    '                                const reader = new FileReader();',
    '                                reader.onloadend = () => {',
    '                                  if (typeof reader.result === ''string'') {',
    '                                    setFormLogoUrl(reader.result);',
    '                                  }',
    '                                };',
    '                                reader.readAsDataURL(file);',
    '                              }',
    '                            }}',
    '                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer bg-white border border-slate-200 rounded-xl p-1 outline-none"',
    '                          />',
    '                          {formLogoUrl && (',
    '                            <div className="flex items-center gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-sm">',
    '                              <img ',
    '                                src={formLogoUrl} ',
    '                                alt="Pre-visualizacao do logotipo" ',
    '                                className="h-12 w-auto object-contain bg-slate-50 rounded p-1 border" ',
    '                              />',
    '                              <div className="flex-1 min-w-0">',
    '                                <p className="text-xs font-bold text-slate-500 truncate">Logotipo Selecionado</p>',
    '                                <p className="text-[10px] text-slate-400">Salvo na memoria local</p>',
    '                              </div>',
    '                              <button ',
    '                                type="button"',
    '                                onClick={() => setFormLogoUrl('''')}',
    '                                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"',
    '                                title="Remover logotipo"',
    '                              >',
    '                                <X size={16} />',
    '                              </button>',
    '                            </div>',
    '                          )}',
    '                        </div>',
    '                      </div>'
)

$updated = 0
$skipped = 0

foreach ($partner in $partners) {
    $appFile = "$saasDir\$partner\src\App.tsx"
    if (Test-Path $appFile) {
        $lines = [System.IO.File]::ReadAllLines($appFile, [System.Text.Encoding]::UTF8)
        
        # Encontrar o indice da linha com "URL da Logomarca"
        $labelIdx = -1
        for ($i = 0; $i -lt $lines.Length; $i++) {
            if ($lines[$i] -match 'URL da Logomarca') {
                $labelIdx = $i
                break
            }
        }
        
        if ($labelIdx -ge 0) {
            # Encontrar o final do bloco: a linha com </div> logo apos o input type="text"
            # O bloco e: <div> ... <label>URL da Logomarca</label> <input type="text" ... /> </div>
            # Linha labelIdx-1 = <div>
            # Linha labelIdx = <label>
            # Linha labelIdx+1 a labelIdx+6 = <input ... />
            # Linha labelIdx+7 = </div>
            
            $blockStart = $labelIdx - 1
            $blockEnd = $labelIdx
            
            # Achar o fim do bloco (linha com </div> apos o input)
            for ($j = $labelIdx; $j -lt [Math]::Min($labelIdx + 15, $lines.Length); $j++) {
                if ($lines[$j] -match '^\s*</div>') {
                    $blockEnd = $j
                    break
                }
            }
            
            # Montar novo conteudo
            $before = $lines[0..($blockStart-1)]
            $after = $lines[($blockEnd+1)..($lines.Length-1)]
            $newLines = $before + $newBlockLines + $after
            
            [System.IO.File]::WriteAllLines($appFile, $newLines, [System.Text.Encoding]::UTF8)
            Write-Host "OK: $partner atualizado (linhas $blockStart-$blockEnd substituidas)!" -ForegroundColor Green
            $updated++
        } else {
            Write-Host "SKIP: $partner ja usa upload de arquivo ou nao encontrado" -ForegroundColor Yellow
            $skipped++
        }
    } else {
        Write-Host "WARN: Arquivo nao encontrado: $appFile" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Resultado: $updated atualizados, $skipped ignorados" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
