cs.service('LoginSrv', function(BaseSrv) {
    var self = this;

    self.isLogin = function(id, callback) {
        var url = "rest/cs/isLogin";
        BaseSrv.executeGet(url, null, id, callback);
    };

    self.login = function(user, pwd, callback) {

        var url = "rest/cs/login";
        var info = '{"username":"' + user + '","password":"' + pwd + '"}';
        var userInfo = eval('(' + info + ')');
        
        BaseSrv.executePost(url, userInfo, "", callback);
    };

    self.logout = function(id, callback) {
        var url = "rest/cs/logout";
        BaseSrv.executeGet(url, null, id, callback);
    };

    return self;
});

