
cs.config(function($httpProvider) {
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
});

cs.service('Scroll', function($location, $anchorScroll) {
    var old = $location.hash();
    this.scrollTo = function(id) {
        $location.hash(id);
        $anchorScroll();
        $location.hash(old);
    };
});

//cs.service('sharedService', function($rootScope) {
//    var self = this;

//    self.message = {};

//    self.prepForBroadcast = function(msg) {
//        //        this.message = null;
//        this.message = msg;
//        this.broadcastItem();
//    };

//    self.broadcastItem = function() {
//        $rootScope.$broadcast('handleBroadcast');
//    };

//    return self;
//});

cs.service("BaseSrv", function($resource, globalValue) {
    var self = this;
    self.executeApi = function(url, method, body, isArr, sessionId, callback) {

        var res = null;
        var fullUrl = globalValue.url + url;
        if (url.indexOf("http://") == 0)
            fullUrl = url;
        if (sessionId != "" && sessionId != null)
            res = $resource(fullUrl, {}, { operation: { method: method, isArray: isArr, headers: { "jsessionid": sessionId}} });
        else
            res = $resource(fullUrl, {}, { operation: { method: method, isArray: isArr} });

        if (body != null) {
            res.operation(body, function(data) {
                callback(data);
            });
        }
        else {
            res.operation(function(data) {
                callback(data);
            });
        }
    };

    self.execute = function(url, method, body, sessionId, callback) {
        this.executeApi(url, method, body, false, sessionId, callback);
    };

    self.executeGet = function(url, body, sessionId, callback) {
        this.executeApi(url, "GET", body, false, sessionId, callback);
    };

    self.executePost = function(url, body, sessionId, callback) {
        this.executeApi(url, "POST", body, false, sessionId, callback);
    };

    self.executePut = function(url, body, sessionId, callback) {
        this.executeApi(url, "PUT", body, false, sessionId, callback);
    };
})

cs.service('dialogSrv', function($rootScope) {
    var title = 'Dialog Message',
        msg = 'Are you sure you want to do this operation?',
        btns = [{
            result: 'cancel',
            label: 'Cancel'
        }, {
            result: 'ok',
            label: 'Ok',
            cssClass: 'btn-primary'
        }];

    this.opts = {
        backdrop: true,
        keyboard: true,
        backdropClick: false,
        controller: 'dialogInfoCtrl',
        templateUrl: ''
    };

    this.configs = {};

    this.box = {
        title:'',
        content: ''
    };

    this.warnBox = function($dialog,url,ctrl){        
        this.opts.templateUrl = url ? url : 'common/warnBox.html';
        this.opts.controller = ctrl ? ctrl : 'warnBoxCtrl';        
        var d = $dialog.dialog(this.opts);        
        return d;
    };

    this.open = function($dialog, t, m) {
        t = t ? t : title;
        m = m ? m : msg;
        return $dialog.messageBox(t, m, btns, false).open();
    };
});