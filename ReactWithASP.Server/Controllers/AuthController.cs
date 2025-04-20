using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NRedisStack;
using NRedisStack.RedisStackCommands;
using ReactWithASP.Server.Data;
using ReactWithASP.Server.Models;
using ReactWithASP.Server.Services;
using Resend;

namespace MyApp.Namespace
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ApplicationDbContext _context;
        private readonly RedisService _redisService;
        private readonly IResend _resend;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            ApplicationDbContext context,
            IResend resend,
            RedisService redisService,
            ILogger<AuthController> logger
        )
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
            _redisService = redisService;
            _resend = resend;
            _logger = logger;
        }

        [HttpPost("attempt")]
        public async Task<IActionResult> AttemptSignUp([FromBody] AttemptSignUpModel model)
        {
            if (
                model == null
                || string.IsNullOrEmpty(model.Email)
                || string.IsNullOrEmpty(model.Username)
            )
                return BadRequest(new { Message = "Invalid sign up data." });

            // Check if the user already exists by email or username
            var existingUserByEmail = await _userManager.FindByEmailAsync(model.Email);
            var existingUserByUsername = await _userManager.FindByNameAsync(model.Username);

            if (existingUserByEmail != null || existingUserByUsername != null)
                return Conflict(
                    new
                    {
                        Email = existingUserByEmail != null ? "Unavailable" : "Available",
                        Username = existingUserByUsername != null ? "Unavailable" : "Available",
                    }
                );

            return Ok(new { Message = "Username and email are available." });
        }

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] SignUpModel model)
        {
            if (
                model == null
                || string.IsNullOrEmpty(model.Email)
                || string.IsNullOrEmpty(model.UserName)
                || string.IsNullOrEmpty(model.DisplayName)
                || string.IsNullOrEmpty(model.Password)
            )
                return BadRequest(new { Message = "Invalid sign up data." });

            // Validate username length
            if (model.UserName.Length < 2)
                return BadRequest(new { Message = "Username is too short." });

            if (model.UserName.Length > 30)
                return BadRequest(new { Message = "Username is too long." });

            // Validate username format - must contain letters, numbers, and underscores only
            if (!Regex.IsMatch(model.UserName, @"^[a-zA-Z0-9_]+$"))
                return BadRequest(
                    new { Message = "Username can only contain letters, numbers, and underscores." }
                );

            // Validate username contains at least one letter
            if (!Regex.IsMatch(model.UserName, @".*[a-zA-Z].*"))
                return BadRequest(new { Message = "Username must contain at least one letter." });

            // Validate display name length
            if (model.DisplayName.Length < 2)
                return BadRequest(new { Message = "Display name is too short." });

            // Check if the user already exists by email or username
            var existingUserByEmail = await _userManager.FindByEmailAsync(model.Email);
            var existingUserByUsername = await _userManager.FindByNameAsync(model.UserName);
            if (existingUserByEmail != null || existingUserByUsername != null)
                return BadRequest(new { Message = "User already exists." });

            var user = new ApplicationUser
            {
                Email = model.Email,
                UserName = model.UserName,
                DisplayName = model.DisplayName,
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                try
                {
                    var verifyToken = GenerateVerifyToken(user.NormalizedEmail);
                    var origin =
                        Request.Headers["Origin"].ToString()
                        ?? $"{Request.Scheme}://{Request.Host}";
                    var verifyUrl = $"{origin}/verify?token={verifyToken}";
                    var otp = await GenerateOtp(verifyToken);

                    await sendVerifyEmail(
                        user.Email,
                        user.UserName,
                        otp,
                        verifyUrl,
                        false // isSignIn = false for sign up
                    );

                    return Ok(new { VerifyToken = verifyToken });
                }
                catch (Exception e)
                {
                    // Rollback user creation if email sending fails
                    await _userManager.DeleteAsync(user);
                    _logger.LogError(e, "Failed to send verification email.");
                    return BadRequest(new { Message = e.ToString() });
                }
            }

            return BadRequest(new { Message = result.Errors });
        }

        [HttpPost("signin")]
        public async Task<IActionResult> UserSignIn([FromBody] SignInModel model)
        {
            if (
                model == null
                || string.IsNullOrEmpty(model.Email)
                || string.IsNullOrEmpty(model.Password)
            )
                return BadRequest(new { Message = "Invalid sign in data." });

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
            {
                try
                {
                    var verifyToken = GenerateVerifyToken(user.NormalizedEmail);
                    var origin =
                        Request.Headers["Origin"].ToString()
                        ?? $"{Request.Scheme}://{Request.Host}";
                    var verifyUrl = $"{origin}/verify?token={verifyToken}";
                    var otp = await GenerateOtp(verifyToken);

                    await sendVerifyEmail(
                        user.Email,
                        user.UserName,
                        otp,
                        verifyUrl,
                        true // isSignIn = false for sign up
                    );

                    return Ok(new { VerifyToken = verifyToken });
                }
                catch (Exception e)
                {
                    _logger.LogError(e, "Failed to send verification email.");
                    return BadRequest(new { Message = e.ToString() });
                }
            }
            return Unauthorized();
        }

        [HttpPost("verify")]
        public async Task<IActionResult> VerifyEmail(
            [FromQuery] string token,
            [FromBody] VerifyOtpModel model
        )
        {
            if (string.IsNullOrEmpty(token))
                return Unauthorized(new { Message = "Invalid token." });

            if (model == null || string.IsNullOrEmpty(model.Otp))
                return Unauthorized(new { Message = "Invalid OTP." });

            try
            {
                var isValidOtp = await _redisService.ValidateOtpAsync(token, model.Otp);
                if (!isValidOtp)
                    return Unauthorized(new { Message = "Invalid or expired OTP." });

                var email = DecodeJwtToken(token);
                if (string.IsNullOrEmpty(email))
                    return Unauthorized(new { Message = "Invalid or expired token." });

                var user = await _userManager.FindByEmailAsync(email);
                if (user != null)
                {
                    user.EmailConfirmed = true;
                    await _userManager.UpdateAsync(user);

                    await _redisService.DeleteOtpAsync(token);

                    var accessToken = GenerateAccessToken(user.NormalizedEmail);
                    var refreshToken = GenerateRefreshToken(user.Id);

                    // Store refresh token in DB
                    _context.RefreshTokens.Add(refreshToken);
                    await _context.SaveChangesAsync();

                    Response.Cookies.Append(
                        "accessToken",
                        accessToken,
                        new CookieOptions
                        {
                            HttpOnly = true,
                            Secure = true,
                            SameSite = SameSiteMode.None,
                            Expires = DateTime.UtcNow.AddMinutes(15),
                            // Domain = Environment.GetEnvironmentVariable("COOKIE_DOMAIN"),
                            IsEssential = true,
                        }
                    );
                    Response.Cookies.Append(
                        "refreshToken",
                        refreshToken.Token,
                        new CookieOptions
                        {
                            HttpOnly = true,
                            Secure = true,
                            SameSite = SameSiteMode.None,
                            Expires = refreshToken.ExpiryDate,
                            // Domain = Environment.GetEnvironmentVariable("COOKIE_DOMAIN"),
                            IsEssential = true,
                        }
                    );

                    return Ok(new { Message = "Signed in successfully." });
                }
                return Unauthorized();
            }
            catch (SecurityTokenExpiredException)
            {
                return Unauthorized(new { Message = "Invalid or expired token." });
            }
            catch (Exception e)
            {
                return Unauthorized(new { Message = e.ToString() });
            }
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized("No refresh token provided");

            var storedToken = await _context.RefreshTokens.FirstOrDefaultAsync(t =>
                t.Token == refreshToken && t.ExpiryDate > DateTime.UtcNow
            );

            if (storedToken == null)
                return Unauthorized("Invalid or expired refresh token");

            var user = await _userManager.FindByIdAsync(storedToken.UserId);
            if (user == null)
                return Unauthorized();

            var newAccessToken = GenerateAccessToken(user.NormalizedEmail);
            var newRefreshToken = GenerateRefreshToken(user.Id);

            // Replace old refresh token
            _context.RefreshTokens.Remove(storedToken);
            _context.RefreshTokens.Add(newRefreshToken);
            await _context.SaveChangesAsync();

            Response.Cookies.Append(
                "accessToken",
                newAccessToken,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTime.UtcNow.AddMinutes(15),
                    // Domain = Environment.GetEnvironmentVariable("COOKIE_DOMAIN"),
                    IsEssential = true,
                }
            );
            Response.Cookies.Append(
                "refreshToken",
                newRefreshToken.Token,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = newRefreshToken.ExpiryDate,
                    // Domain = Environment.GetEnvironmentVariable("COOKIE_DOMAIN"),
                    IsEssential = true,
                }
            );

            return Ok(new { Message = "Token refreshed" });
        }

        [HttpPost("signout")]
        public async Task<IActionResult> UserSignOut()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized(new { Message = "No refresh token provided." });

            var storedToken = await _context.RefreshTokens.FirstOrDefaultAsync(t =>
                t.Token == refreshToken && t.ExpiryDate > DateTime.UtcNow
            );

            if (storedToken != null)
            {
                _context.RefreshTokens.Remove(storedToken);
                await _context.SaveChangesAsync();
            }

            Response.Cookies.Delete("accessToken");
            Response.Cookies.Delete("refreshToken");

            return Ok(new { Message = "Signed out successfully." });
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetUserInfo()
        {
            var accessToken = Request.Cookies["accessToken"];
            if (string.IsNullOrEmpty(accessToken))
                return Unauthorized(new { Message = "No access token provided." });

            try
            {
                var email = DecodeJwtToken(accessToken);
                if (string.IsNullOrEmpty(email))
                    return Unauthorized(new { Message = "Invalid or expired token." });

                var user = await _userManager.FindByEmailAsync(email);
                if (user != null)
                    return Ok(
                        new
                        {
                            user.Id,
                            user.UserName,
                            user.DisplayName,
                            user.Email,
                            user.ProfilePictureUrl,
                        }
                    );
            }
            catch (SecurityTokenExpiredException)
            {
                return Unauthorized(new { Message = "Invalid or expired token." });
            }

            return Unauthorized(new { Message = "User not found." });
        }

        private string GenerateVerifyToken(string? normalizedEmail)
        {
            if (string.IsNullOrEmpty(normalizedEmail))
                throw new ArgumentNullException(nameof(normalizedEmail));

            var tokenHandler = new JwtSecurityTokenHandler();

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, normalizedEmail),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var creds = new SigningCredentials(
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_KEY")!)
                ),
                SecurityAlgorithms.HmacSha256
            );

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                NotBefore = DateTime.UtcNow,
                Expires = DateTime.UtcNow.AddMinutes(30), // Verify token lasts 30 minutes
                Issuer = Environment.GetEnvironmentVariable("JWT_ISSUER"),
                Audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
                SigningCredentials = creds,
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        private string GenerateAccessToken(string? normalizedEmail)
        {
            if (string.IsNullOrEmpty(normalizedEmail))
                throw new ArgumentNullException(nameof(normalizedEmail));

            var tokenHandler = new JwtSecurityTokenHandler();

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, normalizedEmail),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var creds = new SigningCredentials(
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_KEY")!)
                ),
                SecurityAlgorithms.HmacSha256
            );

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                NotBefore = DateTime.UtcNow,
                Expires = DateTime.UtcNow.AddMinutes(15), // Access token lasts 15 minutes
                Issuer = Environment.GetEnvironmentVariable("JWT_ISSUER"),
                Audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
                SigningCredentials = creds,
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        private RefreshToken GenerateRefreshToken(string userId)
        {
            return new RefreshToken
            {
                Token = Guid.NewGuid().ToString(),
                ExpiryDate = DateTime.UtcNow.AddDays(7), // Refresh token lasts 7 days
                UserId = userId,
            };
        }

        // Generate 6-digit code OTP
        private async Task<string> GenerateOtp(string verifyToken)
        {
            var otp = new Random().Next(100000, 999999).ToString("D6");
            var expiry = TimeSpan.FromMinutes(30); // OTP expires in 30 minutes

            // Store OTP in Redis with verify token as key
            await _redisService.SetOtpAsync(verifyToken, otp, expiry);

            return otp;
        }

        private string DecodeJwtToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);
            var emailClaim = jwtToken.Claims.FirstOrDefault(c =>
                c.Type == JwtRegisteredClaimNames.Sub
            );
            if (emailClaim == null)
                throw new SecurityTokenExpiredException("Invalid token.");
            return emailClaim?.Value ?? string.Empty;
        }

        private async Task sendVerifyEmail(
            string toEmail,
            string userName,
            string otp,
            string verifyUrl,
            bool isSignIn = true
        )
        {
            var message = new EmailMessage();
            message.From =
                $"Relic <{Environment.GetEnvironmentVariable("SENDER_EMAIL") ?? throw new InvalidOperationException("'SENDER_EMAIL' not found.")}>";
            message.To.Add(toEmail);
            message.Subject = $"{otp} - Relic {(isSignIn ? "Sign-in" : "Sign-up")} Verification";
            message.HtmlBody = $"""
        <body>
            <table
            width="100%"
            border="0"
            cellspacing="0"
            cellpadding="0"
            style="width: 100% !important"
            >
            <tbody>
                <tr>
                <td align="center">
                    <table
                    style="
                        border: 1px solid #e4e4e7;
                        border-radius: 5px;
                        margin: 40px 0;
                    "
                    width="600"
                    border="0"
                    cellspacing="0"
                    cellpadding="40"
                    >
                    <tbody>
                        <tr>
                        <td align="center">
                            <div
                            style="
                                font-family:
                                -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                                Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans',
                                'Helvetica Neue', sans-serif;
                                text-align: left;
                                width: 465px;
                            "
                            >
                            <table
                                width="100%"
                                border="0"
                                cellspacing="0"
                                cellpadding="0"
                                style="width: 100%"
                            >
                                <tbody>
                                <tr>
                                    <td align="center">
                                    <h1
                                        style="
                                        color: rgb(0, 0, 0);
                                        font-family:
                                            -apple-system, BlinkMacSystemFont,
                                            'Segoe UI', Roboto, Oxygen, Ubuntu,
                                            Cantarell, 'Fira Sans', 'Droid Sans',
                                            'Helvetica Neue', sans-serif;
                                        font-size: 24px;
                                        font-weight: normal;
                                        margin: 30px 0px;
                                        padding: 0px;
                                        "
                                    >
                                        Verify your email to {(isSignIn ? "sign in" : "sign up")} to
                                        <strong
                                        style="color: rgb(0, 0, 0); font-weight: bold"
                                        ><span>Relic</span></strong
                                        >
                                    </h1>
                                    </td>
                                </tr>
                                </tbody>
                            </table>

                            <p
                                style="
                                color: rgb(0, 0, 0);
                                font-family:
                                    -apple-system, BlinkMacSystemFont, 'Segoe UI',
                                    Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans',
                                    'Droid Sans', 'Helvetica Neue', sans-serif;
                                font-size: 14px;
                                line-height: 24px;
                                "
                            >
                                Hello
                                <strong style="color: rgb(0, 0, 0); font-weight: bold"
                                >{userName}</strong
                                >,
                            </p>
                            <p
                                style="
                                color: rgb(0, 0, 0);
                                font-family:
                                    -apple-system, BlinkMacSystemFont, 'Segoe UI',
                                    Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans',
                                    'Droid Sans', 'Helvetica Neue', sans-serif;
                                font-size: 14px;
                                line-height: 24px;
                                "
                            >
                                To complete the {(
                    isSignIn ? "sign-in" : "sign-up"
                )} process; enter the 6-digit code
                                in the original window, or enter it in a new one by
                                going to the link below:
                            </p>
                            <br />

                             <div
                                style="
                                font-family:
                                    -apple-system, BlinkMacSystemFont, 'Segoe UI',
                                    Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans',
                                    'Droid Sans', 'Helvetica Neue', sans-serif;
                                display: block;
                                padding: 0.5rem 0;
                                text-align: center;
                                width: 100%;
                                background-color: #f4f4f5;
                                font-size: 1rem;
                                font-weight: bold;
                                "
                            >
                                {otp}
                            </div>
                            <br />

                            <p
                                style="
                                color: rgb(0, 0, 0);
                                font-family:
                                    -apple-system, BlinkMacSystemFont, 'Segoe UI',
                                    Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans',
                                    'Droid Sans', 'Helvetica Neue', sans-serif;
                                font-size: 14px;
                                line-height: 24px;
                                "
                            >
                                <a
                                href="{verifyUrl}"
                                style="color: rgb(6, 125, 247); text-decoration: none"
                                target="_blank"
                                >{verifyUrl}</a
                                >
                            </p>
                            <br />
                            <p
                                style="
                                color: rgb(0, 0, 0);
                                font-family:
                                    -apple-system, BlinkMacSystemFont, 'Segoe UI',
                                    Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans',
                                    'Droid Sans', 'Helvetica Neue', sans-serif;
                                font-size: 14px;
                                line-height: 24px;
                                "
                            >
                                This link and code will only be valid for the next 30
                                minutes.
                            </p>
                            <hr
                                style="
                                border-right: none;
                                border-bottom: none;
                                border-left: none;
                                border-image: initial;
                                border-top: 1px solid rgb(234, 234, 234);
                                margin: 26px 0px;
                                width: 100%;
                                "
                            />
                            <p
                                style="
                                color: rgb(102, 102, 102);
                                font-family:
                                    -apple-system, BlinkMacSystemFont, 'Segoe UI',
                                    Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans',
                                    'Droid Sans', 'Helvetica Neue', sans-serif;
                                font-size: 12px;
                                line-height: 24px;
                                "
                            >
                                If you didn't attempt to {(isSignIn ? "sign in" : "sign up")} but received this
                                email, you can safely ignore this email. Don't share or
                                forward the 6-digit code with anyone.
                            </p>
                            </div>
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </td>
                </tr>
            </tbody>
            </table>
        </body>
        """;

            await _resend.EmailSendAsync(message);
        }
    }
}

public class AttemptSignUpModel
{
    public required string Email { get; set; }
    public required string Username { get; set; }
}

public class VerifyOtpModel
{
    public required string Otp { get; set; }
}

public class SignUpModel
{
    public required string Email { get; set; }
    public required string UserName { get; set; }
    public required string DisplayName { get; set; }
    public required string Password { get; set; }
}

public class SignInModel
{
    public string Email { get; set; }
    public string Password { get; set; }
}
