const bcrypt = require('bcrypt');

async function generateAdminUser() {
  console.log('=== Generer Admin Bruker ===\n');

  const username = 'admin';
  const password = 'admin123'; // ENDRE DETTE I PRODUKSJON!
  const fullName = 'System Administrator';
  const email = 'admin@church.no';

  try {
    const hash = await bcrypt.hash(password, 10);

    console.log('Admin bruker detaljer:');
    console.log('----------------------');
    console.log(`Brukernavn: ${username}`);
    console.log(`Passord: ${password}`);
    console.log(`Navn: ${fullName}`);
    console.log(`E-post: ${email}`);
    console.log(`\nBcrypt hash: ${hash}`);

    console.log('\n=== SQL Kommando ===\n');
    console.log('Kopier og kjør denne SQL-kommandoen i PostgreSQL:\n');
    console.log(`INSERT INTO members_admins (username, password_hash, full_name, email)
VALUES ('${username}', '${hash}', '${fullName}', '${email}')
ON CONFLICT (username)
DO UPDATE SET password_hash = '${hash}', full_name = '${fullName}', email = '${email}';`);

    console.log('\n=== Eller bruk setup-database.js ===\n');
    console.log('node setup-database.js\n');

  } catch (err) {
    console.error('Feil ved generering av hash:', err);
  }
}

generateAdminUser();
