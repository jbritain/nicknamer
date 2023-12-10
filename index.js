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

function getTime(){
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	return date+' '+time;
}

let nicknameChanges = {} // if user 'JoshTheB' changes the nickname of user 'Max' then nicknameChanges["JoshTheB"] = "SolidStateDrive" except of course it works on Guild Member IDs

// respond to commands
client.on('interactionCreate', async interaction => {
	if (interaction.isUserContextMenuCommand()) {
		if (interaction.commandName !== "Change Nickname") return;

		nicknameChanges[interaction.member.id] = interaction.targetMember.id
		targetUser = interaction.guild.members.cache.get(nicknameChanges[interaction.member.id]);

		const nicknameModal = new ModalBuilder()
			.setCustomId("nicknameModal")
			.setTitle("Enter Nickname")

		const nicknameInput = new TextInputBuilder()
			.setCustomId("nicknameInput")
			.setLabel("Please enter a nickname")
			.setStyle(TextInputStyle.Short)
			.setRequired(false)
			.setMaxLength(32)
			.setValue(targetUser.nickname || targetUser.user.username)
			.setPlaceholder(targetUser.user.username)

		const nicknameRow = new ActionRowBuilder().addComponents(nicknameInput);
		await nicknameModal.addComponents(nicknameRow);
		await interaction.showModal(nicknameModal);
	} else if (interaction.isModalSubmit()) {
		if (interaction.customId === "nicknameModal"){
			

			let hasErrored = false;
			let newNickname = interaction.fields.getTextInputValue("nicknameInput")

			await targetUser.setNickname(newNickname).catch(e => {
				hasErrored = true;
				console.error(e);
				interaction.reply({
					content: `There was an error setting the nickname: \`\`\`${e.message}\`\`\``,
					ephemeral: true
				});
			});
			
			if (!hasErrored){
				console.log(`[${getTime()}] User '@${interaction.user.username}' updated the username of '@${targetUser.user.username}' to '${newNickname}'`)
				interaction.deferUpdate()
			}
		}
	}
	
});
client.once('ready', () => {
	console.log('Ready!');
});

client.login(process.env.TOKEN);