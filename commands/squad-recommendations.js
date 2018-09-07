module.exports = async ( client, message ) => {
	
	try {
		
		/** Split message on spaces and remove the command part */
		let args = message.content.split(/\s+/g).slice(1);
		if( !args || !args[0] ) { throw new Error('Please provide an allycode or discord user'); }
		
		/** Set allycode with no dashes and turn string into a number */
		args[0] = args[0].replace(/-/g,'');
		
		let allycode = args[0].match(/\d{9}/) ? args[0].match(/\d{9}/)[0] : null;
		let discordId = args[0] === 'me' ? message.author.id : args[0].match(/\d{17,18}/) ? args[0].match(/\d{17,18}/)[0] : null;
		
		if( !allycode && !discordId ) { throw new Error('Please provide a valid allycode or discord user'); }

		/** Get player from swapi cacher */
		let player = allycode ?
			await client.swapi.player(allycode, 'eng_us') :
			await client.swapi.player(discordId, 'eng_us');
		
		/** Get recommendations from swapi cacher */
		let recommendations = await client.swapi.squads();

        		
		
		/** 
		 * REPORT OR PROCEED TO DO STUFF WITH PLAYER OBJECT AND SQUAD RECOMMENDATIONS
		 * 
		 */

		let today = new Date();
		let age = client.helpers.convertMS(today - new Date(player.updated));
		
		let embed = {};
		embed.title = `${player.name} - ${player.allyCode}`;
		embed.description = '`------------------------------`\n';
		embed.description += `Profile is ${age.minute} minutes old\n`;
		
		//Nothing super special here...
		//Just printing the main recommendation keys 
		embed.description += `Recommendation keys: ${Object.keys(recommendations).join('\n')}\n`;
		embed.description += '`------------------------------`\n';

		embed.color = 0x936EBB;
		embed.timestamp = today;

		message.channel.send({embed});
		
	} catch(e) {
		throw e;
	}

}
