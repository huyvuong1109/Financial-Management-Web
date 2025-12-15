# base image JDK 21
FROM openjdk:27-ea-oraclelinux9

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy file JAR đã build vào container
COPY target/payment-service-0.0.1-SNAPSHOT.jar app.jar

# Cấu hình cổng ứng dụng
EXPOSE 8081

# Chạy ứng dụng khi container start
ENTRYPOINT ["java", "-jar", "app.jar"]
