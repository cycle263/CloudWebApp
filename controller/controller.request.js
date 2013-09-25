function vmRequestCtrl($scope, $location, $route, $dialog, globalValue, dialogSrv, ApproveSrv, RequestSrv, Scroll, VMSrv) {

    $scope.init = function() {
        var loginInfos = checkLogin();
        if (!loginInfos) {
            var box = warnCommonFunc($dialog, dialogSrv, "Information", "Session expired.");
            box.then(function() {
                $location.path('/login');
                $location.replace();
            });
            return;
        }

        $scope.initDatePicker();
        $scope.scrollTo = Scroll.scrollTo;
        $scope.request = {};
        $scope.actions = {};
        $scope.tips = {};
        $scope.editRequest = {};
        $scope.editComputerSettings = [];
        $scope.editRequest.currentComputerSettings = "";

        $scope.osTypes = [
            { "id": "1", "class": "product_img Machine-windows img_web", "name": "Windows 2008 R2 Standard Edition 64bit SP2", "description": "Detail description", "size": "40G" },
            { "id": "2", "class": "product_img Machine-windows", "name": "Windows 2008 R2 Web Edition 64bit SP2", "description": "Detail description", "size": "40G" },
            { "id": "3", "class": "product_img Machine-CentOS", "name": "CentOS 6.4 64bit", "description": "Detail description", "size": "20G" }
        ];

        $scope.computeSettings = [
            { "id": "1", "class": "product_img compute_2c2g", "cpuNumber": "2", "memorySize": "2GB", "name": "2 CPU / 2GB memory" },
            { "id": "2", "class": "product_img compute_4c4g", "cpuNumber": "4", "memorySize": "4GB", "name": "4 CPU / 4GB memory" },
            { "id": "3", "class": "product_img compute_4c8g", "cpuNumber": "4", "memorySize": "8GB", "name": "4 CPU / 8GB memory" },
            { "id": "4", "class": "product_img compute_6c16g", "cpuNumber": "6", "memorySize": "16GB", "name": "6 CPU / 16GB memory" }
        ];

        $scope.diskSizes = [
            { "id": "40", "class": "product_img disk_local_40", "name": "40GB" },
            { "id": "80", "class": "product_img disk_local_80", "name": "80GB" },
            { "id": "120", "class": "product_img disk_local_120", "name": "120GB" },
            { "id": "160", "class": "product_img disk_local_160", "name": "160GB" },
            { "id": "200", "class": "product_img disk_local_200", "name": "200GB" }
        //            { "id": "iscsi_80", "class": "product_img disk_iscsi_80" },
        //            { "id": "iscsi_120", "class": "product_img disk_iscsi_120" },
        //            { "id": "iscsi_160", "class": "product_img disk_iscsi_160" },
        //            { "id": "iscsi_200", "class": "product_img disk_iscsi_200" }
        ];

        $scope.tips.VmName = "This name is for your managment purpose only , IT will decide its server name in domain ";

        $scope.$on('$locationChangeStart', function(event) {
            globalValue.deleteVM = '';
        });

        if (globalValue.deleteVM) {
            $scope.actions.current = 'deleteVM';
            $scope.request.vmId = globalValue.deleteVM.instanceId;
        }
        else $scope.actions.current = 'createVM';

        $scope.userInfo = loginInfos;

        ApproveSrv.GetApproverList(loginInfos.JSESSIONID, function(data) {
            if (data.success == "true") {
                $scope.approvers = data.approvers;
            }
        });

        RequestSrv.GetZoneList(loginInfos.JSESSIONID, function(data) {
            if (data.success == "true") {
                $scope.zones = data.zones;
            }
        });

        VMSrv.GetVmLists($scope.userInfo.JSESSIONID, function(data) {
            if (data.success == 'true') {
                $scope.vms = [];

                for (var i = 0; i < data.vms.length; i++) {
                    var vm = data.vms[i];
                    if (vm.instanceId) $scope.vms.push(vm);
                }
            }
        });

        // $scope.refreshSetting();
        // $scope.refreshDiskSettings();

        //$scope.locationToCVm();
    };

    $scope.locationToCVm = function(){
        $scope.actions.current = 'createVM';
        $scope.request = {};
        $scope.clearData();
        
        //CancelSelectedApprover();
    };

    $scope.locationToCDisk = function() {
        $scope.actions.current = 'createDisk';
        $scope.request = {};
        $scope.clearData();
        
        //CancelSelectedApprover();

    };

    $scope.locationToDVM = function(){
        $scope.actions.current = 'deleteVM';
        $scope.request = {};
        $scope.clearData();

        //CancelSelectedApprover();
    };

    $scope.locationToEVM = function() {
        $scope.actions.current = 'editVM';
        $scope.request = {};
        $scope.clearData();
    };

    $scope.checkForm = function() {
        var pass = false;

        if (!$scope.actions || !$scope.actions.current) return false;

        if ($scope.actions.current == "createVM") {
            pass = $scope.request && $scope.request.name && $scope.request.approver && $scope.request.zone &&
                $scope.request.purpose && $scope.request.osType && $scope.request.diskSettingId &&
                $scope.request.vmSettingId;
        }
        else if ($scope.actions.current == "createDisk") {
            pass = $scope.request && $scope.request.name && $scope.request.approver && $scope.request.zone &&
                $scope.request.purpose && $scope.request.diskSettingId;
        }
        else if ($scope.actions.current == "deleteVM") {
            pass = $scope.request && $scope.request.vmId && $scope.request.approver && $scope.request.purpose;
        }
        else if ($scope.actions.current == "editVM") {
            pass = $scope.editRequest && $scope.editRequest.vmId && $scope.request.approver && $scope.request.purpose;
        }
        
        return pass;
    };

    $scope.submit = function(trigger) {
        var formRequest = {};
        var msgs = [{ type: 'success', msg: 'The form submitted successfully!' }, { type: 'error', msg: 'The form submission failed!'}];

        formRequest.approver = $scope.request.approver;
        formRequest.purpose = $scope.request.purpose;

        if ($scope.actions.current == "createVM") {
            formRequest.tagName = $scope.request.name;

            formRequest.zoneId = $scope.request.zone;
            formRequest.imageSetId = $scope.request.osType.toString();
            formRequest.computersettingSetId = $scope.request.vmSettingId.toString();

            // var disksettings = $scope.request.diskSettingId.split('_');
            formRequest.storageTags = $scope.request.enableHA ? "iscsi" : "local";
            formRequest.totalDiskSize = $scope.request.diskSettingId;

            RequestSrv.CreateVMRequest(formRequest, $scope.userInfo.JSESSIONID, function(data) {
                if (data.success == "true") {
                    $scope.clearData();
                    $scope.alerts = [msgs[0]];
                } else {
                    console.log(data);
                    $scope.alerts = [msgs[1]];
                }
            });
        }
        else if ($scope.actions.current == "createDisk") {
            formRequest.tagName = $scope.request.name;
            formRequest.zoneId = $scope.request.zone;

            // var disksettings = $scope.request.diskSettingId.split('_');
            formRequest.storageTags = "iscsi";
            formRequest.diskSize = $scope.request.diskSettingId;

            RequestSrv.CreateDiskRequest(formRequest, $scope.userInfo.JSESSIONID, function(data) {
                if (data.success == "true") {
                    $scope.clearData();
                    $scope.alerts = [msgs[0]];
                } else {
                    console.log(data);
                    $scope.alerts = [msgs[1]];
                }
            });
        }
        else if ($scope.actions.current == "deleteVM") {
            formRequest.vmInstanceId = $scope.request.vmId;
            //            var formLists = {
            //                vmInstanceId: $scope.request.vm.instanceId,
            //                approver: $scope.request.approver,
            //                purpose: $scope.request.purpose
            //            };

            RequestSrv.DeleteVMRequest(formRequest, $scope.userInfo.JSESSIONID, function(data) {
                if (data.success == 'true') {
                    $scope.clearData();
                    $scope.alerts = [msgs[0]];
                } else {
                    console.log(data);
                    $scope.alerts = [msgs[1]];
                }
            });
        }
        else if ($scope.actions.current == "editVM") {
            formRequest.vmInstanceId = $scope.editRequest.vmId;
            formRequest.computersettingSetId = $scope.editRequest.vmSettingId;
            var body = {
                vmInstanceId: $scope.editRequest.vmId,
                computerSettingId: $scope.editRequest.vmSettingId,
                purpose: $scope.request.purpose,
                approver: $scope.request.approver
            };
            
            RequestSrv.ChangeVmResource(body, $scope.userInfo.JSESSIONID, function(data) {
                if (data.success == 'true') {
                    $scope.clearData();
                    $scope.alerts = [msgs[0]];
                } else {
                    console.log(data);
                    $scope.alerts = [msgs[1]];
                }
           });
        }
    };

    $scope.initDatePicker = function() {
        $scope.dates = {};
        $scope.dates.today = new Date();

        $scope.open = function() {
            $scope.opened = true;
        };

        $scope.dateOptions = {
            'year-format': "'yy'",
            'starting-day': 1
        };

        $scope.today = function() {
            $scope.dates.date = $scope.dates.today;
        };
        $scope.today();

        $scope.clear = function() {
            $scope.dates.date = null;
        };
    };

    $scope.showInstancePrice = function(){
        switch($scope.request.vmSettingId){
            case '1':
                $scope.instancePrice = 0.15;
                break;
            case '2':
                $scope.instancePrice = 0.3;
                break;
            case '3':
                $scope.instancePrice = 0.45;
                break;
            case '4':
                $scope.instancePrice = 0.6;
                break;
        }
    };
    
    /* using by edit VmRequest */
    $scope.showNewInstancePrice = function() {
        switch ($scope.editRequest.vmSettingId) {
            case '1':
                $scope.newInstancePrice = 0.15;
                break;
            case '2':
                $scope.newInstancePrice = 0.3;
                break;
            case '3':
                $scope.newInstancePrice = 0.45;
                break;
            case '4':
                $scope.newInstancePrice = 0.6;
                break;
        }
    };

    /* using by edit VmRequest */
    $scope.showVmInstance = function() {
        var vmid = $scope.editRequest.vmId;
        $scope.editRequest.currentComputerSettings = "";

        VMSrv.GetVmComputerSetting(vmid, $scope.userInfo.JSESSIONID, function(data) {
            if (data.success == "true") {
                var name = "";
                $scope.editComputerSettings = [];
                for (var j = 0; j < data.computerSetting.length; j++) {
                    name = data.computerSetting[j].cpunumber + " CPU / " + (data.computerSetting[j].memorysize / 1024) + "GB Memory";
                    var body = {
                        id: data.computerSetting[j].id,
                        name: name
                    };

                    $scope.editComputerSettings.push(body);
                }
                //                for (var i = 0; i < $scope.vms.length; i++) {
                //                    if ($scope.vms[i].instanceId == vmid) {
                //                        for (var j = 0; j < data.computerSetting.length; j++) {
                //                            if (data.computerSetting[j].cpuNumber == $scope.vms[i].cpuNumber &&
                //                               data.computerSetting[j].memorySize == $scope.vms[i].memorySize) {

                //                                $scope.editRequest.currentComputerSettings = data.computerSetting[j].id;
                //                                break;
                //                            }

                //                        }
                //                        break;
                //                    }

                //                }

            }

        });
    };
    
    $scope.showDiskPrice = function(){
        switch($scope.request.diskSettingId){
            case '40':
                $scope.diskPrice = 0.05;
                break;
            case '80':
                $scope.diskPrice = 0.1;
                break;
            case '120':
                $scope.diskPrice = 0.15;
                break;
            case '160':
                $scope.diskPrice = 0.2;
                break;
            case '200':
                $scope.diskPrice = 0.25;
                break;
        }
    };

    $scope.clearData = function() {
        formRequest = {};
        $scope.request = {};
        $scope.settings = [];
        $scope.instancePrice = 0;
        $scope.diskPrice = 0;
        
        var eles = document.getElementsByClassName('cdst');
        for (var i = 0, l = eles.length; i < l; i++) {
            eles[i].parentElement.style.boxShadow = "";
        }
    }
    
    $scope.closeAlert = function(i) {
        $scope.alerts.splice(i, 1);
    };

    $scope.init();
}

function CancelSelectedApprover() {
    var eles = document.getElementsByClassName('cdst');
    for (var i = 0, l = eles.length; i < l; i++) {
        eles[i].checked = false;
        eles[i].parentElement.style.boxShadow = "";
    }
}