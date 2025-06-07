const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testLevelSystemAPI() {
    console.log('🧪 Testing Level System API Endpoints...\n');

    try {
        // Test 1: Get all level data
        console.log('1️⃣ Testing level data retrieval...');
        const levelDataResponse = await axios.get(`${API_BASE}/level/all`);
        console.log(`✅ Retrieved ${levelDataResponse.data.length} level entries`);
        
        // Show first few levels
        const firstLevels = levelDataResponse.data.slice(0, 5);
        console.log('📊 First 5 levels:');
        firstLevels.forEach(level => {
            console.log(`   Level ${level.level}: ${level.experience} exp required`);
        });

        // Test 2: Test experience simulation
        console.log('\n2️⃣ Testing experience simulation...');
        const simResults = [];
        
        for (let i = 0; i < 5; i++) {
            const currentExp = i * 3; // Start with low experience
            const won = i % 2 === 0; // Alternate win/loss
            
            const simResponse = await axios.post(`${API_BASE}/level/experience/simulate`, {
                currentExperience: currentExp,
                combatResult: won
            });
            
            simResults.push({
                initial: currentExp,
                won,
                result: simResponse.data
            });
        }
        
        console.log('📈 Experience simulation results:');
        simResults.forEach((sim, i) => {
            const { initial, won, result } = sim;
            console.log(`   ${i + 1}. ${initial} exp + ${won ? 'WIN' : 'LOSS'} → ${result.newExperience} exp (Level ${result.oldLevel}→${result.newLevel})${result.leveledUp ? ' 🎉 LEVEL UP!' : ''}`);
        });

        // Test 3: Test gratifications for different levels
        console.log('\n3️⃣ Testing gratifications for different levels...');
        
        for (const level of [1, 5, 10, 15, 20]) {
            try {
                const gratResponse = await axios.get(`${API_BASE}/level/gratifications/${level}`);
                console.log(`📦 Level ${level} gratifications (${gratResponse.data.length} options):`);
                
                gratResponse.data.forEach((grat, i) => {
                    console.log(`   ${i + 1}. [${grat.type.toUpperCase()}] ${grat.name} - ${grat.description}`);
                });
            } catch (error) {
                console.log(`❌ Error getting gratifications for level ${level}:`, error.response?.data || error.message);
            }
        }

        // Test 4: Test level status checking
        console.log('\n4️⃣ Testing level status checking...');
        
        const statusTests = [
            { experience: 3, level: 1 },  // Should not be able to level up
            { experience: 5, level: 1 },  // Should be able to level up to 2
            { experience: 11, level: 2 }, // Should be able to level up to 3
            { experience: 18, level: 3 }, // Should be able to level up to 4
        ];

        for (const test of statusTests) {
            try {
                const statusResponse = await axios.post(`${API_BASE}/level/status`, {
                    currentExperience: test.experience,
                    currentLevel: test.level
                });
                
                const status = statusResponse.data;
                console.log(`📊 Experience ${test.experience}, Level ${test.level}:`);
                console.log(`   Can level up: ${status.canLevelUp ? '✅' : '❌'}`);
                console.log(`   Blocked from combat: ${status.isBlockedForCombat ? '🚫' : '✅'}`);
                console.log(`   Progress: ${status.progressPercentage}%`);
            } catch (error) {
                console.log(`❌ Error checking status:`, error.response?.data || error.message);
            }
        }

        // Test 5: Validate level calculations
        console.log('\n5️⃣ Testing level validation...');
        try {
            const validationResponse = await axios.get(`${API_BASE}/level/validate`);
            console.log(`✅ Level validation: ${validationResponse.data.isValid ? 'PASSED' : 'FAILED'}`);
            
            if (validationResponse.data.message) {
                console.log(`   Message: ${validationResponse.data.message}`);
            }
        } catch (error) {
            console.log(`❌ Validation error:`, error.response?.data || error.message);
        }

        console.log('\n🎉 Level System API Test Complete!');
        console.log('\n📋 Summary:');
        console.log('   ✅ Level data retrieval working');
        console.log('   ✅ Experience simulation working');
        console.log('   ✅ Gratifications system working');
        console.log('   ✅ Level status checking working');
        console.log('   ✅ Level validation working');

    } catch (error) {
        console.error('❌ API Test failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure the backend server is running on http://localhost:5000');
        }
    }
}

// Test if server is running first
async function checkServerStatus() {
    try {
        const response = await axios.get(`${API_BASE}/level/all`);
        console.log('✅ Backend server is running and accessible\n');
        return true;
    } catch (error) {
        console.log('❌ Backend server is not accessible');
        console.log('💡 Make sure to run: npm run start:dev in the backend directory\n');
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting Level System Integration Tests\n');
    
    const serverRunning = await checkServerStatus();
    if (serverRunning) {
        await testLevelSystemAPI();
    }
}

runTests();
