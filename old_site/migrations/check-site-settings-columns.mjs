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

async function checkColumns() {
  const connection = await mysql.createConnection({
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
  });

  try {
    console.log('Checking site_settings table structure...\n');

    const [columns] = await connection.query("DESCRIBE site_settings");

    console.log('Current columns in site_settings table:');
    console.table(columns);

  } catch (error) {
    console.error('Error checking table:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

checkColumns();
