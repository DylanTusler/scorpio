module.exports = async ( client, message ) => {
	
	try {
		
		/** Split message on spaces and remove the command part */
		let args = message.content.split(/\s+/g).slice(1);
		if( !args || args.length < 2 ) { throw new Error('Please provide a user and an allycode'); }
		
		/** Set discord ID from user */
		let discordId = args[0].toLowerCase() === 'me' ? message.author.id : args[0].match(/\d{17,18}/)[0];
		
		/** Set allycode with no dashes and turn string into a number */
		let allycode = args[1].replace(/-/g,'');
		if( isNaN(allycode) || allycode.length !== 9 ) { throw new Error('Please provide a valid allycode'); }
		allycode = parseInt(allycode);

		/** Register player through swapi */
		let register = await client.swapi.register(allycode, discordId);
		
		/** 
		 * REPORT OR PROCEED TO DO STUFF WITH PLAYER OBJECT 
		 * */

		let today = new Date();
		
		let description = '```json\n';
		description += JSON.stringify(register,null,2);
		description += '```\n';

		message.channel.send(description);
		
	} catch(e) {
		throw e;
	}

}
