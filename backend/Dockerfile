FROM eclipse-temurin:17-jdk as build
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN ./mvnw -q -e -DskipTests package || (apt-get update && apt-get install -y maven && mvn -q -e -DskipTests package)

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS=""
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]



