namespace davemins.DTOs;

public record ContactRequest(string Name, string Email, string Message);

public record ContactResponse(bool Success, string Message);
