using Microsoft.EntityFrameworkCore;
using ReactWithASP.Server.Middleware;
using ReactWithASP.Server.Models;
using Serilog;
using Serilog.Events;

try
{
    // Configure Serilog
    Log.Logger = new LoggerConfiguration()
        .MinimumLevel.Information()
        .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
        .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
        .Enrich.FromLogContext()
        .Enrich.WithThreadId()
        .Enrich.WithProcessId()
        .WriteTo.Console(
            outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}"
        )
        .WriteTo.File(
            "logs/api-.log",
            rollingInterval: RollingInterval.Day,
            outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
        )
        .CreateLogger();

    var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

    var builder = WebApplication.CreateBuilder(args);

    builder.Services.AddCors(options =>
    {
        options.AddPolicy(
            MyAllowSpecificOrigins,
            policy =>
            {
                policy
                    .WithOrigins("http://localhost:3000", "https://localhost:3000")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            }
        );
    });

    // Add services to the container.
    builder.Services.AddControllers();

    // OpenAPI and Swagger UI
    builder.Services.AddOpenApi();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    builder.Services.AddDbContext<QuoteContext>(opt => opt.UseInMemoryDatabase("QuoteList"));

    // Add Serilog to the service collection
    builder.Host.UseSerilog();

    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
        app.UseForwardedHeaders();

        app.MapOpenApi();
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/openapi/v1.json", "Relic API v1");
        });
    }
    else
    {
        app.UseGlobalExceptionHandler();

        app.UseExceptionHandler("/Error");

        app.UseForwardedHeaders();

        app.UseHsts();
    }

    app.UseStaticFiles();

    app.UseHttpsRedirection();

    // Add the request logging middleware
    app.UseRequestLogging();

    app.UseCors(MyAllowSpecificOrigins);

    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
