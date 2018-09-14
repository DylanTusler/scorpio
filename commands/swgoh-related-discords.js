module.exports = async ( client, message ) => {
	
	try {
		
		let embed = {};
	    embed.title = "Discord funnel";
		embed.description = '`------------------------------`\n';
	    embed.description += '**Game changer discords**\n';
	    embed.description += '✦ [CubsFanHan](https://discord.gg/QC6gCNX) \n';
	    embed.description += '✦ [Halfface01](https://discord.gg/aVxHPFp) \n';
	    embed.description += '✦ [Remon Δzαb](https://discord.gg/jGeSQUW) \n';
	    embed.description += '✦ [AhnoldT101](https://discord.gg/eT3SZCj) \n';
	    embed.description += '✦ [MobileGamer](https://discord.gg/tN9CSmj) \n';
	    
	    embed.description += '`------------------------------`\n';
	    embed.description += '**Faction specific discords**\n';
	    embed.description += '✦ [Jedi](https://discord.gg/Q9XWzVx) \n';
	    embed.description += '✦ [Sith](https://discord.gg/Pa4PFfZ) \n';
	    embed.description += '✦ [Empire](https://discord.gg/cqAU32U) \n';
	    embed.description += '✦ [Ewoks](https://discord.gg/CeaqCan) \n';
	    embed.description += '✦ [Resistance](https://discord.gg/Zt6bDz5) \n';
	    embed.description += '✦ [First Order](https://discord.gg/nb5X7WP) \n';
	    embed.description += '✦ [Fleets](https://discord.gg/PSmX6z9) \n';
	    embed.description += '✦ [Night Sisters](https://discord.gg/meNXqyT) \n';
	    embed.description += '✦ [Bounty Hunters](https://discord.gg/FBM9ZW7) \n';
	    
	    embed.description += '`------------------------------`\n';
	    embed.description += '**Other great resources**\n';
	    embed.description += '✦ [CrazyExcuses](https://discord.gg/4eb7J7U) \n';
	    embed.description += '✦ [SWGoH University](https://discord.gg/euSynux) \n';
	    embed.description += '`------------------------------`\n';
	
		embed.color = 0x2A6EBB;
		embed.timestamp = new Date();

		message.react('ℹ');
		message.channel.send({embed});
		
	} catch(e) {
		throw e;
	}

}
