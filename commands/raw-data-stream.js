module.exports = async ( client, message ) => {
	
	try {
		
		let embed = {};

		embed.title = "SWGoH Data";

		embed.description = '`------------------------------`\n';
		embed.description += "✦ [Gamedata API @ swgoh.help](https://api.swgoh.help/) \n";
		embed.description += "✦ [Gamedata API @ swgoh.gg](https://swgoh.gg/api/) \n";
		embed.description += '`------------------------------`\n';
						
		embed.color = 0x2A6EBB;
		embed.timestamp = new Date();

		message.react('ℹ');
		message.channel.send({embed});
		
	} catch(e) {
		throw e;
	}

}
