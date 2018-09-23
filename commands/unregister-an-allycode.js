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
		
		
		let register = await client.swapi.unregister([
		    allycodes[0]
		]);
		
		
		let today = new Date();
		
		embed.title = 'Registration';
        embed.description = '';

        
	    if( !register || !register.del || register.del.n === 0 ) {
	        embed.description = 'Allycode: `'+allycodes+'` not found \n';
	    } else {
	        embed.title = 'Registration updated';
	        embed.description = 'Allycode: `'+allycodes+'` has been removed \n';
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
