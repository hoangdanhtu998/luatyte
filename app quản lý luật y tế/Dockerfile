# Dockerfile mẫu cho máy chủ quản lý luật y tế.
# Chưa build hay chạy trên VPS: triển khai cần anh duyệt (xem RUNBOOK.md).
FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production \
    PORT=3200 \
    DB_PATH=/app/data/quan-ly.db \
    BACKUP_DIR=/app/data/backups

COPY package.json ./
COPY src ./src
COPY public ./public
COPY diagrams ./diagrams
COPY scripts ./scripts

RUN mkdir -p /app/data && chown -R node:node /app
USER node

EXPOSE 3200
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3200/api/health || exit 1

# Bắt buộc truyền SETTINGS_KEY lúc chạy container (không đưa vào image).
CMD ["node", "src/server.mjs"]
