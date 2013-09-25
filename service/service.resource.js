/** Virtual machine Services **/
cs.service('VMSrv', function(BaseSrv) {
    var self = this;

    self.GetVmLists = function(sessionId, callback) {

        var url = "rest/cs/vm/list";
        BaseSrv.executeGet(url, null, sessionId, callback);
    };

    self.StartVM = function(instanceId, sessionId, callback) {
        var url = "rest/cs/vm/start/" + instanceId;
        BaseSrv.executePut(url, null, sessionId, callback);
    };

    self.RebootVM = function(instanceId, sessionId, callback) {
        var url = "rest/cs/vm/reboot/" + instanceId;
        BaseSrv.executePut(url, null, sessionId, callback);
    };

    self.StopVM = function(instanceId, sessionId, callback) {

        var url = "rest/cs/vm/stop/" + instanceId;
        BaseSrv.executePut(url, null, sessionId, callback);
    };

    self.ViewConsole = function(instanceId, sessionId, callback) {
        var url = "rest/cs/vm/viewconsole/" + instanceId;
        BaseSrv.executeGet(url, null, sessionId, callback);
    };

    self.GetVmByInstanceId = function(instanceId, sessionId, callback) {
        var url = "rest/cs/vm/" + instanceId;
        BaseSrv.executeGet(url, null, sessionId, callback);
    };

    self.EditVmDisplyName = function(instanceId, vmNewName, sessionId, callback) {
        var url = "rest/cs/vm/editdisplayname/" + instanceId;
        var vm = { displayName: vmNewName };
        BaseSrv.executePut(url, vm, sessionId, callback);
    };

    self.GetImageFileList = function(zoneId, sessionId, callback) {
        var url = "rest/cs/vm/zone/" + zoneId + "/image/list";
        BaseSrv.executeGet(url, null, sessionId, callback);
    };

    self.AttachImageFile = function(instanceId, imageFileId, sessionId, callback) {
        var url = "rest/cs/vm/" + instanceId + "/attached/" + imageFileId;
        BaseSrv.executePut(url, null, sessionId, callback);
    }

    self.DetachImageFile = function(instanceId, sessionId, callback) {
        var url = "rest/cs/vm/" + instanceId + "/detach";
        BaseSrv.executePut(url, null, sessionId, callback);
    }

    self.GetVmComputerSetting = function(instanceId, sessionId, callback) {
        var url = "rest/cs/vm/setting/" + instanceId;
        url = "rest/cs/req/computersetting/list/vm/" + instanceId;
        BaseSrv.executeGet(url, null, sessionId, callback);
    }

    return self;
});

/** Disk Services **/
cs.service('DiskSrv', function(BaseSrv) {
    var self = this;

    self.GetDiskLists = function(sessionId, callback) {
        var url = "rest/cs/disk/list";
        BaseSrv.executeGet(url, null, sessionId, callback);
    };

    self.GetDiskByInstanceId = function(instanceId, sessionId, callback) {
    
        var url = "rest/cs/disk/" + instanceId;
        BaseSrv.executeGet(url, null, sessionId, callback);
        
    };

    self.AttachDisk = function(vmInstanceId, diskInstanceId, sessionId, callback) {
        var url = "rest/cs/disk/attach/" + diskInstanceId + "/to/" + vmInstanceId;
        BaseSrv.executePut(url, null, sessionId, callback);
    };

    self.DetachDisk = function(diskInstanceId, sessionId, callback) {
        var url = "rest/cs/disk/detach/" + diskInstanceId;
        BaseSrv.executePut(url, null, sessionId, callback);
    };

    self.CreateSnapshot = function(diskInstanceId, sessionId, callback) {
        var url = "rest/cs/disk/createsnapshot/" + diskInstanceId;
        BaseSrv.executePost(url, null, sessionId, callback);
    };

    self.DeleteDisk = function(diskInstanceId, sessionId, callback) {
        var url = "rest/cs/disk/delete/" + diskInstanceId;
        BaseSrv.execute(url, "DELETE", null, sessionId, callback);

    };

    return self;
});

/** Snapshot Services **/
cs.service('SnapshotSrv', function(BaseSrv) {
    var self = this;

    self.GetLists = function(sessionId, callback) {
        var url = "rest/cs/snapshot/list";
        BaseSrv.executeGet(url, null, sessionId, callback);
    };

    /*注意：是instanceid,不是id,也不是vmDiskInstanceid*/
    self.Restore = function(instanceId, sessionId, callback) {

        var url = "rest/cs/snapshot/restore/" + instanceId;
        BaseSrv.executePost(url, null, sessionId, callback);

    };

    /*注意：是instanceid,不是id,也不是vmDiskInstanceid*/
    self.Delete = function(instanceId, sessionId, callback) {
    
        var url = "rest/cs/snapshot/delete/" + instanceId;
        BaseSrv.execute(url, "DELETE", null, sessionId, callback);
        
    };

    return self;
});

