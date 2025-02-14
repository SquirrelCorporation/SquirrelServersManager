FROM prom/prometheus:latest

# Copy your base Prometheus configuration file to the image
COPY prometheus.base.yml /etc/prometheus/prometheus.base.yml

# Copy your custom entrypoint script
COPY entrypoint.sh /entrypoint.sh

USER root
# Make the entrypoint executable
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]