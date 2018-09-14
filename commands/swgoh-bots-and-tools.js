module.exports = async ( client, message ) => {
	
	try {
		
		let embed = {};

		embed.title = "Bro-bots and recommended swgoh tools";

		embed.description = '`------------------------------`\n';
		
		embed.description += "**Crouching Rancor**\n";
		embed.description += "Mod management, advice and various calculators and tools.\n";
		embed.description += "✦ [Website](http://apps.crouchingrancor.com/) \n\n";

		embed.description += "**DSR Bot**\n";
		embed.description += "Reporting your guild's heroic sith raid readiness.\n";
		embed.description += "✦ [Discord](https://discord.gg/fkwypSp) \n\n";
	
		embed.description += "**SWGoHBot**\n";
		embed.description += "Reporting player and guild data with a wide variety of tools.\n";
		embed.description += "✦ [Discord](https://discord.gg/FfwGvhr) \n\n";
		
		embed.description += "**MouseBot**\n";
		embed.description += "Reporting player collection data with other miscellaneous features.\n";
		embed.description += "✦ [Discord](https://discord.gg/VFUatwk) \n\n";
		
		embed.description += "**Echo Base / Echo Station**\n";
		embed.description += "Calculate platoon orders by screenshot. Dispatch to discord.\n";
		embed.description += "✦ [Discord](https://discord.gg/MnkBsyT) \n\n";

		embed.description += "**Mods Optimizer**\n";
		embed.description += "Visualize, organize and optimize your unit mods.\n";
		embed.description += "✦ [Discord](https://discord.gg/Sjs9zkK) \n\n";

		embed.description += "**SWGoH.help**\n";
		embed.description += "Manage your own or your whole guild's roster progress\n";
		embed.description += "✦ [Discord](https://discord.gg/hGjtStC) \n\n";

		embed.description += "**SWGoH.life**\n";
		embed.description += "A collection of useful tools and resources\n";
		embed.description += "✦ [Discord](https://discord.gg/SwuKxvG) \n\n";

		embed.description += "**C-3PO**\n";
		embed.description += "The wikiest Star Wars lore-bot\n";
		embed.description += "✦ [Discord](https://discord.gg/R3Ym5D4) \n\n";

		embed.description += "**Kaos Bot**\n";
		embed.description += "Officer poll and warning tools. Plus some fun stuff.\n";
		embed.description += "✦ [Discord](https://discord.gg/nu99Snr) \n\n";

		embed.description += '`------------------------------`\n';
		
		embed.color = 0x2A6EBB;
		embed.timestamp = new Date();

		message.react('ℹ');
		message.channel.send({embed});
		
	} catch(e) {
		throw e;
	}

}
