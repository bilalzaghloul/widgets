<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
	<title>Chat To Vidyo Sample</title>
	<link id="click2vidyo-styles" href="css/ve4gwclick.css" type="text/css" rel="stylesheet"/>
	<link id="chat2vidyo-styles" href="css/ve4gwchat.css" type="text/css" rel="stylesheet"/>
	<link id="genesys-widgets-styles" href="css/widgets.min.css" type="text/css" rel="stylesheet"/>
	
	<script src="js/jquery.min.js"></script>
	<script src="js/ve4g/ve4gwinit.js"></script>
	<script src="js/ve4g/chat2vidyo_channel.js"></script>
	<script src="js/ve4g/chat2vidyo_sidebtn.js"></script>
	
	<script id="genesys-widgets-script" src="js/widgets.min.js"></script>
	
</head>
<body>
	<h2>Chat 2 Vidyo GMS Sample application</h2>
	<button id="btnChatToVidyo" onclick="_chat2vidyo.openChat()">ChatToVidyo</button>
	
	<h3>Back To Home Page</h3>
	<button onclick="window.location.href='index.jsp'">Home Page</button>
	
</body>
</html>