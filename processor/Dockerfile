FROM debian:buster-slim

ADD https://github.com/just-containers/s6-overlay/releases/download/v1.21.8.0/s6-overlay-amd64.tar.gz /tmp/
RUN tar xzf /tmp/s6-overlay-amd64.tar.gz -C /
RUN apt-get update && apt-get install -y bash curl git go-dep libmagickwand-6.q16-dev

COPY /rootfs /

ADD https://api.github.com/repos/AnalogJ/lodestone-processor/releases/latest /tmp/

RUN /lodestone-processor-dl.sh \
    && ls -alt /usr/bin/lodestone-*

ENTRYPOINT ["/init"]
