using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ReactWithASP.Server.Data;
using ReactWithASP.Server.Middleware;
using ReactWithASP.Server.Models;
using ReactWithASP.Server.Services;
using Resend;
using Serilog;
using Serilog.Events;
using StackExchange.Redis;

DotNetEnv.Env.Load();

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

    var builder = WebApplication.CreateBuilder(args);

    builder.WebHost.UseKestrel(options =>
    {
        options.AddServerHeader = false; // Disable the server header
    });

    var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
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

    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(
            Environment.GetEnvironmentVariable("DATABASE_URL")
                ?? throw new InvalidOperationException("'DATABASE_URL' not found.")
        )
    );

    // Add Redis connection
    builder.Services.AddSingleton(sp =>
    {
        ConfigurationOptions configuration = new ConfigurationOptions
        {
            EndPoints =
            {
                Environment.GetEnvironmentVariable("REDIS_ENDPOINT")
                    ?? throw new InvalidOperationException("'REDIS_ENDPOINT' not found."),
            },
            User =
                Environment.GetEnvironmentVariable("REDIS_USER")
                ?? throw new InvalidOperationException("'REDIS_USER' not found."),
            Password =
                Environment.GetEnvironmentVariable("REDIS_PASSWORD")
                ?? throw new InvalidOperationException("'REDIS_PASSWORD' not found."),
            Ssl = true,
            SslProtocols = System.Security.Authentication.SslProtocols.Tls12,
        };

        configuration.AbortOnConnectFail = false;

        ConnectionMultiplexer redis = ConnectionMultiplexer.Connect(configuration);

        return redis;
    });
    builder.Services.AddScoped<RedisService>();

    builder.Services.AddOptions();
    builder.Services.AddHttpClient<ResendClient>();
    builder.Services.Configure<ResendClientOptions>(o =>
    {
        o.ApiToken =
            Environment.GetEnvironmentVariable("RESEND_APITOKEN")
            ?? throw new InvalidOperationException("'RESEND_APITOKEN' is not configured.");
    });
    builder.Services.AddTransient<IResend, ResendClient>();

    builder
        .Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
        {
            options.Password.RequiredLength = 8;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireDigit = false;
            options.Password.RequireLowercase = false;
            options.Password.RequireUppercase = false;

            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;

            options.User.RequireUniqueEmail = true; // Make sure emails are unique
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

    builder
        .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(
            JwtBearerDefaults.AuthenticationScheme,
            options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateAudience = true,
                    ValidAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
                    ValidateIssuer = true,
                    ValidIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER"),
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            Environment.GetEnvironmentVariable("JWT_KEY")
                                ?? throw new InvalidOperationException(
                                    "'JWT_KEY' is not configured."
                                )
                        )
                    ),
                    ValidateLifetime = true,
                };
            }
        );

    builder.Services.AddControllers();

    // OpenAPI and Swagger UI
    builder.Services.AddOpenApi(options =>
    {
        options.AddDocumentTransformer(
            (document, context, cancellationToken) =>
            {
                document.Info = new() { Title = "Relic API", Version = "1.0.0" };
                return Task.CompletedTask;
            }
        );
    });
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    // Add Serilog to the service collection
    builder.Host.UseSerilog();

    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
        app.UseForwardedHeaders();

        app.MapOpenApi();
        app.UseSwaggerUI(c =>
        {
            c.DocumentTitle = "Relic API";
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

    app.UseAuthentication();
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
