import { NextResponse } from 'next/server';

export async function GET() {
  const handles = (process as any)._getActiveHandles().map((h: any) => ({
    type: h.constructor?.name || typeof h,
    ...(h.address && typeof h.address === 'function' ? { address: h.address() } : {}),
    ...(h._host ? { host: h._host } : {}),
    ...(h.fd !== undefined ? { fd: h.fd } : {}),
  }));

  const requests = (process as any)._getActiveRequests().map((r: any) => ({
    type: r.constructor?.name || typeof r,
  }));

  const mem = process.memoryUsage();
  const cpu = process.cpuUsage();

  return NextResponse.json({
    activeHandles: handles,
    activeHandleCount: handles.length,
    activeRequests: requests,
    activeRequestCount: requests.length,
    memory: {
      rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)}MB`,
    },
    cpuUsage: {
      user: `${Math.round(cpu.user / 1000)}ms`,
      system: `${Math.round(cpu.system / 1000)}ms`,
    },
    uptime: `${Math.round(process.uptime())}s`,
  });
}
