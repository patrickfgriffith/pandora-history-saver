//load youtube api on window load
window.onload = function() {
  gapi.auth.init(function() {
	gapi.client.load('youtube', 'v3', function() {
		console.log("loaded youtube api");			
	});
  });
}
var numItems = 0;
var currItem = 0;
var historyData = [];
//onload get saved history from background
var port = chrome.runtime.connect({name:"pandoraSaver"});
port.postMessage({type:"getDataFromBackground", data:""});

//got data from background
port.onMessage.addListener(function(msg) {
	if (msg.type == "setData")
		addSavedHistory( msg.data );
});

var addSavedHistory = function(data){
	numItems = data.length;
	historyData = data;
	initHistory();
}

var initHistory = function(){
	console.log("data:");
	console.log(historyData);
	//if list is 0 then a instruction message will be displayed instead
	if( numItems != 0){
		//remove the message
		$('#instructions').addClass('hide');
		for(var i=0;i<numItems;i++){
			addTrackToHistoryPopup(historyData[currItem], i);
			currItem++;
		}
	}
}

var addTrackToHistoryPopup = function(elem, num){	
	//add template to popup.html
	
	//add diff bg color class to odd number entries 
	var oddClass = num%2 ? "odd" : "";
	var entryTemplate = 
		"<div class='historyEntry "+oddClass+"' data-id='"+elem.id+"'>" +
			"<div class='thumbnail'>" +
				"<img class='songArt' src='"+elem.art+"'></img>" +
				"<img class='removeBtn' src='img/remove.png'></img>" +
			"</div>" +
			"<div class='info'>" +
				"<div class='songTitle' title='Watch on Youtube'>"+elem.title+"</div>" +
				"<div class='songArtist'>"+elem.artist+"</div>" + 
				"<div class='songAlbum'><span class='onType'>on</span> "+elem.album+"</div>" +
			"</div>" +
			"<div class='skipped "+elem.skipped+"'>S K I P P E D</div>" +
		"</div>" +
		"<div style='clear: both'></div>";
	$('#historyContent').prepend(entryTemplate);
}


//handle click events on popup.html
function historyContentHandler(e) {	
	if (e.target.className == "songTitle") {//get song title and artist and search youtube api for most popular result
		var songTitle = $(e.target).html();
		var songArtist = $(e.target).next().html();
		var request = gapi.client.youtube.search.list({
			q: songTitle + songArtist,
			part: 'snippet',
			type: 'video',
			key: 'AIzaSyA3EqGy1-P16r8LLtxzNRJ9GzHhZCy6Zv0'
		});
		request.execute(function(response) {
			var prefix = "https://www.youtube.com/watch?v=";
			var vid = response.result.items[0].id.videoId;
			window.open(prefix+vid, "#");
		});
	}else if (e.target.className == "removeBtn") {//remove song from history
		//visually remove it from popup.html
		var historyEntry = $(e.target).parents(".historyEntry");
		historyEntry.css( "display", "none" );
		//now send message to background to remove it from saved data 
		port.postMessage({type:"removeTrackFromHistory", data:historyEntry.data("id")});
	}
	e.stopPropagation();
}
document.getElementById('historyContent').addEventListener('click', historyContentHandler, false);

//send message to background to export txt from saved data
function saveHistoryAsText(){
	port.postMessage({type:"saveHistoryAsText", data:""});
}
document.getElementById('saveHistory').addEventListener('click', saveHistoryAsText, false);

//send message to background to export txt from saved data
function makePlaylist(){
	port.postMessage({type:"makePlaylist", data:""});
}
document.getElementById('makePlaylist').addEventListener('click', makePlaylist, false);

