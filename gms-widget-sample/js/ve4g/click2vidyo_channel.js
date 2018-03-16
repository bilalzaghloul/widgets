_click2vidyo = window._click2vidyo || {};

(function (window){
	var oVidyo;

	if(!window._genesys.widgets.extensions){
 		window._genesys.widgets.extensions = {};
	}

	window._genesys.widgets.extensions["Vidyo"] = function($, CXBus, Common){
		oVidyo = CXBus.registerPlugin('Vidyo');
		
		oVidyo.command('ChannelSelector.configure', {
			"channels": [{
				"enable":true, 
				"clickCommand":"Vidyo.open",
				"readyEvent":"Vidyo.ready","displayName":"Video","i18n":"VideoTitle",
				"icon":"videochat","html":"",
				"ewt":{
					"display":false,"queue":"test","availabilityThresholdMin":200,"availabilityThresholdMax":300,"hideChannelWhenThresholdMax":false
				}
			}
		]}).done(function(e){
			console.log("INFO: Channel Selector configured " + e);
			
		}).fail(function(e){
			console.log("ERROR: Channel Selector configuration FAILED " + e);
		});
		
		oVidyo.registerCommand("open", function(e){openVidyo();});
		oVidyo.registerCommand("show", function(e){_click2vidyo.click2VidyoToast();});
		oVidyo.registerEvents(["ready"]);
		oVidyo.subscribe("App.ready", function(e){console.log("INFO: Vidyo.ready " + JSON.stringify(e))});
		oVidyo.republish("ready");
		
		console.log("INFO: Vidyo configured ");
		openChannelSelector()
	};
	
	var toasterBody = '<div id="vidyoSubmit"><table><tr><th><label class="control-label i18n">First Name </label></th><td><input class="form-control i18n" id="vfirstname" placeholder="Optional" type="text"></td></tr>';
	toasterBody += '<tr><th><label class="control-label i18n">Last Name </label></th><td><input class="form-control i18n" maxlength="100" id="vlastname" placeholder="Optional" type="text"></td></tr>';
	toasterBody += '<tr><th><label class="control-label i18n">Email </label></th><td><input class="form-control i18n" maxlength="100" id="vemail" placeholder="Optional" type="email"></td></tr>';
	toasterBody += '<tr><th><label class="control-label i18n">Subject </label></th><td><input class="form-control i18n" maxlength="100" id="vsubject" placeholder="Optional" type="text"></td></tr>';
	toasterBody += '<tr><th><label class="control-label i18n">Enable Popup?&nbsp</label></th><td><input id="isPopupWindow" type="checkbox" value="0" onchange="_vidyo.isPopup()"></td></tr></table></div>';
	toasterBody += '<div id="vidyoWait" class="vidyoWait"><div class="cx-body">Please wait for an agent</div><div><div class="vidyo-cancel-btn-container">';
	toasterBody += '<button id="vidyoCancel" type="button" class="btn btn-default" onclick="_vidyo.cancel()">Cancel</button></div></div>';
	
	var _vidyoWait;
	var _vidyoSubmit;
	var _vidyoCancel;
	var _vidyoErr;
	var _fname;
	var _lname;
	var _email;
	var _topic;
	
	function openVidyo() {
		console.log("INFO: openVidyo toaster command ");
		oVidyo.command('Toaster.open', {
 			type: 'generic',
			title: 'Click To Vidyo',
			body: toasterBody,
			icon: 'video',
			controls: 'close',
			immutable: false,
			buttons:{
				type: 'binary',
				primary: 'Send',
				secondary: 'Close'
			}
		}).done(function(e){
			console.log("INFO: Toaster Opened ");
			//oVidyo.registerEvents(["opened"]);
			//oVidyo.subscribe("App.opened", function(e){console.log("INFO: Vidyo.opened ")});
			//oVidyo.republish("opened");
			
			_vidyoWait = document.getElementById("vidyoWait");
			_vidyoWait.style.display = "none";
			
			_fname = document.getElementById("vfirstname");
			_lname = document.getElementById("vlastname");
			_email = document.getElementById("vemail");
			_topic = document.getElementById("vsubject");
			
			$(e.html).find(".btn.btn-default").click(function(){
                oVidyo.command('Toaster.close');
				console.log("INFO: Toaster close executed ");
            });
            $(e.html).find(".btn.btn-primary").click(function(){
				_vidyoSubmit = document.getElementById("vidyoSubmit");
				_vidyoSubmit.style.display = "none";
				_vidyoWait.style.display = "block";
				_vidyoCancel = document.getElementById("vidyoCancel");
				if (_vidyo) {
					if (_fname)
						_vidyo.firstName = _fname.value;
					if (_lname)
						_vidyo.lastName = _lname.value;
					if (_email)
						_vidyo.email = _email.value;
					if (_topic)
						_vidyo.topic = _topic.value;
					
					_vidyo.clickToVideo();
				}
				else
					console.log("ERROR: Failed to invoke clickToVideo, _vidyo is null ");
            });
		}).fail(function(e){
			console.log("ERROR: Toaster Open FAILED " + JSON.stringify(e));
		});
	};
	
	function openChannelSelector() {
		oVidyo.command('ChannelSelector.open').done(function(e1){
			console.log("INFO: ChannelSelector Opened ");
		}).fail(function(e){
			console.log("ERROR: ChannelSelector Open FAILED " + JSON.stringify(e1));
		});
	};

		
	_click2vidyo["closeToast"] = function(){
		oVidyo.command('Toaster.close').done(function (e) {
			console.log("INFO: Click 2 Vidyo Toast Closed ");
           }).fail(function (e) {
			console.log("ERROR: Click 2 Vidyo Toast close FAILED " + JSON.stringify(e));
           });
	};
	
	var bodytoast = '<div><iframe id="click_vidyo_frame" class="vidyo_toast_frame"></iframe></div><div><button type="button" class="btn btn-default" onclick="_click2vidyo.openVideoView()">Maximize</button></div>';
	var bodyerror = '<div id="vidyoErr" class="vidyoErr"><div class="cx-body">Failed to create Vidyo Session</div></div>';
	
	//opens toast with IFrame
	_click2vidyo["click2VidyoToast"] = function(){
		oVidyo.command('Toaster.close').done(function (e) {
			console.log("INFO: Click 2 Vidyo Toast Closed ");
			oVidyo.command('Toaster.open', {
				type: 'generic',
				title: 'Video is Established',
				body: bodytoast,
				controls: 'close',
				immutable: false
			}).done(function (e) {
				console.log("INFO: Click 2 Vidyo Toast Opened ");
				frame = document.getElementById("click_vidyo_frame");
				if (frame) {
					console.log("INFO: Make frame click_vidyo_frame visible Opened source _vidyo.vidyoWebSrc=" + _vidyo.vidyoWebSrc);
					frame.src = _vidyo.vidyoWebSrc;
					frame.focus();
				} else {
					console.log("ERROR: Vidyo Frame not found");
				}
			}).fail(function (e) {
				console.log("ERROR: Click 2 Vidyo Toast open FAILED " + JSON.stringify(e));
			});
		}).fail(function (e) {
			console.log("ERROR: Click 2 Vidyo Toast close FAILED " + JSON.stringify(e));
			
        });
	};
		
	_click2vidyo["openVideoView"] = function openVideoView() {
		frame.src = '';
		frame = null;
		
		oVidyo.command('Toaster.close');
		
		var overlaybody = '<div class="cx-widget ark cx-common-container cx-theme-dark"><div class="cx-titlebar"><div class="cx-title i18n">Video View<h2></div>';
		overlaybody += '<div id="vidyo_div"><iframe id="vidyo_frame2"></iframe></div>';
		overlaybody += '<div><button type="button" class="btn btn-default" onclick="_click2vidyo.closeVideoView()">Close</button></div>';
		overlaybody += '</div>';
		
		oVidyo.command('Overlay.open', {
			html: overlaybody,
			immutable: false,
			group: false,
			controls: 'close'
		}).done(function(e){
			console.log("INFO: Overlay Opened");
			
			frame = document.getElementById("vidyo_frame2");
			if (frame) {
				console.log("INFO: Make frame "+_vidyo.frame_id+" visible Opened source _vidyo.vidyoWebSrc=" + _vidyo.vidyoWebSrc);
				frame.src = _vidyo.vidyoWebSrc;
				frame.width = 600;
				frame.height = 380;
				frame.style.display = "block";
				frame.focus();
			}
			
		}).fail(function(e){
			console.log("ERROR: Overlay Open FAILED " + e);
		});
	};
	
	_click2vidyo["errorVideoView"] = function errorVideoView() {
		console.log("INFO: execute error View function ");
		oVidyo.command('Toaster.close').done(function (e) {
			console.log("INFO: Click 2 Vidyo Toast Closed ");
			oVidyo.command('Toaster.open', {
				type: 'generic',
				title: 'Video routing error',
				body: bodyerror,
				controls: 'close',
				immutable: false
			}).done(function (e) {
				console.log("INFO: Click 2 Vidyo errorVideoView Opened ");
			}).fail(function (e) {
				console.log("ERROR: Click 2 Vidyo errorVideoView open FAILED " + JSON.stringify(e));
			});
		}).fail(function (e) {
			console.log("ERROR: Click 2 Vidyo errorVideoView close FAILED " + JSON.stringify(e));
        });
	};
	
	_click2vidyo["closeVideoView"] = function closeVideoView() {
		oVidyo.command('Overlay.close').done(function(e1){
			oVidyo.command('ChannelSelector.open').done(function(e1){
				console.log("INFO: ChannelSelector Opened ");
			}).fail(function(e){
				console.log("ERROR: ChannelSelector Open FAILED " + JSON.stringify(e1));
			});
		}).fail(function(e){
			console.log("ERROR: ChannelSelector Open FAILED " + JSON.stringify(e1));
		});
	};
	
	_click2vidyo["startVidyo"] = function startVidyo() {
		oVidyo.command('Vidyo.open');
	}
	
	
	window["_click2vidyo"] = _click2vidyo;
}) (window);
	