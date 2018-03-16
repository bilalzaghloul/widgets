	
	if (window._genesys.widgets.webchat) {
		window._genesys.widgets.webchat.chatButton = { enabled: true,
				template: false,
				openDelay: 1000,
				effectDuration: 300,
				hideDuringInvite: true
		};
	}

	console.log("window._genesys.widgets=" + JSON.stringify(window._genesys.widgets));
	