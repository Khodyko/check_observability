package demo.auth.service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * In-memory хранилище и проверка Bearer-токенов для демо-аутентификации.
 */
@Service
public class TokenService {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final String DEMO_USERNAME = "demo";
    private static final String DEMO_PASSWORD = "demo";

    private final Map<String, String> tokens = new ConcurrentHashMap<>();

    /**
     * Проверяет учётные данные и выдаёт новый access token.
     *
     * @param username имя пользователя
     * @param password пароль
     * @return access token
     */
    public String issueToken(String username, String password) {
        if (!DEMO_USERNAME.equals(username) || !DEMO_PASSWORD.equals(password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Неверные учётные данные");
        }
        String token = UUID.randomUUID().toString();
        tokens.put(token, username);
        return token;
    }

    /**
     * Проверяет заголовок Authorization с Bearer-токеном.
     *
     * @param authorization значение заголовка Authorization
     * @return true, если токен валиден
     */
    public boolean isValidBearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith(BEARER_PREFIX)) {
            return false;
        }
        String token = authorization.substring(BEARER_PREFIX.length()).trim();
        return tokens.containsKey(token);
    }
}
