//script prepared by Robert Hostacny version 20170725
//define server side properties
var _server_uri="https://192.168.2.129:8012/VidyoServer";
var script=_server_uri+"/scripts/vidyo.min.js";
var buildversion = "20171013";

window._gv =  window._gv || {};
	_gv.config = {
	serverUrl:_server_uri, //vidyo server host and https port
	debug:true,
	doNotUseWS:true
};
_vidyo = window._vidyo || {};
$("head").append('<script type="text/javascript" src="' + script + '"></script>');

(function (window){
	var _guestUri;									//url for guest access to meeting room
	var _popup;										//popup window
	var _popup_style = "height=600, width=800, top=300, left=300, scrollbars=0";
	var _popup_label = "Video chat";
	var frame;										//iframe for embedded mode
	var _frame_style = "";
	var _frame_width = 650;
	var _frame_height = 700;
	//var _topic = "NONE";
	
	var _vidyo_tmp = { 
		debug : true,
		firstName : "",
		lastName : "",
		email : "",
		topic : "",
		checkbox_id : "isPopupWindow",
		tovideo_button_id : "click2videoBtnId",
		cancel_button_id : "cancelClick2videoBtnId",
		userdataload : "",
		is_popup : false,
		webRtcUrl : "https://apps.vidyoclouddev.com/ve4genesys/simple/index.html",
		vidyoWebUrl : "https://apps.vidyoclouddev.com/ve4genesys/dual/index.html",
		vidyoWebSrc : ""
	};
		
	log("Click to vidyo client build "+buildversion+", compatible with Genesys Vidyo Server 1.2.1.1")
	for (var key in _vidyo_tmp) {
		if (_vidyo_tmp.hasOwnProperty(key)) {
			if (!_vidyo[key])
				_vidyo[key] = _vidyo_tmp[key];
			log("    " + key + ":" + _vidyo[key]);
		}
	}

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
    
    var _click2videoCheck;
	var _click2videoCancel;
	var _click2videoErrorCb;
	var _click2videoCmb;
	
	//html methods
    _vidyo["clickToVideo"] = function(data, onError){
		_click2videoCheck = document.getElementById(_vidyo.checkbox_id);
		_click2videoCancel = document.getElementById(_vidyo.cancel_button_id);
		//_click2videoCmb = document.getElementById(_vidyo.cmb_topic_id);
        clickToVideoFunction(data, onError);
    };
    
    _vidyo["cancel"] = function(){
        log("Cancel method invoked");
        try{
            window._gv.api.cancel();
        }catch(e){
            onErrorFn({message:"window._gv.api.cancel: "+e});
        }
    };
	
	_vidyo["isPopup"] = function(){
		_click2videoCheck = document.getElementById(_vidyo.checkbox_id);
		if (_click2videoCheck.checked)
			_vidyo.is_popup = true;
		else
			_vidyo.is_popup = false;
		log("_vidyo[isPopup]: "+_vidyo.is_popup);
	};
	
	_vidyo["close"] = function(){
		_vidyo.is_popup = false;
	};
	
	//click to vidyo server 
	function clickToVideoFunction(data, onError){
        _click2videoErrorCb = onError
        cleanUp();
        var onErrorFn = function(err){
			error("clickToVideoFunction: "+err.message);
            if (_click2videoErrorCb)
                _click2videoErrorCb(err);
			
			if (_click2vidyo)
				_click2vidyo.errorVideoView();
			else
				log("_click2vidyo is null ");
        }
        try{
        	if (_vidyo.firstName == "" && _vidyo.lastName == "")
        		_vidyo.firstName = "Guest";
            var userData = {firstName:_vidyo.firstName,lastName:_vidyo.lastName,email:_vidyo.email,topic:_vidyo.topic};
            data = userData;
            window._gv.api.clickToVidyo(data, showClickToVideo, onErrorFn);
        }catch(e){
			log("Error from Vidyo Server")
            onErrorFn({message:"window._gv.api.clickToVidyo: "+JSON.stringify(e)});
        }        
    }
	
	//callback from genesys vidyo server
    function showClickToVideo(obj){
        log("Click to video event response received ["+JSON.stringify(obj)+"]");
        try{
            var obj2 = eval('('+obj.guestLink+')')
			_guestUri = obj2.url+'&key='+obj2.key
			showVideo();
        }catch(e){
            error(e);
        }
    }

	//build full guest link based on browser type
    function generateVidyoFrameSrc(guestLink){
        var vidyoSrc = "";
        if (isChrome || isFirefox) {
            vidyoSrc = 
                _vidyo.webRtcUrl + "?portalUri=" + guestLink + "&guestName=" + _vidyo.firstName + ' ' + _vidyo.lastName;
        } else {
            vidyoSrc = _vidyo.vidyoWebUrl + "?portalUri=" + guestLink + "&guestName=" + _vidyo.firstName + ' ' + _vidyo.lastName;
        }
        return vidyoSrc;
    }

	//show video accordingly to setting
    function showVideo(){
		//_vidyo.is_popup=true;
		log("showVideo vidyo popup: "+_vidyo.is_popup+" guestlink: "+_guestUri);
        if (_vidyo.is_popup)
			showVideoOut(_guestUri);
        else
            showVideoIn(_guestUri);
    }
	
	//show embedded video
	function showVideoIn(guestLink){
        var vidyoSrc = generateVidyoFrameSrc(guestLink);
		_vidyo.vidyoWebSrc = vidyoSrc;
		_click2vidyo.click2VidyoToast();
        log("Setting up video iframe src: "+vidyoSrc);
    }
    
	//show video in popup
	function showVideoOut(guestLink){
        var vidyoSrc = generateVidyoFrameSrc(guestLink);
        log("showVideoOut open popup with src: "+vidyoSrc);
        _popup = window.open(vidyoSrc, _popup_label, _popup_style);
		_click2vidyo.closeToast();
        _popup.onbeforeunload = function(e){
			return null;
        };
        _popup.focus();
    }
	
	//do cleanup before making new call
    function cleanUp(){
        log("Cleaning up resources and setting to the initial state...");
		if (frame) {
			frame.style.display = "none";
			frame.src = '';
		}
		if (_popup) {
			if(false == _popup.closed)
				_popup.close();
		}
    }
	
    function log(message) {
		if (window.console && _vidyo.debug) {
			window.console.log(currentTime()+' DEBUG: vidyo: ' + message);
		}
	}
    function warn(message) {
		if (window.console) {
			window.console.log(currentTime()+' WARN: vidyo: ' + message);
		}
	}
    function error(message) {
		if (window.console) {
			window.console.log(currentTime()+' ERROR: vidyo: ' + message);
		}
	}
	function currentTime(){
		var dateTime = new Date();
		return dateTime.getFullYear()+"-"+((dateTime.getMonth()<9)?"0"+(dateTime.getMonth()+1):(dateTime.getMonth()+1))+"-"+
			((dateTime.getDay()<10)?"0"+dateTime.getDay():dateTime.getDay())+"T"+
			((dateTime.getHours()<10)?"0"+dateTime.getHours():dateTime.getHours())+":"+
			((dateTime.getMinutes()<10)?"0"+dateTime.getMinutes():dateTime.getMinutes())+":"+
			((dateTime.getSeconds()<10)?"0"+dateTime.getSeconds():dateTime.getSeconds())+"."+dateTime.getMilliseconds();
	}

    window["_vidyo"] = _vidyo;
}) (window);

