/*
Written by Joshua Fabian
August 2016, MIT Transit Lab
jfabi@alum.mit.edu, joshuajfabian@gmail.com

Last updated 2 March 2018
*/

apiKey = config.PERFORMANCE_API_KEY

var time = document.getElementsByClassName('timeField'); //Get all elements with class "time"
for (var i = 0; i < time.length; i++) { //Loop trough elements
    time[i].addEventListener('keyup', function (e) {; //Add event listener to every element
        var reg = /[0-9]/;
        if (this.value.length == 2 && reg.test(this.value)) this.value = this.value + ":"; //Add colon if string length > 2 and string is a number 
        if (this.value.length > 5) this.value = this.value.substr(0, this.value.length - 1); //Delete the last digit if string length > 5
    });
};
        
function nextHeadwayUpdate() {

    console.log("ready to go");
    document.getElementById("dwellsT").innerHTML = 'Please wait. Your diagram is currently baking...<br>&nbsp;';

    setTimeout(function() {

        // parse input date into epoch time, set beginning and ending time to search
        // by default, we search from 04:00 of chosen day until 03:00 next morning

        // also obtain a reference midnight time so that epoch times can be later converted
        // into generic seconds from midnight

        var day = document.getElementById("dy");
        var month = document.getElementById("mo");
        var year = document.getElementById("yr");
        var startTime = document.getElementById("stm");
        var endTime = document.getElementById("etm");

        console.log(day.value);
        console.log(month.value);
        console.log(year.value);
        console.log(startTime.value);
        console.log(endTime.value);

        var dateMidnight = new Date(year.value, month.value-1, day.value, 0, 0, 0, 0);
        var timeFromAsDate;
        var timeToAsDate;

        if (startTime == '') {
            var dateFrom = new Date(year.value, month.value-1, day.value, 4, 0, 0, 0);
        } else {
            var startHour = startTime.value.substring(0,2).valueOf();
            var startMin = startTime.value.substring(3,5).valueOf();

            console.log(startHour);
            console.log(startMin);

            var dateFrom = new Date(year.value, month.value-1, day.value, startHour, startMin, 0, 0);
        }

        timeFromAsDate = dateFrom;
        var timeTo;
        if (endTime == '') {
            var dateToTemp = new Date(year.value, month.value-1, day.value, 3, 0, 0, 0);
            var dateTo = dateToTemp.setDate(dateToTemp.getDate() + 1);
            timeTo = dateTo / 1000;
            timeToAsDate = new Date(dateTo);
        } else {
            var endHour = endTime.value.substring(0,2).valueOf();
            var endMin = endTime.value.substring(3,5).valueOf();

            console.log(endHour);
            console.log(endMin);

            if (endHour < 24) {
                var dateTo = new Date(year.value, month.value-1, day.value, endHour, endMin, 0, 0);
                timeTo = dateTo.getTime() / 1000;
                timeToAsDate = dateTo;
            } else {
                var dateToTemp = new Date(year.value, month.value-1, day.value, endHour-24, endMin, 0, 0);
                var dateTo = dateToTemp.setDate(dateToTemp.getDate() + 1);
                timeTo = dateTo / 1000;
                timeToAsDate = new Date(dateTo);
            }
        }

        console.log(dateFrom);
        console.log(dateTo);

        var midnight = dateMidnight.getTime() / 1000;
        var timeFrom = dateFrom.getTime() / 1000;

        console.log(midnight);
        console.log(timeFrom);
        console.log(timeTo);

        // add 0 seconds of buffer time to plot before timeFrom and after timeTo

        var timeFromUse = timeFrom - 0;
        var timeToUse = timeTo + 0;

        // define route, which here is eastbound C-branch on MBTA Green Line

        var allSegments = [];

        var e = document.getElementById("routeInput");
        var routeInputText = e.options[e.selectedIndex].value;

        var direction, branchText, tableOfStops, branchTextToCheck;

        if (routeInputText == 'C-EB') {

            direction = 'Eastbound';
            branchText = 'Green Line Beacon St - ' + direction;
            branchTextToCheck = 'Green-C'; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70238,'Cleveland Circle'],
                [1,70236,'Englewood Av'],
                [2,70234,'Dean Rd'],
                [3,70232,'Tappan St'],
                [4,70230,'Washington Sq'],
                [5,70228,'Fairbanks St'],
                [6,70226,'Brandon Hall'],
                [7,70224,'Summit Av'],
                [8,70220,'Coolidge Corner'],
                [9,70218,'St Paul St'],
                [10,70216,'Kent St'],
                [11,70214,'Hawes St'],
                [12,70212,'St Mary St'],
                [13,70150,'Kenmore'],
                [14,70152,'Hynes'],
                [15,70154,'Copley'],
                [16,70156,'Arlington'],
                [17,70158,'Boylston'],
                [18,70200,'Park St'],
                [19,70201,'Government Ctr'],
                [20,70203,'Haymarket'],
                [21,70205,'North Station'],
                [22,70207,'Science Park'],
                [23,70209,'Lechmere']
            ];
        } else if (routeInputText == 'C-WB') {

            direction = 'Westbound';
            branchText = 'Green Line Beacon St - ' + direction;
            branchTextToCheck = 'Green-C'; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70210,'Lechmere'],
                [1,70208,'Science Park'],
                [2,70206,'North Station'],
                [3,70204,'Haymarket'],
                [4,70202,'Government Ctr'],
                [5,70197,'Park St'],
                [6,70159,'Boylston'],
                [7,70157,'Arlington'],
                [8,70155,'Copley'],
                [9,70153,'Hynes'],
                [10,70151,'Kenmore'],
                [11,70211,'St Mary St'],
                [12,70213,'Hawes St'],
                [13,70215,'Kent St'],
                [14,70217,'St Paul St'],
                [15,70219,'Coolidge Corner'],
                [16,70223,'Summit Av'],
                [17,70225,'Brandon Hall'],
                [18,70227,'Fairbanks St'],
                [19,70229,'Washington Sq'],
                [20,70231,'Tappan St'],
                [21,70233,'Dean Rd'],
                [22,70235,'Englewood Av'],
                [23,70237,'Cleveland Circle']
            ];
        } else if (routeInputText == 'B-EB') {

            direction = 'Eastbound';
            branchText = 'Green Line Commonwealth Av - ' + direction;
            branchTextToCheck = 'Green-B'; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70106,'Boston College'],
                [1,70110,'South St'],
                [2,70112,'Chestnut Hill Av'],
                [3,70114,'Chiswick Rd'],
                [4,70116,'Sutherland Rd'],
                [5,70120,'Washington St'],
                [6,70124,'Warren St'],
                [7,70126,'Allston St'],
                [8,70128,'Griggs St'],
                [9,70130,'Harvard Av'],
                [10,70134,'Packards Corner'],
                [11,70136,'Babcock St'],
                [12,70138,'Pleasant St'],
                [13,70140,'St Paul St'],
                [14,70142,'BU West'],
                [15,70144,'BU Central'],
                [16,70146,'BU East'],
                [17,70148,'Blandford St'],                
                [18,70150,'Kenmore'],
                [19,70152,'Hynes'],
                [20,70154,'Copley'],
                [21,70156,'Arlington'],
                [22,70158,'Boylston'],
                [23,70200,'Park St'],
                [24,70201,'Government Ctr']
            ];
        } else if (routeInputText == 'B-WB') {

            direction = 'Westbound';
            branchText = 'Green Line Commonwealth Av - ' + direction;
            branchTextToCheck = 'Green-B'; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70202,'Government Ctr'],
                [1,70196,'Park St'],
                [2,70159,'Boylston'],
                [3,70157,'Arlington'],
                [4,70155,'Copley'],
                [5,70153,'Hynes'],
                [6,70151,'Kenmore'],
                [7,70149,'Blandford St'],
                [8,70147,'BU East'],
                [9,70145,'BU Central'],
                [10,70143,'BU West'],
                [11,70141,'St Paul St'],
                [12,70139,'Pleasant St'],
                [13,70137,'Babcock St'],
                [14,70135,'Packards Corner'],
                [15,70131,'Harvard Av'],
                [16,70129,'Griggs St'],
                [17,70127,'Allston St'],
                [18,70125,'Warren St'],
                [19,70121,'Washington St'],
                [20,70117,'Sutherland Rd'],
                [21,70115,'Chiswick Rd'],
                [22,70113,'Chestnut Hill Av'],
                [23,70111,'South St'],
                [24,70107,'Boston College']
            ];
        } else if (routeInputText == 'D-EB') {

            direction = 'Eastbound';
            branchText = 'Green Line Highland - ' + direction;
            branchTextToCheck = 'Green-D'; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70160,'Riverside'],
                [1,70162,'Woodland'],
                [2,70164,'Waban'],
                [3,70166,'Eliot'],
                [4,70168,'Newton Highlands'],
                [5,70170,'Newton Ctr'],
                [6,70172,'Chestnut Hill'],
                [7,70174,'Reservoir'],
                [8,70176,'Beaconsfield'],
                [9,70178,'Brookline Hills'],
                [10,70180,'Brookline Village'],
                [11,70182,'Longwood'],
                [12,70186,'Fenway'],
                [13,70150,'Kenmore'],
                [14,70152,'Hynes'],
                [15,70154,'Copley'],
                [16,70156,'Arlington'],
                [17,70158,'Boylston'],
                [18,70200,'Park St'],
                [19,70201,'Government Ctr'],
                [20,70203,'Haymarket'],
                [21,70205,'North Station']
            ];
        } else if (routeInputText == 'D-WB') {

            direction = 'Westbound';
            branchText = 'Green Line Highland - ' + direction;
            branchTextToCheck = 'Green-D'; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70206,'North Station'],
                [1,70204,'Haymarket'],
                [2,70202,'Government Ctr'],
                [3,70198,'Park St'],
                [4,70159,'Boylston'],
                [5,70157,'Arlington'],
                [6,70155,'Copley'],
                [7,70153,'Hynes'],
                [8,70151,'Kenmore'],
                [9,70187,'Fenway'],
                [10,70183,'Longwood'],
                [11,70181,'Brookline Village'],
                [12,70179,'Brookline Hills'],
                [13,70177,'Beaconsfield'],
                [14,70175,'Reservoir'],
                [15,70173,'Chestnut Hill'],
                [16,70171,'Newton Ctr'],
                [17,70169,'Newton Highlands'],
                [18,70167,'Eliot'],
                [19,70165,'Waban'],
                [20,70163,'Woodland'],
                [21,70161,'Riverside']
            ];
        } else if (routeInputText == 'E-EB') {

            direction = 'Eastbound';
            branchText = 'Green Line Heath St - ' + direction;
            branchTextToCheck = 'Green-E'; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70260,'Heath St'],
                [1,70258,'Back of the Hill'],
                [2,70256,'Riverway'],
                [3,70254,'Mission Park'],
                [4,70252,'Fenwood Rd'],
                [5,70250,'Brigham Circle'],
                [6,70248,'Longwood Medical'],
                [7,70246,'MFA'],
                [8,70244,'Northeastern'],
                [9,70242,'Symphony'],
                [10,70240,'Prudential'],
                [11,70154,'Copley'],
                [12,70156,'Arlington'],
                [13,70158,'Boylston'],
                [14,70200,'Park St'],
                [15,70201,'Government Ctr'],
                [16,70203,'Haymarket'],
                [17,70205,'North Station'],
                [18,70207,'Science Park'],
                [19,70209,'Lechmere']
            ];
        } else if (routeInputText == 'E-WB') {

            direction = 'Westbound';
            branchText = 'Green Line Heath St - ' + direction;
            branchTextToCheck = 'Green-E'; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70210,'Lechmere'],
                [1,70208,'Science Park'],
                [2,70206,'North Station'],
                [3,70204,'Haymarket'],
                [4,70202,'Government Ctr'],
                [5,70199,'Park St'],
                [6,70159,'Boylston'],
                [7,70157,'Arlington'],
                [8,70155,'Copley'],
                [9,70239,'Prudential'],
                [10,70241,'Symphony'],
                [11,70243,'Northeastern'],
                [12,70245,'MFA'],
                [13,70247,'Longwood Medical'],
                [14,70249,'Brigham Circle'],
                [15,70251,'Fenwood Rd'],
                [16,70253,'Mission Park'],
                [17,70255,'Riverway'],
                [18,70257,'Back of the Hill'],
                [19,70259,'Heath St']
            ];
        } else if (routeInputText == 'GT-EB') {

            direction = 'Eastbound';
            branchText = 'Green Line Subway - ' + direction;
            branchTextToCheck = ''; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70150,'Kenmore'],
                [1,70152,'Hynes'],
                [2,70154,'Copley'],
                [3,70156,'Arlington'],
                [4,70158,'Boylston'],
                [5,70200,'Park St'],
                [6,70201,'Government Ctr'],
                [7,70203,'Haymarket'],
                [8,70205,'North Station'],
                [9,70207,'Science Park'],
                [10,70209,'Lechmere']
            ];
        } else if (routeInputText == 'GT-WB') {

            direction = 'Westbound';
            branchText = 'Green Line Subway - ' + direction;
            branchTextToCheck = ''; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName,nextStopID (OPT),nextStopName (OPT)]
            tableOfStops = [
                [0,70210,'Lechmere'],
                [1,70208,'Science Park'],
                [2,70206,'North Station'],
                [3,70204,'Haymarket'],
                [4,70202,'Government Ctr',5,70196,'Park St'],
                [4,70202,'Government Ctr',5,70197,'Park St'],
                [4,70202,'Government Ctr',5,70198,'Park St'],
                [4,70202,'Government Ctr',5,70199,'Park St'],
                [5,70196,'Park St',6,70159,'Boylston'],
                [5,70197,'Park St',6,70159,'Boylston'],
                [5,70198,'Park St',6,70159,'Boylston'],
                [5,70199,'Park St',6,70159,'Boylston'],
                [6,70159,'Boylston'],
                [7,70157,'Arlington'],
                [8,70155,'Copley'],
                [9,70153,'Hynes'],
                [10,70151,'Kenmore']
            ];
        } else if (routeInputText == 'RedT-NB') {

            direction = 'Northbound';
            branchText = 'Red Line Subway - ' + direction;
            branchTextToCheck = ''; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70086,'JFK/UMass',1,70084,'Andrew'],
                [0,70096,'JFK/UMass',1,70084,'Andrew'],
                [1,70084,'Andrew'],
                [2,70082,'Broadway'],
                [3,70080,'South Station'],
                [4,70078,'Downtown Crossing'],
                [5,70076,'Park St'],
                [6,70074,'Charles St/MGH'],
                [7,70072,'Kendall Sq/MIT'],
                [8,70070,'Central Sq'],
                [9,70068,'Harvard Sq'],
                [10,70066,'Porter Sq'],
                [11,70064,'Davis Sq'],
                [12,70061,'Alewife']
            ];
            // note: might or might not work better if Alewife had two separate stopIDs,
            // one at 70061 and another at 70062
        } else if (routeInputText == 'RedT-SB') {

            direction = 'Southbound';
            branchText = 'Red Line Subway - ' + direction;
            branchTextToCheck = ''; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70061,'Alewife'],
                [1,70063,'Davis Sq'],
                [2,70065,'Porter Sq'],
                [3,70067,'Harvard Sq'],
                [4,70069,'Central Sq'],
                [5,70071,'Kendall Sq/MIT'],
                [6,70073,'Charles St/MGH'],
                [7,70075,'Park St'],
                [8,70077,'Downtown Crossing'],
                [9,70079,'South Station'],
                [10,70081,'Broadway'],
                [11,70083,'Andrew',12,70085,'JFK/UMass'],
                [11,70083,'Andrew',12,70095,'JFK/UMass'],
                [12,70085,'JFK/UMass'],
                [12,70095,'JFK/UMass']
            ];
        } else if (routeInputText == 'RedA-NB') {

            direction = 'Northbound';
            branchText = 'Red Line Ashmont - ' + direction;
            branchTextToCheck = ''; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70094,'Ashmont'],
                [1,70092,'Shawmut'],
                [2,70090,'Fields Corner'],
                [3,70088,'Savin Hill'],                
                [4,70086,'JFK/UMass'],
                [5,70084,'Andrew'],
                [6,70082,'Broadway'],
                [7,70080,'South Station'],
                [8,70078,'Downtown Crossing'],
                [9,70076,'Park St'],
                [10,70074,'Charles St/MGH'],
                [11,70072,'Kendall Sq/MIT'],
                [12,70070,'Central Sq'],
                [13,70068,'Harvard Sq'],
                [14,70066,'Porter Sq'],
                [15,70064,'Davis Sq'],
                [16,70061,'Alewife']
            ];
        } else if (routeInputText == 'RedA-SB') {

            direction = 'Southbound';
            branchText = 'Red Line Ashmont - ' + direction;
            branchTextToCheck = ''; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70061,'Alewife'],
                [1,70063,'Davis Sq'],
                [2,70065,'Porter Sq'],
                [3,70067,'Harvard Sq'],
                [4,70069,'Central Sq'],
                [5,70071,'Kendall Sq/MIT'],
                [6,70073,'Charles St/MGH'],
                [7,70075,'Park St'],
                [8,70077,'Downtown Crossing'],
                [9,70079,'South Station'],
                [10,70081,'Broadway'],
                [11,70083,'Andrew'],
                [12,70085,'JFK/UMass'],
                [13,70087,'Savin Hill'],
                [14,70089,'Fields Corner'],
                [15,70091,'Shawmut'],
                [16,70093,'Ashmont']
            ];
        } else if (routeInputText == 'MT-NB') {

            direction = 'Northbound';
            branchText = 'Mattapan Line - ' + direction;
            branchTextToCheck = ''; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70276,'Mattapan'],
                [1,70274,'Capen St'],
                [2,70272,'Valley Rd'],
                [3,70270,'Central Av'],
                [4,70268,'Milton'],
                [5,70266,'Butler'],
                [6,70264,'Cedar Grove'],
                [7,70262,'Ashmont']
            ];
        } else if (routeInputText == 'MT-SB') {

            direction = 'Southbound';
            branchText = 'Mattapan Line - ' + direction;
            branchTextToCheck = ''; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70261,'Ashmont'],
                [1,70263,'Cedar Grove'],
                [2,70265,'Butler'],
                [3,70267,'Milton'],
                [4,70269,'Central Av'],
                [5,70271,'Valley Rd'],
                [6,70273,'Capen St'],
                [7,70275,'Mattapan']
            ];
        } else if (routeInputText == 'RedB-NB') {

            direction = 'Northbound';
            branchText = 'Red Line Braintree - ' + direction;
            branchTextToCheck = ''; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70105,'Braintree'],
                [1,70104,'Quincy Adams'],
                [2,70102,'Quincy Ctr'],
                [3,70100,'Wollaston'],
                [4,70098,'North Quincy'],                
                [5,70096,'JFK/UMass'],
                [6,70084,'Andrew'],
                [7,70082,'Broadway'],
                [8,70080,'South Station'],
                [9,70078,'Downtown Crossing'],
                [10,70076,'Park St'],
                [11,70074,'Charles St/MGH'],
                [12,70072,'Kendall Sq/MIT'],
                [13,70070,'Central Sq'],
                [14,70068,'Harvard Sq'],
                [15,70066,'Porter Sq'],
                [16,70064,'Davis Sq'],
                [17,70061,'Alewife']
            ];
        } else if (routeInputText == 'RedB-SB') {

            direction = 'Southbound';
            branchText = 'Red Line Braintree - ' + direction;
            branchTextToCheck = ''; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70061,'Alewife'],
                [1,70063,'Davis Sq'],
                [2,70065,'Porter Sq'],
                [3,70067,'Harvard Sq'],
                [4,70069,'Central Sq'],
                [5,70071,'Kendall Sq/MIT'],
                [6,70073,'Charles St/MGH'],
                [7,70075,'Park St'],
                [8,70077,'Downtown Crossing'],
                [9,70079,'South Station'],
                [10,70081,'Broadway'],
                [11,70083,'Andrew'],
                [12,70095,'JFK/UMass'],
                [13,70097,'North Quincy'],
                [14,70099,'Wollaston'],
                [15,70101,'Quincy Ctr'],
                [16,70103,'Quincy Adams'],
                [17,70105,'Braintree']
            ];
        } else if (routeInputText == 'OR-NB') {

            direction = 'Northbound';
            branchText = 'Orange Line - ' + direction;
            branchTextToCheck = ''; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70001,'Forest Hills'],
                [1,70003,'Green St'],
                [2,70005,'Stony Brook'],
                [3,70007,'Jackson Sq'],
                [4,70009,'Roxbury Crossing'],                
                [5,70011,'Ruggles St'],
                [6,70013,'Massachusetts Av'],
                [7,70015,'Back Bay'],
                [8,70017,'Tufts Medical Ctr'],
                [9,70019,'Chinatown'],
                [10,70021,'Downtown Crossing'],
                [11,70023,'State St'],
                [12,70025,'Haymarket'],
                [13,70027,'North Station'],
                [14,70029,'Community College'],
                [15,70031,'Sullivan Sq'],
                [16,70279,'Assembly Sq'],
                [17,70033,'Wellington'],
                [18,70035,'Malden Ctr'],
                [19,70036,'Oak Grove']
            ];
        } else if (routeInputText == 'OR-SB') {

            direction = 'Southbound';
            branchText = 'Orange Line - ' + direction;
            branchTextToCheck = ''; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70036,'Oak Grove'],
                [1,70034,'Malden Ctr'],
                [2,70032,'Wellington'],
                [3,70278,'Assembly Sq'],
                [4,70030,'Sullivan Sq'],
                [5,70028,'Community College'],
                [6,70026,'North Station'],
                [7,70024,'Haymarket'],
                [8,70022,'State St'],
                [9,70020,'Downtown Crossing'],
                [10,70018,'Chinatown'],
                [11,70016,'Tufts Medical Ctr'],
                [12,70014,'Back Bay'],
                [13,70012,'Massachusetts Av'],
                [14,70010,'Ruggles St'],
                [15,70008,'Roxbury Crossing'],
                [16,70006,'Jackson Sq'],
                [17,70004,'Stony Brook'],
                [18,70002,'Green St'],
                [19,70001,'Forest Hills']
            ];
        } else if (routeInputText == 'BL-WB') {

            direction = 'Westbound';
            branchText = 'Blue Line - ' + direction;
            branchTextToCheck = ''; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70060,'Wonderland'],
                [1,70057,'Revere Beach'],
                [2,70055,'Beachmont'],
                [3,70053,'Suffolk Downs'],
                [4,70051,'Orient Heights'],
                [5,70049,'Wood Island'],
                [6,70047,'Airport'],
                [7,70045,'Maverick Sq'],
                [8,70043,'Aquarium'],
                [9,70041,'State St'],
                [10,70039,'Government Ctr'],
                [11,70038,'Bowdoin']
            ];
        } else if (routeInputText == 'BL-EB') {

            direction = 'Eastbound';
            branchText = 'Blue Line - ' + direction;
            branchTextToCheck = ''; // IMPORTANT: this variable should == '' when doing subway

            // format: [thisStopIndex,thisStopID,thisStopName]
            tableOfStops = [
                [0,70038,'Bowdoin'],
                [1,70040,'Government Ctr'],
                [2,70042,'State St'],
                [3,70044,'Aquarium'],
                [4,70046,'Maverick Sq'],
                [5,70048,'Airport'],
                [6,70050,'Wood Island'],
                [7,70052,'Orient Heights'],
                [8,70054,'Suffolk Downs'],
                [9,70056,'Beachmont'],
                [10,70058,'Revere Beach'],
                [11,70060,'Wonderland']
            ];
        }

        var maxIndex = tableOfStops[tableOfStops.length - 1][0];
        var stationNames = []
        var lastStation = ''
        for (i = 0; i < tableOfStops.length; i++) {
            if (tableOfStops[i][2] != lastStation) {
                // check to make sure we do not save duplicate station names
                stationNames.push(tableOfStops[i][2]);
                lastStation = tableOfStops[i][2]
            }
        }
        console.log(stationNames);

        // set up d3 box to later plot points

        var MARGINS = {top: 30, right: 30, bottom: 122, left: 50};
        var WIDTH = 1200 - MARGINS.left - MARGINS.right;
        var HEIGHT = 650 - MARGINS.top - MARGINS.bottom;

        d3.selectAll("svg > *").remove();

        var div = d3.select("body").append("div")	
            .attr("class", "tooltip")				
            .style("opacity", 0);

        //var vis = d3.select("#visualisation");

        var vis = d3.select("#visualisation").append("svg")
            .attr("width", WIDTH + MARGINS.left + MARGINS.right)
            .attr("height", HEIGHT + MARGINS.top + MARGINS.bottom)
            .append("g")
                .attr("transform", "translate(" + MARGINS.left + "," + MARGINS.top + ")");

        var xScale = d3.scale.linear().range([MARGINS.left, WIDTH]).domain([0,maxIndex]);
        var yScale = d3.time.scale().range([HEIGHT,0]).domain([timeFromAsDate,timeToAsDate]);

        var xAxis = d3.svg.axis().scale(xScale).ticks(maxIndex).tickFormat(function(d){
                return stationNames[d]
            });
        var yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(d3.time.format("%H:%M"));;

        vis.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (HEIGHT) + ")")
            .attr('fill', '#EEEEEE')
            .call(xAxis)
            .selectAll("text")  
                .attr("transform", "rotate(-45) translate(-10," + 0 + ")")
                .attr('fill', '#EEEEEE')
                .style("text-anchor", "end");

        vis.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (MARGINS.left) + "," + (0) + ")")
            .attr('fill', '#EEEEEE')
            .call(yAxis);

        // iterate over each stop

        for (i = 0; i < tableOfStops.length; i++) {
            var currentStop = tableOfStops[i];
            console.log('NEW STOP ' + currentStop[0] + ': ' + currentStop[2]);
            var staAllSegments = [];

            // if there is a stop after this one, obtain all travel times between this
            // stop and the next one

            if (currentStop[0] < maxIndex) {

                var toStopID, toStopName, toStopIndex;
                if (tableOfStops[i].length == 3) {
                    // this means specfic to stop has not been defined
                    toStopIndex = tableOfStops[i + 1][0];
                    toStopID = tableOfStops[i + 1][1];
                    toStopName = tableOfStops[i + 1][2];
                } else {
                    // this means specifc to stop has been defined, in the event that
                    // a station has multiple stop IDs for multiple platforms (ie,
                    // Park St WB and JFK/UMass NB/SB)
                    toStopIndex = tableOfStops[i][3];
                    toStopID = tableOfStops[i][4];
                    toStopName = tableOfStops[i][5];
                }
                
                var travelTimeURL = "http://realtime.mbta.com/developer/api/v2.1/traveltimes?api_key=" + apiKey + "&format=json&from_stop=" + currentStop[1] + "&to_stop=" + toStopID + "&from_datetime=" + timeFromUse + "&to_datetime=" + timeToUse;

                jQuery(document).ready(function($) {
                    $.ajax({
                        url : travelTimeURL,
                        dataType : "json",
                        async: false,
                        success : function(parsed_json) {

                            var travelTimes = parsed_json['travel_times'];
                            var display = '';

                            // iterate over all travel times between this station and next,
                            // and place them into collection, staAllSegments, for this stop
                            
                            console.log("==== At " + currentStop[1] + " (which is count " + i + ") there is travel time count of: " + travelTimes.length);

                            for (j = 0; j < travelTimes.length - 1; j++) {

                                var travelTime = travelTimes[j];

                                var time0 = new Date(travelTime['dep_dt'].valueOf()*1000);
                                var time1 = new Date(travelTime['arr_dt'].valueOf()*1000);

                                var time0sec = time0.getSeconds();
                                var time1sec = time1.getSeconds();
                                var time0min = time0.getMinutes();
                                var time1min = time1.getMinutes();
                                var time0hour = time0.getHours();
                                var time1hour = time1.getHours();

                                if (time0.getHours() < 10) {
                                    time0hour = '0' + time0.getHours();
                                }
                                if (time1.getHours() < 10) {
                                    time1hour = '0' + time1.getHours();
                                }
                                if (time0.getMinutes() < 10) {
                                    time0min = '0' + time0.getMinutes();
                                }
                                if (time1.getMinutes() < 10) {
                                    time1min = '0' + time1.getMinutes();
                                }
                                if (time0.getSeconds() < 10) {
                                    time0sec = '0' + time0.getSeconds();
                                }
                                if (time1.getSeconds() < 10) {
                                    time1sec = '0' + time1.getSeconds();
                                }

                                var time0disp = '' + time0hour + ':' + time0min + ':' + time0sec;
                                var time1disp = '' + time1hour + ':' + time1min + ':' + time1sec;

                                var headwayDisp = '';
                                var recomHeadway = '';
                                var statusDisp = 'Good<br>';

                                var moveTimeMin = Math.floor(travelTime['travel_time_sec'].valueOf()/60);
                                var moveTimeSec = travelTime['travel_time_sec'].valueOf() - (moveTimeMin * 60);

                                var moveTimeDisp;
                                if (moveTimeMin < 1) {
                                    moveTimeDisp = 'Travel time: ' + moveTimeSec + 's<br>';
                                } else {
                                    moveTimeDisp = 'Travel time: ' + moveTimeMin + 'm ' + moveTimeSec + 's<br>';
                                }

                                var locationDisp = '<b>' + currentStop[2] + '</b> to <b>' + toStopName + '</b><br>';

                                if (branchTextToCheck != '') {
                                    if (branchTextToCheck == travelTime['route_id']) {
                                        staAllSegments.push([currentStop[0],time0,toStopIndex,time1,headwayDisp,moveTimeDisp,0,currentStop[2],toStopName,time0disp,time1disp,locationDisp,statusDisp,travelTime['route_id'],recomHeadway]);
                                    }
                                } else {
                                    staAllSegments.push([currentStop[0],time0,toStopIndex,time1,headwayDisp,moveTimeDisp,0,currentStop[2],toStopName,time0disp,time1disp,locationDisp,statusDisp,travelTime['route_id'],recomHeadway]);
                                }
                            }
                        }
                    });
                });

            }

            // if there is a stop after this one, obtain all headways for this stop

            if (currentStop[0] < tableOfStops.length - 1) {

                var headwayURL = "http://realtime.mbta.com/developer/api/v2.1/headways?api_key=" + apiKey + "&format=json&stop=" + currentStop[1] + "&from_datetime=" + timeFromUse + "&to_datetime=" + timeToUse;

                jQuery(document).ready(function($) {
                    $.ajax({
                        url : headwayURL,
                        dataType : "json",
                        async: false,
                        success : function(parsed_json) {
                            console.log('Headways now');

                            var headways = parsed_json['headways'];
                            var display = '';

                            // iterate over all observed headways at this station

                            for (j = 0; j < headways.length - 1; j++) {
                                //console.log('//headway');

                                var headway = headways[j];

                                // iterate over all of the travel times we previously obtained
                                // to see if we can match up the observed headway with a following
                                // travel time

                                // the goal is to set for the travel time segments a
                                // a flag (colour) for how well the headway performs

                                for (k = 0; k < staAllSegments.length; k++) {

                                    var headwayToCompare = headway['current_dep_dt'].valueOf();

                                    if (headwayToCompare == (staAllSegments[k][1].getTime()/1000)) {

                                        // if we found a match, see if the threshold flags exist
                                        // for this headway; if so, set colour for the travel time
                                        // segment appropriately

                                        var headwayLength = 0;
                                        for(var key in headway) {
                                            if(headway.hasOwnProperty(key)){
                                                headwayLength++;
                                            }
                                        }

                                        //console.log('==== headwayLength = ' + headwayLength);
                                        //console.log(headway['headway_time_sec']);
                                        //console.log(headway);
                                        
                                        // check for (Scheduled headway + 90 seconds) condition
                                        var yellowAlarm = false;
                                        if (headway['headway_time_sec'].valueOf() > (headway['benchmark_headway_time_sec'].valueOf() + 90)) {
                                            yellowAlarm = true;
                                        }

                                        if (headwayLength == 8 && yellowAlarm == true) {
                                            staAllSegments[k][12] = '> Sched headway + 90s<br>';
                                            staAllSegments[k][6] = 1;
                                        } else if (headwayLength == 9) {
                                            staAllSegments[k][12] = '<b>Big gap</b><br>';
                                            staAllSegments[k][6] = 2;
                                        } else if (headwayLength == 10) {
                                            staAllSegments[k][12] = '<b>SEVERE GAP</b><br>';
                                            staAllSegments[k][6] = 3;
                                        }

                                        // add scheduled headway to the travel time segment
                                        
                                        var schTimeMin = Math.floor(headway['benchmark_headway_time_sec'].valueOf()/60);
                                        var schTimeSec = headway['benchmark_headway_time_sec'].valueOf() - (schTimeMin * 60);
                                        var recomHeadway = '';
                                        if (schTimeMin < 1) {
                                            recomHeadway = 'Sch headway: ' + schTimeSec + 's<br>';
                                        } else {
                                            recomHeadway = 'Sch headway: ' + schTimeMin + 'm ' + schTimeSec + 's<br>';
                                        }
                                        
                                        staAllSegments[k][14] = recomHeadway;
                                        
                                        // add headway of the fromStop to the travel time segment
                                        
                                        var moveTimeMin = Math.floor(headway['headway_time_sec'].valueOf()/60);
                                        var moveTimeSec = headway['headway_time_sec'].valueOf() - (moveTimeMin * 60);
                                        var headwayDisp = '';
                                        if (moveTimeMin < 1) {
                                            headwayDisp = 'Headway: ' + moveTimeSec + 's<br>';
                                        } else {
                                            headwayDisp = 'Headway: ' + moveTimeMin + 'm ' + moveTimeSec + 's<br>';
                                        }

                                        staAllSegments[k][4] = headwayDisp;
                                    }
                                }
                            }
                        }
                    });
                });

            }

            // if we are neither at the first nor the final stop of the route, obtain dwell
            // times, which will be made 

            if (currentStop[0] < tableOfStops.length - 1 && currentStop[0] > 0) {

                var dwellURL = "http://realtime.mbta.com/developer/api/v2.1/dwells?api_key=" + apiKey + "&format=json&stop=" + currentStop[1] + "&from_datetime=" + timeFromUse + "&to_datetime=" + timeToUse;

                jQuery(document).ready(function($) {
                    $.ajax({
                        url : dwellURL,
                        dataType : "json",
                        async: false,
                        success : function(parsed_json) {
                            console.log('Dwells now');

                            var dwellTimes = parsed_json['dwell_times'];
                            var display = '';

                            // iterate over all travel times between this station and next,
                            // and place them into collection, staAllSegments, for this stop

                            for (j = 0; j < dwellTimes.length - 1; j++) {
                                //console.log('//dwells');

                                var dwellTime = dwellTimes[j];
                                var statusDisp = 'Good';

                                var colour = 0;
                                if (dwellTime['dwell_time_sec'].valueOf() > 180) {
                                    colour = 3;
                                    statusDisp = '<b>Dwell > 3m</b>';
                                } else if (dwellTime['dwell_time_sec'].valueOf() > 90) {
                                    colour = 2;
                                    statusDisp = '<b>Dwell > 90s</b>';
                                } else if (dwellTime['dwell_time_sec'].valueOf() > 45) {
                                    colour = 1;
                                    statusDisp = 'Dwell > 45s';
                                }

                                var time0 = new Date(dwellTime['arr_dt'].valueOf()*1000);
                                var time1 = new Date(dwellTime['dep_dt'].valueOf()*1000);

                                var time0sec = time0.getSeconds();
                                var time1sec = time1.getSeconds();
                                var time0min = time0.getMinutes();
                                var time1min = time1.getMinutes();
                                var time0hour = time0.getHours();
                                var time1hour = time1.getHours();

                                if (time0.getHours() < 10) {
                                    time0hour = '0' + time0.getHours();
                                }
                                if (time1.getHours() < 10) {
                                    time1hour = '0' + time1.getHours();
                                }
                                if (time0.getMinutes() < 10) {
                                    time0min = '0' + time0.getMinutes();
                                }
                                if (time1.getMinutes() < 10) {
                                    time1min = '0' + time1.getMinutes();
                                }
                                if (time0.getSeconds() < 10) {
                                    time0sec = '0' + time0.getSeconds();
                                }
                                if (time1.getSeconds() < 10) {
                                    time1sec = '0' + time1.getSeconds();
                                }

                                var time0disp = '' + time0hour + ':' + time0min + ':' + time0sec;
                                var time1disp = '' + time1hour + ':' + time1min + ':' + time1sec;

                                var headwayDisp = '';
                                var recomHeadway = '';

                                var moveTimeMin = Math.floor(dwellTime['dwell_time_sec'].valueOf()/60);
                                var moveTimeSec = dwellTime['dwell_time_sec'].valueOf() - (moveTimeMin * 60);
                                var moveTimeDisp;
                                if (moveTimeMin < 1) {
                                    moveTimeDisp = 'Dwell time: ' + moveTimeSec + 's<br>';
                                } else {
                                    moveTimeDisp = 'Dwell time: ' + moveTimeMin + 'm ' + moveTimeSec + 's<br>';
                                }

                                var locationDisp = 'Dwell at <b>' + currentStop[2] + '</b><br>';

                                if (branchTextToCheck != '') {
                                    if (branchTextToCheck == dwellTime['route_id']) {
                                        staAllSegments.push([currentStop[0],time0,currentStop[0],time1,headwayDisp,moveTimeDisp,colour,currentStop[2],currentStop[2],time0disp,time1disp,locationDisp,statusDisp,dwellTime['route_id'],recomHeadway]);
                                    }
                                } else {
                                    staAllSegments.push([currentStop[0],time0,currentStop[0],time1,headwayDisp,moveTimeDisp,colour,currentStop[2],currentStop[2],time0disp,time1disp,locationDisp,statusDisp,dwellTime['route_id'],recomHeadway]);
                                }

                            }
                        }
                    });
                });

            }

            console.log(currentStop[2] + ' with ' + staAllSegments.length + ' segments');
            console.log('   before allSegments.length = ' + allSegments.length);
            allSegments = allSegments.concat(staAllSegments);
            console.log('    after allSegments.length = ' + allSegments.length);
        }

        setTimeout(function(){
            console.log("Total of " + allSegments.length + " segement!");
            for (i = 0; i < allSegments.length - 1; i++) {
                var segment = allSegments[i];
                //console.log(segment);
                //console.log(segment[0]);
                //console.log(segment[1]/86400*24);
                //console.log(segment[2]);
                //console.log(segment[3]/86400*24);

                // add the contents of this segment to the d3 chart

            } // NEW TEMP END OF FOR LOOP

            vis.selectAll('line.segments')
                .data(allSegments) // used to contain ( points )
                .enter()
                .append('line')
                    .attr('x1', function(d) { return xScale(d[0]) })
                    .attr('y1', function(d) { return yScale(d[1]) })
                    .attr('x2', function(d) { return xScale(d[2]) })
                    .attr('y2', function(d) { return yScale(d[3]) })
                    .attr('stroke', function(d){
                        if (d[6] == 0) {
                            return "#009933"; // colour segment green
                        } else if (d[6] == 2) {
                            return "#FF0000"; // colour segment gold
                        } else if (d[6] == 3) {
                            return "#FF0000"; // colour segment red
                        } else {
                            return "gold"; // if d[6] == 1
                        }
                    })
                    .attr('stroke-width', 3)
                    .attr('fill', 'none')
                    .on('mouseover', function(d) {		
                        div.transition()
                            .duration(200)		
                            .style('opacity', 1);		
                        div.html('<large><b>VehicleID</b></large><br>' +
                                 d[11] +
                                 d[9] + ' - ' + d[10] + '<br><br>' +
                                 d[13] + '<br><br>' +
                                 'TripID: N/A<br>' +
                                 '<b>' + d[4] + '</b>' +
                                 d[14] + '<br>' +
                                 d[5] + '<br>' +
                                 d[12]
                                )
                            .style('left', (d3.event.pageX - 250) + 'px')		
                            .style('top', (d3.event.pageY - 170) + 'px');	
                    })
                    .on('mouseout', function(d) {		
                        div.transition()		
                            .duration(500)		
                            .style('opacity', 0);	
                });

            var monthNames = [
              "January", "February", "March",
              "April", "May", "June", "July",
              "August", "September", "October",
              "November", "December"
            ];

            var dayNames = [
              "Sunday", "Monday", "Tuesday",
              "Wednesday", "Thursday", "Friday", "Saturday"
            ];

            var monthIndex = timeFromAsDate.getMonth();
            var dayIndex = timeFromAsDate.getDay();

            document.getElementById("dwellsT").innerHTML = 'AVL diagram for ' + dayNames[dayIndex] + ' ' + timeFromAsDate.getDate() + ' ' + monthNames[monthIndex] + ' ' + timeFromAsDate.getFullYear() + '<br><b>' + branchText + '</b>';
        }, 1000);
    }, 100);
};

// GOOD SOURCES
// http://stackoverflow.com/questions/30093786/jquery-how-to-automatically-insert-colon-after-entering-2-numeric-digits
// http://www.d3noob.org/2013/01/format-date-time-axis-with-specified.html
//
