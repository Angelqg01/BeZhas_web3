const fs = require('fs');

let content = fs.readFileSync('./test/NFTOffers.test.js', 'utf8');

// Primero eliminar todos los `n literales y tokenId duplicados
content = content.replace(/`n\s*/g, '\n');
content = content.replace(/const tokenId = 0;\s*const tokenId = 0;/g, 'const tokenId = 0;');

// Agregar tokenId = 0 donde falta (después de nftAddress cuando no existe)
content = content.replace(
    /const nftAddress = await mockNFT\.getAddress\(\);(?!\s*const tokenId)/g,
    'const nftAddress = await mockNFT.getAddress();\n            const tokenId = 0;'
);

// Reemplazar los hardcoded 1 que queden en createOffer (posición del tokenId)
// content = content.replace(/createOffer\(\s*nftAddress,\s*1,/g, 'createOffer(nftAddress, tokenId,');

fs.writeFileSync('./test/NFTOffers.test.js', content, 'utf8');
console.log('Archivo corregido!');
