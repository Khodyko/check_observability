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
| `SOAK_HOLD_DURATION` | длительность плато soak (дефолт `30m`) |
| `AUTH_USER` / `AUTH_PASS` | учётные данные для `auth/auth-demo.js` (дефолт `demo`/`demo`) |

## Типы нагрузочных проверок

| Тип | Файл | Профиль | На лекции |
|-----|------|---------|-----------|
| **Smoke** | `tests/smoke.js` | 2 VU, 10s, sleep 1s | да |
| **Load** | `tests/load.js` | 0→20 за 1m, hold 5m, sleep 1s | да |
| **Stress** | `tests/stress.js` | ступени 10→60 VU, по 1m, sleep 1s | по времени |
| **Spike** | `tests/spike.js` | 5 → 50 за 10s → 5 VU, sleep 1s | да |
| **Soak** | `tests/soak.js` | hold 15 VU, 30m, sleep 1s | **нет** |
| **Auth** | `tests/auth/auth-demo.js` | 2 VU, 30s, sleep 1s | да (отдельный блок) |

Каждый файл самодостаточен: `options` + HTTP-логика в одном месте (thresholds — где нужны для нагрузочных типов).

## Запуск с push в Prometheus

```bash
export LOAD_HOST='localhost:8080'
export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write

# Smoke (~10s)
export TESTID='smoke'
k6 run -o experimental-prometheus-rw tests/smoke.js

# Load (~6.5 min)
export TESTID='load'
k6 run -o experimental-prometheus-rw tests/load.js

# Spike (~3 min)
export TESTID='spike'
k6 run -o experimental-prometheus-rw tests/spike.js

# Auth demo (~30s) — отдельно от нагрузочных тестов
export TESTID='auth-demo'
k6 run -o experimental-prometheus-rw tests/auth/auth-demo.js

# Soak (30m по умолчанию, на лекции не запускаем)
export TESTID='soak'
export SOAK_HOLD_DURATION=30m
k6 run -o experimental-prometheus-rw tests/soak.js
```

Через Docker (если k6 не установлен на хосте):

```bash
docker run --rm --network host \
  -e LOAD_HOST=localhost:8080 \
  -e TESTID=smoke \
  -e K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write \
  -v "$(pwd):/scripts" grafana/k6:latest run -o experimental-prometheus-rw \
  /scripts/tests/smoke.js
```

## Структура tests/

```text
tests/
├── common.js
├── smoke.js, load.js, stress.js, spike.js, soak.js
├── auth/
│   ├── auth.js        # helper: login(), getAuthHeaders()
│   └── auth-demo.js   # демо Bearer-аутентификации
├── simpleCall/                          # legacy
├── test_me_all_endpoints_200/           # legacy
└── test_me_all_endpoints_with_errors/   # legacy
```

## Legacy-скрипты

| Скрипт | Назначение |
|--------|------------|
| `test_me_all_endpoints_200/*` | все endpoint'ы, ramp 1→15 VU |
| `test_me_all_endpoints_with_errors/*` | GET `mode=2/3` для демо error rate |
| `simpleCall/*` | простой вызов `/api/fast` |

## Отличие от референса

| Референс (ES) | Наш demo (Prometheus) |
|---------------|----------------------|
| `-o output-elasticsearch` | `-o experimental-prometheus-rw` |
| `K6_ELASTICSEARCH_URL` | `K6_PROMETHEUS_RW_SERVER_URL` |
| xk6 build | обычный k6 |
