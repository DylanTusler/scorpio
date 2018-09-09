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

        let stats = await client.swapi.stats( player.roster.filter(r => r.type === 'CHARACTER' || r.type === 1) );
        
        /** 
		 * REPORT OR PROCEED TO DO STUFF WITH PLAYER OBJECT 
		 * */

		let today = new Date();
		
		let embed = {};
		embed.title = player.name+' : 50 Fastest units';
		embed.description = '`------------------------------`\n';
        
        embed.fields = [];
                
        let speeds = [];
        for( let k in stats ) {

            if( stats[k].error ) { continue; }
            speed = { 
                unit:stats[k].unit.name,
                base:stats[k].base.Speed || 0, 
                total:stats[k].total.Speed || 0
            }
            

            let unit = player.roster.filter(r => r.defId === stats[k].unit.characterID)[0];
            
            speed.speedSetsBasic = unit.mods.filter(m => m.set == 4 && m.level !== 15).length,
            speed.speedSetsMax = unit.mods.filter(m => m.set == 4 && m.level === 15).length,
            speed.speedStat = unit.mods.map(m => {
                let sp = 0;
                sp += m.primaryBonusType == 5 || m.primaryBonusType == 'UNITSTATSPEED' ? parseInt(m.primaryBonusValue.replace('+','')) : parseInt(0);
                sp += m.secondaryType_1 == 5 || m.secondaryType_1 == 'UNITSTATSPEED' ? parseInt(m.secondaryValue_1.replace('+','')) : parseInt(0);
                sp += m.secondaryType_2 == 5 || m.secondaryType_2 == 'UNITSTATSPEED' ? parseInt(m.secondaryValue_2.replace('+','')) : parseInt(0);
                sp += m.secondaryType_3 == 5 || m.secondaryType_3 == 'UNITSTATSPEED' ? parseInt(m.secondaryValue_3.replace('+','')) : parseInt(0);
                sp += m.secondaryType_4 == 5 || m.secondaryType_4 == 'UNITSTATSPEED' ? parseInt(m.secondaryValue_4.replace('+','')) : parseInt(0);
                return parseInt(sp);
            });
            
            speed.bonus = speed.speedStat.length > 0 ? speed.speedStat.reduce((total,num) => total + num) : 0;
            speed.bonus += speed.speedSetsBasic >= 4 ? speed.base * 0.05 : 0;
            speed.bonus += speed.speedSetsMax >= 4 ? speed.base * 0.1 : 0;
            
            speeds.push(speed); 
        }        
        
        speeds.sort((a,b) => (b.total+b.bonus) - (a.total+a.bonus));
        
        let lim = 50;
        for( let us of speeds ) {
            if( lim === 0 ) break;
            embed.description += '`'+Math.floor(us.total+us.bonus)+' (+'+Math.floor(us.bonus)+')` : '+us.unit+'\n';
            --lim;       
        }
        
		embed.color = 0x936EBB;
		embed.timestamp = today;

		message.channel.send({embed});
		
	} catch(e) {
		throw e;
	}

}
