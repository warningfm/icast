/*! iCast - Shoutcast & Icecast Web Player v1.2 (10/30/2018) - (c) 2018, Diego Navarro [dgone1988@gmail.com] */
(function ($) {
    "use strict";
	$(".icast").append('<div class="player-wpr"><div class="blur"></div><div class="player-ctr"><div class="listeners fa"></div><div class="album-cover-wpr"><div class="social-share-wpr animated"> Share<br> <a href="" target="_blank" class="social-link social-link-facebook fa animated" id="aface"></a> <a href="" target="_blank" class="social-link social-link-twitter fa animated" id="atwitter"></a></div><div class="album-cover animated"></div></div><div class="track-info-wpr"><div class="track-info-ctr"><div class="marquee"> <span class="artist-name animated">Artist</span><span> - </span><span class="songtitle animated">Songtitle</span></div></div></div><div class="ppBtn play-btn"></div><div class="servertitle"></div></div><div class="icons-left-wpr"><div class="icons-left icons-history fa"></div></div><div class="icons-right-wpr"><div class="icons-right icons-volume fa"></div><div class="icons-right icons-volumeM fa"></div></div> <input class="volume-slider" type="range" min="0" max="100" step="0.10" value="" autocomplete="off"><div class="history-wpr nodisplay"><div class="history-title">Last Played Songs</div></div></div>');
	$.fn.icast = function (options) {
        var settings = $.extend({
            // Default Settings
            URL: "",
			version: "2",
            stream_id: 1,
			mount_point: "", //For Icecast server
			type: "/;type=mp3",
            streampath: "/stream?icy=http",			
			enable_cors: false,
			cors: "https://zet.pluginsandthemes.ro",			
			artwork: true,
            logo: "img/logo.jpg",
			servertitle: "My Radio Title", //For Shoutcast v1 server
            show_listeners: true,    
            src: "",
            volume: 0.75,			
            autoplay: true
        }, options);
        var thisObj;
        thisObj = this;
        var audio;
        var ppBtn = $(".ppBtn", thisObj);		
        var cVolumeSlider = $(".volume-slider", thisObj);
        var cVolumeIcon = $(".icons-volume", thisObj);
		var cVolumeIconM = $(".icons-volumeM", thisObj);
        audio = new Audio();
        audio.volume = settings.volume;
        audio.preload = "auto";
		//$(".album-cover", thisObj).css({'background-image': 'url('+ settings.logo +')', 'background-size': '100% 100%'});
		//$(".blur", thisObj).css({'background': 'url('+ settings.logo +')', 'background-size': '100% 100%'});
		
		thisObj.each(function () {
            if(settings.autoplay == true){
                audio.autoplay = true;
            }
			
			if(settings.show_listeners == false) {
				$(".listeners", thisObj).addClass("nodisplay");
			}
			
            if(settings.version == 1) {
                audio.src = settings.URL + "/;type=mp3";
                settings.src = audio.src;				
                var dataURL = settings.cors + "/" + settings.URL + "/7.html";
                var hisURL = settings.cors + "/" + settings.URL + "/played.html";
                getSH(dataURL, hisURL);
            }

            else if(settings.version == 2) {
				audio.src = settings.URL + settings.streampath;
				settings.src = audio.src;
				if(settings.enable_cors == true) {
					var dataURL = settings.cors + "/" + settings.URL + "/stats?sid="+ settings.stream_id +"&json=1&callback=?";
					var hisURL = settings.cors + "/" + settings.URL + "/played?sid="+ settings.stream_id +"&type=json&callback=?";
				}
				else {
					var dataURL = settings.URL + "/stats?sid="+ settings.stream_id +"&json=1&callback=?";
					var hisURL = settings.URL + "/played?sid="+ settings.stream_id +"&type=json&callback=?";
				}
                getSH(dataURL, hisURL);				
            }

            else if(settings.version == "icecast") {
                audio.src = settings.URL + "/" + settings.mount_point;
                settings.src = audio.src;
				var dataURL = settings.cors + "/" + settings.URL + "/status-json.xsl";
                getIC(dataURL);				
            }
        });
		
		//Play/Pause Handling
        function togglePlying(tog, bool) {
            $(tog).toggleClass("playing", bool);
        }

        function playHandling() {
            if (audio.paused) {
                audio.src = settings.src;
                audio.play();
                var $playing = $('.ppBtn.playing');
                if ($(thisObj).find($playing).length === 0) {
                    $playing.click();
                }
            }
            else {
                audio.pause();
            }
        }
		
        $(audio).on("playing", function () {
            togglePlying(ppBtn, true);
            $(ppBtn).addClass("stop-btn");
            $(ppBtn).removeClass("play-btn");
        });
        $(audio).on("pause", function () {
            togglePlying(ppBtn, false);
            $(ppBtn).removeClass("stop-btn");
            $(ppBtn).addClass("play-btn");
        });		
        $(ppBtn, thisObj).on("click tap", function () {
            playHandling();
        });
		
        //Initial Visual Volume
        var volVal = audio.volume * 100;
        $(cVolumeSlider).val(volVal);
        $(".volValueTxt", thisObj).text(volVal + '%');
		volumeIcon();

		//Volume Icon Handling
        function volumeIcon() {
            if($(cVolumeSlider).val() < 55 && $(cVolumeSlider).val() > 0){
                $(cVolumeIcon).removeClass("icons-volume3 icons-volume1");
                $(cVolumeIcon).addClass("icons-volume2");				
            }
            if($(cVolumeSlider).val() == 0){
                $(cVolumeIcon).removeClass("icons-volume2 icons-volume3");
                $(cVolumeIcon).addClass("icons-volume1");				
            }
            else if($(cVolumeSlider).val() > 55){
                $(cVolumeIcon).removeClass("icons-volume1 icons-volume2");
                $(cVolumeIcon).addClass("icons-volume3");
            }
        }
		
		//Mobile Volume Icon Handling
		$(cVolumeIconM).on("click tap", function () {
            $(cVolumeIconM).toggleClass("icons-volumeM2");
			if ($(cVolumeIconM).hasClass("icons-volumeM2")) {
				audio.volume = 0;
            }
			else {
				audio.volume = settings.volume;
			}
        });
		
        //Volume Slider Handling
		$(".icons-volume", thisObj).on("click", function () {
            $(cVolumeSlider).toggleClass("display");
        });
		$(cVolumeSlider).mouseup(function(){
			$(this).removeClass("display");
		});
		
        if (navigator.appName == 'Microsoft Internet Explorer' ||  !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || (typeof $.browser !== "undefined" && $.browser.msie == 1))
			{
			cVolumeSlider.change('input', function(){
			    audio.volume = parseInt(this.value, 10)/100;
			    var volumeVal = audio.volume * 100;
                var volumeVal = Math.round(volumeVal);
			    $(".vol-value", thisObj).text('Volume:' + volumeVal + '%');
			    volumeIcon();
			}, false);
		
			}
		
        else {
            cVolumeSlider.on('input',  function () {
                var volumeVal = $(cVolumeSlider).val();
                audio.volume = volumeVal/100;		
                var volumeVal = Math.round(volumeVal);
                $(".volValueTxt", thisObj).text(volumeVal + '%')		
                volumeIcon();
            });			
        }
		
		//Format title and artist for album cover gathering
		function formatArtist(artist){
            artist = artist.toLowerCase();			
			artist = $.trim(artist);
            if (artist.includes("&")) {
                 artist = artist.substr(0, artist.indexOf(' &'));				
            }
            else if(artist.includes("feat")) {
                artist = artist.substr(0, artist.indexOf(' feat'));
            } else if (artist.includes("ft.")) {
                artist = artist.substr(0, artist.indexOf(' ft.'));
            }

            return artist;
        }
		
		function formatTitle(title){
            title = title.toLowerCase();            
			title = $.trim(title);
            if (title.includes("&")) {
                title = title.replace('&', 'and');				
            }
            else if(title.includes("(")) {
                title = title.substr(0, title.indexOf(' ('));
            } else if (title.includes("ft")) {
                title = title.substr(0, title.indexOf(' ft'));
            }

            return title;
        }
		
        function getSH(url, sHistory) {
		    if(settings.version == 1) {
			    function foo() {
                    $.ajax ({
				    type: 'GET',
                    dataType: 'html',
                    url: url,
                    success: 
                        function(data) {						
					        var result = $.parseHTML(data)[1].data;
						    var songtitle  = result.split(",")[6];
					        if (songtitle != getTag()) {
                                updateTag(songtitle);
                                var songtitleSplit = songtitle.split('-');
                                var artist = songtitleSplit[0];
                                var title = songtitleSplit[1];
                                updateArtist(artist);
                                updateTitle(title);
                                updateServerInfo(result);
                                if (settings.artwork == true) { 
									getCover(artist, title); 
								};
                                updateHistoryIC(artist, title);
                                FBShare(result);
                                TWShare2(result);								
                            }
                        },
					error: 
						function() { console.log("error getting metadata") }
                    })	
                }
			    foo();
		        setInterval(foo, 12000); 
			}
            
            else if(settings.version == 2) {
			    function foo() {
                    $.ajax ({
                    dataType: 'jsonp',
                    url: url,
                    success: 
                        function(result) {
                            if (result.songtitle != getTag()) {
                                updateTag(result.songtitle);
                                var songtitle = result.songtitle;
                                var songtitleSplit = songtitle.split('-');
                                var artist = songtitleSplit[0];
                                var title = songtitleSplit[1];
								var servertitle = result.servertitle;
                                updateArtist(artist);
                                updateTitle(title);
                                updateServerInfo(result);
								updateHistory(sHistory);
                                if (settings.artwork == true) { 
									getCover(artist, title); 
								};
                                FBShare(result);
                                TWShare(result);								
                            }
                        },
					error: 
						function() { console.log("error getting metadata") }
                    })	
                }
			        foo();
		            setInterval(foo, 12000); 
			}		
        }
		
		//Icecast
		function getIC(url) {		                
            if(settings.version == "icecast") {
			    function foo() {
                    $.ajax ({
                    dataType: 'json',
                    url: settings.cors + "/" + settings.URL + "/status-json.xsl",
                    success:					
                        function(data) {
                            var result = findMPData(data);
                            if (result.title != getTag()) {
                                updateTag(result.title);
						        var songtitle = result.title;
                                var songtitleSplit = songtitle.split('-');
                                var artist = songtitleSplit[0];
                                var title = songtitleSplit[1];
                                updateArtist(artist);
                                updateTitle(title);
						        if (settings.artwork == true) { 
									getCover(artist, title); 
								};
                                updateServerInfoIC(result);
								updateHistoryIC(artist, title);
								FBShare(result);
								TWShare3(result);
                            }
                        },
					error: 
						function() { console.log("error getting metadata") }
                   })	
                }
			    foo();
		        setInterval(foo, 12000); 
				
			}	
        }
		
		var icHis = new Array();
		
		function findMPData(data) {
            if (data.icestats.source.length === undefined){
                return data.icestats.source;
            }
            else{
                for (var i = 0; i < data.icestats.source.length; i++) {
                    var str = data.icestats.source[i].listenurl;

                    if (str.indexOf(settings.mount_point) >= 0) {
                        return data.icestats.source[i];
                    }
                }
            }
        }
		
		 //Update Track Info	
        function getTag() {
            return $(thisObj).attr("data-tag");
        }
		
		function updateArtist(name) {
            $(".artist-name", thisObj).text(name);
        }
		
        function updateTitle(name) {
            $(".songtitle", thisObj).text(name);
        }

        function updateTag(data) {
            $(thisObj).attr("data-tag", data);
        }
		
		//Album Cover Handling
		function getCover(artist, title) {		
			artist = formatArtist(artist);
			title = formatTitle(title);
            artist = encodeURI(artist);
            title = encodeURI(title);	
            var url = "https://itunes.apple.com/search?term==" + artist + "-" + title + "&media=music&limit=1";
            $.ajax ({
                dataType: 'jsonp',
                url: url,
                success:
                    function(data) {						
                        if (data.results.length == 1){							
                            cover = data.results[0].artworkUrl100;
                            cover = cover.replace('100x100', '400x400');
					    }
                        else {
                            var cover = settings.logo;
					    }
                        $(".album-cover", thisObj).css({'background-image': 'url('+ cover +')', 'background-size': '100% 100%'});
                        $(".album-cover", thisObj).addClass("bounceInDown");
                        setTimeout( function(){ 
                           $(".album-cover", thisObj).removeClass("bounceInDown");
                        }, 5000 );
                        //$(".blur", thisObj).css({'background': 'url('+ cover +')', 'background-size': '100% 100%'});
                    },				
                error: 
                    function() {
                        console.log("Error on track title " + encodeURI(title));
                    }
            })
        }
		
		//Update Server Info
		function updateServerInfo(result) {
			if(settings.version == 1) {
                $(".servertitle", thisObj).text(settings.servertitle);
				$(".listeners", thisObj).text(result.split(",")[0]);
            }
			
			else if(settings.version == 2) {
				$(".servertitle", thisObj).text(result.servertitle);
				$(".listeners", thisObj).text(result.currentlisteners);
			}
		}
		
		function updateServerInfoIC(data) {            
			$(".servertitle", thisObj).text(data.server_name);
			$(".listeners", thisObj).text(data.listeners);
        }
		
		//Update Song History
        function updateHistory(url) {
            $(".history ul li", thisObj).remove();			
            if(settings.version == 1){
			    //Do nothing
            }
			
			else if(settings.version == 2){
				$(".row-wpr", thisObj).remove();
				$.ajax ({
                dataType: 'jsonp',
                url: url,
                success: 
                    function(data) {
						data.length = 6;
                        for (var i = 1; i < data.length; i++) {
                            var rowNum = i;
							var listVal = rowNum;
                            var songtitle = data[i].title;
							var songtitleSplit = songtitle.split('-');
                            var artist = songtitleSplit[0];
                            var title = songtitleSplit[1];
                            $(".history-wpr", thisObj).append(
								"<div class='row-wpr'><div class='history-cover' id='row" + rowNum +"'></div><div class='history-track-info'><div class='history-songtitle'>" + title + "</div><div class='history-artist-name'>"+ artist + "</div></div><div class='rowNum'>"+ listVal + "</div></div>"
                            );
							
							if(settings.artwork == true) {
								getImageList(artist, title, rowNum);
							}
							else {
								$('#row'+ i , thisObj).css({"background-image": "url(" + settings.logo + ")", "background-size": "100% 100%"});
							}
                        }
						
                    }
                })
			}	
        }
		
		function updateHistoryIC(artist, title) {
            addToArray(artist, title);
            createHisList();
        }

        function addToArray(artist, title) {
            icHis.unshift({ar: artist, tt: title});
			icHis.length = icHis.length < 6 ? icHis.length : 6;
        }
		
		function createHisList(){
			$(".row-wpr", thisObj).remove();
            for(var i = 1; i < icHis.length; i++){
                var rowNum = i;
				var listVal = rowNum;
                var artist = icHis[i].ar;
                var title = icHis[i].tt;
                $(".history-wpr", thisObj).append(
					"<div class='row-wpr'><div class='history-cover' id='row" + rowNum +"'></div><div class='history-track-info'><div class='history-songtitle'>" + title + "</div><div class='history-artist-name'>"+ artist + "</div></div><div class='rowNum'>"+ listVal + "</div></div>"
                );
				if(settings.artwork == true) {
					getImageList(artist, title, rowNum);
				}
				else {
					$('#row'+ i , thisObj).css({"background-image": "url(" + settings.logo + ")", "background-size": "100% 100%"});
				}
            }
        }
		
		//Get image list for song history
		function getImageList(artist, title, i) {
			artist = formatArtist(artist);
			title = formatTitle(title);
            artist = encodeURI(artist);
            title = encodeURI(title);	
            var url = "https://itunes.apple.com/search?term==" + artist + "-" + title + "&media=music&limit=1";
			$.ajax ({
                dataType: 'jsonp',
                url: url,
                success:
                    function(data) {
						if (data.results.length == 1){							
                            cover = data.results[0].artworkUrl100;
                            cover = cover.replace('100x100', '400x400');
					    }
                        else {
                            var cover = settings.logo;
					    }
                        $('#row'+ i , thisObj).css({"background-image": "url(" + cover + ")", "background-size": "100% 100%"});
                    },
				error: 
				function() { console.log("#getImageList(), Error in loading history image list for "  + decodeURI(artist)) }
            })  
        }
		
		//Song history panel handling
		$(".icons-history", thisObj).on("click tap", function () {
            $(".icons-history", thisObj).toggleClass("icons-close");
			if (!$(".player-ctr", thisObj).hasClass("open")) {
				$(".player-ctr", thisObj).fadeOut(400);
				$(".history-wpr", thisObj).delay(600).fadeIn(400);
				$(".player-ctr", thisObj).addClass("open");
            }
			else if($(".player-ctr", thisObj).hasClass("open")) {
				$(".player-ctr", thisObj).removeClass("open");
				$(".history-wpr", thisObj).fadeOut(400);
				$(".player-ctr", thisObj).delay(600).fadeIn(400);
			}
        });
		
		// Share
		$(".album-cover-wpr", thisObj).hover(function () {
			$(".social-share-wpr", thisObj).toggleClass("display");
			$(".social-link-twitter", thisObj).toggleClass("bounceIn");
			$(".social-link-facebook", thisObj).toggleClass("bounceIn");
		})
		
        function FBShare(result) {
			var siteURL = window.location.href;
            var url = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(siteURL);
            $("#aface", thisObj).attr("href", url);
        }
		
		function TWShare(result) {
			var siteURL = window.location.href;
			var url = "https://twitter.com/home?status=I'm listening to " + result.songtitle + " @ " + siteURL;
			$("#atwitter", thisObj).attr("href", url);
		}
		
		function TWShare2(result) {
			var siteURL = window.location.href;
			var url = "https://twitter.com/home?status=I'm listening to " + result.split(",")[6] + " @ " + siteURL;
			$("#atwitter", thisObj).attr("href", url);
		}
		
		function TWShare3(result) {
			var siteURL = window.location.href;
			var url = "https://twitter.com/home?status=I'm listening to " + result.title + " @ " + siteURL;
			$("#atwitter", thisObj).attr("href", url);
		}
		
		//Mobile Volume Classes
		if( /Android|webOS|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent) ) {
			$(cVolumeIcon).addClass("nodisplay");
			$(cVolumeIconM).addClass("display");
			}
    };

})(jQuery);
