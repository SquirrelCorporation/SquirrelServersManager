# Start with a lightweight Debian base image
FROM ubuntu:latest
# Install nmap and other necessary packages
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    nmap

# Add NodeSource APT repository for Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Node.js and npm from NodeSource
RUN apt-get install -y nodejs

# Verify installation
RUN node --version && npm --version
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Create and set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
