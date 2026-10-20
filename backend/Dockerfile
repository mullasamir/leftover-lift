# syntax=docker/dockerfile:1

# ---- Stage 1: build the jar ------------------------------------------------------------------
# Maven and the JDK are only needed to build. They never reach the final image.
FROM maven:3.9-eclipse-temurin-26 AS build
WORKDIR /app

# Copy the dependency list first. Docker caches each step, so as long as pom.xml is unchanged the
# slow dependency download is reused and only the source compile reruns on a code change.
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -q -B dependency:go-offline

COPY src ./src
# Tests run in CI, where a real database is available. Here we only package.
RUN --mount=type=cache,target=/root/.m2 mvn -q -B package -Dmaven.test.skip=true

# ---- Stage 2: the small runtime image --------------------------------------------------------
# A JRE on Alpine is a fraction of the size of the JDK image and has `wget` for the health check.
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Never run as root inside a container.
RUN addgroup -S app && adduser -S -G app -u 1001 app
COPY --from=build /app/target/leftoverlift-*.jar app.jar
USER app

# Size the JVM from the container's memory limit instead of the host's.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=3s --start-period=45s --retries=5 \
  CMD wget -qO- http://localhost:8080/actuator/health | grep -q '"status":"UP"' || exit 1

# `exec` makes Java process 1, so it receives the stop signal and shuts down cleanly.
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
