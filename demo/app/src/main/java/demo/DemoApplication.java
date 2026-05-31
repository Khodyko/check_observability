package demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Точка входа демо-приложения для нагрузочного тестирования k6.
 */
@SpringBootApplication
public class DemoApplication {

    /**
     * Запускает Spring Boot приложение.
     *
     * @param args аргументы командной строки
     */
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
