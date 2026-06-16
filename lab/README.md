# Учебный стенд Observability (лекция 1)

## Фаза 1: Prometheus + Alertmanager + Ubuntu (Node Exporter)

Стенд поднимается **целиком одной командой**: scrape, `rules.yml`, `alerts.yml`, Alertmanager — всё включено с первого `docker compose up`. **Live-демо алертов** (Pending → Firing) — **блок 6** лекции, не сразу после lab.

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
3. (Опционально, одной фразой) **Status → Rules** — два файла: `rules.yml` (Type: **recording**), `alerts.yml` (Type: **alerting**); алерт **Inactive** — «вернёмся на блоке 6».
4. **Graph** — recording metric или «% CPU»:

```promql
job:lab_host_node:node_cpu_idle:rate1m
```

```promql
(1 - job:lab_host_node:node_cpu_idle:rate1m) * 100
```

Ручной расчёт до recording rule (блок PromQL):

```promql
100 - (avg(irate(node_cpu_seconds_total{mode="idle",job="lab-host-node"}[30s])) * 100)
```

5. Сценарий 1: `stress-ng` для графика CPU — **без** вкладки Alerts и **без** ожидания Firing.

**Не открываем на ранних блоках:** вкладку **Alerts**, Alertmanager UI, live Pending/Firing.

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

### Live-дemo алертов + Telegram (блок 6)

Runbook: [docs/practical-scenarios.md](../docs/practical-scenarios.md) — **Сценарий 6**.  
Спич: [docs/talk-speech-block-1-alerts.md](../docs/talk-speech-block-1-alerts.md).

```bash
docker compose exec lab-host stress-ng --cpu 0 --timeout 120s
```

| # | Где | Что видим |
|---|-----|-----------|
| 0 | Prometheus → **Status → Rules** | `node_cpu_idle:rate1m` (recording), `HighCpu` (alerting) |
| 1 | Prometheus → **Alerts** | Pending → Firing (~2 мин) |
| 2 | Alertmanager → `:9093/alerts` | Тот же алерт |
| 3 | **Telegram** | Сообщение от бота |
| 4 | `pkill stress-ng` | Resolved в Telegram |

```bash
docker compose exec lab-host pkill stress-ng
```

**Типично:** `--cpu 2` даёт ~30–40% — порог 60% не пробить; нужен `--cpu 0`. AM должен быть **Up** (`route.receiver: telegram`).

### Сценарий: hot reload (`--web.enable-lifecycle`)

**После блока 6:** нагрузка снята (`pkill stress-ng`), алерт **Inactive**, сообщение в Telegram получено. Команды ниже — из каталога `lab/`.

Флаг `--web.enable-lifecycle` в compose включает endpoint `POST /-/reload`: Prometheus перечитывает `prometheus.yml` и `rule_files` **без restart** контейнера. TSDB и история метрик не сбрасываются.

Демо: меняем порог alert `HighCpu` в `prometheus/alerts.yml` и смотрим, как expr обновляется в **Status → Rules**.

| После шага | Status → Rules (`HighCpu` expr) |
|------------|----------------------------------|
| 1 | `< 0.4` |
| 2 (до reload) | `< 0.4` (файл уже `< 0.7`, Prometheus не перечитал) |
| 3 | `< 0.7` |
| 4 | `< 0.4` |

#### 1. Исходное состояние

Prometheus → **Status → Rules** → `HighCpu` — expr: `… < 0.4`.

#### 2. Правка порога на диске (без reload)

Файл на хосте и в контейнере — один и тот же (volume `./prometheus` → `/etc/prometheus`):

```bash
cat prometheus/alerts.yml
docker compose exec prometheus cat /etc/prometheus/alerts.yml
```

Зайти в контейнер Prometheus (образ без `bash`, только `sh`):

```bash
docker compose exec -it prometheus sh
# cat /etc/prometheus/alerts.yml
# exit
```

Меняем порог:

```bash
sed -i 's/< 0.4/< 0.7/' prometheus/alerts.yml
sed -i 's/CPU > 60%/CPU > 30%/' prometheus/alerts.yml
grep 'expr:' prometheus/alerts.yml
docker compose exec prometheus grep 'expr:' /etc/prometheus/alerts.yml
```

> `prometheus/` смонтирован в контейнер как каталог (см. `docker-compose.yml`) — иначе `sed -i` на одном файле ломает bind mount, и reload не подхватит изменения.

На диске уже `< 0.7`. Обновите **Status → Rules** в браузере — expr **ещё `< 0.4`**.

#### 3. Hot reload

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST http://localhost:9090/-/reload
```

**Status → Configuration** — success. **Status → Rules** → `HighCpu` — expr **`< 0.7`**, description «CPU > 30%…».

#### 4. Откат

```bash
sed -i 's/< 0.7/< 0.4/' prometheus/alerts.yml
sed -i 's/CPU > 30%/CPU > 60%/' prometheus/alerts.yml
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST http://localhost:9090/-/reload
grep 'expr:' prometheus/alerts.yml
```

**Status → Rules** — снова `< 0.4`.

Restart контейнера нужен только при смене CLI-флагов в compose или образа Prometheus.

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
│   ├── rules.yml            # recording rules
│   ├── alerts.yml           # alert rules (HighCpu; позже HTTP)
│   └── alertmanager.yml     # route → telegram; секреты из .env
└── ubuntu-host/Dockerfile   # Ubuntu 22.04 + node_exporter + stress-ng
```