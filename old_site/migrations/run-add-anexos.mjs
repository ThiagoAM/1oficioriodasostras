import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';

// Read .env file manually
const env = {};
try {
  const envContent = readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length) {
      env[key.trim()] = values.join('=').trim();
    }
  });
} catch (error) {
  console.error('Error reading .env file:', error);
}

async function runMigration() {
  const connection = await mysql.createConnection({
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
    multipleStatements: true
  });

  try {
    console.log('Adding anexos column to contact_messages...');

    // Check if column already exists
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM contact_messages LIKE 'anexos'"
    );

    if (columns.length === 0) {
      await connection.query('ALTER TABLE contact_messages ADD anexos text');
      console.log('✓ Column anexos added successfully');
    } else {
      console.log('✓ Column anexos already exists');
    }

  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
