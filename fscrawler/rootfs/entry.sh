#!/bin/bash
# copied from https://github.com/docker-library/elasticsearch/blob/f2e19796b765e2e448d0e8c651d51be992b56d08/5/alpine/docker-entrypoint.sh

set -e

# Add fscrawler as command if needed
# Note: The below just prefixes all the arguments with "fscrawler"
# Ref
# http://unix.stackexchange.com/questions/249869/meaning-of-101#249873
# http://ss64.com/bash/set.html (search for --)
if [ "${1:0:1}" = '-' ]; then
  set -- fscrawler "$@"
fi

# copy files from config-mount to config
# FIXME alternatively, could just copy _settings.json files, but this would require creating the folder structure of the projects
cp -r /usr/share/fscrawler/config-mount/* /usr/share/fscrawler/config/

# Drop root privileges if we are running fscrawler
# allow the container to be started with `--user`
if [ "$1" = 'fscrawler' -a "$(id -u)" = '0' ]; then
  # Change the ownership of user-mutable directories to fscrawler
  # remove from below the data folder since not user-mutable:
  #  # /usr/share/fscrawler/data \
  # remove the logs folder since unused in fscrawler (this was an elasticsearch thing, and just copy-pasted from their dockerfile entry script)
  #  /usr/share/fscrawler/logs \
  for path in \
    /usr/share/fscrawler/config \
  ; do
    chown -R fscrawler:fscrawler "$path"
  done

  set -- gosu fscrawler "$@"
  #exec su-exec fscrawler "$BASH_SOURCE" "$@"
fi

# As argument is not related to fscrawler,
# then assume that user wants to run his own process,
# for example a `bash` shell to explore this image
exec "$@"
