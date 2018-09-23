module.exports = async ( client, message ) => {
	
    let embed = {};
	let retMessage = null;
		
	try {
		
		//Get allycode / discord ID from message
		let { allycode, discordId, rest } = await client.helpers.getId( message );

        //Get unit name from message
        let unitName = rest;
        if( !unitName ) { 
	        let error = new Error('Please provide a unit:\n```md\n<command> <@user|allycode> <unit>```');
	        error.code = 400;
	        throw error;
        }

        let unitIndex = await client.swapi.unitIndex(client.settings.swapi.language);
        if( !unitIndex || !unitIndex.units || unitIndex.units.length === 0 ) { 
	        let error = new Error('I could not match character "'+unitName+'"');
	        error.code = 400;
	        throw error;
        }
        
        unitIndex = unitIndex.units.filter(u => u.combatType === 'CHARACTER' || u.combatType === 1);
        unitIndex = unitIndex.filter(u => u.nameKey.toLowerCase() === unitName.toLowerCase() || u.nameKey.toLowerCase().includes(unitName.toLowerCase()));
        unitIndex = unitIndex.filter(u => u.nameKey.toLowerCase() === unitName.toLowerCase()).length > 0 ? unitIndex.filter(u => u.nameKey.toLowerCase() === unitName.toLowerCase()) : unitIndex;
        if( !unitIndex || unitIndex.length === 0 ) { 
	        let error = new Error('I could not match *character* "'+unitName+'"');
	        error.code = 400;
	        throw error;
        }

        let calcMsg = 'I\'m looking up this guild, **please wait...**';
        retMessage = await message.reply(calcMsg);

		/** Get player from swapi cacher */
		let guild = allycode ? 
			await client.swapi.guild(allycode, client.settings.swapi.language) :
			await client.swapi.guild(discordId, client.settings.swapi.language);

        if( !guild ) { 
	        let error = new Error('I could not find a guild for this id or user');
	        error.code = 400;
	        throw error;
        }

		
		let today = new Date();
		let age = client.helpers.convertMS(today - new Date(guild.updated));
		
		embed.title = guild.name;

        embed.author = {
            name:unitIndex[0].nameKey,
            icon_url:client.swapi.imageUrl('author',{id:unitIndex[0].baseId})
        }
         
        calcMsg = '`-------------------------`\nGuild found!\nCalculating roster, **please wait...**';
        embed.description = calcMsg;
        await retMessage.edit({embed});
        embed.description = embed.description.replace(calcMsg,'');
        

        let allycodes = guild.roster.map(p => p.allyCode);
        let units = await client.swapi.units( allycodes );
        
        if( !units || Object.keys(units).length === 0 ) { 
	        let error = new Error('Error fetching guild units');
	        error.code = 400;
	        throw error;
        }
        
        embed.fields = [];
        
        let searchUnit = units[unitIndex[0].baseId] || [];
		embed.description = '__**'+unitIndex[0].nameKey+'**__\n';
		
		if( searchUnit.length > 0 ) {
            embed.description += '`-------------------------`\n';
            embed.description += '**Guild search found** : `'+searchUnit.length+' units` \n';
            embed.description += '**★★★★★★★** : `'+searchUnit.filter(t => t.starLevel === 7).length+'` \n';
            embed.description += '**★★★★★★☆** : `'+searchUnit.filter(t => t.starLevel === 6).length+'` \n';
            
            let zz = searchUnit.filter(t => t.zetas.length === 3).length;
            embed.description += zz > 0 ? '**Zeta✦✦✦** : `'+zz+'` \n' : '';

            zz = searchUnit.filter(t => t.zetas.length === 2).length;
            embed.description += zz > 0 ? '**Zeta✦✦** : `'+zz+'` \n' : '';

            zz = searchUnit.filter(t => t.zetas.length === 1).length;
            embed.description += zz > 0 ? '**Zeta✦** : `'+zz+'` \n' : '';

            embed.description += '**XII** : `'+searchUnit.filter(t => t.gearLevel === 12).length+'` \n';
            embed.description += '**XI** : `'+searchUnit.filter(t => t.gearLevel === 11).length+'` \n';
            embed.description += '**X** : `'+searchUnit.filter(t => t.gearLevel === 10).length+'` \n';
            embed.description += '`-------------------------`\n'

            let payload = {};
                payload[unitIndex[0].baseId] = searchUnit;
                
            let stats = await client.swapi.stats( payload, ["includeMods","withModCalc","gameStyle"] );

            if( !stats || Object.keys(stats).length === 0 ) { 
	            let error = new Error('Error fetching unit stats');
	            error.code = 400;
	            throw error;
            }

            let count = 0;
            let value = '';
            let fname = "Speed report";

            if( stats[unitIndex[0].baseId].length > 0 ) { 
                stats[unitIndex[0].baseId].sort((a,b) => b.stats.final.Speed - a.stats.final.Speed); 
                for( let ps of stats[unitIndex[0].baseId] ) {
                    
                    ++count;
                    value += '`'+Math.floor(ps.stats.final.Speed || 0)+' (+'+Math.floor(ps.stats.mods.Speed || 0)+')` : '+ps.unit.player+'\n';
                    if( count >= 25 ) {
                        value += '`-------------------------`\n'
                        embed.fields.push({
                            name:fname,
                            value:value,
                            inline:true
                        });
                        count = 0;
                        value = '';
                        fname = "...";
                    }
                }
                
                if( count > 0 ) {
                    value += '`-------------------------`\n'
                    embed.fields.push({
                        name:fname,
                        value:value,
                        inline:true
                    });
                }
            } else {                     
                   
                if( !stats || Object.keys(stats).length === 0 ) { 
	                let error = new Error('Your guild does not have this unit');
	                error.code = 400;
	                throw error;
                }

            }
        }     

		embed.color = 0x33AE81;
		embed.timestamp = today;

        retMessage.edit({embed}); 

	} catch(e) {
	    if( e.code === 400 ) {
            if( retMessage ) {
                embed.description += '\n**! There was an error completing this guild request**';
                retMessage.edit({embed}); 
            }
            message.reply(e.message);
	    } else {
		    throw e;
		}
	}

}
