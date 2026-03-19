# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Set build-time variables for Next.js
# These are passed from docker-compose build args
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL
ARG NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION=$NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION

RUN npm run build

# ---------- PRODUCTION ----------
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app ./

RUN npm ci --omit=dev

EXPOSE 3000

CMD ["npm", "run", "start"]