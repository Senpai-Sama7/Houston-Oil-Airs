FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache postgresql-client redis
COPY node-server ./node-server
COPY start.sh ./
RUN chmod +x start.sh
EXPOSE 3001
CMD ["./start.sh"]
