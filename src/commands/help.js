import {SlashCommandBuilder} from "@discordjs/builders";

const help = new SlashCommandBuilder()
	.setName("help")
	.setDescription(
		"Affiche la liste de toutes les commandes ou des détails sur une commande spécifique"
	)
	.addStringOption((option) =>
		option
			.setName("commande")
			.setDescription(
				"La commande pour laquelle vous souhaitez plus de détails"
			)
			.setRequired(false)
			.addChoices(
				{name: "info", value: "info"},
				{name: "random", value: "random"}
			)
	);

async function execute(interaction) {
	const commandToDetail = interaction.options.getString("commande");

	if (commandToDetail) {
		let detailedHelpMessage = `## Détails sur la commande '${commandToDetail}'\n\n`;

		switch (commandToDetail) {
			case "info":
				detailedHelpMessage += "**Donne des informations sur le bot** \n";
				break;
			case "random":
				detailedHelpMessage +=
					"**Tire des personnages de manière aléatoire en excluant certaines saisons ou niveaux**\n";
				detailedHelpMessage += "Paramètres :\n";
				detailedHelpMessage +=
					"- `nombre` (optionnel) : Nombre de personnages à tirer (par défaut 1)\n";
				detailedHelpMessage +=
					"- `exclure_saison` (optionnel) : Saison(s) à exclure. Choisissez parmi:\n";
				detailedHelpMessage += "  - Saison 1\n";
				detailedHelpMessage += "  - Saison 2\n";
				detailedHelpMessage += "  - Marvel\n";
				detailedHelpMessage += "  - Saison 1 et 2\n";
				detailedHelpMessage += "  - Saison 1 et Marvel\n";
				detailedHelpMessage += "  - Saison 2 et Marvel\n";
				detailedHelpMessage +=
					"- `exclure_niveau` (optionnel) : Niveau(x) à exclure, séparés par des virgules (ex: `1,2,3`)\n";
				detailedHelpMessage +=
					"Utilisation : `/random [nombre] [exclure_saison] [exclure_niveau]`\n";
				break;
		}

		await interaction.reply({
			content: detailedHelpMessage,
			ephemeral: true,
		});
	} else {
		const summaryHelpMessage =
			"Voici les commandes disponibles:\n" +
			"- `/info`: Affiche des informations sur le bot.\n" +
			"- `/help`: Affiche ce message d'aide.\n" +
			"- `/random`: Tire des personnages de manière aléatoire en excluant certaines saisons ou niveaux.\n" +
			"\n" +
			"Pour plus de détails sur une commande, utilisez `/help <commande>`.\n";

		await interaction.reply({content: summaryHelpMessage, ephemeral: true});
	}
}

export default {
	data: help,
	execute,
};
