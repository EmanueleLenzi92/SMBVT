
// Use ECMAScript strict mode
"use strict";

var items = [];

var prefixes = "PREFIX rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n\
				PREFIX rdfs:   <http://www.w3.org/2000/01/rdf-schema#>\n\
				PREFIX narr:   <https://dlnarratives.eu/ontology#>\n\
				PREFIX ecrm:   <http://erlangen-crm.org/current/>\n\
				PREFIX time: <http://www.w3.org/2006/time#>\n";

var baseURL = "https://dlnarratives.eu/virtuoso/sparql?format=application/json&query=";
var baseURL = "https://dlnarratives.eu/blazegraph/namespace/narra/sparql?format=json&query=";

var entityTypes = {
	"https://dlnarratives.eu/ontology#ActorWithRole": "actor",
	"http://erlangen-crm.org/current/E73_Information_Object": "work",
	"http://erlangen-crm.org/current/E53_Place": "place",
	"http://erlangen-crm.org/current/E89_Propositional_Object": "concept",
	"http://erlangen-crm.org/current/E19_Physical_Object": "object",
}

// On window load...
window.onload = function () {
	euroQuery("https://www.europeana.eu/api/v2/search.json?wskey=UopBP64R3&query=gustav+klimt&rows=100", 1);
	//euroQuery("https://www.europeana.eu/api/v2/record/2063629/AUS_280_005.json?wskey=UopBP64R3");
	//euroQuery("https://www.europeana.eu/api/v2/record/2063629/AUS_280_005.jsonld?wskey=UopBP64R3?callback=myCallback");
};

function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - damlev(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function simSum(string1, ourString) {
	var sim = 0;
	var substrings = [];
	var stringArray = string1.split(" ");
	for (var i = 0; i < stringArray.length - 1; i++) {
		substrings.push(stringArray.slice(i, i + ourString.split(' ').length).join(' '));
	}
	for (var substring of substrings) {
		sim = Math.max(similarity(substring, ourString), sim);
	}
	return sim;
}

var ourString = "Beethoven Frieze";

function euroQuery(queryURL, index) {	
		
	$.getJSON(queryURL, function(data) {
		
		items = items.concat(data.items);
		index = 100 + index;
		
		if (index < data.totalResults) {
			euroQuery("https://www.europeana.eu/api/v2/search.json?wskey=UopBP64R3&query=gustav+klimt&rows=100&start=" + index, index)
		} else {			
			var items2 = items;
						
			for (var i = 0; i < items.length; i++) {
				if ("dcLanguage" in items[i] && items[i].dcLanguage.indexOf("en") > -1) {
					items2[i].sim = simSum(items[i].dcTitleLangAware.en[0], ourString);
				} else if ("dcLanguage" in items[i] && (items[i].dcLanguage[0] in items[i].dcTitleLangAware)) {
					items2[i].sim = simSum(items[i].dcTitleLangAware[items[i].dcLanguage[0]][0], ourString);
				} else if ("dcTitleLangAware" in items[i]) {
					var firstKey = Object.keys(items[i].dcTitleLangAware)[0];
					items2[i].sim = simSum(items[i].dcTitleLangAware[firstKey][0], ourString);
				} else {
					items2[i].sim = simSum(items[i].title[0], ourString);
				}
			}
			
			items2 = items2.sort(function(a, b) {
    			var keyA = a.sim;
        		var keyB = b.sim;
				if(keyA < keyB) return 1;
    			if(keyA > keyB) return -1;
    			return 0;
			});
			
			for (var i = 0; i < 30; i++) {
				$('#timeline')
				.css('height', '300px')
				.css('width', '1050px')
				.css('overflow', 'hidden')
				.append(
					$('<div clas="personDiv" style="cursor: pointer; width: 200px; height: 300px; margin: 5px; background-size: cover; background-repeat: no-repeat; background-image: url(' + (items2[i].edmPreview ? items2[i].edmPreview : "") + ')">')
					.append($('<div class="personName" style="vertical-align: middle; font-family: \'Source Sans Pro\'; width: 200px; height: 20.4%; font-size: 12pt; overflow: hidden; white-space: normal; text-overflow: ellipsis; line-height: 110% !important">' + items2[i].title[0] + '</div>')));
			}
			
		    $('#timeline').slick({
			  	dots: true,
				variableWidth: true,
			    infinite: false,
			    speed: 300,
			    slidesToShow: 5,
			    slidesToScroll: 5,
				lazyLoad: 'ondemand',
				prevArrow: '.tl-slidenav-previous',
				nextArrow: '.tl-slidenav-next',
		    });
		}
	});
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
