package demo.loadtest.service;

import demo.loadtest.dto.TestResponse;
import org.springframework.stereotype.Service;

/**
 * Сервис с контролируемой задержкой ответа для демо k6.
 */
@Service
public class TestService {

    private static final long SLOW_3_SECONDS_MS = 3_000L;
    private static final long SLOW_10_SECONDS_MS = 10_000L;

    /**
     * @return мгновенный успешный ответ
     */
    public TestResponse getFastResponse() {
        return new TestResponse("ok", "Response for testing purposes");
    }

    /**
     * @return ответ с задержкой 3 секунды
     */
    public TestResponse getSlow3SecResponse() {
        sleep(SLOW_3_SECONDS_MS);
        return new TestResponse("ok", "Response for testing purposes");
    }

    /**
     * @return ответ с задержкой 10 секунд
     */
    public TestResponse getSlow10SecResponse() {
        sleep(SLOW_10_SECONDS_MS);
        return new TestResponse("ok", "Response for testing purposes");
    }

    /**
     * Выполняет паузу текущего потока.
     *
     * @param millis длительность паузы в миллисекундах
     */
    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }
}
