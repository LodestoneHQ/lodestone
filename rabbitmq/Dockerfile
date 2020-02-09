#use rabbitmq:3-management because we need the API plugin to be installed.
FROM rabbitmq:3-management

COPY docker-healthcheck.sh /usr/local/bin/

HEALTHCHECK --interval=5s --timeout=5s --retries=5 CMD ["docker-healthcheck.sh"]
