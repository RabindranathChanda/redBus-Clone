using System.Collections.Concurrent;

namespace redBus_api.ServiceClasses
{
    public class ResetTokenBlacklistStore
    {
        private readonly ConcurrentDictionary<string, DateTime> _blacklist = new();

        public void BlacklistToken(string token, TimeSpan expiry)
        {
            _blacklist[token] = DateTime.UtcNow.Add(expiry);
        }

        public bool IsTokenBlacklisted(string token)
        {
            return _blacklist.TryGetValue(token, out var expiry) && expiry > DateTime.UtcNow;
        }

        public void CleanupExpiredTokens()
        {
            var now = DateTime.UtcNow;
            foreach (var token in _blacklist.Keys)
            {
                if (_blacklist[token] <= now)
                    _blacklist.TryRemove(token, out _);
            }
        }
    }
}
