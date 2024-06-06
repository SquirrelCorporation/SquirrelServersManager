LABEL org.opencontainers.image.source=https://github.com/SquirrelCorporation/SquirrelServersManager
LABEL org.opencontainers.image.description="SSM Proxy"
LABEL org.opencontainers.image.licenses="GNU AFFERO GENERAL PUBLIC LICENSE"

FROM nginx:1.25.5
COPY default.conf /etc/nginx/conf.d
COPY www/index.html /usr/share/nginx/html/custom.html
