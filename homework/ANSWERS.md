# ANSWERS: Observability

Как выполнить [HOMEWORK.md](HOMEWORK.md). Ниже - ориентир по стенду, зависимостям и готовым PromQL для панелей Grafana.

Опора на материалы репозитория: [`demo/`](../demo/) (Spring + Prometheus + Grafana + k6), [`lab/`](../lab/) (Node Exporter).

---

## 1. Стенд

Минимальный набор процессов:

| Компонент | Зачем | Типичный порт |
|-----------|--------|---------------|
| PostgreSQL | данные приложения | `5432` |
| Spring Boot | API + `/actuator/prometheus` | `8080` |
| postgres_exporter | метрики БД | `9187` |
| Node Exporter | метрики Linux | `9100` |
| Prometheus | scrape всех targets | `9090` |
| Grafana | дашборд | `3000` |
| k6 | нагрузка | - |

### Spring Boot - зависимости

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
  <groupId>org.postgresql</groupId>
  <artifactId>postgresql</artifactId>
  <scope>runtime</scope>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
  <groupId>io.micrometer</groupId>
  <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

HikariCP идёт с `spring-boot-starter-data-jpa` / JDBC - метрики пула появляются сами после Micrometer.

### `application.yml` (фрагмент)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/homework
    username: demo
    password: demo

management:
  endpoints:
    web:
      exposure:
        include: health,prometheus,info
  endpoint:
    prometheus:
      enabled: true
```

Приложение: хотя бы один эндпоинт, который делает `SELECT`/`INSERT` через JPA или `JdbcTemplate`. Без обращения к БД графики Hikari почти не «оживут».

### Prometheus `scrape_configs` (фрагмент)

```yaml
scrape_configs:
  - job_name: spring-app
    metrics_path: /actuator/prometheus
    static_configs:
      - targets: ["host.docker.internal:8080"]  # или IP контейнера приложения

  - job_name: postgres
    static_configs:
      - targets: ["postgres-exporter:9187"]

  - job_name: node
    static_configs:
      - targets: ["node-exporter:9100"]  # в lab/ job называется lab-host-node
```

Если Prometheus в Docker, а приложение на хосте - `host.docker.internal` (как в [`demo/prometheus/prometheus.yml`](../demo/prometheus/prometheus.yml)).

### postgres_exporter

```bash
docker run -d --name postgres-exporter -p 9187:9187 \
  -e DATA_SOURCE_NAME="postgresql://demo:demo@host.docker.internal:5432/homework?sslmode=disable" \
  quay.io/prometheuscommunity/postgres-exporter \
  --collector.long_running_transactions
```

Флаг `--collector.long_running_transactions` нужен для метрик долгих транзакций (по умолчанию коллектор выключен).

### Node Exporter

Вариант из лекции: `cd lab && docker compose up -d` - target `lab-host-node` на `:9100`.  
Или отдельный контейнер `prom/node-exporter` / бинарник на хосте.

### Grafana

1. Connections → Data sources → **Prometheus** → URL Prometheus.
2. Dashboards → New → **New dashboard** → **Add visualization**.
3. Для каждой панели: Query type = Prometheus, вставить PromQL ниже, **Legend**, unit при необходимости.
4. Сохранить дашборд.

---

## 2. PromQL для панелей

Подставьте свой `job` / `datname`, если имена другие. Проверка сырых имён: `http://localhost:8080/actuator/prometheus` и UI Prometheus → Graph.

### Приложение

**Heap (used)**

```promql
sum(jvm_memory_used_bytes{area="heap"})
```

**Non-heap (used)**

```promql
sum(jvm_memory_used_bytes{area="nonheap"})
```

**HTTP 200 / 300 / 400 / 500 на одном графике**

Четыре запроса в одной панели (или один с `sum by (status)`):

```promql
sum(rate(http_server_requests_seconds_count{status=~"2.."}[1m]))
```

```promql
sum(rate(http_server_requests_seconds_count{status=~"3.."}[1m]))
```

```promql
sum(rate(http_server_requests_seconds_count{status=~"4.."}[1m]))
```

```promql
sum(rate(http_server_requests_seconds_count{status=~"5.."}[1m]))
```

Либо одной серией с разбивкой:

```promql
sum by (status) (rate(http_server_requests_seconds_count{status=~"2..|3..|4..|5.."}[1m]))
```

**Активные и idle соединения Hikari**

```promql
hikaricp_connections_active
```

```promql
hikaricp_connections_idle
```

**Потоки**

```promql
jvm_threads_live_threads
```

**RPS приложения**

```promql
sum(rate(http_server_requests_seconds_count[1m]))
```

---

### База данных

**Запросов / транзакций в секунду**

Прокси через commits + rollbacks (`pg_stat_database`):

```promql
sum(rate(pg_stat_database_xact_commit{datname!=""}[1m]))
+
sum(rate(pg_stat_database_xact_rollback{datname!=""}[1m]))
```

Если включили `--collector.stat_statements` и расширение `pg_stat_statements` - ближе к «число вызовов SQL»:

```promql
sum(rate(pg_stat_statements_calls_total[1m]))
```

**Транзакции открыты дольше 1 минуты**

Точный подсчёт - кастомный query у exporter (файл queries / collector). Пример SQL:

```sql
SELECT count(*)::float8 AS count
FROM pg_stat_activity
WHERE xact_start IS NOT NULL
  AND state IS DISTINCT FROM 'idle'
  AND now() - xact_start > interval '1 minute'
  AND pid <> pg_backend_pid();
```

Если используете только встроенный коллектор `long_running_transactions`:

```promql
# сколько незакрытых (не idle) транзакций видит коллектор
pg_long_running_transactions

# возраст самой старой, секунды - порог «> 60»
pg_long_running_transactions_oldest_timestamp_seconds
```

Для домашки достаточно панели с count + панель с age; критерий «> 1 минуты» проверяете age `> 60` или кастомным SQL выше.

Как увидеть ненулевой график: в `psql` открыть транзакцию и не коммитить:

```sql
BEGIN;
SELECT pg_sleep(70);
-- не делать COMMIT, пока смотрите дашборд
```

---

### Linux (Node Exporter)

**Оперативная память (занято, %)**

```promql
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```

Или абсолюты: `node_memory_MemAvailable_bytes`, `node_memory_MemTotal_bytes`.

**CPU (занято, %)**

```promql
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)
```

В lab после recording rule:

```promql
(1 - job:lab_host_node:node_cpu_idle:rate1m) * 100
```

**Память диска (свободно, %)** - корневая ФС, без tmpfs:

```promql
(
  node_filesystem_avail_bytes{fstype!~"tmpfs|overlay", mountpoint="/"}
  /
  node_filesystem_size_bytes{fstype!~"tmpfs|overlay", mountpoint="/"}
) * 100
```

**I/O wait (%)**

```promql
avg(rate(node_cpu_seconds_total{mode="iowait"}[1m])) * 100
```

---

## 3. Нагрузка k6

Минимальный скрипт (подставьте URL своего эндпоинта):

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '20s', target: 0 },
  ],
};

export default function () {
  const res = http.get('http://localhost:8080/api/items');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(0.5);
}
```

Запуск:

```bash
k6 run load.js
```

С пушем в Prometheus (как в [`demo/README.md`](../demo/README.md)):

```bash
export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write
k6 run -o experimental-prometheus-rw load.js
```

На лекции remote write уже включён в [`demo/docker-compose.yml`](../demo/docker-compose.yml) (`--web.enable-remote-write-receiver`). Для своего Prometheus добавьте тот же флаг.

Во время прогона откройте дашборд: RPS, статусы, Hikari, CPU должны двигаться.

Готовые сценарии нагрузки (smoke / load / spike) - в [`demo/k6/tests/`](../demo/k6/tests/); для домашки достаточно одного скрипта на ваш URL.

---

## 4. Чеклист отладки

| Симптом | Что проверить |
|---------|----------------|
| Target DOWN | сеть Docker↔хост, порт, `metrics_path` |
| Пустой JVM-график | scrape Spring, есть ли `jvm_memory_used_bytes` в `/actuator/prometheus` |
| Пустой Hikari | есть ли datasource и реальные запросы к БД |
| Пустой postgres_* | exporter, `DATA_SOURCE_NAME`, job в Prometheus |
| Долгие транзакции = 0 | включён `--collector.long_running_transactions` или кастомный SQL; открыта ли долгая `BEGIN` |
| Пустой node_* | Node Exporter UP; labels `job` / `instance` |
| Дашборд не шевелится | окно времени Last 5–15 minutes; идёт ли k6 |
