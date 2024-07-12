# Define a imagem base
FROM python:3.12
# Define o diretório de trabalho dentro do container
WORKDIR /app
# Copia o código-fonte para o diretório de trabalho
COPY . .
# Define o comando de execução da API
CMD ["python", "-m", "http.server", "8000"]