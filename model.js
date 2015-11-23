function Entry(title, artist, album, art, id){
	this.title = title || "";
	this.artist = artist || "";
	this.album = album || "";
	this.art = art || "";
	this.id = id;
	this.skipped = "hide";
}