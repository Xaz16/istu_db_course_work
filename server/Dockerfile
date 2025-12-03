FROM node:20-alpine

WORKDIR /app

# Копируем package.json и устанавливаем зависимости (включая dev для nodemon)
COPY package*.json ./
COPY nodemon.json ./
RUN npm ci

# Копируем исходный код
COPY . .

# Открываем порт
EXPOSE 4000

# Запускаем приложение через nodemon для автоматической перезагрузки
CMD ["npm", "run", "dev"]

