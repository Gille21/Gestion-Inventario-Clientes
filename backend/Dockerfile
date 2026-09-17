FROM python:3.14-slim

WORKDIR /app

# Instalar dependencias del sistema y herramientas para el repositorio de Microsoft
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    unixodbc-dev \
    gcc \
    g++ \
    apt-transport-https \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Agregar la llave y el repositorio oficial de Microsoft para Debian (necesario para el Driver 18)
RUN curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /usr/share/keyrings/microsoft-prod.gpg && \
    curl https://packages.microsoft.com/config/debian/12/prod.list > /etc/apt/sources.list.d/mssql-release.list

# Instalar el Driver ODBC 18 de Microsoft para SQL Server
RUN apt-get update && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar los requerimientos de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código del proyecto
COPY . .

EXPOSE 8000