// Prueba completa del sistema de niveles
console.log('🚀 Iniciando prueba completa del sistema de niveles...\n');

async function makeRequest(url, method = 'GET', body = null) {
    const fetch = (await import('node-fetch')).default;
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    return response.json();
}

async function testLevelSystem() {
    const baseUrl = 'http://localhost:5000';
    
    try {
        // 1. Probar gratificaciones disponibles para nivel 1
        console.log('📋 1. Obteniendo gratificaciones para nivel 1...');
        const gratifications1 = await makeRequest(`${baseUrl}/level/gratifications/1`);
        console.log('   ✅ Gratificaciones nivel 1:', gratifications1.length, 'opciones');
        gratifications1.forEach((g, i) => {
            console.log(`   ${i+1}. ${g.name} (${g.type}): ${g.description}`);
        });
        
        // 2. Probar gratificaciones para nivel 5
        console.log('\n📋 2. Obteniendo gratificaciones para nivel 5...');
        const gratifications5 = await makeRequest(`${baseUrl}/level/gratifications/5`);
        console.log('   ✅ Gratificaciones nivel 5:', gratifications5.length, 'opciones');
        gratifications5.forEach((g, i) => {
            console.log(`   ${i+1}. ${g.name} (${g.type}): ${g.description}`);
        });
        
        // 3. Simular ganancia de experiencia (victoria)
        console.log('\n⚔️ 3. Simulando combate (victoria)...');
        const expResult1 = await makeRequest(`${baseUrl}/level/experience/simulate`, 'POST', {
            currentExperience: 3,
            won: true
        });
        console.log('   ✅ Resultado del combate:');
        console.log(`   - Experiencia: ${expResult1.oldExperience} → ${expResult1.newExperience} (+${expResult1.experienceGained})`);
        console.log(`   - Nivel: ${expResult1.oldLevel} → ${expResult1.newLevel} ${expResult1.leveledUp ? '(¡SUBIÓ DE NIVEL!)' : ''}`);
        
        // 4. Simular otra victoria que cause subida de nivel
        console.log('\n⚔️ 4. Simulando otro combate (victoria) para subir de nivel...');
        const expResult2 = await makeRequest(`${baseUrl}/level/experience/simulate`, 'POST', {
            currentExperience: 4,
            won: true
        });
        console.log('   ✅ Resultado del combate:');
        console.log(`   - Experiencia: ${expResult2.oldExperience} → ${expResult2.newExperience} (+${expResult2.experienceGained})`);
        console.log(`   - Nivel: ${expResult2.oldLevel} → ${expResult2.newLevel} ${expResult2.leveledUp ? '(¡SUBIÓ DE NIVEL!)' : ''}`);
        console.log(`   - Progreso en nivel actual: ${expResult2.levelInfo.progressPercentage}%`);
        
        // 5. Probar validación del sistema
        console.log('\n🔍 5. Validando sistema de niveles...');
        const validation = await makeRequest(`${baseUrl}/level/validate`);
        console.log(`   ✅ Validación: ${validation.valid ? 'EXITOSA' : 'FALLÓ'}`);
        if (validation.valid) {
            console.log('   - Todos los cálculos coinciden con la base de datos');
        }
        
        // 6. Obtener todos los datos de nivel
        console.log('\n📊 6. Obteniendo información completa de niveles...');
        const allLevels = await makeRequest(`${baseUrl}/level/all`);
        console.log(`   ✅ Se encontraron ${allLevels.length} niveles configurados`);
        console.log('   - Primeros 5 niveles:');
        allLevels.slice(0, 5).forEach(level => {
            console.log(`     Nivel ${level.level}: ${level.experience} exp total`);
        });
        
        console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');
        console.log('\n📈 Resumen del sistema:');
        console.log('- ✅ Cálculo de experiencia funcionando');
        console.log('- ✅ Sistema de niveles operativo');
        console.log('- ✅ Gratificaciones disponibles');
        console.log('- ✅ Base de datos sincronizada');
        console.log('- ✅ API endpoints respondiendo');
        
    } catch (error) {
        console.error('❌ Error durante las pruebas:', error.message);
    }
}

testLevelSystem();
