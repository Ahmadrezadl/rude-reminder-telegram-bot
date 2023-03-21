// Import the node-telegram-bot-api library
const TelegramBot = require("node-telegram-bot-api");

// Get the Telegram bot token from an environment variable
const token = process.env.TELEGRAM_BOT_TOKEN;

// Create a new Telegram bot instance
const bot = new TelegramBot(token, { polling: true });
console.log("Bot started!");

// Define an array of "bad words"
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

// Function to get a random bad word
function getRandomBadWord() {
    return badWords[Math.floor(Math.random() * badWords.length)];
}

// Function to modify a message to include a bad word
function getMessageWithBadWord(message) {
    return message.slice(13,message.length)
        .replace("my", "your") + ", " + getRandomBadWord() + "!";
}

// Function to convert a time string to seconds
function convertTimeToSeconds(timeString) {
    timeString = timeString.toLowerCase();
    const timeUnits = {
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1,
        sec: 1,
    };
    if (timeString == "tomorrow") {
        return timeUnits.day;
    }
    const regex = /(\d+)\s*(days?|hours?|minutes?|seconds?|secs?)/gi;
    let totalSeconds = 0;
    let match;
    while ((match = regex.exec(timeString)) !== null) {
        const [, amount, unit] = match;
        const unitKey = unit.toLowerCase().replace(/s$/, '');
        totalSeconds += amount * timeUnits[unitKey];
    }
    return totalSeconds;
}

// Function to set a reminder to be sent at a later time
function remindSecsLater(time, chatId, message) {
    const delayMs = time * 1000;
    setTimeout(() => {
        bot.sendMessage(chatId, message);
    }, delayMs);
}

// Function called when a new message is received
bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const message = msg.text;

    // If message is /start, send a welcome message
    if (message == "/start") {
        bot.sendMessage(
            chatId,
            `Hi ${getRandomBadWord()}, I'm here to remind you of things. Say something like:\nremind me to poop`
        );
    } else if (pendingReminders[chatId]) {
        // If there is a pending reminder for this chat, set the reminder
        const totalSeconds = convertTimeToSeconds(message);
        const reminderMessage = getMessageWithBadWord(pendingReminders[chatId]);
        remindSecsLater(totalSeconds, chatId, reminderMessage);
        console.log(`${msg.chat.first_name} set reminder ${pendingReminders[chatId]} for ${totalSeconds} seconds later`)
        delete pendingReminders[chatId];
        bot.sendMessage(chatId, `Okay ${getRandomBadWord()}`);
    } else {
        // If there is no pending reminder for this chat, check the message for a reminder request
        if (message.toLowerCase().startsWith("remind me to")) {
            pendingReminders[chatId] = message;
            bot.sendMessage(chatId, `When ${getRandomBadWord()}?`);
        } else {
            // If the message is not understood, send an error message
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