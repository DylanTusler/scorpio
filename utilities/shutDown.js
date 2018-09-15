module.exports = async ( client ) => {
	
	try {
		
		console.log('');
	    console.log('Received kill signal, shutting down gracefully');
	    let errors = [];

	    /**
	     * Close connections
	     */

	    try {	    	
			await client.mongo.close();
	    	console.log('Closed connection to mongo');
	    } catch(e) {
	    	errors.push('Could not close connection to mongo');
	    	console.error(e);
	    }
	    
	    /**
	     * Shut down
	     */

        const fs = require('fs');
        if( fs.existsSync(client.folders.utilities+'swgohAPI') ) {
            try {
                let gbapiSettings = await require(client.folders.utilities+'swgohAPI/swgoh.settings.json');
                gbapiSettings.user = await client.bgapi.currentUser();
                await fs.writeFileSync(client.folders.utilities+'swgohAPI/swgoh.settings.json', JSON.stringify(gbapiSettings), 'utf8');
	    	    console.log('Saved bgapi settings');
            } catch(e) {    
	        	errors.push('Could not save gbapi settings');
	        	console.error(e);
            }
        }

	    
	    if( errors.length > 0 ) {
	    	console.log(error.join('\n'));
	    	process.exit(1);
	    }
	    
        process.exit(0);

	} catch(e) {
		throw e;
	}

}
