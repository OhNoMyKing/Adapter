# Step 1: Build Stage
FROM node:21-bullseye-slim AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Build ứng dụng NestJS
RUN npm run build

# Step 2: Production Stage
FROM node:21-bullseye-slim AS runner

# Set working directory
WORKDIR /usr/src/app

# Copy mã nguồn đã build từ builder stage
COPY --from=builder /usr/src/app ./

# Cài đặt chỉ dependencies cần thiết cho production
RUN npm install --only=production

# Set biến môi trường cho PostgreSQL và RabbitMQ
ENV RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
ENV POSTGRES_HOST=postgres
ENV POSTGRES_PORT=5432
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=password
ENV POSTGRES_DB=mydb

# Expose port backend (cổng 8083 cho HTTP, cổng 8000 cho WebSocket)
EXPOSE 8083
EXPOSE 8000

# Chạy ứng dụng NestJS trong chế độ sản xuất
CMD ["npm", "run", "start:prod"]
