import {SlashCommandBuilder} from "@discordjs/builders";

const info = new SlashCommandBuilder()
	.setName("info")
	.setDescription("Affiche des informations sur le bot");

async function execute(interaction) {
	await interaction.reply({
		content: `**Bonjour à toi <@${interaction.user.id}> !** Je suis le Roi Fou, le bot officel de Dice Throne France ! Mon créateur est <@276463620043309057> ! \n\n Je suis encore en développement, mais je suis déjà capable de faire quelques trucs ! \n\n Pour voir la liste des commandes, tape \`/help\` ! \n\n Si tu as des idées de fonctionnalités, n'hésite pas à les proposer à <@276463620043309057> ! \n\n Bonne journée !`,
		ephemeral: true,
	});
}

export default {
	data: info.toJSON(),
	execute,
};
