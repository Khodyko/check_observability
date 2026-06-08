package demo.auth.dto;

/**
 * DTO запроса на аутентификацию.
 */
public class LoginRequest {

    private String username;
    private String password;

    /**
     * Конструктор по умолчанию для десериализации JSON.
     */
    public LoginRequest() {
    }

    /**
     * @return имя пользователя
     */
    public String getUsername() {
        return username;
    }

    /**
     * @param username имя пользователя
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * @return пароль
     */
    public String getPassword() {
        return password;
    }

    /**
     * @param password пароль
     */
    public void setPassword(String password) {
        this.password = password;
    }
}
