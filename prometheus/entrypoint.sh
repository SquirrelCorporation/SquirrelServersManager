#!/bin/sh

# Path to the base configuration
BASE_CONFIG="/etc/prometheus/prometheus.base.yml"
DYNAMIC_CONFIG="/etc/prometheus/prometheus.yml"

# Set up the data directory with correct permissions
mkdir -p /prometheus/data
chmod -R 755 /prometheus
chown -R nobody:nobody /prometheus

# Check if values for authentication are provided through environment variables
if [ -n "$PROMETHEUS_USERNAME" ] && [ -n "$PROMETHEUS_PASSWORD" ]; then
  echo "Configuring Prometheus with authentication..."
  # Append the authentication configuration dynamically to the scrape_configs
  sed "s|static_configs:|basic_auth:\n      username: \"$PROMETHEUS_USERNAME\"\n      password: \"$PROMETHEUS_PASSWORD\"\n    static_configs:|" "$BASE_CONFIG" > "$DYNAMIC_CONFIG"
else
  echo "No authentication configured. Using base configuration."
  cp "$BASE_CONFIG" "$DYNAMIC_CONFIG"
fi

# Start Prometheus
exec su -s /bin/sh nobody -c "/bin/prometheus --config.file=\"$DYNAMIC_CONFIG\""
