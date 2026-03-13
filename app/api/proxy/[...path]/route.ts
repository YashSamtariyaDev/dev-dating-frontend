import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';

// 📊 Production Configuration
interface ProxyConfig {
  backends: string[];
  loadBalancing: 'round-robin' | 'hash' | 'random';
  rateLimiting: {
    requests: number;
    windowMs: number;
  };
  caching: {
    enabled: boolean;
    ttl: number;
  };
  monitoring: boolean;
}

const backendsList = [
  process.env.BACKEND_URL_1,
  process.env.BACKEND_URL_2,
  process.env.BACKEND_URL_3,
  process.env.NEXT_PUBLIC_API_URL
].filter((url): url is string => !!url && (url.startsWith('http://') || url.startsWith('https://')));

// Deduplicate the list
const uniqueBackends = Array.from(new Set(backendsList));

const PROXY_CONFIG: ProxyConfig = {
  backends: uniqueBackends.length > 0 ? uniqueBackends : ['http://localhost:3000'],
  loadBalancing: 'round-robin',
  rateLimiting: {
    requests: 100,
    windowMs: 60000 // 1 minute
  },
  caching: {
    enabled: process.env.NODE_ENV === 'production',
    ttl: 300 // 5 minutes
  },
  monitoring: true
};

// 🔄 Load Balancing State
let currentBackendIndex = 0;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const cacheMap = new Map<string, { data: any; timestamp: number }>();

// 📊 Metrics Collection
const metrics = {
  totalRequests: 0,
  successRequests: 0,
  errorRequests: 0,
  backendResponses: new Map<string, number>(),
  averageResponseTime: 0,
  rateLimitHits: 0,
  cacheHits: 0
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return handleProxyRequest(request, 'GET', path);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return handleProxyRequest(request, 'POST', path);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return handleProxyRequest(request, 'PUT', path);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return handleProxyRequest(request, 'DELETE', path);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return handleProxyRequest(request, 'PATCH', path);
}

async function handleProxyRequest(
  request: NextRequest,
  method: string,
  pathSegments: string[]
) {
  const startTime = Date.now();
  metrics.totalRequests++;

  try {
    console.log(`🔗 ${method} Proxy called for: /${pathSegments.join('/')}`);

    // 🔐 Skip authentication for auth endpoints
    const isAuthEndpoint = pathSegments[0] === 'auth';

    if (!isAuthEndpoint) {
      // 🔐 Authentication Check for non-auth endpoints
      const session = await getServerSession(authOptions);

      if (!session || !(session as any)?.accessToken) {
        console.log('❌ No session or token');
        metrics.errorRequests++;
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const userId = isAuthEndpoint ? 'anonymous' : ((await getServerSession(authOptions)) as any)?.email || 'anonymous';

    // 🚦 Rate Limiting
    if (PROXY_CONFIG.rateLimiting.requests > 0) {
      const rateLimitKey = `${userId}:${pathSegments.join('/')}`;
      const now = Date.now();
      const userLimit = rateLimitMap.get(rateLimitKey);

      if (userLimit && now < userLimit.resetTime) {
        if (userLimit.count >= PROXY_CONFIG.rateLimiting.requests) {
          metrics.rateLimitHits++;
          console.log('� Rate limit exceeded for:', userId);
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            {
              status: 429,
              headers: {
                'X-RateLimit-Limit': PROXY_CONFIG.rateLimiting.requests.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': userLimit.resetTime.toString()
              }
            }
          );
        }
        userLimit.count++;
      } else {
        rateLimitMap.set(rateLimitKey, {
          count: 1,
          resetTime: now + PROXY_CONFIG.rateLimiting.windowMs
        });
      }
    }

    // 🗄️ Caching Layer (GET requests only)
    const cacheKey = `${method}:${pathSegments.join('/')}`;
    if (method === 'GET' && PROXY_CONFIG.caching.enabled) {
      const cached = cacheMap.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < PROXY_CONFIG.caching.ttl * 1000) {
        metrics.cacheHits++;
        console.log('🗄️ Cache hit for:', cacheKey);
        return NextResponse.json(cached.data, {
          headers: {
            'X-Cache': 'HIT',
            'X-Cache-TTL': Math.max(0, PROXY_CONFIG.caching.ttl - Math.floor((Date.now() - cached.timestamp) / 1000)).toString()
          }
        });
      }
    }

    // 🔄 Load Balancing
    const backendUrl = getBackendUrl(pathSegments);
    console.log(`📤 ${method} calling backend: ${backendUrl}`);

    // 📊 Request Logging
    if (PROXY_CONFIG.monitoring) {
      logRequest({
        userId,
        method,
        path: `/${pathSegments.join('/')}`,
        backendUrl,
        userAgent: request.headers.get('user-agent'),
        ip: (request as any).ip || 'unknown'
      });
    }

    // 🌐 Backend Call
    const session = isAuthEndpoint ? null : await getServerSession(authOptions);
    const response = await makeBackendCall(backendUrl, method, request, session);

    // 📊 Response Metrics
    const responseTime = Date.now() - startTime;
    metrics.averageResponseTime = (metrics.averageResponseTime + responseTime) / 2;
    metrics.backendResponses.set(backendUrl, (metrics.backendResponses.get(backendUrl) || 0) + 1);

    if (response.ok) {
      metrics.successRequests++;
      const data = await response.json();

      // 🗄️ Cache Response (GET only)
      if (method === 'GET' && PROXY_CONFIG.caching.enabled) {
        cacheMap.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }

      console.log(`✅ Backend success: ${response.status} in ${responseTime}ms`);

      return NextResponse.json(data, {
        status: response.status,
        headers: {
          'X-Response-Time': responseTime.toString(),
          'X-Backend-URL': backendUrl,
          'X-Cache': method === 'GET' ? 'MISS' : 'BYPASS',
          'X-Metrics-Total': metrics.totalRequests.toString(),
          'X-Metrics-Success': metrics.successRequests.toString()
        }
      });
    } else {
      metrics.errorRequests++;
      const errorData = await response.json().catch(() => ({}));
      console.log(`❌ Backend error: ${response.status} in ${responseTime}ms`, errorData);

      return NextResponse.json(
        { error: errorData.message || 'Backend request failed' },
        {
          status: response.status,
          headers: {
            'X-Response-Time': responseTime.toString(),
            'X-Backend-URL': backendUrl
          }
        }
      );
    }

  } catch (error) {
    metrics.errorRequests++;
    const responseTime = Date.now() - startTime;
    console.error(`💥 Proxy error for ${method} in ${responseTime}ms:`, error);

    return NextResponse.json(
      { error: 'Internal server error' },
      {
        status: 500,
        headers: {
          'X-Response-Time': responseTime.toString()
        }
      }
    );
  }
}

// 🔄 Load Balancing Algorithms
function getBackendUrl(pathSegments: string[]): string {
  const backends = PROXY_CONFIG.backends;

  switch (PROXY_CONFIG.loadBalancing) {
    case 'round-robin':
      const url = backends[currentBackendIndex % backends.length];
      currentBackendIndex++;
      return `${url}/${pathSegments.join('/')}`;

    case 'hash':
      const hash = pathSegments.join('/').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return `${backends[hash % backends.length]}/${pathSegments.join('/')}`;

    case 'random':
      return `${backends[Math.floor(Math.random() * backends.length)]}/${pathSegments.join('/')}`;

    default:
      return `${backends[0]}/${pathSegments.join('/')}`;
  }
}

async function makeBackendCall(
  backendUrl: string,
  method: string,
  request: NextRequest,
  session: any
): Promise<Response> {
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      let body: any = null;
      const incomingHeaders = Object.fromEntries(request.headers.entries());
      const headers: Record<string, string> = {};

      // Forward relevant headers
      for (const [key, value] of Object.entries(incomingHeaders)) {
        const lowKey = key.toLowerCase();
        if (!['host', 'connection', 'content-length', 'authorization'].includes(lowKey)) {
          headers[key] = value;
        }
      }

      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('multipart/form-data')) {
          console.log('📦 Proxy: Handling multipart/form-data upload');
          body = await request.formData();
          // Let fetch set the Content-Type with the correct boundary
          delete headers['content-type'];
          delete headers['Content-Type'];
        } else {
          body = await request.clone().arrayBuffer();
        }
      }

      headers['User-Agent'] = request.headers.get('user-agent') || 'Next.js-Proxy';
      headers['X-Attempt'] = attempt.toString();
      headers['X-Request-ID'] = generateRequestId();

      console.log(`📤 Forwarding to Backend with Content-Type: ${headers['content-type'] || headers['Content-Type'] || 'Auto'}`);

      // Add Authorization only if session exists (non-auth endpoints)
      if (session && session.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
      }

      const response = await fetch(backendUrl, {
        method,
        headers,
        body,
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      console.log(`📥 Backend response: ${response.status} (attempt ${attempt})`);
      return response;

    } catch (error: any) {
      lastError = error;
      console.log(`⚠️ Backend attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }
  }

  throw lastError;
}

// 📊 Request Logging
async function logRequest(logData: {
  userId: string;
  method: string;
  path: string;
  backendUrl: string;
  userAgent?: string | null;
  ip?: string;
}) {
  if (!PROXY_CONFIG.monitoring) return;

  console.log('📊 Request Log:', {
    timestamp: new Date().toISOString(),
    ...logData,
    metrics: {
      totalRequests: metrics.totalRequests,
      successRate: metrics.totalRequests > 0 ? (metrics.successRequests / metrics.totalRequests * 100).toFixed(2) + '%' : '0%',
      averageResponseTime: metrics.averageResponseTime.toFixed(2) + 'ms',
      cacheHitRate: metrics.totalRequests > 0 ? (metrics.cacheHits / metrics.totalRequests * 100).toFixed(2) + '%' : '0%'
    }
  });
}

// 🆔 Request ID Generator
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 📈 Health Check Endpoint
export async function OPTIONS() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    backends: PROXY_CONFIG.backends.length,

    loadBalancing: PROXY_CONFIG.loadBalancing,
    rateLimiting: PROXY_CONFIG.rateLimiting.requests,
    caching: PROXY_CONFIG.caching.enabled,
    metrics: {
      ...metrics,
      successRate: metrics.totalRequests > 0 ? (metrics.successRequests / metrics.totalRequests * 100).toFixed(2) + '%' : '0%',
      cacheHitRate: metrics.totalRequests > 0 ? (metrics.cacheHits / metrics.totalRequests * 100).toFixed(2) + '%' : '0%'
    }
  };

  return new NextResponse(JSON.stringify(health, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
