# ========================================================
# Stage 1: Build the Spring Boot application with Maven & Java 21
# ========================================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Copy Spring Boot backend source files
COPY spring-boot-backend/pom.xml ./
COPY spring-boot-backend/src ./src

# Compile, run unit tests, and package executable JAR
RUN mvn clean package -DskipTests
# ========================================================
# Stage 2: Minimal, secure Java 21 production runtime
# ========================================================
FROM eclipse-temurin:21-jre-alpine

# Install wget for healthcheck probing
RUN apk add --no-cache wget

# Create non-root dedicated application user & group
RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

# Copy the exact packaged JAR from the builder stage
# Matching artifactId: peerlearn-platform, version: 1.0.0
COPY --from=builder /build/target/peerlearn-platform-1.0.0.jar app.jar

# Ensure spring user owns application directory
RUN chown -R spring:spring /app

# Switch to non-root user for container security
USER spring:spring

# Expose Spring Boot application port
EXPOSE 8080

# Environment variables with sensible production defaults
ENV SPRING_PROFILES_ACTIVE=prod \
    DB_HOST=mysql \
    DB_PORT=3306 \
    DB_NAME=peerlearn_db \
    DB_USERNAME=root \
    DB_PASSWORD=root

# Container Health Check targeting Spring Boot Actuator
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health | grep -q 'UP' || exit 1

# Launch the Spring Boot application
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
