using davemins.DTOs;

namespace davemins.Services;

public class ContactService(ILogger<ContactService> logger)
{
    // 실제 메일 발송 전까지 로그로 수신 확인
    public ContactResponse Receive(ContactRequest request)
    {
        logger.LogInformation("연락 메시지 수신: {Name} <{Email}>", request.Name, request.Email);
        return new ContactResponse(true, "메시지가 전달되었습니다.");
    }
}
