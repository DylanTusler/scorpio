module.exports = ( client ) => {
	
	cache = client.cache;
	
	logDB = client.settings.logDB || 'botLogs';
	
	return {
		success:success,
		warning:warning,
		fail:fail,
		
		saveLog:saveLog,
		search:search
	};

};


/**
 * Search logs
 *
 * Params
 * @collection - collection to search
 * @matchCriteria - match criteria object
 */
async function search( collection, matchCriteria ) {	
	try {
    	
		if( !collection ) { throw new Error('No collection to search'); }
		if( !matchCriteria ) { throw new Error('No matchCriteria to search by'); }
    	return await cache.get(logDB, collection, matchCriteria);
    	
	} catch(e) { 
		throw e; 
	}
}


/**
 * Save success log
 * Wrapper for saveLog, setting collection to 'success'
 *
 * @return - { logId, result }
 *
 * Params
 * @log - log object
 */
async function success( log ) {	
	try {
    	
		if( !log ) { throw new Error('No log to add'); }
    	return await saveLog('success',log);
    	
	} catch(e) { 
		throw e; 
	}
}

/**
 * Save warning log
 * Wrapper for saveLog, setting collection to 'warning'
 *
 * @return - { logId, result }
 *
 * Params
 * @log - log object
 */
async function warning( log ) {
	try {
    	
		if( !log ) { throw new Error('No log to add'); }
    	return await saveLog('warning',log);
    	
	} catch(e) { 
		throw e; 
	}
}

/**
 * Save fail log
 * Wrapper for saveLog, setting collection to 'fail'
 *
 * @return - { logId, result }
 *
 * Params
 * @log - log object
 */
async function fail( log ) {
	try {
    	
		if( !log ) { throw new Error('No log to add'); }
    	return await saveLog('fail',log);
    	
	} catch(e) { 
		throw e; 
	}
}

/**
 * Save log
 *
 * @return - { logId, result }
 *
 * Params
 * @collection - collection to save in
 * @log - log object
 */
async function saveLog( collection, log ) {
	try {
	
		if( !log ) { throw new Error('No log to add'); }
        log.id = generateLogId(JSON.stringify(log));			
    	return {
    	    logId:log.id,
    	    result:await cache.put(logDB, collection, {id:log.id}, log)
    	};
    	
	} catch(e) { 
		throw e; 
	}    		
}


/**
 * Generate log ID
 *
 * @return <string>
 *
 * Params
 * @seed - seed for hash
 */
function generateLogId(seed) {
    if( !seed || seed.length === 0 ) { return ""; }
    seed = seed.toString();
    var hval = 0x811c9dc5;
    // Strips unicode bits, only the lower 8 bits of the values are used
    for (var i = 0; i < seed.length; i++) {
        hval = hval ^ (seed.charCodeAt(i) & 0xFF);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    let id = (hval >>> 0).toString();
    return "L"+(id.length > 10 ? "0".repeat(10-id.length) : "")+id;
}
