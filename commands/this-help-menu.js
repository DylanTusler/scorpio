module.exports = async ( client, message ) => {
	
	try {
		
		let embed = {};
		
		embed.title = client.user.username+' help - Prefix: '+client.settings.prefix;

		embed.description = '`------------------------------`\n';
		embed.description += 'Botmaster(s): <@!'+client.settings.botmasters.join('>, <@!')+'>\n';
		embed.description += client.settings.discord ? 'Need help? Visit [shittybots]('+client.settings.discord+')\n' : '';
		embed.description += client.settings.patreon ? 'Support me on [patreon]('+client.settings.patreon+')\n' : '';
		
        for( let c of client.settings.commands ) {
    		embed.description += '`------------------------------`\n';
            for( let k in c ) {
                embed.description += `**${k}** : ${c[k].replace('.js','').replace(/-/g,' ')}\n`;
            }
        }
		embed.description += '`------------------------------`\n';
		embed.description += 'Example:\n';
		embed.description += '```\n';
		embed.description += client.settings.prefix+'add me 123456789\n';
		embed.description += client.settings.prefix+'player me\n';
		embed.description += client.settings.prefix+'zeta me\n';
		embed.description += '```\n';
		embed.description += '*Data provided by [api.swgoh.help](https://api.swgoh.help)*';
		
		
		embed.color = 0x2A6EBB;
		embed.timestamp = new Date();

		message.react('ℹ');
		message.channel.send({embed});
		
	} catch(e) {
		throw e;
	}

}
