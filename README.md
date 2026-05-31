# Observability — материалы лекции

Репозиторий для доклада **Observability** (~2 ч): Prometheus, Spring Boot, алерты, k6 (в конце), практикум на стенде.

## Структура

| Путь | Назначение |
|------|------------|
| [docs/talk-speech-full.md](docs/talk-speech-full.md) | Полный спич лекции (~2 ч): push/scrape, типы метрик, PromQL, алерты |
| [docs/1860_rev45.json](docs/1860_rev45.json) | Экспорт дашборда Grafana (Node Exporter Full) |
| [lab/](lab/) | Учебный стенд (пример 1): Prometheus, Alertmanager, Node Exporter |
| [demo/](demo/) | Пример 2: k6 + Spring Boot + Prometheus (scrape + push) + Grafana |

### Оглавление спича

Блоки в [talk-speech-full.md](docs/talk-speech-full.md):

| Блок | Тема | Якорь |
|------|------|-------|
| 0 | Вступление (MELT, RED) | [#блок-0-вступление](docs/talk-speech-full.md#блок-0-вступление) |
| 1 | Push и scrape, exporters | [#блок-1-push-и-scrape](docs/talk-speech-full.md#блок-1-push-и-scrape) |
| 2 | Типы метрик (counter, gauge, histogram) | [#блок-2-типы-метрик](docs/talk-speech-full.md#блок-2-типы-метрик) |
| 3 | PromQL: selectors и matchers | [#блок-3-promql-basics](docs/talk-speech-full.md#блок-3-promql-basics) |
| 4 | PromQL: binary и aggregation operators | [#блок-4-promql-operators](docs/talk-speech-full.md#блок-4-promql-operators) |
| 6 | Алерты + Telegram | [#блок-6-алерты](docs/talk-speech-full.md#блок-6-алерты) |

## Быстрый старт

### Пример 1 — lab

```bash
cd lab
docker compose up -d --build
```

Подробности — [lab/README.md](lab/README.md). Стенд поднимается целиком; **live алертов — блок 6** ([спич](docs/talk-speech-full.md#блок-6-алерты), runbook в том же файле).

### Пример 2 — demo (k6 + Spring Boot)

**k6-test-app и k6 на хосте**, Prometheus + Grafana в Docker:

```bash
cd demo && docker compose up -d
cd demo/app && ./mvnw spring-boot:run   # отдельный терминал
```

См. [demo/README.md](demo/README.md).

## Важно

- На лекции 1 **не исправляйте** намеренные дефекты в `order-service` (профиль `broken`) — сервис планируется в фазе 2 lab; список дефектов — в [спиче, блок 6](docs/talk-speech-full.md#блок-6-алерты).
- Следующая лекция («высокая нагрузка») — отдельный курс; стенд с firing alerts понадобится снова.
