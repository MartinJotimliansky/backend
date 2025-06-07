console.log('🧪 Simple Level System Test');

const axios = require('axios');

async function simpleTest() {
    try {
        console.log('Testing API connection...');
        const response = await axios.get('http://localhost:5000/level/all');
        console.log('✅ Success! Got', response.data.length, 'level entries');
        
        // Test gratifications
        const gratResponse = await axios.get('http://localhost:5000/level/gratifications/5');
        console.log('✅ Gratifications for level 5:', gratResponse.data.length, 'options');
        
        console.log('🎉 Basic test passed!');
    } catch (error) {
        console.log('❌ Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('Backend server is not running');
        }
    }
}

simpleTest();
