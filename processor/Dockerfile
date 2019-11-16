FROM alpine

ADD https://github.com/just-containers/s6-overlay/releases/download/v1.21.8.0/s6-overlay-amd64.tar.gz /tmp/
RUN tar xzf /tmp/s6-overlay-amd64.tar.gz -C /
RUN apk --no-cache add bash curl

COPY /rootfs /

ADD https://api.github.com/repos/AnalogJ/lodestone-processor/releases/latest /tmp/

RUN /lodestone-processor-dl.sh \
    && ls -alt /usr/bin/lodestone-processor

#RUN cp /lodestone-fs-publisher-linux-amd64 /usr/bin/lodestone-fs-publisher && chmod +x /usr/bin/lodestone-fs-publisher
ENTRYPOINT ["/init"]
