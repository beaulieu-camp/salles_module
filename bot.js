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
            await sl.salleLibres(salle)
            .then(state => {
                if (state["state"]) sendState(channel, salle, state)
            })
            .catch(console.error)

        }

        interaction.reply("Commande terminée, " + salles.length + " ont été analysés")

    }

})

function sendState(channel, salle, state){

    var message = ""
    //Si la salle est un amphi
    if (salle.includes("amphi") ) message += "L'" + salle + " ";
    else message += "La " + salle + " ";

    if (state["state"]) message += "est disponible jusqu'a "
    else message += "est indisponible jusqu'a "

    message += dateToString(sl.convert_unix_to_local(state["until"]))
    channel.send(message + "\n");

}

function dateToString(date){
    var res = ""

    const Day = date.getDay();
    if (Day == 0) res += "Lundi "
    else if (Day == 1) res += "Mardi "
    else if (Day == 2) res += "Mercredi "
    else if (Day == 3) res += "Jeudi "
    else if (Day == 4) res += "Vendredi "
    else if (Day == 5) res += "Samedi "
    else if (Day == 6) res += "Dimanche "

    res += date.getDate() + " à ";
    res += date.getHours() + "h";
    if (date.getMinutes() != 0) res += date.getMinutes()
    
    return res;
}

client.login(token);