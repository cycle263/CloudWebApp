function historyCtrl($scope, $dialog, $location, Scroll, RequestSrv, ApproveSrv, dialogSrv) {
    var loginInfos = checkLogin();

    $scope.init = function() {
        if (!loginInfos) {
            var box = warnCommonFunc($dialog, dialogSrv, "Information", "Session expired.");
            box.then(function() {
                $location.path('/login');
                $location.replace();
            });
            return;
        }

        $scope.scrollTo = Scroll.scrollTo;
        $scope.cvmFieldName = '-created';
        $scope.cdiskFieldName = '-created';
        $scope.dvmFieldName = '-created';
        $scope.evmFieldName = '-created';

        $scope.userInfo = loginInfos;
        $scope.loading = true;

        $scope.cvmReqFilters = [
            { status: 'waitForDepApprove', checked: true },
            { status: 'waitForITApprove', checked: true },
            { status: 'Approved', checked: false },
            { status: 'Denied', checked: false },
            { status: 'Canceled', checked: false}];

        $scope.chdReqFilters = [
            { status: 'waitForDepApprove', checked: true },
            { status: 'Approved', checked: false },
            { status: 'Denied', checked: false },
            { status: 'Canceled', checked: false}];

        $scope.dvmReqFilters = [
            { status: 'waitForDepApprove', checked: true },
            { status: 'Approved', checked: false },
            { status: 'Denied', checked: false },
            { status: 'Canceled', checked: false}];

        $scope.evmReqFilters = [
            { status: 'waitForDepApprove', checked: true },
            { status: 'Approved', checked: false },
            { status: 'Denied', checked: false },
            { status: 'Canceled', checked: false}];

        RequestSrv.GetRequestList(loginInfos.JSESSIONID, function(data) {
            if (data.success == "true") {
                $scope.vmItems = data.vmRequests;
                $scope.delItems = data.delVmRequests;
                $scope.diskItems = data.diskRequests;
                $scope.editItems = data.updateVmRequests;
            } else {
                warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg);
            }

            $scope.loading = false;
        });


        $('#cvm').click(function() {
            $(this).toggleClass('content-btn-position');
            $('#cvm-container').toggle('blind');
        });

        $('#chd').click(function() {
            $(this).toggleClass('content-btn-position');
            $('#chd-container').toggle('blind');
        });

        $('#dvm').click(function() {
            $(this).toggleClass('content-btn-position');
            $('#dvm-container').toggle('blind');
        });

        $('#evm').click(function() {
            $(this).toggleClass('content-btn-position');
            $('#evm-container').toggle('blind');
        });
        //warnCommonFunc($dialog, dialogSrv, 'Warn', 'There is a error message');     
    };


    $scope.deleteVMRequest = function(requestId) {
        var title = 'Delete request';
        var msg = 'Please confirm that you want to delete this request.';
        var btns = [{ result: 'no', label: 'No' }, { result: 'yes', label: 'Yes'}];

        var box = $dialog.messageBox(title, msg, btns).open();
        box.then(function(result) {
            if (result == 'yes') {
                RequestSrv.DeleteCVMReq(requestId, $scope.userInfo.JSESSIONID, function(data) {
                    //alert(JSON.stringify(data));
                    if (data.success == "true") {
                        var index = 0;
                        for (var i = 0; i < $scope.vmItems.length; i++) {
                            var item = $scope.vmItems[i];

                            if (item.requestId == requestId) {
                                $scope.vmItems.splice(i, 1);
                                break;
                            }
                        }
                    }
                    else warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg);
                });
            }
        });
    };

    $scope.cancelVMRequest = function(requestId) {
        var title = 'Cancel request';
        var msg = 'Please confirm that you want to cancel this request.';
        var btns = [{ result: 'no', label: 'No' }, { result: 'yes', label: 'Yes'}];

        var box = $dialog.messageBox(title, msg, btns).open();
        box.then(function(result) {
            if (result == 'yes') {
                RequestSrv.CancelCVMReq(requestId, $scope.userInfo.JSESSIONID, function(data) {
                    // alert(JSON.stringify(data));
                    if (data.success == "true") {
                        var index = 0;
                        for (var i = 0; i < $scope.vmItems.length; i++) {
                            var item = $scope.vmItems[i];

                            if (item.requestId == requestId) {
                                item.status = "Canceled";
                                break;
                            }
                        }
                    }
                    else warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg);
                });
            }
        });
    };

    $scope.viewVMRequest = function(requestId) {
        ApproveSrv.ViewCVmReq(requestId, loginInfos.JSESSIONID, function(data) {
            if (data.success == 'true') {
                $scope.vmDetail = data.vmRequest;
                $('.ajax_loading').css('display', 'none');
            } else {
                warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg).then(function(){
                    $('#vm_detail_back').click();
                });                
            }
        });
    };

    $scope.deleteDiskRequest = function(requestId, req) {
        var confirmBox = dialogSrv.open($dialog);
        confirmBox.then(function(result){
            if(result == 'ok'){
                RequestSrv.DeleteCDiskReq(requestId, loginInfos.JSESSIONID, function(data){
                    if(data.success == 'true'){
                        $scope.diskItems.splice($scope.diskItems.indexOf(req), 1);
                    }else{
                        warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg);
                    }
                });
            }
        });
    };

    $scope.cancelDiskRequest = function(requestId, req) {
        var confirmBox = dialogSrv.open($dialog);
        confirmBox.then(function(result){
            if(result == 'ok'){
                RequestSrv.CancelCDiskReq(requestId, loginInfos.JSESSIONID, function(data){
                    if(data.success == 'true'){
                        $scope.diskItems[$scope.diskItems.indexOf(req)].status = 'Canceled';
                    }else{
                        warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg);
                    }
                });
            }
        });
    };

    $scope.viewDiskRequest = function(requestId) {
        ApproveSrv.ViewCDiskReq(requestId, loginInfos.JSESSIONID, function(data) {
            if (data.success == 'true') {
                $scope.diskDetail = data.diskRequest;
                $('.ajax_loading').css('display', 'none');
            } else {
                warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg).then(function(){
                    $('#disk_detail_back').click();
                });
            }
        });
    };

    $scope.deleteDelVMRequest = function(requestId, req) {
        var confirmBox = dialogSrv.open($dialog);
        confirmBox.then(function(result){
            if(result == 'ok'){
                RequestSrv.DeleteDVMReq(requestId, loginInfos.JSESSIONID, function(data){
                    if(data.success == 'true'){
                        $scope.delItems.splice($scope.delItems.indexOf(req), 1);
                    }else{
                        warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg);
                    }
                });
            }
        });
    };

    $scope.cancelDelVMRequest = function(requestId, req) {
        var confirmBox = dialogSrv.open($dialog);
        confirmBox.then(function(result){
            if(result == 'ok'){
                RequestSrv.CancelDVMReq(requestId, loginInfos.JSESSIONID, function(data){
                    if(data.success == 'true'){
                        $scope.delItems[$scope.delItems.indexOf(req)].status = 'Canceled';
                    }else{
                        warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg);
                    }
                });
            }
        });
    };

    $scope.viewDelVMRequest = function(requestId) {
        ApproveSrv.ViewDVmReq(requestId, loginInfos.JSESSIONID, function(data) {
            if (data.success == 'true') {
                $scope.delVmDetail = data.delVmRequest;
                $('.ajax_loading').css('display', 'none');

                $scope.totalDiskSize = (function() {
                    var i, r = 0,
                        l = 0;
                    if ($scope.delVmDetail.virtualMachine && $scope.delVmDetail.virtualMachine.disks) l = $scope.delVmDetail ? $scope.delVmDetail.virtualMachine.disks.length : 0;
                    for (i = 0; i < l; i++) {
                        r += $scope.delVmDetail.virtualMachine.disks[i].volsize;
                    }
                    return r / 1024 / 1024 / 1024;
                })();
            } else {
                warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg).then(function(){
                    $('#delvm_detail_back').click();
                });
            }
        });
    };

    /* upgrade vm request*/

    $scope.DeleteChangeVmReq = function(requestId) {
        var title = 'Delete request';
        var msg = 'Please confirm that you want to delete this request.';
        var btns = [{ result: 'no', label: 'No' }, { result: 'yes', label: 'Yes'}];

        var box = $dialog.messageBox(title, msg, btns).open();
        box.then(function(result) {
            if (result == 'yes') {
                RequestSrv.DeleteChangeVmReq(requestId, $scope.userInfo.JSESSIONID, function(data) {
                    //alert(JSON.stringify(data));
                    if (data.success == "true") {
                        var index = 0;
                        for (var i = 0; i < $scope.editItems.length; i++) {
                            var item = $scope.editItems[i];

                            if (item.requestId == requestId) {
                                $scope.editItems.splice(i, 1);
                                break;
                            }
                        }
                    }
                    else warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg);
                });
            }
        });
    };

    $scope.CancelChangeVmReq = function(requestId) {
        var title = 'Cancel request';
        var msg = 'Please confirm that you want to cancel this request.';
        var btns = [{ result: 'no', label: 'No' }, { result: 'yes', label: 'Yes'}];

        var box = $dialog.messageBox(title, msg, btns).open();
        box.then(function(result) {
            if (result == 'yes') {
                RequestSrv.CancelChangeVmReq(requestId, $scope.userInfo.JSESSIONID, function(data) {
                    // alert(JSON.stringify(data));
                    if (data.success == "true") {
                        var index = 0;
                        for (var i = 0; i < $scope.editItems.length; i++) {
                            var item = $scope.editItems[i];

                            if (item.requestId == requestId) {
                                item.status = "Canceled";
                                break;
                            }
                        }
                    }
                    else warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg);
                });
            }
        });
    };

    $scope.viewEditVMRequest = function(requestId) {
        ApproveSrv.ViewUVmReq(requestId, loginInfos.JSESSIONID, function(data) {
            if (data.success == 'true') {
                $scope.editVmDetail = data.vmRequest;
                var diskSize = 0;
                for (var i = 0; i < data.vmRequest.vm.disks.length; i++) {
                    diskSize += data.vmRequest.vm.disks[i].volsize;
                }
                $scope.editVmDetail.diskSize = diskSize / 1024 / 1024 / 1024;
                $('.ajax_loading').css('display', 'none');
            } else {
                warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg).then(function() {
                    $('#editVm_detail_back').click();
                });
            }
        });
    };

    $scope.init();
};

function warnBoxCtrl($scope, dialog, dialogSrv){
    $scope.init = function(){
        $scope.box = {};
        $scope.box.title = dialogSrv.box.title;
        $scope.box.content = dialogSrv.box.content;
    };

    $scope.ok = function(){
        dialog.close();
        dialogSrv.configs.warnIsOpen = false;
        $('#warn_add_back').css('display', 'none');
    };

    $scope.init();
}