using StackExchange.Redis;

namespace ReactWithASP.Server.Services
{
    public class RedisService
    {
        private readonly ConnectionMultiplexer _redis;
        private readonly IDatabase _db;

        public RedisService(ConnectionMultiplexer redis)
        {
            _redis = redis;
            _db = redis.GetDatabase();
        }

        public async Task<bool> SetStringAsync(string key, string value, TimeSpan? expiry = null)
        {
            return await _db.StringSetAsync(key, value, expiry);
        }

        public async Task<string?> GetStringAsync(string key)
        {
            return await _db.StringGetAsync(key);
        }

        public async Task<bool> DeleteKeyAsync(string key)
        {
            return await _db.KeyDeleteAsync(key);
        }

        public async Task<bool> SetOtpAsync(string token, string otp, TimeSpan expiry)
        {
            // Use key format like "otp:userId"
            return await SetStringAsync($"otp:{token}", otp, expiry);
        }

        public async Task<string?> GetOtpAsync(string token)
        {
            return await GetStringAsync($"otp:{token}");
        }

        public async Task<bool> ValidateOtpAsync(string token, string inputOtp)
        {
            var storedOtp = await GetOtpAsync(token);

            if (string.IsNullOrEmpty(storedOtp))
                return false;

            return storedOtp == inputOtp;
        }

        public async Task<bool> DeleteOtpAsync(string userId)
        {
            return await DeleteKeyAsync($"otp:{userId}");
        }
    }
}
