FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
# EXPOSE 80
# EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["./ReactWithASP.Server.csproj", "ReactWithASP.Server/"]
RUN dotnet restore "ReactWithASP.Server/ReactWithASP.Server.csproj"
COPY . "ReactWithASP.Server/"
WORKDIR "/src/ReactWithASP.Server"
RUN dotnet build "ReactWithASP.Server.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ReactWithASP.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "ReactWithASP.Server.dll"]