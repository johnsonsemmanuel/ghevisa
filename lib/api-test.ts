/**
 * API Connection Test Utility
 * Tests the connection to the backend API
 */

import api from './api';

export interface ApiTestResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

/**
 * Test basic API connectivity
 */
export async function testApiConnection(): Promise<ApiTestResult> {
  try {
    const response = await api.get('/health');
    
    return {
      success: true,
      message: 'API connection successful',
      details: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      message: `API connection failed: ${error.message}`,
      details: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Test authentication endpoints
 */
export async function testAuthEndpoints(): Promise<ApiTestResult> {
  try {
    // Test CSRF cookie endpoint
    const csrfResponse = await api.get('/sanctum/csrf-cookie');
    
    return {
      success: true,
      message: 'Authentication endpoints accessible',
      details: {
        csrf: 'OK',
        status: csrfResponse.status,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Authentication test failed: ${error.message}`,
      details: {
        status: error.response?.status,
        statusText: error.response?.statusText,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Test CORS configuration
 */
export async function testCorsConfiguration(): Promise<ApiTestResult> {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/health', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: 'CORS configuration working correctly',
        details: data,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        success: false,
        message: `CORS test failed with status: ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
        },
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `CORS test failed: ${error.message}`,
      details: error,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Run all API tests
 */
export async function runAllApiTests(): Promise<{
  overall: boolean;
  tests: {
    connection: ApiTestResult;
    auth: ApiTestResult;
    cors: ApiTestResult;
  };
}> {
  const tests = {
    connection: await testApiConnection(),
    auth: await testAuthEndpoints(),
    cors: await testCorsConfiguration(),
  };

  const overall = Object.values(tests).every(test => test.success);

  return {
    overall,
    tests,
  };
}