# build image
FROM node:12.3.1 AS builder

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install
RUN npm install -g @angular/cli@latest

# add app
COPY . /app

# start app
RUN mkdir -p /www/ && \
    npm run-script ng --  build --output-path /www/dist --base-href "/" --prod

# serve image
FROM nginx AS runtime

WORKDIR /www

RUN mkdir -p /www/static && \
    rm -f /etc/nginx/conf.d/default.conf
COPY --from=builder /www/dist /www/web

COPY rootfs/ /

