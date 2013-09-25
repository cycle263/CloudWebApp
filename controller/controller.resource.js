function resourceCtrl($scope, $dialog, $location, dialogSrv, VMSrv, DiskSrv, SnapshotSrv, Scroll, globalValue, $timeout) {
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

        $scope.scrollTo = Scroll.scrollTo;
        $scope.userInfo = loginInfos;

        $scope.waiting = {};
        $scope.waiting.vms = [];
        $scope.waiting.disks = [];

        $scope.refreshVM();
        $scope.refreshDisk();
        $scope.refreshSnapshot();

        $('#vm').click(function() {
            $(this).toggleClass('content-btn-position');
            $('#vms-container').toggle('fold');
        });

        $('#hd').click(function() {
            $(this).toggleClass('content-btn-position');
            $('#disks-container').toggle('fold');
        });

        $('#ss').click(function() {
            $(this).toggleClass('content-btn-position');
            $('#snaps-container').toggle('fold');
        });

        $timeout($scope.timerElapsed, 30 * 1000);
    };

    $scope.refreshVM = function() {
        $scope.machines = [];
        $scope.loadingVM = true;

        VMSrv.GetVmLists($scope.userInfo.JSESSIONID, function(data) {
            if (data.success == "true") {
                $scope.machines = data.vms;

                for (var i = 0; i < $scope.machines.length; i++) {
                    var machine = $scope.machines[i];
                    var osName = machine.osName;

                    var osType = "";

                    if (!osName) osType = "linux";
                    else if (osName.indexOf("Windows") >= 0) osType = "windows";
                    else if (osName.indexOf("Ubuntu") >= 0) osType = "Ubuntu";
                    else if (osName.indexOf("CentOS") >= 0) osType = "CentOS";
                    else if (osName.indexOf("Linux") >= 0) osType = "linux";

                    if (osType.length == 0) machine.osClass = "product_img Machine";
                    else machine.osClass = "product_img Machine-" + osType;

                    machine.stateClass = function() {
                        if (this.state == "Running") return "ssenabled";
                        else if (this.state == "Stopped") return "ssdisabled";
                        else return "ssdoing";
                    }

                    if (machine.state != "Running" && machine.state != "Stopped")
                        $scope.pushToMonitor(machine, "vm");
                }
            }
            $scope.loadingVM = false;
        });
    };
    
    $scope.refreshDisk = function() {
        $scope.disks = [];
        $scope.loadingDisk = true;

        DiskSrv.GetDiskLists($scope.userInfo.JSESSIONID, function(data) {
            if (data.success == "true") {
                $scope.disks = data.disks;

                for (var i = 0; i < $scope.disks.length; i++) {
                    var disk = $scope.disks[i];

                    disk.stateClass = function() {
                        if (this.state == "Attached" || this.state == "Ready") return "ssenabled";
                        else if (this.state == "Detached") return "ssdisabled";
                        else return "ssdoing";
                    }

                    if (disk.state != "Ready" && disk.state != "Attached" && disk.state != "Detached")
                        $scope.pushToMonitor(disk, "disk");
                }
            }
            $scope.loadingDisk = false;
        });
    };

    $scope.refreshSnapshot = function() {
        $scope.snapshots = [];
        $scope.loadingSnapshot = true;

        SnapshotSrv.GetLists($scope.userInfo.JSESSIONID, function(data) {
            if (data.success == "true") {
                $scope.snapshots = data.snapshots;
            }
            $scope.loadingSnapshot = false;
        });
    };

    $scope.handleClickVM = function(machine) {
        if (machine.state != 'Initializing') {
            globalValue.resourceVMId = machine.instanceId;

            var opts = {
                backdrop: true,
                dialogFade: true,
                backdropFade: true,
                keyboard: true,
                backdropClick: false,
                templateUrl: 'resource-a.htm',
                controller: 'vmDetailCtrl'
            };

            var d = $dialog.dialog(opts);
            d.open().then(function(result) {
                if (result) {
                    machine.displayName = result.displayName;
                    if (machine.state != result.state) {
                        machine.state = result.state;
                        
                        if (machine.state != "Running" && machine.state != "Stopped") 
                            $scope.pushToMonitor(machine, "vm");
                    }
                }
            });
        }
    }

    $scope.handleClickDisk = function(disk) {
        if (disk.state != 'Initializing') {
            globalValue.resouceDiskId = disk.instanceId;

            var opts = {
                backdrop: true,
                dialogFade: true,
                backdropFade: true,
                keyboard: true,
                backdropClick: false,
                templateUrl: 'resource-b.htm',
                controller: 'diskDetailCtrl'
            };

            var d = $dialog.dialog(opts);
            d.open().then(function(result) {
                if (result) {
                    disk.vmInstanceId = result.vmInstanceId;
                    disk.vmName = result.vmName;

                    if (disk.state != result.state) {
                        disk.state = result.state;

                        if (disk.state != "Ready" && disk.state != "Attached" || disk.state != "Detached")
                            $scope.pushToMonitor(disk, "disk");
                    }
                }
            });
        }
    }

    $scope.handleClickSnapshot = function(snapshot) {
        globalValue.resouceSnapshot = snapshot;

        var opts = {
            backdrop: true,
            dialogFade: true,
            backdropFade: true,
            keyboard: true,
            backdropClick: false,
            templateUrl: 'resource-c.htm',
            controller: 'snapshotDetailCtrl'
        };

        var d = $dialog.dialog(opts);
        d.open().then(function(result) {
            if (result) {
                if (result.state == "Deleted") $scope.refreshSnapshot();
                else $scope.refreshDisk();
            }
        });
    }

    $scope.pushToMonitor = function(item, type) {
        if (type == "vm") {
            var isFound = false;
            for (var i = 0; i < $scope.waiting.vms.length; i++) {
                var vm = $scope.waiting.vms[i];
                if (vm.instanceId == item.instanceId) {
                    isFound = true;
                    break;
                }
            }

            if (!isFound) {
                $scope.waiting.vms.push(item);
                console.log(new Date().toString() + "  push vm (" + item.displayName + ") to monitor list.");
            }
        }
        else if (type == "disk") {
            var isFound = false;
            for (var i = 0; i < $scope.waiting.disks.length; i++) {
                var disk = $scope.waiting.disks[i];
                if (disk.instanceId == item.instanceId) {
                    isFound = true;
                    break;
                }
            }

            if (!isFound) {
                $scope.waiting.disks.push(item);
                console.log(new Date().toString() + "  push disk (" + item.name + ") to monitor list.");
            }
        }
    }

    $scope.timerElapsed = function() {
        console.log("timer elapsed at " + new Date().toString());

        while ($scope.waiting.vms.length > 0) {
            var vmItem = $scope.waiting.vms.shift();
            console.log("check vm (" + vmItem.displayName + ")");

            VMSrv.GetVmByInstanceId(vmItem.instanceId, $scope.userInfo.JSESSIONID, function(data) {
                if (data.success == "true") {
                    var item = $scope.findVMById(data.vm.instanceId);

                    if (item != null) {
                        if (data.vm.state == "Running" || data.vm.state == "Stopped") {
                            console.log("vm (" + item.displayName + ") state is changed from " + item.state + " to " + data.vm.state + ".");
                            item.state = data.vm.state;
                            
                            showInfo(item.displayName + " is " + item.state);
                        }
                        else {
                            $scope.pushToMonitor(item, "vm");
                        }
                    }
                }
            });
        }

        while ($scope.waiting.disks.length > 0) {
            var diskItem = $scope.waiting.disks.shift();
            console.log("check disk (" + diskItem.name + ")");

            DiskSrv.GetDiskByInstanceId(diskItem.instanceId, $scope.userInfo.JSESSIONID, function(data) {
                if (data.success == "true") {
                    var item = $scope.findDiskById(data.disk.instanceId);

                    if (item != null) {
                        if (data.disk.state == "Ready" || data.disk.state == "Attached" || data.disk.state == "Detached") {
                            console.log("disk (" + item.name + ") state is changed from " + item.state + " to " + data.disk.state + ".");
                            item.state = data.disk.state;

                            showInfo(item.name + " is " + item.state);
                        }
                        else {
                            $scope.pushToMonitor(item, "disk");
                        }
                    }
                }
            });
        }

        $timeout($scope.timerElapsed, 30 * 1000);
    };

    $scope.findVMById = function(id) {
        var result = null;
        for (var i = 0; i < $scope.machines.length; i++) {
            if ($scope.machines[i].instanceId == id) {
                result = $scope.machines[i];
                break;
            }
        }

        return result;
    };

    $scope.findDiskById = function(id) {
        var result = null;
        for (var i = 0; i < $scope.disks.length; i++) {
            if ($scope.disks[i].instanceId == id) {
                result = $scope.disks[i];
                break;
            }
        }

        return result;
    };

    $scope.init();
};

/** Virutal machine Detail Controller **/
function vmDetailCtrl($scope, globalValue, $location, $dialog, dialog, VMSrv, dialogSrv) {
    $scope.init = function() {
        //var instanceId = sharedService.message;
        var instanceId = globalValue.resourceVMId;

        $scope.alerts = [];
        $scope.editMode = false;

        var loginInfos = checkLogin();

        if (!loginInfos) {
            var box = warnCommonFunc($dialog, dialogSrv, "Information", "Session expired.");
            box.then(function() {
                dialog.close();
                $location.path('/login');
                $location.replace();
            });
            return;
        }

        $scope.userInfo = loginInfos;
        $scope.loading = true;

        VMSrv.GetVmByInstanceId(instanceId, loginInfos.JSESSIONID, function(data) {
            $scope.loading = false;
            if (data.success == "true") {
                $scope.item = data.vm;

                var osName = $scope.item.osName;
                var osType = "";

                if (osName.indexOf("Windows") >= 0) osType = "windows";
                else if (osName.indexOf("Ubuntu") >= 0) osType = "Ubuntu";
                else if (osName.indexOf("CentOS") >= 0) osType = "CentOS";
                else if (osName.indexOf("Linux") >= 0) osType = "linux";

                if (osType.length == 0) $scope.osLogo = "img/pic-vm_a.png";
                else $scope.osLogo = "img/pic-vm_" + osType + ".png";

                $scope.item.stateClass = function() {
                    if (this.state == "Running") return "tabqa";
                    else if (this.state == "Stopped") return "tabqa ssdisabled";
                    else return "tabqa ssdoing";
                }

                VMSrv.GetImageFileList($scope.item.zone.zoneId, loginInfos.JSESSIONID, function(data) {
                    if (data.success == "true") {
                        $scope.imageFiles = data.imagesFiles;
                    }
                });
            }
            else {
                $scope.alerts = [{ type: "error", msg: data.msg}];
                $scope.item = null;
            }
        });
    };

    $scope.showEdit = function(mode) {
        $scope.editMode = mode;        
        if (mode) $scope.item.newName = $scope.item.displayName;
    };

    $scope.editDisplayName = function(displayName) {
        $scope.item.displayName = $scope.item.newName;
        $scope.editMode = false;
    };
    
    $scope.close = function(result) {
        globalValue.resourceVMId = null;
        dialog.close(result);
    };

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    /* VM Start */
    $scope.canStart = function() {
        return $scope.item != null && $scope.item.state == "Stopped";
    };

    $scope.startClass = function() {
        return $scope.canStart() ? "boxicon btn-start" : "boxicon btn-start_gr";
    }
    
    $scope.startVM = function() {
        VMSrv.StartVM($scope.item.instanceId, $scope.userInfo.JSESSIONID, function(data) {
            if (data.success == "true") {
                $scope.item.state = data.vm.state;
                $scope.close($scope.item);
            }
            else {
                if (data.msg == "Permission denied.") {
                    var box = warnCommonFunc($dialog, dialogSrv, "Information", "Session expired.");
                    box.then(function() {
                        $location.path('/login');
                        $location.replace();
                    });
                }
                else $scope.alerts = [{ type: "error", msg: data.msg}];
            }
        });
    };
    
    /* VM Stop */
    $scope.canStop = function() {
        return $scope.item != null && $scope.item.state == "Running";
    };

    $scope.stopClass = function() {
        return $scope.canStop() ? "boxicon btn-ready" : "boxicon btn-ready_gr";
    };

    $scope.stopVM = function() {
        var title = 'Stop virtual machine';
        var msg = 'Please confirm that you want to stop this virtual machine.';
        var btns = [{ result: 'no', label: 'No' }, { result: 'yes', label: 'Yes'}];

        var box = $dialog.messageBox(title, msg, btns).open();
        box.then(function(result) {
            if (result == 'yes') {
                VMSrv.StopVM($scope.item.instanceId, $scope.userInfo.JSESSIONID, function(data) {
                    if (data.success == "true") {
                        $scope.item.state = data.vm.state;
                        $scope.close($scope.item);
                    }
                    else {
                        if (data.msg == "Permission denied.") {
                            var box = warnCommonFunc($dialog, dialogSrv, "Information", "Session expired.");
                            box.then(function() {
                                $location.path('/login');
                                $location.replace();
                            });
                        }
                        else $scope.alerts = [{ type: "error", msg: data.msg}];
                    }
                });
            }
        });
    };
    
    /* VM Reboot */
    $scope.canReboot = function() {
        return $scope.item != null && $scope.item.state == "Running";
    };

    $scope.rebootClass = function() {
        return $scope.canReboot() ? "boxicon btn-restart" : "boxicon btn-restart_gr";
    };

    $scope.rebootVM = function() {
        var title = 'Confirmation';
        var msg = 'Please confirm that you want to reboot this virtual machine.';
        var btns = [{ result: 'no', label: 'No' }, { result: 'yes', label: 'Yes'}];

        var box = $dialog.messageBox(title, msg, btns).open();
        box.then(function(result) {
            if (result == 'yes') {
                VMSrv.RebootVM($scope.item.instanceId, $scope.userInfo.JSESSIONID, function(data) {
                    if (data.success == "true") {
                        $scope.item.state = data.vm.state;
                        $scope.close($scope.item);
                    }
                    else {
                        if (data.msg == "Permission denied.") {
                            var box = warnCommonFunc($dialog, dialogSrv, "Information", "Session expired.");
                            box.then(function() {
                                $location.path('/login');
                                $location.replace();
                            });
                        }
                        else $scope.alerts = [{ type: "error", msg: data.msg}];
                    }
                });
            }
        });
    };
    
    /* VM Connect */
    $scope.canConnect = function() {
        return $scope.item != null && $scope.item.state == "Running";
    };

    $scope.connectClass = function() {
        return $scope.canReboot() ? "boxicon btn-wait" : "boxicon btn-wait_gr";
    };

    $scope.connectVM = function() {
        window.open("view_console.htm?id=" + $scope.item.instanceId, "_blank",
            "width=800px;height=400px;resizable=no;scrollbars=no;status=no;toolbar=no;location=no");
    };

    /* VM Attach */
    $scope.canAttach = function() {
        return $scope.item != null &&
            ($scope.item.imageFile.description == null || $scope.item.imageFile.description.length == 0);
    };

    $scope.attachClass = function() {
        return $scope.canAttach() ? "boxicon btn-mount" : "boxicon btn-mount_gr";
    };

    $scope.attachIso = function() {
        if ($scope.item.imageFile.id == null ||
            $scope.item.imageFile.id.length == 0) {
            $scope.alerts = [{ msg: "Please select a Iso to attach."}];
            return;
        }

        VMSrv.AttachImageFile($scope.item.instanceId, $scope.item.imageFile.id, $scope.userInfo.JSESSIONID, function(data) {
            if (data.success == "true") {
                for (var i = 0; i < $scope.imageFiles.length; i++) {
                    if ($scope.imageFiles[i].id == $scope.item.imageFile.id) {
                        $scope.item.imageFile.description = $scope.imageFiles[i].description;
                        break;
                    }
                }

                $scope.alerts = [];
            }
            else {
                if (data.msg == "Permission denied.") {
                    var box = warnCommonFunc($dialog, dialogSrv, "Information", "Session expired.");
                    box.then(function() {
                        $location.path('/login');
                        $location.replace();
                    });
                }
                else $scope.alerts = [{ type: "error", msg: data.msg}];
            }
        });
    };
    
    /* VM Detach */
    $scope.canDetach = function() {
    return $scope.item != null && $scope.item.imageFile.id != null && $scope.item.imageFile.id.length != 0 &&
            $scope.item.imageFile.description != null && $scope.item.imageFile.description.length != 0;
    };

    $scope.detachClass = function() {
        return $scope.canDetach() ? "boxicon btn-mountno" : "boxicon btn-mountno_gr";
    };

    $scope.detachIso = function() {
        var title = 'Confirmation';
        var msg = 'Please confirm that you want to detach this Iso.';
        var btns = [{ result: 'no', label: 'No' }, { result: 'yes', label: 'Yes'}];

        var box = $dialog.messageBox(title, msg, btns).open();
        box.then(function(result) {
            if (result == 'yes') {
                VMSrv.DetachImageFile($scope.item.instanceId, $scope.userInfo.JSESSIONID, function(data) {
                    if (data.success == "true") {
                        $scope.item.imageFile.id = $scope.item.imageFile.description = "";
                    }
                    else {
                        if (data.msg == "Permission denied.") {
                            var box = warnCommonFunc($dialog, dialogSrv, "Information", "Session expired.");
                            box.then(function() {
                                $location.path('/login');
                                $location.replace();
                            });
                        }
                        else $scope.alerts = [{ type: "error", msg: data.msg}];
                    }
                });
            }
        });
    };
    
    /* VM Backup */
    $scope.canBackup = function() {
        //return $scope.item != null;
        return false;
    };

    $scope.backupClass = function() {
        return $scope.canBackup() ? "boxicon btn-backup" : "boxicon btn-backup_gr";
    };

    $scope.backupVM = function() {
    
    };

    /* VM Delete */
    $scope.canDelete = function() {
        return $scope.item != null;
    };

    $scope.deleteClass = function() {
        return $scope.canDelete() ? "boxicon btn-delete" : "boxicon btn-delete_gr";
    };

    $scope.deleteVM = function() {
        var title = 'Confirmation';
        var msg = 'Please confirm that you want to delete this virtual machine.';
        var btns = [{ result: 'no', label: 'No' }, { result: 'yes', label: 'Yes'}];

        var box = $dialog.messageBox(title, msg, btns).open();
        box.then(function(result) {
            if (result == 'yes') {
                globalValue.deleteVM = $scope.item;
                $scope.close();
                
                $location.path("/request");
                $location.replace();
            }
        });
    };

    /* VM Rename */
    $scope.renameVM = function() {
        if (!$scope.item.newName || $scope.item.newName.length == 0) {
            $scope.alerts = [{ type: "error", msg: "Name is required."}];
            return;
        }

        if ($scope.item.newName == $scope.item.displayName) $scope.showEdit(false);

        VMSrv.EditVmDisplyName($scope.item.instanceId, $scope.item.newName, $scope.userInfo.JSESSIONID, function(data) {
            if (data.success == "true") {
                $scope.item.displayName = $scope.item.newName;
                $scope.alerts = [];
                $scope.showEdit(false);
                $scope.$$prevSibling.refreshVM();
            }
            else $scope.alerts = [{ type: "error", msg: data.msg}];
        });
    };

    $scope.init();
};

/** Console Controller **/
function consoleCtrl($scope, globalValue, $location, VMSrv) {
    $scope.init = function() {
        var loginInfos = checkLogin();

        if (!loginInfos) {
            warnCommonFunc($dialog, dialogSrv, "Information", "Session expired.");
            return;
        }
        
        var url = $location.url();
        var index = url.lastIndexOf("id=") + 3;
        var instanceId = url.substr(index, url.length - index);
        if (instanceId.length == 0) return;

        VMSrv.ViewConsole(instanceId, loginInfos.JSESSIONID, function(data) {
            if (data.success == "true") {
                window.location = data.consoleUrl;
            }
        });
    }

    $scope.init();
}

/** Disk Detail Controller **/
function diskDetailCtrl($scope, $location, $dialog, dialogSrv, globalValue, dialog, VMSrv, DiskSrv) {
    $scope.init = function() {
        $scope.instanceId = globalValue.resouceDiskId;
        $scope.alerts = [];

        var loginInfos = checkLogin();

        if (!loginInfos) {
            var box = warnCommonFunc($dialog, dialogSrv, "Information", "Session expired.");
            box.then(function() {
                $location.path('/login');
                $location.replace();
            });
            return;
        }

        $scope.userInfo = loginInfos;
        $scope.loading = true;

        DiskSrv.GetDiskByInstanceId($scope.instanceId, loginInfos.JSESSIONID, function(data) {
            $scope.loading = false;

            if (data.success == "true") {
                $scope.item = data.disk;


                if ($scope.canAttach()) {
                    VMSrv.GetVmLists(loginInfos.JSESSIONID, function(data) {
                        if (data.success == "true") {
                            $scope.machines = data.vms;
                        }
                    });
                }

                $scope.alerts = [{ type: "success", msg: "Load hard disk information success."}];
            }
            else {
                if (data.msg == "Permission denied.") {
                    warnCommonFunc($dialog, dialogSrv, "Information", "Session expired.").then(function(){
                        $location.path("/login");
                        $location.replace();
                    });                    
                }
                else {
                    $scope.alerts = [{ type: "error", msg: data.msg}];
                    $scope.item = null;
                }
            }

        });
    };

    $scope.close = function(result) {
        globalValue.resouceDiskId = null;
        dialog.close(result);
    };
    
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    /* Disk Attach */
    $scope.canAttach = function() {
        return $scope.item != null && $scope.item.type != "ROOT" && $scope.item.state == "Detached" &&
            ($scope.item.vmName == null || $scope.item.vmName.length == 0);
    };

    $scope.attachClass = function() {
        return $scope.canAttach() ? "boxicon btn-mount" : "boxicon btn-mount_gr";
    };

    $scope.attachDisk = function() {
        if ($scope.item.vmInstanceId == null ||
            $scope.item.vmInstanceId.length == 0) {
            $scope.alerts = [{ msg: "Please select a virtual machine to attach."}];
            return;
        }

        var title = 'Confirmation';
        var msg = 'Please confirm that you want to attach this hard disk.';
        var btns = [{ result: 'no', label: 'No' }, { result: 'yes', label: 'Yes'}];

        var box = $dialog.messageBox(title, msg, btns).open();
        box.then(function(result) {
            if (result == 'yes') {
                DiskSrv.AttachDisk($scope.item.vmInstanceId, $scope.item.instanceId, $scope.userInfo.JSESSIONID, function(data) {
                    if (data.success == "true") {
                        $scope.item.vmInstanceId = data.disk.vmInstanceId;
                        $scope.item.vmName = data.disk.vmName;
                        $scope.item.state = data.disk.state;
                        $scope.close($scope.item);
                    }
                    else {
                        if (data.msg == "Permission denied.") {
                            var box = warnCommonFunc($dialog, dialogSrv, "Information", "Session expired.");
                            box.then(function() {
                                $location.path('/login');
                                $location.replace();
                            });
                        }
                        else $scope.alerts = [{ type: "error", msg: data.msg}];
                    }
                });
            }
        });
    };
    
    /* Disk Detach */
    $scope.canDetach = function() {
        return $scope.item != null && $scope.item.type != "ROOT" && $scope.item.vmName != null &&
            $scope.item.vmName.length != 0 && ($scope.item.state == "Attached" || $scope.item.state == "Ready");
    };

    $scope.detachClass = function() {
        return $scope.canDetach() ? "boxicon btn-mountno" : "boxicon btn-mountno_gr";
    };

    $scope.detachDisk = function() {
        var title = 'Confirmation';
        var msg = 'Please confirm that you want to detach this hard disk.';
        var btns = [{ result: 'no', label: 'No' }, { result: 'yes', label: 'Yes'}];

        var box = $dialog.messageBox(title, msg, btns).open();
        box.then(function(result) {
            if (result == 'yes') {
                DiskSrv.DetachDisk($scope.item.instanceId, $scope.userInfo.JSESSIONID, function(data) {
                    if (data.success == "true") {
                        $scope.item.vmInstanceId = $scope.item.vmName = null;
                        $scope.item.state = data.disk.state;
                        $scope.close($scope.item);
                    }
                    else {
                        if (data.msg == "Permission denied.") {
                            var box = warnCommonFunc($dialog, dialogSrv, "Information", "Session expired.");
                            box.then(function() {
                                $location.path('/login');
                                $location.replace();
                            });
                        }
                        else $scope.alerts = [{ type: "error", msg: data.msg}];
                    }
                });
            }
        });
    };
    
    /* Disk Delete */
    $scope.canDelete = function() {
        return $scope.item != null;
    };

    $scope.deleteClass = function() {
        return $scope.canDelete() ? "boxicon btn-delete" : "boxicon btn-delete_gr";
    };
    
    $scope.deleteDisk = function() {
        var title = 'Confirmation';
        var msg = 'Please confirm that you want to delete this hard disk.';
        var btns = [{ result: 'no', label: 'No' }, { result: 'yes', label: 'Yes'}];

        var box = $dialog.messageBox(title, msg, btns).open();
        box.then(function(result) {
            if (result == 'yes') {
                DiskSrv.DeleteDisk($scope.item.instanceId, $scope.userInfo.JSESSIONID, function(data) {
                    if (data.success == "true") {
                        warnCommonFunc($dialog, dialogSrv, "Information", "Delete success").then(function(){
                            $scope.close(data.disk);
                        });  
                    }
                    else {
                        if (data.msg == "Permission denied.") {
                            var box = warnCommonFunc($dialog, dialogSrv, "Information", "Session expired.");
                            box.then(function() {
                                $location.path('/login');
                                $location.replace();
                            });
                        }
                        else $scope.alerts = [{ type: "error", msg: data.msg}];
                    }
                });
            }
        });
    }

    /* Disk Backup */
    $scope.canBackup = function() {
        return $scope.item != null;
    };

    $scope.backupClass = function() {
        return $scope.canBackup() ? "boxicon btn-backup" : "boxicon btn-backup_gr";
    };
    
    $scope.backupDisk = function() {
        var title = 'Confirmation';
        var msg = 'Please confirm that you want to create a snapshot for this hard disk.';
        var btns = [{ result: 'no', label: 'No' }, { result: 'yes', label: 'Yes'}];

        var box = $dialog.messageBox(title, msg, btns).open();
        box.then(function(result) {
            if (result == 'yes') {
                DiskSrv.CreateSnapshot($scope.item.instanceId, $scope.userInfo.JSESSIONID, function(data) {
                    if (data.success == "true") {
                        $scope.alerts = [{ type: "success", msg: "Backup operation is working..."}];
                    }
                    else {
                        if (data.msg == "Permission denied.") {
                            var box = warnCommonFunc($dialog, dialogSrv, "Information", "Session expired.");
                            box.then(function() {
                                $location.path('/login');
                                $location.replace();
                            });
                        }
                        else $scope.alerts = [{ type: "error", msg: data.msg}];
                    }
                });
            }
        });
    }

    $scope.canSaveAs = function() {
        return $scope.item == null ? false : ($scope.item.type != "ROOT" ? false : true);
    };

    $scope.SaveTemplateClass = function() {
        return $scope.canSaveAs() ? "boxicon btn-saveTemplate" : "boxicon btn-saveTemplate_gr";
    }

    $scope.SaveTemplate = function() {
        
        globalValue.rootDiskName =  $scope.item.name;
        var opts = {
            backdrop: true,
            dialogFade: true,
            backdropFade: true,
            keyboard: true,
            backdropClick: false,
            templateUrl: 'resource-b1.htm',
            controller: 'diskTemplateCtrl'
        };

        var d = $dialog.dialog(opts);
        d.open().then(function(result) {
            if (result) {
            }
        });        
    }

    $scope.init();
};

/** Snapshot Detail Controller **/
function snapshotDetailCtrl($scope, $location, $dialog, dialogSrv, dialog, globalValue, SnapshotSrv) {
    $scope.init = function() {
        $scope.item = globalValue.resouceSnapshot;

        $scope.canRestore = $scope.item.state == "BackedUp";
        $scope.restoreClass = $scope.canRestore ? "boxicon btn-run" : "boxicon btn-run_gr";

        var loginInfos = checkLogin();

        if (!loginInfos) {
            var box = warnCommonFunc($dialog, dialogSrv, "Information", "Session expired.");
            box.then(function() {
                $location.path('/login');
                $location.replace();
            });
            
            return;
        }
        $scope.userInfo = loginInfos;
    };

    $scope.close = function(result) {
        globalValue.resouceSnapshot = null;
        dialog.close(result);
    };

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.restoreSS = function() {
        var title = 'Confirmation';
        var msg = 'Please confirm that you want to restore this snapshot.';
        var btns = [{ result: 'no', label: 'No' }, { result: 'yes', label: 'Yes'}];

        var box = $dialog.messageBox(title, msg, btns).open();
        box.then(function(result) {
            if (result == 'yes') {
                SnapshotSrv.Restore($scope.item.instanceId, $scope.userInfo.JSESSIONID, function(data) {
                    if (data.success == "true") {
                        warnCommonFunc($dialog, dialogSrv, "Information", "Restore success");                        
                    }
                    else {
                        if (data.msg == "Permission denied.") {
                            var box = warnCommonFunc($dialog, dialogSrv, "Information", "Session expired.");
                            box.then(function() {
                                $location.path('/login');
                                $location.replace();
                            });
                        }
                        else $scope.alerts = [{ type: "error", msg: data.msg}];
                    }
                });
            }
        });
    }

    $scope.deleteSS = function() {
        var title = 'Confirmation';
        var msg = 'Please confirm that you want to delete this snapshot.';
        var btns = [{ result: 'no', label: 'No' }, { result: 'yes', label: 'Yes'}];

        var box = $dialog.messageBox(title, msg, btns).open();
        box.then(function(result) {
            if (result == 'yes') {
                SnapshotSrv.Delete($scope.item.instanceId, $scope.userInfo.JSESSIONID, function(data) {
                    if (data.success == "true") {                        
                        warnCommonFunc($dialog, dialogSrv, "Information", "Delete success").then(function(){
                            $scope.close(data.snapshot);
                        });
                    }
                    else {
                        if (data.msg == "Permission denied.") {
                            var box = warnCommonFunc($dialog, dialogSrv, "Information", "Session expired.");
                            box.then(function() {
                                $location.path('/login');
                                $location.replace();
                            });
                        }
                        else $scope.alerts = [{ type: "error", msg: data.msg}];
                    }
                });
            }
        });
    }
   
    $scope.init();
};

function diskTemplateCtrl($scope, $location, $dialog, dialogSrv, globalValue, dialog) {
    $scope.diskInstanceId = globalValue.resouceDiskId;
    $scope.diskName = globalValue.rootDiskName;

    //$scope.template.name = "";
    $scope.alerts = [];

    $scope.close = function(result) {
        dialog.close(result);
    };

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.checkForm = function() {
        return $scope.template.name != null && $scope.template.name != "";
    };

    $scope.submit = function(trigger) {
        var formRequest = {};
        var msgs = [{ type: 'success', msg: 'The form submitted successfully!' }, { type: 'error', msg: 'The form submission failed!'}];

//        formRequest.approver = $scope.request.approver;
//        formRequest.purpose = $scope.request.purpose;

//        if ($scope.actions.current == "createVM") {
//            formRequest.tagName = $scope.request.name;

//            formRequest.zoneId = $scope.request.zone;
//            formRequest.imageSetId = $scope.request.osType.toString();
//            formRequest.computersettingSetId = $scope.request.vmSettingId.toString();

//            // var disksettings = $scope.request.diskSettingId.split('_');
//            formRequest.storageTags = $scope.request.enableHA ? "iscsi" : "local";
//            formRequest.totalDiskSize = $scope.request.diskSettingId;

//            RequestSrv.CreateVMRequest(formRequest, $scope.userInfo.JSESSIONID, function(data) {
//                if (data.success == "true") {
//                    $scope.clear();
//                    $scope.alerts = [msgs[0]];
//                } else {
//                    console.log(data);
//                    $scope.alerts = [msgs[1]];
//                }
//            });
//        }

    };

};