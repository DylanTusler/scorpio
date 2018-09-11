module.exports = async ( client, message ) => {
	
	try {
		
		/** Split message on spaces and remove the command part */
		let args = message.content.split(/\s+/g).slice(1);
		if( !args ) { throw new Error('Please provide a user or allycode'); }
		
		let ids = [];
		for( let i of args ) {
		    if( i === 'me' ) { ids.push(message.author.id); }
		    else if( i.match(/\d{17,18}/) ) { ids.push( i.match(/(\d{17,18})/)[0].toString() ); }
		    else if( i.match(/^\d{3}-*\d{3}-*\d{3}$/) ) { ids.push( i ); }
		}
		
		/** Register player through swapi */
		let register = await client.swapi.whois(ids);
		
		/** 
		 * REPORT OR PROCEED TO DO STUFF WITH PLAYER OBJECT 
		 * */

		let today = new Date();
		
		let description = '';
		for( let d of register.get ) {
    		description += '<@!'+d.discordId+'> : '+d.allyCode+'\n';
        }
		message.channel.send(description);
		
	} catch(e) {
		throw e;
	}

}
