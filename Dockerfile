FROM node:20-alpine

WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем исходники
COPY . .

# Билдим проект
RUN npm run build

# Создаём папку для статики внутри контейнера
RUN mkdir -p /app/updates

# Экспонируем порт
EXPOSE 3001

CMD ["node", "dist/main.js"]
