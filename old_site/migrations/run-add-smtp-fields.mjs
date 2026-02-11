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
    console.log('Adding SMTP fields to site_settings...');

    // Check and add smtp_host
    const [smtpHost] = await connection.query(
      "SHOW COLUMNS FROM site_settings LIKE 'smtp_host'"
    );
    if (smtpHost.length === 0) {
      await connection.query('ALTER TABLE site_settings ADD smtp_host varchar(255)');
      console.log('✓ Column smtp_host added successfully');
    } else {
      console.log('✓ Column smtp_host already exists');
    }

    // Check and add smtp_port
    const [smtpPort] = await connection.query(
      "SHOW COLUMNS FROM site_settings LIKE 'smtp_port'"
    );
    if (smtpPort.length === 0) {
      await connection.query('ALTER TABLE site_settings ADD smtp_port int');
      console.log('✓ Column smtp_port added successfully');
    } else {
      console.log('✓ Column smtp_port already exists');
    }

    // Check and add smtp_user
    const [smtpUser] = await connection.query(
      "SHOW COLUMNS FROM site_settings LIKE 'smtp_user'"
    );
    if (smtpUser.length === 0) {
      await connection.query('ALTER TABLE site_settings ADD smtp_user varchar(255)');
      console.log('✓ Column smtp_user added successfully');
    } else {
      console.log('✓ Column smtp_user already exists');
    }

    // Check and add smtp_password
    const [smtpPassword] = await connection.query(
      "SHOW COLUMNS FROM site_settings LIKE 'smtp_password'"
    );
    if (smtpPassword.length === 0) {
      await connection.query('ALTER TABLE site_settings ADD smtp_password varchar(255)');
      console.log('✓ Column smtp_password added successfully');
    } else {
      console.log('✓ Column smtp_password already exists');
    }

    // Check and add smtp_secure
    const [smtpSecure] = await connection.query(
      "SHOW COLUMNS FROM site_settings LIKE 'smtp_secure'"
    );
    if (smtpSecure.length === 0) {
      await connection.query('ALTER TABLE site_settings ADD smtp_secure boolean DEFAULT true');
      console.log('✓ Column smtp_secure added successfully');
    } else {
      console.log('✓ Column smtp_secure already exists');
    }

    // Check and add solicitacoes_email
    const [solicitacoesEmail] = await connection.query(
      "SHOW COLUMNS FROM site_settings LIKE 'solicitacoes_email'"
    );
    if (solicitacoesEmail.length === 0) {
      await connection.query('ALTER TABLE site_settings ADD solicitacoes_email varchar(255)');
      console.log('✓ Column solicitacoes_email added successfully');
    } else {
      console.log('✓ Column solicitacoes_email already exists');
    }

    console.log('\n✓ All SMTP fields migration completed successfully!');

  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
