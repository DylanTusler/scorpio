module.exports = async ( client, message ) => {
	
	try {
		
		/** Split message on spaces and remove the command part */
		let args = message.content.split(/\s+/g).slice(1);
		if( !args || !args[0] ) { throw new Error('Please provide an allycode or discord user'); }
		
		/** Set allycode with no dashes and turn string into a number */
		args[0] = args[0].replace(/-/g,'');
		
		let allycodes = args[0].match(/\d{9}/) ? [ args[0].match(/\d{9}/)[0] ] : [];
		let discordIds = args[0] === 'me' ? [ message.author.id ] : args[0].match(/\d{17,18}/) ? [ args[0].match(/\d{17,18}/)[0] ] : [];
		
		if( allycodes.length + discordIds.length === 0 ) { throw new Error('Please provide a valid allycode or discord user'); }

		/** Get player units from api */
		let ids = [ allycodes ].concat([discordIds]);
		let units = await client.swapi.units(ids, 'eng_us');
		
		/** 
		 * REPORT OR PROCEED TO DO STUFF WITH PLAYER OBJECT 
		 * */

		let today = new Date();
		
		let embed = {};
		embed.title = `Player Units`;
		embed.description = '`------------------------------`\n';
		embed.description += `${Object.keys(units).length} units\n`;
		embed.description += '`------------------------------`\n';

		embed.color = 0x936EBB;
		embed.timestamp = today;

		message.channel.send({embed});
		
	} catch(e) {
		throw e;
	}

}
