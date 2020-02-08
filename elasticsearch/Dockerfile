FROM docker.elastic.co/elasticsearch/elasticsearch:7.2.1

COPY configs/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml

HEALTHCHECK --interval=10s --timeout=50s --retries=5 CMD curl --silent --fail localhost:9200/_cluster/health || exit 1

# Install S6 service manager (needed so we can run elasticsearch as custom user, while still managing the permissions of the created directories)
ADD https://github.com/just-containers/s6-overlay/releases/download/v1.21.8.0/s6-overlay-amd64.tar.gz /tmp/
RUN tar xzf /tmp/s6-overlay-amd64.tar.gz -C / --exclude="./bin" && \
    tar xzf /tmp/s6-overlay-amd64.tar.gz -C /usr ./bin
COPY ./rootfs /
# set the s6 service manager as the entrypoint for this container (which will startup the live reloading servers for angular and express)
ENTRYPOINT ["/init"]

