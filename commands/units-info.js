module.exports = async ( client, message ) => {
	
	try {
		
		let { allycode, discordId } = await client.helpers.getId( message );

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
