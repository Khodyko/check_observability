package demo.loadtest.dto;

/**
 * DTO ответа REST API.
 */
public class TestResponse {

    private String status;
    private String message;

    /**
     * Конструктор по умолчанию для сериализации JSON.
     */
    public TestResponse() {
    }

    /**
     * Создаёт ответ с заданным статусом и сообщением.
     *
     * @param status  код статуса в теле ответа
     * @param message текст сообщения
     */
    public TestResponse(String status, String message) {
        this.status = status;
        this.message = message;
    }

    /**
     * @return статус в теле ответа
     */
    public String getStatus() {
        return status;
    }

    /**
     * @param status статус в теле ответа
     */
    public void setStatus(String status) {
        this.status = status;
    }

    /**
     * @return текст сообщения
     */
    public String getMessage() {
        return message;
    }

    /**
     * @param message текст сообщения
     */
    public void setMessage(String message) {
        this.message = message;
    }
}
