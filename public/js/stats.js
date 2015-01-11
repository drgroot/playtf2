var Str_row = "<tr><td>{0}</td><td class='playerName' id='{1}'>{2}</td><td>{3}</td><td>{4}</td><td>{5}</td></tr>"
var cur_page = 1

$(function(){
	populate(cur_page)

	$("#prev").click(function(){cur_page--; populate(cur_page)})
	$("#next").click(function(){cur_page++; populate(cur_page)})
})

function populate(page){
	if(page <1){
		cur_page = 1
		return
	}

	$("#cover").show()
	cur_page = page

	$.getJSON('/get/page/' + page, function(rows){
		$("table").find("tr:gt(0)").remove();
		$("#cover").hide()
		for(var index in rows){
			var player = rows[index]
			
			var rank = 15*(page -1) + parseInt(index) + 1

			var row = Str_row.format(rank, player.player_id, player.name, parseInt(player.elo), player.kills, player.deaths)
			$('table tr:last').after(row);
		}

		$(".playerName").click(function(){
			window.location.href = '/player/{0}/{1}'.format($(this).attr('id'), $(this).text().replace(/[^a-zA-Z_0-9]/g,'') )
		})
	})
}