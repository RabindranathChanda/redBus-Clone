namespace redBus_api.ServiceClasses
{
    public class ExpiredResetTokenCleaningService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public ExpiredResetTokenCleaningService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var blacklistStore = scope.ServiceProvider.GetRequiredService<ResetTokenBlacklistStore>();
                    blacklistStore.CleanupExpiredTokens();
                }

                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken); // Run every 5 mins
            }
        }
    }
}
