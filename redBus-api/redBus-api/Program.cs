using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using redBus_api.Data;
using redBus_api.Mappings;
using redBus_api.ServiceClasses;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

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
builder.Services.AddAuthentication(options=> {
    options.DefaultAuthenticateScheme= JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme= JwtBearerDefaults.AuthenticationScheme;
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
    options.AddPolicy("AllowAll", builder => builder.WithOrigins("http://localhost:4200").AllowCredentials().AllowAnyMethod().AllowAnyHeader());
    

});

builder.Services.AddSingleton<ResetTokenBlacklistStore>();
builder.Services.AddHostedService<ExpiredResetTokenCleaningService>();

builder.Services.AddHttpClient<IGoogleCaptchaService, GoogleCaptchaService>();

builder.Services.AddScoped<redBus_api.ServiceClasses.IAuthenticationService, redBus_api.ServiceClasses.AuthenticationService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
