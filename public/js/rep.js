var str_row = "<tr><td>{0}</td><td class='playerName' id='{1}'>{2}</td><td>{3}</td></tr>"

$(function(){
	$("#cover").show()

	$.get('/get/reputation', function(rows){
		$("table").find("tr:gt(0)").remove()

		for(var index=0; index<rows.length; index++){
			var player = rows[index]

			$('table tr:last').after( str_row.format( index+1, player.player_id, player.name, player.rep ) );
		}
		$("#cover").hide()

		$(".playerName").click(function(){
			window.location.href = '/player/{0}/{1}'.format($(this).attr('id'), $(this).text().replace(/[^a-zA-Z_0-9]/g,'') )
		})

	}, "json")
})