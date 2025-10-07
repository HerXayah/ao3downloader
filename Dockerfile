FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p /app/books
RUN npm run build
CMD ["npm", "start", "--no-stdin"]