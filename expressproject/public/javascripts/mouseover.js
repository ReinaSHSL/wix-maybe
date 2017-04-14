document.getElementById("nanashi").onmouseover = function() {mouseOver()};
document.getElementById("nanashi").onmouseout = function() {mouseOut()};
function mouseOver(){
  console.log('hi')
	document.getElementById('placeholder').src= 'http://i.imgur.com/YcMdHLJ.jpg';
}
function mouseOut(){
  console.log('o ok bye')
	document.getElementById('placeholder').src= 'http://i.imgur.com/zKrhNaW.png'
}
