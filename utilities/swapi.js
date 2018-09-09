module.exports = (client) => {
	
	playerCooldown = client.settings.playerCooldown || 2;
	guildCooldown  = client.settings.guildCooldown  || 6;
	eventCooldown  = client.settings.squadCooldown  || 6;
	zetasCooldown  = client.settings.zetasCooldown  || 24*7;
	squadCooldown  = client.settings.squadCooldown  || 24*7;
	
	swgoh = client.swgoh;
	cache = client.cache;
	
	return {
	    stats:stats,
	    units:units,
		player:player,
		guild:guild,
		register:register,
		whois:whois,
		zetas:zetas,
		squads:squads,
		events:events
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
		
		if( (!allycodes || allycodes.length === 0) && (!discordIds || discordIds.length === 0) ) { 
			throw new Error('Please provide a list of valid allycodes'); 
		}
	
	    let payload = {
	        language:language,
	        enums:true
	    };
	    
	    if( allycodes && allycodes.length > 0 ) { payload.allycodes = allycodes; }
	    if( discordIds && discordIds.length > 0 ) { payload.discordIds = discordIds; }
	     
		/** If not found or expired, fetch new from API and save to cache */
		return await swgoh.fetchUnits(payload);
		
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
		
		if( !allycode && !discordId ) { 
			throw new Error('Please provide a valid allycode'); 
		}
		
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
			
			if( !player || player.length === 0 ) { 
				throw new Error('No player found'); 
			} 
			
			if( discordId ) { player[0].discordId = discordId; }
			player = await cache.put('swapi', 'players', {allyCode:player[0].allyCode}, player[0]);
		} 

        return Array.isArray(player) ? player[0] : player;
		
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
		
		if( !allycode && !discordId ) { 
			throw new Error('Please provide a valid allycode'); 
		}

		/** Get player from swapi cacher */
		return await swgoh.fetchAPI('/registration', {
			"put":[ [allycode,discordId] ],
			"get":[ allycode ]
		});

	} catch(e) {
		throw e;
	}	
}


/**
 *  Get registrations by allycode or discordId
 * 
 *  Params
 *  @allycode
 *  @discordId
 */
async function whois( ids ) {
	try {

		if( !ids ) { 
			throw new Error('Please provide one or more allycodes or discordIds'); 
		}

		/** Get player from swapi cacher */
		return await swgoh.fetchAPI('/registration', {
			"get":ids
		});

	} catch(e) {
		throw e;
	}	
}



/**
 *  Fetch zetas recommendations from cache, and sync if necessary
 * 
 */
async function zetas() {
	
	try {
    	
        let expiredDate = new Date();
	        expiredDate.setHours(expiredDate.getHours() - zetasCooldown);
		
		/** Get player from cache */
		let zetas = await cache.get('swapi', 'zetas', {updated:{ $gte:expiredDate.getTime() }});

		/** Check if existance and expiration */
		if( !zetas || !zetas[0] ) { 
		
			/** If not found or expired, fetch new from API and save to cache */
			zetas = await swgoh.fetchZetas({});
			
			if( !zetas ) { throw new Error('Error fetching zeta recommendations'); } 
			
			zetas = await cache.put('swapi', 'zetas', {}, zetas);

		} else {		
		    zetas = zetas[0];
		}

		return zetas;
		
	} catch(e) { 
		throw e; 
	}    		

}


/**
 *  Fetch squad recommendations from cache, and sync if necessary
 * 
 */
async function squads() {
	
	try {
    	
        let expiredDate = new Date();
	        expiredDate.setHours(expiredDate.getHours() - squadCooldown);
		
		/** Get player from cache */
		let squads = await cache.get('swapi', 'squads', {updated:{ $gte:expiredDate.getTime() }});

		/** Check if existance and expiration */
		if( !squads || !squads[0] ) { 
		
			/** If not found or expired, fetch new from API and save to cache */
			squads = await swgoh.fetchSquads({});
			
			if( !squads ) { throw new Error('Error fetching zeta recommendations'); } 
			
			squads = await cache.put('swapi', 'squads', {}, squads);

		} else {		
		    squads = squads[0];
		}

		return squads;
		
	} catch(e) { 
		throw e; 
	}    		

}


/**
 *  Fetch swgoh event schedule from cache, and sync if necessary
 * 
 */
async function events() {
	
	try {
    	
        let expiredDate = new Date();
	        expiredDate.setHours(expiredDate.getHours() - eventCooldown);
		
		/** Get player from cache */
		let events = await cache.get('swapi', 'events', {updated:{ $gte:expiredDate.getTime() }});

		/** Check if existance and expiration */
		if( !events || !events[0] ) { 
		
			/** If not found or expired, fetch new from API and save to cache */
			events = await swgoh.fetchEvents({ language:'eng_us' });
			
			if( !events ) { throw new Error('Error fetching events'); } 
			
			events.updated = (new Date()).getTime();
			events = await cache.put('swapi', 'events', {}, events);

		} else {		
		    events = events[0];
		}

		return events;
		
	} catch(e) { 
		throw e; 
	}    		

}
