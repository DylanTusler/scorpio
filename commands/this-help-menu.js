module.exports = async ( client, message ) => {
	
	try {
		
		let embed = {};
		
		embed.title = client.user.username+' help - Prefix: **'+client.settings.prefix+'**';

		embed.description = '`------------------------------`\n';
		embed.description += 'Botmaster(s): <@!'+client.settings.botmasters.join('>, <@!')+'>\n';
		embed.description += client.settings.discord ? 'Need help?  Visit me on [ShittyBots]('+client.settings.discord+')\n' : '';
		embed.description += 'Node dev?  Fork me on [GitHub](https://github.com/r3volved/scorpio)\n';
		embed.description += client.settings.patreon ? 'Bot lover?  Support me on [Patreon]('+client.settings.patreon+')\n' : '';
        embed.description += '`------------------------------`\n';
	
	    embed.fields = [];
        let value = '';	  
          
        for( let c in client.settings.commands ) {
            if( c === 'hidden' ) { continue; }
            
            let name = c.split(/-/).map(f => f.charAt(0).toUpperCase()+f.slice(1)).join(' ');
            value = '';
            for( let k in client.settings.commands[c] ) {
                value += `**${k}** : ${client.settings.commands[c][k].replace('.js','').replace(/-/g,' ')}\n`;
            }
    		value += '`------------------------------`\n';
    		
    		embed.fields.push({
    		    name:name,
    		    value:value,
    		    inline:true
    		});
    		
        }

		value = '';
		value += '```\n';
		value += client.settings.prefix+'add me 123456789\n';
		value += client.settings.prefix+'player me\n';
		value += client.settings.prefix+'zeta me\n';
		value += '```\n';
		value += '*Data provided by [api.swgoh.help](https://api.swgoh.help)*';
		
		embed.fields.push({
		    name:"Example",
		    value:value,
		    inline:false
		});

		
		embed.color = 0x2A6EBB;
		embed.timestamp = new Date();

		message.react('ℹ');
		message.channel.send({embed});
		
	} catch(e) {
		throw e;
	}

}
