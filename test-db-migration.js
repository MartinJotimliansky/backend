const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function testDatabaseMigration() {
    console.log('🔄 Testing database connection and migration...');
    
    // Database connection configuration (adjust as needed)
    const client = new Client({
        host: 'localhost',
        port: 5432,
        database: 'nalgon_warriors',
        user: 'postgres',
        password: 'password' // You may need to adjust this
    });

    try {
        // Test connection
        console.log('📡 Connecting to database...');
        await client.connect();
        console.log('✅ Database connection successful');

        // Check if tables exist before migration
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('level_experiences', 'stat_boost_possibilities', 'gratifications')
            ORDER BY table_name;
        `;
        
        const beforeTables = await client.query(tablesQuery);
        console.log('📋 Tables before migration:', beforeTables.rows.map(r => r.table_name));

        // Read and execute migration
        const sqlPath = path.join(__dirname, 'src', 'migrations', 'LevelSystemMigration.sql');
        const migrationSQL = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('🚀 Executing migration...');
        await client.query(migrationSQL);
        console.log('✅ Migration executed successfully');

        // Check tables after migration
        const afterTables = await client.query(tablesQuery);
        console.log('📋 Tables after migration:', afterTables.rows.map(r => r.table_name));

        // Test the new stat_boost_possibilities table
        const statBoostCount = await client.query('SELECT COUNT(*) as count FROM stat_boost_possibilities');
        console.log(`📊 Stat boost possibilities created: ${statBoostCount.rows[0].count}`);

        // Test level experiences
        const levelCount = await client.query('SELECT COUNT(*) as count FROM level_experiences');
        console.log(`📊 Level experiences entries: ${levelCount.rows[0].count}`);

        // Show some sample stat boosts
        const sampleStatBoosts = await client.query(`
            SELECT hp, strength, resistance, speed, intelligence, min_level 
            FROM stat_boost_possibilities 
            ORDER BY min_level, RANDOM() 
            LIMIT 5
        `);
        
        console.log('🎯 Sample stat boost combinations:');
        sampleStatBoosts.rows.forEach((row, i) => {
            console.log(`   ${i + 1}. Level ${row.min_level}+: HP+${row.hp}, STR+${row.strength}, RES+${row.resistance}, SPD+${row.speed}, INT+${row.intelligence}`);
        });

        console.log('\n🎉 Migration test completed successfully!');

    } catch (error) {
        console.error('❌ Migration test failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Suggestion: Make sure PostgreSQL is running and accessible');
        } else if (error.code === '3D000') {
            console.log('💡 Suggestion: Database "nalgon_warriors" does not exist. Create it first.');
        } else if (error.code === '28P01') {
            console.log('💡 Suggestion: Check database credentials (username/password)');
        }
    } finally {
        await client.end();
        console.log('📡 Database connection closed');
    }
}

// Run the test
testDatabaseMigration();
