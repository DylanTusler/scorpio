module.exports = async ( client, message ) => {
	
	try {
		
		let { allycode, discordId, rest } = await client.helpers.getId( message );

		/** Get player from swapi cacher */
		let player = allycode ?
			await client.swapi.player(allycode, client.settings.swapi.language) :
			await client.swapi.player(discordId, client.settings.swapi.language);
		
		if( !player ) {
		    message.reply('I could not find this player.\nMake sure the user is registered, or the allycode is correct.');
		}

		if( player.error ) { return message.reply(player.error); }

		let today = new Date();
		let age = client.helpers.convertMS(today - new Date(player.updated));
		
		let embed = {};
		embed.title = `${player.name} - ${player.allyCode}`;
		embed.description = '`------------------------------`\n';
	    embed.description += '**Level** : `'+player.level+'`\n';
	    embed.description += player.guildName ? '**Guild** : `'+player.guildName+'`\n' : '**Guild** : `none`\n';
	    embed.description += '**Total GP** : `'+player.stats.filter(s => s.index === 1)[0].value.toLocaleString()+'`\n';
        embed.fields = [];
        let value = null;
		
		let characters = player.roster.filter(u => u.combatType === 'CHARACTER' || u.combatType === 1);
        let ships = player.roster.filter(u => u.combatType === 'SHIP' || u.combatType === 2);
            
            
        //Check message for any units
        if( rest && rest.length > 0 ) {

		    let unitIndex = await client.swapi.unitIndex(client.settings.swapi.language);
            let charList = [];
            let shipList = [];
            
            let names = rest.split(/\s/);
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
            
            
            for( let c of charList ) {
    
		        let u = characters.filter(ch => ch.defId === c)[0] || null;
                let name = null;
                        
		        if( u ) {
		            value = '';
		            value += '**L'+u.level+'** | **G'+u.gear+'** | ';
                    value += '**'+'★'.repeat(u.rarity)+'☆'.repeat(7-u.rarity)+'** \n';
                    let us = u.skills.filter(s => s && s.isZeta);
                    if( us.length > 0 ) {
                        let total = us.filter(s => s.tier === 8).length;
                        value += '**Zetas** : '+'✦'.repeat(total)+'⟡'.repeat(us.length - total)+' \n';
                    }
                    value += '**GP** : `'+u.gp+'` \n';
                    name = u.nameKey;
                } else {
                    value = 'Locked \n';
                    let ui = unitIndex.units.filter(uu => uu.baseId === c)[0];
                    name = ui.nameKey;
                }
                
                value += '`------------------------------`\n'

                embed.fields.push({
                    name:name,
                    value:value,
                    inline:true
                });

            }
            
            for( let s of shipList ) {
        
		        let u = ships.filter(sh => sh.defId === s)[0] || null;
                let name = null;
                
		        if( u ) {
		            value = '';
		            value += '**L'+u.level+'** | ';
                    value += '**'+'★'.repeat(u.rarity)+'☆'.repeat(7-u.rarity)+'** \n';
                    let us = u.skills.filter(s => s.id.includes('hardware'));
                    if( us.length > 0 ) {
                        value += '**Hardware** : `'+us[0].tier+'` \n';
                    } else if( !u.defId.includes('CAPITAL') ) {
                        value += '**Hardware** : `1` \n';
                    }
                    value += '**GP** : `'+u.gp+'` \n';
                    name = u.nameKey;
                } else {
                    value = 'Locked \n';
                    let ui = unitIndex.units.filter(uu => uu.baseId === s)[0];
                    name = ui.nameKey;
                }
                
                value += '`------------------------------`\n'

                embed.fields.push({
                    name:name,
                    value:value,
                    inline:true
                });

            }            
            
        } else {

            embed.description += '**PVP Ship wins** : `'+player.stats.filter(s => s.index === 4)[0].value.toLocaleString()+'`\n';
            embed.description += '**PVP Char wins** : `'+player.stats.filter(s => s.index === 5)[0].value.toLocaleString()+'`\n';
            embed.description += '**PVE Battle wins** : `'+player.stats.filter(s => s.index === 6)[0].value.toLocaleString()+'`\n';
            embed.description += '**Hard node wins** : `'+player.stats.filter(s => s.index === 7)[0].value.toLocaleString()+'`\n';
            embed.description += '**Galactic war wins** : `'+player.stats.filter(s => s.index === 8)[0].value.toLocaleString()+'`\n';
            embed.description += '**Guild raid wins** : `'+player.stats.filter(s => s.index === 9)[0].value.toLocaleString()+'`\n';
            embed.description += '**Total guild contribution** : `'+player.stats.filter(s => s.index === 10)[0].value.toLocaleString()+'`\n';
            embed.description += '**Total guild exchange donations** : `'+player.stats.filter(s => s.index === 11)[0].value.toLocaleString()+'`\n';


            value = '★★★★★★★: `'+characters.filter(u => u.rarity === 7).length+'`\n';
            value += '★★★★★★☆: `'+characters.filter(u => u.rarity === 6).length+'`\n';
            value += '★★★★★☆☆: `'+characters.filter(u => u.rarity === 5).length+'`\n';
            value += '★★★★☆☆☆: `'+characters.filter(u => u.rarity === 4).length+'`\n';
            value += '★★★☆☆☆☆: `'+characters.filter(u => u.rarity === 3).length+'`\n';
            value += '**Arena rank**: `'+(player.arena.char.rank || 'none')+'`\n';
            value += '**Total zetas**: `'+characters.reduce((total,u) => parseInt(total) + parseInt(u.skills.filter(s => s.isZeta && s.tier === 8).length) || 0, 0)+'`\n';
            value += '**Total mods**: `'+characters.reduce((total,u) => parseInt(total) + parseInt(u.mods.length) || 0, 0)+'`\n';
            value += '**Level 85**: `'+characters.filter(u => u.level === 85).length+'`\n';
            value += '**GP**: `'+player.stats.filter(s => s.index === 2)[0].value.toLocaleString()+'`\n';
            value += '**XII+**: `'+characters.filter(u => u.gear === 12 && u.equipped.length >= 3).length+'`\n';
            value += '**XII**: `'+characters.filter(u => u.gear === 12 && u.equipped.length < 3).length+'`\n';
            value += '**XI**: `'+characters.filter(u => u.gear === 11).length+'`\n';
            value += '**X**: `'+characters.filter(u => u.gear === 10).length+'`\n';
            value += '`------------------------------`\n';
            
            embed.fields.push({
                name:"Characters ( "+characters.length+" )",
                value:value,
                inline:true
            });


            value = '★★★★★★★: `'+ships.filter(u => u.rarity === 7).length+'`\n';
            value += '★★★★★★☆: `'+ships.filter(u => u.rarity === 6).length+'`\n';
            value += '★★★★★☆☆: `'+ships.filter(u => u.rarity === 5).length+'`\n';
            value += '★★★★☆☆☆: `'+ships.filter(u => u.rarity === 4).length+'`\n';
            value += '★★★☆☆☆☆: `'+ships.filter(u => u.rarity === 3).length+'`\n';
            value += '**Arena rank**: `'+(player.arena.ship.rank || 'none')+'`\n';
            value += '**Hardware Lvl 3**: `'+ships.reduce((total,u) => parseInt(total) + parseInt(u.skills.filter(s => s.id.startsWith("hardware") && s.tier === 3).length) || 0, 0)+'`\n';
            value += '**Hardware Lvl 2**: `'+ships.reduce((total,u) => parseInt(total) + parseInt(u.skills.filter(s => s.id.startsWith("hardware") && s.tier === 2).length) || 0, 0)+'`\n';
            value += '**Level 85**: `'+ships.filter(u => u.level === 85).length+'`\n';
            value += '**GP**: `'+player.stats.filter(s => s.index === 3)[0].value.toLocaleString()+'`\n';
            value += '`------------------------------`\n';
            
            embed.fields.push({
                name:"Ships ( "+ships.length+" )",
                value:value,
                inline:true
            });
            
        }

		embed.color = 0x936EBB;
		embed.timestamp = today;

		message.channel.send({embed});
		
	} catch(e) {
	    if( e.code === 400 ) {
            message.reply(e.message);
	    } else {
		    throw e;
		}
	}

}
