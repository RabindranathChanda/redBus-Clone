
using System.Text.Json;

namespace redBus_api.ServiceClasses
{
    public class GoogleCaptchaService : IGoogleCaptchaService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public GoogleCaptchaService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<bool> VerifyCaptchaAsync(string captchaToken)
        {
            var secretKey = _configuration["reCaptchaSettings:SecretKey"];
            var response = await _httpClient.PostAsync($"https://www.google.com/recaptcha/api/siteverify?secret={secretKey}&response={captchaToken}",
                null
                );

            if (!response.IsSuccessStatusCode)
                return false;

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<CaptchaResponse>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return result != null && result.Success && result.Score >= 0.5;
        }

        private class CaptchaResponse
        {
            public bool Success { get; set; }
            public float Score { get; set; }
            public string? Action { get; set; }

            public DateTime Challenge_ts { get; set; }
            public string? Hostname { get; set; }
            public List<string>? ErrorCodes { get; set; }

        }
    }
}
