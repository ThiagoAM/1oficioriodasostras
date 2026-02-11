import mysql from "mysql2/promise";

async function addApiSettingsColumns() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "31.97.91.252",
    user: process.env.MYSQL_USER || "cartorio_cartori",
    password: process.env.MYSQL_PASSWORD || "ediCAbIF1CRB",
    database: process.env.MYSQL_DATABASE || "cartorio_cartori",
  });

  console.log("Verificando e adicionando colunas de configuração da API...");

  try {
    // Verificar se as colunas já existem
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM site_settings"
    );
    const columnNames = columns.map(col => col.Field);

    // Adicionar colunas que não existem
    const columnsToAdd = [
      { name: 'api_url', definition: 'VARCHAR(500)' },
      { name: 'api_token', definition: 'VARCHAR(500)' },
      { name: 'api_port', definition: 'INT' }
    ];

    for (const column of columnsToAdd) {
      if (!columnNames.includes(column.name)) {
        const query = `ALTER TABLE site_settings ADD COLUMN ${column.name} ${column.definition}`;
        await connection.query(query);
        console.log(`✅ Coluna ${column.name} adicionada com sucesso`);
      } else {
        console.log(`ℹ️  Coluna ${column.name} já existe, pulando...`);
      }
    }

    console.log("✅ Configurações da API atualizadas com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao adicionar colunas da API:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

addApiSettingsColumns().catch(console.error);