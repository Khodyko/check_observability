package demo.auth.controller;

import demo.loadtest.dto.TestResponse;
import demo.loadtest.service.TestService;
import demo.auth.service.TokenService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Единственный защищённый endpoint для демо Bearer-аутентификации.
 */
@RestController
@RequestMapping("/api")
public class SecureController {

    private final TokenService tokenService;
    private final TestService testService;

    /**
     * @param tokenService сервис проверки токенов
     * @param testService  сервис бизнес-логики
     */
    public SecureController(TokenService tokenService, TestService testService) {
        this.tokenService = tokenService;
        this.testService = testService;
    }

    /**
     * Возвращает данные только при валидном Bearer-токене.
     *
     * @param authorization заголовок Authorization
     * @return 200 с телом ответа или 401 без токена
     */
    @GetMapping("/secure")
    public ResponseEntity<TestResponse> getSecure(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        if (!tokenService.isValidBearerToken(authorization)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(testService.getFastResponse());
    }
}
