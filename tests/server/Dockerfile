FROM ubuntu:latest

# Avoid prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install necessary packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-server \
    sudo \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user 'testuser' with password 'testpassword'
# WARNING: This is insecure, for testing purposes only. Change the password.
RUN useradd -m -s /bin/bash testuser && \
    echo "testuser:testpassword" | chpasswd && \
    adduser testuser sudo

# Configure SSH
RUN mkdir /var/run/sshd
# Allow PasswordAuthentication
RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
# Explicitly disallow root login via password for better security
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config
RUN sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config # Handle case where it might be uncommented and set to yes


# Expose SSH port
EXPOSE 22

# Start SSH service
CMD ["/usr/sbin/sshd", "-D"] 