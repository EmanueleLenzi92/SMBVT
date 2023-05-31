var narra = {items:{}, events:{}}


$( document ).ready(function() {

// find URL parametres
var url = new URL(window.location);
var visualisationUrl = url.searchParams.get("visualization");
var slideUrl = url.searchParams.get("start");
var eventsWithCoordinates={}

// get json data
$.ajax({
    dataType: "json",
    url: "slide.json",
    mimeType: "application/json",
    success: function(result){
        
		// get items (entities) and events
		narra.items= result.items;
		narra.events= result.events;
		
		var startSlide=null;
		
		// Switch visualisation based on parameter visualisation
		//TIMELINE
		if (visualisationUrl == 'timeline'){
			
			
			// search events with dates
			var eventsWithDates= [];
			var numberOfEventsNotDates= 0;
	 
			for(var i in result.slides){
				if(result.slides[i].hasOwnProperty('start') &&  result.slides[i].start != "" ){
					eventsWithDates.push(result.slides[i]);
					numberOfEventsNotDates ++
					

				
				} 
			}
			
			// if there are events with dates
			if (numberOfEventsNotDates > 0){
				
				visualTimeline(eventsWithDates);
				

			} else {
				
				$("#mapdiv").empty();
				$("#mapdiv").append("<div id='noEvents' style='margin:0px;padding:0px;border:0px; text-align:center; height: 100%; width: 100%; display: table;'><span id='p-noEv'style='font-size:24px; width:100%; display: table-cell; vertical-align: middle;'>There are no events in the timeline. Please visualise the <a href='"+window.location.href.split('?')[0]+"?visualization=map'>story map</a> </span></div>")
			
			}
			
	
		// STORYMAP (default)
		} else {
		
			
			// search events with coordinates
			var eventsWithCoordinates= [];
			var numberEvents=0
			
			
			for(var i in result.slides){
				console.log(result.slides[i])
		
				if(result.slides[i].hasOwnProperty('latitud') &&  result.slides[i].hasOwnProperty('longitud')  &&  result.slides[i].latitud != "" && result.slides[i].longitud != ""){
					console.log(result.slides[i])
					eventsWithCoordinates.push(result.slides[i]);
					numberEvents ++	
					
					//find event id to start slide at this event 
					if(slideUrl != null){
						if(slideUrl == result.slides[i]._id){
							startSlide = result.slides[i].position
							console.log(startSlide)
						}
					}
					
				
				}
			}
	
			
			// if there are events with coordinates
			if (numberEvents > 0){
				
				visualMap(eventsWithCoordinates, startSlide);
				

			} else {
				
				$("#mapdiv").empty();
				$("#mapdiv").append("<div id='noEvents' style='margin:0px;padding:0px;border:0px; text-align:center; height: 100%; width: 100%; display: table;'><span id='p-noEv'style='font-size:24px; width:100%; display: table-cell; vertical-align: middle;'>There are no events in the story map. Please visualise the <a href='"+window.location.href.split('?')[0]+"?visualization=timeline'>timeline</a></span></div>")
			
			}

		}

		

    }
});


})







// build object for storymap object
function visualMap(eventsWithCoord, startAtSlide){
		
		var slides = {"slides": eventsWithCoord};
		console.log({'storymap': slides})

		if(startAtSlide != null){
			var startAt= startAtSlide
			var currentSlide= startAtSlide - 1
		} else {
			var startAt=1
			var currentSlide = 0
		}
		console.log("START AT: " + startAt)
	
		//calculate auto zoom for 454 Moving narratives
		if(window.location.pathname.split('/')[2]== "MOVING4"){
			var autoZoom= false;
			
		} else {
			var autoZoom= true;
		}
		
		var storymap_options = {
			"start_at_slide" : startAt-1, 
			"map_type" : "osm:standard",
			"calculate_zoom": autoZoom
			
		};

		var storymap = new KLStoryMap.StoryMap('mapdiv', {'storymap': slides}, storymap_options);
		window.onresize = function(event) {
			storymap.updateDisplay(); // this isn't automatic
		}
		
	
		// Leaflet Zoom control
		const zoomControl = L.control.zoom({ position: "topleft" });

		// grouping of controls
		const leafletControlsToAdd = [zoomControl];

		// event for when the Story Map is loaded
		storymap.on("loaded", function() {
		  // leaflet.js web map object
		  const leafletMap = storymap.map;

		  // add controls to Leaflet web map
		  leafletControlsToAdd.forEach(element => leafletMap.addControl(element));
		});
		
		
	 // array of slides (for bug visualization)
	var arraySlide=[];
	// index for current slide (for bug visualization)
	//var currentSlide=0

		// Button NEXT. show next slide. Hide slide +1 and -1
		$(document).on('click','.vco-slidenav-next',function(){
			
			
			// remove class active for this old marker
			$( ".leaflet-marker-icon:eq("+currentSlide+")" ).removeClass('activeMarker')
			
			currentSlide++
			
			// add class active for actual new marker
			$( ".leaflet-marker-icon:eq("+currentSlide+")" ).addClass('activeMarker')


		})
		
		// Button PREVIUS: show previus slide. Hide slide +1 and -1
		$(document).on('click','.vco-slidenav-previous',function(){
			
			// remove class active for this old marker
			$( ".leaflet-marker-icon:eq("+currentSlide+")" ).removeClass('activeMarker')
			
			currentSlide--
			
			// add class active for actual new marker
			$( ".leaflet-marker-icon:eq("+currentSlide+")" ).addClass('activeMarker')
			


		})  
		
		// Button Beginning: show first slide. hide the previus
		$(document).on('click','.vco-menubar-button:eq(1)',function(){
					

			
			// remove class active for this old marker
			$( ".leaflet-marker-icon:eq("+currentSlide+")" ).removeClass('activeMarker')

			// add class active for first new marker
			$( ".leaflet-marker-icon:eq(0)" ).addClass('activeMarker')
			
			currentSlide=0;
			
			
		})


	// when map is loaded, create array of slides, and put click on the markers
	var checkExist = setInterval(function() {
	   if ($('.leaflet-marker-icon').length) {
		  console.log("map loaded");
		  
		//append div legend on map
			$('.vco-map-display').append('<div class="slideLegend" > <div class="legendRow"> <div class="ContainerLegenttext"><p><span style="color:#c34528">&#9632;</span> Current event</p></div>     <div class="ContainerLegenttext"><p><span style="color:#e6e600">&#9632;</span> Historical event</p></div>   <div class="ContainerLegenttext"><p><span style="color:#2eb82e">&#9632;</span> Natural event</p></div>   <div class="ContainerLegenttext"><p><span style="color:#ff9900">&#9632;</span> Valorisation event</p></div>   <div class="ContainerLegenttext"><p><span style="color:#0000CD">&#9632;</span> Descriptive event</p></div> </div></div>')   
		  

		// create array of slides 
		$('.vco-slider-item-container .vco-slide').each(function(index, element) {
			arraySlide[index]= $(this)
		});
			
		// first marker active
		$( ".leaflet-marker-icon:eq("+currentSlide+")" ).addClass('activeMarker')
		  
		 // put click on all markers (show slide of clicked marker and make it clickable; hide the previus)
		  $('.leaflet-marker-pane .leaflet-marker-icon').each(function(index, element) {
			  
			  //append click on marker
			$('.leaflet-marker-icon:eq(' +index+ ')').on('click', function(){

				$( ".leaflet-marker-icon:eq("+currentSlide+")" ).removeClass('activeMarker')

				$( ".leaflet-marker-icon:eq("+index+")" ).addClass('activeMarker')
				
				currentSlide=index
			})
			
			
			// color markers
			if(storymap.data.slides[index].hasOwnProperty('mapMarkerColor')){
				$('.leaflet-marker-icon:eq(' +index+ ')').css("color", storymap.data.slides[index].mapMarkerColor)
			} 

		});


				

		  clearInterval(checkExist);
	   }
	}, 100); // check every 100ms

}





// build object for timeline object
function visualTimeline(eventsWithDat){
	
	
	// Function to sort events by time
    var sort_by_time = function (a, b) {
        var compare = compareDates(eventsWithDat[a].start, eventsWithDat[b].start);
        if (compare === 0) return eventsWithDat[a]._id.localeCompare(eventsWithDat[b]._id);
        else return compare;
    }

    // Sort events by time
    var events = Object.keys(eventsWithDat).sort(sort_by_time);
	

	
	console.log(Object.keys(eventsWithDat))
	console.log(eventsWithDat)
	
	
    // Reload image selection list in case of changes
    var observer = new MutationObserver(function (m) {
		console.log(observer)
        if(m[0].addedNodes[0].nodeName === "#text" || m[0].addedNodes[0].nodeName == "IMG") {
                makeImageSelect(window.timeline.getSlide(0).data.unique_id);
            this.disconnect();
          }
    });
	

    // Observe timeline for changes
    observer.observe(document.getElementById('mapdiv'), { childList:true, subtree:true});
	
	

    // Create timeline object
    window.timeline = new TL.Timeline('mapdiv', {'events': eventsWithDat},
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







//Ausiliars functions


// Make image selection menu
function makeImageSelect(slideID) {
	
	var idevent= slideID.split('slide-')[1];
	//select images only if it isn't a eventMedia
	if(narra.events[idevent].eventMedia == ""){
	
		var $select = $("<select onchange='switchThisImage($(this).val(), \"" + slideID + "\")'>");
		$.each(window.timeline.getSlideById(slideID).data.props, function(p) {
			//$select.append("<option value='" + narra.items[p].wikipedia + "'>" + narra.items[p].enName + " wiki</option>");
			var evid = slideID.split('slide-')[1];
			if (narra.items[p] && "image" in narra.items[p] && narra.items[p].image !== "") {
				var selected = "";
				var fixedImageURL = narra.items[p].image.replace('http:', 'https:').replace('Special:FilePath', 'Special:Redirect/file').replace('/wiki/', '/w/index.php?title=')
				if ("media" in narra.events[evid] && narra.events[evid].media.url === fixedImageURL) {
					selected = " selected ";
				}
				$select.append("<option value='" + fixedImageURL + "'" + selected + ">" + narra.items[p].enName + " image</option>");
			}
		});
		$("#" + slideID + " " + ".tl-media > select").remove();
		$("#" + slideID + " " + ".tl-media").append($select);
	
	}
}

// Switch event image
function switchThisImage(value, slideID) {
    var evid = slideID.split('slide-')[1];
    narra.events[evid].media = {};
    narra.events[evid].media.url = value;
    
    $("#" + slideID + " " + ".tl-media-image").attr("src", value);
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
// Fix buggy JavaScript parsing of dates
function fixYear(date, year) {
    date.setFullYear(year);
    return date;
}

