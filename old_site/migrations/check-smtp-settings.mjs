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

async function checkSettings() {
  const connection = await mysql.createConnection({
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
  });

  try {
    console.log('Verificando configurações SMTP...\n');

    const [rows] = await connection.query("SELECT * FROM site_settings LIMIT 1");

    if (rows.length > 0) {
      const settings = rows[0];
      console.log('Configurações encontradas:');
      console.log('SMTP Host:', settings.smtp_host || '(não configurado)');
      console.log('SMTP Port:', settings.smtp_port || '(não configurado)');
      console.log('SMTP User:', settings.smtp_user || '(não configurado)');
      console.log('SMTP Password:', settings.smtp_password ? '***configurado***' : '(não configurado)');
      console.log('SMTP Secure:', settings.smtp_secure);
      console.log('Email de Solicitações:', settings.solicitacoes_email || '(não configurado)');
    } else {
      console.log('Nenhuma configuração encontrada');
    }

  } catch (error) {
    console.error('Error checking settings:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

checkSettings();
