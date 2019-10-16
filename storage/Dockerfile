FROM minio/minio

ADD https://github.com/just-containers/s6-overlay/releases/download/v1.21.8.0/s6-overlay-amd64.tar.gz /tmp/
RUN tar xzf /tmp/s6-overlay-amd64.tar.gz -C /
RUN apk --no-cache add bash curl

COPY /rootfs /

RUN /lodestone-fs-publisher-dl.sh \
    && ls -alt /usr/bin/lodestone-fs-publisher

#RUN cp /lodestone-fs-publisher-linux-amd64 /usr/bin/lodestone-fs-publisher && chmod +x /usr/bin/lodestone-fs-publisher
ENTRYPOINT ["/init"]
