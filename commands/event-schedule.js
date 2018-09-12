module.exports = async ( client, message ) => {
	
	try {
		
		/** Get the event schedule from swapi cacher */
		let events = await client.swapi.events('eng_us');

		/** 
		 * REPORT OR PROCEED TO DO STUFF WITH EVENTS
		 * */

		let today = new Date();
		
		let embed = {};
		embed.title = 'Current event schedule';
		embed.description = '`------------------------------`\n';
			
        let schedule = [];
        for( let ev of events.events ) {
            if( ev.id.includes('shipevent_') ) { continue; }
            if( ev.id.includes('restrictedmodbattle_') ) { continue; }
            if( ev.id.includes('challenge_') ) { continue; }

            ev.nameKey = ev.nameKey.replace(/\\n/g,' ')
            ev.nameKey = ev.nameKey.replace(/\[\/*c\]/g,'')
            ev.nameKey = ev.nameKey.replace(/\[-\]/g,'')
            ev.nameKey = ev.nameKey.replace(/\[[\d|\w]{6}\]/g,'')
            ev.nameKey = ev.nameKey.toLowerCase();
            ev.nameKey = ev.nameKey.split(' ').map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(' ');

            if( ev.id.includes('EVENT_CREDIT_HEIST_GETAWAY_V2') || ev.id.includes('MYTHIC') || ev.id.includes('LEGENDARY') ) {
                ev.nameKey = "**"+ev.nameKey+"**";
            }
            
            for( let i of ev.instances ) {
                if( i.endTime < today.getTime() ) { continue; }
                schedule.push({ name:ev.nameKey, startTime:i.startTime });
            }
        }
        
        schedule.sort((a,b) => a.startTime - b.startTime);
        
        for( let si of schedule ) {
            let time = new Date(si.startTime).toLocaleString().split(/\s/)[0];
                time = time.split(/-/).map(t => t >= 10 ? t : '0'+t.toString()).join('-');
                
            embed.description += '`'+time+'` : '+si.name+'\n';
		}
		
		embed.description += '`------------------------------`\n';

		embed.color = 0x936EBB;
		embed.timestamp = today;

		message.channel.send({embed});
		
	} catch(e) {
		throw e;
	}

}
