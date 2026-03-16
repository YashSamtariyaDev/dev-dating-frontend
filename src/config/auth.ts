import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { API_ENDPOINTS } from './api';

// Import https for certificate handling
const https = require('https');

function getBackendBaseUrl() {
  // Use BACKEND_URL_1 (internal Docker name) if available, otherwise fallback to public API URL
  const raw = process.env.BACKEND_URL_1 || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  try {
    const url = new URL(raw);
    return url.origin.replace(/\/$/, '');
  } catch {
    return raw.replace(/\/$/, '');
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const backendBaseUrl = getBackendBaseUrl();
          
          console.log('🔐 NextAuth authorize called with:', {
            email: credentials.email,
            backendBaseUrl,
            endpoint: `${backendBaseUrl}${API_ENDPOINTS.AUTH.LOGIN}`
          });

          // Test direct backend connectivity first
          console.log('🧪 Testing backend connectivity...');
          try {
            let testOptions: RequestInit = {
              method: 'GET',
              signal: AbortSignal.timeout(5000),
            };

            // Add HTTPS agent to ignore self-signed certificates for localhost or local IPs
            const isLocal = backendBaseUrl.includes('localhost') || 
                           backendBaseUrl.includes('127.0.0.1') || 
                           backendBaseUrl.includes('192.168.');
                           
            if (backendBaseUrl.startsWith('https') && isLocal) {
              const httpsAgent = new https.Agent({ rejectUnauthorized: false });
              (testOptions as any).agent = httpsAgent;
            }

            const testResponse = await fetch(`${backendBaseUrl}/`, testOptions);
            console.log('🧪 Backend test response:', testResponse.status);
          } catch (testError: any) {
            console.error('🧪 Backend connectivity test failed:', testError.message);
          }

          const requestBody = JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          });

          console.log('📤 Sending request to:', `${backendBaseUrl}${API_ENDPOINTS.AUTH.LOGIN}`);
          console.log('📤 Request body:', JSON.stringify({
            email: credentials.email,
            password: '***'
          }));

          // Use a simple fetch with no certificate validation for localhost
          let fetchOptions: RequestInit = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'NextAuth-Client',
            },
            body: requestBody,
            signal: AbortSignal.timeout(10000), // 10 second timeout
          };

          // Add HTTPS agent to ignore self-signed certificates for local development
          const isLocal = backendBaseUrl.includes('localhost') || 
                         backendBaseUrl.includes('127.0.0.1') || 
                         backendBaseUrl.includes('192.168.');

          if (backendBaseUrl.startsWith('https') && isLocal) {
            const httpsAgent = new https.Agent({ 
              rejectUnauthorized: false,
              keepAlive: true,
            });
            (fetchOptions as any).agent = httpsAgent;
            console.log('🔐 Added HTTPS agent for local SSL bypass');
          }

          const response = await fetch(`${backendBaseUrl}${API_ENDPOINTS.AUTH.LOGIN}`, fetchOptions);
          
          console.log('📥 Response status:', response.status);
          console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

          const data = await response.json();
          console.log('📥 Response data:', data);

          if (!response.ok) {
            console.log('❌ Login failed:', response.status, data);
            return null;
          }

          const accessToken = data?.accessToken || data?.token;
          if (!accessToken) {
            console.log('❌ No access token in response:', data);
            return null;
          }

          console.log('✅ Login successful, token found:', accessToken.substring(0, 20) + '...');

          // Fetch current user using the access token so NextAuth has a stable user object.
          let me: any = null;
          try {
            let meOptions: RequestInit = {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            };

            // Add HTTPS agent to ignore self-signed certificates
            const isLocal = backendBaseUrl.includes('localhost') || 
                           backendBaseUrl.includes('127.0.0.1') || 
                           backendBaseUrl.includes('192.168.');

            if (backendBaseUrl.startsWith('https') && isLocal) {
              const httpsAgent = new https.Agent({ 
                rejectUnauthorized: false,
                keepAlive: true,
              });
              (meOptions as any).agent = httpsAgent;
              console.log('🔐 Added HTTPS agent for /auth/me call');
            }

            const meRes = await fetch(`${backendBaseUrl}${API_ENDPOINTS.AUTH.ME}`, meOptions);
            if (meRes.ok) {
              me = await meRes.json();
            }
          } catch (meError) {
            console.error('❌ Failed to fetch user info:', meError);
          }

          const fallbackEmail = credentials?.email || '';
          return {
            id: me?.id || me?._id || fallbackEmail,
            email: me?.email || fallbackEmail,
            name: me?.name || fallbackEmail,
            image: me?.avatar,
            accessToken,
          } as any;
        } catch (error: any) {
          console.error('💥 Auth error details:', {
            error: error.message,
            stack: error.stack,
            cause: error.cause,
            name: error.name
          });
          
          // If it's a TLS/HTTPS error, give helpful message
          if (error.message.includes('HTTPParserError') || error.cause?.data) {
            console.error('🔐 TLS/HTTPS Error detected. Check if backend is running on HTTPS with self-signed cert.');
            console.error('🔐 Try curl to test: curl -k https://localhost:3000/auth/login -H "Content-Type: application/json" -d \'{"email":"test@test.com","password":"test"}\'');
          }
          
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        // Persist backend access token in NextAuth JWT
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        (session as any).accessToken = token.accessToken as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
