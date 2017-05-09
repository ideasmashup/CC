/*
	Chatbot personnalisé ultra-basique pour Discord
*/
var fs = require('fs');

const VERSION = "0.1.1";

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

function processAndReplyToEmail(msg) {
	// email
	var REGEX_EMAIL = /([0-9A-Z_\-\.]+@[0-9a-zA-Z_\-\.]{4,})/gi;
	var email_matches = msg.content.match(REGEX_EMAIL);
	if (email_matches !== null) {
		console.log("email detected : " + email_matches + "("+ email_matches.length +")");

		var email = email_matches[0];
		var index = Martiens.liste.indexOf(email);

		msg.channel.sendMessage(msg.author + ", merci pour ton mail.");

		if (index == -1) {
			msg.channel.sendMessage("mmh... ton mail *"+ email +"* n'est pas dans la liste. Donc plusieurs possibilités :\n"
				+ "```- ton mail a été mal tapé ou il y a des majuscules en trop\n- tu ne fais pas partie du batch de mars\n- je me suis trompé quelque part```\n"
				+ "Vérifies qu'il n'y a pas d'erreur. Sinon demandes plutôt à mon créateur @will");
		} else {
			// padding pour compenser le décalage des numéros dans la DB
			if (index < 300) index = index + 300;
			msg.channel.sendMessage("tu es " + index + "ème de la liste (sur 3000) ! A plus tard !");
		}

		if (msg.channel.client === undefined) {
			// pas sur un channel privé
			msg.channel.sendMessage("PS: Attention " + msg.author + " ! Passes ton mail seulement MP stp !!! (supprimes ton msg car tu es sur un chan public)");
		}

		return true;
	}
	return false;
}

function processAndReply(msg) {
	// version
	if (msg.content.indexOf("version") != -1)
		msg.channel.sendMessage("pour info je suis en version "+ VERSION);

	var processed = false;

	// email
	processed = processAndReplyToEmail(msg);

	if (!processed) {
		msg.channel.sendMessage(msg.author + ", pour connaître ton numéro de commande, passes-moi ton mail en MP ! Bonne journée !");
	}
}

function parseMessage(msg, isEdit) {
	if (msg.author.id != bot.user.id && (msg.content.startsWith("!"))) {
		// FIXME les messages commençants par ! seront à traiter comme des commandes
	} else {

		// on ignore nos propres messages pour éviter les boucles infinies
		if (msg.author == bot.user) {
			return;
		}

		// les autres messages viennent des humains (ou autres bots)
		if (msg.author != bot.user) {
			if (msg.isMentioned(bot.user) || msg.content.match(/@CC/gi)) {
				// bot mentionné avec @CC
				processAndReply(msg);
			} else {
				// on ignore les autres messages qui ne nous sont pas destinés en général?
			}
		}
	}
}
bot.on("message", (msg) => parseMessage(msg, false));
bot.on("messageUpdate", (oldMessage, newMessage) => {
	//replyToMessage(newMessage,true);
	//msg.channel.sendMessage("Désolé " + msg.author + " mais je ne sais pas réagir aux edits de messages... yolo !");
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
