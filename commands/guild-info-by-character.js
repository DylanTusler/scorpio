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
		embed.description = '__**'+unitIndex[0].nameKey+'**__\n';

        calcMsg = '`------------------------------`\nGuild found!\nCalculating roster, **please wait...**';
        embed.description += calcMsg;
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
		
        embed.description += '`------------------------------`\n';
        embed.description += '**Guild search found** : `'+searchUnit.length+' units` \n';

		if( searchUnit.length > 0 ) {
            
            let zz = searchUnit.filter(t => t.zetas.length === 3).length;
            embed.description += zz > 0 ? '**Zeta ✦✦✦** : `'+zz+'` \n' : '';

            zz = searchUnit.filter(t => t.zetas.length === 2).length;
            embed.description += zz > 0 ? '**Zeta ✦✦** : `'+zz+'` \n' : '';

            zz = searchUnit.filter(t => t.zetas.length === 1).length;
            embed.description += zz > 0 ? '**Zeta ✦** : `'+zz+'` \n' : '';

            embed.description += '**Gear XII** : `'+searchUnit.filter(t => t.gearLevel === 12).length+'` \n';
            embed.description += '**Gear XI** : `'+searchUnit.filter(t => t.gearLevel === 11).length+'` \n';
            embed.description += '**Gear X** : `'+searchUnit.filter(t => t.gearLevel === 10).length+'` \n';
            embed.description += '`------------------------------`\n'

            embed.fields = [];
            searchUnit.sort((a,b) => b.gp - a.gp);
                
            for( let i = 7; i >= 3; --i ) {            
                let unitList = searchUnit.filter(t => t.starLevel === i);
                let gpList = unitList.map(u => '`'+u.gp.toLocaleString()+'` : '+u.player);
                if( unitList.length === 0 ) { continue; }
                embed.fields.push({
                    name:"★".repeat(i)+"☆".repeat(7-i)+" ("+unitList.length+")",
                    value:gpList.slice(0,25).join('\n')+'\n`------------------------------`\n',
                    inline:true
                });
                if( unitList.length > 25 ) {
                    embed.fields.push({
                        name:"...",
                        value:gpList.slice(26,50).join('\n')+'\n`------------------------------`\n',
                        inline:true
                    });
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
