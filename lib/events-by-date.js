
// Use ECMAScript strict mode
"use strict";

var prefixes = "PREFIX rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n\
				PREFIX rdfs:   <http://www.w3.org/2000/01/rdf-schema#>\n\
				PREFIX narr:   <https://dlnarratives.eu/ontology#>\n\
				PREFIX ecrm:   <http://erlangen-crm.org/current/>\n\
				PREFIX cnt: <http://www.w3.org/2011/content#>\n\
				PREFIX time: <http://www.w3.org/2006/time#>\n";

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
					?narraURI rdf:type narr:Narrative.\n\
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
		"<option value='/entity-centred.html'>Entity with related events</option>",
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
		$("thead").css("visibility", "hidden");
		$("#tbody").empty();
		$("#startDate").val("");
		$("#endDate").val("");
	});
	
	$("#queryButton").on("click", function() {
		$("#tbody").empty();
		var start = $("#startDate").val();
		var end = $("#endDate").val();
		
		if (start.length < 6) start += '-01-01';
		if (end.length < 6) end += '-12-31';
				
		getEventsInDateRange($('#narraList').val(), start, end);
	});
});

function getEventsInDateRange(narraURI, start, end) {
	var query = "SELECT DISTINCT ?eventURI ?eventTitle ?startDate ?endDate\n\
		WHERE {\n\
			?eventURI narr:partOfNarrative <" + narraURI + ">.\n\
			?eventURI ecrm:P1_is_identified_by ?eventAppellation.\n\
			?eventAppellation ecrm:P3_has_note ?eventTitle.\n\
			?eventURI ecrm:P4_has_time-span ?timeSpan.\n\
			?timeSpan narr:timeSpanStartedBy ?startDateObj.\n\
			?timeSpan narr:timeSpanFinishedBy ?endDateObj.\n\
			?startDateObj time:inXSDDate ?startDate.\n\
			?endDateObj time:inXSDDate ?endDate.\n\
			FILTER (?startDate >= \"" + start + "\"^^xsd:date)\n\
			FILTER (?endDate <= \"" + end + "\"^^xsd:date)\n\
		}\n\
		ORDER BY ?startDate";

	var queryURL = baseURL + encodeURIComponent(prefixes + query);

	//console.log(prefixes + query);
	
	$.getJSON(queryURL, function(data) {
		
		if (data.results.bindings.length === 0) {
			$("#tbody").html("<tr><td colspan=3 style='text-align: center; font-size: 1.5em !important'>No results for this query</td></tr>");
			return;
		}
		
		//console.log(data);
		
		$("thead").css("visibility", "visible");
		
		data.results.bindings.forEach(function(item, index) {
			$("#tbody").append(
				"<tr" + (index % 2 === 0 ? "" : " class='alternate'") + ">"
				+ "<td><a href=" + item.eventURI.value + " target=_blank>" + item.eventTitle.value + "</a></td>"
				+ "<td>" + item.startDate.value + "</td>"
				+ "<td>" + item.endDate.value + "</td>"
				+ "</tr>"
			)
		});
	});
}
