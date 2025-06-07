const sqlite3 = require('sqlite3').verbose();

console.log('🔄 Starting migration...');

const db = new sqlite3.Database('database.sqlite', (err) => {
  if (err) {
    console.error('❌ Database error:', err);
    return;
  }
  console.log('✅ Connected to database');
  
  // Drop and recreate table
  const sql = `
    DROP TABLE IF EXISTS stat_boost_possibilities;
    
    CREATE TABLE stat_boost_possibilities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hp INTEGER DEFAULT 0,
        strength INTEGER DEFAULT 0,
        resistance INTEGER DEFAULT 0,
        speed INTEGER DEFAULT 0,
        intelligence INTEGER DEFAULT 0,
        min_level INTEGER NOT NULL
    );
    
    INSERT INTO stat_boost_possibilities (hp, strength, resistance, speed, intelligence, min_level) VALUES
    (0, 5, 0, 0, 0, 1),
    (0, 0, 5, 0, 0, 1),
    (0, 0, 0, 5, 0, 1),
    (0, 0, 0, 0, 5, 1),
    (5, 0, 0, 0, 0, 1);
  `;
  
  db.exec(sql, (err) => {
    if (err) {
      console.error('❌ Migration error:', err);
    } else {
      console.log('✅ Migration completed successfully');
      
      // Verify
      db.all('SELECT * FROM stat_boost_possibilities LIMIT 5', (err, rows) => {
        if (err) {
          console.error('❌ Verification error:', err);
        } else {
          console.log('📊 Sample data:', rows);
        }
        db.close();
      });
    }
  });
});
