FROM node:14-alpine as build-env

ADD . /app
WORKDIR /app

RUN apk add --update --no-cache alpine-sdk linux-headers build-base gcc libusb-dev python3 py3-pip eudev-dev
RUN ln -sf python3 /usr/bin/python

RUN yarn install; yarn pack-node

# Use Alpine and install Node.js which is 50% smaller than the -alpine version of the node
# image (53 MB including the faucet app).
FROM alpine:3.15
# Installs Node.js 16 (https://pkgs.alpinelinux.org/packages?name=nodejs&branch=v3.15)
RUN apk add --update nodejs

COPY --from=build-env /app/dist /app/faucet/dist
COPY --from=build-env /app/bin/cosmos-faucet-dist /app/faucet/bin/faucet-start
COPY --from=build-env /app/package.json /app/faucet/package.json
COPY --from=build-env /app/src/faucet.html /app/faucet/dist/

WORKDIR /app

EXPOSE 8000
ENTRYPOINT ["/app/faucet/bin/faucet-start"]
