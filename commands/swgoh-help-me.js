module.exports = async ( client, message ) => {
	
	try {
		
		let { allycode, discordId } = await client.helpers.getId( message );
        
        let ids = [];
        if( allycode ) { ids.push(allycode); }
        if( discordId ) { ids.push(discordId); }

		let register = await client.swapi.whois(ids);

		let today = new Date();
		
		let embed = {};
		embed.title = 'swgoh.help | Roster progress indicator';
		embed.description = '`------------------------------`\n';
		if( register.get.length > 0 ) {
		    for( let d of register.get ) {
        		embed.description += '⟡ [swgoh.help me! - '+d.allyCode+'](https://swgoh.help/?allycode='+d.allyCode+') \n';
            }
        } else {
            embed.description += 'This user is not registered\n';
        }
        embed.description += '`------------------------------`\n';
        embed.description += 'Full bot help, see **help** \n';
		embed.color = 0x936EBB;
		embed.timestamp = today;

		message.channel.send({embed});
		
	} catch(e) {
		throw e;
	}

}
