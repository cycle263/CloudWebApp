function adminCtrl($scope, $location, ApproveSrv, $dialog, Scroll, $rootScope, dialogSrv) {
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
        $scope.cvmFieldName = '-created';   //Default Sort Order
        $scope.cdiskFieldName = '-created';
        $scope.dvmFieldName = '-created';
        $scope.evmFieldName = '-created';
        
        if (!$rootScope.globalValue) $rootScope.globalValue = {};   //save zoneId When create vm request approveByIT

        $scope.configs = {};
        $scope.userInfo = loginInfos;
        $scope.loading = true;

        /*get table data*/
        ApproveSrv.GetNonApproveReqList(loginInfos.JSESSIONID, function(data) {
            if (data.success == "true") {
                if(data.waitForITApprove && data.waitForDepApprove){
                    $scope.vmRequests = concatArray(data.waitForDepApprove.vmRequests, data.waitForITApprove.vmRequests);
                }else if(!data.waitForITApprove && data.waitForDepApprove){
                    $scope.vmRequests = data.waitForDepApprove.vmRequests;
                }else if(data.waitForITApprove && !data.waitForDepApprove){
                    $scope.vmRequests = data.waitForITApprove.vmRequests;
                }
                $scope.diskRequests = data.waitForDepApprove ? data.waitForDepApprove.diskRequests : [];
                $scope.delVmRequests = data.waitForDepApprove ? data.waitForDepApprove.delVmRequests : [];
                
                
                if(data.waitForITApprove && data.waitForDepApprove){
                    $scope.editVmRequests = concatArray(data.waitForDepApprove.updateVmRequests, data.waitForITApprove.updateVmRequests);
                }else if(!data.waitForITApprove && data.waitForDepApprove){
                    $scope.editVmRequests = data.waitForDepApprove.updateVmRequests;
                }else if(data.waitForITApprove && !data.waitForDepApprove){
                    $scope.editVmRequests = data.waitForITApprove.updateVmRequests;
                }
                 
            } else {
                warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg);
            }
            $scope.loading = false;
        });        

        //hide effect
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
        
        function concatArray(arr1, arr2){
            if(!arr1){return arr2;}
            if(!arr2){return arr1;}
            if(arr1 && arr2){return arr1.concat(arr2);}
        }
    };

    //alert box params
    $scope.opts = {
        backdrop: true,
        keyboard: true,
        backdropClick: false,
        controller: 'dialogInfoCtrl'
    };

    //use function to order
    $scope.orderById = function(){
        $scope.cvmFieldName='requestId';
        $scope.cvmReverse=!$scope.cvmReverse;
    };

    $scope.AgreeCVmReq = function(id, machineName, domain, networkId, req, status, zoneId) {
        if (status == 'waitForITApprove') {
            $scope.opts.templateUrl = 'approver/createVM/itAgree.html';
        } else {
            $scope.opts.templateUrl = 'approver/createVM/depAgree.html';
        }

        $rootScope.globalValue.zoneId = zoneId;
        var d = $dialog.dialog($scope.opts);
        d.open().then(function(results) {
            if(results != -99){
                var networkIds = [], machineName = '', domain = '';
                if(status == 'waitForITApprove'){
                    machineName = results ? results.machineName : machineName;
                    domain = results && results.domain ? results.domain.domainName : domain;            
                    netDefault = results.default ? results.default : results.networkId.Id;    

                    //check network array 
                    if(results.networkIds.length == 0) {   
                        networkIds.push({networkId: results.networkId.Id, default: true});
                    }else{
                        var arr = results.networkIds;
                        for(var i = 0, l = arr.length;i < l;i++){
                            if(arr[i].Id == netDefault){
                                networkIds.push({networkId: arr[i].Id, default: true});
                            }else{
                                networkIds.push({networkId: arr[i].Id});
                            }
                        }                        
                    }
                    console.log(networkIds);

                    ApproveSrv.AgreeCVmReq(id, machineName, domain, networkIds, '', loginInfos.JSESSIONID, function(data) {
                        if (data.success == 'true') {
                            $scope.vmRequests.splice($scope.vmRequests.indexOf(req), 1);
                            $('.ajax_loading').css('display', 'none');
                        }else{
                            warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg).then(function() {
                                $('.ajax_loading').css('display', 'none');
                            });
                        }

                    });
                }else{
                    ApproveSrv.AgreeCVmReq(id, machineName, domain, networkIds, results, loginInfos.JSESSIONID, function(data) {
                        if (data.success == 'true') {
                            $scope.vmRequests[$scope.vmRequests.indexOf(req)].status = 'waitForITApprove';
                            $('.ajax_loading').css('display', 'none');
                        }else{
                            warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg).then(function() {
                                $('.ajax_loading').css('display', 'none');
                            });
                        }
                    });
                }
            }
        });
    };

    $scope.DenyCVmReq = function(id, req) {
        //$("body").data("requestId", id);

        $scope.opts.templateUrl = 'approver/createVM/deny.html';
        var d = $dialog.dialog($scope.opts);
        d.open().then(function(results) {
            if(results != -99){
                ApproveSrv.DenyCVmReq(id, results, loginInfos.JSESSIONID, function(data) {
                    if (data.success == 'true') {
                        $scope.vmRequests.splice($scope.vmRequests.indexOf(req), 1);
                        $('.ajax_loading').css('display', 'none');
                    } else {
                        warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg).then(function() {
                            $('.ajax_loading').css('display', 'none');
                        });
                    }
                });
            }
        });
    };

    $scope.ViewCVmReq = function(id) {
        ApproveSrv.ViewCVmReq(id, loginInfos.JSESSIONID, function(data) {
            if (data.success == 'true') {  
                $scope.vmDetail = data.vmRequest;              
                $('.ajax_loading').css('display', 'none');
            } else {
                warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg).then(function() {
                    $('.ajax_loading').css('display', 'none');
                    $('#vm_detail_back').click();
                });
            }
        });
    };

    $scope.AgreeCDiskReq = function(id,req) {
        $scope.opts.templateUrl = 'approver/createVM/depAgree.html';
        var d = $dialog.dialog($scope.opts);
        d.open().then(function(results) {
            if(results != -99){
                ApproveSrv.AgreeCDiskReq(id, results, loginInfos.JSESSIONID, function(data) {
                    if (data.success == 'true') {
                        $scope.diskRequests.splice($scope.diskRequests.indexOf(req), 1);
                        $('.ajax_loading').css('display', 'none');
                    } else {
                        warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg).then(function() {
                            $('.ajax_loading').css('display', 'none');
                        });
                    }
                });
            }
        });
    };

    $scope.DenyCDiskReq = function(id,req) {
        $scope.opts.templateUrl = 'approver/createVM/deny.html';
        var d = $dialog.dialog($scope.opts);
        d.open().then(function(results) {
            if (results != -99) {
                ApproveSrv.DenyCDiskReq(id, results, loginInfos.JSESSIONID, function(data) {
                    if (data.success == 'true') {
                        $scope.diskRequests.splice($scope.diskRequests.indexOf(req), 1);
                        $('.ajax_loading').css('display', 'none');
                    } else {
                        warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg).then(function() {
                            $('.ajax_loading').css('display', 'none');
                        });
                    }
                });
            }
        });
    };

    $scope.ViewCDiskReq = function(id) {
        ApproveSrv.ViewCDiskReq(id, loginInfos.JSESSIONID, function(data) {
            if (data.success == 'true') {  
                $scope.diskDetail = data.diskRequest; 
                $('.ajax_loading').css('display', 'none');
            } else {
                warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg).then(function() {
                    $('.ajax_loading').css('display', 'none');
                    $('#disk_detail_back').click();
                });
            }
        });
    };

    $scope.AgreeDVmReq = function(id,req) {
        $scope.opts.templateUrl = 'approver/createVM/depAgree.html';
        var d = $dialog.dialog($scope.opts);
        d.open().then(function(results) {
            if (results != -99) {
                ApproveSrv.AgreeDVmReq(id, results, loginInfos.JSESSIONID, function(data) {
                    if (data.success == 'true') {
                        $scope.delVmRequests.splice($scope.delVmRequests.indexOf(req), 1);
                        $('.ajax_loading').css('display', 'none');
                    } else {
                        warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg).then(function(){
                            $('.ajax_loading').css('display', 'none');
                        });
                    }
                });
            }
        });
    };

    $scope.DenyDVmReq = function(id,req) {
        $scope.opts.templateUrl = 'approver/createVM/deny.html';
        var d = $dialog.dialog($scope.opts);
        d.open().then(function(results) {
            if (results != -99) {
                ApproveSrv.DenyDVmReq(id, results, loginInfos.JSESSIONID, function(data) {
                    if (data.success == 'true') {
                        $scope.delVmRequests.splice($scope.delVmRequests.indexOf(req), 1);
                        $('.ajax_loading').css('display', 'none');
                    } else {
                        warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg).then(function() {
                            $('.ajax_loading').css('display', 'none');
                        });
                    }
                });
            }
        });
    };

    $scope.ViewDVmReq = function(id) {
        ApproveSrv.ViewDVmReq(id, loginInfos.JSESSIONID, function(data) {
            if (data.success == 'true') { 
                $scope.delVmDetail = data.delVmRequest;               
                $('.ajax_loading').css('display', 'none');

                $scope.totalDiskSize = (function(){
                    var i, r = 0, l = 0;
                    if($scope.delVmDetail.virtualMachine && $scope.delVmDetail.virtualMachine.disks)
                        l = $scope.delVmDetail ? $scope.delVmDetail.virtualMachine.disks.length : 0;
                    for(i = 0; i < l; i++){
                        r += $scope.delVmDetail.virtualMachine.disks[i].volsize;
                    }
                    return r/1024/1024/1024;
                })();
            } else {
                warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg).then(function() {
                    $('.ajax_loading').css('display', 'none');
                    $('#delvm_detail_back').click();
                });
            }
        });
    };    

    /********update vm request **********/

    $scope.AgreeUVmReq = function(id, req, status) {
        if (status == 'waitForITApprove') {
            $scope.opts.templateUrl = 'approver/updateVM/agree.html';
        } else {
            $scope.opts.templateUrl = 'approver/updateVM/agree.html';
        }

        var d = $dialog.dialog($scope.opts);
        d.open().then(function(results) {
            if(results != -99){
                    //console.log(networkIds);
                var comments = results;
                
                ApproveSrv.AgreeUVmReq(id, comments, loginInfos.JSESSIONID, function(data) {
                    if (data.success == 'true') {
                        $scope.vmRequests.splice($scope.vmRequests.indexOf(req), 1);
                        $('.ajax_loading').css('display', 'none');
                    }else{
                        warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg).then(function() {
                            $('.ajax_loading').css('display', 'none');
                        });
                    }

                });
            }
        });
    };

    $scope.DenyUVmReq = function(id, req) {
        //$("body").data("requestId", id);

        $scope.opts.templateUrl = 'approver/UpdateVM/deny.html';
        var d = $dialog.dialog($scope.opts);
        d.open().then(function(results) {
            if(results != -99){
                ApproveSrv.DenyUVmReq(id, results, loginInfos.JSESSIONID, function(data) {
                    if (data.success == 'true') {
                        $scope.vmRequests.splice($scope.vmRequests.indexOf(req), 1);
                        $('.ajax_loading').css('display', 'none');
                    } else {
                        warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg).then(function() {
                            $('.ajax_loading').css('display', 'none');
                        });
                    }
                });
            }
        });
    };


    $scope.ViewUVmReq = function(id) {
        ApproveSrv.ViewUVmReq(id, loginInfos.JSESSIONID, function(data) {
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
                    $('.ajax_loading').css('display', 'none');
                    $('#vm_detail_back').click();
                });
            }
        });
    }; 

    $scope.init();
}

/*dialog controller*/
function dialogInfoCtrl($scope, $dialog, dialog, dialogSrv, RequestSrv, ApproveSrv, $rootScope){
    // var JSESSIONID = document.cookie.replace(/(?:(?:^|.*;\s*)JSESSIONID\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    // var id = $("body").data("requestId"); 
    var loginInfos = checkLogin();    

    $scope.cancel = function() {
        dialog.close(-99);
    };

    $scope.submit = function(results){
        dialog.close(results);
    };

    $scope.add = function(item){
        if(item && $scope.configs.networkIds.indexOf(item)<0){
            $scope.configs.networkIds.push(item);
            if($scope.configs.networkIds.length == 1){
                $scope.configs.default = item.Id;
            }               
        }
    };

    $scope.selectChange = function(item){
        //$scope.clearAllSelected();
        if(item){$scope.configs.default = item;}
        //item.selected = item.Name;   
        console.log($scope.configs.default);     
        console.log($scope.configs); 
        console.log($scope.configs.default); 
    };

    //deprecated
    $scope.checkedChange = function(item) {
        if (item && $scope.configs.networkIds.indexOf(item) < 0 && item.checked == true) {
            $scope.configs.networkIds.push(item);
            $scope.clearAllSelected();
            item.selected = item.Name;
            $scope.configs.default = item;            
        } else if (item && $scope.configs.networkIds.indexOf(item) > -1 && item.checked == false) {
            $scope.configs.networkIds.splice($scope.configs.networkIds.indexOf(item), 1);
            item.selected = false;
            //$scope.configs.default = {};
            $scope.fisrtChecked();            
        }
    };

    //check domain name, deprecated
    $scope.checkDomainName = function(){
        if($scope.configs.machineName){
            warnCommonFunc($dialog, dialogSrv, 'Warn', 'API still in development').then(
                function(){
                    $('.ajax_loading').css('display', 'none');
                    $('#icon-check').css('display', 'inline-block');
                    $scope.configs.iconClass = 'icon-remove';
                });
        }
    };

    //set default for first network
    $scope.firstChecked = function(){
        var arrs = $scope.res.networks,
            eles = document.getElementsByName('optionsDefault');
        for(var i = 0, l = arrs.length; i < l; i++){
            if(arrs[i].checked == true){
                $scope.clearAllSelected();
                eles[i].checked = true;
                $scope.res.networks[i].selected = arrs[i].Name;
                $scope.configs.default = arrs[i];
            }
        }
    };

    //remove network
    $scope.remove = function(item){
        if(item && $scope.configs.networkIds.indexOf(item)>-1){
            $scope.configs.networkIds.splice($scope.configs.networkIds.indexOf(item), 1);
            if($scope.configs.default == item.Id && $scope.configs.networkIds.length > 0){
                $scope.configs.default = $scope.configs.networkIds[0].Id;
            }else if($scope.configs.networkIds.length < 1){
                $scope.configs.default = $scope.configs.networkId.Id;
            }
        }
        console.log($scope.configs);
    };    

    $scope.init = function(){
        $scope.res = {};
        $scope.configs = {};
        $scope.configs.networkIds = [];
        $scope.configs.default = {};

        if($rootScope.globalValue.zoneId){
            RequestSrv.GetNetworkListByZoneId($rootScope.globalValue.zoneId, loginInfos.JSESSIONID, function(data){
                if(data.success){
                    $scope.res.networks = data.networks;
                }
            });
        }

        ApproveSrv.GetDomainList(loginInfos.JSESSIONID, function(data){
            if(data.success){
                $scope.res.domains = data.domains;
            }
        });
    };

    $scope.init();
}