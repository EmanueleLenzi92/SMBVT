	// Load json slides and create Map
	var storymap_data = 'slide.json';


	// certain settings must be passed within a separate options object
	var storymap_options = {
		/* "start_at_slide" : 2, */
		"map_type" : "osm:standard"
		
	};

	var storymap = new KLStoryMap.StoryMap('mapdiv', storymap_data, storymap_options);
	window.onresize = function(event) {
		storymap.updateDisplay(); // this isn't automatic
	}
	
	
	

//Fix bug Slides storymapjs
 // array of slides (for bug visualization)
var arraySlide=[];
// index for current slide (for bug visualization)
var currentSlide=0 

	// Button NEXT. show next slide. Hide slide +1 and -1
	$(document).on('click','.vco-slidenav-next',function(){
		
		
		// remove class active for this old marker
		$( ".leaflet-marker-icon:eq("+currentSlide+")" ).removeClass('activeMarker')
		
		currentSlide++
		
		// add class active for actual new marker
		$( ".leaflet-marker-icon:eq("+currentSlide+")" ).addClass('activeMarker')
		
		// show next slide and make it clickable (for slide that cover map)
		arraySlide[currentSlide].show();
		arraySlide[currentSlide].find('.vco-slide-content').css( 'pointer-events', 'auto' );
		
		// hide previus and next slid and doesn't make it clickable
		if (typeof arraySlide[currentSlide-1] !== 'undefined') {
			arraySlide[currentSlide-1].hide();
			arraySlide[currentSlide-1].find('.vco-slide-content').css( 'pointer-events', 'none' );
			

		}
		if (typeof arraySlide[currentSlide+1] !== 'undefined') {
			arraySlide[currentSlide+1].hide();
			arraySlide[currentSlide+1].find('.vco-slide-content').css( 'pointer-events', 'none' );
		}


		
		// adjust media video bug if reduce window 
		if(arraySlide[currentSlide].find('.vco-media-content iframe').height() == 0){
			$('.vco-media-content iframe').css("height", "100vh")
		} 

	})
	
	// Button PREVIUS: show previus slide. Hide slide +1 and -1
	$(document).on('click','.vco-slidenav-previous',function(){
		
		// remove class active for this old marker
		$( ".leaflet-marker-icon:eq("+currentSlide+")" ).removeClass('activeMarker')
		
		currentSlide--
		
		// add class active for actual new marker
		$( ".leaflet-marker-icon:eq("+currentSlide+")" ).addClass('activeMarker')
		
		
		arraySlide[currentSlide].show();
		arraySlide[currentSlide].find('.vco-slide-content').css( 'pointer-events', 'auto' );
		
		if (typeof arraySlide[currentSlide-1] !== 'undefined') {
			arraySlide[currentSlide-1].hide();
			arraySlide[currentSlide-1].find('.vco-slide-content').css( 'pointer-events', 'none' );
		}
		if (typeof arraySlide[currentSlide+1] !== 'undefined') {
			arraySlide[currentSlide+1].hide();
			arraySlide[currentSlide+1].find('.vco-slide-content').css( 'pointer-events', 'none' );
		}


		// adjust media video bug if reduce window 
		if(arraySlide[currentSlide].find('.vco-media-content iframe').height() == 0){
			$('.vco-media-content iframe').css("height", "100vh")
		} 
		

	})  
	
	// Button Beginning: show first slide. hide the previus
	$(document).on('click','.vco-menubar-button:eq(1)',function(){
				
		arraySlide[currentSlide].hide();
		arraySlide[currentSlide].find('.vco-slide-content').css( 'pointer-events', 'none' );
		
		// remove class active for this old marker
		$( ".leaflet-marker-icon:eq("+currentSlide+")" ).removeClass('activeMarker')
		
		arraySlide[0].show();
		arraySlide[0].find('.vco-slide-content').css( 'pointer-events', 'auto' );
		
		$( ".leaflet-marker-icon:eq(0)" ).addClass('activeMarker')
		
		currentSlide=0;
		
		
	})


// when map is loaded, create array of slides, and put click on the markers
var checkExist = setInterval(function() {
   if ($('.leaflet-marker-icon').length) {
      console.log("map loaded");
	  
	 //append div legend on map
	 	 	 	 $('.vco-map-display').append('<div class="slideLegend" > <div class="legendRow"> <div class="ContainerLegenttext"><p><span style="color:#c34528">&#9632;</span> Current event</p></div>     <div class="ContainerLegenttext"><p><span style="color:#e6e600">&#9632;</span> Historical event</p></div>   <div class="ContainerLegenttext"><p><span style="color:#2eb82e">&#9632;</span> Natural event</p></div>   <div class="ContainerLegenttext"><p><span style="color:#ff9900">&#9632;</span> Valorisation event</p></div></div></div>')  
	  
	// hide all slides except the first
	$('.vco-slide:gt(0)').hide();
	
	
	// create array of slides 
	$('.vco-slider-item-container .vco-slide').each(function(index, element) {
		arraySlide[index]= $(this)
	});
	
	// all slide not clickable expcept the first (for slides that cover the map)
	$('.vco-slider-container').css( 'pointer-events', 'none' );
	arraySlide[currentSlide].find('.vco-slide-content').css( 'pointer-events', 'auto' );
	
	// first marker active
	$( ".leaflet-marker-icon:eq(0)" ).addClass('activeMarker')
      
	 // put click on all markers (show slide of clicked marker and make it clickable; hide the previus)
 	  $('.leaflet-marker-pane .leaflet-marker-icon').each(function(index, element) {
		  
		  //append click on marker
		$('.leaflet-marker-icon:eq(' +index+ ')').on('click', function(){
			
			arraySlide[currentSlide].hide();
			arraySlide[currentSlide].find('.vco-slide-content').css( 'pointer-events', 'none' );
			
			$( ".leaflet-marker-icon:eq("+currentSlide+")" ).removeClass('activeMarker')
			
			arraySlide[index].show();
			arraySlide[index].find('.vco-slide-content').css( 'pointer-events', 'auto' );
			
			if(arraySlide[index].find('.vco-media-content iframe').height() == 0){
				$('.vco-media-content iframe').css("height", "100vh")
			} 
			
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