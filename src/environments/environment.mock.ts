export const environment = {
  production: false,
  apiUrl: '/api/mock',
  mock: {
    enabled: true,
    delay: 300, // Faster for development
    simulateErrors: true, // Enable errors for testing
    errorRate: 0.2 // 20% chance during development
  }
};