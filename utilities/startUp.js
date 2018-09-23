module.exports = async ( client ) => {
	
	try {
		
		/** INIT CLIENT SETTINGS **/
		client.settings = require(client.folders.config+( process.argv[2] || 'settings' )+'.json');
        client.settings.commandsMap = {};
        
        for( let c in client.settings.commands ) {
    		client.settings.commandsMap = Object.assign(client.settings.commandsMap, client.settings.commands[c]);
    	}
		
		/** INIT CLIENT HELPERS */
		client.helpers = require(client.folders.utilities+'helpers.js');		
		
		/** INIT CLIENT CACHE */
		const MongoClient = require('mongodb').MongoClient;
		client.mongo = await MongoClient.connect(client.settings.swapi.database, { useNewUrlParser: true } );
		client.cache = await require(client.folders.utilities+'cache.js')( client );

		/** INIT CLIENT HELPERS */
		client.log = require(client.folders.utilities+'logs.js')( client );		
		
		/** INIT SWGOH SERVICE */
		const ApiSwgohHelp = require('api-swgoh-help');
		client.swgoh = new ApiSwgohHelp(client.settings.swapi);
		client.swapi = await require(client.folders.utilities+'swapi.js')( client );

        
        const fs = require('fs');
        if( fs.existsSync(client.folders.utilities+'swgohAPI') ) {
            let gbapiSettings = await require(client.folders.utilities+'swgohAPI/swgoh.settings.json');
            client.bgapi = await require(client.folders.utilities+'swgohAPI')(gbapiSettings);
        }
		
	} catch(e) {
		console.error(e);
		throw e;
	}

}
