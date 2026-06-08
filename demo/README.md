# Demo: k6 + Spring Boot + Prometheus

Второй пример observability-стенда. **Автономен** от [`lab/`](../lab/) — свой Prometheus и Grafana.

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

Команды ниже — из каталога `demo/` (где лежит этот README).

### 1. Observability в Docker

```bash
docker compose up -d
```

| Сервис | URL |
|--------|-----|
| Prometheus | http://localhost:9091 |
| Grafana | http://localhost:3000 (admin / admin) |

### 2. k6-test-app на хосте (Maven)

Требуется **Java 25**. Maven wrapper — в подкаталоге `app/`.

```bash
cd app
./mvnw spring-boot:run
# или: bash mvnw spring-boot:run
```

Проверка: http://localhost:8080/actuator/health  
Метрики (вручную в браузере): http://localhost:8080/actuator/prometheus

### 3. Первый прогон

Практика идёт **по порядку**: от минимального скрипта до тегов и групп.

```bash
cd k6/tests
export LOAD_HOST='localhost:8080'
export TESTID='simple'
export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write

k6 run -o experimental-prometheus-rw simple.js
```

**Важно:** k6 запускается **из каталога, где лежит скрипт** — команда только по имени файла (`simple.js`, `auth-demo.js`, …).

---

## k6 — практикум

Скрипты в `k6/tests/`. Целевое приложение — API [k6-test-me](https://github.com/EvgeniErmakov/k6-test-me) (аналог в `app/`).

### Переменные окружения

Общие для всех прогонов:

| Переменная | Значение | Назначение |
|------------|----------|------------|
| `LOAD_HOST` | `localhost:8080` | хост SUT |
| `K6_PROMETHEUS_RW_SERVER_URL` | `http://localhost:9091/api/v1/write` | push метрик k6 → Prometheus |
| `TESTID` | см. разделы ниже | label для фильтра в Grafana/PromQL |
| `SOAK_HOLD_DURATION` | `30m` (только soak) | длительность плато soak |
| `AUTH_USER` / `AUTH_PASS` | `demo` / `demo` (только auth) | учётные данные для логина |

```bash
cd k6
cp .env.example .env
source .env
```

### Запуск из терминала

Команды ниже — из каталога `demo/`. Для каждого скрипта: `cd` в его каталог, затем `k6 run` по имени файла.

**1. simple.js**

```bash
export LOAD_HOST='localhost:8080'
export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write
export TESTID='simple'

cd k6/tests
k6 run -o experimental-prometheus-rw simple.js
```

**2. checks-demo.js**

```bash
export LOAD_HOST='localhost:8080'
export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write
export TESTID='checks'

cd k6/tests/checks
k6 run -o experimental-prometheus-rw checks-demo.js
```

**3. smoke.js**

```bash
export LOAD_HOST='localhost:8080'
export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write
export TESTID='smoke'

cd k6/tests
k6 run -o experimental-prometheus-rw smoke.js
```

**4. load.js**

```bash
export LOAD_HOST='localhost:8080'
export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write
export TESTID='load'

cd k6/tests
k6 run -o experimental-prometheus-rw load.js
```

**5. spike.js**

```bash
export LOAD_HOST='localhost:8080'
export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write
export TESTID='spike'

cd k6/tests
k6 run -o experimental-prometheus-rw spike.js
```

**6. stress.js**

```bash
export LOAD_HOST='localhost:8080'
export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write
export TESTID='stress'

cd k6/tests
k6 run -o experimental-prometheus-rw stress.js
```

**7. soak.js** (короткий прогон; по умолчанию hold 30m)

```bash
export LOAD_HOST='localhost:8080'
export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write
export TESTID='soak'
export SOAK_HOLD_DURATION='2m'

cd k6/tests
k6 run -o experimental-prometheus-rw soak.js
```

**8. auth-demo.js**

```bash
export LOAD_HOST='localhost:8080'
export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write
export TESTID='auth-demo'
export AUTH_USER='demo'
export AUTH_PASS='demo'

cd k6/tests/auth
k6 run -o experimental-prometheus-rw auth-demo.js
```

**9. custom-metric-demo.js**

```bash
export LOAD_HOST='localhost:8080'
export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write
export TESTID='custom-metric'

cd k6/tests/custom-metric
k6 run -o experimental-prometheus-rw custom-metric-demo.js
```

**10. tag.js**

```bash
export LOAD_HOST='localhost:8080'
export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write
export TESTID='tag'

cd k6/tests/tag
k6 run -o experimental-prometheus-rw tag.js
```

**11. group-demo.js**

```bash
export LOAD_HOST='localhost:8080'
export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write
export TESTID='group'

cd k6/tests/group
k6 run -o experimental-prometheus-rw group-demo.js
```

### 1. simple.js — структура скрипта

**Файл:** `k6/tests/simple.js`

Минимальный k6-скрипт без `check` и `thresholds`:

- `import` модулей k6
- `export const options` — VU, duration, `tags.testid`
- `export default function()` — HTTP-запрос + `sleep`

Команда запуска — **п. 1** в разделе [Запуск из терминала](#запуск-из-терминала).

**Что смотреть в консоли:** summary — `http_reqs`, `http_req_duration`, `iteration_duration`.

### 2. checks & thresholds

**Файл:** `k6/tests/checks/checks-demo.js`

- `check(res, { ... })` — булевы проверки → метрика `checks` (pass/fail)
- `thresholds` в `options` — критерии pass/fail **всего прогона** (exit code 0 / non-zero)

```javascript
thresholds: {
  http_req_duration: ['p(95)<1000'],
  checks: ['rate>0.99'],
}
```

Команда запуска — **п. 2** в разделе [Запуск из терминала](#запуск-из-терминала).

**Что смотреть в консоли:**

- Строки `✓` / `✗` рядом с именами check'ов
- В summary: `checks.........................: 100.00% ✓` и результат thresholds

### 3. Виды нагрузки

Все скрипты пушат метрики в Prometheus (`-o experimental-prometheus-rw`).

#### Smoke — «жив ли сервис»

**Файл:** `k6/tests/smoke.js` | **TESTID:** `smoke` | **~10s**

- 2 VU, 10s, `GET /api/fast?mode=1`
- Без thresholds — быстрая проверка доступности

Команда запуска — **п. 3** в разделе [Запуск из терминала](#запуск-из-терминала).

#### Load — ожидаемая нагрузка

**Файл:** `k6/tests/load.js` | **TESTID:** `load` | **~6.5 min**

- stages: 0→20 VU за 1m, hold 5m, ramp-down 30s
- `POST /api/fast`, checks + thresholds (`p(95)<5000`, `checks>0.95`)

Команда запуска — **п. 4** в разделе [Запуск из терминала](#запуск-из-терминала).

#### Spike — резкий скачок

**Файл:** `k6/tests/spike.js` | **TESTID:** `spike` | **~3 min**

- 5 VU → 50 за 10s → hold → 5 VU
- threshold: `http_req_failed: rate<0.10`

Команда запуска — **п. 5** в разделе [Запуск из терминала](#запуск-из-терминала).

#### Stress — выше нормы

**Файл:** `k6/tests/stress.js` | **TESTID:** `stress` | **~6 min**

- Ступени 10→60 VU, по 1m каждая
- threshold: `http_req_duration p(95)<15000`

Команда запуска — **п. 6** в разделе [Запуск из терминала](#запуск-из-терминала).

#### Soak — долгая умеренная нагрузка

**Файл:** `k6/tests/soak.js` | **TESTID:** `soak` | **~33 min (дефолт)**

- hold 15 VU, `SOAK_HOLD_DURATION=30m` (на лекции **не запускаем**)
- Для короткого прогона в команде уже задано `SOAK_HOLD_DURATION=2m` (**п. 7**)

### 4. Аутентификация

**Файл:** `k6/tests/auth/auth-demo.js`

- `setup()` — логин **один раз** на прогон → `accessToken`
- `default()` — запрос с Bearer → 200; без токена → 401
- Helper: `k6/tests/auth/auth.js` (`login()`, `getAuthHeaders()`)

Команда запуска — **п. 8** в разделе [Запуск из терминала](#запуск-из-терминала).

### 5. Кастомные метрики

**Файл:** `k6/tests/custom-metric/custom-metric-demo.js`

- `Counter('my_counter')` → в Prometheus: `k6_my_counter{testid="custom-metric"}`
- Каждая итерация: HTTP + `myCounter.add(1)`

PromQL:

```promql
k6_my_counter{testid="custom-metric"}
```

Команда запуска — **п. 9** в разделе [Запуск из терминала](#запуск-из-терминала).

### 6. Теги и группы

#### Теги на запросах

**Файл:** `k6/tests/tag/tag.js` | **TESTID:** `tag`

- Тег `speed: fast` / `speed: slow` на HTTP-запросах
- Thresholds по тегам: `http_req_duration{speed:'fast'}`, `checks{speed:'fast'}`

Команда запуска — **п. 10** в разделе [Запуск из терминала](#запуск-из-терминала).

#### Группы

**Файл:** `k6/tests/group/group-demo.js` | **TESTID:** `group`

- `group('fast', ...)` / `group('slow', ...)` — логические блоки
- Метрика `group_duration{group:::fast}` с отдельными thresholds

Команда запуска — **п. 11** в разделе [Запуск из терминала](#запуск-из-терминала).

---

## Проверка observability

После (или **во время**) прогона k6:

1. **Prometheus** — http://localhost:9091  
   **Status → Targets** → `k6-test-app` = **UP** (`host.docker.internal:8080` — хост, где `spring-boot:run`).  
   **Graph** → диапазон **Last 5 minutes** (для коротких прогонов) → вставьте запрос → **Execute** → вкладка **Graph**.

2. Подставьте свой `TESTID` из `export TESTID=...` вместо `<TESTID>`:

```promql
# scrape Spring — должно быть 1
up{job="k6-test-app"}

# k6 push — есть ли данные по прогону
count by (testid) (k6_http_reqs_total)

# Virtual Users
k6_vus{testid="<TESTID>"}

# RPS: клиент (k6) и сервер (Spring)
sum(rate(k6_http_reqs_total{testid="<TESTID>"}[1m]))
sum(rate(http_server_requests_seconds_count{job="k6-test-app"}[1m]))

# Latency: клиент p99 и сервер p95
k6_http_req_duration_p99{testid="<TESTID>"}
histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket{job="k6-test-app"}[1m])) by (le))

# Error rate: k6 failed и Spring 5xx
k6_http_req_failed_rate{testid="<TESTID>"}
sum(rate(http_server_requests_seconds_count{job="k6-test-app", status=~"5.."}[1m]))
/ clamp_min(sum(rate(http_server_requests_seconds_count{job="k6-test-app"}[1m])), 0.001)
```

График пустой — k6 ещё не пушил или неверный `<TESTID>`. **Status → TSDB Status** → **Number of Series** должен расти после прогона.

3. **Grafana** — http://localhost:3000 (admin / admin) → дашборд **k6 + Spring Boot (demo)** → `$testid` = тот же `<TESTID>`.

Подробнее: [promql-graphs.md](promql-graphs.md)

## Структура

```text
./
├── docker-compose.yml           # только prometheus + grafana
├── prometheus/prometheus.yml    # scrape хоста :8080 (из контейнера — host.docker.internal)
├── grafana/
├── app/                         # k6-test-app: cd app && ./mvnw spring-boot:run
└── k6/
    ├── jsconfig.json
    ├── .env.example
    └── tests/
        ├── common.js
        ├── simple.js
        ├── checks/checks-demo.js
        ├── smoke.js, load.js, stress.js, spike.js, soak.js
        ├── auth/ (auth.js, auth-demo.js)
        ├── custom-metric/custom-metric-demo.js
        ├── tag/tag.js
        ├── group/group-demo.js
        └── test_me_all_endpoints_*/   # legacy
```

### Legacy-скрипты

| Скрипт | Назначение |
|--------|------------|
| `test_me_all_endpoints_200/*` | все endpoint'ы, ramp 1→15 VU |
| `test_me_all_endpoints_with_errors/*` | GET `mode=2/3` для демо error rate |

**test_me_all_endpoints_200-1.js**

```bash
export LOAD_HOST='localhost:8080'
export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write
export TESTID='all-endpoints-200'

cd k6/tests/test_me_all_endpoints_200
k6 run -o experimental-prometheus-rw test_me_all_endpoints_200-1.js
```

**test_me_all_endpoints_with_errors-1.js**

```bash
export LOAD_HOST='localhost:8080'
export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write
export TESTID='with-errors'

cd k6/tests/test_me_all_endpoints_with_errors
k6 run -o experimental-prometheus-rw test_me_all_endpoints_with_errors-1.js
```

### Отличие от референса

| Референс (ES) | Наш demo (Prometheus) |
|---------------|----------------------|
| `-o output-elasticsearch` | `-o experimental-prometheus-rw` |
| `K6_ELASTICSEARCH_URL` | `K6_PROMETHEUS_RW_SERVER_URL` |
| xk6 build | обычный k6 |

## Остановка

```bash
# Ctrl+C — spring-boot:run (терминал в app/)
docker compose down
docker compose down -v   # с удалением данных
```
