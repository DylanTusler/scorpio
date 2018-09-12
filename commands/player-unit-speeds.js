module.exports = async ( client, message ) => {
	
	try {
		
		let { allycode, discordId } = await client.helpers.getId( message );

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
