import mysql from 'mysql2/promise';

async function createScriptsTable() {
  const connection = await mysql.createConnection({
    host: '31.97.91.252',
    port: 3306,
    user: 'gilliard_cartori',
    password: 'rKIjtspvkreO',
    database: 'gilliard_cartori'
  });

  try {
    console.log('Criando tabela scripts...');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS scripts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        google_tag_manager TEXT,
        facebook_pixel TEXT,
        google_analytics TEXT,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tabela scripts criada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar tabela scripts:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

createScriptsTable();
