require('dotenv').config();

const mineflayer = require('mineflayer');
const { pathfinder, goals } = require('mineflayer-pathfinder');

const config = {
  host: process.env.HOST || 'localhost',
  port: Number(process.env.PORT || 25565),
  username: process.env.USERNAME || 'BotIA',
  password: process.env.PASSWORD || '',
  version: process.env.VERSION || '1.20.4',
  auth: process.env.AUTH_TYPE || 'offline',
  q: process.env.QUEUE ? Boolean(process.env.QUEUE) : false,
};

const bot = mineflayer.createBot(config);

bot.loadPlugin(pathfinder);

let currentTask = 'idle';
let wanderInterval = null;

function logMensagem(texto) {
  console.log(`[BOT] ${texto}`);
}

function goalNearRandom() {
  const pos = bot.entity.position;
  const x = Math.floor(pos.x + (Math.random() - 0.5) * 20);
  const y = Math.floor(pos.y);
  const z = Math.floor(pos.z + (Math.random() - 0.5) * 20);

  bot.pathfinder.setGoal(new goals.GoalNear(x, y, z, 2));
  logMensagem(`Explorando até ${x}, ${y}, ${z}`);
}

function startWanderMode() {
  if (wanderInterval) {
    clearInterval(wanderInterval);
  }

  currentTask = 'wander';
  goalNearRandom();

  wanderInterval = setInterval(() => {
    if (currentTask === 'wander') {
      goalNearRandom();
    }
  }, 20000);
}

function stopMovement() {
  if (wanderInterval) {
    clearInterval(wanderInterval);
    wanderInterval = null;
  }

  currentTask = 'idle';
  bot.pathfinder.setGoal(null);
  logMensagem('Movimento parado.');
}

bot.on('spawn', () => {
  logMensagem(`Conectado ao servidor ${config.host}:${config.port}`);
  bot.chat('Olá! Eu sou um bot IA. Digite !help para ver os comandos.');
  startWanderMode();
});

bot.on('chat', (username, message) => {
  if (username === bot.username) return;

  const texto = message.trim();

  if (texto === '!help') {
    bot.chat('Comandos: !help, !wander, !stop, !goto X Z, !follow jogador');
    return;
  }

  if (texto === '!wander') {
    startWanderMode();
    bot.chat('Vou explorar o mapa.');
    return;
  }

  if (texto === '!stop') {
    stopMovement();
    bot.chat('Parado.');
    return;
  }

  if (texto.startsWith('!goto ')) {
    const partes = texto.split(' ');
    const x = Number(partes[1]);
    const z = Number(partes[2]);

    if (!Number.isFinite(x) || !Number.isFinite(z)) {
      bot.chat('Use o formato: !goto X Z');
      return;
    }

    currentTask = 'goto';
    bot.pathfinder.setGoal(new goals.GoalNear(Math.floor(x), Math.floor(bot.entity.position.y), Math.floor(z), 2));
    bot.chat(`Vou até ${x}, ${z}.`);
    return;
  }

  if (texto.startsWith('!follow ')) {
    const targetName = texto.replace('!follow ', '').trim();
    const targetPlayer = bot.players[targetName];

    if (!targetPlayer || !targetPlayer.entity) {
      bot.chat(`Jogador ${targetName} não encontrado.`);
      return;
    }

    currentTask = 'follow';
    bot.pathfinder.setGoal(new goals.GoalFollow(targetPlayer.entity, 2));
    bot.chat(`Seguindo ${targetName}.`);
    return;
  }

  if (texto === '!status') {
    bot.chat(`Status: ${currentTask}. Posição: ${bot.entity.position}`);
    return;
  }

  if (texto.toLowerCase().includes('oi') || texto.toLowerCase().includes('olá')) {
    bot.chat(`Oi ${username}! Eu sou o bot IA deste servidor.`);
    return;
  }
});

bot.on('death', () => {
  logMensagem('Meu personagem morreu.');
  bot.chat('Estou voltando para o jogo!');
  setTimeout(() => {
    bot.emit('spawn');
  }, 2000);
});

bot.on('error', (err) => {
  logMensagem(`Erro: ${err.message || err}`);
});

bot.on('end', (reason) => {
  logMensagem(`Conexão encerrada: ${reason}`);
  if (wanderInterval) clearInterval(wanderInterval);
});

process.on('SIGINT', () => {
  logMensagem('Bot encerrado pelo usuário.');
  bot.quit();
  process.exit(0);
});
