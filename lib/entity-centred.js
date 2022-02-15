
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
		length: 250,
	  color: '#bce'
    },
    groups: {
        dotsWithLabel: {
            label: "I'm a dot!",
            shape: 'dot',
            color: 'cyan'
        },
        events: {
            label: "I'm a dot!",
            shape: 'dot',
            color: '#ff3864',
		  size: 15,
        },
        mints: {color:'rgb(0,255,140)'},
        actor: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf007',
                size: 60,
                color: '#c20ab7'
            }
        },
        place: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf0ac',
                size: 60,
                color: '#4d6cfa'
            }
        },
        work: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf02d',
                size: 60,
                color: '#fbd77c'
            }
        },
        object: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf12e',
                size: 60,
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
			getEntitiesForNarrative(narraURI);
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
		"<option value='/digital-objects.html'>Event with related digital objects</option>",
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
		$("#entityList").show().empty();
		$("#visual").empty();
		getEntitiesForNarrative(this.value);
	});
	
	$("#entityList").on("change", function() {
		getEventsForEntity(this.value, this.options[this.selectedIndex].getAttribute("data-type"), this.options[this.selectedIndex].innerHTML);
	});
});

function htmlDecode(input)
{
  var doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}

function getEntitiesForNarrative(narraURI) {
	var query1 = "SELECT DISTINCT ?entityURI ?entityName ?entityType\n\
	             WHERE {\n\
					?eventURI narra:partOfNarrative <" + narraURI+ ">.\n\
	                ?propositionURI narra:propSubject ?eventURI.\n\
	                ?propositionURI narra:propObject ?entityURI.\n\
	                ?entityURI ecrm:P1_is_identified_by ?entityAppellation.\n\
	                ?entityAppellation ecrm:P3_has_note ?entityName.\n\
					?entityURI rdf:type ?entityType.\n\
		 			FILTER NOT EXISTS {?entityURI rdf:type ?type2.\n\
		 			?type2 rdfs:subClassOf+ ?entityType.\n\
					filter ( ?entityType != ?type2 ).}\n\
				    FILTER NOT EXISTS {?entityURI rdf:type <https://dlnarratives.eu/ontology#ActorWithRole>}\n\
					FILTER NOT EXISTS {?entityURI rdf:type <https://dlnarratives.eu/ontology#ActorWithRole>}\n\
				    FILTER (?entityType != <http://www.w3.org/2002/07/owl#NamedIndividual>)\n\
	             }";

	var query2 = "SELECT DISTINCT ?entityURI ?entityName ?entityType \
	             WHERE {\
					?eventURI narra:partOfNarrative <" + narraURI+ ">.\
	                ?propositionURI narra:propSubject ?eventURI.\
	                ?propositionURI narra:propObject ?actorWithRoleURI.\
	                ?actorWithRoleURI ecrm:P1_is_identified_by ?entityAppellation.\
					?actorWithRoleURI rdf:type <https://dlnarratives.eu/ontology#ActorWithRole>.\
					?actorWithRoleURI narra:hasSubject ?entityURI.\
	                ?entityAppellation ecrm:P3_has_note ?entityName.\
	             }";

	var queryURL1 = baseURL + encodeURIComponent(prefixes + query1);
	var queryURL2 = baseURL + encodeURIComponent(prefixes + query2);

	console.log(prefixes + query1);
	
	$.getJSON(queryURL1, function(data) {
		//console.log(queryURL1);
		//console.log(data);
	
		var entities = [];
	
		data.results.bindings.forEach(function(item, index) {
			if (item.entityName.value) {
				entities.push(item);
			}
		});

		//console.log(prefixes + query2);
	
		$.getJSON(queryURL2, function(data) {
			//console.log(queryURL2);
			//console.log(data);
		
			data.results.bindings.forEach(function(item, index) {
				item.entityType = {value: "https://dlnarratives.eu/ontology#ActorWithRole"};
				if (item.entityName.value) {
					entities.push(item);
				}
			});
		
			entities.sort(function(a, b) {
				if (a.entityName.value > b.entityName.value) return 1;
				if (a.entityName.value < b.entityName.value) return -1;
				return 0;
			});
			
			$("#entityList").append(
				'<option selected disabled>Choose entity</option>'
			);
			
			entities.forEach(function(item, index) {
				$("#entityList").append(
					"<option data-type='" + entityTypes[item.entityType.value] + "' value='" + item.entityURI.value + "'>" + item.entityName.value + "</option>"
				)
			});
			
			$("#entityList").show();
		});
	});
}

function getEventsForEntity(entityURI, entityType, entityName) {
	
	var query = "SELECT DISTINCT ?eventURI ?eventTitle \
             WHERE {\
                ?propositionURI narra:propSubject ?eventURI.\
                ?propositionURI narra:propObject <" + entityURI + ">.\
                ?eventURI ecrm:P1_is_identified_by ?entityAppellation.\
                ?entityAppellation ecrm:P3_has_note ?eventTitle.\
             }"

	if (entityType === "actor") {
		query = "SELECT DISTINCT ?eventURI ?eventTitle \
             WHERE {\
                ?propositionURI narra:propSubject ?eventURI.\
                ?propositionURI narra:propObject ?actorWithRoleURI.\
				?actorWithRoleURI narra:hasSubject <" + entityURI + ">.\
                ?eventURI ecrm:P1_is_identified_by ?entityAppellation.\
                ?entityAppellation ecrm:P3_has_note ?eventTitle.\
             }"
	}

	var queryURL = baseURL + encodeURIComponent(prefixes + query);
	
	$.getJSON(queryURL, function(data) {
		
		//console.log(data.results.bindings);
				
		var nodes = [];
		var edges = [];
		
		nodes.push({id: 10000, group: entityType, label: entityName, url: entityURI});
		
		data.results.bindings.forEach(function(item, index) {			
			nodes.push({id: index, group: "events", label: htmlDecode(item.eventTitle.value), url: item.eventURI.value});
			edges.push({from: 10000, to: index});
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
