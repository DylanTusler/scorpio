module.exports = async ( client, message ) => {
	
	try {
		
		let embed = {};
		
		embed.title = client.user.username+" commands";

		embed.description = '`------------------------------`\n';
        for( let k in client.settings.commands ) {
            embed.description += `**${client.settings.prefix}${k}** : ${client.settings.commands[k].replace('.js','').replace(/-/g,' ')}\n`;
        }
		embed.description += '`------------------------------`\n';
		
		embed.color = 0x2A6EBB;
		embed.timestamp = new Date();

		message.react('ℹ');
		message.channel.send({embed});
		
	} catch(e) {
		throw e;
	}

}
