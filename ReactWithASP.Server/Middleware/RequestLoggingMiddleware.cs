using System.Diagnostics;

namespace ReactWithASP.Server.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(
            RequestDelegate next,
            ILogger<RequestLoggingMiddleware> logger
        )
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var sw = Stopwatch.StartNew();

            try
            {
                await _next(context);
                sw.Stop();

                var statusCode = context.Response.StatusCode;
                var method = context.Request.Method;
                var path = context.Request.Path;

                if (statusCode >= 400)
                {
                    _logger.LogWarning(
                        "{Method} {Path} {StatusCode} in {ElapsedMs}ms",
                        method,
                        path,
                        statusCode,
                        sw.ElapsedMilliseconds
                    );
                }
                else if (statusCode >= 500)
                {
                    _logger.LogError(
                        "{Method} {Path} {StatusCode} in {ElapsedMs}ms",
                        method,
                        path,
                        statusCode,
                        sw.ElapsedMilliseconds
                    );
                }
                else
                {
                    _logger.LogInformation(
                        "{Method} {Path} {StatusCode} in {ElapsedMs}ms",
                        method,
                        path,
                        statusCode,
                        sw.ElapsedMilliseconds
                    );
                }
            }
            catch (Exception)
            {
                sw.Stop();
                throw;
            }
        }
    }

    // Extension method to make it easier to use the middleware
    public static class RequestLoggingMiddlewareExtensions
    {
        public static IApplicationBuilder UseRequestLogging(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<RequestLoggingMiddleware>();
        }
    }
}
