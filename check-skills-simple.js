const { Client } = require('pg');

async function checkSkills() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        database: 'nalgonwarriors',
        user: 'postgres',
        password: 'password'
    });

    try {
        await client.connect();

        console.log('🎯 SKILLS TABLE:');
        const skills = await client.query(`
            SELECT id, name, activation_triggers, effect_json, is_passive, power_value 
            FROM skills 
            ORDER BY id 
            LIMIT 10
        `);
        console.log(`Total skills: ${skills.rowCount}`);
        skills.rows.forEach(row => {
            console.log(`  ID: ${row.id}`);
            console.log(`  Name: ${row.name}`);
            console.log(`  Triggers: ${JSON.stringify(row.activation_triggers)}`);
            console.log(`  Effect: ${JSON.stringify(row.effect_json)}`);
            console.log(`  Is Passive: ${row.is_passive}`);
            console.log(`  Power: ${row.power_value}`);
            console.log('  ---');
        });

        await client.end();
    } catch (error) {
        console.error('Error:', error);
        await client.end();
    }
}

checkSkills();
