
// Use ECMAScript strict mode
"use strict";

var prefixes = "PREFIX rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n\
				PREFIX rdfs:   <http://www.w3.org/2000/01/rdf-schema#>\n\
				PREFIX narr:   <https://dlnarratives.eu/ontology#>\n\
				PREFIX ecrm:   <http://erlangen-crm.org/current/>\n";

var baseURL = "https://dlnarratives.eu/virtuoso/sparql?format=application/json&query=";
var baseURL = "https://dlnarratives.eu/blazegraph/namespace/narra/sparql?format=json&query=";

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
	height: '600px',
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
            color: 'cyan'
        },
        events: {
            label: "I'm a dot!",
            shape: 'dot',
            color: '#ff3864',
		  size: 30,
        },
        mints: {color:'rgb(0,255,140)'},
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
					?narraURI rdf:type narr:Narrative.\n\
					?narraURI rdfs:label ?narraName.\n\
	             }";
	
 	var queryNarraURL = baseURL + encodeURIComponent(prefixes + queryNarra);

 	console.log(prefixes + queryNarra);

  	$.getJSON(queryNarraURL, function(data) {
  		console.log(queryNarraURL);
  		console.log(data);

  		var entities = [];

 		$("#narraList").append(
 			'<option selected disabled>Choose narrative</option>'
 		);

  		data.results.bindings.forEach(function(item, index) {
  			if (item.narraURI.value) {
 				$("#narraList").append(
 					"<option value='" + item.narraURI.value + "'>" + item.narraName.value + "</option>"
 				)
  			}
  		});
 	});
};

$(document).ready(function() {
	$("#narraList").on("change", function() {
		$("#eventList").show().empty();
		getEventsForNarrative(this.value);
	});
	$("#eventList").on("change", function() {
		getEntitiesForEvent(this.value, this.options[this.selectedIndex].innerHTML);
	});
});

function getEventsForNarrative(narraURI) {
	var query = "SELECT ?eventURI ?eventTitle {\
   	 			?eventURI narr:partOfNarrative <" + narraURI + ">.\
		?eventURI ecrm:P1_is_identified_by ?eventTitle}";
	
	var queryURL = baseURL + encodeURIComponent(prefixes + query);
		
	$.getJSON(queryURL, function(data) {
		console.log(queryURL);
		console.log(data);
		
		var events = [];
		
		data.results.bindings.forEach(function(item, index) {
			events.push(item);
		});

		console.log(events);
		
		events.sort(function(a, b) {
			if (a.eventTitle.value > b.eventTitle.value) return 1;
			if (a.eventTitle.value < b.eventTitle.value) return -1;
			return 0;
		});
		
		$("#eventList").append(
			'<option selected disabled>Choose event</option>'
		);
		
		events.forEach(function(item, index) {
			var title = item.eventTitle.value.split(".it/")[1].replace(/_/g, " ");
		
			$("#eventList").append(
				"<option value='" + item.eventURI.value + "'>" + title + "</option>"
			)
		});
	});
}

function getEntitiesForEvent(eventURI, eventName) {
	var query = "SELECT ?eventTitle ?entityURI ?entityName ?entityType \
                 WHERE {\
                    <" + eventURI + "> ecrm:P1_is_identified_by ?eventAppellation.\
                    ?eventAppellation ecrm:P3_has_note ?eventTitle.\
                    ?propositionURI rdf:subject <" + eventURI + ">.\
                    ?propositionURI rdf:object ?entityURI.\
                    ?entityURI rdf:type ?entityType.\
                    ?entityURI ecrm:P1_is_identified_by ?entityAppellation.\
                    ?entityAppellation ecrm:P3_has_note ?entityName.\
		 			FILTER NOT EXISTS {?entityURI rdf:type ?type2.\
		 			?type2 rdfs:subClassOf+ ?entityType.\
					filter ( ?entityType != ?type2 ).}\
                 }";

	var queryURL = baseURL + encodeURIComponent(prefixes + query);
	
	$.getJSON(queryURL, function(data) {
		
		console.log(data.results.bindings);
				
		$("#visual").empty();
		
		var nodes = [];
		var edges = [];
		
		var qids = [];
		
		nodes.push({id: 10000, group: 'events', label: eventName})
		
		data.results.bindings.forEach(function(item, index) {
						
			var type = entityTypes[item.entityType.value] ? entityTypes[item.entityType.value] : item.entityType.value;
						
			var uri = "https://dlnarratives.eu/resource/" + item.entityURI.value.split('/')[4];
			
			console.log(uri);
			
			nodes.push({id: index, group: type, label: item.entityName.value, url: uri})	
			edges.push({from: 10000, to: index})
			
			qids.push(item.entityURI.value.split('/')[2]);
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
	});
	
	network.on("hoverNode", function (params) {
		network.canvas.body.container.style.cursor = 'pointer';
	});
	
	network.on("blurNode", function (params) {
		network.canvas.body.container.style.cursor = 'default';
	});
}
