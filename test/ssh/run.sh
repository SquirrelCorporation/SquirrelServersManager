#docker run -d \
#  -p host-port:22 \
#  -e SSH_USERNAME=myuser \
#  -e SSH_PASSWORD=mysecretpassword \
#  -e AUTHORIZED_KEYS="$(cat path/to/authorized_keys_file)" \
#  -e SSHD_CONFIG_ADDITIONAL="your_additional_config" \
#  -e SSHD_CONFIG_FILE="/path/to/your/sshd_config_file" \
#  my-ubuntu-sshd:latest

# Step 1: Create a custom network with a subnet
docker network create \
  --subnet=192.168.1.0/24 \
  my_custom_network

# Step 2: Build the Docker image
docker build -t my-ubuntu-sshd:latest .

# Step 3: Run the container with a static IP
docker run -d \
  --net my_custom_network \
  --ip 192.168.1.100 \
  -p 2222:22 \
  -e SSH_USERNAME=myuser \
  -e SSH_PASSWORD=
   \
  my-ubuntu-sshd:latest
