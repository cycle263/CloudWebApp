'use strict';

var app = angular.module("cloudApp", ['cloudServices', 'ngCookies', 'ui.bootstrap', 'googlechart.directives']);

app.config(["$httpProvider","$locationProvider", function($http, $locationProvider) {
        $http.defaults.useXDomain = true;
        delete $http.defaults.headers.common['X-Requested-With'];
    }]);

    app.constant('globalValue', { "url": "http://10.16.140.102\\:8080/" });
    //app.constant('globalValue', { "url": "http://localhost\\:8080/" });

app.config(function($routeProvider) {
    $routeProvider.when('/index', { templateUrl: 'login.htm', controller: loginController });
    $routeProvider.when('/login', { templateUrl: 'login.htm', controller: loginController });
    $routeProvider.when('/resource', { templateUrl: 'resource.htm', controller: resourceCtrl });
    $routeProvider.when('/history', { templateUrl: 'requests_history.htm', controller: historyCtrl });
    $routeProvider.when('/help', { templateUrl: 'help.htm', controller: helpCtrl });
    $routeProvider.when('/admin', { templateUrl: 'admin.htm', controller: adminCtrl });
    $routeProvider.when('/request', { templateUrl: 'request.htm', controller: vmRequestCtrl });
    $routeProvider.when('/report', { templateUrl: 'report.htm', controller: reportCtrl });
    $routeProvider.otherwise({ redirectTo: '/index' });
});

/*template*/
app.run(function($templateCache) {
    $templateCache.put('approver/createVM/deny.html',
        '<div class="modal-header">' +
        '<h3>Deny Reason</h3>' +
        '</div>' +
        '<div class="modal-body">' +
        '<p>Enter a reason for denied the request: <br /><textarea required ng-model="results" /></p>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button loadingcontrol ng-disabled="!results" ng-click="submit(results)" class="deny" >Deny</button>' +
        '<button ng-click="cancel()" class="cancel" >Cancel</button>' +
        '</div>');
});

app.run(function($templateCache){
    $templateCache.put('common/tooltip.html',
        '<div class="tooltipBox"></div><span class="tooltipBox-arrow"></span>');
});

app.directive('tooltipdirc', function() {
    return {
        priority: 0,
        templateUrl: 'common/tooltip.html',
        restrict: 'A',
        replace: false,
        transclude: false,
        scope: true,
        controller: '',
        link: function(scope, ele, attrs) {
            var el = document.getElementsByClassName('tooltipBox')[0],
                arrow = document.getElementsByClassName('tooltipBox-arrow')[0];

            ele[0].parentElement.style.position = 'relative';
            //ele[0].parentElement.style.overflow = 'visible';

            angular.element(ele[0].parentElement).bind('mouseenter', function(e) {
                el.style.display = 'block';
                arrow.style.display = 'block';

                el.style.top = (ele[0].parentElement.offsetHeight + 18) + 'px';
                el.style.left = 0;
                arrow.style.top = ele[0].parentElement.offsetHeight - 6 + 'px';
                arrow.style.left = (ele[0].parentElement.clientWidth / 2) + 'px';
                el.textContent = attrs.tip;
            });

            angular.element(ele[0].parentElement).bind('mouseleave', function(e) {
                el.style.display = 'none';
                arrow.style.display = 'none';
            });
        }
    };
});

app.run(function($templateCache) {
    $templateCache.put('approver/createVM/itAgree.html',
        '<div class="modal-header">' +
        '<h3>IT Approve</h3>' +
        '</div>' +
        '<form class="modal-body">' +        
        '<label class="dialog-label">Domain </label><select ng-options="d.domainName for d in res.domains" ng-model="configs.domain" required></select><br />' +
        '<label class="dialog-label">Machine Name </label><input type="text" ng-model="configs.machineName" required />'+
        // '<button class="molt-btn check-domain-btn" ng-click="checkDomainName()" loadingcontrol>Check</button>'+
        // '<i id="icon-check" title="{{configs.title}}" class="{{configs.iconClass}}"></i><br />' +
        '<label class="dialog-label netlabel">Network Id </label>'+
        '<select class="netSelectbox" ng-options="n.Name for n in res.networks" ng-model="configs.networkId" required></select>'+
        // '<ol class="netList"><li ng-repeat="item in res.networks">'+
        // '<input type="checkbox" id="{{item.Name}}Checked" ng-change="checkedChange(item)" ng-model="item.checked" required /><label class="label-check" for="{{item.Name}}Checked"><span></span>{{item.Name}}</label>'+
        // '<input ng-disabled="!item.checked" type="radio" id="{{item.Name}}" required name="optionsDefault" value="{{item.Name}}" ng-model="item.selected" ng-change="selectChange(item)" />'+
        // '<label ng-disabled="!item.checked" for="{{item.Name}}"><span ng-disabled="!item.checked"></span>Default</label>'+
        // '</li></ol>'+
        '<i ng-click="add(configs.networkId)" class="icon-plus"></i>' +
        '<p class="networks-repeat" ng-repeat="id in configs.networkIds">' +
        '<span>{{$index + 1}}.</span><span>{{id.Name}}</span>' +
        '<label for="{{id.Id}}"><input type="radio" id="{{id.Id}}" name="optionsDefault" value="{{id.Id}}" ng-model="configs.default" ng-change="selectChange(id.Id)">Default</label>' +
        '<i class="icon-minus" ng-click="remove(id)"></i></p>'+
        '</form>' +
        '<div class="modal-footer">' +
        '<button loadingcontrol ng-disabled="!configs.machineName || !configs.domain || !configs.networkId" ng-click="submit(configs)" class="deny" >Agree</button>' +
        '<button ng-click="cancel()" class="cancel" >Cancel</button>' +
        '</div>');
});

app.run(function($templateCache) {
    $templateCache.put('approver/createVM/depAgree.html',
        '<div class="modal-header">' +
        '<h3>Agree Reason</h3>' +
        '</div>' +
        '<div class="modal-body">' +
        '<p>Enter a reason for agree the request: <br /><textarea ng-model="results" /></p>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button loadingcontrol ng-click="submit(results)" class="deny" >Agree</button>' +
        '<button ng-click="cancel()" class="cancel" >Cancel</button>' +
        '</div>');
});

app.run(function($templateCache) {
    $templateCache.put('common/warnBox.html',                
        '<div parentadjust class="warnBox-header">' +
        '<h3>{{box.title}}</h3>' +
        '</div>' +
        '<div class="warnBox-body modal-body">' +
        '<p>{{box.content}}</p>' +
        '</div>' +
        '<div class="warnBox-footer modal-footer">' +      
        '<button ng-click="ok()" class="molt-btn" >OK</button>' +
        '</div>');
});

app.run(function($templateCache){
    $templateCache.put('viewDetail/createVmRequest.html',
        '<div vmdetailframe id="vm_detail_back" class="detail_container"></div>' +
        '<div draggable id="vm_request_detail" class="request_detail">' +
            '<h2 class="detail_title">VM Request Detail Info<i vmdetailframe></i></h2>' +
            '<table class="detail_table table table-striped table-hover">' +
                '<tr><th>RequestID</th><td>{{vmDetail.requestId}}</td></tr>' +
                '<tr><th>Name</th><td>{{vmDetail.tagName}}</td></tr>' +
                '<tr><th>Approver</th><td>{{vmDetail.approver}}</td></tr>' +
                '<tr><th rowspan="4">computer Setting</th><td><span>OS Type</span>{{vmDetail.image.ostype}}</td></tr>' +
                '<tr><td><span>CPU Number</span>{{vmDetail.computerSetting.cpunumber}}</td></tr>' +
                '<tr><td><span>CPU Speed</span>{{vmDetail.computerSetting.cpuspeed}}HZ</td></tr>' +
                '<tr><td><span>Memory</span>{{vmDetail.computerSetting.memorysize}}M</td></tr>' +
                '<tr><th>Zone name</th><td>{{vmDetail.zone.name}}</td></tr>' +
                '<tr><th>Purpose</th><td>{{vmDetail.purpose}}</td></tr>' +
                '<tr><th>Volume Size</th><td>{{vmDetail.diskSize}}G</td></tr>' +     
                '<tr><th>State</th><td>{{vmDetail.status}}</td></tr>' +                
                '<tr><th>ApproveTime</th><td>{{vmDetail.depApproveDenyTime | date: "yyyy-MM-dd HH:mm:ss"}}</td></tr>' +
                '<tr><th>AgreeComment</th><td>{{vmDetail.approvComment}}</td></tr>' +
                '<tr><th>DenyComment</th><td>{{vmDetail.denyComment}}</td></tr>' +
                '<tr><th>Created</th><td>{{vmDetail.created | date: "yyyy-MM-dd HH:mm:ss"}}</td></tr>' +     
            '</table>' +
        '</div>');
});

app.run(function($templateCache){
    $templateCache.put('viewDetail/createDiskRequest.html',
        '<div diskdetailframe id="disk_detail_back" class="detail_container"></div>' +
        '<div draggable id="disk_request_detail" class="request_detail">' +
            '<h2 class="detail_title">Disk Request Detail Info<i diskdetailframe></i></h2>' +
            '<table class="detail_table table table-striped table-hover">' +
                '<tr><th>RequestID</th><td>{{diskDetail.requestId}}</td></tr>' +
                '<tr><th>Name</th><td>{{diskDetail.name}}</td></tr>' +
                '<tr><th>Zone name</th><td>{{diskDetail.zone.name}}</td></tr>' +
                '<tr><th>Purpose</th><td>{{diskDetail.purpose}}</td></tr>' +  
                '<tr><th>Approver</th><td>{{diskDetail.approver}}</td></tr>' +               
                '<tr><th rowspan="2">Disk Setting</th><td><span>Disk Type</span>{{diskDetail.diskSetting.name}}</td></tr>' +
                '<tr><td><span>Disk Size</span>{{diskDetail.diskSetting.disksize}}G</td></tr>' +
                '<tr><th>Created</th><td>{{diskDetail.created | date: "yyyy-MM-dd HH:mm:ss"}}</td></tr>' + 
                '<tr><th>State</th><td>{{diskDetail.status}}</td></tr>' +                
                '<tr><th>Group</th><td>{{diskDetail.group}}</td></tr>' +  
                '<tr><th>ApproveTime</th><td>{{diskDetail.approveDenyTime | date: "yyyy-MM-dd HH:mm:ss"}}</td></tr>' +
                '<tr><th>Approve Comment</th><td>{{diskDetail.comment}}</td></tr>' +            
            '</table>' +
        '</div>');
});

app.run(function($templateCache){
    $templateCache.put('viewDetail/createDVmRequest.html',
        '<div delvmdetailframe id="delvm_detail_back" class="detail_container"></div>' +
        '<div draggable id="delvm_request_detail" class="request_detail">' +
            '<h2 class="detail_title">Delete VM Request Detail Info<i delvmdetailframe></i></h2>' +
            '<table class="detail_table table table-striped table-hover">' +
                '<tr><th>Name</th><td>{{delVmDetail.virtualMachine.displayName}}</td></tr>' +
                '<tr><th>Purpose</th><td>{{delVmDetail.purpose}}</td></tr>' +
                '<tr><th>Approver</th><td>{{delVmDetail.approver}}</td></tr>' +
                '<tr><th>Zone name</th><td>{{delVmDetail.virtualMachine.zone.zoneName}}</td></tr>' +
                '<tr><th rowspan="4">Computer Setting</th><td><span>OS Type</span>{{delVmDetail.virtualMachine.osName}}</td></tr>' +
                '<tr><td><span>CPU Number</span>{{delVmDetail.virtualMachine.cpuNumber}}</td></tr>' +
                '<tr><td><span>CPU Speed</span>{{delVmDetail.virtualMachine.cpuSpeed}}HZ</td></tr>' +
                '<tr><td><span>Memory</span>{{delVmDetail.virtualMachine.memorySize}}M</td></tr>' +
                '<tr><th rowspan="2">Disk Setting</th><td><span>Disk Number</span>{{delVmDetail.virtualMachine.disks.length || 0}}</td></tr>' +
                '<tr><td><span>Total Size</span>{{totalDiskSize}}G</td></tr>' +              
                '<tr><th rowspan="{{delVmDetail.virtualMachine.nics.length}}">Network</th><td>{{delVmDetail.virtualMachine.nics[0].ipaddress}}</td></tr>' +
                '<tr ng-repeat="item in delVmDetail.virtualMachine.nics.slice(1,delVmDetail.virtualMachine.nics.length)"><td>{{item.ipaddress}}</td></tr> ' +                                  
                '<tr><th>State</th><td>{{delVmDetail.virtualMachine.state}}</td></tr>' +
                '<tr><th>Created</th><td>{{delVmDetail.created | date: "yyyy-MM-dd HH:mm:ss"}}</td></tr>' +
                '<tr><th>ApproveTime</th><td>{{delVmDetail.approveDenyTime | date:"yyyy-MM-dd HH:mm:ss"}}</td></tr>' +
                '<tr><th>Approve Comment</th><td>{{delVmDetail.approvComment || delVmDetail.denyComment}}</td></tr>' +               
           ' </table>' +
        '</div>');
});

/**update vm request */
app.run(function($templateCache) {
    $templateCache.put('approver/updateVM/agree.html',
        '<div class="modal-header">' +
        '<h3>Agree Reason</h3>' +
        '</div>' +
        '<div class="modal-body">' +
        '<p>Enter a reason for agree the request: <br /><textarea ng-model="results" /></p>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button loadingcontrol ng-click="submit(results)" class="deny" >Agree</button>' +
        '<button ng-click="cancel()" class="cancel" >Cancel</button>' +
        '</div>');
});

app.run(function($templateCache) {
    $templateCache.put('approver/UpdateVM/deny.html',
        '<div class="modal-header">' +
        '<h3>Deny Reason</h3>' +
        '</div>' +
        '<div class="modal-body">' +
        '<p>Enter a reason for denied the request: <br /><textarea required ng-model="results" /></p>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button loadingcontrol ng-disabled="!results" ng-click="submit(results)" class="deny" >Deny</button>' +
        '<button ng-click="cancel()" class="cancel" >Cancel</button>' +
        '</div>');
});

app.run(function($templateCache) {
    $templateCache.put('viewDetail/updateVmRequest.html',
        '<div editvmdetailframe id="editvm_detail_back" class="detail_container"></div>' +
        '<div draggable id="editvm_request_detail" class="request_detail">' +
            '<h2 class="detail_title">Upgrade VM Request Detail Info<i editVmdetailframe></i></h2>' +
            '<table class="detail_table table table-striped table-hover">' +
                '<tr><th>RequestID</th><td>{{editVmDetail.requestId}}</td></tr>' +
                '<tr><th>Name</th><td>{{editVmDetail.vm.displayName}}</td></tr>' +
                '<tr><th>Approver</th><td>{{editVmDetail.approver}}</td></tr>' +
                '<tr><th rowspan="4">computer Setting</th><td><span>OS Type</span>{{editVmDetail.vm.osName}}</td></tr>' +
                '<tr><td><span>CPU Number</span>{{editVmDetail.vm.cpuNumber}}</td></tr>' +
                '<tr><td><span>CPU Speed</span>{{editVmDetail.vm.cpuSpeed}}HZ</td></tr>' +
                '<tr><td><span>Memory</span>{{editVmDetail.vm.memorySize}}M</td></tr>' +
                '<tr><th>Zone name</th><td>{{editVmDetail.zone.name}}</td></tr>' +
                '<tr><th>Purpose</th><td>{{editVmDetail.purpose}}</td></tr>' +
                '<tr><th>Volume Size</th><td>{{editVmDetail.diskSize}}G</td></tr>' +
                '<tr><th>State</th><td>{{editVmDetail.status}}</td></tr>' +
                '<tr><th>ApproveTime</th><td>{{editVmDetail.depApproveDenyTime | date: "yyyy-MM-dd HH:mm:ss"}}</td></tr>' +
                '<tr><th>AgreeComment</th><td>{{editVmDetail.approvComment}}</td></tr>' +
                '<tr><th>DenyComment</th><td>{{editVmDetail.denyComment}}</td></tr>' +
                '<tr><th>Created</th><td>{{editVmDetail.created | date: "yyyy-MM-dd HH:mm:ss"}}</td></tr>' +
            '</table>' +
        '</div>');
});

/*loading*/
app.directive('loadingcontrol', function(){
    return function(scope, element, attrs){
        element.bind('click', function(e){
            var x = e.pageX,
                y = e.pageY;
            $('.ajax_loading').css('display', 'block').css('top', y+2).css('left', x+12);
        });
    };
});

/*Control input in keyboard*/
app.directive('verifyinput', function(){
    return function(scope, ele, attrs) {
        scope.warns = [];

        ele.bind('keypress', function(event) {
            var charCode = typeof event.charCode == 'number' ? event.charCode : event.keyCode;            
            if (!/[\w]/.test(String.fromCharCode(charCode)) && event.keyCode != 8 && event.keyCode != 32 && event.keyCode != 45 && !(event.shiftKey && event.keyCode >= 65 && event.keyCode <= 90) || (event.shiftKey && event.keyCode == 95)) {
                event.preventDefault ? event.preventDefault() : (event.returnValue = false);
            }
        });

        ele.bind('blur', function(event){
            var reg = /[\@\#\~\`\$\%\^\&\*\(\)\+\=\￥]+/g;
            if(reg.test(scope.request.name)){
                scope.warns = [{type:'error',msg:'Name with special characters'}];            
            }else{
                scope.warns = [];               
            }
            scope.$apply();
        });

        scope.closeWarn = function(i){
            ele[0].focus();
            scope.warns.splice(i, 1);
        };
    };
});

app.directive('parentadjust', function(){
    return function(scope, ele, attrs){
        ele.context.parentElement.style.width = "270px";
        ele.context.parentElement.style.marginLeft = "-135px";
        ele.context.parentElement.style.zIndex = '1100';

        if(!document.getElementById('warn_add_back')){
            $('body').append('<div id="warn_add_back" class="detail_container"></div>');
        }        
        $('#warn_add_back').css('display', 'block');
    };
});

app.directive('messageadjust', function(){
    return function(scope, ele, attrs){
        var d = document;
        ele.context.parentElement.style.width = "500px";
        ele.context.parentElement.style.marginLeft = "-250px";
        ele.context.parentElement.style.zIndex = '1090'; 
        
        if(!d.getElementById('warn_add_back')){
            $('body').append('<div id="warn_add_back" class="detail_container"></div>');
        }
        
        if(d.getElementsByClassName('modal').length == 1 && d.getElementsByClassName('modal-backdrop').length == 1)
            $('#warn_add_back').css('display', 'block');    
    };
});

app.directive('vmdetailframe', function(){
    return function(scope, element, attrs){
        element.bind('click', function(event){
            $('#vm_request_detail').toggle('fade');
            $('#vm_detail_back').toggle('fade');
        });
    };
});

app.directive('diskdetailframe', function(){
    return function(scope, element, attrs){
        element.bind('click', function(event){
            $('#disk_request_detail').toggle('fade');
            $('#disk_detail_back').toggle('fade');
        });
    };
});

app.directive('delvmdetailframe', function(){
    return function(scope, element, attrs){
        element.bind('click', function(event){
            $('#delvm_request_detail').toggle('fade');
            $('#delvm_detail_back').toggle('fade');
        });
    };
});

app.directive('editvmdetailframe', function() {
    return function(scope, element, attrs) {
        element.bind('click', function(event) {
            $('#editvm_request_detail').toggle('fade');
            $('#editvm_detail_back').toggle('fade');
        });
    };
});


app.directive('selectedboxshadow', function(){
    return function(scope, element, attrs){
        element.bind('change', function(e){
            var eles = document.getElementsByClassName('cdst');
            for(var i = 0, l = eles.length; i < l; i++){
                if(eles[i].checked){
                    eles[i].parentElement.style.boxShadow = "0 0 10px 10px #aaa";
                }else{
                    eles[i].parentElement.style.boxShadow = "";
                }
            }
        });
    };
});

app.directive('refreshapprove', function(){
    return function(scope, element, attrs){
        element.bind('click', function(event){
            var ele = event.target || event.srcElement,
                tr = ele.parentElement.parentElement,
                tbody = ele.parentElement.parentElement.parentElement;
            if(tbody.tagName == "TBODY"){
                tbody.removeChild(tr);
            }
        });
    };
});

app.directive('draggable', function($document) {
    return function(scope, element, attr) {
        var startX = 0,
            startY = 0,
            eleX = 0,
            eleY = 0,
            x = 0,
            y = 0;

        element.on('mousedown', function(event) {
            // Prevent default dragging of selected content
            event.preventDefault();

            eleX = parseInt(element.css('left'));
            eleY = parseInt(element.css('top'));
            startX = event.pageX - eleX;
            startY = event.pageY - eleY;

            $document.on('mousemove', mousemove);
            $document.on('mouseup', mouseup);
        });

        function mousemove(event) {
            y = event.pageY - startY;
            x = event.pageX - startX;

            element.css({
                top: y + 'px',
                left: x + 'px'
            });
        }

        function mouseup() {
            $document.unbind('mousemove', mousemove);
            $document.unbind('mouseup', mouseup);
        }
    };
});

app.filter('statusFilter', function() {
    return function(input, query) {
        if (!input) return;
        if (!query) return input;
        var reqlist = [];

        for (var i = 0; i < input.length; i++) {
            for (var j = 0; j < query.length; j++) {
                if (query[j].checked == true &&
                   input[i].status == query[j].status) {
                    reqlist.push(input[i]);
                    break;
                }
            }
        }

        return reqlist;
    };
});

var cs = angular.module("cloudServices", ['ngResource']);

