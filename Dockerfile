# Use Node LTS
FROM node:20

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build NextJS app
RUN npm run build

# Expose frontend port
EXPOSE 3001

# Start application
CMD ["npm", "run", "start"]