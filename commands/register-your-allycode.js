module.exports = async ( client, message ) => {
	
    let embed = {};
	let retMessage = null;

	try {
		
		let { allycodes, discordIds } = await client.helpers.parseIds( message );

		/** Register player through swapi */
		if( !allycodes || allycodes.length === 0 ) { 
	        let error = new Error('Please provide an allycode'); 
	        error.code = 400;
	        throw error;
		}
		if( !discordIds || discordIds.length === 0 ) { 
	        let error = new Error('Please provide a discord user, or "me"'); 
	        error.code = 400;
	        throw error;
		}
		
		
		let register = await client.swapi.register([
		    [allycodes[0], discordIds[0]]
		]);
		
		let today = new Date();
		
		embed.title = 'Registration';
        embed.description = '';
		        
		if( register.put[0].upserted ) {
		    embed.title = 'Registration successful';
		    embed.description = 'Allycode: `'+register.get[0].allyCode+'` has been registered to <@'+register.get[0].discordId+'>\n';
		} else {
		    
		    if( register.put[0].nModified > 0 ) {
		        embed.title = 'Registration updated';
		        embed.description = 'Allycode: `'+register.get[0].allyCode+'` is now registered to <@'+register.get[0].discordId+'>\n';
		    } else {
		        embed.description += 'Allycode: `'+register.get[0].allyCode+'` is already registered to <@'+register.get[0].discordId+'>\n';
		    }
		
		}
		
		message.channel.send({embed});
		
	} catch(e) {
	    if( e.code === 400 ) {
            if( retMessage ) {
                embed.description += '\n**! There was an error completing this request**';
                retMessage.edit({embed}); 
            }
            message.reply(e.message);
	    } else {
		    throw e;
		}
	}

}
