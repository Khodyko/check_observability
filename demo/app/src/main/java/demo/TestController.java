package demo;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST API для нагрузочного тестирования (аналог k6-test-me).
 */
@RestController
@RequestMapping("/api")
public class TestController {

    private final TestService testService;

    /**
     * @param testService сервис бизнес-логики
     */
    public TestController(TestService testService) {
        this.testService = testService;
    }

    /**
     * @return быстрый POST-ответ
     */
    @PostMapping("/fast")
    public TestResponse postFast() {
        return testService.getFastResponse();
    }

    /**
     * @return POST-ответ с задержкой 3 секунды
     */
    @PostMapping("/slow-3")
    public TestResponse postSlow3() {
        return testService.getSlow3SecResponse();
    }

    /**
     * @return POST-ответ с задержкой 10 секунд
     */
    @PostMapping("/slow-10")
    public TestResponse postSlow10() {
        return testService.getSlow10SecResponse();
    }

    /**
     * GET /api/fast с управляемым HTTP-статусом через параметр mode.
     *
     * @param mode 1 — 200, 2 — 400, 3 — 500, иначе — 400
     * @return ответ с соответствующим HTTP-статусом
     */
    @GetMapping("/fast")
    public ResponseEntity<TestResponse> getFast(@RequestParam int mode) {
        if (mode == 1) {
            return ResponseEntity.ok(testService.getFastResponse());
        }
        if (mode == 2) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new TestResponse("bad_request", "Ошибка 400"));
        }
        if (mode == 3) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new TestResponse("internal_error", "Ошибка 500"));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new TestResponse("bad_request", "mode должен быть 1, 2 или 3"));
    }

    /**
     * @return GET-ответ с задержкой 3 секунды
     */
    @GetMapping("/slow-3")
    public TestResponse getSlow3() {
        return testService.getSlow3SecResponse();
    }

    /**
     * @return GET-ответ с задержкой 10 секунд
     */
    @GetMapping("/slow-10")
    public TestResponse getSlow10() {
        return testService.getSlow10SecResponse();
    }
}
