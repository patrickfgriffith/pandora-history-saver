//store history entries
window.onload = function() {
  gapi.auth.init(function() {
	gapi.client.load('youtube', 'v3', function() {
		console.log("loaded youtube api");			
	});
  });
}
var data = [];
chrome.runtime.onConnect.addListener(function(port) {
	console.assert(port.name == "pandoraSaver");
	port.onMessage.addListener(function(msg) {
		console.log(msg.type+" msg.data: ");
		console.log(msg.data);
		if(msg.type == "makePlaylist"){			
			makePlaylist();
		}
		if(msg.type == "saveHistoryAsText"){			
			saveHistoryAsText();
		}
		if(msg.type == "addSkipMessage"){
			addSkipMessage(msg.data);
		}
		if (msg.type == "removeTrackFromHistory"){
			removeTrackFromHistory(msg.data);
		}
		if (msg.type == "addTrackToHistory"){
			if(!sameTrack(msg.data)){
				addTrackToHistory(msg.data);
			}
		}
		if(msg.type == "getDataFromBackground"){			
			port.postMessage({type:"setData", data:data});
		}
	});
});
var makePlaylist = function(){
	var playlistId, channelId;
	var request = gapi.client.youtube.playlists.insert({
	part: 'snippet,status',
		resource: {
			snippet: {
				title: 'Pandora\'s History Playlist',
				description: 'A private playlist created with the YouTube API'
			},
			status: {
				privacyStatus: 'private'
			}
		}
	});
	request.execute(function(response) {
		var result = response.result;
		if (result) {
			playlistId = result.id;
			//$('#playlist-id').val(playlistId);
			//$('#playlist-title').html(result.snippet.title);
			//$('#playlist-description').html(result.snippet.description);
		} else {
			console.log('Could not create playlist');
		}
	});


	
	var textData = [];
	var len = data.length - 1;
	var temp;
	for(var i=len;i>0;i--){
		temp = data[i];
		var skipped = (temp.skipped == "show") ? "Skipped\r\n" : "";
		var entry = skipped+temp.title +"\r\nby \r\n"+ temp.artist +"\r\non the Album \r\n"+ temp.album + "\r\n \r\n";
		textData.push(entry);
	}
}
var saveHistoryAsText = function(){
	//make new array of text
	var textData = [];
	var len = data.length - 1;
	var temp;
	for(var i=len;i>0;i--){
		temp = data[i];
		var skipped = (temp.skipped == "show") ? "Skipped\r\n" : "";
		var entry = skipped+temp.title +"\r\nby \r\n"+ temp.artist +"\r\non the Album \r\n"+ temp.album + "\r\n \r\n";
		textData.push(entry);
	}
	
	var textFileAsBlob = new Blob(textData, {type:'text/plain'});
	var fileNameToSaveAs = "PandoraHistory";

	var downloadLink = document.createElement("a");
	downloadLink.download = fileNameToSaveAs;
	downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
	downloadLink.click();
}

var addSkipMessage = function(track){
	//find track with same name and add css show class
	var len = data.length - 1;
	var temp;
	for(var i=len;i>0;i--){
		temp = data[i];
		if( temp.title == track ){
			temp.skipped = "show";
			break;
		}
	}
	//save it now
	chrome.storage.local.set({'history': data}, function() {
		//console.log("saved");
    });
}

var removeTrackFromHistory = function(trackId){	
	var len = data.length;
	var temp;
	for(var i=0;i<len;i++){
		temp = data[i];
		if( temp.id == trackId ){
			data.splice(i,1);
			break;
		}
	}
	//save it now
	chrome.storage.local.set({'history': data}, function() {
		console.log("saved");
    });
}

var addTrackToHistory = function(info){	
	data.push(info);
	
	//save it now
	chrome.storage.local.set({'history': data}, function() {
		//console.log("saved");
    });
}

var sameTrack = function(msgData){
	//get last history entry and compare the two	
	if( data[data.length-1] ){
		var lastTrack = data[data.length-1].title;
		
		if(lastTrack !== msgData.title)
			return false;
		else
			return true;
	}else
		return false;
}

//load existing history if it exists else create new empty history
var init = function(){	
	//chrome.storage.local.clear();
	chrome.storage.local.get('history', function(obj){		
		if( obj.history )
			data = obj.history;
		else {
			obj.history = [];
			data = obj.history;
		}			
	});	
}
init();




