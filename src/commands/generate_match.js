import {SlashCommandBuilder} from "@discordjs/builders";

const generateMatch = new SlashCommandBuilder()
	.setName("generate_match")
	.setDescription("Génère automatiquement les matchs pour chaque pool");

async function execute(interaction, db) {
	try {
		const [equipes] = await db.execute(
			"SELECT * FROM equipes ORDER BY pool, id"
		);

		// Grouper les équipes par pool
		const poules = {};
		equipes.forEach((equipe) => {
			const poule = equipe.pool;
			if (!poules[poule]) poules[poule] = [];
			poules[poule].push(equipe);
		});

		// Générer les matchs pour chaque pool
		for (const poule in poules) {
			const equipesPoule = poules[poule];
			for (let i = 0; i < equipesPoule.length; i++) {
				for (let j = i + 1; j < equipesPoule.length; j++) {
					await db.execute(
						"INSERT INTO matchs (equipe1_id, equipe2_id) VALUES (?, ?)",
						[equipesPoule[i].id, equipesPoule[j].id]
					);
				}
			}
		}

		await interaction.reply(
			"Les matchs ont été générés avec succès pour chaque pool."
		);
	} catch (err) {
		console.error(err);
		await interaction.reply(
			"Une erreur est survenue lors de la génération des matchs."
		);
	}
}

export default {
	data: generateMatch.toJSON(),
	execute,
};
