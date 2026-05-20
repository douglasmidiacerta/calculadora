const fs = require('fs');
const path = require('path');

// Caminho absoluto das imagens webp na raiz (subindo 2 níveis a partir de scratch/temp_install)
const srcLogo = path.join(__dirname, '..', '..', 'EMPRESTABHLOGO-CSxk8ONe.webp');
const srcFavicon = path.join(__dirname, '..', '..', 'Favicon_Emprestabh-CiRpm18-.webp');

// Caminhos de destino
const destFolder = path.join(__dirname, '..', '..', 'saas_assets', 'empresta_bh');
if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder, { recursive: true });
}
const destLogo = path.join(destFolder, 'logo.png');
const destFavicon = path.join(destFolder, 'favicon.png');

console.log('Iniciando conversão de WebP para PNG via sharp...');

try {
    // Carrega o sharp da pasta node_modules temporária
    const sharp = require('sharp');

    // Converte a logo
    sharp(srcLogo)
        .png()
        .toFile(destLogo)
        .then(() => {
            console.log('Logo da Empresta BH convertida com sucesso para PNG!');
            
            // Converte o favicon
            return sharp(srcFavicon)
                .png()
                .toFile(destFavicon);
        })
        .then(() => {
            console.log('Favicon da Empresta BH convertido com sucesso para PNG!');
            console.log('CONVERSAO_CONCLUIDA_SUCESSO');
        })
        .catch(err => {
            console.error('Erro durante a conversão do sharp:', err);
        });

} catch (e) {
    console.error('Falha ao requerer o módulo sharp:', e);
}
