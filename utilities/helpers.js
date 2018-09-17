module.exports = {

    filterCharacter: async ( name, roster ) => {
        try {
        
            let unit = roster.filter(u => u.type === 'CHARACTER' || u.type === 1);
                unit = unit.filter(u => u.name.toLowerCase().includes(name.toLowerCase()));
                unit = unit.filter(u => u.name.toLowerCase() === name.toLowerCase()).length > 0 ? unit.filter(u => u.name.toLowerCase() === name.toLowerCase()) : unit;
           
            if( unit.length === 0 ) { 
	            let error = new Error('I could not match *character* "'+name+'"');
	            error.code = 400;
	            throw error;
            }
            
            return unit[0];
            
        } catch(e) {
            throw e;
        }
    },

    filterShip: async ( name, roster ) => {
        try {
        
            let unit = roster.filter(u => u.type === 'SHIP' || u.type === 2);
                unit = unit.filter(u => u.name.toLowerCase().includes(name.toLowerCase()));
                unit = unit.filter(u => u.name.toLowerCase() === name.toLowerCase()).length > 0 ? unit.filter(u => u.name.toLowerCase() === name.toLowerCase()) : unit;
           
            if( unit.length === 0 ) { 
	            let error = new Error('I could not match *ship* "'+name+'"');
	            error.code = 400;
	            throw error;
            }
            
            return unit[0];
            
        } catch(e) {
            throw e;
        }
    },

    mods:{
      
        set: ( set ) => {
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
        },
        
        level: ( level, tier ) => {
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
        },
        
        slot: ( slot ) => {
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
        },
        
        stat( stat ) {
            switch( stat ) {
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
      
    },
    
    parseIds: async ( message ) => {
        try {
        
            /** Set allycode with no dashes and turn string into a number */
		    let content = message.content.replace(/-/g,'');
		    
		    /** Split message on spaces and remove the command part */
		    let args = content.split(/\s+/g).slice(1);
		    if( !args || !args[0] ) { 
		        let error = new Error('Please provide an allycode or discord user'); 
		        error.code = 400;
		        throw error;
		    }
		
		    let discordIds = args.map(a => a.match(/\d{17,18}/));
		        discordIds = discordIds.filter(d => d);
		        
		    let allycodes = args.map(a => a.match(/^\d{9}$/));
		        allycodes = allycodes.filter(a => a);
		
		    if( args.map(a => a === 'me').length > 0 ) {
		        discordIds.push(message.author.id.toString());
		    }
		    
		    if( allycodes.length + discordIds.length === 0 ) { 
		        let error = new Error('Please provide a valid allycode or discord user'); 
		        error.code = 400;
		        throw error;
		    }
            return { allycodes:allycodes, discordIds:discordIds };
        
        } catch(e) {
            throw e;
        }
    },

    getId: async ( message ) => {
        try {
        
            let discordId = null;
            let allycode = null;
            
            /** Split message on spaces and remove the command part */
		    let args = message.content.split(/\s+/g).slice(1);
		    let rest = args;
		    
		    if( args && args.length > 0 ) { 
		        /** Set allycode with no dashes and turn string into a number */
		        let arg = args[0].replace(/-/g,'');
		
		        if( arg === 'me' ) {
		            discordId = message.author.id.toString();
		            rest = args.slice(1);
		        } else if( arg.match(/\d{17,18}/) ) {
		            discordId = arg.match(/\d{17,18}/)[0];
		            rest = args.slice(1);
		        } else if( arg.match(/^\d{9}$/) ) {
		            allycode = arg.match(/^\d{9}$/)[0];
		            rest = args.slice(1);
		        }
		    } 
            
            if( !allycode && !discordId ) { 
		        discordId = message.author.id.toString();
		    }
		    		
		    if( !allycode && !discordId ) { 
		        let error = new Error('Please provide a valid allycode or discord user'); 
		        error.code = 400;
		        throw error;
		    }
            
            return { allycode:allycode, discordId:discordId, rest:rest.join(' ') };
        
        } catch(e) {
            throw e;
        }
    },

	isAllowed: async ( client, message ) => {
		try {
			const allowed = client.settings.allowed.length <= 0 || message.channel.type === 'dm' || client.settings.allowed.includes(message.guild.id);
			if( !allowed ) { throw new Error(client.settings.notallowed); }
			return true;
		} catch(e) {
			throw e;
		}
	},
	
	convertMS: ( milliseconds ) => {
	    var day, hour, minute, seconds;
	    seconds = Math.floor(milliseconds / 1000);
	    minute = Math.floor(seconds / 60);
	    seconds = seconds % 60;
	    hour = Math.floor(minute / 60);
	    minute = minute % 60;
	    day = Math.floor(hour / 24);
	    hour = hour % 24;
	    return {
	        day: day,
	        hour: hour,
	        minute: minute,
	        seconds: seconds
	    };
	},
	
	replyWithFile: async ( message, json, name ) => {
		const buffer  = new Buffer(JSON.stringify(json,"","  "));
	    const Discord = require('discord.js');
	    return await message.author.send(new Discord.Attachment(buffer, name+'.json'));
	},
	
	replyWithZip: async ( message, zipped, name ) => {
	    const buffer  = new Buffer(zipped);
	    const Discord = require('discord.js');
	    return await message.author.send(new Discord.Attachment(buffer, name+'.zip'));
	},
	
	replyWithError: async ( message, error ) => {
		message.react('⛔');
		return await message.reply(error.message);
	}

}
