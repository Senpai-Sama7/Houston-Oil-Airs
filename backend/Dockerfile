FROM node:20-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM maven:3.9.6-eclipse-temurin-17 AS java-builder
WORKDIR /app
COPY java-services/pom.xml ./
COPY java-services/src ./src
RUN mvn -B -DskipTests clean package

FROM node:20-alpine
WORKDIR /app

# Install Java runtime for multi-service support
RUN apk add --no-cache openjdk17-jre-headless

# Copy Node.js dependencies
COPY --from=base /app/node_modules ./node_modules
COPY node-server ./node-server

# Copy Java service
COPY --from=java-builder /app/target/*.jar ./java-services/

# Copy startup script
COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 3001 8080
CMD ["./start.sh"]
