module.exports = async ( client, message ) => {
	
    let embed = {};
	let retMessage = null;

	try {
		
		//Get allycode / discord ID from message
		let { allycode, discordId, rest } = await client.helpers.getId( message );

        //Get criteria name from message
        let criteria = rest;
        criteria = ["pvp", "tw", "tb", "pit", "tank", "sith"].includes(criteria) ? criteria : 'versa';
        
		/** Get player from swapi cacher */
		let player = allycode ?
			await client.swapi.player(allycode, client.settings.swapi.language) :
			await client.swapi.player(discordId, client.settings.swapi.language);
		
		/** Get the zeta recommendations from swapi cacher */
		let recommendations = await client.swapi.zetas();


		let today = new Date();
		let age = client.helpers.convertMS(today - new Date(player.updated));
		
        let lim = 10;
		let embed = {};
		embed.title = `${player.name} - Next ${lim} best Zetas`;
		embed.description = '';//`------------------------------`\n';
		embed.description += criteria ? '**Filtered by** : *'+criteria+'* \n' : '';
		embed.description += '`------------------------------`\n';
	    
	    let availableZetas = [];
        for( let z of recommendations.zetas ) {
            let skill = player.roster.map(u => {
                if( u.level < 50 ) { return null; }
                if( u.rarity < 6 ) { return null; }
                if( u.gear < 8 ) { return null; }
                
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
        
        if( criteria ) {
            availableZetas.sort((a,b) => {
                return scoreZeta(a[criteria], player.roster) - scoreZeta(b[criteria], player.roster) >= 0 ? 1 : -1;
            });
        } else {
            availableZetas.sort((a,b) => {
                return scoreZeta(a, player.roster) - scoreZeta(b, player.roster) >= 0 ? 1 : -1;
            });
        }        
        
        for( let az of availableZetas ) {
            if( lim === 0 ) { break; }
            
            embed.description += '**'+az.toon+'** : '+az.name+'\n';
            
            --lim;
        }
        
		embed.description += '`------------------------------`\n';
		embed.description += '**Optional filter criteria** :\n *pvp, tw, tb, pit, tank, sith, versa*\n';
        embed.description += '`------------------------------`\n';
		
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

function scoreZeta( zeta, roster ) {
    if( typeof zeta === 'number' ) return parseInt(zeta);

    let rankedScore = zeta.pvp * zeta.tw * zeta.tb * zeta.pit * zeta.tank * zeta.sith;
    if( rankedScore === 0 ) { rankedScore = 999 }
    
    let rosterScore = scoreRoster( zeta, roster );
    return rankedScore - rosterScore;
}

function scoreRoster( zeta, roster ) {
    // To-do : build a roster score based on squad support for zeta
    return (zeta.gear * zeta.rarity);
}
