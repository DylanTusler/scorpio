module.exports = async ( client, message ) => {
	
	try {
		
		//Get allycode / discord ID from message
		let { allycode, discordId, rest } = await client.helpers.getId( message );

		/** Get player from swapi cacher */
		let player = allycode ?
			await client.swapi.player(allycode, client.settings.swapi.language) :
			await client.swapi.player(discordId, client.settings.swapi.language);
		
		if( !player ) {
		    message.reply('I could not find this player.\nMake sure the user is registered, or the allycode is correct.');
		}

		if( player.error ) { return message.reply(player.error); }


		let today = new Date();
		let age = client.helpers.convertMS(today - new Date(player.updated));
		
		let embed = {};
		embed.title = `${player.name} - Zetas `;
		embed.description = '`------------------------------`\n';

        embed.fields = [];
        let value = null;


        let total = 0;
        let characters = player.roster.filter(u => u.combatType === 'CHARACTER' || u.combatType === 1);
        let zetas = characters.map(c => {
            return { name:c.nameKey, zs:c.skills.filter(s => s.isZeta && s.tier === 8) }
        }).sort((a,b) => b.zs.length - a.zs.length);

        for( let z of zetas ) {
            embed.description += z.zs.length > 0 ? z.name+" "+"✦".repeat(z.zs.length)+'\n' : '';
            total += z.zs.length;            
        }   
        
        embed.title += '( '+total+' )'
		embed.description += '`------------------------------`\n';
		
		embed.color = 0x936EBB;
		embed.timestamp = today;

		message.channel.send({embed});
		
	} catch(e) {
	    if( e.code === 400 ) {
            message.reply(e.message);
	    } else {
		    throw e;
		}
	}

}
