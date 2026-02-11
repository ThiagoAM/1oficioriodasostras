const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
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
