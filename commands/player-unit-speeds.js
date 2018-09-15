module.exports = async ( client, message ) => {
	
    let embed = {};
	let retMessage = null;

	try {
		
		let { allycode, discordId } = await client.helpers.getId( message );

		/** Get player from swapi cacher */
		let player = allycode ?
			await client.swapi.player(allycode, client.settings.swapi.language) :
			await client.swapi.player(discordId, client.settings.swapi.language);

        let stats = await client.swapi.calcStats( player.allyCode, null, ["includeMods","withModCalc","gameStyle"] );
        
        /** 
		 * REPORT OR PROCEED TO DO STUFF WITH PLAYER OBJECT 
		 * */

        let lim = 25;
		let today = new Date();
		
		embed.title = player.name+' : Top '+lim+' units : Speed';
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

        for( let us of speeds ) {
            if( lim === 0 ) break;
            embed.description += '`'+Math.floor(us.speed)+' (+'+Math.floor(us.bonus)+')` : '+us.unit+'\n';
            --lim;       
        }

		embed.color = 0x936EBB;
		embed.timestamp = today;

		message.channel.send({embed});
		
	} catch(e) {
	    if( e.code === 400 ) {
            if( retMessage ) {
                embed.description += '\n**! There was an error completing this request**';
                retMessage.edit({embed}); 
            }
            message.reply(e.message);
	    } else {
		    throw e;
		}
	}

}
