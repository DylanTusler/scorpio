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

        let unitName = args.slice(1).join(' ');
        if( !unitName ) { throw new Error('No unit provided to stats'); }
        
		/** Get player from swapi cacher */
		let player = allycode ?
			await client.swapi.player(allycode, 'eng_us') :
			await client.swapi.player(discordId, 'eng_us');

        
        let units = [];
        for( let u of player.roster ) {
            if( u.name.toLowerCase().includes( unitName.toLowerCase() ) ) {
                units.push( u );
            }
        }
        
        if( units.length === 0 ) { throw new Error('No unit found in this player\'s roster'); }

        let stats = await client.swapi.stats( units );      
        stats = stats.filter(s => !s.error);

		/** 
		 * REPORT OR PROCEED TO DO STUFF WITH PLAYER OBJECT 
		 * */

		let today = new Date();
		
		let embed = {};
		embed.title = `${player.name} - ${player.allyCode}`;
		embed.description = '`------------------------------`\n';
		embed.description += `${stats.length} unit(s) found\n`;
		embed.description += '`------------------------------`\n';
        
        embed.fields = [];
        
        for( let u of stats ) {
            let val = '';
            for( let k in u.total ) {
                val += '**'+k+'** : `'+u.total[k]+'`\n';
            }
            embed.fields.push({
                name:u.unit.name+' : Base stats',
                value:val || "error"
            });
        }

		embed.color = 0x936EBB;
		embed.timestamp = today;

		message.channel.send({embed});
		
	} catch(e) {
		throw e;
	}

}
