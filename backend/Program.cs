using davemins.Services;

var builder = WebApplication.CreateBuilder(args);
var contentRoot = Path.Combine(builder.Environment.ContentRootPath, "content");

builder.Services.AddControllers();
builder.Services.AddSingleton(new WhoService(contentRoot));
builder.Services.AddSingleton(new WhatService(contentRoot));
builder.Services.AddSingleton(new HowService(contentRoot));
builder.Services.AddSingleton<ContactService>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run();
