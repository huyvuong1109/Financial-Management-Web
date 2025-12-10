# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper và pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Tải dependencies trước (cache layer)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source code và build
COPY src src
RUN ./mvnw clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/payment-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
