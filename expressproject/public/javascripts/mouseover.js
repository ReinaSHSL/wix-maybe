document.getElementById("nanashi").onmouseover = function() {mouseOver()};
document.getElementById("nanashi").onmouseout = function() {mouseOut()};
function mouseOver(){
	document.getElementById('placeholder').src= 'http://i.imgur.com/YcMdHLJ.jpg';
}
function mouseOut(){
	document.getElementById('placeholder').src= 'http://i.imgur.com/zKrhNaW.png' 
}

