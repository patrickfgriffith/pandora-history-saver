//connect to background and watch for changes to pandora.com and report them to background
var port = chrome.runtime.connect({name:"pandoraSaver"});


var hasLoaded = false;
var checkForImageChange = function (oldArt){ 		
	if( oldArt != document.getElementsByClassName("playerBarArt")[0].src ){	
		//now that we all new info lets send it to background and save it
		sendTrackInfo();
	}else{
		setTimeout( function(){ checkForImageChange(oldArt) }, 100 );
	}
}

var addTitleObserver = function(){
	var target = document.getElementsByClassName("playerBarSong")[0];
	var titleObserver = new MutationObserver(function(mutations) {
		//detected mutation, lets add the track to the history
		//now wait for image to change
		var album = document.getElementsByClassName("playerBarAlbum")[0].innerHTML;
		var art = document.getElementsByClassName("playerBarArt")[0].src;
		checkForImageChange(art);
	}); 
	titleObserver.observe(target, {attributes:true, childList:true, characterData:true});
}

//check for album image to finish loading before adding mutation observers
var checkInitImageLoaded = function (){	
	if( document.getElementsByClassName("playerBarArt")[0] ){
		hasLoaded = true;
		sendTrackInfo();
		//now add title observer
		addTitleObserver();
	}else{
		setTimeout( checkInitImageLoaded, 100 );
	}
}
checkInitImageLoaded();


function skipClicked(e) {	
	//send message to background
	var track = document.getElementsByClassName("playerBarSong")[0].innerHTML;
	port.postMessage({type:"addSkipMessage", data:track});
}
var skipTarget = document.getElementsByClassName("skipButton")[0];
skipTarget.addEventListener('click', skipClicked, false);

//builds an Entry and sends it to background to save
var sendTrackInfo = function(){
	var track = document.getElementsByClassName("playerBarSong")[0].innerHTML;
	var artist = document.getElementsByClassName("playerBarArtist")[0].innerHTML;
	var album = document.getElementsByClassName("playerBarAlbum")[0].innerHTML;
	var art = document.getElementsByClassName("playerBarArt")[0].src;
	//id is the date
	//TODO add a real date and display it as well.
	var entry = new Entry( track, artist, album, art, new Date().valueOf() );
	
	port.postMessage({type:"addTrackToHistory", data:entry});
	
};