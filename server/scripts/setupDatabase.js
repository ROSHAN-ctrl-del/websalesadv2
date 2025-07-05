import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }
    
    console.log('✅ Database setup completed successfully!');
    console.log('📊 Tables created and sample data inserted.');
    
    // Display API keys for testing
    const [apiKeys] = await pool.query(
      'SELECT sp.name, sp.email, sp.api_key FROM sales_persons sp WHERE sp.api_key IS NOT NULL'
    );
    
    console.log('\n🔑 API Keys for Sales Persons:');
    apiKeys.forEach(person => {
      console.log(`${person.name} (${person.email}): ${person.api_key}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();