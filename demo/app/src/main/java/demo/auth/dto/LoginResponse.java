package demo.auth.dto;

/**
 * DTO ответа с access token после успешного логина.
 */
public class LoginResponse {

    private String accessToken;

    /**
     * Конструктор по умолчанию для сериализации JSON.
     */
    public LoginResponse() {
    }

    /**
     * Создаёт ответ с access token.
     *
     * @param accessToken выданный токен доступа
     */
    public LoginResponse(String accessToken) {
        this.accessToken = accessToken;
    }

    /**
     * @return access token
     */
    public String getAccessToken() {
        return accessToken;
    }

    /**
     * @param accessToken access token
     */
    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
}
