module.exports = async ( client, message ) => {
	
	try {
		
		let { allycode, discordId } = await client.helpers.getId( message );

		/** Get player from swapi cacher */
		let player = allycode ?
			await client.swapi.player(allycode, client.settings.swapi.language) :
			await client.swapi.player(discordId, client.settings.swapi.language);
		
		/** Get recommendations from swapi cacher */
		let recommendations = await client.swapi.squads();

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
