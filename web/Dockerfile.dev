# build image
FROM node:12 AS builder

# Install S6 service manager (needed for live reloading of Express & Angular apps in the same container)
# Not used in production.
ADD https://github.com/just-containers/s6-overlay/releases/download/v1.21.8.0/s6-overlay-amd64.tar.gz /tmp/
RUN tar xzf /tmp/s6-overlay-amd64.tar.gz -C /


# set working directory
WORKDIR /lodestone

# add `/lodestone/node_modules/.bin` to $PATH
ENV PATH /lodestone/backend/node_modules/.bin:/lodestone/frontend/node_modules/.bin:$PATH

# add frontend/backend and services
COPY ./frontend /lodestone/frontend
COPY ./backend /lodestone/backend
COPY ./rootfs /

# install global dependencies
RUN npm install -g @angular/cli@latest \
    && npm install -g nodemon

# install frontend and backend dependencies
RUN cd /lodestone/frontend \
    && npm install \
    && cd /lodestone/backend \
    && npm install

# build frontend app (and copy into backend public directory)
RUN mkdir -p /lodestone/backend/public \
    && cd /lodestone/frontend \
    && npm run-script build-lodestone

# set the s6 service manager as the entrypoint for this container (which will startup the live reloading servers for angular and express)
ENTRYPOINT ["/init"]





