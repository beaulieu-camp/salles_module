const { Client, Intents} = require('discord.js');
const sl = require('./main');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

const { token } = require('./token.json');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    
    
    if (interaction.commandName === 'find') {
        interaction.deferReply();
    
        const salles = sl.salles;
        const channel = interaction.channel;

        for (var i=0; i < salles.length; i++){

            const salle = salles[i]
            sl.salleLibres(salle)
            .then(state => sendState(channel, salle, state))
            .catch(console.error)

        }

        interaction.reply("Commande terminée")

    }

})

function sendState(channel, salle, state){

    var message = ""
    //Si la salle est un amphi
    if (salle.includes("amphi") ) message += "L'" + salle + " ";
    else message += "La " + salle + " ";

    if (state["state"]) message += "est disponible jusqu'a "
    else message += "est indisponible jusqu'a "

    message += sl.convert_unix_to_local(state["until"])
    channel.send("message");

}

client.login(token);