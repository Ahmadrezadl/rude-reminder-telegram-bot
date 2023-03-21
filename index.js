const TelegramBot = require("node-telegram-bot-api");
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const badWords = [
  "Asshole",
  "Motherfucker",
  "Bitch",
  "Bastard",
  "Cunt",
  "Shit Ass",
  "Pussy",
  "Slut",
  "Dickhead",
  "Stupid",
  "Dumbass",
  "Piece of shit",
];

function getRandomBadWord() {
  return badWords[Math.floor(Math.random() * badWords.length)];
}

function getMessageWithBadWord(message) {
  return message.replace("remind me to ", "")
    .replace("my", "your") + " " + getRandomBadWord();
}

function convertTimeToSeconds(timeString) {
  timeString = timeString.toLowerCase();
  const timeUnits = {
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };
  if (timeString == "tomorrow") {
    return timeUnits.day;
  }
  const regex = /(\d+)\s*(days?|hours?|minutes?|seconds?)/gi;
  let totalSeconds = 0;
  let match;
  while ((match = regex.exec(timeString)) !== null) {
    const [, amount, unit] = match;
    const unitKey = unit.toLowerCase().replace(/s$/, '');
    totalSeconds += amount * timeUnits[unitKey];
  }
  return totalSeconds;
}

function remindSecsLater(time, chatId, message) {
  const delayMs = time * 1000;
  setTimeout(() => {
    bot.sendMessage(chatId, message);
  }, delayMs);
}

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const message = msg.text;
  if (message == "/start") {
    bot.sendMessage(
      chatId,
      `Hi ${getRandomBadWord()}, I'm here to remind you of things. Say something like:\nremind me to poop`
    );
  } else if (pendingReminders[chatId]) {
    const totalSeconds = convertTimeToSeconds(message);
    const reminderMessage = getMessageWithBadWord(pendingReminders[chatId]);
    remindSecsLater(totalSeconds, chatId, reminderMessage);
    delete pendingReminders[chatId];
    bot.sendMessage(chatId, `Okay ${getRandomBadWord()}`);
  } else {
    if (message.toLowerCase().startsWith("remind me to")) {
      pendingReminders[chatId] = message;
      bot.sendMessage(chatId, `When ${getRandomBadWord()}?`);
    } else {
      bot.sendMessage(
        chatId,
        `I can't understand you ${getRandomBadWord()}! Start your message with 'remind me to'`
      );
    }
  }
});

bot.on("polling_error", (error) => {
  console.log(error);
});

let pendingReminders = {};