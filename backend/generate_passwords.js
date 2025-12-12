const bcrypt = require('bcrypt');

async function generatePasswords() {
  const passwords = [
    { name: 'admin.bergen', password: 'admin.bergen' },
    { name: 'admin.kristiansand', password: 'admin.kristiansand' },
    { name: 'admin.oslo', password: 'admin.oslo' }
  ];

  for (const item of passwords) {
    const hash = await bcrypt.hash(item.password, 10);
    console.log(`${item.name}: ${hash}`);
  }
}

generatePasswords();
