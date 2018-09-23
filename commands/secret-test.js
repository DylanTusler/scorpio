module.exports = async ( client, message ) => {
	
	let dump = null;
    let embed = {};
	let retMessage = null;
		
	try {

        embed.color = 0x936EBB;

        embed.title = "Test";
        embed.description = '';
        
		let calcMsg = '';
        let batchLen = 500;
        while( putArray.length > 0 ) {
            calcMsg = "Putting : "+batchLen+" of "+putArray.length+"\n";
            embed.description += calcMsg;
            await retMessage.edit({embed});
            embed.description = embed.description.replace(calcMsg,'');
            
            let batch = await client.swapi.register(putArray.splice(0,batchLen));
        }
        
        embed.description += "Reg dump complete";
        
        "image": {
          "url": "https://cdn.discordapp.com/embed/avatars/0.png"
        },
        
        retMessage = await message.channel.send({embed});
		
	} catch(e) {
	    if( e.code === 400 ) {
            message.reply(e.message);
	    } else {
		    throw e;
		}
	}

}
