module.exports = {

    parseIds: async ( message ) => {
        try {
        
            /** Set allycode with no dashes and turn string into a number */
		    let content = message.content.replace(/-/g,'');
		    
		    /** Split message on spaces and remove the command part */
		    let args = content.split(/\s+/g).slice(1);
		    if( !args || !args[0] ) { throw new Error('Please provide an allycode or discord user'); }
		
		    let discordIds = args.map(a => a.match(/\d{17,18}/) ? args[0].match(/\d{17,18}/)[0] : null);
		        discordIds = discordIds.filter(d => d);
		        
		    let allycodes = args.map(a => a.match(/^\d{9}$/) ? args[0].match(/^\d{9}$/)[0] : null);
		        allycodes = allycodes.filter(a => a);
		
		    if( allycodes.length + discordIds.length === 0 ) { throw new Error('Please provide a valid allycode or discord user'); }
            return { allycodes:allycodes, discordIds:discordIds };
        
        } catch(e) {
            throw e;
        }
    },

    getId: async ( message ) => {
        try {
        
            /** Split message on spaces and remove the command part */
		    let args = message.content.split(/\s+/g).slice(1);
		    if( !args || !args[0] ) { throw new Error('Please provide an allycode or discord user'); }
		
		    /** Set allycode with no dashes and turn string into a number */
		    args[0] = args[0].replace(/-/g,'');
		
		    let discordId = args[0] === 'me' ? message.author.id : args[0].match(/\d{17,18}/) ? args[0].match(/\d{17,18}/)[0] : null;
		    let allycode = args[0].match(/^\d{9}$/) ? args[0].match(/^\d{9}$/)[0] : null;
		
		    if( !allycode && !discordId ) { throw new Error('Please provide a valid allycode or discord user'); }
            return { allycode:allycode, discordId:discordId };
        
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
