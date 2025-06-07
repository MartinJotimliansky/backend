const { Client } = require('pg');

async function checkGratifications() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'Stinkistinki33_',
        database: 'postgres'
    });

    try {
        await client.connect();
        console.log('✅ Conectado a PostgreSQL');

        // 1. Verificar gratificaciones de tipo weapon
        console.log('\n📊 GRATIFICACIONES DE TIPO WEAPON:');
        const weaponGratifications = await client.query(`
            SELECT id, name, type, min_level 
            FROM gratifications 
            WHERE type = 'weapon' 
            ORDER BY id
        `);
        console.log(`Total gratificaciones weapon: ${weaponGratifications.rowCount}`);
        weaponGratifications.rows.forEach(row => {
            console.log(`  ID: ${row.id}, Name: ${row.name}, Min Level: ${row.min_level}`);
        });

        // 2. Verificar weapons table
        console.log('\n🗡️ WEAPONS TABLE:');
        const weapons = await client.query(`
            SELECT id, name, damage, speed 
            FROM weapons 
            ORDER BY id
        `);
        console.log(`Total weapons: ${weapons.rowCount}`);
        weapons.rows.forEach(row => {
            console.log(`  ID: ${row.id}, Name: ${row.name}, Damage: ${row.damage}, Speed: ${row.speed}`);
        });

        // 3. Verificar gratificaciones de tipo skill
        console.log('\n📊 GRATIFICACIONES DE TIPO SKILL:');
        const skillGratifications = await client.query(`
            SELECT id, name, type, min_level 
            FROM gratifications 
            WHERE type = 'skill' 
            ORDER BY id
        `);
        console.log(`Total gratificaciones skill: ${skillGratifications.rowCount}`);
        skillGratifications.rows.forEach(row => {
            console.log(`  ID: ${row.id}, Name: ${row.name}, Min Level: ${row.min_level}`);
        });

        // 4. Verificar skills table
        console.log('\n🎯 SKILLS TABLE:');
        const skills = await client.query(`
            SELECT id, name, description 
            FROM skills 
            ORDER BY id
        `);
        console.log(`Total skills: ${skills.rowCount}`);
        skills.rows.forEach(row => {
            console.log(`  ID: ${row.id}, Name: ${row.name}, Description: ${row.description}`);
        });

        // 5. Verificar stat_boost_possibilities
        console.log('\n💪 STAT BOOST POSSIBILITIES:');
        const statBoosts = await client.query(`
            SELECT id, hp, strength, resistance, speed, intelligence, min_level 
            FROM stat_boost_possibilities 
            ORDER BY id
        `);
        console.log(`Total stat boosts: ${statBoosts.rowCount}`);
        statBoosts.rows.forEach(row => {
            console.log(`  ID: ${row.id}, HP: ${row.hp}, STR: ${row.strength}, RES: ${row.resistance}, SPD: ${row.speed}, INT: ${row.intelligence}, Min Level: ${row.min_level}`);
        });

        // 6. Buscar gratificaciones weapon que no tienen correspondencia en weapons
        console.log('\n⚠️ PROBLEMAS DETECTADOS:');
        const orphanWeapons = await client.query(`
            SELECT g.id, g.name 
            FROM gratifications g 
            LEFT JOIN weapons w ON g.id = w.id 
            WHERE g.type = 'weapon' AND w.id IS NULL
        `);
        
        if (orphanWeapons.rowCount > 0) {
            console.log(`🚨 Gratificaciones weapon sin weapon correspondiente (${orphanWeapons.rowCount}):`);
            orphanWeapons.rows.forEach(row => {
                console.log(`  Gratification ID: ${row.id}, Name: ${row.name}`);
            });
        } else {
            console.log('✅ Todas las gratificaciones weapon tienen weapon correspondiente');
        }

        // 7. Buscar gratificaciones skill que no tienen correspondencia en skills
        const orphanSkills = await client.query(`
            SELECT g.id, g.name 
            FROM gratifications g 
            LEFT JOIN skills s ON g.id = s.id 
            WHERE g.type = 'skill' AND s.id IS NULL
        `);
        
        if (orphanSkills.rowCount > 0) {
            console.log(`🚨 Gratificaciones skill sin skill correspondiente (${orphanSkills.rowCount}):`);
            orphanSkills.rows.forEach(row => {
                console.log(`  Gratification ID: ${row.id}, Name: ${row.name}`);
            });
        } else {
            console.log('✅ Todas las gratificaciones skill tienen skill correspondiente');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
        console.log('\n🔌 Conexión cerrada');
    }
}

checkGratifications();
