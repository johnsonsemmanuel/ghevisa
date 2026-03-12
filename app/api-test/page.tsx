'use client';

import { useState } from 'react';
import { runAllApiTests, ApiTestResult } from '@/lib/api-test';

export default function ApiTestPage() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runTests = async () => {
    setTesting(true);
    try {
      const testResults = await runAllApiTests();
      setResults(testResults);
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setTesting(false);
    }
  };

  const formatJson = (obj: any) => JSON.stringify(obj, null, 2);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            API Connection Test
          </h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Test the connection between the frontend and backend API.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Configuration:</h3>
              <p className="text-blue-800">
                <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}
              </p>
            </div>
          </div>

          <button
            onClick={runTests}
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            {testing ? 'Running Tests...' : 'Run API Tests'}
          </button>

          {results && (
            <div className="mt-8">
              <div className={`p-4 rounded-md mb-6 ${
                results.overall 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <h2 className={`text-lg font-semibold ${
                  results.overall ? 'text-green-900' : 'text-red-900'
                }`}>
                  Overall Status: {results.overall ? 'PASS' : 'FAIL'}
                </h2>
              </div>

              <div className="space-y-6">
                {Object.entries(results.tests).map(([testName, result]: [string, any]) => (
                  <div key={testName} className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium capitalize">
                        {testName} Test
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.success ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{result.message}</p>
                    
                    <details className="mt-3">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        View Details
                      </summary>
                      <pre className="mt-2 bg-gray-100 p-3 rounded text-sm overflow-auto">
                        {formatJson(result)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}