import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FormulaInput from './components/FormulaInput';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Causal-Style Formula Input</h1>
          </div>
        </header>
        
        <main>
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="border-b pb-4 mb-6">
                <h2 className="text-lg font-medium">Formula Calculator</h2>
                <p className="text-gray-500 mt-1">Enter a formula using tags, operators and numbers</p>
              </div>
              
              <div className="relative">
                <FormulaInput />
              </div>
              
              <div className="mt-8 bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="text-md font-medium mb-3">How to use:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Type variable names to find and select from suggestions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Use operators (+, -, *, /, ^) between variables</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Navigate with arrow keys and Tab to select suggestions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Click dropdown arrow (▼) on tags to see options</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Press Calculate to evaluate the formula</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
                <h3 className="text-md font-medium text-blue-800 mb-2">Sample Variables:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                    <span className="font-medium">Revenue</span>
                    <span className="text-gray-600">5000</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                    <span className="font-medium">Cost</span>
                    <span className="text-gray-600">3000</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                    <span className="font-medium">Profit</span>
                    <span className="text-gray-600">2000</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                    <span className="font-medium">Growth Rate</span>
                    <span className="text-gray-600">0.15</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
};

export default App;