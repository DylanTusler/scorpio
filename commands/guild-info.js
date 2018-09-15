module.exports = async ( client, message ) => {
	
    let embed = {};
	let retMessage = null;
	
	try {
		
		let { allycode, discordId } = await client.helpers.getId( message );

        let calcMsg = '**I\'m looking up this guild, please wait...**';
        retMessage = await message.reply(calcMsg);

		/** Get player from swapi cacher */
		let guild = allycode ? 
			await client.swapi.guild(allycode, client.settings.swapi.language) :
			await client.swapi.guild(discordId, client.settings.swapi.language);

		/** 
		 * REPORT OR PROCEED WITH TO DO STUFF WITH GUILD OBJECT 
		 * */
		
		let today = new Date();
		let age = client.helpers.convertMS(today - new Date(guild.updated));
		
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

        calcMsg = '\n**Calculating roster, please wait...**';
        embed.description += calcMsg;
        await retMessage.edit({embed});
        embed.description = embed.description.replace(calcMsg,'');
        
        let coi = [];
        
        let arenas = [ 0, 0 ];
        let zetas = 0;
        
        let allycodes = guild.roster.map(p => p.allyCode);
        let units = await client.swapi.units( allycodes, client.settings.swapi.language );
         
        
        embed.fields = [];
        let value = null;
        
    
		let bastila = units["BASTILASHAN"] || [];
		if( bastila.length > 0 ) {
		    value = '';
            value += '**★★★★★★★**: `'+bastila.filter(t => t.starLevel === 7).length+'`\n';
            value += '**★★★★★★☆**: `'+bastila.filter(t => t.starLevel === 6).length+'`\n';
            value += '**Zeta✦**: `'+bastila.filter(t => t.zetas.length === 1).length+'`\n';
            value += '**XII**: `'+bastila.filter(t => t.gearLevel === 12).length+'`\n';
            value += '**XI**: `'+bastila.filter(t => t.gearLevel === 11).length+'`\n';
            value += '**X**: `'+bastila.filter(t => t.gearLevel === 10).length+'`\n';
            value += '`------------------------------`\n'
        } else {
            value = 'None\n';
            value += '`------------------------------`\n'
        }

        embed.fields.push({
            name:"Bastila Shan: "+bastila.length,
            value:value,
            inline:true
        });

		let nests = units["ENFYSNEST"] || [];
		if( nests.length > 0 ) {
            value = '';
            value += '**★★★★★★★**: `'+nests.filter(t => t.starLevel === 7).length+'`\n';
            value += '**★★★★★★☆**: `'+nests.filter(t => t.starLevel === 6).length+'`\n';
            value += '**Zeta✦**: `'+nests.filter(t => t.zetas.length === 1).length+'`\n';
            value += '**XII**: `'+nests.filter(t => t.gearLevel === 12).length+'`\n';
            value += '**XI**: `'+nests.filter(t => t.gearLevel === 11).length+'`\n';
            value += '**X**: `'+nests.filter(t => t.gearLevel === 10).length+'`\n';
            value += '`------------------------------`\n'
        } else {
            value = 'None\n';
            value += '`------------------------------`\n'
        }
        
        embed.fields.push({
            name:"Enfys Nest: "+nests.length,
            value:value,
            inline:true
        });
               

		let sion = units["DARTHSION"] || [];
        if( sion.length > 0 ) {
            value = '';
            value += '**★★★★★★★**: `'+sion.filter(t => t.starLevel === 7).length+'`\n';
            value += '**★★★★★★☆**: `'+sion.filter(t => t.starLevel === 6).length+'`\n';
            value += '**Zeta✦**: `'+sion.filter(t => t.zetas.length === 1).length+'`\n';
            value += '**XII**: `'+sion.filter(t => t.gearLevel === 12).length+'`\n';
            value += '**XI**: `'+sion.filter(t => t.gearLevel === 11).length+'`\n';
            value += '**X**: `'+sion.filter(t => t.gearLevel === 10).length+'`\n';
            value += '`------------------------------`\n'
        } else {
            value = 'None\n';
            value += '`------------------------------`\n'
        }
        
        embed.fields.push({
            name:"Darth Sion: "+sion.length,
            value:value,
            inline:true
        });
               

        let magma = units["MAGMATROOPER"] || [];
        if( magma.length > 0 ) {
            value = '';
            value += '**★★★★★★★**: `'+magma.filter(t => t.starLevel === 7).length+'`\n';
            value += '**★★★★★★☆**: `'+magma.filter(t => t.starLevel === 6).length+'`\n';
            value += '**XII**: `'+magma.filter(t => t.gearLevel === 12).length+'`\n';
            value += '**XI**: `'+magma.filter(t => t.gearLevel === 11).length+'`\n';
            value += '**X**: `'+magma.filter(t => t.gearLevel === 10).length+'`\n';
            value += '`------------------------------`\n'
        } else {
            value = 'None\n';
            value += '`------------------------------`\n'
        }
        
        embed.fields.push({
            name:"Magmatrooper: "+magma.length,
            value:value,
            inline:true
        });
               

		let palp = units["EMPERORPALPATINE"] || [];
        if( palp.length > 0 ) {
            value = '';
            value += '**★★★★★★★**: `'+palp.filter(t => t.starLevel === 7).length+'`\n';
            value += '**★★★★★★☆**: `'+palp.filter(t => t.starLevel === 6).length+'`\n';
            value += '**Zeta✦✦**: `'+palp.filter(t => t.zetas.length === 1).length+'`\n';
            value += '**Zeta✦**: `'+palp.filter(t => t.zetas.length === 1).length+'`\n';
            value += '**XII**: `'+palp.filter(t => t.gearLevel === 12).length+'`\n';
            value += '**XI**: `'+palp.filter(t => t.gearLevel === 11).length+'`\n';
            value += '**X**: `'+palp.filter(t => t.gearLevel === 10).length+'`\n';
            value += '`------------------------------`\n'
        } else {
            value = 'None\n';
            value += '`------------------------------`\n'
        }
        
        embed.fields.push({
            name:"Emperor Palpatine: "+palp.length,
            value:value,
            inline:true
        });
               

        let trayas = units["DARTHTRAYA"] || [];
        if( trayas.length > 0 ) {
            value = '';
            value += '**★★★★★★★**: `'+trayas.filter(t => t.starLevel === 7).length+'`\n';
            value += '**★★★★★★☆**: `'+trayas.filter(t => t.starLevel === 6).length+'`\n';
            value += '**Zeta✦✦**: `'+trayas.filter(t => t.zetas.length === 2).length+'`\n';
            value += '**Zeta✦**: `'+trayas.filter(t => t.zetas.length === 1).length+'`\n';
            value += '**XII**: `'+trayas.filter(t => t.gearLevel === 12).length+'`\n';
            value += '**XI**: `'+trayas.filter(t => t.gearLevel === 11).length+'`\n';
            value += '**X**: `'+trayas.filter(t => t.gearLevel === 10).length+'`\n';
            value += '`------------------------------`\n'
        } else {
            value = 'None\n';
            value += '`------------------------------`\n'
        }
        
        embed.fields.push({
            name:"Traya: "+trayas.length,
            value:value,
            inline:true
        });
               

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
