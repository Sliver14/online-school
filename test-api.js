const axios = require('axios');

// Mock data for testing
const mockUserId = 1; // Assuming user ID 1 exists

async function testAPIs() {
  console.log('=== TESTING API ENDPOINTS ===');
  
  try {
    // Test video progress API
    console.log('\n1. Testing video progress API...');
    try {
      const videoResponse = await axios.get(`http://localhost:3000/api/user-progress/video-watched?userId=${mockUserId}`);
      console.log('Video progress response:', videoResponse.data);
    } catch (error) {
      console.log('Video progress error:', error.response?.data || error.message);
    }
    
    // Test assessment results API
    console.log('\n2. Testing assessment results API...');
    try {
      const assessmentResponse = await axios.get(`http://localhost:3000/api/user-progress/assessment-results?userId=${mockUserId}`);
      console.log('Assessment results response:', assessmentResponse.data);
    } catch (error) {
      console.log('Assessment results error:', error.response?.data || error.message);
    }
    
    // Test class timers API
    console.log('\n3. Testing class timers API...');
    try {
      const timersResponse = await axios.get(`http://localhost:3000/api/user-progress/class-timers?userId=${mockUserId}`);
      console.log('Class timers response:', timersResponse.data);
    } catch (error) {
      console.log('Class timers error:', error.response?.data || error.message);
    }
    
    // Test classes API
    console.log('\n4. Testing classes API...');
    try {
      const classesResponse = await axios.get('http://localhost:3000/api/classes');
      console.log('Classes response:', classesResponse.data);
    } catch (error) {
      console.log('Classes error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('General error:', error.message);
  }
}

// Wait a bit for the server to start, then test
setTimeout(testAPIs, 3000); 