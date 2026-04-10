FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm install -g @nestjs/cli
EXPOSE 3000
CMD ["npm", "run", "start:dev"]