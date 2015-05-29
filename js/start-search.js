$(document).ready(function(){

	var config = {
		siteURL		: 'google.com',
		searchSite	: false,
		type		: 'web',
		append		: false,
		perPage		: 5,			// A maximum of 8 is allowed by Google
		page		: 0				// The start page
	}
	
    // If hash in address, perform search
    if(window.location.hash) {
      var hash = window.location.hash.substring(1);
      $('#searchBar').val(hash);
      $('#header').slideUp();
	  $('#searchForm').css('paddingTop', '20px');
      googleSearch();
    }
    
	// Focusing the input text box:
	$('#searchBar').focus();

	$('#searchForm').submit(function(){
		$('#header').slideUp();
		$('#searchForm').css('paddingTop', '20px');
        googleSearch();
		return false;
	});
	
    function doSearch() {
        var s1 = $('#searchBar').val();
        var s2 = $('#fubar').val();
        var l1 = s1.length;
        var l2 = s2.length;
        if(l1 >= l2 + 1) {
            $('#searchBar').data('fu','bar');
            $('#fubar').val(s1)
            $('#header').slideUp();
			$('#searchForm').css('paddingTop', '20px');
            googleSearch();
        } else {
            if($('#searchBar').data('fu') == 'bar') {
                if(l1 <= l2 - 1){
                    if(l1 == 0){
                        $('#header').slideDown();
						$('#searchForm').css('paddingTop', '0px');
                        $('#resultsDiv').html('');
                        $('#fubar').val('fubar');
                        $('#searchBar').data('fu','');
                        window.location.hash = '';
                        return false;
                    }
                    $('#fubar').val(s1);
                    googleSearch();
                }
            }
        }
    }
    
    var inputTimer;
    $('#searchBar').bind('keyup', function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if(code != 13){
            clearTimeout(inputTimer);
            inputTimer = setTimeout(doSearch, 750);
        }
    });

    $("#s").keyup(function(){
	});
	
	function googleSearch(settings){
		//update the hash
        var hash = $('#searchBar').val();
        window.location.hash = hash;
        
		// If no parameters are supplied to the function,
		// it takes its defaults from the config object above:
		
		settings = $.extend({},config,settings);
		settings.term = settings.term || $('#searchBar').val();
		
		if(settings.searchSite){
			// Using the Google site:example.com to limit the search to a
			// specific domain:
			settings.term = 'site:'+settings.siteURL+' '+settings.term;
		}
		
		// URL of Google's AJAX search API
		var apiURL = '//ajax.googleapis.com/ajax/services/search/'+settings.type+'?v=1.0&callback=?';
		var resultsDiv = $('#resultsDiv');
		
		$.getJSON(apiURL,{q:settings.term,rsz:settings.perPage,start:settings.page*settings.perPage},function(r){
			
			var results = r.responseData.results;
			$('#more').remove();
			
			if(results.length){
				
				// If results were returned, add them to a pageContainer div,
				// after which append them to the #resultsDiv:
				
				var pageContainer = $('<div>',{class:'pageContainer'});
				
				for(var i=0;i<results.length;i++){
					// Creating a new result object and firing its toString method:
					pageContainer.append(new result(results[i]) + '');
				}
				
				if(!settings.append){
					// This is executed when running a new search, 
					// instead of clicking on the More button:
					resultsDiv.empty();
				}
				
				pageContainer.append('<div class="clear"></div>')
							 .hide().appendTo(resultsDiv)
							 .fadeIn('slow');
				
				var cursor = r.responseData.cursor;
				
				// Checking if there are more pages with results, 
				// and deciding whether to show the More button:
				
				if( +cursor.estimatedResultCount > (settings.page+1)*settings.perPage){
					//$('<div>',{id:'more'}).appendTo(resultsDiv).click(function(){
                    $('<a href="#" id="more">More results...</a>').appendTo(resultsDiv).click(function(){
						googleSearch({append:true,page:settings.page+1});
                        $(this).fadeOut();
                        return false;
					});
				}
			}
			else {
				
				// No results were found for this search.
				
				resultsDiv.empty();
				$('<p>',{class:'notFound',html:'No Results Were Found!'}).hide().appendTo(resultsDiv).fadeIn();
			}
		});
	}
	
	function result(r){
		
		// This is class definition. Object of this class are created for
		// each result. The markup is generated by the .toString() method.
		
		var arr = [];
		
		// GsearchResultClass is passed by the google API
		switch(r.GsearchResultClass){

			case 'GwebSearch':
				arr = [
					'<div class="webResult">',
					'<h3><a class="bracket" href="',r.unescapedUrl,'">',r.title,'</a></h3>',
					'<a class="bracket" class="url" href="',r.unescapedUrl,'">',r.unescapedUrl,'</a>',
                    '<p>',r.content,'</p>',
					'</div>'
				];
			break;
		}
		
		// The toString method.
		this.toString = function(){
			return arr.join('');
		}
	}
	
	
});
