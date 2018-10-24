module.exports = async ( client, message ) => {
	
	try {
		
		/** Get the event schedule from swapi cacher */
		let data = await client.swapi.events(client.settings.swapi.language);
        let events = data.events;
        
		/** 
		 * REPORT OR PROCEED TO DO STUFF WITH EVENTS
		 * */

		let today = new Date()
		    today = today.setHours(today.getHours() - 24);
		    
		let embed = {};
		embed.title = 'Current event schedule';
		embed.description = '`------------------------------`\n';
	    
	    
	    //Parse events into schedule
        let schedule = [];
        for( let ev of events.events ) {
            //Strip out garbage events
            if( ev.id.includes('shipevent_') ) { continue; }
            if( ev.id.includes('restrictedmodbattle_') ) { continue; }
            if( ev.id.includes('challenge_') ) { continue; }

            //Sanitize names
            ev.nameKey = ev.nameKey.replace(/\\n/g,' ')
            ev.nameKey = ev.nameKey.replace(/\[\/*c\]/g,'')
            ev.nameKey = ev.nameKey.replace(/\[-\]/g,'')
            ev.nameKey = ev.nameKey.replace(/\[[\d|\w]{6}\]/g,'')
            ev.nameKey = ev.nameKey.toLowerCase();
            ev.nameKey = ev.nameKey.split(' ').map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(' ');

            //Highlight important event names
            if( ev.id.includes('EVENT_CREDIT_HEIST_GETAWAY_V2') || ev.id.includes('MYTHIC') || ev.id.includes('LEGENDARY') ) {
                ev.nameKey = "**"+ev.nameKey+"**";
            }
            
            //Append to schedule
            for( let i of ev.instanceList ) {
        		if( client.debug ) { console.log( JSON.stringify(i) ); }                
                //Ignore completed events and append active and upcoming
                if( i.endTime < today ) { continue; }
                schedule.push({ name:ev.nameKey, startTime:i.startTime });
            
            }
        }
        
        
        //Sort schedule by start time
        schedule.sort((a,b) => a.startTime - b.startTime);
        
        for( let si of schedule ) {
            let time = new Date(si.startTime).toLocaleString().split(/\s/)[0];
                time = time.split(/-/).slice(1).map(t => t >= 10 ? t : '0'+t.toString()).join('-');
                
            embed.description += '`'+time+'` : '+si.name+'\n';
		}
		
		embed.description += '`------------------------------`\n';

		embed.color = 0x936EBB;
		embed.timestamp = today;

		message.channel.send({embed});
		
	} catch(e) {
	    if( e.code === 400 ) {
            message.reply(e.message);
	    } else {
		    throw e;
		}
	}

}
