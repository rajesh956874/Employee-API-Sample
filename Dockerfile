
FROM node:24-bookworm

RUN apt-get update && apt-get install -y \
    unixodbc \
    unixodbc-dev \
    g++ \
    make \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 10000

CMD ["npm", "start"]
