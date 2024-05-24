import {config} from "dotenv";
import {
	Client,
	GatewayIntentBits,
	REST,
	Routes,
	InteractionType,
	ActivityType,
} from "discord.js";
import mysql from "mysql2/promise";

import info from "./commands/info.js";
import help from "./commands/help.js";
import random from "./commands/random.js";
import pool from "./commands/pool.js";
import inscrire from "./commands/inscrire.js";
import generateMatch from "./commands/generate_match.js";
import resultatMatch from "./commands/resultat_match.js";
import reset from "./commands/reset.js";

config();
const TOKEN = process.env.ROI_TOKEN;
const CLIENT_ID = process.env.ROI_CLIENT_ID;
const GUILD_ID = process.env.ROI_GUILD_ID;
const SPECIAL_ROLE_ID = "946813012289916999";
const SPECIAL_USER_ID = "276463620043309057";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

const rest = new REST({version: "10"}).setToken(TOKEN);

async function connectToDatabase() {
	const db = await mysql.createPool({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
	});
	return db;
}

client.login(TOKEN);

client.on("ready", async () => {
	console.log(`Logged in as ${client.user.tag}!`);

	const db = await connectToDatabase();
	const equipes = await resultatMatch.fetchEquipes(db);
	const resultatMatchCommand = resultatMatch.createCommand(equipes);

	const commandsList = [
		info.data,
		help.data,
		random.data,
		pool.data,
		inscrire.data,
		generateMatch.data,
		reset.data,
		resultatMatchCommand,
	];

	try {
		console.log("Started refreshing application (/) commands.");
		await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
			body: commandsList,
		});
		console.log("Successfully reloaded application (/) commands.");
	} catch (error) {
		console.error(error);
	}

	// Mettre à jour l'activité du bot
	client.user.setActivity("Dice Throne", {type: ActivityType.Playing});
});

client.on("interactionCreate", async (interaction) => {
	if (interaction.type !== InteractionType.ApplicationCommand) return;

	const db = await connectToDatabase();

	const commandName = interaction.commandName;
	const allowedCommands = ["info", "help", "random", "pool"];
	const isSpecialUser = interaction.user.id === SPECIAL_USER_ID;
	const hasSpecialRole = interaction.member.roles.cache.has(SPECIAL_ROLE_ID);

	if (
		!allowedCommands.includes(commandName) &&
		!isSpecialUser &&
		!hasSpecialRole
	) {
		await interaction.reply({
			content: "Vous n'avez pas la permission d'utiliser cette commande.",
			ephemeral: true,
		});
		return;
	}

	if (commandName === "info") {
		await info.execute(interaction);
	} else if (commandName === "help") {
		await help.execute(interaction);
	} else if (commandName === "random") {
		await random.execute(interaction, db);
	} else if (commandName === "pool") {
		await pool.execute(interaction, db);
	} else if (commandName === "inscrire") {
		await inscrire.execute(interaction, db);
	} else if (commandName === "generate_match") {
		await generateMatch.execute(interaction, db);
	} else if (commandName === "resultat_match") {
		await resultatMatch.execute(interaction, db);
	} else if (commandName === "reset") {
		await reset.execute(interaction, db);
	}
});

async function main() {
	const db = await connectToDatabase();
	const equipes = await resultatMatch.fetchEquipes(db);
	const resultatMatchCommand = resultatMatch.createCommand(equipes);

	const commandsList = [
		info.data,
		help.data,
		random.data,
		pool.data,
		inscrire.data,
		generateMatch.data,
		reset.data,
		resultatMatchCommand,
	];

	try {
		console.log("Started refreshing application (/) commands.");
		await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
			body: commandsList,
		});
		console.log("Successfully reloaded application (/) commands.");
	} catch (error) {
		console.error(error);
	}
}

main();
