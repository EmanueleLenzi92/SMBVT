
// Use ECMAScript strict mode
"use strict";

var db = {};

$(document).ready(function() {
	
	// Set click event on home button
	$("#home").click(function() {
		confirmLogout();
	});
	
	// Open PouchDB remote database
	db = new PouchDB("https://dlnarratives.eu/db/test", {skipSetup:true, ajax: {timeout: 60000,}});
	
	
	// Check if user is already logged in
	db.getSession(function (err, response) {
		if (err) {
			console.log(currentTime() + "Cannot login to remote database: ", err);
		} else if (!response.userCtx.name || response.userCtx.name === "guest") {
			db.logout();
			console.log(currentTime() + "User needs to login");
			
			$("#auth-div").show();
		} else {
			console.log(currentTime() + "Logged in to remote database as \"" + response.userCtx.name + "\"");
						
			$("#userMenu").text(response.userCtx.name.toUpperCase()).show();
			
			$("#home, #userMenu, .top-btn").show();
			
			db.info()
			.then(function (result) {
				console.log(currentTime() + "Remote database is accessible");
				$.getJSON("https://dlnarratives.eu/db/_all_dbs", function(data) {
					var DBsToLoad = [];
					
					for (var i = 0; i < data.length; i += 1) {
  						if (data[i].startsWith(response.userCtx.name + "-q")) {
							DBsToLoad.push(data[i].split("-")[1].toUpperCase());
  						}
  					}
					sparqlRequest(DBsToLoad);
				});
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
	
	// Set click event on logout button
	/*
	$("#userMenu").click(function() {
		showUserMenu();
	});
	*/
	
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
		window.open('tool.html?' + suggestion.id, "_self");
	});
});

function confirmLogout() {
	showModal(
		"Logout",
		"Do you really want to logout?",
		"Don't Logout",
		"Logout",
		function() {
		},
		function() {
			db.logout().then(function () {
  			  	console.log(currentTime() + "Successfully logged out");
				window.open("/tool/index.html","_self");
				$("#userMenu").hide();
			});
		}
	);
}

// Create modal dialogs
function showModal(title, text, btnCancel, btnOK, callbackCancel, callbackOK) {
	var $modal = $("<div class='modal fade'>" +
	  "<div class='modal-content'>" +
	  "<div class='modal-header'>" +
	"<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>" +
	  "<h5 class='modal-title'>" + title +"</h5>" +
	  "</div>" +
	  "<div class='modal-body'>" +
	  "<p class='modal-text'>" + text + "</p>" +
	  "</div>" +
	  "<div class='modal-footer'>" +
      "<button type='button' class='btn btn-secondary' data-dismiss='modal'>" + btnCancel + "</button>" +
	"<button type='button' class='btn btn-primary' data-dismiss='modal'>" + btnOK + "</button>" +
	"</div></div></div></div>");
	$modal.find(".btn-secondary").click(callbackCancel);
	$modal.find(".btn-primary").click(callbackOK);
	$modal.modal("show");
}

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
			   console.log(currentTime() + "Username or password is incorrect");
			   $("#auth-div").addClass("has-error");
			   $("#auth-div .help-inline").text("Username or password is incorrect.");
		   }
		   else {
			   console.log(currentTime() + "Cannot login to remote database: ", err);
		   }
      }
	  else {
			// Check if user has access to this specific database
			db.info().then(function (result) {
				console.log(currentTime() + "Logged in successfully as \"" + user + "\"");
				console.log(user);
				$("#userMenu").text(user.toUpperCase());
				$("#home, #userMenu").show();
				
				$.getJSON("https://dlnarratives.eu/db/_all_dbs", function(data) {
					var DBsToLoad = [];
					
					for (var i = 0; i < data.length; i += 1) {
  						if (data[i].startsWith(user + "-q")) {
							DBsToLoad.push(data[i].split("-")[1].toUpperCase());
  						}
  					}
					sparqlRequest(DBsToLoad);
				});
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

// Make query for entity
function makeQuery(qids) {
	var types = "VALUES ?type {\n wd:Q15222213 wd:Q17334923 wd:Q43229 wd:Q8436 wd:Q488383 " +
	"wd:Q7184903 wd:Q386724 wd:Q234460 wd:Q5 wd:Q186081 wd:Q1190554 " +
	"wd:Q15474042 wd:Q41176 wd:Q8205328 wd:Q5127848\n}";
	
    var query = "PREFIX wd: <http://www.wikidata.org/entity/>\n" +
        "SELECT DISTINCT ?uri ?type ?itName ?enName ?itDesc ?enDesc ?image " +
        "?birth ?death ?foundation ?foundation2 ?completion ?occupation ?position" +
        "\nWHERE {\n" +
        "VALUES ?uri {wd:" + qids.join(" wd:") + "}\n" +
		types +
        "?uri wdt:P31 ?class.\n" +
        "?class wdt:P279* ?type.\n" +
        "OPTIONAL { ?uri rdfs:label ?enName filter (lang(?enName) = 'en'). }\n" +
	"OPTIONAL { ?uri schema:description ?enDesc filter (lang(?enDesc) = 'en'). }\n" +  "\n\}";
    return query;
}

// Perform SPARQL request for each entity
function sparqlRequest(qids) {
    console.log(currentTime() + "Wikidata request");

    // If requesting main subject entity, make special query
    var query = makeQuery(qids);

    var sparqlURL = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(query);

    //console.log("\n" + query + "\n");        
    //console.log(sparqlURL);

    $.getJSON(sparqlURL, function (data) {
		        
        data = data["results"]["bindings"];
		
		var added = [];
        
        for (var i=0; i < data.length; i++) {
            var item = sparqlToItem(data[i]);

			if (added.indexOf(item._id) < 0) {
					$("#userDBs").append("<a href='tool.html?" + item._id + "' class='data userDB'>" + titlecase(item.enName) + "</a>");
					$("#narratives-menu").append("<li class='narra-list-item'><a href='tool.html?" + item._id + "' class='data' target = '_blank'>" + titlecase(item.enName) + "</a></li>");
					added.push(item._id);
			}
        };
		
		if (data.length > 0) {
			$("#userDBs").show();
		}
		
		$("#emptyDiv, #auth-div").hide();
		$("#introDiv").show();
    });
}

// Convert result of SPARQL query to JavaScript object
function sparqlToItem(item, force) {
    var qid = item["uri"]["value"].split("entity/")[1];

    var newItem = {};

    newItem._id = qid;
    newItem._rev = undefined;
    newItem.itName = "";
    newItem.enName = "";
    newItem.itDesc = "";
    newItem.enDesc = "";
    newItem.image = "";
    newItem.type = [];
    newItem.role = [];

    // Extract basic data from each entity
    if ("itName" in item) newItem["itName"] = item["itName"]["value"];
    if ("enName" in item) newItem["enName"] = item["enName"]["value"];
    if ("itDesc" in item) newItem["itDesc"] = item["itDesc"]["value"];
    if ("enDesc" in item) newItem["enDesc"] = item["enDesc"]["value"];
    if ("image" in item) newItem["image"] = item["image"]["value"];
    if ("birth" in item) newItem["birth"] = item["birth"]["value"].replace("+", "").split("T")[0].split("-01-01")[0];
    if ("death" in item) newItem["death"] = item["death"]["value"].replace("+", "").split("T")[0].split("-01-01")[0];
    if ("foundation" in item) newItem["foundation"] = item["foundation"]["value"].replace("+", "").split("T")[0].split("-01-01")[0];
	if ("foundation2" in item) newItem["foundation2"] = item["foundation2"]["value"].replace("+", "").split("T")[0].split("-01-01")[0];
    if ("completion" in item) newItem["completion"] = item["completion"]["value"].replace("+", "").split("T")[0].split("-01-01")[0];

	// Extract type of the entity
	if ("type" in item) {
		newItem["type"].push(item["type"]["value"].split("entity/")[1]);
	}

    return newItem;
}

// Capitalize all words in a string
function titlecase(str) {
	return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
