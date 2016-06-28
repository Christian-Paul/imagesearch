$('.search').click(function() {
	var userInput = $('.user-input').val();
	var myURL = document.location;
	myURL = myURL + 'search/' + userInput;

	location.href = myURL;
})

$('.recent').click(function() {
	location.href = document.location + 'history';
})