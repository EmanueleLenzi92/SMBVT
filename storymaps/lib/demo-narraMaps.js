

function initTest(dbName) {
    
	
	$.ajax({
		type: "GET",
		//url: "conn.php", 
		url: "../PHP/session.php", 
		dataType: "JSON",					
		data: {},
		success: function(resp) {
			console.log(resp.username)
			
				if(resp.username != ""){
			
				
					console.log(currentTime() + "Username is: " + resp.username + "\"");
					
					$("#userMenu").text(resp.username.toUpperCase());
					$("#home, #userMenu").show();
					
					var userString = resp.username + "-";
											
					$.get("https://dlnarratives.eu/cgi-bin/createdb.py?db=" + userString + narra.dbName,
						function(data) {
							//console.log(data);
							initDB(userString + dbName);
						}
					)
					.fail(function(error) {
						//console.log(error);
						initDB(userString + dbName);
					});
					
				} else {
					
					window.location="../tool/";
					
				}
				
		},
		error: function(response){
				var a= JSON.stringify(response)
				//alert(a)
				console.log(a)
			}
		
	})	
}


function initDB(dbName) {
    console.log(currentTime() + "Database name is: " + dbName);
	
	$.ajax({
		type: "POST",
		//url: "conn.php", 
		url: "../PHP/narra-jsGetNarration.php", 
		dataType: "JSON",					
		data: {dbN: dbName},
		success: function(resp) {
			
			if(resp.username != ""){

			
			narra.remote = JSON.parse(resp.jsondata);
			narra.db = narra.remote;
			
			console.log(currentTime() + "Logged in to remote database as: " + resp.username);
			console.log(currentTime() + "Narration as: " + dbName);
            
            $(".spinner").hide();
            
            $("#home, #userMenu").show();
			
			
			narra.user =resp.username
			
			$("#userMenu").text(narra.user.toUpperCase()).show();
            console.log(currentTime() + "Remote database is accessible")
             
			
			syncDB();
			
			
			var DBsToLoad = [];
                    
               for(var i = 0; i < resp.allDBName.length; i ++) {
                      if (resp.allDBName[i][0].startsWith(resp.username + "-q")) {
                          DBsToLoad.push(resp.allDBName[i][0].split("-")[1].trim().toUpperCase());
							
                       }
						  console.log(resp.allDBName[i][0])
                } 
                    
				dbNameRequest(DBsToLoad);
				console.log(DBsToLoad)

			

			
			
			} else {
					
					window.location="../tool/";
					
			}
			
			
		
		},
		error: function(response){
				var a= JSON.stringify(response)
				//alert(a)
				console.log(a)

		}
		
	})
	
	
	
/* 	
    // Open PouchDB remote database
    narra.remote = new PouchDB("https://dlnarratives.eu/db/" + dbName, {skipSetup:true, ajax: {timeout: 60000,}});

    // Open PouchDB local database
    narra.db = narra.remote;
    
    // Check if user is already logged in
    narra.remote.getSession(function (err, response) {
        if (err) {
            console.log(currentTime() + "Cannot login to remote database: ", err);
        } else if (!response.userCtx.name) {
            narra.remote.logout();
            console.log(currentTime() + "User needs to login");
    
            $("#auth-div").show();
        } else {
            console.log(currentTime() + "Logged in to remote database as: " + response.userCtx.name);
            
            $(".spinner").hide();
            
            $("#home, #userMenu").show();
            
            narra.remote.info()
            .then(function (result) {
                narra.user = response.userCtx.name;
                $("#userMenu").text(narra.user.toUpperCase()).show();
                console.log(currentTime() + "Remote database is accessible")
                syncDB();
                
                // Load list of databases for the user
                $.getJSON("https://dlnarratives.eu/db/_all_dbs", function(data) {
                    var DBsToLoad = [];
                    
                    for (var i = 0; i < data.length; i += 1) {
                          if (data[i].startsWith(response.userCtx.name + "-q")) {
                            DBsToLoad.push(data[i].split("-")[1].toUpperCase());
                          }
                      }
                    try {
                        dbNameRequest(DBsToLoad);
                    } catch(err) {
                        console.log(err.message);
                    }
                });
            })
            .catch(function (err) {
                //console.log.bind(console);
            });
        }
    }); */
}

// Function for autocomplete
var substringMatcher = function(strs, lang) {
  return function findMatches(q, cb) {
      
    var matches = [];
    var substrRegex = new RegExp(q, 'i');

    $.each(strs, function(i, str) {
      if (substrRegex.test(str[lang])) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};

// Keep local and remote databases synchronized (currently off)
function syncDB() {
    startQueries();
    /*
    console.log(currentTime() + "Replicating remote database");
    narra.db.replicate.from(narra.remote)
    .on('error', console.log.bind(console))
    .on('complete', function() {
        console.log(currentTime() + "Successfully replicated remote database");
        startQueries();
        narra.sync = narra.db.sync(narra.remote, {live: true, retry: true})
        .on('error', console.log.bind(console))
    });*/
}



// Load list of narratives and show it in user menu
function showUserMenu() {
    narra.remote.getUser(narra.user, function (err, response) {
      if (err) {
        if (err.name === 'not_found') {
            console.log(currentTime() + "User database not found");
        } else {
            console.log(currentTime() + "Error with user database: " + err.name);
        }
      } else { console.log(response);
          $("#narratives-menu .narra-list-item").remove();
          for (var narraID in response.narratives) {
              var narrative = response.narratives[narraID];
                $("#narratives-menu").append("<li class='narra-list-item'><a href='tool.html?" + narrative.qid + "' class='data' style='background-color: " + getColor(narrative.type) + "' target = '_blank'>" + narrative.name + "</a></li>");
          };
      }
    });
}

// Delete a narrative
function deleteNarrative(dbid) {
    narra.remote.getUser(narra.user).then(function (user) {
        delete(user.narratives[dbid]);
        narra.remote.putUser(narra.user, {metadata: {test: {t:1}, narratives: user.narratives}}).then(function (response) {
            console.log(response);
            showUserMenu();
        })
        .catch(function (err) {
            console.log(currentTime() + "Error updating user database: " + err.name);
        })
    }).catch(function (err) {
        if (err.name === 'not_found') {
            console.log(currentTime() + "User database not found");
        } else {
            console.log(currentTime() + "Error with user database: " + err.name);
        }
    })
}

// Return current time
function currentTime() {
    var d = new Date();
    return d.toISOString().split("T")[1].replace("Z", "") + " -- ";
}

// Return item type from array of Wikidata classes
function typeFromArray(array) {
        
    if (array.indexOf("other") > -1) {
        return "other";
    }
    if (array.indexOf("Q15474042") > -1) {
        return "hidden";
    }
    if (array.indexOf("Q4167836") > -1) {
        return "hidden";
    }
    if (array.indexOf("Q5") > -1 || array.indexOf("Q8436") > -1) {
        return "person";
    }
    if (array.indexOf("Q234460") > -1) {
        return "work";
    }
    if (array.indexOf("Q41176") > -1) {
        return "object";
    }
    if (array.indexOf("Q17334923") > -1) {
        return "place";
    }
    if (array.indexOf("Q8205328") > -1) {
        return "object";
    }
    if (array.indexOf("Q43229") > -1) {
        return "organization";
    }
    if (array.indexOf("Q386724") > -1) {
        return "work";
    }
    if (array.indexOf("Q1190554") > -1) {
        return "hidden";
    }
    if (array.indexOf("Q186081") > -1) {
        return "hidden";
    }
    if (array.indexOf("Q7184903") > -1 || array.indexOf("Q4026292") > -1 || array.indexOf("Q5127848")) {
        return "concept";
    }
    if (array.indexOf("Q488383") > -1) {
        return "object";
    }
    if (array.indexOf("Q15222213") > -1) {
        return "object";
    }
    return "hidden";
}

// Sort elements based on their data-class attribute
function sortByClassFaster(a, b) {
    if (a.getAttribute("data-id") === narra.subjectID) {
        return -1;
    }
    if (b.getAttribute("data-id") === narra.subjectID) {
        return 1;
    }
    var classes = ["person", "organization", "object", "concept", "place", "work"];
    var compare = classes.indexOf(a.getAttribute("data-class")).toString().localeCompare(classes.indexOf(b.getAttribute("data-class")).toString());

    if (compare === 0) {
        return a.textContent.localeCompare(b.textContent);
    } else {
        return compare;
    }
}

// Sort elements based on their data-class attribute
function sortByClass(a, b) {
    if ($(a).attr("data-id") === narra.subjectID) {
        return -1;
    }
    if ($(b).attr("data-id") === narra.subjectID) {
        return 1;
    }
    var classes = ["person", "organization", "object", "concept", "place", "work"];
    var compare = classes.indexOf($(a).attr("data-class")).toString().localeCompare(classes.indexOf($(b).attr("data-class")).toString());

    if (compare === 0) {
        return $(a).text().localeCompare($(b).text());
    } else {
        return compare;
    }
}

// After login to DB, start queries
function startQueries() {
    $("#auth-div").hide();
    console.log(currentTime() + 'Loading data from database');
    
    // Show main interface
    $("#container").show();
    

	
		$.ajax({
		type: "POST",
		//url: "conn.php", 
		url: "../PHP/startQueries.php", 
		dataType: "JSON",					
		data: {dbusername: narra.user +'-'+narra.dbName},
		success: function(resp) {
			
	
			// Load events from database
 			for(var i=0; i< resp.events.length; i++){
				narra.events[JSON.parse(resp.events[i])._id] = JSON.parse(resp.events[i])
				//console.log(JSON.parse(resp.events[i]))
			} 
			console.log(currentTime() + "load events from DB: " + narra.events);
			
			// Load entitys from database
 			for(var i=0; i< resp.entitys.length; i++){
				narra.items[JSON.parse(resp.entitys[i])._id] = JSON.parse(resp.entitys[i])
				//console.log(JSON.parse(resp.entitys[i]))
			} 
			
			console.log(currentTime() + "load entity from DB: " + narra.items);
			
			if (narra.subjectID in narra.items && resp.entitys.length > 0) {
				makeEntities(narra.items);
				$(".spinner-loader").remove();
				finalLoad();
			}
			else {
				sparqlRequest([narra.subjectID], narra.counter + 1);
			}
			
			
			// Load narrative info from database
			if(resp.info != ""){
				
				narra.info = JSON.parse(resp.info)
				console.log(currentTime() + 'Load Narrative info (A1) From DB: ' + narra.info);
				
			} else {
				
				console.log(currentTime() + 'Narrative info not found in database; will create and save in DB');
				narra.info = {
					_id: "A1",
					id: Math.round(Math.random() * 1000000000),
					name: "",
					author: narra.user
				};
				saveObjectToDB({"A1": narra.info}, "A1");
			
			}
			
			// Load relations
			if(resp.relations != ""){
			
				narra.rels = JSON.parse(resp.relations).rels
			}
			
			
			createHTMLSelect()
		
			
		},
		error: function(response){
				var a= JSON.stringify(response)
				//alert(a)
				console.log(a)

			}
		})
		

	
	
	
	
	
	
	
	
	
	
	
	
/* 	
	
    // Load events from database
    narra.db.allDocs({
        include_docs: true,
        startkey: "ev",
        endkey: "z"
    }).then(function (result) {
          result.rows.forEach(function (event, ignore) {
              narra.events[event.id] = event.doc;
          });
        console.log(currentTime() + "Loaded " + result.rows.length + " events from database");
    });
    
    // Load entities from database
    narra.db.allDocs({
        include_docs: true,
        startkey: "Q",
        endkey: "Z"
    }).then(function (result) {
          result.rows.forEach(function (entity, ignore) {
            //deleteObjectFromDB(entity.id);
              narra.items[entity.id] = entity.doc;
          });
        console.log(currentTime() + "Loaded " + result.rows.length + " entities from database");
        if (narra.subjectID in narra.items && result.rows.length > 0) {
            makeEntities(narra.items);
            $(".spinner-loader").remove();
            finalLoad();
        }
        else {
            sparqlRequest([narra.subjectID], narra.counter + 1);
        }
    });
    
    // Load narrative info from database
    narra.db.get("A1").then(function (doc) {
        console.log(currentTime() + "Loaded narrative info from database");
        narra.info = doc;
    }).catch(function (err) {
        console.log(currentTime() + 'Narrative info not found in database');
        narra.info = {
            _id: "A1",
            id: Math.round(Math.random() * 1000000000),
            name: "",
            author: narra.user
        };
        saveObjectToDB({"A1": narra.info}, "A1");    
    })
    
    // Load relations from database
    narra.db.get("D1")
    .catch(function (err) {})
    .then(function (doc) {
        if (doc !== undefined) {
            narra.rels = doc.rels;
        }
        console.log(currentTime() + "Loaded relations from database");
    }).catch(function (err) {
        console.log(currentTime() + 'Relations not found');
    }); */
    
    
    
    // Hide authorization window
    $("#auth-div").hide();
}

// Perform final load: reset workspace and load default events
function finalLoad() {
    $(".spinner").hide();
    $("#auth-div").hide();
    resetWorkspace();
    console.log(currentTime() + "Reset workspace");
    addNewEntityPopoverTo($("#plusButton"));

    // If there are no events, load default ones
    if (narra.events === undefined || Object.keys(narra.events).length === 0) {
        defaultEvents();
        console.log(currentTime() + "Created default events");
    } else { // Else, display events
        displayAllEvents();
        /*
        Object.keys(narra.events).forEach(function (key, ignore) {
            displayEvent(narra.events[key], key);
        });
        */
        $("#timeline .timelineEvent").each(function (index, event) {
            $(event).delay(200 * index).fadeIn(200);
        });
        console.log(currentTime() + "Displayed events");
    }

    // Update title of narrative
    updateTitle();
}

// Download data (used for export)
function download(text, filename) {
    var pom = document.createElement("a");
    pom.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    pom.setAttribute("download", filename);
    if (document.createEvent) {
        var event = document.createEvent("MouseEvents");
        event.initEvent("click", true, true);
        pom.dispatchEvent(event);
    } else {
        pom.click();
    }
}

// Truncate entity names
function truncate(string, len) {
    if (string.length > len) {
        return string.substring(0, len).trim() + "...";
    } else {
        return string;
    }
}

// Capitalize first word in a string
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Capitalize all words in a string
function titlecase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1);}); //txt.substr(1).toLowerCase()
}

// Get sources based on author name
function getSources(authorName) {
    var resultArray = [];
    var sources = narra.sourceMap[narra.authorMap[authorName]];
    if (sources) {
        $.each(sources, function (ignore, source) {
            resultArray.push(source.title);
        });
    }
    return resultArray;
}

// Get list of roles based on event type
function getRolesFromEventType(roles) {
    for (var i = 0; i < narra.eventTypes.length; i += 1) {
        if (narra.eventTypes[i][narra.currentLang] === $("#typeInput").val()) {
            itemsByLang($(narra.eventTypes[i].roles)).forEach(function(item, index) {
                if (roles.indexOf(item) === undefined) {
                    roles.push(item);
                }
            });
            break;
        }
    }
    return roles;
}

// Create element to select roles for people
function makeRoleSelect(entityID) {
    var qids = getRoles(entityID);
    var currentRoles = [];
    var i = 0;
    
    currentRoles = getRolesFromEventType(currentRoles);
    
    for (i = 0; i < narra.eventTypes.length; i += 1) {
        if (narra.eventTypes[i][narra.currentLang] === $("#typeInput").val()) {
            currentRoles = itemsByLang($(narra.eventTypes[i].roles)).sort();
            break;
        }
    }
    var participant = {"en": "participant", "it": "partecipante"};
    var other = {"en": "other", "it": "altro"};
    var roles = [];
    //roles.push(participant[narra.currentLang]);
    var $roleSelect = $("<select class='roleSelect' data-id='" + entityID + "'>").append(
            $("<option selected>").text(participant[narra.currentLang]))
        .change(
        function (item) {
            if ($(this).val() === "other") {
                $(this).hide();
                $(this).parent().find(".roleInput").removeClass("hidden");
            }
            else {
                $(this).show();
                $(this).parent().find(".roleInput").addClass("hidden");
            }
        }
    );
    if (qids !== undefined) {
        qids.forEach(function (qid, ignore) {
            var role = narra.roles[qid];
            if (role !== undefined) {
                if (narra.currentLang == 'en' && role.enName !== undefined) {
                    var roleName = truncate(role.enName, 32);
                    if (roles.indexOf(roleName) < 0) {
                        roles.push(roleName);
                    }
                }
                else if (narra.currentLang == 'it' && role.enName !== undefined) {
                    var roleName = truncate(role.itName, 32);
                    if (roles.indexOf(roleName) < 0) {
                        roles.push(roleName);
                    }
                }
            }
        });
    }
    currentRoles.forEach(function (role, ignore) {
        roles.push(role);
    });
    Object.keys(roles.sort()).forEach(function (item, ignore) {
        $roleSelect.append(
            $("<option>").text(roles[item])
        );
    });
    $roleSelect.append(
        $("<option>").text(other[narra.currentLang])
    );
    if ($roleSelect.find("option").length === 0) {
        $roleSelect = $("<input>").addClass("roleSelect");
    }
    return $roleSelect;
}

// Load BibTex file from disk
function loadBibFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    narra.bib = BibtexParser(contents);
    narra.bib._id = "B1";
    var bibList = {"B1": narra.bib};
    saveObjectToDB(bibList, "B1");
    $('.popover').each(function() {
        sourceComplete($(this))
    });
  };
  reader.readAsText(file);
}

// Toggle source details for compact visualization
function toggleSource(element) {
    $(element).parents(".sourceDiv").find(".upperMargin").toggle();
    if ($(element).find('.btn-arrow').text() === "▶") {
        $(element).find('.btn-arrow').text("▼");
    } else {
        $(element).find('.btn-arrow').text("▶");
    }
}

// Hide source details for compact visualization
function hideSource(element) {
    $(element).parents(".sourceDiv").find(".upperMargin").hide();
    $(element).find('.btn-arrow').text("▶");
}

function deleteSource(element) {
    showModal(
        "Delete Source",
        "Are you sure you want to delete this source?",
        "Keep Source",
        "Delete Source",
        function() {},
        function() {
            if ($(element).parents(".sourcesDiv").children().length > 1) {
                $(element).parents(".sourceDiv").remove();
            } else {
                $(element).parents(".sourceDiv").find("input").val("");
                $(element).parents(".sourceDiv").find("textarea").val("");
            }
            $(element).parents(".sourcesDiv").find(".popoverHeading").each(
                        function (index) {
                            $(this).find(".sourceNum").text(" #" + (index + 1));
                        }
                    );
        }
    );
}

// Bibliography autocomplete
var bibMatcher = function(strs) {
  return function findMatches(q, cb) {
      
    var matches = [];
    var substrRegex = new RegExp(q, 'i');

    $.each(strs, function(i, str) {
      if (substrRegex.test(str.Fields.author)) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};

// Update autocomplete for bibliography
function sourceComplete($sourceBibDiv) {
    $sourceBibDiv.find(".bibInput").typeahead("destroy");
    $sourceBibDiv.find(".bibInput").typeahead(
        {
            minLength: 0,
            hint: false
        },
        {
            source: bibMatcher(narra.bib.entries),
            display: function(obj) {return obj.EntryKey},
            limit: 1000,
        }
    ).bind("typeahead:select", function (ignore, suggestion) {
        $(this).parents(".sourceDiv").find(".titleInput").val(suggestion.Fields.title);
        $(this).parents(".sourceDiv").find(".authorInput").val(suggestion.Fields.author);
    });
}

// Create popover div for source
function makeSourceDiv(heading, author, title, ref, text) {
    var $sourceHead = $("<div class='popoverContent'>").append(
        "<div class='popoverDiv headingDiv'>" +
            "<div class='btn-group popoverCell' role='group'>" +
                "<h5 class='popoverLabel popoverHeading arrowHeading' onclick='toggleSource(this)'><span class='btn-arrow'>▼</span> " + heading + "<span class='sourceNum'> #1</span></h5>" +
            "</div>" +
            "<div class='popoverCell popoverCell-button'>" +
                "<div class='nav minusButton popoverButton' onclick=deleteSource(this)>×</div>" +
                "<div class='nav plusButton popoverButton'>+</div>" +
            "</div>" +
        "</div>"
    );
    /*
    var $sourceBibDiv = $("<div class='popoverContent upperMargin sourceBibDiv'>").append(
        "<div class='popoverDiv'>" +
            "<div class='popoverCell'>" +
                "<label class='popoverLabel'>• BibTex ID</label>" +
            "</div>" +
            "<div class='popoverCell popoverCell-70'>" +
                "<input class='bibInput'></input>" +
            "</div>" +
        "</div>"
    );
    */
    var $sourceAuthorDiv = $("<div class='popoverContent upperMargin sourceAuthorDiv'>").append(
        "<div class='popoverDiv'>" +
            "<div class='popoverCell'>" +
                "<label class='popoverLabel'>" + author + "</label>" +
            "</div>" +
            "<div class='popoverCell popoverCell-70'>" +
                "<input class='authorInput'></input>" +
            "</div>" +
        "</div>"
    );
    
    var $sourceTitleDiv = $("<div class='popoverContent upperMargin'>").append(
        "<div class='popoverDiv'>" +
            "<div class='popoverCell'>" +
                "<label class='popoverLabel'>" + title + "</label>" +
            "</div>" +
            "<div class='popoverCell popoverCell-70'>" +
                "<input class='titleInput'></input>" +
            "</div>" +
        "</div>"
    );
    
    var $sourceRefDiv = $("<div class='popoverContent upperMargin'>").append(
        "<div class='popoverDiv'>" +
            "<div class='popoverCell'>" +
                "<label class='popoverLabel'>" + ref + "</label>" +
            "</div>" +
            "<div class='popoverCell popoverCell-70'>" +
                "<input class='refInput'></input>" +
            "</div>" +
        "</div>"
    );

    var $sourceTextAreaDiv = $("<div class='popoverContent upperMargin'>").append(
        "<div class='popoverDiv'>" +
            "<div class='popoverCell popoverCell-30'>" +
                "<label class='popoverLabel'>" + text + "</label>" +
            "</div>" +
            "<div class='popoverCell popoverCell-70'>" +
                "<textarea class='fragmentArea'></textarea>" +
            "</div>" +
        "</div>"
    );
    
    $sourceHead.find(".plusButton").click(
        function () {
            $(this).hide();
            $(this).parents(".sourcesDiv").find(".arrowHeading").each(
                function () {
                    hideSource($(this));
                }
            );
            $(this).parents(".sourcesDiv").append(
                makeSourceDiv(heading, author, title, ref, text)
            );
            $(this).parents(".sourcesDiv").find(".popoverHeading").each(
                function (index) {
                    $(this).find(".sourceNum").text(" #" + (index + 1));
                }
            );
        }
    );

    //sourceComplete($sourceBibDiv);
    
    return $("<div class='popoverContent sourceDiv'>").append('<hr>', $sourceHead, $sourceAuthorDiv, $sourceTitleDiv, $sourceRefDiv, $sourceTextAreaDiv);    
}

// Create popover for entities
function makePopoverContent(self, withForm, evid) {
    var qid = self.attr("data-id");
    
    if (qid === undefined) {
        return "";
    };
        
    var role = "Role in the event: ";
    var frag = "• Reference: ";
    var textArea = "• Text: ";
    var src = "• Title: ";
    var auth = "• Author: ";
    var book = "• Book: ";
    var chapter = "Chapter: ";
    var primary = "Primary source";
    var secondary = "Secondary source";
    var notes = "Notes: ";
    var deleteLabel = "Delete Entity";
    var addImageLabel = "Add Image";
    var changeImageLabel = "Change Image";

    if (narra.currentLang === "it") {
        role = "Ruolo nell\"evento: ";
        frag = "• Riferimento: ";
        textArea = "• Testo: ";
        src = "• Titolo: ";
        auth = "• Autore: ";
        book = "• Libro: ";
        chapter = "Capitolo: ";
        primary = "Fonte primaria";
        secondary = "Fonte secondaria";
        notes = "Note: ";
        deleteLabel = "Cancella entità";
        addImageLabel = "Aggiungi entità";
        changeImageLabel = "Cambia entità";
    }
    
    var $mainDiv = $("<div class= 'popoverContent ui-front'>")
    .attr("data-id", qid)
    .attr("onclick", "event.cancelBubble = true; if (event.stopPropagation) event.stopPropagation()");
    
    var $deleteDiv = $("<div class='popoverContent popoverCenter lowerMargin'>").append(
        "<div class='popoverDiv'><a class='pointer' onclick='event.stopPropagation(); deleteEntity(\"" + qid + "\")'>" + deleteLabel + "</a></div>"
    );

    var image = getImage(qid);
    
    var $addImageDiv = $("<div class='popoverContent popoverCenter lowerMargin'>").append(
        "<div class='popoverDiv imageLabelDiv'><a class='pointer' onclick='event.stopPropagation(); $(this).toggle(); $(this).parent().next().toggle(); $(this).parent().next().css(\"display\", \"inline-block\"); imageRequest(\"" + qid + "\", $(this))'>" +
        (image !== "" ? changeImageLabel : addImageLabel)
         + "</a></div>",
        "<div class='popoverDiv imageContentDiv' style='display: none'>Loading...</div>"
    );
    
/*     var $imageDiv = $("<div class='popoverContent popoverCenter lowerMargin'>").append(
        "<div class='popoverDiv'>" +
            (image !== "" ? "<img class='popoverImage' src='" + image.replace("http:", "https:").replace('Special:FilePath', 'Special:Redirect/file').replace('/wiki/', '/w/index.php?title=') + "&width=300&type=.jpg" + "' />" + "</div><hr>" : "<img class='popoverImage' style='display:none'></div><hr class='popoverImageSeparator' style='display:none'>")
    ); */
	
    var $imageDiv = $("<div class='popoverContent popoverCenter lowerMargin'>").append(
        "<div class='popoverDiv'>" +
            (image !== "" ? "<img class='popoverImage' src='" + image.replace("http:", "https:").replace('Special:FilePath', 'Special:Redirect/file').replace('/wiki/', '/w/index.php?title=') + "" + "' />" + "</div><hr>" : "<img class='popoverImage' style='display:none'></div><hr class='popoverImageSeparator' style='display:none'>")
    );
    
    if (!withForm && qid[0] !== "Q") {
        return $mainDiv.append($imageDiv, $addImageDiv, $deleteDiv);
    }
    
    var $secondaryContainer = $("<div class='popoverContent sourcesDiv secondaryContainer'>").append(makeSourceDiv(secondary, auth, src, frag, textArea));
    
    var $primaryContainer = $("<div class='popoverContent sourcesDiv primaryContainer'>").append(makeSourceDiv(primary, auth, src, frag, textArea));

    var $notesDiv = $("<div class='popoverContent notesDiv'>").append(
        "<div class='popoverDiv'>" +
            "<div class='popoverCell popoverCell-30'>" +
                "<label class='popoverLabel'>" + notes + "</label>" +
            "</div>" +
            "<div class='popoverCell popoverCell-70'>" +
                "<textarea class='notesArea'></textarea>" +
            "</div>" +
        "</div>"
    );

    var $wikiDiv = $("<div class='popoverContent popoverCenter lowerMargin'>").append(
        "<div class='popoverDiv'>" +
            "<a class='popoverLink' target='_blank' href='https://" + narra.currentLang + ".wikipedia.org/wiki/" + getLabel(qid).replace(" ", "_").replace(" ", "_").replace(" ", "_") + "'>" +
                "Wikipedia" +
            "</a>" +
            " • " +
            "<a class='popoverLink' target='_blank' href='https://wikidata.org/wiki/" + qid + "'>" +
                "Wikidata" +
            "</a>" +
        "</div>"
    );

    if (withForm && self.attr("data-class") === "person") {
        $mainDiv.append(
            "<div class='popoverContent'>" +
                    "<div class='popoverDiv'>" +
                    "<div class='popoverCell'>" +
                    "<label class='popoverLabel'>" + role + "</label>" +
                    "</div>" +
                    "<div class='popoverCell popoverCell-70'>" +
                    "<input type='text' class='roleInput hidden' autocomplete='off'>" +
                    "</div>" +
                    "</div>" +
                    "</div>"
        );
        $mainDiv.find(".roleInput").before(
            makeRoleSelect(qid)
        );
    }

    if (withForm && narra.events[evid] !== undefined && narra.events[evid].props !== undefined && narra.events[evid].props[qid] !== undefined) {
        var prop = narra.events[evid].props[qid];
        if (prop.role !== undefined) {
            $mainDiv.find(".roleSelect").val(prop.role);
        }
        if (prop.notes !== undefined) {
            $notesDiv.find(".notesArea").val(prop.notes);
        }
        if (prop.secondary !== undefined) {
            prop.secondary.forEach(function (source, i) {
                if (i > 0) {
                    $secondaryContainer.find(".sourceDiv:last").after(
                        makeSourceDiv(secondary, auth, src, frag, textArea)
                    );
                    $secondaryContainer.find(".popoverHeading").each(
                        function (index) {
                            $(this).find(".sourceNum").text(" #" + (index + 1));
                        }
                    );
                }
                $secondaryContainer.find(".sourceDiv:last").find(".bibInput").val(source.bibID);
                $secondaryContainer.find(".sourceDiv:last").find(".authorInput").val(source.author);
                $secondaryContainer.find(".sourceDiv:last").find(".titleInput").val(source.title);
                $secondaryContainer.find(".sourceDiv:last").find(".refInput").val(source.reference);
                $secondaryContainer.find(".sourceDiv:last").find(".fragmentArea").val(source.text);
            });
        }
        if (prop.primary !== undefined) {
            prop.primary.forEach(function (source, i) {
                if (i > 0) {
                    $primaryContainer.find(".sourceDiv:last").after(
                        makeSourceDiv(primary, auth, src, frag, textArea)
                    );
                    $primaryContainer.find(".popoverHeading").each(
                        function (index) {
                            $(this).find(".sourceNum").text(" #" + (index + 1));
                        }
                    );
                }
                $primaryContainer.find(".sourceDiv:last").find(".bibInput").val(source.bibID);
                $primaryContainer.find(".sourceDiv:last").find(".authorInput").val(source.author);
                $primaryContainer.find(".sourceDiv:last").find(".titleInput").val(source.title);
                $primaryContainer.find(".sourceDiv:last").find(".refInput").val(source.reference);
                $primaryContainer.find(".sourceDiv:last").find(".fragmentArea").val(source.text);
            });
        }
    }

    if (withForm) {
        $mainDiv.append($secondaryContainer,
            $primaryContainer, '<hr>', $notesDiv);
    }
    if (qid !== undefined) {
        if ($mainDiv.children().length > 0) {
            $mainDiv.append("<hr>");
        }
        if (!withForm && narra.images[qid] !== undefined) {
            $mainDiv.append(
                "<div class='popoverContent'>" +
                        "<div class='popoverDiv'>" +
                        "<div class='popoverCell popoverCenter'>" +
                        "<img src=" + narra.images[qid] + ">" +
                        "</div>" +
                        "</div>" +
                        "</div>"
            );
        }
        if (!withForm) {
            $mainDiv.append($imageDiv);
            $mainDiv.append($addImageDiv, '<hr>');
        }
        $mainDiv.append($wikiDiv);
        if (!withForm) {
            $mainDiv.append('<hr>', $deleteDiv);
        }
    }
    return $mainDiv.attr("data-id", qid);
}

// Load roles for person
function getRoles(qid) {
    var results = [];
    if (narra.items[qid] !== undefined && narra.items[qid].role !== undefined) {
        results = narra.items[qid].role;
    }
    return results;
}

// Get description for entity
function getDescription(qid) {
    if (qid in narra.items) {
        var desc = narra.items[qid][narra.currentLang + "Desc"];
        return (desc ? desc : typeFromArray(narra.items[qid].type));
    }
    return "";
}

// Set description for entity
function setDescription(qid, desc) {
    if (qid in narra.items) {
        narra.items[qid][narra.currentLang + "Desc"] = desc;
        saveObjectToDB(narra.items, qid);
        return true;
    }
    return false;
}

// Create popover title for entities
function makePopoverTitle(qid) {
    var size = "160%";
    if (getLabel(qid).length > 20) {
        size = "140%";
    }
    var title = "<span style='font-size: " + size + "'>" + getLabel(qid) + "</span>";
    var description = "<div class='popoverDesc' placeholder='insert description' contenteditable='true' onkeypress='if (event.which === 13) { event.preventDefault(); $(this).blur(); }' onchange='setDescription(\"" + qid + "\", $(this).text())'>" + getDescription(qid) + "</div>";
    return title + description;
}

// Add popover to element
function addPopoverTo($element, withForm, evid) {
    $element.popover({
        html: true,
        placement: "bottom",
        container: "body",
        trigger: "manual",
        title: function () {
            return makePopoverTitle($element.attr("data-id"));
        },
        content: makePopoverContent($element, withForm, evid),
        delay: {show: 70, hide: 70}
    });
    $element.on("show.bs.popover", function(){
        $(this).data("bs.popover").tip().css("width", "28%");
    });
    return $element;
}

// Add popover to new entity element
function addNewEntityPopoverTo($element) {
    
    var addNewLabel = "Add New Entity";
    
    if (narra.currentLang === "it") {
        addNewLabel = "Aggiungi Nuova Entità";
    }
    
    $element.popover({
        html: true,
        placement: "right",
        container: "body",
        trigger: "focus",
        title: "<span style='font-size: 160%'>" + addNewLabel + "</span>",
        content: makeNewEntityPopoverContent(),
        delay: {show: 70, hide: 70}
    });
    $element.on("show.bs.popover", function(){
        $(this).data("bs.popover").tip().css("width", "24%");
    });
    $element.on("shown.bs.popover", function(){
        $('#newItemURI').typeahead({
          hint: false,
          highlight: false,
          minLength: 3,
        }, {
          name: 'obj',
          limit: 10,
          display: function(obj) {return obj.label + (obj.description !== undefined ? ' (' + obj.description + ')' : '');},
          source: narra.suggestions
        });
        $('#newItemURI').unbind('typeahead:select');
        $('#newItemURI').val("").bind('typeahead:select', function(ev, suggestion) {
            $(this).parents('.popover').hide();
            addEntityFromIdOrURI(suggestion.id);
        });
    });
    return $element;
}

// Create content for new entity popover
function makeNewEntityPopoverContent() {
    var $mainDiv = $("<div>");

    var $mainDiv2 = $("<div>").addClass("popoverContent").attr("onclick", "event.cancelBubble = true; if (event.stopPropagation) event.stopPropagation()");

    var $selectDiv = $("<div>").addClass("popoverContent").append(
        $("<div>")
            .addClass("popoverDiv")
            .append(
                $("<div>")
                    .addClass("popoverCell")
                    .append(
                        $("<label>")
                            .text("Class:")
                            .addClass("popoverLabel")
                    ),
                $("<div>")
                    .addClass("popoverCell")
                    .css("text-align", "right")
                    .css("width", "60%")
                    .append(
                        $("<select value='' required>")
                            .attr("id", "newEntityType")
                            .attr("class", "typeSelect")
                            .append(
                                $("<option disabled selected hidden>Select Class</option>"),
                                $("<option>").text("person"),
                                $("<option>").text("organization"),
                                $("<option>").text("object"),
                                $("<option>").text("concept"),
                                $("<option>").text("place"),
                                $("<option>").text("work"),
                                $("<option>").text("other")
                            )
                    )
            )
    );

    var hr = "<hr>";

    var $newEntityName = $("<div>").addClass("popoverContent").append(
        $("<div>")
            .addClass("popoverDiv")
            .append(
                $("<div>")
                    .addClass("popoverCell")
                    .append(
                        $("<label>")
                            .text("Name:")
                            .addClass("popoverLabel")
                            .css("margin-top", "1%")
                            .css("margin-bottom", "1%")
                    ),
                $("<div>")
                    .addClass("popoverCell")
                    .css("text-align", "right")
                    .css("width", "60%")
                    .append(
                        $("<input>")
                            .attr("id", "newEntityName")
                    )
            )
    );

    var $newEntityDesc = $("<div>").addClass("popoverContent").css("margin-top", "2%").append(
        $("<div>")
            .addClass("popoverDiv")
            .append(
                $("<div>")
                    .addClass("popoverCell")
                    .append(
                        $("<label>")
                            .text("Description:")
                            .addClass("popoverLabel")
                            .css("margin-top", "1%")
                            .css("margin-bottom", "1%")
                    ),
                $("<div>")
                    .addClass("popoverCell")
                    .css("text-align", "right")
                    .css("width", "60%")
                    .append(
                        $("<input>")
                            .attr("id", "newEntityDesc")
                    )
            )
    );

    var $newItemURI = $("<div autocomplete=false spellchecker=false>").addClass("popoverContent").css("margin-top", "2%").append(
        $("<div>")
            .addClass("popoverDiv")
            .append(
                $("<div>")
                    .addClass("popoverCell")
                    .append(
                        $("<label>")
                            .text("Search Wikidata:")
                            .addClass("popoverLabel")
                            .css("margin-top", "1%")
                            .css("margin-bottom", "1%")
                    ),
                $("<div>")
                    .addClass("popoverCell")
                    .css("text-align", "right")
                    .css("width", "60%")
                    .append(
                        $("<input>")
                            .attr("id", "newItemURI")
                        /*
                            .focus(function () {
                                var popover = $(this).parents(".popover");
                                var originalHeight = popover.height();
                                $(this).parents(".popoverContent").next("#secondChoice").slideUp("fast", function() {
                                    console.log($(this));
                                    var popover = $(this).parents(".popover");
                                    var newHeight = popover.height();
                                    var top = parseFloat(popover.css('top'));
                                    var changeInHeight = newHeight - originalHeight;
                                    popover.css({ top: top - (changeInHeight / 2) });
                                });
                            })
                        */
                    )
            )
    );
    
    var $addButtonDiv = $("<div>").append(
        $("<div id='addButton' class='nav' onclick='addEntityFromIdOrURI(); $(\".popover\").hide()'>Add</div>")
    );
    var $secondDiv = $("<div id='secondChoice'>").append(
        hr,
        "<div class='popoverContent' style='text-align: center'><i>or add your own:</i></div>",
        hr,
        $selectDiv,
        hr,
        $newEntityName,
        $newEntityDesc
    );
    return $mainDiv.append($mainDiv2.append($newItemURI, $secondDiv, hr, $addButtonDiv));
}

// Function to add new entities from Wikidata ID or Wikidata/Wikipedia URI
function addEntityFromIdOrURI(value) {
    if (!value) {
        addEntity();
    } else {
        if (value.indexOf("wikipedia.org") > -1) {
            var title = value.split("/wiki/")[1];
            var lang = value.split("https://")[1].split(".wikipedia.org")[0];
            newEntityRequest(title, lang);
        } else if (value.startsWith("Q")) {
            if ($("#controls .data[data-id=" + value + "]").length == 0) {
            sparqlRequest([value], narra.counter + 1, function (item) {
                addEntity(item, true);
            }, true);
        } else {
            $('.inner-shadow').removeClass("inner-shadow");
            $("#controls .data[data-id=" + value + "]").addClass("inner-shadow");
            $("#controls .data[data-id=" + value + "]").get(0).scrollIntoView();
        }
    } else if (value.indexOf("wikidata.org") > -1) {
            value = value.split("/wiki/").slice(-1)[0];
            sparqlRequest([value], narra.counter + 1, function (item) {
                addEntity(item, true);
            }, true);
        }
    }
}

// Get Wikidata class ID from class/type name
function getClassID(type) {
    type = type.toLowerCase();
    
    if (type === "other") {
        return "other";
    }
    if (type === "event") {
        return "Q1190554";
    }
    if (type === "person") {
        return "Q5";
    }
    if (type === "organization") {
        return "Q43229";
    }
    if (type === "concept") {
        return "Q7184903";
    }
    if (type === "object") {
        return "Q15222213";
    }
    if (type === "place") {
        return "Q17334923";
    }
    if (type === "work") {
        return "Q386724";
    }
}

function getNextUid() {
    return "U" + new Date().getTime() + Math.floor(Math.random() * 10000000);
};

// Add new entity
function addEntity(item, force) {
    if (!item) {
        if ($("#newEntityName").val() !== "") {
            item = {
                "_id": getNextUid(),
                "_rev": undefined,
                "itName": $("#newEntityName").val(),
                "enName": $("#newEntityName").val(),
                "itDesc": $("#newEntityDesc").val(),
                "enDesc": $("#newEntityDesc").val(),
                "type": [getClassID($("#newEntityType").val())]
            };
            narra.items[item._id] = item;
            saveObjectToDB(narra.items, item._id);
        }
        else {
            return false;
        }
    }
    $("#newEntityType").val("person");
    $("#newEntityName").val("");
    $("#newEntityDesc").val("");
    $("#newItemURI").val("");
    
    var $element = addPopoverTo(makeStaticDraggable($(makeDataDiv(item._id, undefined))), false, undefined);

    $("#controls .data").each(function () {
        if ($(this).attr("data-id") === narra.subjectID) {
            return true;
        }
        if ($(this).text() > capitalize(item[narra.currentLang + "Name"])) {
            $element.insertBefore($(this)).fadeIn("fast");
            return false;
        }
    });
    
    $('.inner-shadow').removeClass("inner-shadow");
    $("#controls .data[data-id=" + item._id + "]").addClass("inner-shadow");
    var itemToScrollTo = $("#controls .data[data-id=" + item._id + "]").get(0);
    if (itemToScrollTo !== undefined) {
        console.log(currentTime() + 'Added ' + item._id + ' to list');
        itemToScrollTo.scrollIntoView();
    } else {
        console.log(currentTime() + 'Cannot load entity ' + item._id);
    }
}

function dataDivClick(div) {
    if (div.parent().prop("className").indexOf("eventBottom") === -1) {
        event.stopPropagation();
        $(".popover:not([attr=" + div.attr("data-id") + "])").hide();
        if (!div.data("bs.popover")) {
            addPopoverTo(div);
        } else {
            var ppvr = $(".popover[id='" + div.attr("aria-describedby") + "']");
            ppvr.find('.imageContentDiv').hide();
            ppvr.find('.imageLabelDiv > a').show();
        }
        div.popover("show");
    }
}

// Create div representing an entity
function makeDataDiv(qid) {
    if (narra.items[qid] !== undefined) {
        var type = typeFromArray(narra.items[qid].type);
        return "<a class='data " + type + "' role='button' tabindex=-1 data-id='" + qid + "' data-class='" + type + "' style='background-color: " + getColor(type) + "'" +
                "onclick='dataDivClick($(this))'>" +
                truncate(capitalize(getLabel(qid)), Math.floor(($("#controls").width() / 10) * parseInt($("body").css("font-size").replace("px", "")) / 40)) + "</a>";
    } else {
        return false;
    }
}

// Confirm removal of entity from event
function confirmRemove(entity) {
    showModal(
        "Remove Entity",
        "Removing the entity from the event will delete all the data you inserted in it. Are you sure you want to remove the entity?",
        "Keep Entity",
        "Remove Entity",
        function() {
            $("#inputDiv").children('.data').css("opacity", 1);
        },
        function() {
            entity.parent().find(".data[data-id=" +
                entity.attr("data-id") + "]").remove();
            if ($("#inputDiv").children().length === 1 && $("#inputDiv").children().first().attr("id") === "inputHelp") {
                $("#inputDiv").css("vertical-align", "middle");
                $("#inputHelp").show();
            }
        }
    );
}

// Make element draggable (with clone)
function makeStaticDraggable($element, withPopover) {
    $element
        .draggable({
            helper: function (withPopover) {
                var $copy = $(this).clone();
                $copy.css("width", $(this).width());
				$copy.css("border-radius", 10);
                if (withPopover !== undefined) {
                    addPopoverTo($copy, true);
                }
                return $copy;
            },
            appendTo: "body",
            revert: false,
            scroll: false
        });
    return $element;
}

// Make element draggable (without clone)
function makeDraggable($element) {
    $element
        .draggable({
            helper: function () {
                $(".popover").hide();
                var $copy = $(this).clone();
                $copy.css("width", $(this).width());
				$copy.css("border-radius", 10);
                $(this).css("opacity", 0);
                addPopoverTo($copy, true);
                return $copy;
            },
            start: function (ignore, ui) {
                ui.helper.data('dropped', false);
            },
            stop: function (ignore, ui) {
                if (ui.helper.data('dropped') === false) {
                    confirmRemove($(this));
                }
                else {
                    $(this).parent().find(".data[data-id=" + $(this).attr("data-id") + "]").css("opacity", 1);
                }
            },
            appendTo: "body",
            revert: "valid",
            scroll: false
        });
    return $element;
}

function confirmReset() {
    if (!workspaceIsEmpty()) {
        showModal(
            "Load Event",
            "The event creation form is not empty. If you clear it you will lose all unsaved data.\nAre you sure you want to clear it?",
            "Clear Form",
            "Cancel",
            function() {
                resetWorkspace();
            },
            function() {
            }
        );
    }
    else {
        resetWorkspace();
    }
}

// Reset all elements in the workspace
function resetWorkspace() {
    $(".spinner").hide();
    $('#eventTitle').val("");
    
/*     if (narra.currentLang === "it") {
        $('#eventTitle').attr("placeholder", "Titolo Evento");
    }
    else $('#eventTitle').attr("placeholder", "Event Title"); */
    
    updateEventTypes();
    updateTitle();

    $("label").css("background-color", function () {
        return getColor($(this).attr("data-class"));
    });
    $(".nav").css("background-color", function () {
        return getColor($(this).attr("data-class"));
    });

    $("#workspace .form-group, #workspace .form-inline, #workspace .input-group, #entitiesDiv").removeClass("has-error");

    if (narra.currentLang === "en") {
        $("#inputDiv").empty().css("vertical-align", "middle").append("<div id='inputHelp'>Drop entities here!</div>");
    } else if (narra.currentLang === "it") {
        $("#inputDiv").empty().css("vertical-align", "middle").append("<div id='inputHelp'>Trascina le entità qui!</div>");
    }

    $("#typeInput").val("");
    $("#topicInput").val("");
    $(".dateInput").val("");
	$("#eventMedia").val("");

    /*
    $(".dateInput").keyup(function () {
        if (!dateIsValid($(this).val())) {
            $(this).css("color", "red");
        } else {
            $(this).css("color", "black");
        }
    });
    */

    $("#dateInputStart").click(function () {
        event.cancelBubble = true;
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        if (dateIsValid($("#dateInputStart").val())) {
            $("#dateInputStart").popover("show");
        }
    });

    $("#dateInputEnd").click(function () {
        event.cancelBubble = true;
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        if (dateIsValid($("#dateInputEnd").val())) {
            $("#dateInputEnd").popover("show");
        }
    });

    $("#periodCheckbox").prop("checked", false);
    $("#descArea").val("");
    $("#notesArea").val("");
    $("#digobjInput").val("");
    $("#digobjTable").empty();

    $("#inputDiv").droppable({
        drop: function (ignore, ui) {
            ui.helper.data("dropped", true);
            $(this).parents('.form-group, .form-inline, #entitiesDiv').removeClass("has-error");
            $(this).css("vertical-align", "top");
            $("#inputHelp").hide();
            if ($("#inputDiv .data[data-id=" + ui.draggable.attr("data-id") + "]").length === 0) {
                var $drag = ui.draggable.clone();
                makeDraggable($drag);
                $drag.popover("destroy");
                addPopoverTo($drag, true);
                $drag.mousedown(
                    function () {
                        $(".popover:not([attr=" + $(this).attr("data-id") + "])").hide();
                    }
                );
                $(this).append($drag.css("opacity", 1));
                updateDataText($drag, narra.currentLang);
                $drag.click();
                $drag.focus();
                showPopoverForDiv($drag);
            }
        },
        out: function () {
            $(this).text($(this).attr("data-default"));
        }
    });
	
	
	$('#workspace').attr('data-evid', '')
	$('.optionSel').show()
	

}

// Show popover for specific element
function showPopoverForDiv(element) {
    $(".popover:not([attr='" + element.attr("data-id") + "'])").hide();
    if (element.attr("aria-describedby") != undefined) {
        $(".popover[id='" + element.attr("aria-describedby") + "']").show();
    } else element.popover("show");
}

// Update text of an entity element
function updateDataText($element) {
    $element.text(function () {
        return truncate(capitalize(getLabel($element.attr("data-id"))), Math.floor(($element.width() * 0.39) * parseInt($("body").css("font-size").replace("px", "")) / 40));
    });
}

// Update language of labels of all entity elements
function updateDataLang() {
    $(".data").each(function () {
        $(this).text(truncate(capitalize(getLabel($(this).attr("data-id"))), Math.floor(($(this).width() * 0.39) * parseInt($("body").css("font-size").replace("px", "")) / 40)));
    });
    $("#inputDiv .data").each(function () {
        $(this).popover("destroy");
        addPopoverTo($(this), false);
    });
}

// Make title of narrative
function makeTitle() {
	
	var type = typeFromArray(narra.items[narra.subjectID].type);
   
   if (narra.currentLang === "it") {
        if (type === "person") {
            //return "Biografia di ";
			return "";
        } else {
            return "";
        }
    } else {
        if (type === "person") {
            //return "Biography of ";
			return "";
        } else {
            return "";
        }
    }
} 

// Update title of narrative
function updateTitle() {
    var title = $('meta[name=subjectName]').attr("content");
    $(document).prop("title", title);
    
	
	$.ajax({
			type: "GET",
			url: "../PHP/narrationTitle.php", 
			dataType: "JSON",					
			data: {dbusername: narra.user +'-'+narra.dbName},
			success: function(resp) {
				
				// at the beginning (if A1 -> 'name' is ""), title will be subject of narration
				if(resp.title == ""){
					$("#bigName").text(/* makeTitle() +  */ titlecase(narra.items[narra.subjectID].enName));
					
					narra.info.name = titlecase(narra.items[narra.subjectID].enName)
				
				// after a title modification, title will be this title				
				} else {
				
					$("#bigName").text(/* makeTitle() +  */ resp.title);
					
					narra.info.name = resp.title
				
				}
				
			},
			error: function(response){
				var a= JSON.stringify(response)
				//alert(a)
				console.log(a)

			}
		}) 
	
	
}

// modify subject title (of wikidata or precedently modified) of a narration with another
function insertTitle(){
	
	// get title from h2 if conteteditable=true
	//var title= $("#bigName").text()
	
	// get title from popup input
	var title= $("#newBigTitle").val()
	
		$.ajax({
			type: "POST",
			url: "../PHP/narrationTitle.php", 
			dataType: "JSON",					
			data: {dbusername: narra.user +'-'+narra.dbName, newtitle: title },
			success: function(resp) {
				
				updateTitle();
				
				
			},
			error: function(response){
				var a= JSON.stringify(response)
				//alert(a)
				console.log(a)

			}
		}) 
	
	
}

function confirmUpdateTitle(){
			
			var inputTitle="<input type='text' id='newBigTitle'>"
	
			showModal(
				"Update title",
				"Insert new title: </br></br>" + inputTitle,
				"Back",
				"Confirm",
				function() {
					return
				},
				function() {
					insertTitle();

				}
			);
}




// Update interface language
function setLang(fast) {
    updateTitle();

    if (narra.currentLang === "en") {
        //$("#lang").text("IT");
        //$("#eventTitle").attr("placeholder", "Event Title");
        $("#entitiesLabel").text("ENTITIES");
        $("#saveButton span").text("SAVE");
        $("#cancelButton span").text("CLEAR");
        $("#allButton span").text("ALL");
        $("#peopleButton span").text("PEOPLE");
        $("#organizationButton span").text("ORGS");
        $("#conceptButton span").text("CONCEPTS");
        $("#objectButton span").text("OBJECTS");
        $("#placeButton span").text("PLACES");
        $("#workButton span").text("WORKS");
        $("#searchButton span").text("SEARCH");
        $("#loadBibButton").text("LOAD BIB");
        $("#exportButton span").text("EXPORT");
        $("#plusButton span").text("NEW");
        $("#relButton span").text("RELATIONS");
        $("#datePickerStart").find("label").text("START DATE");
        $("#datePickerEnd").find("label").text("END DATE");
        $("#notesDiv").find("label").text("NOTES");
        $("#descDiv").find("label").text("DESCRIPTION");
        $("#digobjDiv").find("label").text("DIGITAL OBJECTS");
        $("#typeDiv").find("label").text("EVENT TYPE");
        $("#inputHelp").text("Drop entities here!");
    } else if (narra.currentLang === "it") {
        //$("#lang").text("EN");
        //$("#eventTitle").attr("placeholder", "Titolo Evento");
        $("#entitiesLabel").text("ENTITÀ");
        $("#saveButton span").text("SALVA");
        $("#cancelButton span").text("CANCELLA");
        $("#allButton span").text("TUTTE");
        $("#peopleButton span").text("PERSONE");
        $("#organizationButton span").text("ORGANIZZ.");
        $("#conceptButton span").text("CONCETTI");
        $("#objectButton span").text("OGGETTI");
        $("#placeButton span").text("LUOGHI");
        $("#workButton span").text("OPERE");
        $("#searchButton span").text("CERCA");
        $("#loadBibButton").text("CARICA BIB");
        $("#exportButton span").text("ESPORTA");
        $("#plusButton span").text("NUOVA");
        $("#relButton span").text("RELAZIONI");
        $("#datePickerStart").find("label").text("DATA INIZIO");
        $("#datePickerEnd").find("label").text("DATA FINE");
        $("#notesDiv").find("label").text("NOTE");
        $("#descDiv").find("label").text("DESCRIZIONE");
        $("#digobjDiv").find("label").text("OGGETTI DIGITALI");
        $("#typeDiv").find("label").text("TIPO EVENTO");
        $("#inputHelp").text("Trascina le entità qui!");
    }
    $("#inputHelp").show();
    $("#controls .data[data-class='event']").remove();
    $("#eventTitle", "#typeInput", "#topicInput", ".dateInput").focus(function () {
        $(this).parents('.form-group, .form-inline').removeClass("has-error");
    });

    if (!fast) {
        updateEventTypes();
        updateDataLang();
    }
}

// Get items by language (for event types)
function itemsByLang($items) {
    var results = [];
    $items.each(
        function () {
            results.push(this[narra.currentLang]);
        }
    );
    return results;
}

// Update list of event types
function updateEventTypes() {
    $("#typeInput").val("");
    $("#typeInput").typeahead("destroy");
    $("#typeInput").typeahead(
        {
            minLength: 0,
            hint: false
        },
        {
            name: 'types',
            limit: 20,
            source: substringMatcher(narra.eventTypes, narra.currentLang),
            display: function(obj) {return obj[narra.currentLang]},
        }
    )
    .bind("typeahead:select", function (ignore, suggestion) {
        $("#typeInput").blur();
        for (var i = 0; i < narra.eventTypes.length; i += 1) {
            if (narra.eventTypes[i][narra.currentLang] === suggestion[narra.currentLang]) {
                $(".roleSelect").each(function() {
                    $(this).replaceWith(makeRoleSelect($(this).attr("data-id")));
                });
                break;
            }
        }
    });
}

// Animate removal of entity
function animatePoof() {
    var bgTop = 0;
    var frame = 0;
    var frames = 6;
    var frameSize = 32;
    var frameRate = 80;
    var puff = $("#poof");
    var animate = function () {
        if (frame < frames) {
            puff.css({
                backgroundPosition: "0 " + bgTop + "px"
            });
            bgTop = bgTop - frameSize;
            frame += 1;
            setTimeout(animate, frameRate);
        }
    };
    animate();
    setTimeout("$('#poof').hide()", frames * frameRate);
}

// Delete a specific entity
function deleteEntity(qid) {
    var title = narra.items[qid][narra.currentLang + "Name"];
    showModal(
        "Delete Entity",
        "Are you sure you want to delete the entity \"" + title + "\"?",
        "Keep Entity",
        "Delete Entity",
        function() {
        },
        function() {
            // Delete entity from workspace
            $("[data-id=" + qid + "]").remove();
        
            // Delete entity from entity list
            delete narra.items[qid];
        
            // Delete entity from database
            deleteObjectFromDB(qid);

            // Hide popover after deletion
            $('.popover').hide();
        }
    );
}

// Delete object from database
function deleteObjectFromDB(objID) {
	
	
	$.ajax({
			type: "POST",
			url: "../PHP/deleteDb.php", 
			dataType: "JSON",					
			data: {objId: objID, dbname: narra.dbName, dbuser:narra.user},
			success: function(resp) {
				console.log(resp.msg)
				
			},
			error: function(response){
				var a= JSON.stringify(response)
				//alert(a)
				console.log(a)

			}
		}) 
	
	
/*     narra.db.get(objID).then(function(doc) {
        return narra.db.remove(doc);
    }).then(function (result) {
        console.log(currentTime() + "Deleted entity: " + objID);
    }).catch(function (err) {
        console.log(currentTime() + err);
    }); */
}

// Delete a specific event
function deleteEvent(evid) {
    var title = narra.events[evid].title;
    showModal(
        "Delete Event",
        "Are you sure you want to delete the event \"" + title + "\"?",
        "Delete Event",
        "Keep Event",
        function() {
            // Delete event from timeline
            $("#" + evid).remove();
        
            // Delete event from event list
            delete narra.events[evid];
    
            // Delete event from database
            deleteObjectFromDB(evid);
			
			// fix position of events after delete
			fixPositionAfterSwitch()
			
			// recreate html select without deleted event
			createHTMLSelect()
        },
        function() {
        }
    );
}

// Save object to database
function saveObjectToDB(objList, objID) {

	
	//var wokspaceEvId = $('#workspace').attr('data-evid');
	
	
 	$.ajax({
			type: "POST",
			url: "../PHP/insertDb.php", 
			dataType: "JSON",					
			data: {objclist: JSON.stringify(objList[objID]), objcid:objID, dbname: narra.dbName, dbuser:narra.user},
			success: function(resp) {
				console.log(resp.msg)
				
			},
			error: function(response){
				var a= JSON.stringify(response)
				//alert(a)
				console.log(a)

			}
			
		}) 
		
		
		
/* 	
    //console.log(currentTime() + "Saving " + objID + " to database");
    narra.db.get(objID)
    //.catch(function(err) {})
    .then(function(doc) {
        objList[objID]._rev = doc._rev;
        return narra.db.put(objList[objID]);
    })
    .then(function(response) {
          objList[objID]._rev = response.rev;
    })
    .catch(function (err) {
        if (err.reason === "missing" || err.reason === "deleted") {
            objList[objID]._rev = undefined;
            narra.db.put(objList[objID]);
        }
        else {
            //console.log(currentTime() + err);
        }
    }); */
}

// Save object to database
function forceSaveObjectToDB(objList, objID) {
    //console.log(currentTime() + "Saving " + objID + " to database");
	

 	$.ajax({
			type: "POST",
			url: "../PHP/insertDb.php", 
			dataType: "JSON",					
			data: {objclist: JSON.stringify(objList[objID]), objcid:objID, dbname: narra.dbName, dbuser:narra.user},
			success: function(resp) {
				console.log(resp.msg)
			},
			error: function(response){
				var a= JSON.stringify(response)
				//alert(a)
				console.log(a)

			}
			
		}) 
/* 	console.log("DA QUI")
	console.log(JSON.stringify(objList[objID]))
	console.log(objID)
	console.log(narra.dbName)
	console.log(narra.user) */
	
	
/*     narra.db.put(objList[objID])
    .catch(function (err) {
        if (err.reason === "missing" || err.reason === "deleted") {
            objList[objID]._rev = undefined;
            narra.db.put(objList[objID]);
        }
        else {
            //console.log(currentTime() + err);
        }
    }); */
}

// Save event from creation form to database
function saveEvent(data) {
    
    function makeDigObjArray() {
        var results = [];
        $("#digobjTable .digobjPreview").each(function() {
            results.push(decodeURIComponent($(this).attr("data-url")));
        })
        if (results.length > 0) return results;
        else return "";
    }
    
	
    var evid = $("#workspace").attr("data-evid");
	 if (!evid) evid = nextEvid();


    if (data == undefined) {
		
		// Controll input send by user
		var missingData = false;
        var props = {};
		
		if( $('#positionAfter').is(':checked') || $('#positionBefore').is(':checked')){
			if( $('#positionEvent option').filter(':selected').val() == "empty"  ){	
				$("#positionEvent").parents('.form-group, .form-inline').addClass("has-error");
				missingData = true;
			}
		}
		
        if (!$("#eventTitle").val()) {
            $("#eventTitle").parents('.form-group, .form-inline').addClass("has-error");
            missingData = true;
        };
        
/*         if (!$("#dateInputStart").val() || !dateIsValid($("#dateInputStart").val())) {
            $("#dateInputStart").parents('.form-group, .form-inline').addClass("has-error");
            missingData = true;
        }; */
        
        if (!$("#dateInputEnd").val()) {
            $("#dateInputEnd").val($("#dateInputStart").val());
        }
        else if (!dateIsValid($("#dateInputEnd").val())) {
            $("#dateInputEnd").parents('.form-group, .form-inline').addClass("has-error");
            missingData = true;
        }
        /* TODO Fix dates BC
        if (!missingData && dateFromString($("#dateInputStart").val()) > dateFromString($("#dateInputEnd").val())) {
            $(".dateInput").parents('.form-group, .form-inline').addClass("has-error");
            missingData = true;
        };
        */
/*         if (!$("#typeInput").val()) {
            $("#typeInput").parents('.form-group, .form-inline').addClass("has-error");
            missingData = true;
        }; */
        
        if ($("#inputDiv").find(".data").length === 0) {
            $("#inputDiv").parents('.form-control').addClass("has-error");
            $("#inputDiv").addClass("has-error-input-div");
            missingData = true;
        };
        if (missingData) return undefined;
			
			/////////////////
			// GET POSITION//
			/////////////////
		    
			// if we MODIFY a event
			if (narra.events[evid] != undefined) {
				
				// position of my event if i move it after another event: Get position of that event 
				if($('#positionAfter').is(':checked')){
					
					var position= switchPositionEvent( "after", $('#positionEvent option').filter(':selected').val() );
				
				// position of my event if i move it before another event: Get position of that event 
				}else if($('#positionBefore').is(':checked')) {
					
					var position= switchPositionEvent( "before", $('#positionEvent option').filter(':selected').val() );
				
				// position of my event if i don't move it: Get position of itselfs 
				} else {var position= narra.events[evid].position;}
			
			// if is a NEW event
			} else {
				
				// position of my event if i move it after another event: Get position of that event
				if($('#positionBefore').is(':checked')){
					
					var position= switchPositionEvent( "before", $('#positionEvent option').filter(':selected').val() );
				
				// position of my event if i move it before another event: Get position of that event 
				}else if($('#positionAfter').is(':checked')) {
				
					var position= switchPositionEvent( "after", $('#positionEvent option').filter(':selected').val() );
				
				// position of my event if i don't move it: Get a new position (length of timeline) 
				} else {var position= nextEventPosition();}
				
				
			
			}
		
		

        $("#inputDiv .data").each(function () {
            if ($(this).attr("aria-describedby") === undefined) {
                props[$(this).attr("data-id")] = narra.events[evid].props[$(this).attr("data-id")];
            }
            else {
                var $popover = $("#" + $(this).attr("aria-describedby"));
                var secondary = [];
                $popover.find(".secondaryContainer .sourceDiv").each(function () {
                    var bibID = $(this).find(".bibInput").val();
                    var author = $(this).find(".authorInput").val().trim();
                    var title = $(this).find(".titleInput").val().trim();
                    var reference = $(this).find(".refInput").val().trim();
                    var text = $(this).find(".fragmentArea").val().trim();
                    if (bibID !== "" || author !== "" || title !== "" || reference !== "" || text !== "")
                    secondary.push(
                    {
                        "bibID": bibID,
                        "author": author,
                        "title": title,
                        "reference": reference,
                        "text": text
                    }
                    );
                });
                var primary = [];
                $popover.find(".primaryContainer .sourceDiv").each(function () {
                    var bibID = $(this).find(".bibInput").val();
                    var author = $(this).find(".authorInput").val().trim();
                    var title = $(this).find(".titleInput").val().trim();
                    var reference = $(this).find(".refInput").val().trim();
                    var text = $(this).find(".fragmentArea").val().trim();
                    if (bibID !== "" || author !== "" || title !== "" || reference !== "" || text !== "")
                    primary.push(
                    {
                        "bibID": bibID,
                        "author": author,
                        "title": title,
                        "reference": reference,
                        "text": text
                    }
                    );
                });
                props[$(this).attr("data-id")] = {
                    "class": $(this).attr("data-class"),
                    "role": $popover.find(".roleSelect").val(),
                    "description": $popover.find(".descArea").val(),
                    "notes": $popover.find(".notesArea").val(),
                    "secondary": secondary,
                    "primary": primary
                }
            }
        });
		
        
        narra.events[evid] = {
            "_id": evid,
            "_rev": (narra.events[evid] === undefined ? undefined : narra.events[evid]._rev),
            "title": $("#eventTitle").val().trim(),
            "start": dateFromString($("#dateInputStart").val().trim(), false),
            "end": dateFromString($("#dateInputEnd").val().trim(), false),
            "period": $("#periodCheckbox").prop("checked"),
            "type": $("#typeInput").val().trim(),
            //"topic": $("#topicInput").val().trim(),
            "description": $("#descArea").val().trim(),
            "notes": $("#notesArea").val().trim(),
            "objurl": makeDigObjArray(),
            "props": props,
			"latitud" : $("#latitud").val().trim(),
			"longitud" : $("#longitud").val().trim(),
			"eventMedia" : $("#eventMedia").val().trim(),
			"position" : position,
        };
    }
    else {
        narra.events[evid] = data;
        narra.events[evid]._id = evid;
    };
	
    // Save event to PouchDB database
    saveObjectToDB(narra.events, evid);

    $(".popover").remove();

    $("#workspace").attr("data-evid", nextEvid());
	
	// fix order of events potition
	fixPositionAfterSwitch()
	
	// create select for position with new title 
	createHTMLSelect()
    
	return evid;
}

function displayAllEvents() {
    var timeline = document.createElement("div");
    timeline.setAttribute("id", "timeline");
    
    timeline.addEventListener("click", function() {
        $('.popover').hide();
    });
    
    Object.keys(narra.events).forEach(function (evid, ignore) {
        if (narra.events[evid] !== undefined) {
            var data = narra.events[evid];
            
            var eventDiv = document.createElement("div");
            eventDiv.setAttribute("id", evid);
            eventDiv.setAttribute("class", "timelineEvent");
            eventDiv.setAttribute("data-start", data["start"]);
            eventDiv.setAttribute("data-end", data["end"]);
			eventDiv.setAttribute("position", data["position"]);
			
            
            var deleteX = document.createElement("b");
            deleteX.setAttribute("class", "x");
            deleteX.textContent = "×";
                    
            var deleteButton = document.createElement("div");
            deleteButton.setAttribute("class", "deleteButton");
            deleteButton.appendChild(deleteX);
            
            var titleHeading = document.createElement("h3");
            titleHeading.setAttribute("class", "titleHeading");
            titleHeading.textContent = data["title"];
            
            var dateHeading = document.createElement("h4");
            dateHeading.setAttribute("class", "dateHeading");
            dateHeading.textContent = dateInterval(data["start"], data["end"]);
            
            var eventBottom = document.createElement("div");
            eventBottom.setAttribute("class", "eventBottom");
                        
            var fragment = document.createElement("div");
            var elements = [];
            
            for (var prop in data.props) {
                var elementString = makeDataDiv(prop);
                fragment.innerHTML = elementString;
                var element = fragment.firstElementChild;
                if (element !== null) {
                    elements.push(element);
                }
                else {
                    console.log(currentTime() + "Entity not found: " + prop);
                }
            };
            
            elements.sort(sortByClassFaster);
            
            for (var i=0; i < elements.length; i++) {
                eventBottom.appendChild(elements[i]);
            }
            
            eventDiv.appendChild(deleteButton);
            eventDiv.appendChild(titleHeading);
            eventDiv.appendChild(dateHeading);
            eventDiv.appendChild(dateHeading);
            eventDiv.appendChild(eventBottom);
                        
            deleteButton.addEventListener("click", function() {
                event.stopPropagation();
                deleteEvent(evid);
            });
            eventDiv.addEventListener("click", function() {
                confirmEventLoad(evid);
            });
            eventDiv.addEventListener("mouseenter", function() {
                $(this).find('.deleteButton').fadeToggle("fast");
            });
            eventDiv.addEventListener("mouseleave", function() {
                $(this).find('.deleteButton').fadeToggle("fast");
            });
            
            timeline.appendChild(eventDiv);
        }
    });
    
    //timeline = sortEvents(timeline);
	timeline = sortEventsByPosition(timeline);
    
    document.body.replaceChild(timeline, document.getElementById("timeline"));
    
    return true;
}

// Display a specific event
function displayEvent(data, evid) {

		
		    // if we modify a event, get its position. Else increment position
			if (narra.events[evid] != undefined) {
	
				var position= narra.events[evid].position;
			
			} else {
				
				var position= nextEventPosition();
			
			}
	
		
    $("#" + evid).remove();
    if (evid === undefined) return false;

    // Create div representing the event
    var $eventDiv = $("<div class='timelineEvent'>")
    .attr("id", evid)
    .click(function (){confirmEventLoad($(this).attr("id"))})
    .append(
        $("<div class='deleteButton'>").append("<b class='x'>").text("×").click(function (e) {
            e.stopPropagation(); deleteEvent(evid); // TODO
        }),
        $("<h3 class='titleHeading'>"),
        $("<h4 class='dateHeading'>"),
        $("<div class='eventBottom'>")
    );

    // If event was created by the user...
    if (data == undefined) {         $eventDiv.find(".eventBottom").append($("#inputDiv").children().sort(sortByClass));
        $eventDiv.find(".titleHeading").text($("#eventTitle").val());    
        $eventDiv.find(".dateHeading").text(dateInterval($("#dateInputStart").val(), $("#dateInputEnd").val()));
        $eventDiv.attr("data-start", dateFromString($("#dateInputStart").val(), false));
        $eventDiv.attr("data-end", dateFromString($("#dateInputEnd").val(), false));
		
		$eventDiv.attr("position", position);
		
		
    }
    // If event was a default one...
    else {
        $eventDiv.find(".titleHeading").html(data["title"]);
        var props = data.props;
        var elements = [];
        for (var prop in props) {
            var $element = $(makeDataDiv(prop, function (data, evid) {displayEvent(data, evid)}));
            if ($element != undefined && $eventDiv.find(".data[data-id=" + prop + "]").length === 0) {
                elements.push($element.popover("destroy")[0]);
            }
        };
        elements.sort(sortByClass);
        for (var i=0; i < elements.length; i++) $eventDiv.find(".eventBottom").append(elements[i]);
        if (data["start"] != data["end"]) $eventDiv.find("h4").text(data["start"] + " – " + data["end"]);
        else $eventDiv.find(".dateHeading").text(dateInterval(data["start"], data["end"]));
        $eventDiv.attr("data-start", data["start"]);
        $eventDiv.attr("data-end", data["end"]);
		$eventDiv.attr("position", data["position"]);
		
    };

    $("#ev" + evid).remove();
    $("#timeline").append($eventDiv);
    $eventDiv.find(".data").each(function () {
        updateDataText($(this), narra.currentLang);
    });
    $eventDiv.mouseenter(function () { $(this).find(".deleteButton").fadeToggle("fast") });
    $eventDiv.mouseleave(function () { $(this).find(".deleteButton").fadeToggle("fast") });

    //sortEvents();
	sortEventsByPosition()

    return true;
}

// Create string representing a date interval
function dateInterval(start, end) {
    start = dateFromString(start, true);
    end = dateFromString(end, true);
    if (start != end) return start + " – " + end;
    else return start;
}

// Fix buggy JavaScript parsing of dates
function fixYear(date, year) {
    date.setFullYear(year);
    return date;
}

// Parse string, array, or number to date object
function parseDate(d) {
    
    // Split string to array
    if (d.constructor === String) {
        d = d.split('-');
    }
    
    // Fix array for negative date and missing elements
    if (d.constructor === Array) {
        if (d[0] === "") {
            d = d.splice(1);
            d[0] = '-' + d[0];
        }
        if (d.length === 1) {
            d[1] = 1;
        }
        if (d.length === 2) {
            d[2] = 1;
        }
    }

    // Make date from array or number
    return (
        d.constructor === Date ? d :
        d.constructor === Array ? fixYear(new Date(d[0], d[1]-1, d[2]), d[0]) :
        d.constructor === Number ? fixYear(new Date(d, 0, 1), d) :
        typeof d === "object" ? new Date(d.year,d.month,d.date) :
        NaN
    );
}

// Compare two dates for sorting
function compareDates(a, b) {
    return (
        isFinite(a = parseDate(a).valueOf()) &&
        isFinite(b = parseDate(b).valueOf()) ?
        (a > b) - (a < b) :
        NaN
    );
}

// Sort events based on their ID
function sortEvents(timeline) {    
    var sort_by_time = function (a, b) {
        var compare = compareDates(a.getAttribute("data-start"), b.getAttribute("data-start"));
        if (compare === 0) return a.getAttribute("id").localeCompare(b.getAttribute("id"));
        else return compare;
    }
    
    if (timeline === undefined) {
        var timeline = document.getElementById("timeline");
    }
    var items = timeline.childNodes;
        
    var list = [];
    for (var i in items) {
        if (items[i].nodeType === 1) {
            list.push(items[i]);
        }
    }
    list.sort(sort_by_time);
        
    for (var i = 0; i < list.length; i++) {
        timeline.appendChild(list[i]);
    }
    return timeline;
}

// Sort events based on position
  function sortEventsByPosition(timeline) {    
    var sort_by_position = function (a, b) {
		a = a.getAttribute("position");
		b = b.getAttribute("position");
		return a.localeCompare(b);
    }
    
    if (timeline === undefined) {
        var timeline = document.getElementById("timeline");
    }
    var items = timeline.childNodes;
        
    var list = [];
    for (var i in items) {
        if (items[i].nodeType === 1) {
            list.push(items[i]);
        }
    }
    list.sort(sort_by_position);
        
    for (var i = 0; i < list.length; i++) {
        timeline.appendChild(list[i]);
    }
    return timeline;
} 
 

// Select next event ID
function nextEvid() {
    var max = 0;
    for (var key in narra.events) {
        var numPart = parseInt(key.split("ev")[1])
        if (numPart > max) max = numPart;
    };
    var next = new Date().getTime() + Math.floor(Math.random() * 10000000);
    return("ev" + next.toString());
}

// Convert date string to well-formed date
function dateFromString(string, yearLast) {
    string = string.toString();
    if (string !== undefined) {
        var date = "";
        var splits = [];
        if (splits.length < 2) splits = string.split("-");
        if (splits.length < 2) splits = string.split("/");
        if (splits.length < 2) splits = string.split(".");
        for (var i = 0; i < splits.length; i++) {
            if (splits[i] && splits[i].length < 2) splits[i] = "0" + splits[i];
        }
        if (!yearLast && splits.indexOf(Math.max.apply(this, splits).toString()) === 2) date = splits.reverse().join("-");
        else if (yearLast && splits.indexOf(Math.max.apply(this, splits).toString()) === 0) date = splits.reverse().join("-");
        else date = splits.join("-");
        return date;
    }
    return "";
}

// Check if date is valid
function dateIsValid(date) {
    date = dateFromString(date, false);
    if (isNaN(Date.parse(date))) return false;
    else return true;
}

// Load default events
function defaultEvents() {
    var subj = narra.items[narra.subjectID];
    
    if (subj === undefined) return false;
    
    // Birth
    if ("birth" in subj) {
        var props = {};
        props[narra.subjectID] = {"class": "person", "role": "child"};

        if ("father" in subj) props[subj.father] = {"class": "person", "role": "father"};
        if ("mother" in subj) props[subj.mother] = {"class": "person", "role": "mother"};
        if ("birthPlace" in subj) props[subj.birthPlace] = {"class": "place"};

        var data = {
            "title": "Birth of " + subj["enName"],
            "itTitle": "Nascita di " + subj["itName"],
            "start": subj.birth,
            "end": subj.birth,
            "type": "birth",
            "props": props,
			"position": nextEventPosition(),
        };
        var evid = saveEvent(data);
        if (evid) displayEvent(data, evid);
    }

    // Death
    if ("death" in subj) {
        var props = {};
        props[narra.subjectID] = {"class": "person", "role": "dead"};

        if ("deathPlace" in subj) props[subj.deathPlace] = {"class": "place"};

        var data = {
            "title": "Death of " + subj["enName"],
            "itTitle": "Morte di " + subj["itName"],
            "start": subj.death,
            "end": subj.death,
            "type": "death",
            "props": props,
			"position": nextEventPosition(),
        };
        var evid = saveEvent(data);
        if (evid) displayEvent(data, evid);
    }

    // Marriage
    if ("spouse" in subj && "marriageDate" in subj) {
        var date = subj.marriageDate.replace("+", "").split("T")[0].split("-01-01")[0];

        var props = {};
        props[narra.subjectID] = {"class": "person", "role": "spouse"};

        if ("spouse" in subj) props[subj.spouse] = {"class": "person", "role": "spouse"};
        if ("marriagePlace" in subj) props[subj.marriagePlace] = {"class": "place"};

        var data = {
            "title": "Marriage of " + subj["enName"],
            "itTitle": "Matrimonio di " + subj["itName"],
            "start": date,
            "end": date,
            "type": "marriage",
            "props": props,
			"position": nextEventPosition(),
        };
        var evid = saveEvent(data);
        if (evid) displayEvent(data, evid);
    }

    // Foundation
    if ("foundation" in subj) {
        console.log(currentTime() + "Creating foundation event");

        var date = subj.foundation.replace("+", "").split("T")[0].split("-01-01")[0];

        var props = {};
        props[narra.subjectID] = {"class": typeFromArray(narra.items[narra.subjectID].type)};

        var data = {
            "title": "Foundation of " + subj["enName"],
            "itTitle": "Fondazione di " + subj["itName"],
            "start": date,
            "end": date,
            "type": "foundation",
            "props": props,
			"position": nextEventPosition(),
        };
        var evid = saveEvent(data);
        if (evid) displayEvent(data, evid);
    }
    
    if ("foundation2" in subj) {
        console.log(currentTime() + "Creating foundation event");

        var date = subj.foundation2.replace("+", "").split("T")[0].split("-01-01")[0];

        var props = {};
        props[narra.subjectID] = {"class": typeFromArray(narra.items[narra.subjectID].type)};

        var data = {
            "title": "Foundation of " + subj["enName"],
            "itTitle": "Fondazione di " + subj["itName"],
            "start": date,
            "end": date,
            "type": "foundation",
            "props": props,
			"position": nextEventPosition(),
        };
        var evid = saveEvent(data);
        if (evid) displayEvent(data, evid);
    }

    // Completion
    if ("completion" in subj) {
        console.log(currentTime() + "Creating completion event");

        var date = subj.completion.replace("+", "").split("T")[0].split("-01-01")[0];

        var props = {};
        props[narra.subjectID] = {"class": typeFromArray(narra.items[narra.subjectID].type)};

        var data = {
            "title": "Completion of " + subj["enName"],
            "itTitle": "Completamento di " + subj["itName"],
            "start": date,
            "end": date,
            "type": "completion",
            "props": props,
			"position": nextEventPosition(),
        };
        var evid = saveEvent(data);
        if (evid) displayEvent(data, evid);
    }
}

function workspaceIsEmpty() {
    if ($("#eventTitle").val().trim() || $("#dateInputStart").val().trim() || $("#dateInputEnd").val().trim() || $("#typeInput").val().trim() || $("#inputDiv").find(".data").length > 0 || $("#descArea").val().trim() || $("#eventMedia").val().trim() || $("#notesArea").val().trim() || $("#digobjInput").val().trim()) return false;
    return true;
}

function confirmEventLoad(evid) {
    if (!workspaceIsEmpty()) {
        showModal(
            "Load Event",
            "If you load this event you will lose the data you inserted in the event form.\nAre you sure you want to load this event?",
            "Load Event",
            "Cancel",
            function() {
                resetWorkspace();
                loadEvent(evid);
            },
            function() {
            }
        );
    }
    else {
        resetWorkspace();
        loadEvent(evid);
    }
}

// Load event from timeline to event form
function loadEvent(evid) {
	
	//hide this title event from position <select>
	$('.optionSel').show()
	$('#optionSel' + evid).hide()
	
	
    $('#eventTitle').attr("placeholder", "");
    updateEventTypes();
    $("#workspace").attr("data-evid", evid);
    $("#inputDiv").empty();
    $("#inputDiv").css("vertical-align", "top");
    $("#eventTitle").val(narra.events[evid]["title"]);
    $(".dateInput").css("color", "#555");
    $("#dateInputStart").val(dateFromString(narra.events[evid]["start"], true));
    $("#dateInputEnd").val(dateFromString(narra.events[evid]["end"], true));
    if ("period" in narra.events[evid]) {
        $("#periodCheckbox").prop("checked", narra.events[evid]["period"]);
    };
    $("#typeInput").val(narra.events[evid]["type"]);
    $("#topicInput").val(narra.events[evid]["topic"]);
    $("#descArea").val(narra.events[evid]["description"]);
    $("#notesArea").val(narra.events[evid]["notes"]);
	
	
	$("#latitud").val(narra.events[evid]["latitud"]);
	$("#longitud").val(narra.events[evid]["longitud"]);  
	
	$("#eventMedia").val(narra.events[evid]["eventMedia"]);
	
    
    if ($.type(narra.events[evid]["objurl"]) === "array") {
        $(narra.events[evid]["objurl"]).each(function() {
            addDigitalObject(this, true);
        });
    }
    else  if ($.type(narra.events[evid]["objurl"]) === "string") {
        addDigitalObject(narra.events[evid]["objurl"], true);
    }
    
    var itemsToAdd = [];
    for (var prop in narra.events[evid].props) {
        if (prop in narra.items && $("#inputDiv .data[data-id=" + prop + "]").length === 0) {
            try {
                var $drag = $(makeDataDiv(prop));
                makeDraggable($drag);
                addPopoverTo($drag, true, evid);
                $drag.mousedown(
                    function () {
                        $(".popover:not([attr=" + $drag.attr("data-id") + "])").hide()
                    }
                );
                itemsToAdd.push($drag);
            }
            catch (e) {
                console.log(currentTime() + "TypeError: " + e + " " + narra.items[prop]);
            }
        }
    }
    itemsToAdd.sort(sortByClass);
    $(itemsToAdd).each(function ($i, $item){$("#inputDiv").append($item); updateDataText($item, narra.currentLang);});
}

// Get color of entity based on type
function getColor(type) {
    if (type != undefined) type = type.toLowerCase();
    if (type == "event") return "rgb(200, 255, 200)";
    if (type == "person") return "rgb(250, 219, 216)";
    if (type == "organization") return "rgb(215, 189, 226)";
    if (type == "concept") return "rgb(169, 204, 227)";
    if (type == "object") return "rgb(195, 155, 211)";
    if (type == "place") return "rgb(127, 179, 213)";
    if (type == "work") return "rgb(118, 215, 196)";
    if (type == "other") return "rgb(255, 255, 255)";
}

// Get image for entity
function getImage(qid) {
    if (qid in narra.items && "image" in narra.items[qid]) {
        return narra.items[qid]["image"];
    }
    return "";
}

// Get label for entity
function getLabel(qid) {
    if (qid in narra.items) {
        return narra.items[qid][narra.currentLang + "Name"] || narra.items[qid][narra.otherLang + "Name"];
    }
    return "";
}

// Initial Wikipedia API request
function wikipediaRequest(url, lang, linksArray, subjectName) {
    //$("#bigName").text("Loading data from Wikipedia...");

    var wikipediaURL = url != "" ? url : "https://" + lang + ".wikipedia.org/w/api.php?action=query&titles=" + encodeURIComponent(subjectName) +
    "&prop=redirects|pageprops&rawcontinue&generator=links&callback=?&redirects=&gpllimit=500&format=json";

    //console.log(currentTime() + wikipediaURL);
    console.log(currentTime() + "Wikipedia request");
	console.log("URL wikipedia:     " + wikipediaURL);

    if (url.indexOf("pageimages") < 0) $.getJSON(wikipediaURL, function (links) {
        if (narra.subjectID != "") {
            if (links.query !== undefined && links.query.pages !== undefined) {
                for (var property in links.query.pages) {
                    linksArray.push(links.query.pages[property]);
                }
            }
            else {
                console.log(currentTime() + wikipediaURL);
            }
        }
        if ("query-continue" in links && "links" in links["query-continue"]) {
            url =     "https://" + lang + ".wikipedia.org/w/api.php?action=query&titles=" + encodeURIComponent(subjectName) +    "&prop=redirects|pageprops&rawcontinue&generator=links&callback=?&redirects=&gpllimit=500&format=json&gplcontinue=" + links["query-continue"]["links"]["gplcontinue"];
            wikipediaRequest(url, lang, linksArray, subjectName);
        }
        //else if (lang == "it") wikipediaRequest(url, "en", linksArray);
        else {
            var qids = [];

            for (var i = 0; i < linksArray.length; i++) {
                if ("pageprops" in linksArray[i] && "wikibase_item" in linksArray[i]["pageprops"] && qids.indexOf(linksArray[i]["pageprops"]["wikibase_item"]) < 0) {
                    qids.push(linksArray[i]["pageprops"]["wikibase_item"]);
                }
            };

            var lastRun = narra.counter + Math.floor(qids.length / 200) + 1;

            for (var i = 0; i < qids.length; i += 200) {
                sparqlRequest(qids.slice(i, i + 200), lastRun);
            };
        }
    });
}

// More detailed query for subject of narrative
var subjectQuery = "OPTIONAL { ?uri p:P26 ?marriage. ?marriage ps:P26 ?spouse. OPTIONAL{?marriage pq:P580 ?marriageDate.} OPTIONAL{?marriage pq:P2842 ?marriagePlace.}}\n" +
    "OPTIONAL { ?uri wdt:P25 ?mother. }\n" +
    "OPTIONAL { ?uri wdt:P22 ?father. }\n" +
    "OPTIONAL { ?uri wdt:P26 ?child. }\n" +
    "OPTIONAL { ?uri wdt:P40 ?sister. }\n" +
    "OPTIONAL { ?uri wdt:P7 ?brother. }\n" +
    "OPTIONAL { ?uri wdt:P19 ?birthPlace. }\n" +
    "OPTIONAL { ?uri wdt:P20 ?deathPlace. }\n";

var subjectExtract = " ?spouse ?marriageDate ?mother ?father ?child ?sister ?brother ?birthPlace ?deathPlace";

// Add role to global array of roles
function addRole(role) {
    if (role !== undefined && role.indexOf("entity/") > -1) {
        role = role.split("entity/")[1];
    }
    if (!(role in narra.roles)) {
        narra.roles[role] = {};
    }
    return role;
}

// Convert result of SPARQL query to JavaScript object
function sparqlToItem(item, force) {
    var qid = item["uri"]["value"].split("entity/")[1];
    var newItemsToLoad = [];

    if (!(qid in narra.items)) {

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

        // Extract more data for subject of the narrative
        if (qid == narra.subjectID) { 
            if ("marriageDate" in item) newItem["marriageDate"] = item["marriageDate"]["value"].replace("+", "").split("T")[0].split("-01-01")[0];

            if ("father" in item) {
                newItem["father"] = item["father"]["value"].split("entity/")[1];
                newItemsToLoad.push(newItem["father"]);
            }
            if ("mother" in item) {
                newItem["mother"] = item["mother"]["value"].split("entity/")[1];
                newItemsToLoad.push(newItem["mother"]);
            }
            if ("brother" in item) {
                newItem["brother"] = item["brother"]["value"].split("entity/")[1];
                newItemsToLoad.push(newItem["brother"]);
            }
            if ("sister" in item) {
                newItem["sister"] = item["sister"]["value"].split("entity/")[1];
                newItemsToLoad.push(newItem["sister"]);
            }
            if ("spouse" in item) {
                newItem["spouse"] = item["spouse"]["value"].split("entity/")[1];
                newItemsToLoad.push(newItem["spouse"]);
            }
            if ("birthPlace" in item) {
                newItem["birthPlace"] = item["birthPlace"]["value"].split("entity/")[1];
                newItemsToLoad.push(newItem["birthPlace"]);
            }
            if ("deathPlace" in item) {
                newItem["deathPlace"] = item["deathPlace"]["value"].split("entity/")[1];
                newItemsToLoad.push(newItem["deathPlace"]);
            }
            if ("marriagePlace" in item) {
                newItem["marriagePlace"] = item["marriagePlace"]["value"].split("entity/")[1];
                newItemsToLoad.push(newItem["marriagePlace"]);
            }
        }

        // Extract roles of the entity
        if ("occupation" in item) {
            var newRole = item["occupation"]["value"].split("entity/")[1];
            if (newItem["role"].indexOf(newRole) < 0) {
                newItem["role"].push(addRole(newRole));
            }
        } 
        if ("position" in item) {
            var newRole = item["position"]["value"].split("entity/")[1];
            if (newItem["role"].indexOf(newRole) < 0) {
                newItem["role"].push(addRole(newRole));
            }
        }

        // Extract type of the entity
        if ("type" in item) { newItem["type"].push(item["type"]["value"].split("entity/")[1]);
    }    
        else if (force) {
            newItem["type"].push("other");
        }

        narra.items[qid] = newItem;
    }
    else {
        try {
            // Extract additional types and roles
            if ("type" in item && "type" in narra.items[qid]) narra.items[qid].type.push(item["type"]["value"].split("entity/")[1]);
            if ("occupation" in item && "role" in narra.items[qid]) narra.items[qid].role.push(addRole(item["occupation"]["value"].split("entity/")[1]));
            if ("position" in item && "role" in narra.items[qid]) narra.items[qid].role.push(addRole(item["position"]["value"].split("entity/")[1]));
        }
        catch(e) {
            console.log(currentTime() + "Error in sparqlToItem: " + narra.items[qid]);
        }
    }
    return newItemsToLoad;
}

// Make query for entity
function makeQuery(qids, isSubject, force) {
    var types = "VALUES ?type {\n wd:Q15222213 wd:Q17334923 wd:Q43229 wd:Q8436 wd:Q488383 " +
    "wd:Q7184903 wd:Q386724 wd:Q234460 wd:Q5 wd:Q186081 wd:Q1190554 wd:Q35120 " +
    "wd:Q15474042 wd:Q4167836 wd:Q41176 wd:Q8205328 wd:Q5127848\n}";
    
    var query = "PREFIX wd: <http://www.wikidata.org/entity/>\n" +
        "SELECT DISTINCT ?uri ?type ?itName ?enName ?itDesc ?enDesc ?image " +
        "?birth ?death ?foundation ?foundation2 ?completion ?occupation ?position" +
        (isSubject ? subjectExtract : "") +
        "\nWHERE {\n" +
        "VALUES ?uri {wd:" + qids.join(" wd:") + "}\n" +
        (force ? "" : types) +
        (force ? "OPTIONAL {?uri wdt:P31 ?class.\n}" : "?uri wdt:P31 ?class.\n") +
        (force ? "OPTIONAL {?class wdt:P279* ?type.\n " + types + "}" : "?class wdt:P279* ?type.\n") +
        "OPTIONAL { ?uri wdt:P18 ?image. }\n" +
        "OPTIONAL { ?uri wdt:P569 ?birth. }\n" +
        "OPTIONAL { ?uri wdt:P570 ?death. }\n" +
        "OPTIONAL { ?uri wdt:P571 ?foundation. }\n" +
        "OPTIONAL { ?uri wdt:P580 ?foundation2. }\n" +
        "OPTIONAL { ?uri wdt:P1619 ?completion. }\n" +
        "OPTIONAL { ?uri wdt:P106 ?occupation. }\n" +
        "OPTIONAL { ?uri wdt:P39 ?position. }\n" +
        (isSubject ? subjectQuery : "") +
        "OPTIONAL { ?uri rdfs:label ?itName filter (lang(?itName) = 'it'). }\n" +
        "OPTIONAL { ?uri rdfs:label ?enName filter (lang(?enName) = 'en'). }\n" +
        "OPTIONAL { ?uri schema:description ?itDesc filter (lang(?itDesc) = 'it'). }\n" +
    "OPTIONAL { ?uri schema:description ?enDesc filter (lang(?enDesc) = 'en'). }\n" +  "\n\}";
    return query;
}

// Perform SPARQL request for each entity
function sparqlRequest(qids, lastRun, callback, force) {
    console.log(currentTime() + "Wikidata request");
	

    // If requesting main subject entity, make special query
    var query = makeQuery(qids, qids[0] == narra.subjectID, force);
	
	// print query in the console (only if narrative doesn't exist yet)
	console.log("Query:       " + query);

    var sparqlURL = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(query);

	// print query result in the console (only if narrative doesn't exist yet)      
    console.log("URLL for query result:       " + sparqlURL);

    $.getJSON(sparqlURL, function (data) {
        narra.counter += 1;
        //console.log(narra.counter, lastRun);
        
        if (callback === undefined) {
            //$("#bigName").text("Loading data from Wikidata...");
        }
        data = data["results"]["bindings"];
        
        for (var i=0; i < data.length; i++) {
            var newItemsToLoad = sparqlToItem(data[i], force);
            if (newItemsToLoad.length > 0) sparqlRequest(newItemsToLoad, narra.counter + 1, function(){});
        };

        for (var i=0; i < qids.length; i++) {
            var qid = qids[i];
            
            if (qid in narra.items) {

                forceSaveObjectToDB(narra.items, qid);
                //saveObjectToDB(narra.items, qid);        
            }

            // If this is the last run...
            if (i == qids.length - 1 && narra.counter == lastRun) {
				
				console.log("Last run of sparql request")
				console.log(qids)
                updateTitle();
                if (callback !== undefined) {
                    callback(narra.items[qid]);
                }
                else {
                    var roleIDs = Object.keys(narra.roles);
                    /*
                    for (var i = 0; i < roleIDs.length; i += 200) {
                        rolesRequest(roleIDs.slice(i, i + 200), lastRun)
                        };
                    */
                    //console.log(qids);
                    if (qids.length > 1) {
                        $(".spinner-loader").remove();
                        $("#controls .data").remove();
                        makeEntities(narra.items);
                        finalLoad();
                    }
                }
            };
        };

        // If entity is subject of narrative, perform Wikipedia request
        if (qids[0] == narra.subjectID) {
			

				var subjectName = narra.items[narra.subjectID][narra.currentLang + "Name"];
			
			
			
           
            wikipediaRequest("", narra.currentLang, [], subjectName);
        }
    });
}

/*
function rolesRequest(qids) {
    var query = "SELECT DISTINCT ?uri ?enName ?itName" +
        "\nWHERE {\n" +
        "VALUES ?uri {wd:" + qids.join(" wd:") + "}\n" +
        "OPTIONAL { ?uri rdfs:label ?itName filter (lang(?itName) = 'it'). }\n" +
        "OPTIONAL { ?uri rdfs:label ?enName filter (lang(?enName) = 'en'). }\n" +
    "\n\}";
        
    var sparqlURL = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(query);

    //console.log("\n" + query + "\n");        
    //console.log(sparqlURL);

    $.getJSON(sparqlURL, function (data) {
        var transaction = narra.db.transaction(["roles"], "readwrite");
        var store = transaction.objectStore("roles");
        transaction.onerror = function (event) { console.log(event.target.error); };
        data.results.bindings.forEach(function (item, index) {
            var qid = item.uri.value.split("entity/")[1];
            narra.roles[qid].id = qid;
            if (item.enName !== undefined) {
                narra.roles[qid].enName = item.enName.value;
            };
            if (item.itName !== undefined) {
                narra.roles[qid].itName = item.itName.value;
            };
            narra.db.put(narra.roles[qid], function(err, resp) {
                  if (err) {
                      console.log(currentTime + err);
                  }
                narra.roles[qid]._rev = resp.rev;
            });
        });
        console.log(currentTime() + "Loaded roles");
    });
}
*/

// Request for new entities added by the user
function newEntityRequest(title, lang) {
    url = "https://wikidata.org/w/api.php?action=wbgetentities&props=labels|claims|sitelinks|descriptions&callback=?&titles=" +
        title + "&sites=" + lang + "wiki&languages=it|en&format=json";            
        console.log(currentTime() + url);
    $.getJSON(url, function (data) {
        console.log(currentTime() + "Loading new entity");
        data = data["entities"];
        for (var key in data) {
            data[key]["_id"] = key;
            data[key]["id"] = key;
            sparqlRequest([key], narra.counter + 1, undefined, true);
        };
    });
}

// Load role names
/*
function loadRoleNames() {
    url = "https://wikidata.org/w/api.php?action=wbgetentities&props=labels&callback=?&ids=" +
        narra.items[narra.subjectID]["roles"].toString().replace(/\,/g, "|") + "&languages=it|en&format=json";
    console.log(url);
    $.getJSON(url, function (data) {
        data = data["entities"];
        for (var key in data) if (parseInt(key.replace("Q", "")) > 0) narra.items[key] = data[key];
        var transaction = narra.db.transaction(["wikidata"], "readwrite");
        var store = transaction.objectStore("wikidata");
        for (var key in data) store.add(data[key]);
    });
}
*/

// Sort entities by label
function sortByLabel(keys) {
    keys.sort(function (a, b) {
        var nameA = capitalize(getLabel(a));
        var nameB = capitalize(getLabel(b));
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });
    return keys;
}

// Make a div for each entity
function makeEntities(items) {
    console.log(currentTime() + "Making entities");

    var keys = sortByLabel(Object.keys(items));
           
    keys.splice(keys.indexOf(narra.subjectID), 1);
    keys.unshift(narra.subjectID);
    
    var $container = $("<div id='data-container' />");
    
    for (var i = 0; i < keys.length; i++) {
        try {
            $container.append(makeStaticDraggable($(makeDataDiv(keys[i]))));
        }
        catch (TypeError) {
            console.log(currentTime() + "TypeError: " + keys[i]);
        }
    };
    $('#controls').append($container);
    console.log(currentTime() + "Made entities");    
}

// Save relations between events
function saveRelations() {
    narra.rels = {};
    $(".relContainer").each(function (k, v) {
        v = $(v);
        if (v.find(".timelineEvent").length > 0) {
            var evid = v.attr("data-for");
            var causedBy = [];
            var partOf = [];
            v.find(".causedBy").children(".timelineEvent").each(function (j, x) {
                causedBy.push($(x).attr("data-id"));
            });
            v.find(".partOf").children(".timelineEvent").each(function (j, x) {
               partOf.push($(x).attr("data-id"));
            });
            narra.rels[evid] = {"causedBy": causedBy, "partOf": partOf, "id": evid};
            
            saveRelationsToDB();
        };
    });
}

// Save relations to database
function saveRelationsToDB() {
    var relsDoc = {"_id": "D1", "rels": narra.rels}
    var relsList = {"D1": relsDoc};
	console.log(relsList)
    saveObjectToDB(relsList, "D1");
}

// Load relations between events
function loadRelations() {
    for (var key in narra.rels) {
        var event = narra.rels[key];
		
		console.log("ora")
		console.log(key)
        
        if (event !== undefined && 'causedBy' in event) {
            event.causedBy.forEach(function (item, index) {
                if (item !== undefined)
                    dropOnRelation($(".relContainer[data-for=" + key + "]").find(".causedBy"),
                    $("#bottomTimeline").find(".timelineEvent[data-id=" + item + "]"));
            });
        }

        if (event !== undefined && 'partOf' in event) {
            event.partOf.forEach(function (item, index) {
                if (item !== undefined)
                    dropOnRelation($(".relContainer[data-for=" + key + "]").find(".partOf"),
                    $("#bottomTimeline").find(".timelineEvent[data-id=" + item + "]"));
            });
        }
    };
}

function dropOnRelation(rel, drag, save) {
    $(rel).css("vertical-align", "top");
            if ($(rel).find(".timelineEvent#" + $(drag).attr("id")).length === 0) {
                var thisID = $(rel).parent().attr("data-for");
                
                var $drag = drag.clone();
                $drag.find(".deleteButton").click(function () {
                    if ($(rel).hasClass("causedBy")) {
                        narra.rels[thisID]["causedBy"].splice(drag.attr("data-id"), 1);
                    }
                    else if ($(rel).hasClass("partOf")) {
                        narra.rels[thisID]["partOf"].splice(drag.attr("data-id"), 1);
                    }
                    $(this).parent().remove();
                    saveRelationsToDB();
                });
                $drag.mouseenter(function () { $(this).find(".deleteButton").fadeToggle("fast") });
                $drag.mouseleave(function () { $(this).find(".deleteButton").fadeToggle("fast") });
                $(rel).append($drag);
    }
    if (save === true) {
        saveRelations();
        saveRelationsToDB();
    }
}

function notAllowed(title, reason) {
    if (!workspaceIsEmpty()) {
        showModal(
            title,
            "Please add at least one event before " + reason,
            "OK",
            "Cancel",
            function() {
            },
            function() {
            }
        );
    }
}

// Open relations view
function openRelations() {
    if (Object.keys(narra.events).length < 1) {
        notAllowed("Load Relations", " loading the relations view.");
        return false;
    }
    $("#home").text("BACK");
    $("#backButton").fadeToggle("slow");
    $("#container").slideToggle("slow");
    $("#bigName").text("Causal and Mereological Relations");
    $("#timeline").addClass("withArrows").css("height", "70%");
    $("#overlay").empty();
    $("#bottomTimeline").empty();
    $("#timeline .timelineEvent").each(function (k, v) {
        var oldID = $(this).attr('id');
         $("#bottomTimeline").append(makeStaticDraggable($(this).clone().attr("data-id", oldID).addClass("draggableEvent").removeAttr("id").show()));
         $(this).css("height", "40%");
        $("#overlay").append("<div class='relContainer' data-for='" + $(v).attr('id') + "'><div class='relation causedBy'><h3>Caused by</h3></div><div class='relation partOf'><h3>Part of</h3></div></div>");
    });
    $("#timeline").append($("#overlay"));
    $("#overlay").fadeToggle("slow");
    $("#bottomTimeline .timelineEvent .eventBottom .data").remove();
    $("#bottomTimeline").fadeToggle("slow");
    $("#relHelpContainer").fadeToggle("slow");
    $(".relation")
    .droppable({
        drop: function (event, ui) {
                dropOnRelation(this, ui.draggable, true);
            }
    });
    loadRelations();
}

// Restore initial view
function restoreInitialView() {
    saveRelations();
    updateTitle();
    $("#home").text("HOME");
    $('#mainSource').remove();
    $("#container").slideToggle();
    $("#backButton").fadeToggle("slow");
    $('#topTitle').css('height', '6%');
    $("#timeline").removeClass("withArrows").css("height", "32%");
    $("#timeline").children(".timelineEvent").css("height", "");
    $("#overlay, #bottomTimeline, #relHelpContainer").hide("slow");
    $("body").append($("#overlay"));
    $("#timeline").show()
    $('#footer').hide();
    $("#timeline-embed").hide();
	$("#mapdiv").hide();	
    $('#topTitle').css("margin-bottom", "0");
    window.timeline = undefined;
	$('#mapdiv').empty();
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

function b64toBlob(b64, qid, onsuccess, onerror) {
    var img = new Image();
    img.src = b64;

    img.onerror = onerror;

    img.onload = function onload() {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(function(blob) {
            narra.usedImages[qid] = true;
            uploadcare.fileFrom('object', blob)
            .done(function(fileInfo) {
                narra.items[qid].image = fileInfo.cdnUrl + "image.jpg";
                saveObjectToDB(narra.items, qid);
            }).fail(function(error, fileInfo) {
                  console.log(error);
            });
        }, function(error) {
            console.log(error);
        });
    }
}




// controll if there are dates on events
function controllDateOnEvents() {
	
	var dateOk= true;
	var eventsNotDates="";
	var eventsWithDates= {};
	var numberOfEventsNotDates= 0;
	
	// control if there are events with no cordinates and save events with cordinate in an object
	for(var i in narra.events){
			if(narra.events[i].hasOwnProperty('start') &&  narra.events[i].start != "" ){
				eventsWithDates[i]=narra.events[i]
				numberOfEventsNotDates ++
				
			} else {
				dateOk = false;
				eventsNotDates += narra.events[i].title + '</br>';
			}
	}
	
	
	if(numberOfEventsNotDates > 0) {
		
		// Not all events have cordinates. Visualize only events with cordinates if press continue
		if(dateOk == false){
				
			showModal(
				"Visualize Timeline",
				"These events have no date: </br></br>" + eventsNotDates + "</br>Do you want to continue excluding them?",
				"Back",
				"Continue",
				function() {
					return
				},
				function() {
					visualizeTimeline(eventsWithDates);
					//console.log(narra.events)
					//console.log(eventsWithDates)
				}
			);
		
		// All events have cordinates
		} else{
			visualizeTimeline(narra.events);
			//console.log(narra.events)
			//console.log(eventsWithDates)
		}
	
	} else {
		
		// All events haven't cordinates
		showModal(
			"Visualize Timeline",
			"There are no events with date",
			"Back",
			"Continue",
			function() {
				return;
			},
				function() {
					return;
				}
			);
	
	}
	
	

}



// Ask user to save before visualizing
function confirmVisualizeTimeline() {
    if (!workspaceIsEmpty()) {
        showModal(
            "Visualize Timeline",
            "Do you want to save the current event before visualizing?",
            "Don't Save",
            "Save",
            function() {
                controllDateOnEvents();
            },
            function() {
                if (saveEvent() !== undefined) {
                    resetWorkspace();
                    controllDateOnEvents();
                }
                else {
                    // TODO INSERT VALIDATION
                }
            }
        );
    }
    else {
        controllDateOnEvents();
    }
}



// Visualize on a timeline
function visualizeTimeline(eventsOfNarration) {
    if ($('meta[name=mainSource]').attr("content") !== undefined) {
        $('#topTitle').append('<div id="mainSource"><i>' + $('meta[name=mainSource]').attr("content") + '</i></div>');
        $('#topTitle').css('height', '7%');
    }
    
    if (Object.keys(narra.events).length < 1) {
        notAllowed("Visualize Timeline", " visualizing the timeline.");
        return false;
    }
    $("#home").text("BACK");
    $("#backButton").fadeToggle("slow");
    $("#container").hide();
    $("#timeline").hide();
    $('#timeline-embed').show();
    $('#footer').show();
    $('#topTitle').css("margin-bottom", "2%");

    narra.usedImages = {};

    // Function to sort events by time
    var sort_by_time = function (a, b) {
        var compare = compareDates(narra.events[a].start, narra.events[b].start);
        if (compare === 0) return narra.events[a]._id.localeCompare(narra.events[b]._id);
        else return compare;
    }

    // Sort events by time
    var events = Object.keys(eventsOfNarration).sort(sort_by_time);

    // Define the slides of the timeline
    narra.slides = events.map(
        function (key) {
            var event = narra.events[key];            
            
            // Set ID of timeline slide
            event.unique_id = "slide-" + event._id;
            
            // Parse dates from arrays
            var sDate = parseDate(event.start);
            var eDate = parseDate(event.end);
                                                
            // Set start date of timeline slide
            event.start_date = {
                'year': sDate.getFullYear(),
                'month': event.start.length > 5 ? sDate.getMonth() + 1 : "",
                'day': event.start.length > 8 ? sDate.getDate() : "",
            };
            
            // Set end date of timeline slide
            event.end_date = {
                'year': eDate.getFullYear(),
                'month': event.end.length > 5 ? eDate.getMonth() + 1 : "",
                'day': event.end.length > 8 ? eDate.getDate() : "",
            };
            
            var fragment = "";
            var source = "";
            var secondaryAppend = "";
            var primaryAppend = "";
            var entitiesList = [];
                        
            event.text = {
                'headline': event.title,
                'text': event.description ? event.description : ""
            };

            //console.log("Setting image for event: " + event.title);
            //console.log("Event has props: " + event.props.length);

            // Function to link to English or Italian Wikipedia
            function createLinkWithTooltip(qid, lang) {
                return "<a onmouseover='$(this).tooltip(); $(this).tooltip(\"show\")' data-toggle='tooltip' title='" + getDescription(qid) + "' target='_blank' target='_blank' href='https://www.wikidata.org/wiki/" + narra.items[qid]['_id'] + "'>" + narra.items[qid][lang + 'Name'] + "</a>"
            }

            // Get list of entities and link to Wikipedia
            for (var qid in event.props) {
                var prop = event.props[qid];
                if (qid !== undefined && qid in narra.items) {
                    if ("enName" in narra.items[qid] && narra.items[qid].enName !== "") {
                        entitiesList.push(createLinkWithTooltip(qid, "en"));
                    }
                    else if ("itname" in narra.items[qid] && narra.items[qid].itName !== "") {
                        entitiesList.push(createLinkWithTooltip(qid, "it"));
                    }
                }

                // Handle event images (or other media)
                if (prop !== undefined) {
                    
                    if (event.media && event.media.url && event.media.url.startsWith('data')) {
                        event.media = undefined;
                    }
                    
                    if (event.media === undefined) {
                        //console.log("Prop: " + narra.items[qid]);
                        //console.log("Prop has image? " + ("image" in narra.items[qid]));
                        //console.log("Image has been used? " + (qid in narra.usedImages));
                        
                        if (narra.items[qid] !== undefined && 'image' in narra.items[qid] && ! (qid in narra.usedImages)) {
                            
                            var image = narra.items[qid].image;
                            
                            if (image.startsWith("http")) {
                                event.media = {'url': narra.items[qid].image
                                    .replace('http:', 'https:')
                                    .replace('Special:FilePath', 'Special:Redirect/file')
                                    .replace('/wiki/', '/w/index.php?title=')};
                                narra.usedImages[qid] = true;
                            
                                if (event.media && "url" in event.media && event.media.url.indexOf('/w/index.php?title=') > -1) {
                                    event.media.url = event.media.url + '&width=700&type=.jpg';
                                }
                            }
                        }
                    }

                    // Handle secondary sources of events
                    if ('secondary' in prop && prop.secondary.length > 0) {
                        for (var j = 0; j < prop.secondary.length; j++) {
                            if (!event.text.text && prop.secondary[j].text) {
                                event.text.text = prop.secondary[j].text;
                            }
                            if (prop.secondary[j].title) {
                                var source = '\<li>' + prop.secondary[j].author + ', ' + prop.secondary[j].title;
                                if (prop.secondary[j].reference != "") {
                                    source += ", " + prop.secondary[j].reference;
                                }
                                source += '\</li>';
                                if (secondaryAppend.indexOf(source) < 0) {
                                    secondaryAppend += source;
                                }
                            }
                        }
                    }

                    // Handle primary sources of events
                    if ('primary' in prop && prop.primary.length > 0) {
                        for (var j = 0; j < prop.primary.length; j++) {
                            if (prop.primary[j].title) {
                                var source = '\<li>' + prop.primary[j].author + ', ' + prop.primary[j].title;
                                if (prop.primary[j].reference != "") {
                                    source += ", " + prop.primary[j].reference;
                                }
                                source += '\</li>';
                                if (primaryAppend.indexOf(source) < 0) {
                                    primaryAppend += source;
                                }
                            }
                        }
                    }
                }
                if (fragment.length > 0) break;
            }

            // Set event text
            event.text.text += fragment;
            var textToAppend = "";

            // Function to make a list of digital objects
            function makeDigObjList(urls) {
                var results = [];
                if (urls && $.type(urls) === "array") {
                    for (var l = 0; l < urls.length; l++) {
                        var a = document.createElement("a");
                        a.setAttribute("href", urls[l]);
                        a.setAttribute("target", "_blank");
                        a.text = l + 1;//a.host.replace("www.", "");
                        a.setAttribute("onclick", "showDigObjImage(this)");
                        results.push(a.outerHTML);
                    }
                }
                else if (urls && $.type(urls) === "string") {
                    var a = document.createElement("a");
                    a.setAttribute("href", urls);
                    a.setAttribute("target", "_blank");
                    a.text = "1"; //a.host.replace("www.", "");
                    a.setAttribute("onclick", "showDigObjImage(this)");
                    results.push(a.outerHTML);
                }
                return results.join(" • ");
            }

            // Display digital object list
            var digObjList = makeDigObjList(event.objurl);

            // Append secondary sources to HTML
            if (secondaryAppend)
                textToAppend += '<h5>Secondary Sources</h5><ul>' + secondaryAppend + '</ul>';

            // Append primary sources to HTML
            if (primaryAppend)
                textToAppend += '<h5>Primary Sources</h5><ul>' + primaryAppend + '</ul>';

            // Append list of entities to HTML
            if (entitiesList) {
                textToAppend += '<h5>Entities</h5><span class="tl-entities">' + entitiesList.join(' • ') + '</span>';
            }

            // Append list of digital objects to HTML
            if (digObjList) {
                textToAppend += '<h5>Digital Objects</h5><span class="digObjList">'
                    + digObjList + '</span>';
            }

            // Set final event text
            if (textToAppend) {
                event.text.text += textToAppend;
            }
            
			console.log(event)
            return event;
        }
    );

    // Reload image selection list in case of changes
    var observer = new MutationObserver(function (m) {
		console.log(observer)
        if(m[0].addedNodes[0].nodeName === "#text" || m[0].addedNodes[0].nodeName == "IMG") {
                makeImageSelect(window.timeline.getSlide(0).data.unique_id);
            this.disconnect();
          }
    });
	

    // Observe timeline for changes
    observer.observe(document.getElementById('timeline-embed'), { childList:true, subtree:true});

    // Create timeline object
    window.timeline = new TL.Timeline('timeline-embed', {'events': narra.slides},
        {
            scale_factor: 1,
            height: 700,
            timenav_height_percentage: 42,
            start_at_slide: 0
        }
    )
    .on("change", function(data) {
        makeImageSelect(data.unique_id);
    });    
}




// Confirm removal of entity from event
function confirmVisualizeMap() {
	
	var coordinateOk= true;
	var eventsNotCordinates="";
	var eventsWithCoordinates= {};
	var numberOfEventsNotCordinates= 0;
	
	// control if there are events with no cordinates and save events with cordinate in an object
	for(var i in narra.events){
			if(narra.events[i].hasOwnProperty('latitud') &&  narra.events[i].hasOwnProperty('longitud')  &&  narra.events[i].latitud != "" && narra.events[i].longitud != ""){
				eventsWithCoordinates[i]=narra.events[i]
				numberOfEventsNotCordinates ++
				
			} else {
				coordinateOk = false;
				eventsNotCordinates += narra.events[i].title + '</br>';
			}
	}
	
	
	if(numberOfEventsNotCordinates > 0) {
		
		// Not all events have cordinates. Visualize only events with cordinates if press continue
		if(coordinateOk == false){
				
			showModal(
				"Visualize Map",
				"These events have no coordinates: </br></br>" + eventsNotCordinates + "</br>Do you want to continue excluding them?",
				"Back",
				"Continue",
				function() {
					return
				},
				function() {
					visualizeMap(eventsWithCoordinates);
					//console.log(narra.events)
					//console.log(eventsWithCoordinates)
				}
			);
		
		// All events have cordinates
		} else{
			visualizeMap(narra.events);
			//console.log(narra.events)
			//console.log(eventsWithCoordinates)
		}
	
	} else {
		
		// All events haven't cordinates
		showModal(
			"Visualize Map",
			"There are no events with coordinates",
			"Back",
			"Continue",
			function() {
				return;
			},
				function() {
					return;
				}
			);
	
	}
	
	

}



//visualize map
function visualizeMap(eventsOfNarration) {
	

	
		if ($('meta[name=mainSource]').attr("content") !== undefined) {
			$('#topTitle').append('<div id="mainSource"><i>' + $('meta[name=mainSource]').attr("content") + '</i></div>');
			$('#topTitle').css('height', '7%');
		}
		
		if (Object.keys(narra.events).length < 1) {
			notAllowed("Visualize Timeline", " visualizing the timeline.");
			return false;
		}
		
		$("#home").text("BACK");
		$("#backButton").fadeToggle("slow");
		$("#container").hide();
		$("#timeline").hide();
		$('#timeline-embed').hide();
		$('#mapdiv').show();
		$('#footer').show();
		$('#topTitle').css("margin-bottom", "2%");

		narra.usedImages = {};

		// Function to sort events by time
/*  		var sort_by_time = function (a, b) {
			var compare = compareDates(narra.events[a].start, narra.events[b].start);
			if (compare === 0) return narra.events[a]._id.localeCompare(narra.events[b]._id);
			else return compare;
		}  */
		
		var sort_by_position = function( a , b){
			a = narra.events[a].position;
			b = narra.events[b].position;
			if(a > b) return 1;
			if(a < b) return -1;
			return 0;
		}

		// Sort events by time
		//var events = Object.keys(eventsOfNarration).sort(sort_by_time);
		// Sort events by position
		var events = Object.keys(eventsOfNarration).sort(sort_by_position)

		// Define the slides of the map
		narra.slides = events.map(
			function (key) {
				var event = narra.events[key];            
				
				// Set ID of timeline slide
				event.unique_id = "slide-" + event._id;
				
				// Parse dates from arrays
				var sDate = parseDate(event.start);
				var eDate = parseDate(event.end);
							
				
				// Set start date of timeline slide
				event.start_date = {
					'year': sDate.getFullYear(),
					'month': event.start.length > 5 ? sDate.getMonth() + 1 : "",
					'day': event.start.length > 8 ? sDate.getDate() : "",
				};
				
				// Set end date of timeline slide
				event.end_date = {
					'year': eDate.getFullYear(),
					'month': event.end.length > 5 ? eDate.getMonth() + 1 : "",
					'day': event.end.length > 8 ? eDate.getDate() : "",
				};
				
				event.date= sDate.getFullYear() + "-" + eDate.getFullYear()
				
				var fragment = "";
				var source = "";
				var secondaryAppend = "";
				var primaryAppend = "";
				var entitiesList = [];
							
				event.text = {
					'headline': event.title,
					'text': event.description ? event.description : ""
				};
				
				//var casNum=Math.random();
				event.location = {
					
					"name": "Kent County, Maryland",
					"lat": parseFloat(event.latitud),
					"lon": parseFloat(event.longitud),
					"zoom": 10,
					"line": true

				}

				//console.log("Setting image for event: " + event.title);
				//console.log("Event has props: " + event.props.length);

				// Function to link to English or Italian Wikipedia
				function createLinkWithTooltip(qid, lang) {
					return "<a onmouseover='$(this).tooltip(); $(this).tooltip(\"show\")' data-toggle='tooltip' title='" + getDescription(qid) + "' target='_blank' href='https://www.wikidata.org/wiki/" + narra.items[qid]['_id'] + "'>" + narra.items[qid][lang + 'Name'] + "</a>"
				}

				// Get list of entities and link to Wikipedia
				for (var qid in event.props) {
					var prop = event.props[qid];
					if (qid !== undefined && qid in narra.items) {
						if ("enName" in narra.items[qid] && narra.items[qid].enName !== "") {
							entitiesList.push(createLinkWithTooltip(qid, "en"));
						}
						else if ("itname" in narra.items[qid] && narra.items[qid].itName !== "") {
							entitiesList.push(createLinkWithTooltip(qid, "it"));
						}
					}

					// Handle event images (or other media)
					if (prop !== undefined) {
						
						
						// load media of event if any
						if(event.eventMedia != ""){
							
							event.media = {'url' : event.eventMedia}
						  
						  // else load entities images
						} else {
					
						
							if (event.media && event.media.url && event.media.url.startsWith('data')) {
								event.media = undefined;
							}
							
							if (event.media === undefined) {
								//console.log("Prop: " + narra.items[qid]);
								//console.log("Prop has image? " + ("image" in narra.items[qid]));
								//console.log("Image has been used? " + (qid in narra.usedImages));
								
								if (narra.items[qid] !== undefined && 'image' in narra.items[qid] && ! (qid in narra.usedImages)) {
									
									var image = narra.items[qid].image;
									
									if (image.startsWith("http")) {
										event.media = {'url': narra.items[qid].image
											.replace('http:', 'https:')
											.replace('Special:FilePath', 'Special:Redirect/file')
											.replace('/wiki/', '/w/index.php?title=')};
										narra.usedImages[qid] = true;
									
										if (event.media && "url" in event.media && event.media.url.indexOf('/w/index.php?title=') > -1) {
											event.media.url = event.media.url + '&width=700&type=.jpg';
										}
									}
								}
							}
							
						}

						// Handle secondary sources of events
						if ('secondary' in prop && prop.secondary.length > 0) {
							for (var j = 0; j < prop.secondary.length; j++) {
								if (!event.text.text && prop.secondary[j].text) {
									event.text.text = prop.secondary[j].text;
								}
								if (prop.secondary[j].title) {
									var source = '\<li>' + prop.secondary[j].author + ', ' + prop.secondary[j].title;
									if (prop.secondary[j].reference != "") {
										source += ", " + prop.secondary[j].reference;
									}
									source += '\</li>';
									if (secondaryAppend.indexOf(source) < 0) {
										secondaryAppend += source;
									}
								}
							}
						}

						// Handle primary sources of events
						if ('primary' in prop && prop.primary.length > 0) {
							for (var j = 0; j < prop.primary.length; j++) {
								if (prop.primary[j].title) {
									var source = '\<li>' + prop.primary[j].author + ', ' + prop.primary[j].title;
									if (prop.primary[j].reference != "") {
										source += ", " + prop.primary[j].reference;
									}
									source += '\</li>';
									if (primaryAppend.indexOf(source) < 0) {
										primaryAppend += source;
									}
								}
							}
						}
					}
					if (fragment.length > 0) break;
				}

				// Set event text
				event.text.text += fragment;
				var textToAppend = "";

				// Function to make a list of digital objects
				function makeDigObjList(urls) {
					var results = [];
					if (urls && $.type(urls) === "array") {
						for (var l = 0; l < urls.length; l++) {
							var a = document.createElement("a");
							a.setAttribute("href", urls[l]);
							a.setAttribute("target", "_blank");
							a.text = l + 1;//a.host.replace("www.", "");
							//a.setAttribute("onclick", "showDigObjImage(this)");
							results.push(a.outerHTML);
						}
					}
					else if (urls && $.type(urls) === "string") {
						var a = document.createElement("a");
						a.setAttribute("href", urls);
						a.setAttribute("target", "_blank");
						a.text = "1"; //a.host.replace("www.", "");
						//a.setAttribute("onclick", "showDigObjImage(this)");
						results.push(a.outerHTML);
					}
					return results.join(" • ");
				}

				// Display digital object list
				var digObjList = makeDigObjList(event.objurl);

				// Append secondary sources to HTML
				if (secondaryAppend)
					textToAppend += '<h5>Secondary Sources</h5><ul>' + secondaryAppend + '</ul>';

				// Append primary sources to HTML
				if (primaryAppend)
					textToAppend += '<h5>Primary Sources</h5><ul>' + primaryAppend + '</ul>';

				// Append list of entities to HTML
				if (entitiesList) {
					textToAppend += '<h5>Entities</h5><span class="tl-entities">' + entitiesList.join(' • ') + '</span>';
				}

				// Append list of digital objects to HTML
				if (digObjList) {
					textToAppend += '<h5>Digital Objects</h5><span class="digObjList">'
						+ digObjList + '</span>';
				}

				// Set final event text
				if (textToAppend) {
					event.text.text += textToAppend;
				}
										
				return event;
			}
		);

		// Reload image selection list in case of changes
	/*      var observer = new MutationObserver(function (m) {
			 console.log(observer)
			if(m[0].addedNodes[0].nodeName === "#text" || m[0].addedNodes[0].nodeName == "IMG") {
					makeImageSelect(window.storymap.getSlide(0).data.unique_id);
				this.disconnect();
			  }
		});  */



		var slides = {"slides": narra.slides};

		
		var storymap_options = { 
		
			"map_type" : "osm:standard", //"stamen:terrain"
			"calculate_zoom" : true

			
		
		};
		
		// Observe timeline for changes
		//observer.observe(document.getElementById('mapdiv'), { childList:true, subtree:true});

		// Create timeline object
		window.storymap = new KLStoryMap.StoryMap('mapdiv', {'storymap': slides},storymap_options)
		.on("change", function(data) {
			makeImageSelect(data.unique_id);
		}); 

	
}

// Switch event image
function switchImage(value, slideID) {
    var evid = slideID.split('slide-')[1];
    narra.events[evid].media = {};
    narra.events[evid].media.url = value;
    saveObjectToDB(narra.events, evid);
    $("#" + slideID + " " + ".tl-media-image").attr("src", value);
}
            
// Make image selection menu
function makeImageSelect(slideID) {
    var $select = $("<select onchange='switchImage($(this).val(), \"" + slideID + "\")'>");
    $.each(window.timeline.getSlideById(slideID).data.props, function(p) {
        //$select.append("<option value='" + narra.items[p].wikipedia + "'>" + narra.items[p].enName + " wiki</option>");
        var evid = slideID.split('slide-')[1];
        if (narra.items[p] && "image" in narra.items[p] && narra.items[p].image !== "") {
            var selected = "";
            var fixedImageURL = narra.items[p].image.replace('http:', 'https:').replace('Special:FilePath', 'Special:Redirect/file').replace('/wiki/', '/w/index.php?title=') + "&width=700&type=.jpg"
            if ("media" in narra.events[evid] && narra.events[evid].media.url === fixedImageURL) {
                selected = " selected ";
            }
            $select.append("<option value='" + fixedImageURL + "'" + selected + ">" + narra.items[p].enName + " image</option>");
        }
    });
    $("#" + slideID + " " + ".tl-media > select").remove();
    $("#" + slideID + " " + ".tl-media").append($select);
}

// Hide search field
function hideSearch() {
    if ($("#searchInput").is(':visible')) {
        $('#searchInput').slideUp(200);
        $('.checkbox').slideUp(200);
    }
}

// Show search field
function showSearch() {
    $('#controls').scrollTop(0);
    
    $('#searchInput').slideToggle(200, function() {
        if ($("#searchInput").is(':visible')) {
            $('#searchInput').focus();
        }
        else {
            $(".checkbox input").prop('checked', false);
            $("#controls .data").show();
        }
    });
    
    if (document.getElementById("user-defined") === null) {
        $('#searchInput').after("<div class='checkbox'><label for='user-defined' onclick='searchEntity()'><input id='user-defined' type='checkbox' />User-defined entities</label></div><div class='checkbox'><label for='missing-desc' onclick='searchEntity()'><input id='missing-desc' type='checkbox' />Missing description</label></div>");
    }
    else {
        $('.checkbox').slideToggle(200);
    }
}

// Search entities
function searchEntity() {
    if ($("#searchInput").val() === "") {
        $("#controls .data").show();
    }
    else {
        $("#controls .data").hide();
    }
    $("#controls .data:contains(" + $("#searchInput").val() + ")").show();
    
    if (document.getElementById("user-defined").checked) {
        $("#controls .data[data-id^='Q']").hide();
    }
    if (document.getElementById("missing-desc").checked) {
        for (var qid in narra.items) {
            if (narra.items[qid][narra.currentLang + "Desc"]) {
                $("#controls .data[data-id='" + qid + "']").hide();
            }
        }
    }
}

// Get images from Wikimedia Commons (through Wikipedia)
function imageRequest(qid, caller) {
    var url = 'https://en.wikipedia.org/w/api.php?action=query&prop=images|imageinfo&imlimit=50&format=json&iiprop=extmetadata&titles=' + encodeURIComponent(narra.items[qid].enName.replace(/\s+/g, '_')) + '&callback=?';

    //console.log(url);
    
    $.getJSON(url, function(data) {
        var html = "";
        if ("query" in data && "pages" in data.query) {
            var pages = data.query.pages;
            var images = pages[Object.keys(pages)[0]].images;
        
            if (images !== undefined) {
                for (var i = 0; i < images.length; i++) {
                    if (images[i].title.indexOf('Commons-logo') > 0) continue;
                    if (images[i].title.indexOf('Disambig') > 0) continue;
                    if (images[i].title.indexOf('Red Pencil Icon') > 0) continue;
                    if (images[i].title.indexOf('Wikisource') > 0) continue;
                    if (images[i].title.indexOf('Wikivoyage') > 0) continue;
                    if (images[i].title.indexOf('Wiktionary') > 0) continue;
                    if (images[i].title.indexOf('A_coloured_voting_box') > 0) continue;
                    if (images[i].title.indexOf('Emblem-money') > 0) continue;
                    if (images[i].title.indexOf('Folder Hexagonal') > 0) continue;
                    if (images[i].title.indexOf('.svg') > 0) continue;
                    if (images[i].title.indexOf('.ogv') > 0) continue;
                    if (images[i].title.indexOf('.ogg') > 0) continue;
            
                    html += "<div class='square' style='background-image: url(\"" + "https://en.wikipedia.org/w/index.php?title=Special:Redirect/file/" + encodeURIComponent(images[i].title.replace(/\s+/g, '_').split('File:')[1]) + "&width=700&type=.jpg" + "\")' onclick='replaceImage($(event.target))'></div>";
                }
            }
        }
        html += "<div class='square'><input class='fileInput' type='file' name='files[]' style='display: none' onchange='loadImageFromFile(event.target)'/><span onclick='$(event.target).parent().children(\"input\").first().click()'>Upload from disk</span></div>";
        caller.parent().next().html(html);        
    });
}

// Load image from a file uploaded by the user
// function loadImageFromFile(element) {
    // var reader = new FileReader();
    // var file = element.files[0];
    
    // if (file) {
        // if (file.type.match(/image.*/)) {
            // uploadcare.fileFrom('object', file)
            // .done(function(fileInfo) {
                // replaceImage($(element), fileInfo.cdnUrl + "image.jpg");
            // }).fail(function(error, fileInfo) {
					// console.log("error");
                  // console.log(error);
				  // console.log("fileinfo");
				  // console.log(fileInfo);
            // });
        // }
        // else {
            //TODO Warning: not an image
        // }
    // }
// }

//Replace image with another
// function replaceImage($element, withImage) {
    // var qid = $element.parents('.ui-front').attr('data-id');
    // if (withImage === undefined) {
        // withImage = $element.css('background-image').split('"')[1];
    // }
	// console.log("ooooo")
    // $element.parents('.ui-front').find('.popoverImage').attr('src', withImage).show();
    // $element.parents('.ui-front').find('.popoverImageSeparator').show();
    // $element.parents('.ui-front').find('.imageLabelDiv > a').text('Change Image');
    // narra.items[qid].image = withImage;
    // saveObjectToDB(narra.items, qid);
// }

function loadImageFromFile(element) {
	var file = element.files[0];
	
	if (file) {
		if (file.type.match(/image.*/)) {
			var extension = file.type.split('/')[1].replace('jpeg', 'jpg');
			var fileName = narra.db.db_name  + "-image-" + Math.floor(Math.random() * 10000000) + "." + extension;

			$(element).parents('.ui-front').find('.popoverImage').hide();
			$(element).parents('.ui-front').find('.image-upload-spinner').show();
			
			if (file.type.indexOf('gif') > -1) {
				uploadImage(element, file, fileName);
			}
			else {
				ImageTools.resize(file, {
						width: 1280, // maximum width
						height: 1024 // maximum height
					}, function(blob, didItResize) {
						if (didItResize) {
							console.log(currentTime() + 'Resized image to maximum allowed size');
						}
						uploadImage(element, blob, fileName);
				});
			}
		}
		else {
			alert("This file is not in a supported format. Please upload only JPG, PNG, or GIF images.")
		}
	}
}

function uploadImage(element, blob, fileName) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", '/cgi-bin/upload.py', true);
	var formData = new FormData();
	formData.append("file", blob);
	formData.append("fileName", fileName);
	xhr.send(formData);

	xhr.onreadystatechange = function() {
		// TODO Handle duplicate images to save space on server
	    if (xhr.readyState == XMLHttpRequest.DONE) {
			$(element).parents('.ui-front').find('.image-upload-spinner').hide();
			console.log(currentTime() + 'Uploaded image: ' + fileName);
	        replaceImage($(element), "https://dlnarratives.eu/images/" + fileName);
			$(element).parents('.ui-front').find('.popoverImage').show();
	    } else {
	    	// TODO Handle server error
	    }
	}
}

function replaceImage($element, withImage) {
	var qid = $element.parents('.ui-front').attr('data-id');
	if (withImage === undefined) {
		withImage = $element.css('background-image').split('"')[1];
	}
	$element.parents('.ui-front').find('.popoverImage').attr('src', withImage).show();
	$element.parents('.ui-front').find('.popoverImageSeparator').show();
	$element.parents('.ui-front').find('.imageLabelDiv > a').text('Change Image');
	narra.items[qid].image = withImage;
	saveObjectToDB(narra.items, qid);
}




// Ask user to confirm digital object deletion
function confirmDeleteDigObj(url) {
    showModal(
        "Delete Digital Object",
        "Are you sure you want to delete this digital object?",
        "Delete Object",
        "Keep Object",
        function() {
            $("#digobjTable .digobjPreview[data-url='" + url + "']").remove();
        },
        function() {
        }
    );
}

// Create preview for digital object
function createDigObjPreview(urlObj) {
    var regex = /\<title\>(.*?)\</;
    
    if ($("#digobjTable .digobjPreview[data-url='" + urlObj + "']").length === 0) {
        
        var $preview = $("<a target='_blank' href='" + urlObj + "'><div class='digobjPreview' data-url='" + urlObj + "'><div class='deleteButton digObjDeleteButton'><b class='x'>×</b></div><span>Loading Title...</span></div></a>");
        
        $preview.mouseenter(function () { $(this).find(".deleteButton").fadeToggle("fast") });
        $preview.mouseleave(function () { $(this).find(".deleteButton").fadeToggle("fast") });
                
        $preview.find(".deleteButton").click(function(event) {
            event.preventDefault();
            event.stopPropagation();
            confirmDeleteDigObj($(this).parent().attr("data-url"));
        });
        
        $("#digobjTable").append($preview);
        
         $.get( "../PHP/getDigitalObjectPageForCorsP.php",
				 "urlob=" + urlObj	,
              function(data) {
				  console.log(data)
                  var match = data.html.match(regex);
                  if (match !== null) {
                      $("#digobjTable .digobjPreview[data-url='" + urlObj + "'] span").text(match[0].split(">")[1].split("<")[0]);
                  }
              },
			  "JSON"
        ).fail(function() {
			console.log('ajax for Digital object not loaded'); // or whatever
		});;  
		
 /*  		$.ajax({

				type: "GET",
				url: "../PHP/getDigitalObjectPageForCorsP.php", 
				dataType: "JSON",					
				data: {urlob: urlObj},
				async: false,
				success: function(resp) {
					console.log(resp.html)
 					  var match = resp.html.match(regex);
					  if (match !== null) {
						  $("#digobjTable .digobjPreview[data-url='" + resp.urlob + "'] span").text(match[0].split(">")[1].split("<")[0]);
					  } 

				},
				error: function(response){
					var a= JSON.stringify(response)
					//alert(a)
					console.log(a)

				}
				
		}) */   
		
		
		
    }
}

// Add new digital object
function addDigitalObject(inputValue, auto) {
    try {
        var url = new URL(inputValue);
        $('#digobjInput').val("");
        $("#digobjInput").parents('.input-group').removeClass("has-error");
          createDigObjPreview(url);
    }
    catch (TypeError) {
        if (inputValue.indexOf("http://") < 0) {
            addDigitalObject("http://" + inputValue, auto);
        }
        else if (!auto) {
            $("#digobjInput").parents('.input-group').addClass("has-error");
        }
    }
}

// Confirm logout
function confirmLogout() {
    showModal(
        "Logout",
        "Do you really want to logout? You will lose all unsaved data.",
        "Don't Logout",
        "Logout",
        function() {
        },
        function() {
/*             narra.remote.logout().then(function () {
                //narra.sync.cancel();
                    console.log(currentTime() + "Successfully logged out");
                window.open("/tool/index.html","_self");
                $("#userMenu").hide();
            }); */
			
			$.ajax({
				type: "POST",
				url: "../PHP/sessionClose.php", 
				dataType: "JSON",					
				data: {},
				success: function(resp) {
					console.log(resp.msg)
					console.log(currentTime() + "Successfully logged out");
					window.open("https://dlnarratives.eu/qweasdEmanuele/tool/index.html","_self");
				},
				error: function(response){
					var a= JSON.stringify(response)
					//alert(a)
					console.log(a)

				}
				
			}) 
			
			
        }
    );
}

// Confirm go to homepage
function confirmHome() {
    if (!workspaceIsEmpty()) {
    showModal(
        "Go to Homepage",
        "Do you want to go back to the homepage? You will lose all unsaved data.",
        "Stay Here",
        "Go to Homepage",
        function() {
        },
        function() {
            window.open("index.html","_self");
        }
    );
} else {
    window.open("index.html","_self");
}
}

// Add popover to digital object
function addDigObjPopoverTo(digObj, title, imageURL) {
    $element.popover({
        html: true,
        placement: "bottom",
        container: "body",
        trigger: "focus",
        title: function () {
            
        },
        content: makePopoverContentForObj($element, withForm, evid),
        delay: {show: 70, hide: 70}
    });
    $element.on("show.bs.popover", function(){
        $(this).data("bs.popover").tip().css("width", "28%");
    });
    return $element;
}

// Show popover for digital object
function showDigObjImage(obj) {
    var url = obj.getAttribute("href");
    if (url.indexOf("europeana.eu") > -1) {
        var ids = url.split("record/")[1].split(".html")[0];
        $.getJSON("http://www.europeana.eu/api/v2/record/" + ids
        + ".json?wskey=UopBP64R3", function(data) {
            var title = data.object.title;
            var imageURL = data.object.europeanaAggregation.edmPreview;
            //addDigObjPopoverTo(obj, title, imageURL)
        });
    }
    else {
        //addDigObjPopoverTo(obj);
    }
}

// Call triplifier and display results
function startTriplify() {
   // $.get("https://dlnarratives.eu/cgi-bin/triplify.py?db=" + narra.db.name.split('/').pop(),
   
   
	$.ajax({
			type: "POST",
			url: "../PHP/triplify.php", 
			dataType: "JSON",					
			data: {currentDbName: narra.user +"-"+narra.dbName},
			success: function(resp) {
				
				$("#tripButton #floatingCirclesG").hide();
				$("#tripButton span").fadeIn();
				showModal(
					"Triplification Results",
					resp.id + "<br/>" + resp.numberEvents + "<br/>"+  resp.consistent +
					"<br><a target='_blank' href='" + resp.pathFileOwl + "'>Download the OWL file of your narrative</a><br><hr>🚧 <b>Work in Progress</b> 🚧<br><i>Soon you will be able to easily publish the narrative and its visualizations.</i>",
					"Cancel",
					"OK",
					function() {},
					function() {}
				);
				
			},
			error: function(response){
				var a= JSON.stringify(response)
				//alert(a)
				console.log(a)

			}
		})    
   
   
   
/*    $.get("https://dlnarratives.eu/cgi-bin/triplifyEma.py?db=" + narra.db.db_name,
        function(data) {
            $("#tripButton #floatingCirclesG").hide();
            $("#tripButton span").fadeIn();
            showModal(
                "Triplification Results",
                data.result.indexOf("inconsistent") > -1 ? data.result : data.result.replace(/http.*recognized\./, '') + "<br><a target='_blank' href='" + data.path + "'>Download the OWL file of your narrative</a><br><hr>🚧 <b>Work in Progress</b> 🚧<br><i>Soon you will be able to easily publish the narrative and its visualizations.</i>",
                "Cancel",
                "OK",
                function() {},
                function() {}
            );
        }
    )
    .fail(function(error) {
        console.log(error);
    }); */
}

// Triplify the narrative
function triplify() {
    $("#tripButton span").hide();
    $("#tripButton #floatingCirclesG").fadeIn();
    var t0 = performance.now();
    
	
	
	
		$.ajax({
		type: "GET",
		//url: "conn.php", 
		url: "../PHP/A1forTriplify.php", 
		dataType: "JSON",					
		data: {dbusername: narra.user +'-'+narra.dbName},
		success: function(resp) {

			// Load narrative info from database
			if(resp.info != ""){
				
				narra.info = JSON.parse(resp.info)
				console.log(currentTime() + 'Load Narrative info (A1) From DB: ' + narra.info);
				startTriplify();
				
			} else {
				
				console.log(currentTime() + 'Narrative info not found in database; will create and save in DB');
				narra.info = {
					_id: "A1",
					id: Math.round(Math.random() * 1000000000),
					name: "",
					author: narra.user
				};
				saveObjectToDB({"A1": narra.info}, "A1");
				startTriplify();
			
			}
		},
		error: function(response){
				var a= JSON.stringify(response)
				//alert(a)
				console.log(a)

			}
		})
	
	
	
	
/* 	
    // Load narrative info from database
    narra.db.get("A1").then(function (doc) {
        console.log(currentTime() + "Loaded narrative info from database");
        narra.info = doc;
        startTriplify();
    }).catch(function (err) {
        console.log(currentTime() + 'Narrative info not found in database');
        narra.info = {
            _id: "A1",
            id: Math.round(Math.random() * 1000000000),
            name: "",
            author: narra.user
        };
        saveObjectToDB({"A1": narra.info}, "A1")
        .then(function(result) {startTriplify();})
    }) */
}

// Make query for entity
function makeQueryForDBName(qids) {
    var types = "VALUES ?type {\n wd:Q15222213 wd:Q17334923 wd:Q43229 wd:Q8436 wd:Q488383 " +
    "wd:Q7184903 wd:Q386724 wd:Q234460 wd:Q5 wd:Q186081 wd:Q1190554 " +
    "wd:Q15474042 wd:Q4167836 wd:Q41176 wd:Q8205328 wd:Q5127848\n}";
    
    var query = "PREFIX wd: <http://www.wikidata.org/entity/>\n" +
        "SELECT DISTINCT ?uri ?type ?itName ?enName ?itDesc ?enDesc " +
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
function dbNameRequest(qids) {
    //console.log(currentTime() + "Wikidata request");

    var query = makeQueryForDBName(qids);


    var sparqlURL = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(query);



    //console.log("\n" + query + "\n");        
    //console.log(sparqlURL);
    $.getJSON(sparqlURL, function (data) {    
        var added = {};
        data = data["results"]["bindings"];
        for (var i=0; i < data.length; i++) {
            var qid = data[i].uri.value.split('/').pop();
            if (!(qid in added)) {
                $("#narratives-menu").append("<li class='narra-list-item'><a href='tool.html?" + qid + "' class='data' target = '_blank'>" + titlecase(data[i].enName.value) + "</a></li>");
                added[qid] = {};
        }
        };
    });
}
