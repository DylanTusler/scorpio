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
        unitIndex = unitIndex.filter(u => u.nameKey.replace(/[\\'|\\"|\\-]*/g,'').toLowerCase() === unitName.replace(/[\\'|\\"|\\-]*/g,'').toLowerCase() || u.nameKey.replace(/[\\'|\\"|\\-]*/g,'').toLowerCase().includes(unitName.replace(/[\\'|\\"|\\-]*/g,'').toLowerCase()));
        unitIndex = unitIndex.filter(u => u.nameKey.replace(/[\\'|\\"|\\-]*/g,'').toLowerCase() === unitName.replace(/[\\'|\\"|\\-]*/g,'').toLowerCase()).length > 0 ? unitIndex.filter(u => u.nameKey.replace(/[\\'|\\"|\\-]*/g,'').toLowerCase() === unitName.replace(/[\\'|\\"|\\-]*/g,'').toLowerCase()) : unitIndex;
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
		    return retMessage.edit('I could not find a guild.\nMake sure the user is registered, or the allycode used is guild affiliated.');
		}

		if( guild.error ) { return retMessage.edit(player.error); }

		let today = new Date();
		let age = client.helpers.convertMS(today - new Date(guild.updated));
		
		embed.title = guild.name;
        embed.author = {
            name:unitIndex[0].nameKey,
            icon_url:client.swapi.imageUrl('char',{id:unitIndex[0].baseId})
        }

        calcMsg = '`-------------------------`\nGuild found!\nCalculating roster, **please wait...**';
        embed.description = calcMsg;
        embed.image = { url:"https://media.discordapp.net/attachments/416390341533368321/502658773920514049/bb8s.gif" }

        await retMessage.edit({embed});
        embed.description = embed.description.replace(calcMsg,'');
        delete embed.image;

        let players = [];
        for( let p of guild.roster ) {
            players.push(await client.swapi.player( p.allyCode ));
        }

        if( !players || players.length === 0 ) { 
	        let error = new Error('Error fetching guild units');
	        error.code = 400;
	        throw error;
        }
        
        embed.fields = [];
        
        let searchUnit = players.map(p => {
            let newp = p.roster.filter(r => r.defId === unitIndex[0].baseId);
            if( newp.length === 0 ) { return null; }

            newp = newp[0];
            newp.player = p.name;
            return newp;
        });
        searchUnit = await searchUnit.filter(su => su);
        
        embed.description += '`-------------------------`\n';
        embed.description += '**Guild search found** : `'+searchUnit.length+' units` \n';

		if( searchUnit.length > 0 ) {

            let zz = searchUnit.filter(t => t && t.skills.filter(s => s.isZeta && s.tier === 8).length === 3).length;
            embed.description += zz > 0 ? '**Zeta ✦✦✦** : `'+zz+'` \n' : '';

            zz = searchUnit.filter(t => t && t.skills.filter(s => s.isZeta && s.tier === 8).length === 2).length;
            embed.description += zz > 0 ? '**Zeta ✦✦** : `'+zz+'` \n' : '';

            zz = searchUnit.filter(t => t && t.skills.filter(s => s.isZeta && s.tier === 8).length === 1).length;
            embed.description += zz > 0 ? '**Zeta ✦** : `'+zz+'` \n' : '';

            embed.description += '**Gear XII** : `'+searchUnit.filter(t => t && t.gear === 12).length+'` \n';
            embed.description += '**Gear XI** : `'+searchUnit.filter(t => t && t.gear === 11).length+'` \n';
            embed.description += '**Gear X** : `'+searchUnit.filter(t => t && t.gear === 10).length+'` \n';
            embed.description += '`-------------------------`\n'

            embed.fields = [];
            searchUnit.sort((a,b) => b.gp - a.gp);
                
            for( let i = 7; i > 0; --i ) {
                let unitList = searchUnit.filter(t => t.rarity === i);
                let gpList = unitList.map(u => '`'+u.gp.toLocaleString()+'` : '+u.player);
                if( unitList.length === 0 ) { continue; }
                embed.fields.push({
                    name:"★".repeat(i)+"☆".repeat(7-i)+" ("+unitList.length+")",
                    value:gpList.slice(0,25).join('\n')+'\n`-------------------------`\n',
                    inline:true
                });
                if( unitList.length > 25 ) {
                    embed.fields.push({
                        name:"...",
                        value:gpList.slice(25,50).join('\n')+'\n`-------------------------`\n',
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
