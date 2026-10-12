# Production-style API image for CI compose smoke tests and future deploy.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Spenny.Api.csproj", "./"]
RUN dotnet restore "Spenny.Api.csproj"
COPY . .
RUN dotnet publish "Spenny.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Spenny.Api.dll"]
