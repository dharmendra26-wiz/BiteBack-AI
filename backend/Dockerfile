# ── Build stage ───────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn .mvn
ENV MAVEN_OPTS="-Xmx300m"
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q
COPY src src
RUN ./mvnw package -DskipTests -q

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Xmx300m", "-jar", "app.jar"]
