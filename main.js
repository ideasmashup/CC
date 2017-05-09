/*
	Chatbot personnalisé ultra-basique pour Discord
*/
var fs = require('fs');

try {
	var Discord = require("discord.js");
} catch (e) {
	console.log(e.stack);
	console.log(process.version);
	console.log("Exécutez npm install avant de lancer le bot");
	process.exit();
}
console.log("Lancement du bot...\n"
	"Node version: " + process.version + "\n"
	"Discord.js version: " + Discord.version
);

try {
	var AuthConfig = require("./auth.json");
} catch (e) {
	console.log("Il faut un fichier auth.json pour continuer.\n" + e.stack);
	process.exit();
}

var bot = new Discord.Client();
bot.on("ready", function() {
	console.log("Bot connecté à " + bot.guilds.array().length + " serveur(s)");
});
bot.on("disconnected", function() {
	console.log("Bot déconnecté!");
	process.exit(1); //exit node.js with an error
});

function replyToMessage(msg, isEdit) {
	if (msg.author.id != bot.user.id && (msg.content.startsWith("!"))) {
		// FIXME les messages commençants par ! seront à traiter comme des commandes
	} else {

		// on ignore nos propres messages pour éviter les boucles infinies
		if (msg.author == bot.user) {
			return;
		}

		// mention du bot dans le message
		if (msg.author != bot.user && msg.isMentioned(bot.user)) {
			msg.channel.sendMessage(msg.author + ", besoin de quelque chose?");
		} else {
			//
		}
	}
}
bot.on("message", (msg) => replyToMessage(msg, false));
bot.on("messageUpdate", (oldMessage, newMessage) => {
	//replyToMessage(newMessage,true);
	msg.channel.sendMessage("Désolé " + msg.author + " mais je ne sais pas réagir aux edits de messages... yolo !");
});

bot.on("presence", function(user, status, gameId) {
	console.log(user + " est passé " + status);
	try {
		if (status == 'online') {
			// envoie un message de bienvenue ?
		}
	} catch (e) {}
});

if (AuthConfig.bot_token) {
	bot.login(AuthConfig.bot_token);
} else {
	console.log("Le login pat email n'est plus supporté! Veuillez utiliser un token utilisateur : https://discord.js.org/#/docs/main/master/general/updating");
}
