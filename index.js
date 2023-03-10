const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// load commands from 'commands' folder
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

let nicknameChanges = {} // if user 'JoshTheB' changes the nickname of user 'SolidStateDrive' then nicknameChanges["JoshTheB"] = "SolidStateDrive" except of course it works on Guild Member IDs

// respond to commands
client.on('interactionCreate', async interaction => {
	if (interaction.isUserContextMenuCommand()) {
		if (interaction.commandName !== "Change Nickname") return;

		const nicknameModal = new ModalBuilder()
			.setCustomId("nicknameModal")
			.setTitle("Enter Nickname")

		const nicknameInput = new TextInputBuilder()
			.setCustomId("nicknameInput")
			.setLabel("Please enter a nickname")
			.setStyle(TextInputStyle.Short)
			.setRequired(true)

		nicknameChanges[interaction.member.id] = interaction.targetMember.id
		const nicknameRow = new ActionRowBuilder().addComponents(nicknameInput);
		await nicknameModal.addComponents(nicknameRow);
		await interaction.showModal(nicknameModal);
	} else if (interaction.isModalSubmit()) {
		if (interaction.customId === "nicknameModal"){
			targetUser = interaction.guild.members.cache.get(nicknameChanges[interaction.member.id])

			await targetUser.setNickname(interaction.fields.getTextInputValue("nicknameInput")).catch(e => {
				interaction.reply("There was an error setting the nickname");
			});
			
		}
	}
	
});
client.once('ready', () => {
	console.log('Ready!');
});

client.login(process.env.token);