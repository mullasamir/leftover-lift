# syntax=docker/dockerfile:1

# ---- Stage 1: build the static site ----------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Dependencies first, for the same layer-caching reason as the backend. `npm ci` installs exactly
# what package-lock.json says, so builds are repeatable (it falls back to `npm install` if there is no lockfile yet).
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .
RUN npm run build

# ---- Stage 2: nginx serves the files and forwards /api to the backend -------------------------
FROM nginx:1.27-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s --retries=5 \
  CMD wget -qO- http://localhost/ >/dev/null || exit 1
