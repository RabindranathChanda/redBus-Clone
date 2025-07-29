using System.Net.Mail;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using redBus_api.Data;
using Microsoft.IdentityModel.Tokens;

namespace redBus_api.ServiceClasses
{
    public class OtpService
    {
        private readonly string _secret = "SuperSecretKeyForHMAC";
        //private readonly IConfiguration _configuration;

        public string GenerateOtpToken(string otp)
        {
            var expiry = DateTime.UtcNow.AddMinutes(5).ToString("o");

            // Hash the OTP using SHA256 (one-way, cannot decrypt)
            var otpHash = ComputeSha256Hash(otp);

            // Sign the hash + expiry
            var signature = Sign($"{otpHash}|{expiry}");

            // Final token (NO raw OTP here)
            return $"{otpHash}|{expiry}|{signature}";
        }

        public bool VerifyOtpToken(string userOtp, string token)
        {
            var parts = token.Split('|');
            if (parts.Length != 3) return false;

            var otpHash = parts[0];
            var expiry = parts[1];
            var signature = parts[2];

            // Recompute signature using received OTP
            var userOtpHash = ComputeSha256Hash(userOtp);
            var expectedSignature = Sign($"{userOtpHash}|{expiry}");

            // Validate signature and expiry
            if (expectedSignature != signature) return false;

            return DateTime.UtcNow <= DateTime.Parse(expiry);
        }

        private string ComputeSha256Hash(string raw)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(raw));
            return Convert.ToBase64String(bytes);
        }


        private string Sign(string data)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_secret));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));            
            return Convert.ToBase64String(hash);
        }


    }
}
