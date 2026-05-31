# Учебный стенд Observability (лекция 1)

## Фаза 1: Prometheus + Alertmanager + Ubuntu (Node Exporter)

Стенд поднимается **целиком одной командой**: scrape, `alerts.yml`, Alertmanager — всё включено с первого `docker compose up`. **Live-демо алертов** (Pending → Firing) — **блок 6** лекции, не сразу после lab.

| Сервис | URL |
|--------|-----|
| Prometheus | http://localhost:9090 |
| Alertmanager | http://localhost:9093 |
| Node Exporter (метрики хоста) | http://localhost:9100/metrics |

### Быстрый старт

```bash
cd lab
docker compose up -d --build
```

### Проверка после старта (блоки 1–5)

1. `docker compose ps` — три сервиса: `observability-prometheus`, `observability-alertmanager`, `observability-lab-host`.
2. Prometheus → **Status → Targets** — job `lab-host-node` в состоянии **UP**.
3. (Опционально, одной фразой) **Status → Rules** — rules loaded, алерты **Inactive** — «вернёмся на блоке 6».
4. **Graph** — PromQL загрузки CPU:

```promql
100 - (avg(irate(node_cpu_seconds_total{mode="idle",job="lab-host-node"}[30s])) * 100)
```

5. Сценарий 1: `stress-ng` для графика CPU — **без** вкладки Alerts и **без** ожидания Firing.

**Не открываем на ранних блоках:** вкладку **Alerts**, Alertmanager UI, live Pending/Firing.

### Live-дemo алертов + Telegram (блок 6)

Runbook: [docs/practical-scenarios.md](../docs/practical-scenarios.md) — **Сценарий 6**.  
Спич: [docs/talk-speech-block-1-alerts.md](../docs/talk-speech-block-1-alerts.md).

**Подготовка:** `cp .env.example .env` — token и chat_id; бот в группе; `docker compose up -d`.

```bash
docker compose exec lab-host stress-ng --cpu 0 --timeout 120s
```

| # | Где | Что видим |
|---|-----|-----------|
| 1 | Prometheus → **Alerts** | Pending → Firing (~2 мин) |
| 2 | Alertmanager → `:9093/alerts` | Тот же алерт |
| 3 | **Telegram** | Сообщение от бота |
| 4 | `pkill stress-ng` | Resolved в Telegram |

**Типично:** `--cpu 2` даёт ~30–40% — порог 60% не пробить; нужен `--cpu 0`. AM должен быть **Up** (`route.receiver: telegram`).

### Остановка

```bash
docker compose down
```

Данные Prometheus сохраняются в volume `prometheus-data`. Полная очистка:

```bash
docker compose down -v
```

### Структура

```text
lab/
├── .env.example              # шаблон Telegram (скопировать в .env)
├── docker-compose.yml
├── prometheus/
│   ├── prometheus.yml       # scrape + rule_files + alerting
│   ├── alerts.yml           # rules (HighCpu; позже HTTP)
│   └── alertmanager.yml     # route → telegram; секреты из .env
└── ubuntu-host/Dockerfile   # Ubuntu 22.04 + node_exporter + stress-ng
```

### Telegram (блок 6)

```bash
cp .env.example .env   # TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
docker compose up -d alertmanager
```

Бот (@BotFather) **в группе**. Проверка:

```bash
source .env
curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -d "chat_id=${TELEGRAM_CHAT_ID}" -d "text=Alertmanager test"
```

Token **не коммитить** — только `lab/.env`.

### Фаза 2 (планируется)

`order-service` + PostgreSQL + `postgres_exporter`; HTTP-rules в тот же `alerts.yml`. Настройка вместе со Spring — см. [docs/practical-scenarios.md](../docs/practical-scenarios.md).
