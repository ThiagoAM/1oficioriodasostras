import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const connection = await mysql.createConnection({
    host: '31.97.91.252',
    port: 3306,
    user: 'gilliard_cartori',
    password: 'rKIjtspvkreO',
    database: 'gilliard_cartori',
    multipleStatements: true
  });

  try {
    const sqlPath = path.join(__dirname, 'fix-charset.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executando alteração de charset...');
    await connection.query(sql);
    console.log('Charset alterado com sucesso para utf8mb4!');
  } catch (error) {
    console.error('Erro ao alterar charset:', error);
  } finally {
    await connection.end();
  }
}

runMigration();
