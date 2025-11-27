FROM node:20-alpine AS builder

COPY package.json .

RUN npm install

COPY . .

ARG VITE_YMAPS_API_KEY
ARG VITE_YMAPS_GEOSUGGEST_API_KEY
ENV VITE_YMAPS_API_KEY=$VITE_YMAPS_API_KEY
ENV VITE_YMAPS_GEOSUGGEST_API_KEY=$VITE_YMAPS_GEOSUGGEST_API_KEY

RUN npm run build



FROM nginx:alpine3.22

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

COPY --from=builder /dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]