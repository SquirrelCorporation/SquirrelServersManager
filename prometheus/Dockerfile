# Use the official Prometheus base image
FROM prom/prometheus:latest

# Copy your base Prometheus configuration file to the image
COPY prometheus.base.yml /etc/prometheus/prometheus.base.yml

# Copy your custom entrypoint script
COPY entrypoint.sh /entrypoint.sh
USER root
# Ensure the entrypoint script is executable
RUN chmod +x /entrypoint.sh
USER nobody

# Override the default CMD with the entrypoint script
ENTRYPOINT ["/entrypoint.sh"]