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

        let unit = player.roster.filter(u => u.type === 'CHARACTER' || u.type === 1);
            unit = player.roster.filter(u => u.name.toLowerCase().includes(unitName.toLowerCase()));
            unit = player.roster.filter(u => u.name.toLowerCase() === unitName.toLowerCase()).length > 0 ? player.roster.filter(u => u.name.toLowerCase() === unitName.toLowerCase()) : unit;
       
        if( unit.length === 0 ) { 
	        let error = new Error('I could not match *character* "'+unitName+'"');
	        error.code = 400;
	        throw error;
        }


		let today = new Date();
		
		embed.title = `${player.name} - ${unit[0].name}`;
		embed.description = '`------------------------------`\n';

        embed.fields = [];
        
        let count = 1;
        for( let m of unit[0].mods ) {

            let value = '';
            let name = '';

            while( count < m.slot ) {
                name = '__**'+client.helpers.mods.slot(count)+'**__ : `';
                embed.fields.push({
                    name:name+'none`',
                    value:'-\n-\n-\n`------------------------------`\n',
                    inline:true
                });
                ++count;
            }
            
            name = '__**'+client.helpers.mods.slot(count)+'**__ : `';
            name += client.helpers.mods.level( m.level, m.tier );
            name += ' ['+'⚬'.repeat(m.pips)+'-'.repeat(6 - m.pips)+']`\n';
            
            value = '**Set** : ';
            value += '`'+client.helpers.mods.set( m.set )+'`\n';
            
            value += '**Primary Stat**\n';
            value += '`'+m.primaryBonusValue+' '+client.helpers.mods.stat( m.primaryBonusType )+'`\n';

            value += '**Secondary Stats**\n';
            value += m.secondaryType_1.length > 0 ? '`'+m.secondaryValue_1+' '+client.helpers.mods.stat( m.secondaryType_1 )+'`\n' : '';
            value += m.secondaryType_2.length > 0 ? '`'+m.secondaryValue_2+' '+client.helpers.mods.stat( m.secondaryType_2 )+'`\n' : '';
            value += m.secondaryType_3.length > 0 ? '`'+m.secondaryValue_3+' '+client.helpers.mods.stat( m.secondaryType_3 )+'`\n' : '';
            value += m.secondaryType_4.length > 0 ? '`'+m.secondaryValue_4+' '+client.helpers.mods.stat( m.secondaryType_4 )+'`\n' : '';

            value += '`------------------------------`\n';
            		
            embed.fields.push({
                name:name,
                value:value,
                inline:true
            });
            ++count;
        }        
        
		embed.color = 0x936EBB;
		embed.timestamp = today;

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

function modSet( set ) {
    switch( set ) {
        case 1:
            return 'Health';
        case 2:
            return 'Offense';
        case 3:
            return 'Defense';
        case 4:
            return 'Speed';
        case 5:
            return 'Crit Chance';
        case 6:
            return 'Crit Damage';
        case 7:
            return 'Potency';
        case 8:
            return 'Tenacity';
        default:
            return '';
    }
}

function modLevel( level, tier ) {
    switch( tier ) {
        case 1:
            return level+'-E';
        case 2:
            return level+'-D';
        case 3:
            return level+'-C';
        case 4:
            return level+'-B';
        case 5:
            return level+'-A';
        case 6:
            return level+'-S';
        default:
            return '';
    }
}

function modSlot( slot ) {
    switch( slot ) {
        case 1:
            return 'Square';
        case 2:
            return 'Arrow';
        case 3:
            return 'Diamond';
        case 4:
            return 'Triangle';
        case 5:
            return 'Circle';
        case 6:
            return 'Cross';
        default:
            return '';
    }
}

function modStat( type ) {
    switch( type ) {
        case "UNITSTATACCURACY":
            return "Potency";
        case "UNITSTATCRITICALCHANCEPERCENTADDITIVE":
            return "Crit Chance";
        case "UNITSTATCRITICALDAMAGE":
            return "Crit Damage";
        case "UNITSTATCRITICALNEGATECHANCEPERCENTADDITIVE":
            return "Crit Avoidance";
        case "UNITSTATDEFENSE":
            return "Defense";
        case "UNITSTATDEFENSEPERCENTADDITIVE":
            return "Defence";
        case "UNITSTATEVASIONNEGATEPERCENTADDITIVE":
            return "Potency";
        case "UNITSTATMAXHEALTH":
            return "Health";
        case "UNITSTATMAXHEALTHPERCENTADDITIVE":
            return "Health";
        case "UNITSTATMAXSHIELD":
            return "Protection";
        case "UNITSTATMAXSHIELDPERCENTADDITIVE":
            return "Protection";
        case "UNITSTATOFFENSE":
            return "Offense";
        case "UNITSTATOFFENSEPERCENTADDITIVE":
            return "Offense";
        case "UNITSTATRESISTANCE":
            return "Tenacity";
        case "UNITSTATSPEED":
            return "Speed";
        default:
            return "";
    }
}
