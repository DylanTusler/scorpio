module.exports = async ( client, message ) => {
	
	try {
		
		let { allycode, discordId, rest } = await client.helpers.getId( message );
        if( !rest ) {
            let error = new Error('Please specify a report and optionally, language\n```md\n<command> [user] <report> [language]```\n```\nReports  : mods, player, units, guild, guildUnits, guildRoster\nLanguages: chs_cn, cht_cn, eng_us, fre_fr, ger_de, ind_id, ita_it, jpn_jp, kor_kr, por_br, rus_ru, spa_xm, tha_th, tur_tr```\n');
            error.code = 400;
            throw error;            
        }

        let report = rest.split(/\s/)[0] || null;
        let language = rest.split(/\s/)[1] || 'eng_us';
        let enums = true;

        if( !allycode ) {
            let user = await client.swapi.whois([discordId]);
            if( !user || !user.get || user.get.length === 0 ) {
                let error = new Error('This user is not registered\nTry using an allycode, or registering this user');
                error.code = 400;
                throw error;            
            }
            allycode = user.get[0].allyCode;
	    }

		let today = new Date();
		
		let embed = {};
		embed.title = `Raw data report : ${allycode}`;
		embed.description = '`------------------------------`\n';
		embed.description += '✦ ['+report.charAt(0).toUpperCase()+report.slice(1)+':'+allycode+'](https://script.google.com/macros/s/AKfycbySlzQ6o0V_dvWQxMZj-p4lAbiqJ4jYKgxkRwZAY05NaMfrAMw/exec?report='+report+'&allycode='+allycode+'&language='+language+'&enums=true)\n';
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
