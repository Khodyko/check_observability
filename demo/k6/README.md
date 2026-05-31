# k6 — запуск тестов

Скрипты перенесены из [EvgeniErmakov/k6](https://github.com/EvgeniErmakov/k6).  
Целевое приложение — [k6-test-me](https://github.com/EvgeniErmakov/k6-test-me) API (аналог в `demo/app/`).

## Требования

- Prometheus + Grafana: `cd demo && docker compose up -d`
- **k6-test-app** на хосте: `cd demo/app && ./mvnw spring-boot:run`
- Установлен **stock k6** (не xk6 + Elasticsearch):

```bash
# Ubuntu/Debian
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | \
  sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

## Переменные окружения

```bash
cp .env.example .env
source .env
```

| Переменная | Назначение |
|------------|------------|
| `LOAD_HOST` | хост SUT (`localhost:8080`) |
| `TESTID` | label для фильтра в Grafana/PromQL |
| `K6_PROMETHEUS_RW_SERVER_URL` | push метрик k6 → Prometheus |

## Запуск с push в Prometheus

```bash
export LOAD_HOST='localhost:8080'
export TESTID='all-endpoints-200'
export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write

k6 run -o experimental-prometheus-rw \
  tests/test_me_all_endpoints_200/test_me_all_endpoints_200-1.js
```

Через Docker (если k6 не установлен на хосте):

```bash
docker run --rm --network host \
  -e LOAD_HOST=localhost:8080 \
  -e TESTID=all-endpoints-200 \
  -e K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write \
  -v "$(pwd):/scripts" grafana/k6:latest run -o experimental-prometheus-rw \
  /scripts/tests/test_me_all_endpoints_200/test_me_all_endpoints_200-1.js
```

Сценарий с ошибками (4xx/5xx):

```bash
export TESTID='with-errors'
k6 run -o experimental-prometheus-rw \
  tests/test_me_all_endpoints_with_errors/test_me_all_endpoints_with_errors-1.js
```

## Структура tests/

| Скрипт | Назначение |
|--------|------------|
| `test_me_all_endpoints_200/*` | все endpoint'ы, ожидаем 200, ramp 1→15 VU |
| `test_me_all_endpoints_with_errors/*` | GET `mode=2/3` для демо error rate |

Паттерн: `*-1.js` — профиль нагрузки, `*.js` — HTTP-логика.

## Отличие от референса

| Референс (ES) | Наш demo (Prometheus) |
|---------------|----------------------|
| `-o output-elasticsearch` | `-o experimental-prometheus-rw` |
| `K6_ELASTICSEARCH_URL` | `K6_PROMETHEUS_RW_SERVER_URL` |
| xk6 build | обычный k6 |
