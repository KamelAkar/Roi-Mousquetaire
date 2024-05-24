import {SlashCommandBuilder} from "@discordjs/builders";

const reset = new SlashCommandBuilder()
	.setName("reset")
	.setDescription("Supprime toutes les équipes et tous les matchs");

async function execute(interaction, db) {
	try {
		await db.execute("DELETE FROM matchs");
		await db.execute("DELETE FROM equipes");
		await interaction.reply(
			"Toutes les équipes et tous les matchs ont été supprimés."
		);
	} catch (err) {
		console.error(err);
		await interaction.reply(
			"Une erreur est survenue lors de la suppression des équipes et des matchs."
		);
	}
}

export default {
	data: reset.toJSON(),
	execute,
};
