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
  + "Node version: " + process.version + "\n"
	+ "Discord.js version: " + Discord.version
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

try {
	var Martiens = require("./data/martiens.json");
} catch (e) {
	console.log("Il faut un fichier martiens.json pour continuer.\n" + e.stack);
	process.exit();
}

function replyToMessage(msg, isEdit) {
	if (msg.author.id != bot.user.id && (msg.content.startsWith("!"))) {
		// FIXME les messages commençants par ! seront à traiter comme des commandes
	} else {

		// on ignore nos propres messages pour éviter les boucles infinies
		if (msg.author == bot.user) {
			return;
		}

		// les autres messages viennent des humains (ou autres bots)
		if (msg.author != bot.user) {
			if (msg.isMentioned(bot.user)) {
				// bot mentionné avec @CC
			} else {
				//
			}
		}

		// email
		var REGEX_EMAIL = /.*([0-9a-zA-Z_\-\.]+@[0-9a-zA-Z_\-\.]{4,}).*/gi;
		var email_matches = msg.content.match(REGEX_EMAIL);
		if (email_matches !== null) {
			var email = email_matches[0];
			var index = Martiens.liste.indexOf(email);

			msg.channel.sendMessage(msg.author + ", merci pour ton mail. Pour rappel tu m'a indiqué : "+ email  +"");

			if (index == -1) {
				msg.channel.sendMessage("malheureusement ton mail n'est pas dans la liste.\nVérifies qu'il n'y a pas d'erreur. Sinon demande plutôt à mon créateur (@will) ! ;-)");
			} else {
				// padding pour compenser le décalage des numéros dans la DB
				if (index < 300) index = index + 300;
				msg.channel.sendMessage("tu es " + index + "ème de la liste (sur 3000) ! A plus tard !");
			}
		}
		else {
			msg.channel.sendMessage(msg.author + ", pour connaître ton numéro de commande, passes moi ton mail ! Bonne journée !");
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
	console.log("Le login par email n'est plus supporté! Veuillez utiliser un token utilisateur : https://discord.js.org/#/docs/main/master/general/updating");
}
