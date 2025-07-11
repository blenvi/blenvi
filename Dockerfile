# syntax=docker/dockerfile:1

# Multi-stage build for Next.js application

# Stage 1: Development environment
FROM node:22.12.0-alpine AS development

WORKDIR /app

# Install dependencies based on package-lock.json
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source files
COPY . .

# Expose the port that the application listens on
EXPOSE 3000

# Development mode command
CMD ["npm", "run", "dev"]

# Stage 2: Build stage
FROM node:22.12.0-alpine AS builder

WORKDIR /app

# Set to production for better optimization
ENV NODE_ENV=production

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the files
COPY . .

# Build the application
RUN npm run build

# Stage 3: Production environment
FROM node:22.12.0-alpine AS production

WORKDIR /app

# Set to production
ENV NODE_ENV=production

# Copy package.json and install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built app from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# Run the application as a non-root user
USER node

# Expose the port that the application listens on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
