var tableRow = "<tr><td>{0} ({1})</td><td>{2}</td><td>{3}</td><td>{4}</td><td class='{5}'>{6}</td></tr>"

$.getJSON('/get/bans',function(data){
	var abs = Math.abs

	for(var index in data){
		var player = data[index]
		var playerStr = tableRow;player.expired = 0

		if(player.diff >= player.ban_length)
			player.expired = 1
		player.remaining = (player.expired)? 'Expired' : timeConvert(abs(player.ban_length - player.diff))

		if(player.ban_length == 0){
			player.prettyLength = 'Permanent'
			player.remaining = 'Permanent'
			player.expired = 1
		}
		else{
			player.prettyLength = timeConvert( player.ban_length )
			if(player.expired){
				continue
			}
		}
		
		$(".table > tbody:last").append(tableRow.format(
			player.player_name
			, player.steam_id
			, player.ban_reason
			, player.banned_by
			, player.prettyLength
			, (player.expired)? player.remaining : ''
			, player.remaining)
		)
	}
})

function timeConvert(time){
	var j = ''
	if( Math.round(time/24/60) > 0)
		j += Math.round(time/24/60) + " days "
	if( Math.round(time/60%24) > 0)
		j += Math.round(time/60%24) + " hours "
	if( time%60 > 0 )
		j += time%60 + " minutes" 	
	return j
}