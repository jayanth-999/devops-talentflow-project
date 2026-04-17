# ── Stage 1: Build ─────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder

WORKDIR /build

# Copy project files and restore (layer caching)
COPY src/NotificationService/NotificationService.csproj ./src/NotificationService/
RUN dotnet restore ./src/NotificationService/NotificationService.csproj

# Copy source and publish
COPY src ./src
RUN dotnet publish ./src/NotificationService/NotificationService.csproj \
    -c Release -o /app/publish --no-restore


# ── Stage 2: Runtime ───────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

# Security: non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Install curl for health check
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/publish .

USER appuser

EXPOSE 8002

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8002/health || exit 1

ENTRYPOINT ["dotnet", "NotificationService.dll"]
