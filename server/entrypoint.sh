#!/bin/sh

# Create symlinks
ln -sf /data/playbooks /playbooks
ln -sf /data /ansible-config

# Execute the CMD
exec "$@"
