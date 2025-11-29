FROM node:20-alpine

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Открываем порт
EXPOSE 4000

# Запускаем приложение
CMD ["node", "src/index.js"]

