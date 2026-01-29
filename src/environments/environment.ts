export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  mock: {
    enabled: true,
    delay: 500, // Base delay in ms
    simulateErrors: false, // Set to true to enable random errors
    errorRate: 0.1 // 10% chance of error when simulateErrors is true
  }
};