module.exports = (clientSwgoh, clientCache, clientHelpers) => {
	
	swgoh = clientSwgoh;
	cache = clientCache;
	helpers = clientHelpers;
	
	playerCooldown = 2;
	guildCooldown = 6;
	
	return {
	    stats:stats,
	    units:units,
		player:player,
		guild:guild,
		register:register
	};

};


/**
 *  Fetch units from api with arrays of allycodes or discord id's
 *  ! This will fetch direct from api and will not cache 
 * 
 *  Params
 *  @ids - array of allycodes or discordIds to request (! discord Id requires patreon-tier api user)
 *  @language - language code for reply
 */
async function stats( units ) {
	
	try {
    	
    	let stats = null;
    	if( Array.isArray(units) ) {
    		// Get stats from array of profile roster units
    		stats = await swgoh.unitStats(units);
    	} else {
    	    // Get stats from units index
    		stats = await swgoh.rosterStats(units);
    	}
    	
		return stats;
		
	} catch(e) { 
		throw e; 
	}    		

}


/**
 *  Fetch units from api with arrays of allycodes or discord id's
 *  ! This will fetch direct from api and will not cache 
 * 
 *  Params
 *  @ids - array of allycodes or discordIds to request (! discord Id requires patreon-tier api user)
 *  @language - language code for reply
 */
async function units( ids, language ) {
	
	try {
    	
    	let allycodes = ids.filter(id => id.toString().match(/^\d{9}$/));
		let discordIds = ids.filter(id => id.toString().match(/^\d{17,18}$/));
		
		if( (!allycodes || allycodes.length === 0) && (!discordIds || discordIds.length === 0) ) { throw new Error('Please provide a list of valid allycodes'); }
	
	    let payload = {
	        language:language,
	        enums:true
	    };
	    
	    if( allycodes && allycodes.length > 0 ) { payload.allycodes = allycodes; }
	    if( discordIds && discordIds.length > 0 ) { payload.discordIds = discordIds; }
	     
		/** If not found or expired, fetch new from API and save to cache */
		let units = await swgoh.fetchUnits(payload);
			
		return units;
		
	} catch(e) { 
		throw e; 
	}    		

}


/**
 *  Fetch player profile object from cache, and sync if necessary
 *  ! This will only fetch a single allycode 
 * 
 *  Params
 *  @id - allycode or discordId (! discord Id requires patreon-tier api user)
 *  @language - language code for reply
 */
async function player( id, language ) {
	
	try {
    	
		let allycode = id.toString().match(/^\d{9}$/) ? parseInt(id.toString().match(/\d{9}/)[0]) : null;
		let discordId = id.toString().match(/^\d{17,18}$/) ? id.toString().match(/^\d{17,18}$/)[0] : null;
		
		if( !allycode && !discordId ) { throw new Error('Please provide a valid allycode'); }
		
        let expiredDate = new Date();
	        expiredDate.setHours(expiredDate.getHours() - playerCooldown);
		
		/** Get player from cache */
		let player = allycode ?
			await cache.get('swapi', 'players', {allyCode:allycode, updated:{ $gte:expiredDate.getTime() }}) :
			await cache.get('swapi', 'players', {discordId:discordId, updated:{ $gte:expiredDate.getTime() }});

		/** Check if existance and expiration */
		if( !player || !player[0] ) { 
		
			/** If not found or expired, fetch new from API and save to cache */
			player = allycode ? 
				await swgoh.fetchPlayer({ allycodes:[allycode], language:language, enums:true }) :
				await swgoh.fetchPlayer({ discordIds:[discordId], language:language, enums:true });
			
			if( !player || player.length === 0 ) { throw new Error('No player found'); } 
			
			if( discordId ) { player[0].discordId = discordId; }
			player = await cache.put('swapi', 'players', {allyCode:player[0].allyCode}, player[0]);
		} 

        player = Array.isArray(player) ? player[0] : player;
		return player;
		
	} catch(e) { 
		throw e; 
	}    		

}


/**
 *  Fetch guild profile object from cache, and sync if necessary
 *  ! This will only fetch a single allycode 
 * 
 *  Params
 *  @id - allycode or discordId (! discord Id requires patreon-tier api user)
 *  @language - language code for reply
 */
async function guild( id, language ) {
	
	try {

		/** Get player from cache */
		let player = await this.player(id, language);
		
        let expiredDate = new Date();
	        expiredDate.setHours(expiredDate.getHours() - guildCooldown);

		let guild  = await cache.get('swapi', 'guilds', {name:player.guildName, updated:{ $gte:expiredDate.getTime() }});

		/** Check if existance and expiration */
		if( !guild || !guild[0] ) { 
		
			/** If not found or expired, fetch new from API and save to cache */
			guild = await swgoh.fetchGuild({ allycode:player.allyCode, language:language, enums:true });
			guild = await cache.put('swapi', 'guilds', {name:guild.name}, guild);
			
		} else {
			/** If found and valid, serve from cache */
			guild = guild[0];
		}
		
		return guild;
		
	} catch(e) { 
		throw e; 
	}    		

}


/**
 *  Add a player to api registration, linking their allycode to their discordId
 * 
 *  Params
 *  @allycode
 *  @discordId
 */
async function register( allycode, discordId ) {
	try {

		allycode  = allycode.toString().match(/^\d{9}$/) ? parseInt(allycode.toString().match(/\d{9}/)[0]) : null;
		discordId = discordId.toString().match(/^\d{17,18}$/) ? discordId.toString().match(/^\d{17,18}$/)[0] : null;
		
		if( !allycode && !discordId ) { throw new Error('Please provide a valid allycode'); }

		/** Get player from swapi cacher */
		return await swgoh.fetchAPI('/registration', {
			"put":[ [allycode,discordId] ],
			"get":[ allycode ]
		});

	} catch(e) {
		throw e;
	}	
}

