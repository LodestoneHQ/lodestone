FROM minio/mc

# Install JQ
ENV JQ_VERSION='1.5'

RUN wget --no-check-certificate https://github.com/stedolan/jq/releases/download/jq-${JQ_VERSION}/jq-linux64 -O /tmp/jq-linux64 && \
    cp /tmp/jq-linux64 /usr/bin/jq && \
    chmod +x /usr/bin/jq && \
    rm -f /tmp/jq-linux64

COPY startup.sh /startup.sh
ENTRYPOINT []
CMD /startup.sh


#TODO: run s6, minio, mc and a filesystem watcher/daemon all within the same container.
# use s6-svwait to have the configuration updates and the filesystem watcher wait until minio has started successfully
# the filesystem inotify daemon should to be smart about creating events in redis. if an create/delete event already exists in last X minutes, it should skip it?
# this is not a huge problem because event processing should be idempotent.
# watcher will be written in go to keep the container slim (only a single binary rather than a full runtime)
