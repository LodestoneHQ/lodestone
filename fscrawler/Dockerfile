# Copied from https://github.com/dadoonet/fscrawler/issues/314#issuecomment-282823207
# with modifications

FROM ubuntu:16.04

# split each package to a separate line just for bandwidth purposes while running in FFA
RUN apt-get update && apt-get install -y openjdk-8-jdk
RUN apt-get update && apt-get install -y wget
RUN apt-get update && apt-get install -y unzip
RUN apt-get update && apt-get install -y maven
RUN apt-get update && apt-get install -y tesseract-ocr
RUN apt-get update && apt-get install -y tesseract-ocr-fra

RUN update-ca-certificates -f

WORKDIR /runtime

# Until issue fscrawler/461 is closed via PR 475 (in fscrawler 2.5)
# Use my own fork/branch
# https://github.com/dadoonet/fscrawler/pull/475
# Edit 2018-10-04 PR was merged, so move back to upstream
ENV FS_BRANCH=master
ENV FS_UPSTREAM=dadoonet
RUN wget https://github.com/$FS_UPSTREAM/fscrawler/archive/$FS_BRANCH.zip
RUN unzip $FS_BRANCH.zip
# RUN cd fscrawler-$FS_BRANCH && mvn compile
WORKDIR /runtime/fscrawler-$FS_BRANCH

# Modified original from here on
# Copied from Dockerfile
# usually same as FSCRAWLER_BRANCH
ENV FSCRAWLER_VERSION=2.7-SNAPSHOT
ENV FSCRAWLER_DISTRO=es7
# build
# RUN mvn clean install -X -DskipTests # > /dev/null
RUN mvn clean package -DskipTests > /dev/null

# FSCRAWLER_VERSION is same as FS_BRANCH
RUN mkdir /usr/share/fscrawler

# continue
WORKDIR /usr/share/fscrawler
ENV PATH /usr/share/fscrawler/bin:$PATH

# ensure fscrawler user exists
RUN addgroup --system fscrawler && adduser --system --ingroup fscrawler fscrawler

# grab su-exec (alpine) or gosu (ubuntu) for easy step-down from root
# and bash for "bin/fscrawler" among others
RUN apt-get update && apt-get install -y gosu bash openssl

# Now cp and unzip the generated zip file from the maven build above
RUN cp /runtime/fscrawler-$FS_BRANCH/distribution/$FSCRAWLER_DISTRO/target/fscrawler-$FSCRAWLER_DISTRO-$FSCRAWLER_VERSION.zip ./fscrawler.zip


# Remove logs path from below as it was just copy-pasted from elasticsearch
# 		./logs \
RUN set -ex; \
  \
  unzip fscrawler.zip; \
  rm fscrawler.zip; \
	\
	for path in \
		./data \
		./config \
	; do \
		mkdir -p "$path"; \
		chown -R fscrawler:fscrawler "$path"; \
	done;

# shopt from https://unix.stackexchange.com/a/6397/312018
# RUN /bin/bash -c "shopt -s dotglob nullglob; mv /runtime/fscrawler-$FSCRAWLER_VERSION/* .; ls -al /runtime/fscrawler-$FSCRAWLER_VERSION; rmdir /runtime/fscrawler-$FSCRAWLER_VERSION;"
RUN mv fscrawler-$FSCRAWLER_DISTRO-$FSCRAWLER_VERSION/* .; \
  rmdir fscrawler-$FSCRAWLER_DISTRO-$FSCRAWLER_VERSION;

#RUN chown -R fscrawler:fscrawler .
#USER fscrawler

VOLUME /usr/share/fscrawler/data
RUN mkdir /usr/share/fscrawler/config-mount \
  && touch /usr/share/fscrawler/config-mount/empty

COPY rootfs/entry.sh /

CMD ["fscrawler", "--rest","--trace", "--config_dir", "/usr/share/fscrawler/config", "lode"]
