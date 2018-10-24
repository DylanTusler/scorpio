//Build client
const Discord 	= require('discord.js');
const client 	= new Discord.Client();

/** SET CLIENT SETTINGS */
client.folders = {
	root:__dirname,
	config:__dirname+'/config/',
	utilities:__dirname+'/utilities/',
	commands:__dirname+'/commands/',
	tmp:__dirname+'/tmp/'	
}


/**
 * STARTUP, INIT SETTINGS AND LOGIN
 */
client.startUp = async () => {
	try {
		await require(client.folders.utilities+'startUp.js')( client );
		await client.login(client.settings.token);
    } catch(err) {
        console.error('\n ! '+err);
        process.exit(-1);
    }    
}


/**
 * SHUTDOWN GRACEFULLY
 */
client.shutDown = async () => {
	try {
		await require(client.folders.utilities+'shutDown.js')( client );
    } catch(err) {
        console.error('\n ! '+err);
        process.exit(-1);
    }    
}


/**
 * MONITOR CLIENT
 */
//ON READY
client.on('ready', async () => {    
	console.info(`Started successfully`);
	client.user.setActivity(client.settings.prefix+'help', { type: 'LISTENING' })
        .then(presence => console.log(`Activity set to ${presence.game ? presence.game.name : 'none'}`))
        .catch(console.error);
}); 

//ON DISCONNECT
client.on('disconnect', async (event) => {
	console.error(`\n ! Client disconnected: [${event.code}] ${event.reason}`);
	//Try login again
	if( event.code !== 4004 ) {
		try {
			await client.login(client.settings.token);
		} catch(e) {
			console.error(' ! Error trying to re-login\n',e);
			await client.shutDown();
		}
	}
});

//ON RECONNECTING
client.on('reconnecting', async (e) => {
	console.warn('\n ! Client reconnecting -'+new Date());	
	if(e) console.error(e.message);	
});

//ON RESUME
client.on('resumed', async (replayed) => {
    console.info('\n ! Client resumed -'+new Date());
    if(replayed) console.log(replayed);	
});

//ON ERROR
client.on('error', async (error) => {
    console.error('\n ! Client connection error -'+new Date());
    if(error) console.error(error.message);
});

//ON WARNING
client.on('warn', async (info) => {
	console.warn('\n ! Client warning -'+new Date());
	if(info) console.warn(info);    
});



/**
 * MONITOR MESSAGES
 */
//ON MESSAGE RECEIVED
client.on('message', async (message) => {
  
	/** Ignore conditions **/
	if( message.author.bot ) { return; }
	if( !message.content.startsWith(client.settings.prefix) ) { return; }

	let command = null;
	let log = { 
	    date:new Date(), 
	    user:message.author.tag || message.author.id,
	    channel:message.channel.name || message.channel.id,
	    server:message.channel.guild ? message.channel.guild.name : ''
	};
	
	try {
	
		//Match command syntax
		const prefix = client.settings.prefix.replace(/([\$\^])/g,'\\$1');
		const cmdRegex = new RegExp("^("+prefix+")(\\w+)");
		command = message.content.match(cmdRegex) ? message.content.match(cmdRegex)[2].trim() : null;
		
		/** Ignore condition **/
		if( !command || !client.settings.commandsMap[command] ) { return; }
		log.command = command;
		//await message.react('💩');	
		//return message.reply('sorry... i\'m broke at the moment and will return when my master gets his shit together\n...likely another few days, sorry.\nFeel free to complain with: `$complain <complaint>`');

		//Do command
		await client.helpers.checkClientPermissions( client, message );
		
		await message.react('🤔');
	    await require(client.folders.commands+client.settings.commandsMap[command])( client, message );
	    await client.log.success(log);
			
	} catch(e) {
		let { logId, result } = await client.log.fail(log);
		if( e.code !== 400 ) {
    	    console.error(e);
			e.message += "\n[See logId: "+logId+"]\n";
        }
		await client.helpers.replyWithError( message, e );
	}	
	
});

process.on('SIGTERM', client.shutDown);
process.on('SIGINT', client.shutDown);

//Do start up
client.startUp();
