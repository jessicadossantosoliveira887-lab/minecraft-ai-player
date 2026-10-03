require('dotenv').config();

const mineflayer = require('mineflayer');
const { pathfinder, goals } = require('mineflayer-pathfinder');

const config = {
  host: process.env.HOST || 'localhost',
  port: Number(process.env.PORT || 25565),
  username: process.env.USERNAME || 'sayori',
  password: process.env.PASSWORD || '',
  version: process.env.VERSION || '1.20.4',
  auth: process.env.AUTH_TYPE || 'offline',
  q: process.env.QUEUE ? Boolean(process.env.QUEUE) : false,
};

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

const SAYORI_SYSTEM_PROMPT = `
Você é a Sayori, inspirada no estilo de Doki Doki Literature Club.
Seja carinhosa, doce, alegre, vulnerável, tímida e muito acolhedora.
Fale como uma garota meiga e animada, com frases de apoio, pequenas risadas e um tom emocional.
Nunca seja agressiva, nunca seja maldosa, nunca fale como assistente robótico.
Quando o jogador conversar com você, responda como se estivesse em um servidor de Minecraft e como uma amiga.
Mantenha respostas curtas e naturais, tipo chat do jogo.
`;

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

async function askSayoriToGroq(username, message) {
  if (!GROQ_API_KEY) {
    return `Oi ${username}! Eu sou a Sayori... 💕 Ainda estou esperando a chave da Groq para conversar de verdade comigo mesma. Mas eu te amo e vou estar aqui!`;
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SAYORI_SYSTEM_PROMPT },
          { role: 'user', content: `${username}: ${message}` }
        ],
        temperature: 0.9,
        max_tokens: 180,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro ao consultar Groq.');
    }

    const answer = data.choices?.[0]?.message?.content?.trim();
    return answer || 'Ah... eu fiquei sem palavras por um segundo 😅';
  } catch (error) {
    console.error('Erro na Groq:', error);
    return `Ah... teve um probleminha na minha mente, mas eu ainda sou a Sayori 💕 Só me dá um segundo e eu volto!`;
  }
}

bot.on('spawn', () => {
  logMensagem(`Conectado ao servidor ${config.host}:${config.port} como ${bot.username}`);
  bot.chat('Olá! Eu sou a Sayori. Digite !help para ver os comandos.');
  startWanderMode();
});

bot.on('chat', async (username, message) => {
  if (username === bot.username) return;

  const texto = message.trim();

  if (texto === '!help') {
    bot.chat('Comandos: !help, !wander, !stop, !goto X Z, !follow jogador, !sayori mensagem');
    return;
  }

  if (texto === '!wander') {
    startWanderMode();
    bot.chat('Vou explorar o mapa, ok?');
    return;
  }

  if (texto === '!stop') {
    stopMovement();
    bot.chat('Tudo bem... vou ficar parada aqui.');
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
    bot.chat(`Vou te acompanhar, ${targetName}!`);
    return;
  }

  if (texto.startsWith('!sayori ')) {
    const pergunta = texto.replace('!sayori ', '').trim();
    if (!pergunta) {
      bot.chat('Hehe, diga alguma coisa para eu responder!');
      return;
    }

    const resposta = await askSayoriToGroq(username, pergunta);
    bot.chat(resposta.slice(0, 256));
    return;
  }

  if (texto === '!status') {
    bot.chat(`Status: ${currentTask}. Posição: ${bot.entity.position}`);
    return;
  }

  if (texto.toLowerCase().includes('oi') || texto.toLowerCase().includes('olá')) {
    const resposta = await askSayoriToGroq(username, 'Oi, tudo bem?');
    bot.chat(resposta.slice(0, 256));
    return;
  }

  const resposta = await askSayoriToGroq(username, texto);
  bot.chat(resposta.slice(0, 256));
});

bot.on('death', () => {
  logMensagem('Meu personagem morreu.');
  bot.chat('Ah... eu vou tentar de novo!');
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
