FROM openjdk:27-ea-oraclelinux9

WORKDIR /app

COPY target/notification-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]