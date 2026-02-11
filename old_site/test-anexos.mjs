import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simular o caminho que vem do banco
const anexoPath = '/uploads/1760994463768-135587813.png';

console.log('🧪 Testando caminhos de anexos...\n');

console.log('Caminho do anexo (como vem do banco):', anexoPath);

const filename = anexoPath.split('/').pop();
console.log('Nome do arquivo:', filename);

const relativePath = anexoPath.startsWith('/') ? anexoPath.substring(1) : anexoPath;
console.log('Caminho relativo:', relativePath);

const filePath = path.join(__dirname, relativePath);
console.log('Caminho completo:', filePath);

console.log('Arquivo existe?', fs.existsSync(filePath));

if (fs.existsSync(filePath)) {
  const stats = fs.statSync(filePath);
  console.log('Tamanho do arquivo:', stats.size, 'bytes');
} else {
  console.log('\n❌ ARQUIVO NÃO ENCONTRADO!');
  console.log('Verificando se a pasta uploads existe...');
  console.log('Pasta uploads existe?', fs.existsSync(path.join(__dirname, 'uploads')));

  // Listar arquivos na pasta uploads
  const uploadsDir = path.join(__dirname, 'uploads');
  if (fs.existsSync(uploadsDir)) {
    console.log('\nArquivos na pasta uploads:');
    const files = fs.readdirSync(uploadsDir);
    files.forEach(file => console.log('  -', file));
  }
}
