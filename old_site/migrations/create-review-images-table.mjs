import mysql from 'mysql2/promise';

async function createReviewImagesTable() {
  const connection = await mysql.createConnection({
    host: '31.97.91.252',
    port: 3306,
    user: 'cartorio_cartori',
    password: 'ediCAbIF1CRB',
    database: 'cartorio_cartori',
  });

  try {
    console.log('Criando tabela review_images...');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS review_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        image_url VARCHAR(500) NOT NULL,
        \`order\` INT NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✓ Tabela review_images criada com sucesso!');
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

createReviewImagesTable()
  .then(() => {
    console.log('Migração concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro na migração:', error);
    process.exit(1);
  });
