FROM nginx:1.27.3
LABEL org.opencontainers.image.source=https://github.com/SquirrelCorporation/SquirrelServersManager
LABEL org.opencontainers.image.description="SSM Proxy"
LABEL org.opencontainers.image.licenses="GNU AFFERO GENERAL PUBLIC LICENSE"

COPY default.conf /etc/nginx/templates/nginx.conf.template
COPY www/index.html /usr/share/nginx/html/custom.html

CMD ["sh", "-c", "envsubst < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d'"]