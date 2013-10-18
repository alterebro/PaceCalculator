// set global variables to be used by all functions

var dist
var time //in total secs
var pace //in total secs
var thr //hr component for time
var tmin
var tsec
var phr //hr component for pace
var pmin
var psec
var dunit //type of unit dist is in (miles, kilometers, etc)
var event //or dist like marathon, half-marathon
var punit //unit pace is in (the per unit, aka mile, kilometer, quarter, half, etc)
var maradist = '26.21875'
var halfmaradist = '13.109375'
var shgt = 34 // height of rows in split table to compute height of subwindow

function showError(str) {
	$('#error').show();
	$('#error').html(str);
}
function hideError() {
	$('#error').hide();
	$('#error').html('');
}

function CalcTime(form){
// Main routine for Time
// Validate required data, convert to total secs, do computation, display results
// Time = Dist * Pace
	if (!(CheckTime(form))){
		showError("To calculate Time, enter the Pace and Distance");
	}else{ //got good data, now process it
		hideError();
		dunit = form.dunit.options[form.dunit.selectedIndex].value
		punit = form.punit.options[form.punit.selectedIndex].value
		var factor = convUnit(dunit, punit)
		time = dist  * pace * factor
		form.thr.value = HrsFromTSecs(time)
		form.tmin.value = MinsFromTSecs(time)
		form.tsec.value = SecsFromTSecs(time)
	}
}

function CalcDist(form){
// Main routine for Dist
// Validate required data, do computation, and display results
// Dist = Time / Pace
	if (!(CheckDist(form))){
		showError("To calculate Distance, enter the Time and Pace");
	}else{
		hideError();
		dunit = form.dunit.options[form.dunit.selectedIndex].value
		punit = form.punit.options[form.punit.selectedIndex].value
		var factor = convUnit(punit, dunit)
		dist = time / (pace / factor)
		form.dist.value = dist
	}
}

function CalcPace(form){
// Main routine for Pace
// Validate required data, do computation, and display results
// Pace = Time / Dist
	if (!(CheckPace(form))){
		showError("To calculate Pace, enter the Time and Distance");
	}else{
		hideError();
		dunit = form.dunit.options[form.dunit.selectedIndex].value
		punit = form.punit.options[form.punit.selectedIndex].value
		var factor = convUnit(dunit, punit)
		pace = (time / dist) / factor

		form.phr.value = HrsFromTSecs(pace)
		form.pmin.value = MinsFromTSecs(pace)
		form.psec.value = SecsFromTSecs(pace)
	}
}

function convUnit (funit, tunit ){
		if (funit == tunit) return 1
		else if (funit == "Mile" && tunit == "Kilometer") return 1.609344
		else if (funit == "Mile" && tunit == "Meter") return 1609.344
		else if (funit == "Mile" && tunit == "Yard") return  1760
		else if (funit == "Mile" && tunit == "Half Mile") return 2
		else if (funit == "Mile" && tunit == "Quarter Mile") return 4
		else if (funit == "Mile" && tunit == "Eigth Mile") return 8
		else if (funit == "Mile" && tunit == "1500M") return 1.072896
		else if (funit == "Mile" && tunit == "800M") return 2.01168
		else if (funit == "Mile" && tunit == "400M") return 4.02336
		else if (funit == "Mile" && tunit == "200M") return 8.04672

		else if (funit == "Kilometer" && tunit == "Mile") return .6213712
		else if (funit == "Kilometer" && tunit == "Meter") return 1000
		else if (funit == "Kilometer" && tunit == "Yard") return  1093.613
		else if (funit == "Kilometer" && tunit == "Half Mile") return 1.2427424
		else if (funit == "Kilometer" && tunit == "Quarter Mile") return 2.4854848
		else if (funit == "Kilometer" && tunit == "Eigth Mile") return 4.9709696
		else if (funit == "Kilometer" && tunit == "1500M") pace = (time / dist)  / .66666666
		else if (funit == "Kilometer" && tunit == "800M") return 1.25
		else if (funit == "Kilometer" && tunit == "400M") return 2.5
		else if (funit == "Kilometer" && tunit == "200M") return 5

		else if (funit == "Meter" && tunit == "Mile") return .0006213712
		else if (funit == "Meter" && tunit == "Kilometer") return .001
		else if (funit == "Meter" && tunit == "Yard") return  1.093613
		else if (funit == "Meter" && tunit == "Half Mile") return .0012427424
		else if (funit == "Meter" && tunit == "Quarter Mile") return .0024854848
		else if (funit == "Meter" && tunit == "Eigth Mile") return .0049709696
		else if (funit == "Meter" && tunit == "1500M") pace = (time / dist)  /  .0006666
		else if (funit == "Meter" && tunit == "800M") return .00125
		else if (funit == "Meter" && tunit == "400M") return .0025
		else if (funit == "Meter" && tunit == "200M") return .005

		else if (funit == "Yard" && tunit == "Mile") return .0005681 // (1/1760=)
		else if (funit == "Yard" && tunit == "Kilometer") return .0009144
		else if (funit == "Yard" && tunit == "Meter") return  .9144
		else if (funit == "Yard" && tunit == "Half Mile") return .0011362
		else if (funit == "Yard" && tunit == "Quarter Mile") return .0022724
		else if (funit == "Yard" && tunit == "Eigth Mile") return .0045448
		else if (funit == "Yard" && tunit == "1500M") pace = (time / dist)  / .0006096
		else if (funit == "Yard" && tunit == "800M") return .001143
		else if (funit == "Yard" && tunit == "400M") return .002286
		else if (funit == "Yard" && tunit == "200M") return .004572
}

function CalcSplits(form){
	// Main routine for Splits
	// Validate required data, do computation, and display results
	// Splits = Time at each interval (Dist / Pace)

	var gottime = CheckPace(form)
	var gotpace = CheckTime(form)

	if ( !(gottime || gotpace) ) {

		showError("To calculate Splits, enter the Pace and Distance or Time and Distance");
		$('#splits').hide();

	} else {

		hideError();

		// get dist, pace, and punit
		// time in total seconds, pace in total seconds
		if ( !(gotpace) && (gottime) ){
		    punit = form.punit.options[form.punit.selectedIndex].value;
		    dunit = form.dunit.options[form.dunit.selectedIndex].value;
		    var factor = convUnit(dunit, punit);
		    pace = (time / dist) / factor;
		}
		var dcalc = form.dunit.options[form.dunit.selectedIndex].value;
		var pcalc = form.punit.options[form.punit.selectedIndex].value;
		var factor = convUnit(dcalc, pcalc);
		var pdisp = form.punit.options[form.punit.selectedIndex].text;
		dist = dist * factor;
		var remain = dist % 1;
		nsplits = dist - remain;

		var splits_output = '<table cellspacing="2"><thead><tr><th colspan="2">Splits</th><th class="split-time">Times</th></tr></thead><tbody>';
		var stime = 0;
			for (var split = 1;  split <= nsplits; split++) {
				stime = stime + pace;
				var shours = HrsFromTSecs(stime);
				var smins = MinsFromTSecs(stime);
				var ssecs = SecsFromTSecs(stime);
				var hmstime = shours  + ":" + smins + ":" + ssecs.substring(0,5);
				splits_output += "<tr><td>" + split + "</td><td>" + pdisp + '</td><td class="split-time">' +hmstime + "</td></tr>";
			}
			if ( nsplits != dist ) { 
				// the last split is for the total dist
				var extrasecs = remain * pace;
				stime = stime + extrasecs;
				var shours = HrsFromTSecs(stime);
				var smins = MinsFromTSecs(stime);
				var ssecs = SecsFromTSecs(stime);
				var hmstime = shours  + ":" + smins + ":" + ssecs.substring(0,5);
				splits_output += "<tr><td>" + dist + "</td><td>" + pdisp + '</td><td class="split-time">' +hmstime + "</td></tr>";
			}
		splits_output += "</tbody></table>";
		
		$('#splits').show();
		$('#splits').html(splits_output);
	}
}


function CheckTime(form){
// Makes sure that both the Dist and Pace data needed to calc Time are valid
	if((getDist(form)) && (getPace(form))){
		return true
	}else{
		return false
	}
}

function CheckDist(form){
// Makes sure that both the Time and Pace data needed to calc Dist are valid
	if(getTime(form) && getPace(form)){
		return true
	}else{
		return false
	}
}

function CheckPace(form){
// Makes sure that both the Dist and Time data needed to calc Pace are valid
	if((getTime(form)) && (getDist(form))){
		return true
	}else{
		return false
	}
}

function getTime(form){
// set global time var to total secs and return true if input valid
	thour = form.thr.value
	if (thour == "") {thour = "0"} // substitute 0 for null components
	if (!(isPosNum(thour))){return false}
	thr = StripZeroes(thour)
	tminute = form.tmin.value
	if (tminute == "") {tminute = "0"} // substitute 0 for null components
	if(!(isPosNum(tminute))){return false}
	tmin = StripZeroes(tminute)
	tsecond = form.tsec.value
	if (tsecond == "") {tsecond = "0"} // substitute 0 for null components
	if(!(isPosNum(tsecond))){return false}
	tsec = StripZeroes(tsecond)
	time = toSecs(thr, tmin, tsec)
	time = parseFloat(time, 10)
	if (time == 0) return false // means all components were null
return true
}

function getDist(form){
// set global dist var to a number and return true if input valid
	dist = document.forms[0].dist.value
	if (!(isPosNum(dist))) {return false}
	dist = StripZeroes(dist)
	dist = parseFloat(dist, 10)
return true
}

function getPace(form){
// set global pace var to total secs and return true	if input valid
	phr = form.phr.value
	if (phr == "") {phr = "0"} // substitute 0 for null components
	if (!(isPosNum(phr))) {return false}
	phr = StripZeroes(phr)
	pmin = form.pmin.value
	if (pmin == "") {pmin = "0"} // substitute 0 for null components
	if (!(isPosNum(pmin))) {return false}
	pmin = StripZeroes(pmin)
	psec = form.psec.value
	if (psec == "") {psec = "0"} // substitute 0 for null components
	if (!(isPosNum(psec))) {return false}
	psec = StripZeroes(psec)
	pace = toSecs(phr, pmin, psec)
	pace = parseFloat(pace, 10)
	if (pace == 0) return false
return true
}

function toSecs(hr, min, sec){
// Convert each component to a number (remove leading 0) and sum them
	var hour = parseFloat(hr, 10)
	var minute = parseFloat(min, 10)
	var second = parseFloat(sec, 10)
	var hsecs = parseFloat(hour * 3600)
	var msecs = parseFloat(minute * 60)
	var total = hsecs + msecs + second
return total
}

function HrsFromTSecs(totsecs){
// Gets hr component for hr:min:sec string
	var hrs // hr component as string
	var flthrs = totsecs / 3600
	hrs = Math.floor(flthrs) //get next int less or equal
	hrs = hrs.toString(10)
	if (hrs.length == 1) {hrs = "0" + hrs}
return hrs
}

function MinsFromTSecs(totsecs){
// Gets min component for  hr:min:sec string
	var mins // hr component as string
	var hrs = HrsFromTSecs(totsecs)
	var nsecs = hrs * 3600
	var secsleft = totsecs - nsecs
	var fltmin = secsleft / 60
	mins = Math.floor(fltmin) //conv to integer
	mins = mins.toString(10)
	if (mins.length == 1) {mins = "0" + mins}
return mins
}

function SecsFromTSecs(totsecs){
// Converts total seconds number to hr:min:sec string
// secs is only component that may have a decimal value
	var secs // hr component as string
	secs = totsecs - (HrsFromTSecs(totsecs) * 3600) - (MinsFromTSecs(totsecs) * 60)
	secs = secs.toString(10)
	if (secs.length == 1) {
		secs = "0" + secs
	}else{ // check for a decimal point
		for (var i = 0; i < secs.length; i++){
				tchar = secs.charAt(i)
			if (i == 1 && tchar == "."){
				secs = "0" + secs
				break
			}
		}
	}
return secs
}

function StripZeroes(number){
// Strips off the leading 0, unless only one char
	if (number.length == 1) return number
	var outnum = ""
	var goodc
	mynum = number.toString(10)
	for (var i = 0; i < mynum.length;  i++){
		goodc  = mynum.charAt(i)
		if (i == 0 && goodc  == "0"){
			continue // skip
		}
		outnum += goodc
	}
return outnum
}

function isPosNum(number){
// Validates number as positive number with only one decimal point at most
	mynum = number.toString(10)
	if (mynum.length == 0) {return false}
	oneDecimal = false
	for (var i = 0 ; i < mynum.length; i++){
		var oneChar = mynum.charAt(i)
		if (oneChar  ==  "." && !oneDecimal){
			oneDecimal = true
			continue
		}
		if (oneChar < "0" ||  oneChar > "9"){
			return false
		}
	}// end of for
	return true
}

function setDunit (form){
	if (form.event.options[1].selected == true){ //mara
		form.dunit.options[0].selected=true // set dist unit to miles
		form.dist.value = maradist //set dist to mara
	}
	if (form.event.options[2].selected==true){//halfmara
		form.dunit.options[0].selected=true // set dist unit to miles
		form.dist.value = halfmaradist
	}
	if (form.event.options[3].selected==true){//5K
		form.dunit.options[1].selected=true // set dist unit to kilometers
		form.dist.value = 5
	}
	if (form.event.options[4].selected==true){//5M
		form.dunit.options[0].selected=true // set dist unit to miles
		form.dist.value = 5
	}
	if (form.event.options[5].selected==true){//8K
		form.dunit.options[1].selected=true // set dist unit to kilometers
		form.dist.value = 8
	}
	if (form.event.options[6].selected==true){//10K
		form.dunit.options[1].selected=true // set dist unit to kilometers
		form.dist.value = 10
	}
	if (form.event.options[7].selected==true){//15K
		form.dunit.options[1].selected=true // set dist unit to kilometers
		form.dist.value = 15
	}
	if (form.event.options[8].selected==true){//10M
		form.dunit.options[0].selected=true // set dist unit to miles
		form.dist.value = 10
	}
	if (form.event.options[9].selected==true){//20K
		form.dunit.options[1].selected=true // set dist unit to kilometers
		form.dist.value = 20
	}
	if (form.event.options[10].selected==true){//15M
		form.dunit.options[0].selected=true // set dist unit to miles
		form.dist.value = 15
	}

	if (form.event.options[11].selected==true){//25K
		form.dunit.options[1].selected=true // set dist unit to kilometers
		form.dist.value = 25
	}
	if (form.event.options[12].selected==true){//30K
		form.dunit.options[1].selected=true // set dist unit to kilometers
		form.dist.value = 30
	}
	if (form.event.options[13].selected==true){//20M
		form.dunit.options[0].selected=true // set dist unit to miles
		form.dist.value = 20
	}
}