module.exports = async ( client, message ) => {
	
	let description = '';
	let retMessage = null;
	let embed = {};
	
	try {
		
		/** Split message on spaces and remove the command part */
		let args = message.content.split(/\s+/g).slice(1);
		if( !args ) { 
	        let error = new Error('Please provide an allycode or discord user'); 
	        error.code = 400;
	        throw error;
		}
		
		embed.title = "Whois";
		embed.description = "Looking up: "+args.join(', ')+"\nPlease wait...";
		retMessage = await message.channel.send({embed});
		embed.description = '';
		
		let ids = [];
		for( let i of args ) {
		    if( i === 'me' ) { ids.push(message.author.id); }
		    else if( i.match(/\d{17,18}/) ) { ids.push( i.match(/(\d{17,18})/)[0].toString() ); }
		    else if( i.match(/^\d{3}-*\d{3}-*\d{3}$/) ) { ids.push( i ); }
		}
		
		/** Register player through swapi */
		let register = await client.swapi.whois(ids);
		
		let today = new Date();
		
		if( client.debug ) { console.log( register ); }

		if( register.get.length > 0 ) {
		    for( let d of register.get ) {
        		embed.description += '<@!'+d.discordId+'> : '+d.allyCode+'\n';
            }
        } else {
            embed.description += 'This user is not registered\n';
        }
        
		retMessage.edit({embed});
		
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
