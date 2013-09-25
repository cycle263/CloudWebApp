cs.service('ReportSrv', function(BaseSrv) {
    var self = this;
    
    /***取得整月的紀錄,速度較慢*/
    self.GetUsage = function(sessionId, type, startTime, endTime, callback)
    {
        var url = "rest/cs/usage/" + type + "/list/" + startTime + "/to/" + endTime;
        BaseSrv.executeGet(url,null,sessionId,callback);
    }

    return self;    
});