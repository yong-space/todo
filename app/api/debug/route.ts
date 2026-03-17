import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'node:inspector/promises';

export async function GET(req: NextRequest) {
  const duration = Math.min(Number(req.nextUrl.searchParams.get('profile') || 0), 30);

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
  const uptime = process.uptime();

  const result: Record<string, any> = {
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
      userMs: Math.round(cpu.user / 1000),
      systemMs: Math.round(cpu.system / 1000),
      cpuPercent: `${((cpu.user + cpu.system) / 1000 / (uptime * 1000) * 100).toFixed(2)}%`,
    },
    uptime: `${Math.round(uptime)}s`,
  };

  if (duration > 0) {
    const session = new Session();
    session.connect();
    await session.post('Profiler.enable');
    await session.post('Profiler.start');
    await new Promise((r) => setTimeout(r, duration * 1000));
    const { profile } = await session.post('Profiler.stop') as any;
    await session.post('Profiler.disable');
    session.disconnect();

    const nodes = profile.nodes as Array<{
      id: number;
      callFrame: { functionName: string; url: string; lineNumber: number };
      hitCount: number;
    }>;
    const totalSamples = profile.samples?.length || 1;
    const top = nodes
      .filter((n: any) => n.hitCount > 0)
      .sort((a: any, b: any) => b.hitCount - a.hitCount)
      .slice(0, 20)
      .map((n: any) => ({
        fn: n.callFrame.functionName || '(anonymous)',
        file: n.callFrame.url,
        line: n.callFrame.lineNumber,
        hits: n.hitCount,
        pct: `${(n.hitCount / totalSamples * 100).toFixed(1)}%`,
      }));

    result.profile = {
      durationSeconds: duration,
      totalSamples,
      topFunctions: top,
    };
  }

  return NextResponse.json(result);
}
