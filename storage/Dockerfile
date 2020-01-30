FROM minio/minio:RELEASE.2019-12-30T05-45-39Z

# TODO: run s6, minio, mc and a filesystem watcher/daemon all within the same container.
# use s6-svwait to have the configuration updates and the filesystem watcher wait until minio has started successfully
# the filesystem inotify daemon should to be smart about creating events in redis. if an create/delete event already exists in last X minutes, it should skip it?
# this is not a huge problem because event processing should be idempotent.
# watcher will be written in go to keep the container slim (only a single binary rather than a full runtime)


ADD https://github.com/just-containers/s6-overlay/releases/download/v1.21.8.0/s6-overlay-amd64.tar.gz /tmp/
RUN tar xzf /tmp/s6-overlay-amd64.tar.gz -C /
RUN apk --no-cache add bash curl

COPY /rootfs /

# CACHE BUSTING
ADD https://api.github.com/repos/AnalogJ/lodestone-fs-publisher/releases/latest /tmp/

RUN /lodestone-fs-publisher-dl.sh \
    && ls -alt /usr/bin/lodestone-fs-publisher

RUN apk add --no-cache ca-certificates shadow && \
    apk add --no-cache --virtual .build-deps curl && \
    curl https://dl.min.io/client/mc/release/linux-amd64/mc > /usr/bin/mc && \
    chmod +x /usr/bin/mc && apk del .build-deps

ENTRYPOINT ["/init"]

HEALTHCHECK --interval=5s --timeout=25s --retries=5 CMD curl --silent --fail localhost:9000/minio/health/ready || exit 1
