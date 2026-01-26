# Use OpenJDK 17 as base image
FROM eclipse-temurin:17-jdk-alpine

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml first (for better caching)
# If Root Directory is set to backend/web-shop, these paths are relative to that
COPY mvnw* .
COPY .mvn .mvn
COPY pom.xml .

# Make mvnw executable
RUN chmod +x ./mvnw || chmod +x ./mvnw.cmd || true

# Download dependencies (this layer will be cached if pom.xml doesn't change)
RUN ./mvnw dependency:go-offline -B || ./mvnw.cmd dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests || ./mvnw.cmd clean package -DskipTests

# Expose port (Render will set PORT environment variable)
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/web-shop-0.0.1-SNAPSHOT.jar"]
