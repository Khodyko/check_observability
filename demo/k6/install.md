# Установка k6

Команды ниже — из каталога `demo/` (родитель `k6/`).

Проверка после установки: `k6 version`

## Ubuntu / Debian (apt)

```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | \
  sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

Другие ОС — [официальная документация k6](https://grafana.com/docs/k6/latest/set-up/install-k6/).

## Docker (без установки на хост)

```bash
cd k6
docker run --rm --network host \
  -e LOAD_HOST=localhost:8080 \
  -e TESTID=smoke \
  -e K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write \
  -v "$(pwd):/scripts" grafana/k6:latest run -o experimental-prometheus-rw \
  /scripts/tests/smoke.js
```

Скрипт монтируется в `/scripts`; путь к файлу — `/scripts/tests/<имя>.js`.
