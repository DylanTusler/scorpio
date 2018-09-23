module.exports = async ( client, message ) => {
	
	try {
		
		// $translate me fr 3
        
        // GET USER
        let { allycode, discordId, rest } = await client.helpers.getId( message );
        if( !discordId ) { 
            let error = new Error('Please specify a user to translate their messages');
            error.message += '\n```md\n<command> [user] <language> [number of messages]\n```\n'
            error.code = 400;
            throw error;            
        }

        // GET USER's NAME
        let authorName = await fetchDiscordUser( client, discordId );
        if( !authorName ) { 
            let error = new Error('I could not find this user in this channel');
            error.code = 400;
            throw error;            
        } 

        // GET LANGUAGE AND NUMBER OF MESSAGES TO TRANSLATE
        if( !rest || rest.length === 0 ) { 
            let error = new Error('Please specify a language and optional number of messages to translate');
            error.message += '\n```md\n<command> [user] <language> [number of messages]\n```\n'
            error.code = 400;
            throw error;            
        }

        rest = rest.split(/\s/);

        let language = rest[0];        
        let numMessages = parseInt(rest[1]) || 1;
        
        
        // GET MESSAGES
        let filteredMessages = await fetchMessages( client, message, discordId, numMessages )
        if( !filteredMessages ) { 
            let error = new Error('I could not find any messages in this channel - from this user');
            error.code = 400;
            throw error;            
        } 
  
  
        // PARSE FILTERED MESSAGES
        let ogcontent = "";
        for( let x = filteredMessages.length - 1; x >= 0; --x ) {
            ogcontent += `${filteredMessages[x].content}\n`;
        }


        // Translate ogcontent
        let translationResult = null;
        try {
            const translate = require('google-translate-api');
            translationResult = await translate(ogcontent, {to: language});
        } catch(e) { 
            let error = new Error('I encountered an error connecting to Google translation api');
            error.code = 400;
            throw error;            
        }
        
        if( !translationResult || !translationResult.text ) { 
            let error = new Error('No messages have been translated\nNote: I don\'t translate embeds or my own bot commands');
            error.code = 400;
            throw error;            
        }
         
        if( translationResult.text.length > 2000 ) { 
            let error = new Error('Translated copy is too long, please try less messages');
            error.code = 400;
            throw error;            
        } 

  
		let embed = {};

		embed.title = 'Translation of '+authorName+'\'s last '+numMessages+' message(s)';

		embed.description = '`------------------------------`\n';
		embed.description += translationResult.text+'\n';
		embed.description += '`------------------------------`\n';
		embed.description += translationResult.from.language.iso+' => '+language;
						
		embed.color = 0x2A6EBB;
		embed.timestamp = new Date();

		message.react('ℹ');
		message.channel.send({embed});
		
	} catch(e) {
		throw e;
	}

}

async function doTranslate( obj ) {
  try {


    let replyObj = {};
    replyObj.title = `Translation of ${authorName}'s last ${obj.command.args.num} message(s)`;
    replyObj.description = result.text;
    replyObj.description += '\n`------------------------------`\n'+result.from.language.iso+' => '+obj.command.args.lang;

    return obj.success(replyObj);

  } catch(e) {
    obj.error('translate.doTranslate',e);
  }
}


async function fetchDiscordUser( client, discordId ) {

    return new Promise((resolve, reject) => {
    
    	client.fetchUser(discordId).then( (user) => {
             if( !user || !user.username ) { resolve(false); }
             resolve(user.username);
        }).catch((err) => {
             resolve(null)
        });
    
    });
    
}

async function fetchMessages( client, message, discordId, numMsgs ) {
    
    return new Promise((resolve, reject) => {
       
    	message.channel.fetchMessages({before:message.id}).then( (messages) => {
	        
	        if( !messages || messages.length == 0 ) { resolve(false); }
	        
	        let filteredMessages = messages.filter(m => m.author.id === discordId && !m.content.startsWith(client.settings.prefix)).first(numMsgs);
	        
	        if( !filteredMessages || filteredMessages.length == 0 ) { resolve(false); }
	        resolve( filteredMessages );
	        
	    }).catch((err) => {
	        resolve(null);
	    });

    });
    
}

