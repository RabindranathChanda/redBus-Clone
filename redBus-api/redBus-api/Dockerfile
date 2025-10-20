# -----------------------------
# Stage 1: Build
# -----------------------------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy only csproj first to leverage Docker cache for restore
COPY ["redBus-api/redBus-api.csproj", "redBus-api/"]
RUN dotnet restore "redBus-api/redBus-api.csproj"

## Copy all source files
COPY . .
WORKDIR "/src/redBus-api"

# Build and publish in a single step for smaller image
RUN dotnet publish "redBus-api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# -----------------------------
# Stage 2: Runtime
# -----------------------------
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

## Expose ports your API listens on
EXPOSE 8080
EXPOSE 8081

# Copy published app from build stage
COPY --from=build /app/publish .

# Copy certificates into the container
COPY certs /app/certs

# Use non-root user for security
# Create a user 'appuser' with UID 1000
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

# Entry point
ENTRYPOINT ["dotnet", "redBus-api.dll"]
