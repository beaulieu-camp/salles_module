const { Client, Intents} = require('discord.js');
const sl = require('./main');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

const { token } = require('./token.json');

const liveGuildId = "619496069184618498"
const liveChannelId = "940691747770605628"
var liveMessage;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;


    if (interaction.commandName === 'salle') {

		const horaire = interaction.options.getInteger("horaire");
		const jour = interaction.options.getInteger("jour");
		const definedSalle = interaction.options.getString("salle");

		var title = "Salles Ouvertes"

		var date = new Date();
		if (jour != undefined){
			date.setDate(date.getDate() + jour)
			title += " le " + date.getDate()
		}
		if (horaire != undefined) {
			date.setHours(horaire)
			title += " à " + horaire + "h"
		}

		var fields = [{
			"name" : "En cours d'actualisation ...",
			"value": "Si tu pense qu'il s'agit d'une erreur, contacte un modérateur"
		}]

		const fieldsVide = [{
			"name" : "Aucune salle ne semble disponible actuellement",
			"value": "Si tu pense qu'il s'agit d'une erreur, contacte un modérateur"
		}]

		var embed = createEmbed(title, fields)

        interaction.reply({"embeds" : [embed]});

        var salles = sl.salles;
		if (definedSalle != undefined) salles = [definedSalle];
		fields = [];

        for (var i=0; i < salles.length; i++){

            const salle = salles[i]
            await sl.salleLibres(salle, date)
            .then(state => {
                if (state["state"]) fields.push(messageState(salle, state));
            })
            .catch(console.error)

        }

		embed = createEmbed(title, fields)

		if (/*fields.length != 0 */ false) interaction.editReply({"embeds" : [embed]})
		else interaction.editReply({"embeds" : [createEmbed(title, fieldsVide)]})

    }

})

function sendState(channel, salle, state){

    var message = ""
    //Si la salle est un amphi
    if (salle.includes("amphi") ) message += "L'" + salle + " ";
    else message += "La " + sl.salles_names[salle] + " ";

    if (state["state"]) message += "est disponible jusqu'a "
    else message += "est indisponible jusqu'a "
    const date = new Date((state["until"]))
    message += date.toLocaleDateString("fr-FR", {weekday: "long", day: "numeric", hour: "numeric", minute: "numeric"})
    channel.send(message + "\n");

}

function messageState(salle, state){

	const date = new Date((state["until"]))
	date.setHours(date.getHours() + 1)
	var res = {
		"name" : sl.salles_names[salle],
		"value" : "Ouvert jusqu'à " + date.toLocaleDateString("fr-FR", {weekday: "long", day: "numeric", hour: "numeric", minute: "numeric"})
	}
	return res

}

function createEmbed(title, fields){
	return {
		"color": null,
		 "fields": fields,
		 "author": {
		   "name": title,
		   "icon_url": "https://cdn.discordapp.com/icons/619496069184618498/505d82722799b797c65b6a55ca5d3cf8.webp?size=96"
		 },
		 "footer": {
		   "text": "SEB - https://github.com/AquaBx/salles_esir"
		 }
   }
}

client.login(token);
