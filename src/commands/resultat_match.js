import {SlashCommandBuilder} from "@discordjs/builders";
import {REST, Routes} from "discord.js";

async function fetchEquipes(db) {
	const [equipes] = await db.execute("SELECT nom FROM equipes");
	return equipes
		.map((equipe) => ({name: equipe.nom, value: equipe.nom}))
		.filter((equipe) => equipe.value);
}

function createCommand(equipes = []) {
	return new SlashCommandBuilder()
		.setName("resultat_match")
		.setDescription("Enregistre le résultat d'un match")
		.addStringOption((option) =>
			option
				.setName("equipe1")
				.setDescription("Nom de l'équipe 1")
				.setRequired(false)
				.addChoices(...equipes)
		)
		.addStringOption((option) =>
			option
				.setName("equipe2")
				.setDescription("Nom de l'équipe 2")
				.setRequired(false)
				.addChoices(...equipes)
		)
		.addBooleanOption((option) =>
			option
				.setName("egalite")
				.setDescription("Le match s'est-il terminé par une égalité?")
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName("vainqueur")
				.setDescription("Nom de l'équipe gagnante")
				.setRequired(false)
				.addChoices(...equipes)
		)
		.addBooleanOption((option) =>
			option
				.setName("refresh")
				.setDescription("Rafraîchir la liste des équipes")
				.setRequired(false)
		)
		.toJSON();
}

async function execute(interaction, db) {
	const refresh = interaction.options.getBoolean("refresh");

	if (refresh) {
		const equipes = await fetchEquipes(db);
		const command = createCommand(equipes);
		const rest = new REST({version: "10"}).setToken(process.env.ROI_TOKEN);
		// Get existing commands
		const existingCommands = await rest.get(
			Routes.applicationGuildCommands(
				process.env.ROI_CLIENT_ID,
				process.env.ROI_GUILD_ID
			)
		);
		// Update only the resultat_match command
		const updatedCommands = existingCommands.map((cmd) =>
			cmd.name === "resultat_match" ? command : cmd
		);
		await rest.put(
			Routes.applicationGuildCommands(
				process.env.ROI_CLIENT_ID,
				process.env.ROI_GUILD_ID
			),
			{body: updatedCommands}
		);
		await interaction.reply("La liste des équipes a été rafraîchie.");
		return;
	}

	const equipe1Name = interaction.options.getString("equipe1");
	const equipe2Name = interaction.options.getString("equipe2");
	const vainqueurName = interaction.options.getString("vainqueur");
	const egalite = interaction.options.getBoolean("egalite");

	if (!equipe1Name || !equipe2Name || (egalite === null && !vainqueurName)) {
		await interaction.reply(
			"Veuillez fournir les détails du match ou utiliser l'option refresh pour mettre à jour la liste des équipes."
		);
		return;
	}

	try {
		const [[equipe1]] = await db.execute(
			"SELECT id FROM equipes WHERE nom = ?",
			[equipe1Name]
		);
		const [[equipe2]] = await db.execute(
			"SELECT id FROM equipes WHERE nom = ?",
			[equipe2Name]
		);

		if (!equipe1 || !equipe2) {
			await interaction.reply(
				"Une ou plusieurs équipes n'ont pas été trouvées."
			);
			return;
		}

		if (egalite) {
			await db.execute(
				"UPDATE matchs SET vainqueur_id = NULL, egalite = TRUE WHERE (equipe1_id = ? AND equipe2_id = ?) OR (equipe1_id = ? AND equipe2_id = ?)",
				[equipe1.id, equipe2.id, equipe2.id, equipe1.id]
			);
			await db.execute("UPDATE equipes SET points = points + 1 WHERE id = ?", [
				equipe1.id,
			]);
			await db.execute("UPDATE equipes SET points = points + 1 WHERE id = ?", [
				equipe2.id,
			]);
			await interaction.reply(
				`Le match entre ${equipe1Name} et ${equipe2Name} s'est terminé par une égalité. Les deux équipes reçoivent 1 point.`
			);
		} else {
			const [[vainqueur]] = await db.execute(
				"SELECT id FROM equipes WHERE nom = ?",
				[vainqueurName]
			);
			if (!vainqueur) {
				await interaction.reply("L'équipe gagnante n'a pas été trouvée.");
				return;
			}

			const [result] = await db.execute(
				"UPDATE matchs SET vainqueur_id = ?, egalite = FALSE WHERE (equipe1_id = ? AND equipe2_id = ?) OR (equipe1_id = ? AND equipe2_id = ?)",
				[vainqueur.id, equipe1.id, equipe2.id, equipe2.id, equipe1.id]
			);

			if (result.affectedRows > 0) {
				await db.execute(
					"UPDATE equipes SET points = points + 3 WHERE id = ?",
					[vainqueur.id]
				);
				await interaction.reply(
					`Le résultat du match entre ${equipe1Name} et ${equipe2Name} a été enregistré. Vainqueur: ${vainqueurName}.`
				);
			} else {
				await interaction.reply("Le match n'a pas été trouvé.");
			}
		}
	} catch (err) {
		console.error(err);
		await interaction.reply(
			"Une erreur est survenue lors de l'enregistrement du résultat du match."
		);
	}
}

export default {
	fetchEquipes,
	createCommand,
	execute,
};
