# Demo: k6 + Spring Boot + Prometheus

Второй пример observability-стенда. **Автономен** от [`lab/`](../lab/) — свой Prometheus и Grafana.

Референсы:
- Backend: [EvgeniErmakov/k6-test-me](https://github.com/EvgeniErmakov/k6-test-me)
- k6-скрипты: [EvgeniErmakov/k6](https://github.com/EvgeniErmakov/k6)

## Архитектура

**k6-test-app** и **k6** — только на хосте. В Docker — Prometheus и Grafana.

```text
[хост]  k6-test-app :8080  ←── k6 (нагрузка + push)
[Docker] Prometheus :9091  ──scrape──► host:8080/actuator/prometheus
[Docker] Grafana :3000
```

| Источник | Модель | Куда |
|----------|--------|------|
| Spring Boot | **Scrape** | `GET /actuator/prometheus` |
| k6 | **Push** (remote write) | `POST /api/v1/write` |

## Быстрый старт

### 1. Observability в Docker

```bash
cd demo
docker compose up -d
```

| Сервис | URL |
|--------|-----|
| Prometheus | http://localhost:9091 |
| Grafana | http://localhost:3000 (admin / admin) |

### 2. k6-test-app на хосте (Maven)

Требуется **Java 25**. Maven wrapper в каталоге (`mvnw`).

```bash
cd demo/app
./mvnw spring-boot:run
# или: bash mvnw spring-boot:run
```

Проверка: http://localhost:8080/actuator/health

### 3. k6 на хосте

```bash
cd demo/k6
cp .env.example .env   # опционально
export LOAD_HOST='localhost:8080'
export TESTID='all-endpoints-200'
export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write

k6 run -o experimental-prometheus-rw \
  tests/test_me_all_endpoints_200/test_me_all_endpoints_200-1.js
```

Подробнее: [k6/README.md](k6/README.md)

### 4. Проверка

1. Prometheus → **Status → Targets** — `k6-test-app` **UP** (scrape `host.docker.internal:8080`)
2. PromQL: `up{job="k6-test-app"}` → `1`
3. Grafana → дашборд **k6 + Spring Boot (demo)**, переменная `$testid`
4. PromQL-шпаргалка: [promql-graphs.md](promql-graphs.md)

## Структура

```text
demo/
├── docker-compose.yml           # только prometheus + grafana
├── prometheus/prometheus.yml    # scrape → host.docker.internal:8080
├── grafana/
├── app/                         # k6-test-app: ./mvnw spring-boot:run
└── k6/tests/                    # k6 на хосте
```

## Остановка

```bash
# Ctrl+C — spring-boot:run
cd demo
docker compose down
docker compose down -v   # с удалением данных
```
