package demo.auth.controller;

import demo.auth.dto.LoginRequest;
import demo.auth.dto.LoginResponse;
import demo.auth.service.TokenService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST API для демо-аутентификации (выдача Bearer-токена).
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final TokenService tokenService;

    /**
     * @param tokenService сервис управления токенами
     */
    public AuthController(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    /**
     * Аутентифицирует пользователя и возвращает access token.
     *
     * @param request логин и пароль
     * @return access token
     */
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        String token = tokenService.issueToken(request.getUsername(), request.getPassword());
        return new LoginResponse(token);
    }
}
