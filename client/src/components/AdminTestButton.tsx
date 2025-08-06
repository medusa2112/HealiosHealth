import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "../hooks/use-auth";

export function AdminTestButton() {
  const { user } = useUser();
  const [testResults, setTestResults] = useState<string[]>([]);

  const runSecurityTest = async () => {
    const results: string[] = [];
    
    // Test admin-only endpoints
    const adminEndpoints = [
      '/api/stock-alerts',
      '/api/quiz/stats'
    ];

    for (const endpoint of adminEndpoints) {
      try {
        const response = await fetch(endpoint, {
          credentials: 'include'
        });
        
        if (user?.role === 'admin') {
          results.push(`✅ Admin can access ${endpoint}: ${response.status}`);
        } else {
          results.push(`${response.status === 403 ? '✅' : '❌'} Non-admin blocked from ${endpoint}: ${response.status}`);
        }
      } catch (error) {
        results.push(`❌ Error testing ${endpoint}: ${error}`);
      }
    }
    
    setTestResults(results);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-gray-100 border rounded">
      <h3 className="font-bold mb-2">Security Test (Dev Only)</h3>
      <p className="text-sm mb-2">User: {user?.email || 'Not logged in'} ({user?.role || 'none'})</p>
      <Button onClick={runSecurityTest} className="mb-2">Run Security Test</Button>
      <div className="max-w-xs max-h-40 overflow-y-auto">
        {testResults.map((result, i) => (
          <div key={i} className="text-xs">{result}</div>
        ))}
      </div>
    </div>
  );
}