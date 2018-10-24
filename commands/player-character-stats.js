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
		    message.reply('I could not find this player.\nMake sure the user is registered, or the allycode is correct.');
		}

		if( player.error ) { return message.reply(player.error); }



        //Get character from player roster
        let unit = await client.helpers.filterCharacter( unitName, player.roster );

        //Get stats for character
        let stats = await client.swapi.calcStats( player.allyCode, unit.defId, ["includeMods","withModCalc","gameStyle"], unit.type );
        if( !stats || Object.keys(stats).length === 0 ) { 
            let error = new Error('Error fetching unit stats');
            error.code = 400;
            throw error;
        }

        
        

		let today = new Date();
		
		embed.title = `${player.name} - ${player.allyCode}`;
        embed.description = '**L'+unit.level+'** | **G'+unit.gear+'** | '+'★'.repeat(unit.rarity)+'☆'.repeat(7-unit.rarity)+'\n';
		embed.description += '**GP** : `'+unit.gp.toLocaleString()+'`\n';
		embed.description += '`-------------------------`\n';
		
		unit.skills.sort((a,b) => parseInt(a.id.charAt(0) - b.id.charAt(0)));
		
		let unitIndex = await client.swapi.unitIndex(client.settings.language);
		    unitIndex = unitIndex.units.filter(u => u.baseId === unit.defId)[0];
		    
		let skillIndex = await client.swapi.skillIndex(client.settings.language);
		
		let zetaCount = null;
        for( let sr of unitIndex.skillReferenceList ) {
            
            let iskill = skillIndex.skills.filter(s => s.id === sr.skillId)[0];
            let iability = skillIndex.abilities.filter(a => a.id === iskill.abilityReference)[0];
        
            let stype = iskill.id.split(/_/)[0].replace('skill','');
                stype = stype.charAt(0).toUpperCase()+stype.slice(1);
             
            let sk = unit.skills.filter(s => s.id === sr.skillId);   

            if( iskill.isZeta ) {
                embed.description += sk.length > 0 && sk[0].tier === 8 ? '**✦** ' : '';
                embed.description += sk.length === 0 || sk[0].tier < 8 ? '⟡ ' : '';

                zetaCount = zetaCount || 0;
                zetaCount += sk.length > 0 && sk[0].tier === 8 ? 1 : 0;
            } else {
                if( iability.tierList.length >= 7 ) {
                    embed.description += sk.length > 0 && sk[0].tier === 8 ? '`⭓` ' : '';
                    embed.description += sk.length === 0 || sk[0].tier < 8 ? '`⭔` ' : '';
                } else {
                    embed.description += '`~` ';
                }
            }

            embed.description += '**'+stype+'** : ';
            embed.description += '`'+(sk.length > 0 ? sk[0].tier : 1)+'` \n';
            embed.description += '`'+iability.nameKey+'` \n';
        }        

        embed.description += '`-------------------------`\n';

        for( let s in stats.stats.final ) {
           if( s === 'None' ) { continue; }
           embed.description += '**'+s+'** : `'+( stats.stats.final[s] % 1 === 0 ? stats.stats.final[s] : (stats.stats.final[s] * 100).toFixed(2)+'%' );
           embed.description += stats.stats.mods[s] ? ' (+'+( stats.stats.mods[s] % 1 === 0 ? stats.stats.mods[s] : (stats.stats.mods[s] * 100).toFixed(2)+'%' )+')`\n' : '`\n';
        }

        embed.description += '`-------------------------`\n';

        embed.fields = [];
        
        let count = 1;
        for( let m of unit.mods ) {

            let value = '';
            let name = '';

            while( count < m.slot ) {
                name = '__**'+client.helpers.mods.slot(count)+'**__ : `';
                embed.fields.push({
                    name:name+'none`',
                    value:'-\n-\n-\n`-------------------------`\n',
                    inline:true
                });
                ++count;
            }
            
            name = '__**'+client.helpers.mods.slot(count)+'**__ : `';
            name += client.helpers.mods.level( m.level, m.tier );
            name += ' ['+'⚬'.repeat(m.pips)+'-'.repeat(6 - m.pips)+']`\n';
            
            value = '**Mod Set** : ';
            value += '`'+client.helpers.mods.set( m.set )+'`\n';
            
            value += '**Primary** : ';
            value += '`'+(m.primaryStat.value.toString().includes('.') ? m.primaryStat.value.toFixed(2)+"%" : m.primaryStat.value)+' '+client.helpers.mods.stat( m.primaryStat.unitStat )+'`\n';

            //value += '**Secondary Stats**\n';
            //value += m.secondaryType_1.length > 0 ? '`'+m.secondaryValue_1+' '+client.helpers.mods.stat( m.secondaryType_1 )+'`\n' : '';
            //value += m.secondaryType_2.length > 0 ? '`'+m.secondaryValue_2+' '+client.helpers.mods.stat( m.secondaryType_2 )+'`\n' : '';
            //value += m.secondaryType_3.length > 0 ? '`'+m.secondaryValue_3+' '+client.helpers.mods.stat( m.secondaryType_3 )+'`\n' : '';
            //value += m.secondaryType_4.length > 0 ? '`'+m.secondaryValue_4+' '+client.helpers.mods.stat( m.secondaryType_4 )+'`\n' : '';

            value += '`-------------------------`\n';
            		
            embed.fields.push({
                name:name,
                value:value,
                inline:true
            });
            ++count;
        }        
        
		embed.color = 0x936EBB;
		embed.timestamp = today;
        embed.author = {
            name:unit.nameKey,
            icon_url:client.swapi.imageUrl('author',{id:unit.defId})
        }
        embed.thumbnail = {
            url:client.swapi.imageUrl('char', {
                id:unit.defId, 
                rarity:unit.rarity,
                level:unit.level,
                gear:unit.gear,
                zetas:zetaCount 
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
