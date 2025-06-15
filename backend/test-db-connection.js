const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'defaultdb',
    ssl: process.env.DB_HOST?.includes('aivencloud.com') ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('Attempting to connect to database...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('Username:', process.env.DB_USERNAME);
    console.log('Database:', process.env.DB_DATABASE || 'defaultdb');
    console.log('SSL:', process.env.DB_HOST?.includes('aivencloud.com') ? 'enabled' : 'disabled');
    
    await client.connect();
    console.log('✅ Database connection successful!');
    
    const result = await client.query('SELECT version()');
    console.log('Database version:', result.rows[0].version);
    
    await client.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection(); 