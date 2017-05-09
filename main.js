/*
	Chatbot personnalisé ultra-basique pour Discord
*/
const fs = require('fs');
const util = require('util');

const VERSION = "0.1.2";

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


function randomMessage(msg) {
	var messages = [
		"Hey "+ msg.author +" !",
		"Ha ha ha ...",
		"Ok !",
		"Lelouuche! (/me sors)",
		"...",
		"^^:",
		"Hello World !",
		"Hello "+ msg.author +" !",
		"Les bots sont des génies... ou pas!",
		"qui m'aime me suive... ..."+ msg.author +"?",
		""+ msg.author +"!! stoooop... je comprend rien!",
		"le numéro composé n'est pas disponible!",
		"moi présidente!",
		"ok "+ msg.author +"... pour le moment je suis pas très intelligente, MAIS ça va changer! Peut-être!",
		""+ msg.author +", demande à @will pour me reprogrammer!",
		"bonne journée!",
		"je sais parler dans ...mmh une seule langue. déso!",
		"#discord #shadow #CC",
		"#CC4EVER !",
		"à vos ordre! Oui, mon #general!",
		"un mail donné, un numéro de commande renvoyé! Oh yeah!",
		"magique !",
		"flippant...",
		"Vive les Shadow! Mes petits frères, qui sont trop forts!",
		"C'est kro-meugnon! *_*",
		"<3 !",
		"Go overwatch bo3 (hum... non)",
		"challenge accepted !"
	];
	return messages[Math.floor(Math.random() * messages.length)];
}

function fetchEmail(msg) {
	var REGEX_EMAIL = /([0-9A-Z_\-\.]+@[0-9a-zA-Z_\-\.]{4,})/gi;
	var email_matches = msg.content.match(REGEX_EMAIL);

	if (email_matches != null) {
		console.log("email detected ("+ email_matches.length +") : "+ email_matches)
		if (email_matches.length >= 1)
			return email_matches[0];
	}
	return null;
}

function isShippingRequest(str) {
	str = str.toLowerCase();
	return (str.indexOf("commande") > -1 || str.indexOf("livraison") > -1 || str.indexOf("ordre") > -1 || str.indexOf("placement") > -1)
}

function processAndReplyToEmail(msg, email) {
	// email
	if (email !== null) {
		console.log("email detected : " + email);
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

		if (msg.channel.client == undefined) {
			// pas sur un channel privé
			msg.channel.sendMessage("PS: Attention " + msg.author + " ! Passes ton mail seulement MP stp !!! (supprimes ton msg car tu es sur un chan public)");
		}

		return true;
	}
	return false;
}

function processAndReply(msg) {
	if (msg.content.indexOf("version") != -1) {
		// renvoie le numéro de version
		msg.channel.sendMessage("pour info je suis en version "+ VERSION);
	}
	else if (fetchEmail(msg)) {
		// renvoie un numér de commande si un email est détecté
		processAndReplyToEmail(msg, fetchEmail(msg));
	}
	else if (isShippingRequest(msg.content)) {
		// invite à fournir un mail si demande de numéro de commande potentielle
		msg.channel.sendMessage(msg.author + ", pour connaître ton numéro de commande, passes-moi ton mail en MP ! Bonne journée !");
	}
	else {
		// réponse random
		msg.channel.sendMessage(randomMessage(msg));
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
