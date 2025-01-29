# Use the official Prometheus base image
FROM prom/prometheus:latest

# Copy your Prometheus configuration to the image
COPY prometheus.yml /etc/prometheus/prometheus.yml

# Default command (inherited from the base image, no need to change)
CMD ["--config.file=/etc/prometheus/prometheus.yml"]