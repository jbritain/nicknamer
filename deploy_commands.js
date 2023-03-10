const fs = require('node:fs');
const path = require('node:path');
const { REST, SlashCommandBuilder, Routes } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const clientID = process.env.CLIENT_ID
const devServerID = process.env.DEV_SERVER_ID // the server the bot is tested in
var devMode = process.env.DEV_MODE // whether we are deploying commands globally or only in the testing server

if (devMode == null){
    devMode = true; // default to true if dev mode not specified
}

// load commands from 'commands' folder
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

console.log(commands)

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

if (devMode){
    rest.put(Routes.applicationGuildCommands(clientID, devServerID), { body: [] }) // delete all commands on dev server
	    .then(() => console.log('Successfully deleted all guild commands.'))
	    .catch(console.error);

    rest.put(Routes.applicationGuildCommands(clientID, devServerID), { body: commands }) // deploy commands only to dev server
        .then((data) => console.log(`Successfully registered ${data.length} application commands.`))
        .catch(console.error);
} else {

    rest.put(Routes.applicationCommands(clientId), { body: [] }) // delete all global commands
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error);

    rest.put(Routes.applicationGuildCommands(clientID), { body: commands }) // deploy commands to all servers
        .then((data) => console.log(`Successfully registered ${data.length} application commands.`))
        .catch(console.error);
}