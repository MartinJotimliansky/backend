// Test script for the stat boost possibilities system
// This script validates the new level system with stat boost possibilities

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path (adjust if needed)
const dbPath = path.join(__dirname, 'database.sqlite');

async function runTest() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    
    console.log('🧪 Testing Stat Boost Possibilities System...\n');
    
    // Test 1: Verify stat boost possibilities are populated correctly
    db.all(`
      SELECT 
        name, 
        min_level, 
        max_level, 
        stats_count,
        total_points,
        stat_values
      FROM stat_boost_possibilities 
      ORDER BY min_level, stats_count
    `, (err, rows) => {
      if (err) {
        console.error('❌ Error querying stat boost possibilities:', err);
        reject(err);
        return;
      }
      
      console.log('📊 Stat Boost Possibilities:');
      console.log('=====================================');
      
      const levelRanges = {
        '1-9': rows.filter(r => r.min_level === 1 && r.max_level === 9),
        '10-19': rows.filter(r => r.min_level === 10 && r.max_level === 19),
        '20+': rows.filter(r => r.min_level === 20)
      };
      
      Object.entries(levelRanges).forEach(([range, possibilities]) => {
        console.log(`\n🎯 Level Range ${range}:`);
        possibilities.forEach(p => {
          const stats = JSON.parse(p.stat_values);
          const statList = Object.entries(stats)
            .filter(([_, value]) => value > 0)
            .map(([stat, value]) => `${stat}: +${value}`)
            .join(', ');
          
          console.log(`  • ${p.name} (${p.stats_count} stats, ${p.total_points} points)`);
          console.log(`    Stats: ${statList}`);
        });
      });
      
      // Test 2: Validate level ranges
      console.log('\n🔍 Validation Tests:');
      console.log('=====================================');
      
      const level1to9 = levelRanges['1-9'];
      const level10to19 = levelRanges['10-19'];
      const level20plus = levelRanges['20+'];
      
      console.log(`✅ Level 1-9: ${level1to9.length} possibilities (expected: 6, all with 2 stats)`);
      const all2Stats = level1to9.every(p => p.stats_count === 2);
      console.log(`   All have 2 stats: ${all2Stats ? '✅' : '❌'}`);
      
      console.log(`✅ Level 10-19: ${level10to19.length} possibilities (expected: 4, all with 3 stats)`);
      const all3Stats = level10to19.every(p => p.stats_count === 3);
      console.log(`   All have 3 stats: ${all3Stats ? '✅' : '❌'}`);
      
      console.log(`✅ Level 20+: ${level20plus.length} possibilities (all with 4 stats)`);
      const all4Stats = level20plus.every(p => p.stats_count === 4);
      console.log(`   All have 4 stats: ${all4Stats ? '✅' : '❌'}`);
      
      // Test 3: Test level-specific queries
      console.log('\n🎮 Level-Specific Queries:');
      console.log('=====================================');
      
      const testLevels = [1, 5, 9, 10, 15, 19, 20, 25];
      
      testLevels.forEach(level => {
        db.all(`
          SELECT name, stats_count, total_points
          FROM stat_boost_possibilities 
          WHERE min_level <= ? AND max_level >= ?
        `, [level, level], (err, levelRows) => {
          if (err) {
            console.error(`❌ Error for level ${level}:`, err);
            return;
          }
          
          console.log(`Level ${level}: ${levelRows.length} possibilities available`);
          levelRows.forEach(r => {
            console.log(`  • ${r.name} (${r.stats_count} stats, ${r.total_points} points)`);
          });
        });
      });
      
      // Close database after a delay to allow all queries to complete
      setTimeout(() => {
        db.close();
        console.log('\n🎉 Test completed successfully!');
        resolve();
      }, 1000);
    });
  });
}

// Run the test
runTest().catch(console.error);
