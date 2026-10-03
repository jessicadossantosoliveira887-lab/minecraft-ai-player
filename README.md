# Minecraft AI Player

Este projeto cria um bot controlado por IA para conectar em um servidor de Minecraft usando Node.js e a biblioteca Mineflayer.

Ele é ideal para você começar no Codespace e evoluir depois com inteligência artificial, mineração automática, seguimento de jogadores e muito mais.

## O que ele faz

- Conecta em um servidor Minecraft
- Entra com um nome de usuário configurado
- Responde a comandos no chat
- Explora o mapa em modo automático
- Pode seguir jogadores
- Pode ir para coordenadas específicas

## Requisitos

- Node.js 18+
- NPM
- Acesso a um servidor Minecraft
- Conhecimento básico de terminal

## Como usar

### 1) Abra o terminal no Codespace

```bash
npm install
```

### 2) Crie o arquivo de ambiente

```bash
cp .env.example .env
```

### 3) Ajuste o arquivo .env

Edite o arquivo `.env` com as informações do seu servidor:

```env
HOST=localhost
PORT=25565
USERNAME=BotIA
PASSWORD=
VERSION=1.20.4
AUTH_TYPE=offline
```

Observações:
- Se o servidor for local, normalmente use `HOST=localhost`
- Se for um servidor online, coloque o IP do servidor
- Para servidores sem autenticação premium, use `AUTH_TYPE=offline`
- Para servidores premium (Microsoft/Mojang), use `AUTH_TYPE=microsoft` e preencha `PASSWORD`

### 4) Inicie o bot

```bash
npm start
```

## Comandos do bot no chat do Minecraft

Dentro do jogo, o bot responde aos comandos abaixo:

- `!help` → mostra a lista de comandos
- `!wander` → explora aleatoriamente o mapa
- `!stop` → para o movimento
- `!goto X Z` → vai para uma coordenada específica
- `!follow NomeDoJogador` → segue um jogador
- `!status` → mostra a posição atual

## Exemplo

```text
!goto 100 200
!follow player1
!wander
```

## Estrutura do projeto

```text
minecraft-ai-player/
├── bot.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
```

## Próximos passos

Você pode evoluir este bot para:

- minerar automaticamente
- construir casas
- coletar recursos
- seguir o jogador principal
- integrar com IA como OpenAI
- enviar comandos por API

## Importante

Este projeto é uma base funcional e simples. Ele foi feito para começar do zero sem precisar saber programação avançada.

Se você quiser, no próximo passo eu posso te ajudar a transformar este bot em:

- um bot inteligente com IA do OpenAI
- um bot minerador
- um bot que conversa com os jogadores
- um bot que constrói estruturas automaticamente
