
FROM node:24-bookworm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    g++ \
    make \
    python3 \
    unixodbc \
    unixodbc-dev \
    libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*

# Add Microsoft package repository and install SQL Server ODBC 18
RUN curl -fsSLO https://packages.microsoft.com/config/debian/12/packages-microsoft-prod.deb \
    && dpkg -i packages-microsoft-prod.deb \
    && rm packages-microsoft-prod.deb \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
