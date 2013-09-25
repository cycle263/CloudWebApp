function loginController($scope, $location, $dialog, LoginSrv, dialogSrv) {
    $scope.init = function() {
//        $scope.username = 'cc73';
//        $scope.password = 'baigycbn!017';

        var loginInfos = checkLogin();

        if (loginInfos) {
            $location.path('/request');
            $location.replace();
            return;
        }
    }

    $scope.login = function() {
        LoginSrv.login($scope.username, $scope.password, function(data) {
            if (data.isLogin == 'true' && data.jsessionid) {
                $location.path('/request');
                $location.replace();
                $scope.loginError = null;

                //                var date = new Date();
                //                date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));

                docCookies.setItem("JSESSIONID", data.jsessionid, 24 * 60 * 60 * 1000);

                $scope.alerts = [];
            }
            else {
                $scope.alerts = [{ type: 'error', msg: 'Invalid username and password.'}];
            }
        });
    };

    $scope.closeAlert = function() {
        $scope.alerts.splice(0, 1);
    };

    $scope.init();
};

function helpCtrl($scope, $location, Scroll, $dialog, dialogSrv) {
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
    $scope.scrollTo = Scroll.scrollTo;
};


google.load('visualization', '1', {packages: ['corechart']});

function reportCtrl($scope, $location, Scroll, $dialog, dialogSrv, ReportSrv){
    var loginInfos = checkLogin();
    var copyRows = [];    

    $scope.init = function(){ 
        $scope.query = {};
        $scope.chart = {};
        $scope.query.type = 'VM'; 
        $scope.chart.type = 'Table';
        $scope.loading = false; 
        $scope.initDatePicker();    

        if (!loginInfos) {
            var box = warnCommonFunc($dialog, dialogSrv, "Information", "Session expired.");
            box.then(function() {
                $location.path('/login');
                $location.replace();
            });
            return;
        }

        $scope.userInfo = loginInfos;
        $scope.scrollTo = Scroll.scrollTo;
    };

    $scope.initDatePicker = function() {
        $scope.dates = {};

        $scope.open = function(param) {
            $scope.opened1 = true;
            $scope.opened2 = true;
        };

        $scope.dateOptions = {
            'year-format': "'yy'",
            'starting-day': 1
        };

        $scope.today = function() {
            $scope.dates.dts = new Date();
            $scope.dates.dte = new Date();
        };
        $scope.today();


        $scope.showWeeks = true;
        $scope.toggleWeeks = function() {
            $scope.showWeeks = !$scope.showWeeks;
        };

        $scope.clear = function() {
            $scope.dates.dts = null;
            $scope.dates.dte = null;
        };
    };

    $scope.queryReportData = function(){ 
        //$scope.initChart();       
        if($scope.dates.dts > $scope.dates.dte){
            warnCommonFunc($dialog, dialogSrv, "Information", "Start date must be smaller");
        }else{
            $scope.loading = true;
            var dts = $scope.dates.dts, dte = $scope.dates.dte,
                sm1 = (dts.getMonth() + 1).toString(),
                em1 = dts.getDate().toString(),
                sm2 = (dte.getMonth() + 1).toString(),
                em2 = dte.getDate().toString(),

            dts = dts.getFullYear() + '-' + (sm1[1] ? sm1 : '0' + sm1) + '-' + (em1[1] ? em1 : '0' + em1);
            dte = dte.getFullYear() + '-' + (sm2[1] ? sm2 : '0' + sm2) + '-' + (em2[1] ? em2 : '0' + em2);

            console.log(dts);

            ReportSrv.GetUsage($scope.userInfo.JSESSIONID, $scope.query.type.toLowerCase(), dts, dte, function(data){
                if(data && data.success == 'true'){
                    $scope.initChart(data);                    
                }else{
                    warnCommonFunc($dialog, dialogSrv, 'Warn', data.msg);
                }
                $scope.loading = false;
            });
        }
    };

    $scope.initChart = function(data){      

        var chart1 = {}; 
        var vl = data.vmUsage ? data.vmUsage.length : 0;  
        var dl = data.diskUsage ? data.diskUsage.length : 0;  
        var sl = data.snapshotUsage ? data.snapshotUsage.length : 0;          

        chart1.type = "Table";
        chart1.displayed = false;
        chart1.cssStyle = "height:640px;width:910px;margin:5px 15px;";
        chart1.data = {
            "cols": [{
                id: "product-id",
                label: "Product Name",
                type: "string"
            },{
                id: "vm-id",
                label: "VM Usage",
                type: "number"
            }, {
                id: "disk-id",
                label: "Disk Usage",
                type: "number"
            }, {
                id: "snapshot-id",
                label: "Snapshot Size",
                type: "number"
            }],
            "rows": [{
                c: [{v: "VM-0001"}, 
                    {v: 19, f: '19 hr(s)'}, 
                    {v: 12, f: '12 hr(s)'},
                    {v: 7, f: '7 hr(s)'}]
            }, {
                c: [{v: "VM-0002"}, 
                    {v: 13, f: '13 hr(s)'}, 
                    {v: 10, f: '10 hr(s)'}, 
                    {v: 22, f: '22 hr(s)'}]
            }, {
                c: [{v: "VM-0003"}, 
                    {v: 29, f: '29 hr(s)'}, 
                    {v: 52, f: '52 hr(s)'},
                    {v: 11, f: '11 hr(s)'}]
            }, {
                c: [{v: "VM-0004"}, 
                    {v: 39, f: '39 hr(s)'}, 
                    {v: 22, f: '22 hr(s)'},
                    {v: 61, f: '61 hr(s)'}]
            }]
        };        

        function totalUsage(id, arr){
            var result = 0, num = 0;

            for(var t = 0, l = arr.length; t < l; t++){
                var vmId = arr[t].vmInstanceId ? arr[t].vmInstanceId : arr[t].virtualMachineId;
                if(vmId == id){
                    result += arr[t].usage;
                    num++;
                }
            }
            return {
                usage: result,
                num: num
            }; 
        }

        function inputCols(){
            var oldArr = chart1.data.cols;
            
            switch($scope.query.type){
                case 'All':
                    chart1.data.cols.splice(2);
                    chart1.data.cols[1].label = 'Product Usage';
                    break;
                case 'VM':
                    chart1.data.cols.splice(2);
                    break;
                case 'Disk':
                    chart1.data.cols.splice(3);
                    chart1.data.cols.splice(1, 1);
                    break;
                case 'Snapshot':
                    chart1.data.cols.splice(1, 2);
                    break;
                default:
                    break;
            }
        }

        function inputRows(){
            chart1.data.rows = [];

            switch($scope.query.type){
                case 'All':
                    for(var i = 0; i < vl; i++){
                        var v = data.vmUsage[i];                       

                        chart1.data.rows.push({
                            c:[{v: v.Name},
                            {v: v.UsageTime, f: v.UsageTime + ' hr(s)'}]
                        });
                    }
                    for(var i = 0; i < dl; i++){
                        var ds = data.diskUsage[i];                           

                        chart1.data.rows.push({
                            c:[{v: ds.Name},
                            {v:ds.UsageTime, f: ds.UsageTime + ' hr(s)'}]
                        });
                    }
                    for(var i = 0; i < sl; i++){
                        var ss = data.snapshotUsage[i];

                        var size = ss.Size / 1024 / 1024;

                        chart1.data.rows.push({
                            c:[{v: ss.Name},
                            {v:size, f: size + ' M'}]
                        });
                    }
                    break;
                case 'VM':
                    for(var i = 0; i < vl; i++){
                        var v = data.vmUsage[i];                       

                        chart1.data.rows.push({
                            c:[{v: v.Name},
                            {v: v.UsageTime, f: v.UsageTime + ' hr(s)'}]
                        });
                    }
                    break;
                case 'Disk':
                    for(var i = 0; i < dl; i++){
                        var ds = data.diskUsage[i];                           

                        chart1.data.rows.push({
                            c:[{v: ds.Name},
                            {v:ds.UsageTime, f: ds.UsageTime + ' hr(s)'}]
                        });
                    }
                    break;
                case 'Snapshot':
                    for(var i = 0; i < sl; i++){
                        var ss = data.snapshotUsage[i];

                        var size = ss.Size / 1024 / 1024;

                        chart1.data.rows.push({
                            c:[{v: ss.Name},
                            {v:size, f: size + ' M'}]
                        });
                    }
                    break;
            }
        }

        inputCols();
        inputRows();

        copyRows = chart1.data.rows;

        chart1.options = {
            "title": "Usage per machine",
            "isStacked": "true",
            "fill": 18,
            "displayExactValues": true,
            "vAxis": {
                "title": "Usage time",
                "gridlines": {
                    "count": 18
                }
            },
            "hAxis": {
                "title": "Product Name"
            },
            "is3D":true
        };

        $scope.chart = chart1;

        $scope.hideServer = false;
    };

    $scope.selectionChange = function() {                
        if($scope.chart.type == 'PieChart'){
            var arr = copyRows,
                l = arr.length, temp = [],
                len = arr[0].c ? arr[0].c.length : 0;

            for(var i = 0; i < l; i++){
                var total = 0;
                for(var j = 1; j < len; j++){
                    total += parseInt(arr[i].c[j].v);
                }
                if($scope.query.type != 'Snapshot'){
                    temp.push({c: [{v: arr[i].c[0].v}, {v: total, f: total + ' hr(s)'}]});
                }
                else{
                    temp.push({c: [{v: arr[i].c[0].v}, {v: total, f: total + ' M'}]});
                }
            }
            if($scope.chart.data)$scope.chart.data.rows = temp;
        }else{
            if($scope.chart.data)$scope.chart.data.rows = copyRows;
        }

        if ($scope.hideServer) {
            $scope.chart.view = {
                columns: [0, 1, 2]
            };
        } else {
            $scope.chart.view = {};
        }

    }

    $scope.init();    
}