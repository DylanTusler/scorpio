module.exports = async ( client, message ) => {
	
	let retMessage = null;
	
	try {
		
		/** Split message on spaces and remove the command part */
		let args = message.content.split(/\s+/g).slice(1);
		if( !args || !args[0] ) { throw new Error('Please provide an allycode or discord user'); }
		
		/** Set allycode with no dashes and turn string into a number */
		args[0] = args[0].replace(/-/g,'');
		
		let discordId = args[0] === 'me' ? message.author.id : args[0].match(/\d{17,18}/) ? args[0].match(/\d{17,18}/)[0] : null;
		let allycode = args[0].match(/^\d{9}$/) ? args[0].match(/^\d{9}$/)[0] : null;
		
		if( !allycode && !discordId ) { throw new Error('Please provide a valid allycode or discord user'); }

        let calcMsg = '**I\'m looking up your guild, please wait...**';
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
		
		let embed = {};
		embed.title = `${guild.name}`;
		embed.description = guild.desc ? '**'+guild.desc+'**\n' : '';
		embed.description += guild.message ? '`'+guild.message+'`\n' : '';
		embed.description += '`------------------------------`\n';
		embed.description += '**GP**: `'+guild.gp.toLocaleString()+'`\n';
		embed.description += '**Members**: `'+guild.members+' / 50`\n';
		embed.description += guild.raid.rancor ? '**Rancor**: `'+guild.raid.rancor+'`\n' : '';
		embed.description += guild.raid.aat ? '**AAT**: `'+guild.raid.aat+'`\n' : '';
		embed.description += guild.raid.sith_raid ? '**Sith**: `'+guild.raid.sith_raid+'`\n' : '';
		embed.description += '`------------------------------`\n';

        calcMsg = '\n**Calculating roster, please wait...0%**';
        embed.description += calcMsg;
        await retMessage.edit({embed});
        embed.description = embed.description.replace(calcMsg,'');
        
        let coi = [];
        
        let arenas = [ 0, 0 ];
        let zetas = 0;
        
        let step = guild.members / 10;
        let perc = 0;
        for( let p of guild.roster ) {
            let player = await client.swapi.player( p.allyCode, 'eng_us' );
            arenas[0] += player.arena.char.rank;
            arenas[1] += player.arena.ship.rank;
            
            coi = coi.concat( player.roster.filter(t => {
                return ( 
                    t.defId === "DARTHTRAYA" ||
                    t.defId === "ENFYSNEST" ||
                    t.defId === "MAGMATROOPER" || 
                    t.defId === "BASTILASHAN" ||
                    t.defId === "EMPERORPALPATINE" ||
                    t.defId === "DARTHSION"
                )
            }) );
           
            if( --step < 0 ) { 
                step = guild.members / 10;
                perc += 10;
        
                calcMsg = '\n**Calculating roster, please wait...'+perc+'%**\n';
                embed.description += calcMsg;
                await retMessage.edit({embed});
                embed.description = embed.description.replace(calcMsg,'');
            }
        }
 
        embed.description += '**Avg char arena**: `'+Math.round(arenas[0] / guild.members)+'`\n';
        embed.description += '**Avg ship arena**: `'+Math.round(arenas[1] / guild.members)+'`\n';
        embed.description += '`------------------------------`\n'

        embed.fields = [];
        let value = null;
    
    
		let bastila = coi.filter(t => t.defId === "BASTILASHAN");
        value = '';
        value += '**★★★★★★★**: `'+bastila.filter(t => t.rarity === 7).length+'`\n';
        value += '**★★★★★★☆**: `'+bastila.filter(t => t.rarity === 6).length+'`\n';
        value += '**Zeta✦**: `'+bastila.filter(t => t.skills.filter(s => s.isZeta && s.tier === 8).length === 1).length+'`\n';
        value += '**XII**: `'+bastila.filter(t => t.gear === 12).length+'`\n';
        value += '**XI**: `'+bastila.filter(t => t.gear === 11).length+'`\n';
        value += '**X**: `'+bastila.filter(t => t.gear === 10).length+'`\n';
        value += '`------------------------------`\n'

        embed.fields.push({
            name:"Bastila Shan: "+bastila.length,
            value:value,
            inline:true
        });
               

		let nests = coi.filter(t => t.defId === "ENFYSNEST");
        value = '';
        value += '**★★★★★★★**: `'+nests.filter(t => t.rarity === 7).length+'`\n';
        value += '**★★★★★★☆**: `'+nests.filter(t => t.rarity === 6).length+'`\n';
        value += '**Zeta✦**: `'+nests.filter(t => t.skills.filter(s => s.isZeta && s.tier === 8).length === 1).length+'`\n';
        value += '**XII**: `'+nests.filter(t => t.gear === 12).length+'`\n';
        value += '**XI**: `'+nests.filter(t => t.gear === 11).length+'`\n';
        value += '**X**: `'+nests.filter(t => t.gear === 10).length+'`\n';
        value += '`------------------------------`\n'

        embed.fields.push({
            name:"Enfys Nest: "+nests.length,
            value:value,
            inline:true
        });
               

        let trayas = coi.filter(t => t.defId === "DARTHTRAYA");
        value = '';
        value += '**★★★★★★★**: `'+trayas.filter(t => t.rarity === 7).length+'`\n';
        value += '**★★★★★★☆**: `'+trayas.filter(t => t.rarity === 6).length+'`\n';
        value += '**Zeta✦✦**: `'+trayas.filter(t => t.skills.filter(s => s.isZeta && s.tier === 8).length === 2).length+'`\n';
        value += '**Zeta✦**: `'+trayas.filter(t => t.skills.filter(s => s.isZeta && s.tier === 8).length === 1).length+'`\n';
        value += '**XII**: `'+trayas.filter(t => t.gear === 12).length+'`\n';
        value += '**XI**: `'+trayas.filter(t => t.gear === 11).length+'`\n';
        value += '**X**: `'+trayas.filter(t => t.gear === 10).length+'`\n';
        value += '`------------------------------`\n'

        embed.fields.push({
            name:"Traya: "+trayas.length,
            value:value,
            inline:true
        });
               

		let palp = coi.filter(t => t.defId === "EMPERORPALPATINE");
        value = '';
        value += '**★★★★★★★**: `'+palp.filter(t => t.rarity === 7).length+'`\n';
        value += '**★★★★★★☆**: `'+palp.filter(t => t.rarity === 6).length+'`\n';
        value += '**Zeta✦✦**: `'+palp.filter(t => t.skills.filter(s => s.isZeta && s.tier === 8).length === 1).length+'`\n';
        value += '**Zeta✦**: `'+palp.filter(t => t.skills.filter(s => s.isZeta && s.tier === 8).length === 1).length+'`\n';
        value += '**XII**: `'+palp.filter(t => t.gear === 12).length+'`\n';
        value += '**XI**: `'+palp.filter(t => t.gear === 11).length+'`\n';
        value += '**X**: `'+palp.filter(t => t.gear === 10).length+'`\n';
        value += '`------------------------------`\n'

        embed.fields.push({
            name:"Emperor Palpatine: "+palp.length,
            value:value,
            inline:true
        });
               

		let sion = coi.filter(t => t.defId === "DARTHSION");
        value = '';
        value += '**★★★★★★★**: `'+sion.filter(t => t.rarity === 7).length+'`\n';
        value += '**★★★★★★☆**: `'+sion.filter(t => t.rarity === 6).length+'`\n';
        value += '**Zeta✦**: `'+sion.filter(t => t.skills.filter(s => s.isZeta && s.tier === 8).length === 1).length+'`\n';
        value += '**XII**: `'+sion.filter(t => t.gear === 12).length+'`\n';
        value += '**XI**: `'+sion.filter(t => t.gear === 11).length+'`\n';
        value += '**X**: `'+sion.filter(t => t.gear === 10).length+'`\n';
        value += '`------------------------------`\n'

        embed.fields.push({
            name:"Darth Sion: "+sion.length,
            value:value,
            inline:true
        });
               

        let magma = coi.filter(t => t.defId === "MAGMATROOPER");
        value = '';
        value += '**★★★★★★★**: `'+magma.filter(t => t.rarity === 7).length+'`\n';
        value += '**★★★★★★☆**: `'+magma.filter(t => t.rarity === 6).length+'`\n';
        value += '**XII**: `'+magma.filter(t => t.gear === 12).length+'`\n';
        value += '**XI**: `'+magma.filter(t => t.gear === 11).length+'`\n';
        value += '**X**: `'+magma.filter(t => t.gear === 10).length+'`\n';
        value += '`------------------------------`\n'

        embed.fields.push({
            name:"Magmatrooper: "+magma.length,
            value:value,
            inline:true
        });
               

		embed.color = 0x936EBB;
		embed.timestamp = today;

        retMessage.edit({embed}); 

	} catch(e) {
		throw e;
	}

}
