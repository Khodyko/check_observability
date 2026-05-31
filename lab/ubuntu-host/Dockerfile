FROM ubuntu:22.04

ARG NODE_EXPORTER_VERSION=1.8.2

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl stress-ng \
    && curl -fsSL \
      "https://github.com/prometheus/node_exporter/releases/download/v${NODE_EXPORTER_VERSION}/node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz" \
      -o /tmp/node_exporter.tar.gz \
    && tar -xzf /tmp/node_exporter.tar.gz -C /tmp \
    && mv "/tmp/node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64/node_exporter" /usr/local/bin/node_exporter \
    && chmod +x /usr/local/bin/node_exporter \
    && rm -rf /var/lib/apt/lists/* /tmp/node_exporter*

EXPOSE 9100

ENTRYPOINT ["/usr/local/bin/node_exporter"]
CMD ["--path.rootfs=/host"]
