# PromQL — 4 графика demo/

Переменная `$testid` — label из `options.tags` в k6-скрипте (или env `TESTID`).

Типичные значения: `simple`, `checks`, `smoke`, `load`, `spike`, `stress`, `auth-demo`, `custom-metric`, `tag`, `group`.

## 1. Virtual Users

```promql
k6_vus{testid="smoke"}
```

## 2. Requests per second

```promql
# client-side (k6 push)
sum(rate(k6_http_reqs_total{testid="load"}[1m]))

# server-side (Spring scrape)
sum(rate(http_server_requests_seconds_count{job="k6-test-app"}[1m]))
```

## 3. Latency

```promql
# k6 client p99 (trend, без native histogram)
k6_http_req_duration_p99{testid="spike"}

# Spring server p95 (s)
histogram_quantile(0.95,
  sum(rate(http_server_requests_seconds_bucket{job="k6-test-app"}[1m])) by (le)
)
```

С `K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM=true` — `histogram_quantile` по `k6_http_req_duration_seconds_bucket`.

## 4. Error rate

```promql
# k6 failed (0..1)
k6_http_req_failed_rate{testid="spike"}

# Spring 5xx
sum(rate(http_server_requests_seconds_count{job="k6-test-app", status=~"5.."}[1m]))
/ clamp_min(sum(rate(http_server_requests_seconds_count{job="k6-test-app"}[1m])), 0.001)
```

## Кастомная метрика k6

```promql
k6_my_counter_total{testid="custom-metric"}
```

## Проверка scrape Spring

```promql
up{job="k6-test-app"}
```
