/**
 * Concurrency test helper for Orders QA
 * Runs parallel requests and tracks results
 */

import http from 'http';

export interface ConcurrencyResult {
  totalRequests: number;
  successCount: number;
  failureCount: number;
  errors: { status: number; message: string }[];
  latencies: number[];
  p50: number;
  p95: number;
  p99: number;
}

export async function runConcurrentRequests(
  requestFn: () => Promise<{ success: boolean; status?: number; message?: string; latency: number }>,
  concurrency: number
): Promise<ConcurrencyResult> {
  const results = await Promise.all(
    Array(concurrency).fill(null).map(async () => {
      const start = Date.now();
      try {
        const result = await requestFn();
        const latency = Date.now() - start;
        return { ...result, latency };
      } catch (error: any) {
        const latency = Date.now() - start;
        return {
          success: false,
          status: error.status || 500,
          message: error.message || 'Unknown error',
          latency
        };
      }
    })
  );

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  const errors = results
    .filter(r => !r.success)
    .map(r => ({ status: r.status || 500, message: r.message || '' }));
  const latencies = results.map(r => r.latency).sort((a, b) => a - b);

  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];

  return {
    totalRequests: concurrency,
    successCount,
    failureCount,
    errors,
    latencies,
    p50,
    p95,
    p99
  };
}

export function printConcurrencyReport(testName: string, result: ConcurrencyResult) {
  console.log(`\n📊 Concurrency Test: ${testName}`);
  console.log(`   Total Requests: ${result.totalRequests}`);
  console.log(`   ✅ Success: ${result.successCount}`);
  console.log(`   ❌ Failed: ${result.failureCount}`);
  console.log(`   Latency P50: ${result.p50}ms`);
  console.log(`   Latency P95: ${result.p95}ms`);
  console.log(`   Latency P99: ${result.p99}ms`);
  
  if (result.errors.length > 0) {
    const errorSummary = result.errors.reduce((acc, err) => {
      const key = `${err.status}: ${err.message}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('   Error breakdown:');
    Object.entries(errorSummary).forEach(([error, count]) => {
      console.log(`     - ${error} (${count}x)`);
    });
  }
}