module.exports = async ( client, message ) => {
	
	let embed = {};
	let retMessage = null;
	
	try {
		
		let { allycode, discordId, rest } = await client.helpers.getId( message );

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
		
		embed.title = `${guild.name}`;
		embed.description = guild.desc ? '**'+guild.desc+'**\n' : '';
		embed.description += guild.message ? '`'+guild.message+'`\n' : '';
		embed.description += '`------------------------------`\n';
		embed.description += '**Members**: `'+guild.members+' / 50`\n';
		embed.description += guild.raid.rancor ? '**Rancor**: `'+guild.raid.rancor+'`\n' : '';
		embed.description += guild.raid.aat ? '**AAT**: `'+guild.raid.aat+'`\n' : '';
		embed.description += guild.raid.sith_raid ? '**Sith**: `'+guild.raid.sith_raid+'`\n' : '';
		embed.description += '**GP**: `'+guild.gp.toLocaleString()+'`\n';
		embed.description += '`------------------------------`\n';

        calcMsg = '\n**Calculating roster, please wait...**';
        
        embed.description += calcMsg;
        embed.image = { url:"https://media.discordapp.net/attachments/416390341533368321/502658773920514049/bb8s.gif" }

        await retMessage.edit({embed});
        embed.description = embed.description.replace(calcMsg,'');
        delete embed.image;
                
        let unitIndex = await client.swapi.unitIndex(client.settings.swapi.language);
        let charList = ["BASTILASHAN", "ENFYSNEST", "DARTHTRAYA"];
        let shipList = ["HOUNDSTOOTH"];
        
        //Check message for any units
        if( rest && rest.length > 0 ) {
            let names = rest.split(/\s/);
            charList = [];
            shipList = [];
            names.forEach(n => {
                let ui = unitIndex.units.filter(u => u.nameKey.replace(/[\\'|\\"|\\-]*/g,'').toLowerCase().includes(n.replace(/[\\'|\\"|\\-]*/g,'').toLowerCase()));
                ui = ui.filter(u => u.nameKey.replace(/[\\'|\\"|\\-]*/g,'').toLowerCase().split(/\s/).includes(n.replace(/[\\'|\\"|\\-]*/g,'').toLowerCase())).length > 0 ? ui.filter(u => u.nameKey.replace(/[\\'|\\"|\\-]*/g,'').toLowerCase().split(/\s/).includes(n.replace(/[\\'|\\"|\\-]*/g,'').toLowerCase())) : ui;
                ui = ui.filter(u => u.nameKey.replace(/[\\'|\\"|\\-]*/g,'').toLowerCase() === n.replace(/[\\'|\\"|\\-]*/g,'').toLowerCase()).length > 0 ? ui.filter(u => u.nameKey.replace(/[\\'|\\"|\\-]*/g,'').toLowerCase() === n.replace(/[\\'|\\"|\\-]*/g,'').toLowerCase()) : ui;
                ui.forEach( u => {    
                    if( u.combatType === 'CHARACTER' || u.combatType === 1 ) {
                        if( !charList.includes( u.baseId ) ) { 
                            charList.push( u.baseId );
                        }
                    } else {
                        if( !shipList.includes( u.baseId ) ) { 
                            shipList.push( u.baseId );
                        }
                    }
                })
            });
        }
        
        let coi = [];
        
        let arenas = [ 0, 0 ];
        let zetas = 0;
        
        let allycodes = guild.roster.map(p => p.allyCode);
        let units = null;
        try {
            units = await client.swapi.units( allycodes, client.settings.swapi.language );
            if( !units ) {             
	            let error = new Error('Error fetching units from swgoh.help');
	            error.code = 400;
	            throw error;
            }
        } catch(e) {
            console.error(e);
            let error = new Error('Error fetching units from swgoh.help');
            error.code = 400;
            throw error;
        }
         
        let unitIds = Object.keys(units);
        let shipGP = unitIds.map(id => { 
            if( units[id][0].type === 'SHIP' || units[id][0].type === 2 ) {
                return units[id].reduce((total,num) => parseInt(parseInt(total || 0) + parseInt(num.gp || 0)),0);
            }
            return 0;
        });
        shipGP = shipGP.filter(s => s);
        shipGP = shipGP.reduce((total,num) => parseInt(parseInt(total) + parseInt(num)),0);
        
        let charGP = unitIds.map(id => { 
            if( units[id][0].type === 'CHARACTER' || units[id][0].type === 1 ) {
                return units[id].reduce((total,num) => parseInt(parseInt(total || 0) + parseInt(num.gp || 0)),0);
            }
            return 0;
        });
        charGP = charGP.filter(c => c);
        charGP = charGP.reduce((total,num) => parseInt(parseInt(total) + parseInt(num)),0);
        
        embed.description += '**Calculated GP**: `'+(parseInt(shipGP)+parseInt(charGP)).toLocaleString()+'`\n';
        embed.description += '**Calculated Char GP**: `'+charGP.toLocaleString()+'`\n';
        embed.description += '**Calculated Ship GP**: `'+shipGP.toLocaleString()+'`\n';
		embed.description += '`------------------------------`\n';
                
        embed.fields = [];
        let value = null;
        
        for( let c of charList ) {
    
		    let u = units[c] || [];
		    let udef = unitIndex.units.filter(u => u.baseId === c)[0];

		    if( u.length > 0 ) {
		        value = '';
                value += '**★★★★★★★**: `'+u.filter(t => t.starLevel === 7).length+'`\n';
                value += '**★★★★★★☆**: `'+u.filter(t => t.starLevel === 6).length+'`\n';
                value += '**★★★★★☆☆**: `'+u.filter(t => t.starLevel === 5).length+'`\n';
                value += u.filter(t => t.zetas.length === 3).length > 0 ? '**Zeta ✦✦✦**: `'+u.filter(t => t.zetas.length === 3).length+'`\n' : '';
                value += u.filter(t => t.zetas.length === 2).length > 0 ? '**Zeta ✦✦**: `'+u.filter(t => t.zetas.length === 2).length+'`\n' : '';
                value += u.filter(t => t.zetas.length === 1).length > 0 ? '**Zeta ✦**: `'+u.filter(t => t.zetas.length === 1).length+'`\n' : '';
                value += '**Gear XII+**: `'+u.filter(t => t.gearLevel === 12 && t.gear.length >= 3).length+'`\n';
                value += '**Gear XII**: `'+u.filter(t => t.gearLevel === 12 && t.gear.length < 3).length+'`\n';
                value += '**Gear XI**: `'+u.filter(t => t.gearLevel === 11).length+'`\n';
                value += '**Gear X**: `'+u.filter(t => t.gearLevel === 10).length+'`\n';
            } else {
                value = 'None\n';
            }
            
            value += '`------------------------------`\n'

            embed.fields.push({
                name:udef.nameKey+": "+u.length,
                value:value,
                inline:true
            });

        }
        
        for( let s of shipList ) {
    
		    let u = units[s] || [];
		    let udef = unitIndex.units.filter(u => u.baseId === s)[0];

		    if( u.length > 0 ) {
		        value = '';
                value += '**★★★★★★★**: `'+u.filter(t => t.starLevel === 7).length+'`\n';
                value += '**★★★★★★☆**: `'+u.filter(t => t.starLevel === 6).length+'`\n';
                value += '**★★★★★☆☆**: `'+u.filter(t => t.starLevel === 5).length+'`\n';
            } else {
                value = 'None\n';
            }
            
            value += '`------------------------------`\n'

            embed.fields.push({
                name:udef.nameKey+": "+u.length,
                value:value,
                inline:true
            });

        }
        
		embed.color = 0x936EBB;
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
