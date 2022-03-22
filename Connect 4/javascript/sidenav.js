window.addEventListener("load", function() {
	var sidenavLinks = document.querySelectorAll('.sidenav a');

	sidenavLinks[0].className = 'active';

	for(var i = 1; i < sidenavLinks.length; i++){
	    if(document.URL.includes(sidenavLinks[i].href)){
	        sidenavLinks[i].className = 'active';
	        sidenavLinks[0].classList.remove('active');
	    }
	}
});