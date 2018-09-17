module.exports = async ( client, message ) => {
	
	try {
		
		//Get allycode / discord ID from message
		let { allycode, discordId, rest } = await client.helpers.getId( message );

		/** Get player from swapi cacher */
		let player = allycode ?
			await client.swapi.player(allycode, client.settings.swapi.language) :
			await client.swapi.player(discordId, client.settings.swapi.language);
		
		/** 
		 * REPORT OR PROCEED TO DO STUFF WITH PLAYER OBJECT 
		 * */

		let today = new Date();
		let age = client.helpers.convertMS(today - new Date(player.updated));
		
		let embed = {};
		embed.title = `${player.name} - Zetas `;
		embed.description = '`------------------------------`\n';

        embed.fields = [];
        let value = null;


        let total = 0;
        let characters = player.roster.filter(u => u.type === 'CHARACTER' || u.type === 1);
        let zetas = characters.map(c => {
            return { name:c.name, zs:c.skills.filter(s => s.isZeta && s.tier === 8) }
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
