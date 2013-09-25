function checkLogin() {
    var loginInfos = {},
    	obj = { 'method': "GET", "url": 'http://10.16.140.102:8080/rest/cs/isLogin' };

    if (docCookies.hasItem("JSESSIONID")) {
        var sessionid = docCookies.getItem("JSESSIONID");

        obj.JSESSIONID = sessionid;

        try {
            requestFunc(obj);
        } catch (e) { }

        if (gVal.res && gVal.res.isLogin) {
            loginInfos.JSESSIONID = sessionid;
            loginInfos.username = gVal.res.user;
        }
    }
    if (loginInfos.JSESSIONID) return loginInfos;
    else return null;
}

var gVal = {
	'res': {}
};

function logout() {
    docCookies.removeItem("JSESSIONID");   
    location.hash = "#/login"
}

function requestFunc(json){
    var xhr = new XMLHttpRequest();
	
	xhr.onreadystatechange = function(){
		if(this.readyState === 4){
			if(this.status === 200 || this.status === 304){
				if(this.responseText) {gVal.res = JSON.parse(this.responseText);}
            }
		}
    };

    xhr.open(json.method, json.url, false);
	
	xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
	xhr.setRequestHeader('jsessionid', json.JSESSIONID);
	json.data = json.method == "POST" ? json.data : null;
	
	xhr.send(json.data);
}

function IndexOfObject(arr, filed, value){
    var i = 0, l = arr ? arr.length : 0;
    for(;i < l; i++){
        if(arr[i][filed] == value){
            return i;
        }
        return -1;
    }
}
function warnCommonFunc($dialog, dialogSrv, title, body) {
    if (!dialogSrv.configs.warnIsOpen) {
        var box = dialogSrv.warnBox($dialog).open();
        dialogSrv.box.title = title ? title : 'Warn Prompt';
        dialogSrv.box.content = body ? body : '';
        dialogSrv.configs.warnIsOpen = true;
        return box;
    }else{
        return false;
    }
}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

function MM_swapImgRestore() { //v3.0
    var i, x, a = document.MM_sr; for (i = 0; a && i < a.length && (x = a[i]) && x.oSrc; i++) x.src = x.oSrc;
}

function MM_preloadImages() { //v3.0
    var d = document; if (d.images) {
        if (!d.MM_p) d.MM_p = new Array();
        var i, j = d.MM_p.length, a = MM_preloadImages.arguments; for (i = 0; i < a.length; i++)
            if (a[i].indexOf("#") != 0) { d.MM_p[j] = new Image; d.MM_p[j++].src = a[i]; } 
    }
}

function MM_findObj(n, d) { //v4.01
    var p, i, x; if (!d) d = document; if ((p = n.indexOf("?")) > 0 && parent.frames.length) {
        d = parent.frames[n.substring(p + 1)].document; n = n.substring(0, p);
    }
    if (!(x = d[n]) && d.all) x = d.all[n]; for (i = 0; !x && i < d.forms.length; i++) x = d.forms[i][n];
    for (i = 0; !x && d.layers && i < d.layers.length; i++) x = MM_findObj(n, d.layers[i].document);
    if (!x && d.getElementById) x = d.getElementById(n); return x;
}

function MM_swapImage() { //v3.0
    var i, j = 0, x, a = MM_swapImage.arguments; document.MM_sr = new Array; for (i = 0; i < (a.length - 2); i += 3)
        if ((x = MM_findObj(a[i])) != null) { document.MM_sr[j++] = x; if (!x.oSrc) x.oSrc = x.src; x.src = a[i + 2]; }
}

//判斷字串開頭是否為指定的字
//回傳: bool
String.prototype.startsWith = function(prefix, ignoreCase) {
    var org = this;
    var des = prefix;

    if (ignoreCase) {
        org = this.toLowerCase();
        des = prefix.toLowerCase();
    }

    return (org.substr(0, des.length) === des);
}

function showInfo(info) {
    var info_body = document.getElementById("info_body"),
        info_div = document.getElementById("info_div");
    
    info_body.innerText = info;
    info_div.style.display = "block";

    setTimeout(function() {
        document.getElementById("info_div").style.display = "none";
    }, 10000);

};

function closeInfo(){
    document.getElementById("info_div").style.display = "none";    
}