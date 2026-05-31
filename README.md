# Observability — материалы лекции 1

Репозиторий для доклада **Observability** (~2 ч): Prometheus, Spring Boot, алерты, k6 (в конце), практикум на стенде.

## Структура

| Путь | Назначение |
|------|------------|
| [docs/ai-narrative-requirements.md](docs/ai-narrative-requirements.md) | Требования к повествованию для ИИ |
| [docs/talk-outline-observability.md](docs/talk-outline-observability.md) | Конспект лекции (~2 ч) |
| [docs/talk-speech-block-1-push-scrape.md](docs/talk-speech-block-1-push-scrape.md) | Спич — push, scrape, exporters |
| [docs/talk-speech-block-2-metric-types.md](docs/talk-speech-block-2-metric-types.md) | Спич — типы метрик (counter, gauge, histogram) |
| [docs/talk-speech-block-1-alerts.md](docs/talk-speech-block-1-alerts.md) | Спич — алерты + Telegram (блок 6) |
| [docs/practical-scenarios.md](docs/practical-scenarios.md) | Практика на стенде (сценарии 1, 6, …) |
| [docs/ideas-from-video-prometheus-spring.md](docs/ideas-from-video-prometheus-spring.md) | Идеи из видео (Prometheus + Spring + Grafana) для доклада |
| [lab/](lab/) | Учебный стенд (пример 1): Prometheus, Alertmanager, Node Exporter |
| [demo/](demo/) | Пример 2: k6 + Spring Boot + Prometheus (scrape + push) + Grafana |

## Быстрый старт

```bash
cd lab
docker compose up -d --build
```

Далее — [docs/practical-scenarios.md](docs/practical-scenarios.md) и [lab/README.md](lab/README.md). Стенд поднимается целиком; **live алертов — блок 6** (Сценарий 6).

Пример 2 — **k6-test-app и k6 на хосте**, Prometheus + Grafana в Docker:

```bash
cd demo && docker compose up -d
cd demo/app && ./mvnw spring-boot:run   # отдельный терминал
```

См. [demo/README.md](demo/README.md).

## Важно

- На этой лекции **не исправляйте** намеренные дефекты в `order-service` (профиль `broken`).
- Следующая лекция («высокая нагрузка») — отдельный курс; стенд с firing alerts понадобится снова.
