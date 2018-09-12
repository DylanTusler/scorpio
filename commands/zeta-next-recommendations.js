module.exports = async ( client, message ) => {
	
	try {
		
		let { allycode, discordId } = await client.helpers.getId( message );

		/** Get player from swapi cacher */
		let player = allycode ?
			await client.swapi.player(allycode, 'eng_us') :
			await client.swapi.player(discordId, 'eng_us');
		
		/** Get the zeta recommendations from swapi cacher */
		let recommendations = await client.swapi.zetas();

        		
		
		/** 
		 * REPORT OR PROCEED TO DO STUFF WITH PLAYER OBJECT AND RECOMMENDATIONS
		 * */

		let today = new Date();
		let age = client.helpers.convertMS(today - new Date(player.updated));
		
		let embed = {};
		embed.title = `${player.name} - Next 20 best Zetas`;
		embed.description = '`------------------------------`\n';
		//embed.description += '`score : unit : skill`\n';
		//embed.description += '`------------------------------`\n';
			
	    let availableZetas = [];
        for( let z of recommendations.zetas ) {
            let skill = player.roster.map(u => {
                let ss = u.skills.filter(s => s.name === z.name);
                if( ss.length === 0 ) { return null; }
                
                ss[0].rarity = u.rarity;
                ss[0].level = u.level;
                ss[0].gear = u.gear;
                
                return ss.length > 0 ? ss[0] : null;
            });
            skill = skill.filter(s => s);
            
            if( !skill || !skill[0] || skill[0].tier === 8 ) { continue; }
            
            z.rarity = skill[0].rarity;
            z.gear = skill[0].gear;
            availableZetas.push(z);
        }
        
        availableZetas.sort((a,b) => {
            return scoreZeta(a, player.roster) - scoreZeta(b, player.roster);
        });
        
        
        let lim = 20;
        for( let az of availableZetas ) {
            if( lim === 0 ) { break; }
            
            embed.description += '**'+az.toon+'** : '+az.name+'\n';
            
            --lim;
        }
        
		embed.description += '`------------------------------`\n';

		embed.color = 0x936EBB;
		embed.timestamp = today;

		message.channel.send({embed});
		
	} catch(e) {
		throw e;
	}

}

function scoreZeta( zeta, roster ) {
    let rankedScore = zeta.pvp + zeta.tw + zeta.tb + zeta.pit + zeta.tank + zeta.sith + zeta.versa;
    let rosterScore = scoreRoster( zeta, roster );
    return rankedScore - rosterScore;
}

function scoreRoster( zeta, roster ) {
    // To-do : build a roster score based on squad support for zeta
    return zeta.gear + zeta.rarity;
}
