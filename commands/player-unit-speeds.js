module.exports = async ( client, message ) => {
	
	try {
		
		/** Split message on spaces and remove the command part */
		let args = message.content.split(/\s+/g).slice(1);
		if( !args || !args[0] ) { throw new Error('Please provide an allycode or discord user'); }
		
		/** Set allycode with no dashes and turn string into a number */
		args[0] = args[0].replace(/-/g,'');
		
		let discordId = args[0] === 'me' ? message.author.id : args[0].match(/\d{17,18}/) ? args[0].match(/\d{17,18}/)[0].toString() : null;
		let allycode = args[0].match(/^\d{3}-*\d{3}-*\d{3}$/) ? args[0].match(/^\d{3}-*\d{3}-*\d{3}$/)[0] : null;
		
		if( !allycode && !discordId ) { throw new Error('Please provide a valid allycode or discord user'); }

		/** Get player from swapi cacher */
		let player = allycode ?
			await client.swapi.player(allycode, 'eng_us') :
			await client.swapi.player(discordId, 'eng_us');

        let stats = await client.swapi.calcStats( player.allyCode, null, ["includeMods","withModCalc","gameStyle"] );
        
        /** 
		 * REPORT OR PROCEED TO DO STUFF WITH PLAYER OBJECT 
		 * */

		let today = new Date();
		
		let embed = {};
		embed.title = player.name+' : 50 Fastest units';
		embed.description = '`------------------------------`\n';
        
        embed.fields = [];
                
        let speeds = [];
        for( let s in stats ) {
            let pu = player.roster.filter(pru => pru.defId === s);
            speeds.push({
                unit:pu[0].name,
                speed:stats[s].stats.final.Speed,
                bonus:stats[s].stats.mods.Speed
            });
        }
        speeds.sort((a,b) => b.speed - a.speed);

        let lim = 50;
        for( let us of speeds ) {
            if( lim === 0 ) break;
            embed.description += '`'+Math.floor(us.speed)+' (+'+Math.floor(us.bonus)+')` : '+us.unit+'\n';
            --lim;       
        }

		embed.color = 0x936EBB;
		embed.timestamp = today;

		message.channel.send({embed});
		
	} catch(e) {
		throw e;
	}

}
