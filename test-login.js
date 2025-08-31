const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing admin login...');
    const adminResponse = await axios.post('http://localhost:8080/api/auth/login', {
      username: 'admin@yatrasathi.com',
      password: 'Admin@123'
    });
    console.log('Admin login successful:', adminResponse.data);
  } catch (error) {
    console.error('Admin login failed:', error.response?.data || error.message);
  }

  try {
    console.log('\nTesting employee login...');
    const employeeResponse = await axios.post('http://localhost:8080/api/auth/login', {
      username: 'employee1@yatrasathi.com',
      password: 'Emp@123'
    });
    console.log('Employee login successful:', employeeResponse.data);
  } catch (error) {
    console.error('Employee login failed:', error.response?.data || error.message);
  }

  try {
    console.log('\nTesting customer login...');
    const customerResponse = await axios.post('http://localhost:8080/api/auth/login', {
      username: 'customer1@yatrasathi.com',
      password: 'Cust@123'
    });
    console.log('Customer login successful:', customerResponse.data);
  } catch (error) {
    console.error('Customer login failed:', error.response?.data || error.message);
  }
}

testLogin();