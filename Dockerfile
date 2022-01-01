FROM node:lts-alpine as build

WORKDIR /app

# Add the package json and install
ADD package.json /app
ADD package-lock.json /app
RUN npm install

# Add the rest of the app and build
ADD . /app
RUN npm run build

FROM node:lts-alpine as target
WORKDIR /app

# Copy the package json and dist folder from build
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/package-lock.json /app/package-lock.json
COPY --from=build /app/dist /app/dist

# Only install production modules.
RUN npm install --only=prod

CMD ["node", "."]
