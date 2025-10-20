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
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var blacklistStore = scope.ServiceProvider.GetRequiredService<ResetTokenBlacklistStore>();
                        blacklistStore.CleanupExpiredTokens();
                    }

                    // Delay with cancellation support
                    await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    // This happens when the host is shutting down
                    // Safe to ignore
                }
                catch (Exception ex)
                {
                    // Optional: log unexpected errors
                    Console.WriteLine($"Error in ExpiredResetTokenCleaningService: {ex.Message}");
                }
            }
        }
    }
}
