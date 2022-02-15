
// Use ECMAScript strict mode
"use strict";

var prefixes = "PREFIX rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n\
				PREFIX rdfs:   <http://www.w3.org/2000/01/rdf-schema#>\n\
				PREFIX narra:   <https://dlnarratives.eu/ontology#>\n\
				PREFIX ecrm:   <http://erlangen-crm.org/current/>\n";

var baseURL = "/virtuoso/sparql?format=application/json&query=";
var baseURL = "/blazegraph/namespace/narra4/sparql?format=json&query=";

var narraNames = {
	"Giant Squid": "/timeline/squid.html",
	"Dante Alighieri": "/timeline/dante.html",
	"Gustav Klimt": "/timeline/klimt.html",
	"Climate Change": "/timeline/climate.html"
}

var entityTypes = {
	"https://dlnarratives.eu/ontology#ActorWithRole": "actor",
	"http://erlangen-crm.org/current/E73_Information_Object": "work",
	"http://erlangen-crm.org/current/E53_Place": "place",
	"http://erlangen-crm.org/current/E89_Propositional_Object": "concept",
	"http://erlangen-crm.org/current/E19_Physical_Object": "object"
}

var options = {
	interaction: {
		hover: true
	},
	height: '100%',
    nodes: {
        shape: 'dot',
        size: 20,
        font: {
            size: 15,
            color: 'black'
        },
        borderWidth: 2
    },
    edges: {
        width: 2,
		length: 200,
	  color: '#bce'
    },
    groups: {
        dotsWithLabel: {
            label: "I'm a dot!",
            shape: 'dot',
            color: '#4d6cfa'
        },
        events: {
            label: "I'm a dot!",
            shape: 'dot',
            color: '#ff3864',
		  size: 30,
        },
        mints: {color:'rgb(0,255,140)'},
        digital: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf15b',
                size: 50,
                color: 'rgb(0, 204, 255)'
            }
        },
        actor: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf007',
                size: 50,
                color: '#c20ab7'
            }
        },
        place: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf0ac',
                size: 50,
                color: '#4d6cfa'
            }
        },
        work: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf02d',
                size: 50,
                color: '#fbd77c'
            }
        },
        object: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf12e',
                size: 50,
                color: 'rgb(100, 220, 120)'
            }
        },
        source: {
            color:{border:'white'}
        }
    }
};

// On window load...
window.onload = function () {
	var queryNarra = "SELECT DISTINCT ?narraURI ?narraName\n\
	             WHERE {\n\
					?narraURI rdf:type narra:Narrative.\n\
					?narraURI rdfs:label ?narraName.\n\
	             } ORDER BY ?narraName";
	
 	var queryNarraURL = baseURL + encodeURIComponent(prefixes + queryNarra);

 	//console.log(prefixes + queryNarra);

  	$.getJSON(queryNarraURL, function(data) {
  		//console.log(queryNarraURL);
  		//console.log(data);

  		var entities = [];

 		$("#narraList").append(
 			'<option selected disabled>Choose narrative</option>'
 		);
		
 		data.results.bindings.splice(1).forEach(function(item, index) {
 			if (item.narraURI.value) {
				$("#narraList").append(
					"<option value='" + item.narraURI.value + "'>" + item.narraName.value + "</option>"
				)
 			}
 		});
		
		if (data.results.bindings[0].narraURI.value) {
			$("#narraList").append(
				"<option value='" + data.results.bindings[0].narraURI.value + "'>" + data.results.bindings[0].narraName.value + "</option>"
			)
		}
		
		if (window.location.search !== "") {
			var narraURI = "https://dlnarratives.eu/narrative/" + window.location.search.split("=")[1];
			$("#narraList").val(narraURI);
			$("#timelineOption").attr("value", narraNames[$("#narraList option:selected").text()]);
			getEventsForNarrative(narraURI);
		}
 	});
};

$(document).ready(function() {
    $("#home").click(function() {
    	window.location = "/";
    });
	
	$("#lang.long").append(
		"<option selected disabled>OTHER VISUALISATIONS</option>",
		"<option id='timelineOption' value=''>Timeline</option>",
		"<option value='/event-centred.html'>Event with related entities</option>",
		"<option value='/entity-centred.html'>Entity with related events</option>",
		"<option value='/events-by-date.html'>Events by date range</option>",
		"<option value='/primary-sources.html'>Primary sources</option>"	
	)
	
	$("#lang.long").on("change", function() {
		if ($("#narraList").val() !== null) {
			var narraURIsplit = $("#narraList").val().split("/");
			window.location = $(this).val() + "?narrative=" + narraURIsplit[narraURIsplit.length - 1];
		}
		else {
			if ($(this).val() === "") {
				$("#lang.long").val('other');
				showModal("Select Narrative", "Please select a narrative from the menu before loading the timeline", "OK",
					function() {
						
					}
				);
			} else {
				window.location = $(this).val();
			}
		}
	});
	
	$("#narraList").on("change", function() {
		$("#timelineOption").attr("value", narraNames[$("#narraList option:selected").text()]);
		$("#eventList").show().empty();
		$("#visual").empty();
		getEventsForNarrative(this.value);
	});
	
	$("#eventList").on("change", function() {
		getObjectsForEvent(this.value, this.options[this.selectedIndex].innerHTML);
	});
});

function htmlDecode(input)
{
  var doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}

function getEventsForNarrative(narraURI) {
	var query = "SELECT ?eventURI ?eventTitle {\n\
   	 			?eventURI narra:partOfNarrative <" + narraURI + ">.\n\
		?eventURI ecrm:P1_is_identified_by ?eventTitle}";
	
	var queryURL = baseURL + encodeURIComponent(prefixes + query);
		
	$.getJSON(queryURL, function(data) {
		//console.log(queryURL);
		//console.log(data);
		
		var events = [];
		
		data.results.bindings.forEach(function(item, index) {
			events.push(item);
		});

		//console.log(events);
		
		events.sort(function(a, b) {
			if (a.eventTitle.value > b.eventTitle.value) return 1;
			if (a.eventTitle.value < b.eventTitle.value) return -1;
			return 0;
		});
		
		$("#eventList").append(
			'<option selected disabled>Choose event</option>'
		);
		
		events.forEach(function(item, index) {
			var title = item.eventTitle.value.split(".eu/appellation/")[1].replace(/_/g, " ");
		
			$("#eventList").append(
				"<option value='" + item.eventURI.value + "'>" + title + "</option>"
			)
		});
		
		$("#eventList").show();
	});
}

function getObjectsForEvent(eventURI, eventName) {
	var query = "SELECT ?eventTitle ?objectURI\n\
                 WHERE {\n\
                    <" + eventURI + "> ecrm:P1_is_identified_by ?eventAppellation.\n\
                    ?eventAppellation ecrm:P3_has_note ?eventTitle.\n\
					?objectURI ecrm:P67_refers_to <" + eventURI + ">.\n\
                 }";

	var queryURL = baseURL + encodeURIComponent(prefixes + query);
	
	//console.log(prefixes + query);
	
	$.getJSON(queryURL, function(data) {
		
		//console.log(data.results.bindings);
				
		$("#visual").empty();
		
		var nodes = [];
		var edges = [];
		
		var qids = [];
		
		nodes.push({id: 10000, group: 'events', label: eventName, url: eventURI})
		
		data.results.bindings.forEach(function(item, index) {
						
			//var type = entityTypes[item.entityType.value] ? entityTypes[item.entityType.value] : item.entityType.value;
						
			var uri = item.objectURI.value;
			
			console.log(uri);
			
			nodes.push({id: index, group: 'digital', label: index + 1, url: uri})	
			edges.push({from: 10000, to: index})			
		});
		
		buildGraph(nodes, edges);
	});
}

function buildGraph(nodes, edges) {
	var network = new vis.Network(document.getElementById("visual"), {nodes: nodes, edges: edges}, options)
	
	network.on("selectNode", function (params) {
		if (params.nodes.length === 1) {
			nodes.forEach(function(item, index) {
				if (item.id === params.nodes[0]) {
	            	window.open(item.url, '_blank');
					return;
				}
	        });
		}
		network.unselectAll();
	});
	
	network.on("stabilized", function (params) {
		network.unselectAll();
	});
	
	network.on("hoverNode", function (params) {
		network.canvas.body.container.style.cursor = 'pointer';
	});
	
	network.on("blurNode", function (params) {
		network.canvas.body.container.style.cursor = 'default';
	});
}
