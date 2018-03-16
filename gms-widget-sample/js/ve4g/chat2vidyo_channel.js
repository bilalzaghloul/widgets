	_chat2vidyo = window._chat2vidyo || {};
	
	window._genesys.widgets.main.plugins.push('cx-webchat');
	window._genesys.widgets.main.plugins.push('cx-webchat-service');
	
	window._genesys.widgets.webchat = {
		apikey: "",
	    dataURL: "http://appsrv6:6040/genesys/2/chat/request-chat",
	    userData: {}
	};
	
	var oChat2Vidyo;
	
	//browser detection
    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';
    // At least Safari 3+: "[object HTMLElementConstructor]"
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;
    // Chrome 1+
    var isChrome = !!window.chrome && !!window.chrome.webstore;
    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!window.CSS;
	
    
    
	if(!window._genesys.widgets.extensions){
 		window._genesys.widgets.extensions = {};
	}

	window._genesys.widgets.extensions["Chat2Vidyo"] = function($, CXBus, Common){
		oChat2Vidyo = CXBus.registerPlugin('Chat2Vidyo');
		oChat2Vidyo.subscribe("WebChat.opened", function(e){ 
			console.log("INFO: Webchat Opened "); 
			$( "ul" ).append('<li class="option video i18n" tabindex="0" onclick="requestVideo()">Start Video</li>');
			console.log( $( "li" ).get() );
		});
		
		oChat2Vidyo.command('WebChatService.configure', {
			id: '1111',
			apikey: '12345',
			dataURL: 'http://appsrv6:6040/genesys/2/chat/request-chat',
			serverUrl: 'http://appsrv6:6040/server',
			endPoint: 'http://appsrv6:6040/endPoint',
			cometD: false,
			userData: {},
			ajaxTimeout: 5000,
			pollExceptionLimit: 5000,
			restoreTimeout: 3000
		
		}).done(function(e){
			console.log("INFO: WebChatService configured successfully " + e);
		}).fail(function(e){
			console.log("ERROR: WebChatService failed to configure " + e);
		});
		
		oChat2Vidyo.subscribe('WebChatService.messageReceived', function(e){
			
			console.log("INFO: WebChatService.messageReceived " + JSON.stringify(e));
			
			if (e.data.messages[0].type) {
				if (e.data.messages[0].type == "ParticipantJoined") {
					if (e.data.messages[0].from) {
						if (e.data.messages[0].from.type == "Client") {
							console.log("INFO: Client Joined " + e.data.messages[0].from.name);
							if (e.data.messages[0].from.name)
								_chat2vidyo.guestName = e.data.messages[0].from.name;
						}
					}
				}
			}
			
			if (e.data.messages[0].text) {
				console.log("INFO: WebChatService.messageReceived.text " + e.data.messages[0].text);
				processMessage(e.data.messages[0].text);
			}
		});
		
		oChat2Vidyo.subscribe('WebChatService.ended', function(e){ console.log("INFO: WebChatService.ended " + JSON.stringify(e)); _chat2vidyo.guestName = 'Guest'; });
		
		oChat2Vidyo.command('ChannelSelector.configure', {
			"channels": [{
				"enable":true, 
				"clickCommand":"WebChat.open",
				"readyEvent":"WebChat.ready","displayName":"Chat","i18n":"Chat Title",
				"icon":"chat","html":"",
				"ewt":{
					"display":false,"queue":"test","availabilityThresholdMin":200,"availabilityThresholdMax":300,"hideChannelWhenThresholdMax":false
				}
			}
		]}).done(function(e){
			console.log("INFO: Channel Selector configured " + e);
				}).fail(function(e){
			console.log("ERROR: Channel Selector configuration FAILED " + e);
		});
		openChannelSelector();
		console.log("INFO: Vidyo configured ");
	};
	
	function processMessage(strMessage){
		if (strMessage.indexOf("Message:") > -1){
            if (strMessage.indexOf("flex.html?roomdirect.html") > -1){
                var linkIdx = strMessage.indexOf("http");
                var guestLink = strMessage.substring(linkIdx);
				console.log("INFO: Vidyo guestlink parsed " + guestLink);
				startVideo(guestLink);
            }
			if (strMessage.indexOf("/join/") > -1){
                var linkIdx = strMessage.indexOf("http");
                var guestLink = strMessage.substring(linkIdx);
				console.log("INFO: Vidyo guestlink parsed " + guestLink);
				startVideo(guestLink);
            }
            if (strMessage.indexOf("EndVidyoRequest") > -1 ){
                console.log("INFO: Message:EndVideoRequest, close vidyo session");
				stopVideo();
            }
        }
    }
	
	//build full guest link based on browser type
    function generateVidyoFrameSrc(guestLink){
        var vidyoSrc = "";
        if (isChrome || isFirefox) {
            vidyoSrc = 
                _chat2vidyo.webRtcUrl + "?portalUri=" + guestLink + "&guestName=" + _chat2vidyo.guestName;
        } else {
            vidyoSrc = _chat2vidyo.vidyoWebUrl + "?portalUri=" + guestLink + "&guestName=" + _chat2vidyo.guestName;
        }
		_chat2vidyo.guestLink = vidyoSrc;
		console.log("INFO: generateVidyoFrameSrc=" + _chat2vidyo.guestLink);
        return vidyoSrc;
    }
	
	function requestVideo() { 
		console.log("INFO: Start Video Clicked "); 
		sendMessage('Message:VidyoRequest');
	}
	
	var bodytoast = '<div id="vidyo_frame"><div id="vidyo_frame_div"><iframe id="chattovidyo_frame" class="vidyo_toast_frame"></iframe></div><div><button type="button" class="btn btn-default" onclick="openVideoView()">Maximize</button></div></div>';
	bodytoast += '<div id="vidyo_invite"><div class="btn-video-div"><button type="button" class="btn btn-primary" onclick="openVideoViewToast()">Open Embedded</button></div>';
	bodytoast += '<div class="btn-video-div"><button type="button" class="btn btn-primary" onclick="openVideoViewPopup()">Open Popup</button></div>';
	bodytoast += '<div class="btn-video-div"><button type="button" class="btn btn-default" onclick="ignoreVideoInvite()">Cancel</button></div></div>';
	
	var _vidyo_div;
	var _vidyo_invite;
	var vidyoSrc;
	
	function startVideo(guestLink) { 
		console.log("INFO: Start Video at guestlink " + guestLink);
		vidyoSrc = generateVidyoFrameSrc(guestLink);
		oChat2Vidyo.command('Toaster.open', {
			type: 'generic',
			title: 'Video is Established',
			body: bodytoast,
			controls: 'close',
			immutable: false
		}).done(function (e) {
			console.log("INFO: Click 2 Vidyo Toast Opened ");
			_vidyo_div = document.getElementById("vidyo_frame");
			_vidyo_div.style.display = "none";
			_vidyo_invite = document.getElementById("vidyo_invite");
			_vidyo_invite.style.display = "block";
				
		}).fail(function (e) {
			console.log("ERROR: Click 2 Vidyo Toast open FAILED " + JSON.stringify(e));
		});
	}
	
	function openVideoViewToast() {
		console.log("INFO: openVideoViewToast() guestLink=" + _chat2vidyo.guestLink);
		_vidyo_div.style.display = "block";
		_vidyo_invite.style.display = "none";
		frame = document.getElementById("chattovidyo_frame");
		if (frame) {
			console.log("INFO: Make frame chattovidyo_frame visible Opened source guestLink=" + _chat2vidyo.guestLink);
			frame.src = generateVidyoFrameSrc(_chat2vidyo.guestLink);
			frame.focus();
		} else {
			console.log("ERROR: Vidyo Frame not found");
		}
	}
	
	var _popup_style = "height=400, width=600, top=300, left=300, scrollbars=0";
	var _popup_label = "Video chat";
	
	function openVideoViewPopup() {
		console.log("showVideoOut open popup with _chat2vidyo.guestLink: "+_chat2vidyo.guestLink);
        _popup = window.open(_chat2vidyo.guestLink, _popup_label, _popup_style);
        _popup.onbeforeunload = function(e){
			return null;
        };
        _popup.focus();
        oChat2Vidyo.command('Toaster.close');
	}
	
	function ignoreVideoInvite() {
		console.log("ignoreVideoInvite open popup " + _chat2vidyo.guestLink);
		_chat2vidyo.guestLink = '';
		oChat2Vidyo.command('Toaster.close');
		sendMessage('Message:VidyoCancelled');
	}
	
	function openVideoView() {
		oChat2Vidyo.command('Toaster.close');
		var overlaybody = '<div class="cx-widget ark cx-common-container cx-theme-dark"><div class="cx-titlebar"><div class="cx-title i18n">Video View<h2></div>';
		overlaybody += '<div id="vidyo_div"><iframe id="overlay_vidyo_frame"></iframe></div>';
		overlaybody += '<div><button type="button" class="btn btn-default" onclick="closeVideoView()">Close</button></div>';
		overlaybody += '</div>';
		
		oChat2Vidyo.command('Overlay.open', {
			html: overlaybody,
			immutable: false,
			group: false,
			controls: 'close'
		}).done(function(e){
			console.log("INFO: Overlay Opened");
			
			frame = document.getElementById("overlay_vidyo_frame");
			if (frame) {
				console.log("INFO: Make frame overlay_vidyo_frame visible Opened source _chat2vidyo.guestLink=" + _chat2vidyo.guestLink);
				frame.src = _chat2vidyo.guestLink;
				frame.width = 600;
				frame.height = 380;
				frame.style.display = "block";
				frame.focus();
			}
			
		}).fail(function(e){
			console.log("ERROR: Overlay Open FAILED " + e);
		});
	};
	
	function stopVideo() { 
	
		try
		{
			if(frame) {
				frame.src = '';
				frame = null;
			}
		} catch (e) {
			console.log("WARN: Frame destroy error" + e);
		}
	
		console.log("INFO: Video Stopped do cleanup"); 
		oChat2Vidyo.command('Toaster.close').done(function (e) {
			_chat2vidyo.guestLink = '';
			console.log("INFO: Chat 2 Vidyo Toast Closed ");
		}).fail(function (e) {
			console.log("ERROR: Chat 2 Vidyo Toast open FAILED " + JSON.stringify(e));
		});
		
		oChat2Vidyo.command('Overlay.close').done(function (e) {
			_chat2vidyo.guestLink = '';
			console.log("INFO: Chat 2 Vidyo Overlay Closed ");
		}).fail(function (e) {
			console.log("ERROR: Chat 2 Vidyo Overlay open FAILED " + JSON.stringify(e));
		});
		
	}
	
	function closeVideoView() {
		oChat2Vidyo.command('Overlay.close').done(function(e1){
			oChat2Vidyo.command('ChannelSelector.open').done(function(e1){
				console.log("INFO: ChannelSelector Opened ");
			}).fail(function(e){
				console.log("ERROR: ChannelSelector Open FAILED " + JSON.stringify(e1));
			});
		}).fail(function(e){
			console.log("ERROR: ChannelSelector Open FAILED " + JSON.stringify(e1));
		});
	};
	
	function openChannelSelector() {
		oChat2Vidyo.command('ChannelSelector.open').done(function(e1){
			console.log("INFO: ChannelSelector Opened ");
		}).fail(function(e){
			console.log("ERROR: ChannelSelector Open FAILED " + JSON.stringify(e1));
		});
	}

	function sendMessage(textSend) {
		oChat2Vidyo.command('WebChatService.sendMessage', {message: textSend}
		).done(function(e){
			console.log("INFO: WebChatService sendMessage" + e);
		}).fail(function(e){
			console.log("ERROR: WebChatService failed to send a message " + e);
		});
	};
		
(function (window){
	
	var _chat2vidyo = {
		guestName : 'guest',
		guestLink : '',
		webRtcUrl : "https://apps.vidyoclouddev.com/ve4genesys/simple/index.html",
		vidyoWebUrl : "https://apps.vidyoclouddev.com/ve4genesys/dual/index.html"
	}
	
	_chat2vidyo["openChat"] = function openChat() { 
		console.log("INFO: Chat Open "); 
		oChat2Vidyo.command('WebChat.open').done(function (e) {
			console.log("INFO: Click 2 Vidyo WebChat.open Opened ");
		}).fail(function (e) {
			console.log("ERROR: Click 2 Vidyo WebChat.open FAILED " + JSON.stringify(e));
		});
	}
	
	window["_chat2vidyo"] = _chat2vidyo;
}) (window);
	