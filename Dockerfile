# Use OpenJDK 17 as base image
FROM eclipse-temurin:17-jdk-alpine

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml from backend/web-shop
COPY backend/web-shop/mvnw* ./backend/web-shop/
COPY backend/web-shop/.mvn ./backend/web-shop/.mvn
COPY backend/web-shop/pom.xml ./backend/web-shop/

# Make mvnw executable
RUN chmod +x ./backend/web-shop/mvnw

# Set working directory to backend/web-shop
WORKDIR /app/backend/web-shop

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY backend/web-shop/src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/web-shop-0.0.1-SNAPSHOT.jar"]
