import {SlashCommandBuilder} from "@discordjs/builders";
import {EmbedBuilder} from "discord.js";

const random = new SlashCommandBuilder()
	.setName("random")
	.setDescription(
		"Tire des personnages de manière aléatoire en excluant certaines saisons ou niveaux"
	)
	.addIntegerOption((option) =>
		option
			.setName("nombre")
			.setDescription("Nombre de personnages à tirer (par défaut 1)")
			.setRequired(false)
	)
	.addStringOption((option) =>
		option
			.setName("exclure_saison")
			.setDescription("Saison(s) à exclure")
			.setRequired(false)
			.addChoices(
				{name: "Saison 1", value: "1"},
				{name: "Saison 2", value: "2"},
				{name: "Marvel", value: "3"},
				{name: "Saison 1 et 2", value: "1,2"},
				{name: "Saison 1 et Marvel", value: "1,3"},
				{name: "Saison 2 et Marvel", value: "2,3"}
			)
	)
	.addStringOption((option) =>
		option
			.setName("exclure_niveau")
			.setDescription(
				"Niveau(x) à exclure (séparés par des virgules, ex: 1,2,3)"
			)
			.setRequired(false)
	);

async function execute(interaction, db) {
	const nombre = interaction.options.getInteger("nombre") || 1;
	const exclureSaison = interaction.options.getString("exclure_saison");
	const exclureNiveau = interaction.options.getString("exclure_niveau");

	let query = "SELECT * FROM personnages";
	let params = [];

	if (exclureSaison !== null) {
		const saisons = exclureSaison.split(",").map(Number);
		const placeholders = saisons.map(() => "?").join(",");
		query += ` WHERE saison NOT IN (${placeholders})`;
		params.push(...saisons);
	}

	if (exclureNiveau !== null) {
		const niveaux = exclureNiveau.split(",").map(Number);
		const placeholders = niveaux.map(() => "?").join(",");
		if (params.length > 0) {
			query += ` AND niveau NOT IN (${placeholders})`;
		} else {
			query += ` WHERE niveau NOT IN (${placeholders})`;
		}
		params.push(...niveaux);
	}

	query += " ORDER BY RAND() LIMIT ?";
	params.push(nombre);

	try {
		const [rows] = await db.execute(query, params);
		if (rows.length > 0) {
			const response = rows.map((p) => {
				const embed = new EmbedBuilder()
					.setTitle(p.nom)
					.setImage(p.image_url)
					.setFooter({
						text: `Saison: ${p.saison} | Niveau: ${p.niveau}`,
						iconURL:
							"https://media.discordapp.net/attachments/1067570535418044568/1240416159002656778/DtTrans.png?ex=66467b12&is=66452992&hm=4d7f3186b9521748bd1be8f55df80855832f52de7394e67c128da3c776bbfc0b&=&format=webp&quality=lossless",
					}); // Optionnel: vous pouvez utiliser une icône pour le footer
				return embed;
			});
			const introMessage =
				"Le Roi Fou a lancé ses dés et votre destin est maintenant scellé !";
			await interaction.reply({content: introMessage, embeds: response});
		} else {
			await interaction.reply("Aucun personnage trouvé.");
		}
	} catch (err) {
		console.error(err);
		await interaction.reply(
			"Une erreur est survenue lors du tirage des personnages."
		);
	}
}

export default {
	data: random.toJSON(),
	execute,
};
