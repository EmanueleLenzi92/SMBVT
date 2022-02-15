
// Use ECMAScript strict mode
"use strict";

var db = {};

$(document).ready(function() {
	
	// Set click event on home button
	$("#home").click(function() {
		db.logout().then(function () {
		  	console.log(currentTime() + "Successfully logged out");
			location.reload();
		});
	});
	
	// Open PouchDB remote database
	db = new PouchDB("https://dlnarratives.eu/db/test", {skipSetup:true});
	
	// Check if user is already logged in
	db.getSession(function (err, response) {
		if (err) {
			console.log(currentTime() + "Cannot login to remote database: ", err);
		} else if (!response.userCtx.name || response.userCtx.name !== "guest") {
			db.logout();
			console.log(currentTime() + "User needs to login");
			
			$("#auth-div").show();
		} else {
			console.log(currentTime() + "Logged in to remote database as \"" + response.userCtx.name + "\"");
			
			db.info()
			.then(function (result) {
				console.log(currentTime() + "Remote database is accessible")
				$("#emptyDiv, #auth-div").hide();
				$("#introDiv").show();
			})
			.catch(function (err) {
				console.log.bind(console);
			});
		}
	});
	
	$("#auth-form").bind("submit", function (event) {
		event.preventDefault();
		authenticate($("#inputName").val(), $("#inputPassword").val());
	});
	
	var suggestions = new Bloodhound({
	  datumTokenizer: function(results) {
	    return Bloodhound.tokenizers.whitespace(results);
	  },
	  queryTokenizer: Bloodhound.tokenizers.whitespace,
	  remote: {
	    url: 'https://www.wikidata.org/w/api.php?action=wbsearchentities&search=%QUERY&language=en&limit=10&format=json&callback=?',
			    wildcard: '%QUERY',
	    filter: function(response) {
	      return response.search;
	    }
	  }
	});

	suggestions.initialize();

	$('.typeahead').typeahead({
	  hint: false,
	  highlight: false,
	  minLength: 3,
	}, {
	  name: 'suggestions',
		limit: 10,
	  displayKey: function(suggestions) {
		  var desc = suggestions.description;
		  var finalString = suggestions.label + (desc !== undefined ? ' (' + desc + ')' : '');
	    return finalString;
	  },
	  source: suggestions.ttAdapter()
	});
	
	$('.typeahead').bind('typeahead:select', function(ev, suggestion) {
		$(this).blur();
		$(this).val('');
		$('#back').css('visibility', 'hidden');
		document.getElementById('topDiv').style.height = '56%';			
		window.open('tool.html?' + suggestion.id);
	});
});

// Authenticate user to database
function authenticate(user, pw) {	
	var ajaxOpts = {
	  ajax: {
	    headers: {
	      Authorization: 'Basic ' + window.btoa(user + ':' + pw)
	    }
	  }
	};
	
	// Login to remote database
	db.login(user, pw, ajaxOpts, function (err, response) {
	  if (err) {
		   if (err.status === 401) {
			   //console.log(currentTime() + "Username or password is incorrect")
			   //$("#auth-div").addClass("has-error");
			   //$("#auth-div .help-inline").text("Username or password is incorrect.");
			   	$.get("https://dlnarratives.eu/db/template_db/_register?username=" + encodeURIComponent(user) + "&password=" + encodeURIComponent(pw),
			   		function(data) {
			   		    authenticate(user, pw);
			   		}
			   	)
			   	.fail(function(error) {
			   		console.log(error);
			   	});
		   }
		   else {
			   console.log(currentTime() + "Cannot login to remote database: ", err);
		   }
      }
	  else {
			// Check if user has access to this specific database
			db.info().then(function (result) {
				console.log(currentTime() + "Logged in successfully as \"" + user + "\"");
				$("#emptyDiv, #auth-div").hide();
				$("#introDiv").show();	
			}).catch(function (err) {
				if (err.status === 401) {
					console.log(currentTime() + "User \"" + user + "\" has no access to this database")
					$("#auth-div").addClass("has-error");
					$("#auth-div .help-inline").text("Please try with a different user");
				}
				else {
					console.log(currentTime() + "Cannot login to remote database: ", err);
				}
			});
	  }
	});
	return false;
}

// Return current time
function currentTime() {
    var d = new Date();
    return d.toISOString().split("T")[1].replace("Z", "") + " -- ";
}
