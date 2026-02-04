// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5113/api', // Your .NET API URL
  tokenKey: 'banking_auth_token',
  refreshTokenKey: 'banking_refresh_token',
  userKey: 'banking_user_data',
  timeout: 30000
};

