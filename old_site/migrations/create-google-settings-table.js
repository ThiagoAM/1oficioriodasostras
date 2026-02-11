import mysql from 'mysql2/promise';

async function createGoogleSettingsTable() {
  const connection = await mysql.createConnection({
    host: '31.97.91.252',
    port: 3306,
    user: 'gilliard_cartori',
    password: 'rKIjtspvkreO',
    database: 'gilliard_cartori'
  });

  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS google_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        place_id VARCHAR(255),
        api_key VARCHAR(255),
        reviews_json TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✓ Tabela google_settings criada com sucesso!');
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
  } finally {
    await connection.end();
  }
}

createGoogleSettingsTable();
