#!/bin/bash
set -e

echo "Instalando dependências..."
npm install

echo "Verificando arquivo .env..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo ".env criado a partir de .env.example"
fi

echo "Iniciando o bot Sayori..."
npm start
