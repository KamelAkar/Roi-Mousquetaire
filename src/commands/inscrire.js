import {SlashCommandBuilder} from "@discordjs/builders";

const inscrire = new SlashCommandBuilder()
	.setName("inscrire")
	.setDescription("Inscrire une nouvelle équipe")
	.addStringOption((option) =>
		option.setName("nom").setDescription("Nom de l'équipe").setRequired(true)
	)
	.addStringOption((option) =>
		option.setName("pool").setDescription("Pool de l'équipe").setRequired(true)
	)
	.addIntegerOption((option) =>
		option
			.setName("points")
			.setDescription("Points initiaux de l'équipe")
			.setRequired(false)
	);

async function execute(interaction, db) {
	const nom = interaction.options.getString("nom");
	const pool = interaction.options.getString("pool");
	const points = interaction.options.getInteger("points") || 0;

	try {
		await db.execute(
			"INSERT INTO equipes (nom, pool, points) VALUES (?, ?, ?)",
			[nom, pool, points]
		);
		await interaction.reply(
			`Équipe ${nom} inscrite avec succès dans la pool ${pool} avec ${points} points.`
		);
	} catch (err) {
		console.error(err);
		await interaction.reply(
			"Une erreur est survenue lors de l'inscription de l'équipe."
		);
	}
}

export default {
	data: inscrire.toJSON(),
	execute,
};
