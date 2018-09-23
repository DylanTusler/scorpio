module.exports = async ( client, message ) => {
	
    let embed = {};
	let retMessage = null;
	
	try {
		
		//Get allycode / discord ID from message
		let { allycode, discordId, rest } = await client.helpers.getId( message );

        //Get unit name from message
        let unitName = rest;
        if( !unitName ) { 
	        let error = new Error('Please provide a character:\n```md\n<command> <@user|allycode> <character>```');
	        error.code = 400;
	        throw error;
        }
        
		/** Get player from swapi cacher */
		let player = allycode ?
			await client.swapi.player(allycode, client.settings.swapi.language) :
			await client.swapi.player(discordId, client.settings.swapi.language);
        if( !player ) { 
	        let error = new Error('I could not find a player by this id or user');
	        error.code = 400;
	        throw error;
        }

        //Get character from player roster
        let unit = await client.helpers.filterShip( unitName, player.roster );

		let today = new Date();
		
		embed.title = `${player.name} - ${player.allyCode}`;
        embed.description = '**L'+unit.level+'** | '+'★'.repeat(unit.rarity)+'☆'.repeat(7-unit.rarity)+'\n';
		embed.description += '**GP** : `'+unit.gp.toLocaleString()+'`\n';
		embed.description += '`-------------------------`\n';
		
		unit.skills.sort((a,b) => parseInt(a.id.charAt(0) - b.id.charAt(0)));
		
		let unitIndex = await client.swapi.unitIndex(client.settings.language);
		    unitIndex = unitIndex.units.filter(u => u.baseId === unit.defId)[0];
		
		let skillIndex = await client.swapi.skillIndex(client.settings.language);
		
        for( let sr of unitIndex.skillReferenceList ) {
            
            let iskill = skillIndex.skills.filter(s => s.id === sr.skillId)[0];
            let iability = skillIndex.abilities.filter(a => a.id === iskill.abilityReference)[0];
        
            let stype = iskill.id.split(/_/)[0].replace('skill','');
                stype = stype.charAt(0).toUpperCase()+stype.slice(1);
                
            let sk = unit.skills.filter(s => s.id === sr.skillId);
            
            embed.description += '**'+stype+'** : ';
            embed.description += '`'+(sk.length > 0 ? sk[0].tier : 1)+'` \n';
            embed.description += '`'+iability.nameKey+'` \n';
        }        

        embed.fields = [];
        let value = '';
        
        if( unitIndex.crewList.length > 0 ) {
            for( let crew of unitIndex.crewList ) {
                
                let cmem = await player.roster.filter(u => u.defId === crew.unitId); 
                
                for( let cs of crew.skillReferenceList ) {
                
                    let iskill = skillIndex.skills.filter(s => s.id === cs.skillId)[0];
                    let iability = skillIndex.abilities.filter(a => a.id === iskill.abilityReference)[0];
                
                    let stype = iskill.id.split(/_/)[0].replace('skill','');
                        stype = stype.charAt(0).toUpperCase()+stype.slice(1);
                        
                    let sk = unit.skills.filter(s => s.id === cs.skillId);
                    
                    embed.description += '**'+stype+'** : ';
                    embed.description += '`'+(sk.length > 0 ? sk[0].tier : 1)+'` \n';
                    embed.description += '`'+iability.nameKey+'` \n';
                
                }
                
                value = '**L'+cmem[0].level+'** | **G'+cmem[0].gear+'** | '+'★'.repeat(cmem[0].rarity)+'☆'.repeat(7-cmem[0].rarity)+'\n';
                value += '**GP** : `'+cmem[0].gp.toLocaleString()+'` \n';                
                value += '**Mods** : \n`';
                
                let cmemods = cmem[0].mods.map(m => client.helpers.mods.level( m.level, m.tier ));
                if( cmemods.length > 0 ) {
                    for( let m = 0; m < cmemods.length; ++m ) {
                        value += cmemods[m];
                        value += (m+1) % 3 === 0 ? '\n' : ', ';
                    }
                } else {
                    value += 'None';
                }
                value += '`\n';
                value += '`-------------------------`\n';
                
                embed.fields.push({
                    name:"__**Pilot**__ : `"+cmem[0].name+"`",
                    value:value,
                    inline:true
                });
                
            }          
        }

        embed.description += '`-------------------------`\n';

		embed.color = 0x936EBB;
		embed.timestamp = today;
        embed.author = {
            name:unit.name,
            icon_url:client.swapi.imageUrl('author',{id:unit.defId})
        }
        embed.thumbnail = {
            url:client.swapi.imageUrl('ship', {
                id:unit.defId, 
                rarity:unit.rarity,
                level:unit.level
            })
        }

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
