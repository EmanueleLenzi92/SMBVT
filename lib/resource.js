
// Use ECMAScript strict mode
"use strict";

var prefixes = "PREFIX rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n\
				PREFIX rdfs:   <http://www.w3.org/2000/01/rdf-schema#>\n\
				PREFIX narr:   <https://dlnarratives.eu/ontology#>\n\
				PREFIX ecrm:   <http://erlangen-crm.org/current/>\n\
				PREFIX time: <http://www.w3.org/2006/time#>\n";

var baseURL = "/virtuoso/sparql?format=application/json&query=";
var baseURL = "/blazegraph/namespace/narra2/sparql?format=json&query=";

var entityTypes = {
	"https://dlnarratives.eu/ontology#ActorWithRole": "actor",
	"http://erlangen-crm.org/current/E73_Information_Object": "work",
	"http://erlangen-crm.org/current/E53_Place": "place",
	"http://erlangen-crm.org/current/E89_Propositional_Object": "concept",
	"http://erlangen-crm.org/current/E19_Physical_Object": "object",
}

// On window load...
window.onload = function () {
	if (document.URL.indexOf("resource/") > -1) {
		resourceQuery();
	}
	else if (document.URL.indexOf("event/") > -1) {
		eventQuery();
	}
};

function resourceQuery() {
	var qid = document.URL.split("resource/")[1];
	
	if (qid !== undefined) {
		var entityURI = "https://dlnarratives.eu/resource/" + qid;
	
		console.log(entityURI);

		var query = "SELECT DISTINCT ?property ?value WHERE { <" + entityURI + "> ?property ?value. }";

		var queryURL = baseURL + encodeURIComponent(prefixes + query);
		
		console.log(prefixes + query);
		
		$.getJSON(queryURL, function(data) {
			console.log(data);

			var triples = [];
						
			data.results.bindings.forEach(function(item, index) {
				if (item.property.value && item.value.value) {
					if (fixPrefix(item.property.value) === "rdf:type" && item.value.value.startsWith("t")) return;
					
					if (fixPrefix(item.property.value) === "ecrm:P1_is_identified_by") return;
					
					if (fixPrefix(item.property.value) === "owl:sameAs") return;
					
					triples[fixPrefix(item.property.value)] = fixPrefix(item.value.value);
					
					$('#resDesc').append("<tr><td>" + makeLink(item.property.value) + "</td>"
						+ "<td>" + makeLink(item.value.value) + "</td></tr>")
				}
			});
			
			if (qid.startsWith("Q")) {
					$('#resDesc').append("<tr><td>" + makeLink("http://www.w3.org/2002/07/owl#sameAs") + "</td>"
						+ "<td>" + makeLink("http://wikidata.org/entity/" + qid) + "</td></tr>")
			}
			
			$('#bigName').text(triples["rdfs:label"]);
		});
	}
	else {
		$('#resDesc').html("This service describes a specific resource in the narrative knowledge base. Examples:<ul><li><a href='/resources.html#U28'>Uguccione di Baldovino</a></li><li><a href='/resources.html#U27'>Epistle XIII</a></li><li><a href='/resources.html#U14932181619308673203' target=_blank>Guelfi Bianchi</a></li>");
	}
}

function eventQuery() {
		
	var eventURI = "https://dlnarratives.eu/narrative/" + document.URL.split("narrative/")[1];
	var narraURI = "https://dlnarratives.eu/narrative/" + eventURI.split("/event")[0];
	
	console.log(narraURI, eventURI);

	var query = "SELECT DISTINCT ?eventTitle ?eventDescription ?startDate ?endDate\n\
				 WHERE {\n\
					 <" + eventURI + "> ecrm:P1_is_identified_by ?eventAppellation.\n\
                	 ?eventAppellation ecrm:P3_has_note ?eventTitle.\n\
					 <" + eventURI + "> ecrm:P4_has_time-span ?timeSpan.\n\
					 ?timeSpan narr:timeSpanStartedBy ?startDateObj.\n\
					 ?timeSpan narr:timeSpanFinishedBy ?endDateObj.\n\
					 ?startDateObj time:inXSDDate ?startDate.\n\
					 ?endDateObj time:inXSDDate ?endDate.\n\
                	 OPTIONAL {<" + eventURI + "> rdfs:comment ?eventDescription.}\n\
				 }";

	var queryURL = baseURL + encodeURIComponent(prefixes + query);
	
	console.log(prefixes + query);
	
	$.getJSON(queryURL, function(data) {
		console.log(data);

		var triples = [];
					
		data.results.bindings.forEach(function(item, index) {
			$('#bigName').text(htmlDecode(item.eventTitle.value));
						
			if (item.eventDescription) {
				$('#resDesc').append(
					$("<tr>").append(
						$("<td>").text("Description:"),
						$("<td>" + htmlDecode(item.eventDescription.value) + "</td>")
					)
				);
			}
			
			$('#resDesc').append("<tr><td>Start Date:</td><td>" + item.startDate.value + "</td></tr>");
			$('#resDesc').append("<tr><td>End Date:</td><td>" + item.endDate.value + "</td></tr>");
		});
	});/*
	}
	else {
		$('#resDesc').html("This service describes a specific resource in the narrative knowledge base. Examples:<ul><li><a href='/resources.html#U28'>Uguccione di Baldovino</a></li><li><a href='/resources.html#U27'>Epistle XIII</a></li><li><a href='/resources.html#U14932181619308673203' target=_blank>Guelfi Bianchi</a></li>");
	}*/
}

function fixPrefix(iri) {
	iri = iri.replace("http://www.w3.org/1999/02/22-rdf-syntax-ns#", "rdf:");
	iri = iri.replace("http://www.w3.org/2000/01/rdf-schema#", "rdfs:");
	iri = iri.replace("https://dlnarratives.eu/ontology#", "narr:");
	iri = iri.replace("http://erlangen-crm.org/current/", "ecrm:");
	iri = iri.replace("http://www.w3.org/2002/07/owl#", "owl:");
	return iri;
}

function makeLink(string) {
	if (string.startsWith("http")) {
		return "<a href=" + string + ">" + fixPrefix(string) + "</a>";
	}
	else {
		return string;
	}
}

// Return current time
function currentTime() {
    var d = new Date();
    return d.toISOString().split("T")[1].replace("Z", "") + " -- ";
}

function htmlDecode(input)
{
  var doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}
