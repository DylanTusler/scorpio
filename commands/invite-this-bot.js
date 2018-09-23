module.exports = async ( client, message ) => {
	
	try {
		
		let embed = {};

		embed.title = client.user.username+" - Server invite";

		embed.description = '`------------------------------`\n';
		embed.description += "✦ [Invite "+client.user.username+" to your own server](https://discordapp.com/oauth2/authorize?client_id="+client.user.id+"&scope=bot&permissions=515136) \n";
		embed.description += '`------------------------------`\n';
		embed.description += "Note: Server administration \n"
		embed.description += "permissions required to invite \n";
						
		embed.color = 0x2A6EBB;
		embed.timestamp = new Date();

		message.react('ℹ');
		message.channel.send({embed});
		
	} catch(e) {
		throw e;
	}

}
