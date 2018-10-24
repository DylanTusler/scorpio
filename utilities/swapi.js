module.exports = (client) => {
	
	playerCooldown = client.settings.playerCooldown || 2;
	guildCooldown  = client.settings.guildCooldown  || 6;
	eventCooldown  = client.settings.squadCooldown  || 6;
	zetasCooldown  = client.settings.zetasCooldown  || 24*3;
	squadCooldown  = client.settings.squadCooldown  || 24*3;
	
	swgoh = client.swgoh;
	cache = client.cache;
	
	return {
	    stats:stats,
	    calcStats:calcStats,
	    units:units,
		player:player,
		guild:guild,
		register:register,
		unregister:unregister,
		whois:whois,
		zetas:zetas,
		squads:squads,
		events:events,
		
		imageUrl:imageUrl,
		
		unitIndex:unitIndex,
		skillIndex:skillIndex
	};

};


function imageUrl( type, params ) {
	    
    let url = "https://api.swgoh.help/image";
    
    params = params || {};
            
    switch( type ) {
        case "gear":        
            url += "/gear/"+(params.id || '');
            break;
        case "mods":        
            url += "/mods/"+(params.id || '');
            break;
        case "ship":
            url += "/ship/"+(params.id || '');
            break;
        case "char":        
        case "author":
        default:
            url += "/char/"+(params.id || '');
            break;
            
    }

//    if( Object.keys(params).length > 1 ) { url += "?bg=35383e" };
    url += "?bg=000";
    
    url += params.level  ? "&level="+params.level    : '';
    url += params.gear   ? "&gear="+params.gear      : '';
    url += params.rarity ? "&rarity="+params.rarity  : '';
    url += params.zetas  ? "&zetas="+params.zetas    : '';
    url += params.pilots  ? "&pilots="+params.pilots.join('|') : '';
    
    //console.log(url);
    return url;

}


/**
 *  Fetch units from api with arrays of allycodes or discord id's
 *  ! This will fetch direct from api and will not cache 
 * 
 *  Params
 *  @ids - array of allycodes or discordIds to request (! discord Id requires patreon-tier api user)
 *  @language - language code for reply
 */
async function calcStats( allycode, baseId, flags ) {
	try {
    	return await swgoh.calcStats( allycode, baseId, flags );
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
async function stats( units, flags ) {
	
	try {
    	
    	let stats = null;
    	if( Array.isArray(units) ) {
    		// Get stats from array of profile roster units
    		stats = await swgoh.rosterStats(units, flags);
    	} else {
    	    // Get stats from units index
    		stats = await swgoh.unitsStats(units, flags);
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
	        enums:false,
	        mods:true
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
			null;

        
		/** Check if existance and expiration */
		if( !player || player.length === 0 ) { 
		    
			/** If not found or expired, fetch new from API and save to cache */
			player = allycode ? 
			    await swgoh.fetchPlayer({ allycodes:[allycode], language:language, enums:true }) :
			    await swgoh.fetchPlayer({ discordIds:[discordId], language:language, enums:true });

			if( !player || player.length === 0 ) { 
				throw new Error('No player found'); 
			} 
			
			//if( discordId ) { player[0].discordId = discordId; }
			for( let p of player ) {
			    p.updated = p.updated || (new Date()).getTime();
			    p = await cache.put('swapi', 'players', {allyCode:p.allyCode}, p);
			}
			
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
			guild = await cache.put('swapi', 'guilds', {name:guild[0].name}, guild[0]);
			
			if( !player || player.length === 0 ) { 
				throw new Error('No guild found'); 
			} 
			
			let groster = await swgoh.fetchGuild({ allycode:player.allyCode, language:language, enums:true, roster:true });
			for( let p of groster.roster ) {
			    p.updated = p.updated || (new Date()).getTime();
			    p = await cache.put('swapi', 'players', {allyCode:p.allyCode}, p);
			}
			
		} else {
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
async function register( putArray ) {
	try {

        let getArray = putArray.map(a => a[0]);
        
		/** Get player from swapi cacher */
		return await swgoh.fetchAPI('/registration', {
			"put":putArray,
			"get":getArray
		});

	} catch(e) {
		throw e;
	}	
}


/**
 *  Remove a player from api registration, by allycode or discordId
 * 
 *  Params
 *  @allycode
 *  @discordId
 */
async function unregister( remArray ) {
	try {

		/** Get player from swapi cacher */
		return await swgoh.fetchAPI('/registration', {
			"del":remArray
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
async function events(language) {
	
	try {
    	
        let expiredDate = new Date();
	        expiredDate.setHours(expiredDate.getHours() - eventCooldown);
		
		/** Get player from cache */
		let events = await cache.get('swapi', 'events', {updated:{ $gte:expiredDate.getTime() }});

		/** Check if existance and expiration */
		if( !events || !events[0] ) { 
		
			/** If not found or expired, fetch new from API and save to cache */
			events = {
			    events:await swgoh.fetchEvents({ language:language }),
			    updated:(new Date()).getTime()
			}
			
			if( !events.events ) { throw new Error('Error fetching events'); } 
			
			events = await cache.put('swapi', 'events', {}, events);

		} else {		
		    events = events[0];
		}

		return events;
		
	} catch(e) { 
		throw e; 
	}    		

}


/**
 *  Fetch localized units index from cache, or sync if necessary
 * 
 */
async function unitIndex(language) {
	
	try {
    	
        let expiredDate = new Date();
	        expiredDate.setHours(expiredDate.getHours() - eventCooldown);
		
		/** Get units from cache */
		let units = await cache.get('swapi', 'units', {language:language, updated:{ $gte:expiredDate.getTime() }});

		/** Check if existance and expiration */
		if( !units || !units[0] ) { 
		
			/** If not found or expired, fetch new from API and save to cache */
			units = {
			    units:await swgoh.fetchData({
                    "collection": "unitsList",
                    "language": language,
                    "enums":true,
                    "match": {
                        "rarity": 7,
                        "obtainable": true, 
                        "obtainableTime": 0                     	
                    },
                    "project": {
                        "baseId": 1,
                        "nameKey": 1,
                        "descKey": 1,
                        "forceAlignment": 1,
                        "combatType": 1,
                        "categoryIdList": 1,
                        "skillReferenceList": 1,
                        "crewList": 1 
                    }
                }),
			    language:language,
			    updated:(new Date()).getTime()
			}
			
			if( !units.units ) { throw new Error('Error fetching units'); } 
			
			units = await cache.put('swapi', 'units', {language:language}, units);

		} else {		
		    units = units[0];
		}

        units.units = units.units.filter(u => u.baseId !== 'AWAKENEDREY');
		return units;
		
	} catch(e) { 
		throw e; 
	}    		

}


/**
 *  Fetch localized skills index from cache, or sync if necessary
 * 
 */
async function skillIndex(language) {
	
	try {
    	
        let expiredDate = new Date();
	        expiredDate.setHours(expiredDate.getHours() - eventCooldown);
		
		/** Get units from cache */
		let skills = await cache.get('swapi', 'skills', {language:language, updated:{ $gte:expiredDate.getTime() }});

		/** Check if existance and expiration */
		if( !skills || !skills[0] ) { 
		
			/** If not found or expired, fetch new from API and save to cache */
			skills = {
			    skills:await swgoh.fetchData({
                    "collection": "skillList",
                    "language": "eng_us",
                    "enums":true,
                    "project": {
                        "id":1, 
                        "abilityReference":1,
                        "isZeta":1
                    }
                }),
                abilities:await swgoh.fetchData({
                    "collection": "abilityList",
                    "language": "eng_us",
                    "enums":true,
                    "project": {
                        "id":1, 
                        "type":1, 
                        "nameKey":1,
                        "descKey":1,
                        "tierList":1
                    }
                }),
                language:language,
			    updated:(new Date()).getTime()
			}
			
			if( !skills.skills && !skills.abilities  ) { throw new Error('Error fetching skills'); } 
			
			skills = await cache.put('swapi', 'skills', {language:language}, skills);

		} else {		
		    skills = skills[0];
		}

		return skills;
		
	} catch(e) { 
		throw e; 
	}    		

}
