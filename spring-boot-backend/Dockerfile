# ========================================================
# Stage 1: Build the Spring Boot application with Maven & Java 21
# ========================================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /build

COPY pom.xml ./
COPY src ./src

RUN mvn clean package -DskipTests=false

# ========================================================
# Stage 2: Minimal, secure Java 21 production runtime
# ========================================================
FROM eclipse-temurin:21-jre-alpine

RUN apk add --no-cache wget
RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

COPY --from=builder /build/target/peerlearn-platform-1.0.0.jar app.jar
RUN chown -R spring:spring /app

USER spring:spring
EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod \
    DB_HOST=mysql \
    DB_PORT=3306 \
    DB_NAME=peerlearn_db \
    DB_USERNAME=root \
    DB_PASSWORD=root

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health | grep -q 'UP' || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
