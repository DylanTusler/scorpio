module.exports = async ( client, message ) => {
	
    let embed = {};
	let retMessage = null;
		
	try {
		
		let { allycode, discordId } = await client.helpers.getId( message );

        let unitName = message.content.split(/\s/).slice(2).join(' ');
        if( !unitName ) { throw new Error('No unit provided to stats'); }

        let unitIndex = await client.swapi.unitIndex('eng_us');            
            unitIndex = unitIndex.units.filter(u => u.nameKey.toLowerCase().includes(unitName.toLowerCase()));
        
        if( unitIndex.length === 0 ) { throw new Error('I could not match unit "'+unitName+'"'); }

        let calcMsg = 'I\'m looking up this guild, **please wait...**';
        retMessage = await message.reply(calcMsg);

		/** Get player from swapi cacher */
		let guild = allycode ? 
			await client.swapi.guild(allycode, 'eng_us') :
			await client.swapi.guild(discordId, 'eng_us');

		/** 
		 * REPORT OR PROCEED WITH TO DO STUFF WITH GUILD OBJECT 
		 * */
		
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
        
        embed.fields = [];
        
        let searchUnit = units[unitIndex[0].baseId] || [];
		embed.description = '__**'+unitIndex[0].nameKey+'**__\n';
		
		if( searchUnit.length > 0 ) {
            embed.description += '`------------------------------`\n';
            embed.description += '**Guild search found `'+searchUnit.length+' units`\n';
            embed.description += '**★★★★★★★**: `'+searchUnit.filter(t => t.starLevel === 7).length+'`\n';
            embed.description += '**★★★★★★☆**: `'+searchUnit.filter(t => t.starLevel === 6).length+'`\n';
            
            let zz = searchUnit.filter(t => t.zetas.length === 3).length;
            embed.description += zz > 0 ? '**Zeta✦✦✦**: `'+zz+'`\n' : '';

            zz = searchUnit.filter(t => t.zetas.length === 2).length;
            embed.description += zz > 0 ? '**Zeta✦✦**: `'+zz+'`\n' : '';

            zz = searchUnit.filter(t => t.zetas.length === 1).length;
            embed.description += zz > 0 ? '**Zeta✦**: `'+zz+'`\n' : '';

            embed.description += '**XII**: `'+searchUnit.filter(t => t.gearLevel === 12).length+'`\n';
            embed.description += '**XI**: `'+searchUnit.filter(t => t.gearLevel === 11).length+'`\n';
            embed.description += '**X**: `'+searchUnit.filter(t => t.gearLevel === 10).length+'`\n';
            embed.description += '`------------------------------`\n'

            let payload = {};
                payload[unitIndex[0].baseId] = searchUnit;
                
            let stats = await client.swapi.stats( payload, ["includeMods","withModCalc","gameStyle"] );

            let count = 0;
            let value = '';
            let fname = "Speed report";

            if( stats[unitIndex[0].baseId].length > 0 ) { 
                stats[unitIndex[0].baseId].sort((a,b) => b.stats.final.Speed - a.stats.final.Speed); 
                for( let ps of stats[unitIndex[0].baseId] ) {
                    
                    ++count;
                    value += '`'+Math.floor(ps.stats.final.Speed || 0)+' (+'+Math.floor(ps.stats.mods.Speed || 0)+')` : '+ps.unit.player+'\n';
                    if( count >= 25 ) {
                        value += '`------------------------------`\n'
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
                    value += '`------------------------------`\n'
                    embed.fields.push({
                        name:fname,
                        value:value,
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
