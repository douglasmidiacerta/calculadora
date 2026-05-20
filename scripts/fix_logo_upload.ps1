
# Script: fix_logo_upload.ps1
# Substitui o campo de URL da Logomarca por upload de arquivo em todos os parceiros SaaS

$saasDir = "saas"
$partners = @("credfacil","credpara","credsimples","d_cred","forcepay","melhorcredito","ramos","roma","rose","rtgroup")

$updated = 0
$skipped = 0

foreach ($partner in $partners) {
    $appFile = "$saasDir\$partner\src\App.tsx"
    if (Test-Path $appFile) {
        $content = [System.IO.File]::ReadAllText($appFile, [System.Text.Encoding]::UTF8)
        if ($content.Contains('URL da Logomarca')) {

            # Novo bloco de upload com preview
            $newBlock = @'
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Logomarca (Anexar Arquivo)</label>
                        <div className="flex flex-col gap-3">
                          <input 
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (typeof reader.result === 'string') {
                                    setFormLogoUrl(reader.result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer bg-white border border-slate-200 rounded-xl p-1 outline-none"
                          />
                          {formLogoUrl && (
                            <div className="flex items-center gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
                              <img 
                                src={formLogoUrl} 
                                alt="Pre-visualizacao do logotipo" 
                                className="h-12 w-auto object-contain bg-slate-50 rounded p-1 border" 
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-500 truncate">Logotipo Selecionado</p>
                                <p className="text-[10px] text-slate-400">Salvo na memoria local/servidor</p>
                              </div>
                              <button 
                                type="button"
                                onClick={() => setFormLogoUrl('')}
                                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                                title="Remover logotipo"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
'@

            # Usa regex para substituir o bloco do URL input
            $content = $content -replace '(?s)\s*<div>\s*<label[^>]*>URL da Logomarca</label>\s*<input\s+type="text"[^/]*/>\s*</div>', "`n$newBlock"

            [System.IO.File]::WriteAllText($appFile, $content, [System.Text.Encoding]::UTF8)
            Write-Host "OK: $partner atualizado com upload de arquivo!" -ForegroundColor Green
            $updated++
        } else {
            Write-Host "SKIP: $partner ja usa upload de arquivo" -ForegroundColor Yellow
            $skipped++
        }
    } else {
        Write-Host "WARN: Arquivo nao encontrado para $partner" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Resultado: $updated atualizados, $skipped ignorados" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
