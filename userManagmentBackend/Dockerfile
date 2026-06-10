FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .
ENV DATABASE_URL="postgresql://postgres:123789@localhost:5432/robot_data"

RUN npx prisma generate

RUN npm run build

EXPOSE 3000


CMD ["npm", "start"]
