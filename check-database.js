// Simple test to check database and run migrations
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

console.log('🔍 Checking database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    return;
  }
  
  console.log('✅ Database connection successful');
  
  // Check if table exists
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='stat_boost_possibilities'", (err, row) => {
    if (err) {
      console.error('❌ Error checking table:', err);
      return;
    }
    
    if (row) {
      console.log('✅ stat_boost_possibilities table exists');
      
      // Get current structure
      db.all("PRAGMA table_info(stat_boost_possibilities)", (err, columns) => {
        if (err) {
          console.error('❌ Error getting table info:', err);
          return;
        }
        
        console.log('📋 Current table structure:');
        columns.forEach(col => {
          console.log(`  - ${col.name} (${col.type})`);
        });
        
        db.close();
      });
    } else {
      console.log('⚠️  stat_boost_possibilities table does not exist');
      db.close();
    }
  });
});
