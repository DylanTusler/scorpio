module.exports = async ( client, message ) => {
	
	try {
		
		let { allycode, discordId } = await client.helpers.getId( message );

        let unitName = message.content.split(/\s/).slice(2).join(' ');
        if( !unitName ) { throw new Error('No unit provided to stats'); }
        
		/** Get player from swapi cacher */
		let player = allycode ?
			await client.swapi.player(allycode, 'eng_us') :
			await client.swapi.player(discordId, 'eng_us');

        let unit = player.roster.filter(u => u.name.toLowerCase().includes(unitName.toLowerCase()));
        if( unit.length === 0 ) { throw new Error( 'This player doesn\'t have a match for the unit requested'); }

        let stats = await client.swapi.calcStats( player.allyCode, unit[0].defId, ["includeMods","withModCalc","gameStyle"] );

		/** 
		 * REPORT OR PROCEED TO DO STUFF WITH PLAYER OBJECT 
		 * */

		let today = new Date();
		
		let embed = {};
		embed.title = `${player.name} - ${unit[0].name}`;
		embed.description = '`------------------------------`\n';
        
        for( let s in stats.stats.final ) {
           if( s === 'None' ) { continue; }
           embed.description += '**'+s+'** : `'+( stats.stats.final[s] % 1 === 0 ? stats.stats.final[s] : (stats.stats.final[s] * 100).toFixed(2)+'%' );
           embed.description += stats.stats.mods[s] ? ' (+'+( stats.stats.mods[s] % 1 === 0 ? stats.stats.mods[s] : (stats.stats.mods[s] * 100).toFixed(2)+'%' )+')`\n' : '`\n';
        }

		embed.color = 0x936EBB;
		embed.timestamp = today;

		message.channel.send({embed});
		
	} catch(e) {
		throw e;
	}

}
