import {SlashCommandBuilder} from "@discordjs/builders";
import {EmbedBuilder} from "discord.js";

const pool = new SlashCommandBuilder()
	.setName("pool")
	.setDescription("Affiche le tableau des équipes en mode phase de pool");

async function execute(interaction, db) {
	try {
		const [equipes] = await db.execute(
			"SELECT * FROM equipes ORDER BY pool, id"
		);
		const [matchs] = await db.execute("SELECT * FROM matchs");

		if (equipes.length > 0) {
			const embeds = [];

			const poules = {};
			equipes.forEach((equipe) => {
				const poule = `Poule ${equipe.pool}`;
				if (!poules[poule]) poules[poule] = [];
				poules[poule].push(equipe);
			});

			for (const poule in poules) {
				const embed = new EmbedBuilder()
					.setTitle(`Tableau des Équipes - ${poule}`)
					.setColor("#00FF00");

				poules[poule].forEach((equipe) => {
					const matchDetails = matchs
						.filter(
							(match) =>
								match.equipe1_id === equipe.id || match.equipe2_id === equipe.id
						)
						.map((match) => {
							const adversaireId =
								match.equipe1_id === equipe.id
									? match.equipe2_id
									: match.equipe1_id;
							const adversaire = equipes.find((e) => e.id === adversaireId);
							let result;
							if (match.egalite) {
								result = "Égalité";
							} else if (match.vainqueur_id === null) {
								result = "Non joué";
							} else {
								result = match.vainqueur_id === equipe.id ? "Gagné" : "Perdu";
							}
							return `vs ${adversaire.nom}: ${result}`;
						})
						.join("\n");

					// Vérifier que les valeurs ne sont pas vides ou nulles
					if (equipe.nom && matchDetails && equipe.points !== null) {
						embed.addFields(
							{name: `Équipe`, value: equipe.nom, inline: true},
							{
								name: `Matchs`,
								value: matchDetails || "Aucun match",
								inline: true,
							},
							{name: `Points`, value: equipe.points.toString(), inline: true}
						);
					} else {
						console.log(`Équipe ignorée : ${JSON.stringify(equipe)}`);
					}
				});

				embeds.push(embed);
			}

			await interaction.reply({embeds});
		} else {
			await interaction.reply("Aucune équipe trouvée.");
		}
	} catch (err) {
		console.error(err);
		await interaction.reply(
			"Une erreur est survenue lors de l'affichage des équipes."
		);
	}
}

export default {
	data: pool.toJSON(),
	execute,
};
