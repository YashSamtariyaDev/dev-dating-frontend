# 🚀 Production Environment Configuration

## 📋 Environment Variables

### **🔐 Authentication**
```bash
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-super-secret-key-here
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### **🌐 Backend Configuration**
```bash
# Load Balancing - Multiple Backend URLs
BACKEND_URL_1=https://api1.yourdomain.com
BACKEND_URL_2=https://api2.yourdomain.com
BACKEND_URL_3=https://api3.yourdomain.com

# Or single backend for development
BACKEND_URL_1=https://localhost:3000
```

### **🔧 Proxy Configuration**
```bash
# Load Balancing Strategy
# Options: round-robin, hash, random
PROXY_LOAD_BALANCING=round-robin

# Rate Limiting
PROXY_RATE_LIMIT_REQUESTS=100
PROXY_RATE_LIMIT_WINDOW=60000

# Caching
NODE_ENV=production
PROXY_CACHE_ENABLED=true
PROXY_CACHE_TTL=300

# Monitoring
PROXY_MONITORING=true
```

### **🛡️ Security**
```bash
# TLS/SSL Configuration
NODE_TLS_REJECT_UNAUTHORIZED=0  # Only for development
# Remove this in production!

# CORS Configuration
PROXY_CORS_ORIGIN=https://yourdomain.com
PROXY_CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
PROXY_CORS_HEADERS=Content-Type,Authorization
```

---

## 🎯 Development vs Production

### **🔧 Development (.env.local)**
```bash
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=dev-dating-local-secret
NEXT_PUBLIC_API_URL=https://localhost:3000
NODE_TLS_REJECT_UNAUTHORIZED=0
PROXY_CACHE_ENABLED=false
PROXY_MONITORING=true
```

### **🚀 Production (.env.production)**
```bash
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=super-secure-production-secret
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
BACKEND_URL_1=https://api1.yourdomain.com
BACKEND_URL_2=https://api2.yourdomain.com
BACKEND_URL_3=https://api3.yourdomain.com
PROXY_LOAD_BALANCING=round-robin
PROXY_RATE_LIMIT_REQUESTS=1000
PROXY_RATE_LIMIT_WINDOW=60000
PROXY_CACHE_ENABLED=true
PROXY_CACHE_TTL=300
PROXY_MONITORING=true
```

---

## 📊 Load Balancing Strategies

### **🔄 Round Robin**
```bash
PROXY_LOAD_BALANCING=round-robin
```
- Distributes requests evenly across backends
- Best for: Equal capacity servers

### **🎲 Hash Based**
```bash
PROXY_LOAD_BALANCING=hash
```
- Same user always goes to same backend
- Best for: Session persistence needed

### **🎯 Random**
```bash
PROXY_LOAD_BALANCING=random
```
- Random backend selection
- Best for: Stateless applications

---

## 🚦 Rate Limiting Configuration

### **🔢 Request Limits**
```bash
PROXY_RATE_LIMIT_REQUESTS=100    # Requests per window
PROXY_RATE_LIMIT_WINDOW=60000    # Window in milliseconds (1 minute)
```

### **📊 Different Strategies**
```bash
# Strict (100 requests/minute)
PROXY_RATE_LIMIT_REQUESTS=100
PROXY_RATE_LIMIT_WINDOW=60000

# Moderate (1000 requests/minute)
PROXY_RATE_LIMIT_REQUESTS=1000
PROXY_RATE_LIMIT_WINDOW=60000

# Lenient (10000 requests/hour)
PROXY_RATE_LIMIT_REQUESTS=10000
PROXY_RATE_LIMIT_WINDOW=3600000
```

---

## 🗄️ Caching Configuration

### **⚡ Cache TTL Settings**
```bash
# Short cache (5 minutes)
PROXY_CACHE_TTL=300

# Medium cache (30 minutes)
PROXY_CACHE_TTL=1800

# Long cache (2 hours)
PROXY_CACHE_TTL=7200
```

### **🎯 Cache by Environment**
```bash
# Development - No caching
NODE_ENV=development
PROXY_CACHE_ENABLED=false

# Production - Enable caching
NODE_ENV=production
PROXY_CACHE_ENABLED=true
```

---

## 📈 Monitoring & Health Checks

### **🔍 Health Check Endpoint**
```bash
curl -X OPTIONS https://yourdomain.com/api/proxy/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-11T12:00:00.000Z",
  "backends": 3,
  "loadBalancing": "round-robin",
  "rateLimiting": 100,
  "caching": true,
  "metrics": {
    "totalRequests": 10000,
    "successRequests": 9500,
    "errorRequests": 500,
    "successRate": "95.00%",
    "cacheHitRate": "75.00%",
    "averageResponseTime": "125.50ms"
  }
}
```

### **📊 Response Headers**
```bash
X-Response-Time: 125
X-Backend-URL: https://api1.yourdomain.com
X-Cache: HIT
X-Metrics-Total: 10000
X-Metrics-Success: 9500
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1646990400000
```

---

## 🛡️ Security Best Practices

### **🔒 Production Security**
```bash
# Remove development TLS bypass
# NODE_TLS_REJECT_UNAUTHORIZED=0  # REMOVE IN PRODUCTION!

# Use HTTPS only
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Strong secrets
NEXTAUTH_SECRET=256-bit-secure-random-string

# Limited CORS
PROXY_CORS_ORIGIN=https://yourdomain.com
```

### **🔐 Rate Limiting by User**
- Per-user rate limiting automatically applied
- Based on user email from session
- Different limits per endpoint

---

## 🚀 Deployment Checklist

### **✅ Pre-Deployment**
- [ ] Set strong NEXTAUTH_SECRET
- [ ] Configure multiple backend URLs
- [ ] Enable production caching
- [ ] Set appropriate rate limits
- [ ] Remove NODE_TLS_REJECT_UNAUTHORIZED=0
- [ ] Configure monitoring

### **✅ Post-Deployment**
- [ ] Test health check endpoint
- [ ] Monitor response headers
- [ ] Check load balancing
- [ ] Verify rate limiting
- [ ] Monitor cache hit rates
- [ ] Set up alerts for metrics

---

## 🎯 Scaling Strategies

### **📈 Horizontal Scaling**
```bash
# Add more backends
BACKEND_URL_1=https://api1.yourdomain.com
BACKEND_URL_2=https://api2.yourdomain.com
BACKEND_URL_3=https://api3.yourdomain.com
BACKEND_URL_4=https://api4.yourdomain.com
BACKEND_URL_5=https://api5.yourdomain.com
```

### **⚡ Performance Optimization**
```bash
# Increase rate limits for high traffic
PROXY_RATE_LIMIT_REQUESTS=10000

# Longer cache for static data
PROXY_CACHE_TTL=3600

# Enable monitoring
PROXY_MONITORING=true
```

---

## 🔄 CI/CD Integration

### **🚀 Docker Environment**
```dockerfile
ENV NEXTAUTH_URL=https://yourdomain.com
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV BACKEND_URL_1=${BACKEND_URL_1}
ENV BACKEND_URL_2=${BACKEND_URL_2}
ENV PROXY_CACHE_ENABLED=true
ENV PROXY_RATE_LIMIT_REQUESTS=1000
```

### **📊 Kubernetes ConfigMap**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: proxy-config
data:
  PROXY_LOAD_BALANCING: "round-robin"
  PROXY_RATE_LIMIT_REQUESTS: "1000"
  PROXY_CACHE_ENABLED: "true"
  PROXY_CACHE_TTL: "300"
  PROXY_MONITORING: "true"
```

---

## 🎉 Production Benefits

### **✅ What You Get**
- **Load Balancing** - Automatic traffic distribution
- **Rate Limiting** - DDoS protection
- **Caching** - 10x faster responses
- **Monitoring** - Real-time metrics
- **Health Checks** - Automated monitoring
- **Retry Logic** - High availability
- **Request Tracking** - Debugging made easy

### **🚀 Enterprise Ready**
- **Zero Downtime** - Multiple backends
- **Auto Scaling** - Handle traffic spikes
- **Security** - Rate limiting + auth
- **Performance** - Caching + load balancing
- **Monitoring** - Complete visibility

---

**This configuration makes your proxy production-ready and enterprise-grade!** 🎯
