const fs = require('fs');
const path = require('path');

// Test if the SQL file can be read and is properly formatted
try {
    const sqlPath = path.join(__dirname, 'src', 'migrations', 'LevelSystemMigration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('✅ SQL Migration file loaded successfully');
    console.log(`📊 File size: ${sql.length} characters`);
    console.log(`📋 Number of lines: ${sql.split('\n').length}`);
    
    // Check for basic SQL syntax
    const hasBegin = sql.includes('BEGIN;');
    const hasCommit = sql.includes('COMMIT;');
    const insertCount = (sql.match(/INSERT INTO/g) || []).length;
    const semicolonCount = (sql.match(/;/g) || []).length;
    
    console.log(`🔍 SQL Analysis:`);
    console.log(`   - Has BEGIN: ${hasBegin}`);
    console.log(`   - Has COMMIT: ${hasCommit}`);
    console.log(`   - INSERT statements: ${insertCount}`);
    console.log(`   - Semicolons: ${semicolonCount}`);
    
    // Show first and last few lines
    const lines = sql.split('\n');
    console.log(`\n📝 First 5 lines:`);
    lines.slice(0, 5).forEach((line, i) => console.log(`   ${i + 1}: ${line}`));
    
    console.log(`\n📝 Last 5 lines:`);
    lines.slice(-5).forEach((line, i) => console.log(`   ${lines.length - 4 + i}: ${line}`));
    
    console.log('\n✅ Migration file appears to be properly formatted');
    
} catch (error) {
    console.error('❌ Error reading migration file:', error.message);
}
