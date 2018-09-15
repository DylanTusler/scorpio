module.exports = async ( client, message ) => {
	
	let description = '';
	let retMessage = null;
	
	try {
		
		/** Split message on spaces and remove the command part */
		let args = message.content.split(/\s+/g).slice(1);
		if( !args ) { 
	        let error = new Error('Please provide an allycode or discord user'); 
	        error.code = 400;
	        throw error;
		}
		
		let ids = [];
		for( let i of args ) {
		    if( i === 'me' ) { ids.push(message.author.id); }
		    else if( i.match(/\d{17,18}/) ) { ids.push( i.match(/(\d{17,18})/)[0].toString() ); }
		    else if( i.match(/^\d{3}-*\d{3}-*\d{3}$/) ) { ids.push( i ); }
		}
		
		/** Register player through swapi */
		let register = await client.swapi.whois(ids);
		

		let today = new Date();
		
		for( let d of register.get ) {
    		description += '<@!'+d.discordId+'> : '+d.allyCode+'\n';
        }
		message.channel.send(description);
		
	} catch(e) {
	    if( e.code === 400 ) {
            if( retMessage ) {
                description += '\n**! There was an error completing this request**';
                retMessage.edit(description); 
            }
            message.reply(e.message);
	    } else {
		    throw e;
		}
	}

}
