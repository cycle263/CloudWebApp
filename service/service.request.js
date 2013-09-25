cs.service('RequestSrv', function(BaseSrv) {
    var self = this;

    self.GetRequestList = function(sessionId, callback) {

        var url = "rest/cs/req/list";
        BaseSrv.executeGet(url, null, sessionId, callback);

    };

    //************Get base system data ***********/

    self.GetZoneList = function(sessionId, callback) {
        var url = "rest/cs/req/zone/list";
        BaseSrv.executeGet(url, null, sessionId, callback);
    };

    self.GetSettingList = function(sessionId, callback) {
        var url = "rest/cs/req/setting/list";
        BaseSrv.executeGet(url, null, sessionId, callback);

    };

    self.GetDiskSettingList = function(sessionId, callback) {
        var url = "rest/cs/req/disksetting/list";
        BaseSrv.executeGet(url, null, sessionId, callback);

    };

    self.GetZoneSettings = function(zoneId, sessionId, callback) {
        var url = "rest/cs/req/zone/setting/list/" + zoneId;
        BaseSrv.executeGet(url, null, sessionId, callback);

    };

    self.GetNetworkListByZoneId = function(zoneId, sessionId, callback) {
        var url = "rest/cs/approve/network/list/zone/" + zoneId;
        BaseSrv.executeGet(url, null, sessionId, callback);

    };

    /***********Vm Set operation************************/

    self.GetVmSetList = function(sessionId, callback) {
        var url = "rest/cs/req/vmset/list";
        BaseSrv.executeGet(url, null, sessionId, callback);

    };

    self.GetZoneVmSetList = function(zoneId, sessionId, callback) {
        var url = "rest/cs/req/vmset/list/zone/" + zoneId;
        BaseSrv.executeGet(url, null, sessionId, callback);

    };

    self.AddVmSet = function(vmSetInfo, sessionId, callback) {
        var url = "rest/cs/sys/vmset/add";
        BaseSrv.executePost(url, vmSetInfo, sessionId, callback);

    };

    self.DeleteVmSet = function(vmSetId, sessionId, callback) {
        var url = "rest/cs/sys/vmset/delete/" + vmSetId;
        BaseSrv.execute(url, "DELETE", null, sessionId, callback);

    }

    /*1、**********create Vm workflow ********************/

    /**get vm request by id**/
    self.GetVMReqById = function(requestId, sessionId, callback) {
        var url = "rest/cs/req/vm/" + requestId;
        BaseSrv.executeGet(url, null, sessionId, callback);

    };


    //发送 ‘创建虚拟机’的请求
    self.CreateVMRequest = function(createVmRequestInfo, sessionId, callback) {
        var url = "rest/cs/req/vm";
        BaseSrv.executePost(url, createVmRequestInfo, sessionId, callback);

    };

    //发送 取消 ‘创建虚拟机’的请求
    self.CancelCVMReq = function(requestId, sessionId, callback) {
        var url = "rest/cs/req/vm/cancel/" + requestId;
        BaseSrv.executePut(url, null, sessionId, callback);

    };

    //发送 删除 ‘创建虚拟机’的请求
    self.DeleteCVMReq = function(requestId, sessionId, callback) {
        var url = "rest/cs/req/vm/delete/" + requestId;
        BaseSrv.execute(url, "DELETE", null, sessionId, callback);

    };

    /*2、*********delete vm workflow**********************/

    /**get delete vm request by id**/
    self.GetDVMReqById = function(requestId, sessionId, callback) {
        var url = "rest/cs/req/delvm/" + requestId;
        BaseSrv.executeGet(url, null, sessionId, callback);

    };

    //发送 ‘删除虚拟机’的请求
    self.DeleteVMRequest = function(deleteVmRequestInfo, sessionId, callback) {

        var url = "rest/cs/req/delvm";
        BaseSrv.executePost(url, deleteVmRequestInfo, sessionId, callback);

    };

    //发送 取消 ‘删除虚拟机’的请求
    self.CancelDVMReq = function(requestId, sessionId, callback) {
        var url = "rest/cs/req/delvm/cancel/" + requestId;
        BaseSrv.executePut(url, null, sessionId, callback);

    };

    //发送 删除 ‘删除虚拟机’的请求
    self.DeleteDVMReq = function(requestId, sessionId, callback) {

        var url = "rest/cs/req/delvm/delete/" + requestId;
        BaseSrv.execute(url, "DELETE", null, sessionId, callback);

    };

    /*3、*********create disk workflow**********************/

    /**get create disk request by id**/
    self.GetDiskReqById = function(requestId, sessionId, callback) {
        var url = "rest/cs/req/disk/" + requestId
        BaseSrv.executeGet(url, null, sessionId, callback);

    };

    //发送 ‘创建disk’的请求
    self.CreateDiskRequest = function(createDiskReqInfo, sessionId, callback) {
        var url = "rest/cs/req/disk";
        BaseSrv.executePost(url, createDiskReqInfo, sessionId, callback);

    };

    //发送 取消 ‘创建disk’的请求
    self.CancelCDiskReq = function(requestId, sessionId, callback) {

        var url = "rest/cs/req/disk/cancel/" + requestId;
        BaseSrv.executePut(url, null, sessionId, callback);

    };

    //发送 删除 ‘创建disk’的请求
    self.DeleteCDiskReq = function(requestId, sessionId, callback) {

        var url = "rest/cs/req/disk/delete/" + requestId;
        BaseSrv.execute(url, "DELETE", null, sessionId, callback);

    };

    self.GetComputerSettingSetList = function(sessionId, callback) {
        var url = "rest/cs/req/computersettingset/list";
        BaseSrv.executeGet(url, null, sessionId, callback);
    }

    self.AddComputerSettingSetList = function(settings, sessionId, callback) {
        var url = "rest/cs/sys/computersettingset/add";
        BaseSrv.executePost(url, settings, sessionId, callback);
    }

    self.DelComputerSettingSetList = function(settingsId, sessionId, callback) {
        var url = "rest/cs/sys/computersettingset/delete/" + settingsId;
        BaseSrv.execute(url, "DELETE", null, sessionId, callback);
    }

    self.ChangeVmResource = function(changeRequest, sessionId, callback) {
        var url = "rest/cs/req/updatevm";
        BaseSrv.executePost(url, changeRequest, sessionId, callback);
    }

    self.CancelChangeVmReq = function(requestId, sessionId, callback) {
        var url = "rest/cs/req/updatevm/cancel/" + requestId;
        BaseSrv.executePut(url, null, sessionId, callback);
    }

    self.DeleteChangeVmReq = function(requestId, sessionId, callback) {
        var url = "rest/cs/req/updatevm/delete/" + requestId; 
        BaseSrv.execute(url,"DELETE", null, sessionId, callback);
    }

    return self;
});

cs.service('ApproveSrv', function(BaseSrv) {

    var self = this;

    /////// approver operations

    /* get all approver list*/
    self.GetApproverList = function(sessionId, callback) {

        var url = "rest/cs/req/approver/list";
        BaseSrv.executeGet(url, null, sessionId, callback);

    };

    /*get it department approver list*/
    self.GetItApproverList = function(sessionId, callback) {

        var url = "rest/cs/sys/approver/it/lsit";
        BaseSrv.executeGet(url, null, sessionId, callback);

    };

    self.AddDeptApprover = function(account, department, sessionId, callback) {

        var url = "rest/cs/sys/approver/dep/add/" + account + "/" + department;
        BaseSrv.executePost(url, null, sessionId, callback);

    };


    self.DeleteDeptApprover = function(account, sessionId, callback) {
        var url = "rest/cs/sys/approver/dep/delete/" + account;
        BaseSrv.execute(url, "DELETE", null, sessionId, callback);

    };

    self.AddItApprover = function(account, department, sessionId, callback) {

        var url = "rest/cs/sys/approver/it/add/" + account + "/" + department;
        BaseSrv.executePost(url, null, sessionId, callback);

    };


    self.DeleteItApprover = function(account, sessionId, callback) {

        var url = "rest/cs/sys/approver/it/delete/" + account;
        BaseSrv.execute(url, "DELETE", null, sessionId, callback);

    };


    ////////Domain operations
    self.GetDomainList = function(sessionId, callback) {

        var url = "rest/cs/approve/domain/list";
        BaseSrv.executeGet(url, null, sessionId, callback);

    };

    self.AddDomain = function(domainItem, sessionId, callback) {

        var url = "rest/cs/sys/domain/add";
        BaseSrv.executePost(url, domainItem, sessionId, callback);

    }

    self.AddDomainByName = function(domainName, description, sessionId, callback) {

        var info = {
            domainName: domainName,
            description: description
        };

        var url = "rest/cs/sys/domain/add";
        BaseSrv.executePost(url, info, sessionId, callback);

    }

    self.DeleteDomain = function(domainId, sessionId, callback) {

        var url = "rest/cs/sys/domain/delete/" + domainId;
        BaseSrv.execute(url, "DELETE", null, sessionId, callback);

    }

    self.GetNonApproveReqList = function(sessionId, callback) {

        var url = "rest/cs/approve/list";
        BaseSrv.executeGet(url, null, sessionId, callback);

    };

    /****** agree create vm request **********/
    self.AgreeCVmReq = function(requestId, machineName, domain, networkId, comment, sessionId, callback) {
        domain = domain ? domain : 'domain';

        var body = {
            machineName: machineName,
            domain: domain,
            networkIds: networkId,
            comment: comment
        };

        var url = "rest/cs/approve/vm/" + requestId;
        BaseSrv.executePut(url, body, sessionId, callback);

    };

    /****** deny create vm request **********/
    self.DenyCVmReq = function(requestId, comment, sessionId, callback) {

        comment = comment ? comment : 'A request has been denied';
        var body = { 'comment': comment };

        var url = "rest/cs/approve/vm/" + requestId + "/deny";
        BaseSrv.executePut(url, body, sessionId, callback);
    };

    /********* view vm request **********/
    self.ViewCVmReq = function(requestId, sessionId, callback) {

        var url = "rest/cs/req/vm/" + requestId;
        BaseSrv.executeGet(url, null, sessionId, callback);

    };

    /****** agree delete vm request **********/
    self.AgreeDVmReq = function(requestId, comment, sessionId, callback) {

        var url = "rest/cs/approve/delvm/" + requestId;
        var body = { 'comment': comment };
        BaseSrv.executePut(url, body, sessionId, callback);

    };

    /****** deny delete vm request **********/
    self.DenyDVmReq = function(requestId, comment, sessionId, callback) {

        comment = comment ? comment : 'A request has been denied';
        var body = { 'comment': comment };

        var url = "rest/cs/approve/delvm/" + requestId + "/deny";
        BaseSrv.executePut(url, body, sessionId, callback);

    };

    /********* view delete vm request **********/
    self.ViewDVmReq = function(requestId, sessionId, callback) {

        var url = "rest/cs/req/delvm/" + requestId;
        BaseSrv.executeGet(url, null, sessionId, callback);

    };

    /****** agree create disk request **********/
    self.AgreeCDiskReq = function(requestId, comment, sessionId, callback) {

        var body = { 'comment': comment };
        var url = "rest/cs/approve/disk/" + requestId;
        BaseSrv.executePut(url, body, sessionId, callback);

    };

    /****** deny create disk request **********/
    self.DenyCDiskReq = function(requestId, comment, sessionId, callback) {
        comment = comment ? comment : 'A request has been denied';

        var body = { 'comment': comment };

        var url = "rest/cs/approve/disk/" + requestId + "/deny";
        BaseSrv.executePut(url, body, sessionId, callback);

    };

    /********* view delete vm request **********/
    self.ViewCDiskReq = function(requestId, sessionId, callback) {

        var url = "rest/cs/req/disk/" + requestId;
        BaseSrv.executeGet(url, null, sessionId, callback);

    };

    /****** agree update vm request **********/

    self.ViewUVmReq = function(requestId, sessionId, callback) {
        var url = "rest/cs/req/updatevm/" + requestId;
        BaseSrv.executeGet(url, null, sessionId, callback);
    }

    self.AgreeUVmReq = function(requestId, comment, sessionId, callback) {

        comment = comment ? comment : 'A request has been passed';
        var body = { 'comment': comment };

        var url = "rest/cs/approve/vm/resource/change/" + requestId;
        BaseSrv.executePut(url, body, sessionId, callback);

    };

    /****** deny update vm request **********/
    self.DenyUVmReq = function(requestId, comment, sessionId, callback) {

        comment = comment ? comment : 'A request has been denied';
        var body = { 'comment': comment };

        var url = "rest/cs/approve/vm/resource/change/" + requestId + "/deny";
        BaseSrv.executePut(url, body, sessionId, callback);
    };

    return self;
});

