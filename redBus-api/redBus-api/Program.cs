using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using redBus_api.Data;
using redBus_api.Mappings;
using redBus_api.ServiceClasses;
using System.Text;


var builder = WebApplication.CreateBuilder(args);


// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddAutoMapper(typeof(Mapping));

// Swagger and other services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Set up database context
builder.Services.AddDbContext<redBusDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DBConnection")));


// Add Jwt Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
    {

        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"])),
            ClockSkew = TimeSpan.Zero
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Cookies["AccessToken"];
                if (!string.IsNullOrEmpty(accessToken))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();

// Config For CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder => builder.WithOrigins("http://localhost:4200", "https://localhost", "https://redbus-frontend", "http://redbus-frontend").AllowCredentials().AllowAnyMethod().AllowAnyHeader());


});

builder.Services.AddSingleton<ResetTokenBlacklistStore>();
builder.Services.AddHostedService<ExpiredResetTokenCleaningService>();
builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddHttpClient<IGoogleCaptchaService, GoogleCaptchaService>();
builder.Services.AddScoped<redBus_api.ServiceClasses.IAuthenticationService, redBus_api.ServiceClasses.AuthenticationService>();


var app = builder.Build();

// --- Auto-migrate the database on startup ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<redBusDBContext>();
        context.Database.Migrate(); // This will create DB if it doesn't exist and apply migrations
        Console.WriteLine("Database migration applied successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine("Error applying database migrations: " + ex.Message);
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
