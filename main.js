// global unit variable
let prevUnit;

// called by index.html via onload event
function init() {
  prevUnit = document.getElementById("unit").value;
}

// invoked when unit of measurement is changed
function recalc() {
  let factor;
  let newValue;
  // get the current value
  let newUnit = document.getElementById("unit").value;

  // if same, return
  if (newUnit == prevUnit) return;
 
  // set conversion factor
  if (prevUnit == "mm" && newUnit == "cm") factor = 1/10;
  if (prevUnit == "mm" && newUnit == "in") factor = 1/25.4;
  if (prevUnit == "cm" && newUnit == "mm") factor = 10;
  if (prevUnit == "cm" && newUnit == "in") factor = 1/2.54;
  if (prevUnit == "in" && newUnit == "mm") factor = 25.4;
  if (prevUnit == "in" && newUnit == "cm") factor = 2.54;

  // update leg and thickness with converted values
  newValue = document.getElementById("leg").value * factor; 
  document.getElementById("leg").value = newValue.toFixed(2);
  newValue = document.getElementById("thick").value *  factor; 
  document.getElementById("thick").value = newValue.toFixed(2);

  // save current unit
  prevUnit = newUnit; 

  hideAnchor();
}

// conversion factor to meter
function factorToSquareMeter(unit) {
  let factor;
  if (unit=="mm") factor = 1/1000;    // mm to m
  if (unit=="cm") factor = 1/100;     // cm to m
  if (unit=="in") factor = 2.54/100;  // in to m
  return factor*factor;
}
// invoked when calculate button is clicked
// it will calculate the number turns for primary and secondary
// formula: tpv = 1/(kfBA)
function calculate() {
  // k = wave factor
  let k = 4.44;
  if (document.getElementById("shape").value == "square") k = 4;
  // f = frequency
  let f = document.getElementById("freq").value;
  // B = maximum flux density
  let B = document.getElementById("flux").value; // Tesla
  // A = core area = w * t * sf
  let w = document.getElementById("leg").value;
  let t = document.getElementById("thick").value;
  let sf = document.getElementById("stacking").value;

  // conversion factor to meter
  let unit = document.getElementById("unit").value;
  let factor = factorToSquareMeter(unit);
  
  // compute core area in square meters
  let A = (1 - sf / 100) * w * t * factor;

  // finally we can compute theturns per volt
  let TPV = calculateTurnsPerVolt(k, f, B, A);

  let priN = Math.floor(TPV * document.getElementById("pri-v").value +1);
  let secN = Math.floor(TPV * document.getElementById("sec-v").value + 1);
  document.getElementById("pri-n").value = priN;
  document.getElementById("sec-n").value = secN;

  // setup the href attribute for page2
  let attrVal = `p2calcwire.html?pturns=${priN}&sturns=${secN}&leg=${w}&unit=${unit}`;
  document.getElementById("page2").setAttribute("href", attrVal );
  showAnchor();

}

// formula TPV = = 1/(k*f*B*A)
// f = in Hertz, B = Tesla, A = square meter
function calculateTurnsPerVolt(k, f, B, A) {
  let TPV = 1/(k * f * B * A); 
  return TPV;
}

// invoked by recalc()
function hideAnchor() {
  document.getElementById("page2").setAttribute("style","display:none");
}

// invoked by calculate()
function showAnchor() {
  document.getElementById("page2").setAttribute("style","display:visible");
}

// object for storing query strings from the url
// initialized in initp2()
let qobj = {};

// called by p2calcwire.html via onload event
function initp2() {
  // parse query string from the url
  let qstr = location.search.substring(1).split("&");

  // loop thru and store each parameters
  // expected result from query string:
  //  leg=<number>
  //  pturns=<number>
  //  sturns=<number>
  for (let i=0; i < qstr.length; i++) {
    let q = qstr[i].split("=");
    qobj[q[0]] = q[1];
  }

  // populate html form using values from query string
  document.getElementById("leg").value = qobj.leg;  // center leg
  document.getElementById("pri-n").value = qobj.pturns;  // primary turns
  document.getElementById("sec-n").value = qobj.sturns;  // secondary turns

  // compute winding window dimensions based on EI core center leg
  qobj.winh = (qobj.leg / 2).toFixed(2);
  qobj.winl = (qobj.winh * 3).toFixed(2);
  // populate html
  document.getElementById("winh").value = qobj.winh;
  document.getElementById("winl").value = qobj.winl;

  // update html with the units used in this calculation
  let cols = document.getElementsByClassName("unit");
  for (let i=0; i < cols.length; i++) {
    cols[i].innerHTML = qobj.unit;
  }
}

// simulate algorithm
//  This is just a simple simulation.
//  It divides the winding window into two sections, one for primary and 
//  one for secondary.
//  The simulation calculates the wire size based on the premise that
//  the sum of square cross section area of the wires times its number of turns
//  will fit on the winding window.
//  
//  winding window = number turns primary * wire cross section of primary +
//                   number turns secondary * wire cross section of secondary
//
// FOR FUTURE IMPROVEMENT:
//  assumption: voltage drop is limited to 10%
//  perimeter1 = 2*(11/8*width + height)
//  perimeter2 = 2*(7/4*width + height))


function simulate() {
  // effective wa = window area * (1 - factor/100)
  // ratio of turns to diameter: N1/N2 = E1/E2 = I2/I1 = D2/D1
  // D2 = D1 * N1/N2
  // wa = N1*D1^2  + N2 * D2^2
  // wa = N1*D1*D1 + N2 * D1*D1 * N1*N1/(N2*N2)
  // wa = D1*D1 * (N1 + N2 * N1*N1/(N2*N2))
  // D1 = sqrt(wa / (N1 + N2 * N1*N1/(N2*N2)))

  let n1 = qobj.pturns;
  let n2 = qobj.sturns;
  let H = document.getElementById("winh").value;
  let L = document.getElementById("winl").value;
  let f = (1 - document.getElementById("winf").value/100);
  let P1 = 2 * (11/8*L + H);
  let P2 = 2 * (7/4*L + H);
  let wa = H * L * f;
  let denom = parseFloat(n1) + parseFloat(n2 * n1**2/n2**2);
  let d1 = Math.sqrt(wa/denom);
  let d2 = d1 * n1/n2;
  awgPrimary = toAWG(d1);
  awgSecondary = toAWG(d2);
  document.getElementById("wirep").value = awgPrimary;
  document.getElementById("wires").value = awgSecondary;
  document.getElementById("ampp").value = ampacity(awgPrimary);
  document.getElementById("amps").value = ampacity(awgSecondary);
}

// conversion of diameter in any unit to AWG
function toAWG(dia) {
  let AWG;
  let factor;

  if (qobj.unit == "mm") factor = 0.127;
  if (qobj.unit == "in") factor = 0.005;
  if (qobj.unit == "cm") factor = 1.270;

  AWG = 36 - 39 *( Math.log(dia/factor)/Math.log(92) );
  return Math.round(AWG);
}


function toMil(dia) {
  // convert to inch
  if (qobj.unit == "mm") dia /= 25.4;
  if (qobj.unit == "cm") dia /= 2.54;
  // convert dia to mil
  return dia/1000;
}

function toCircularMil(dia) {
  return toMil(dia)**2; // circular mil
}

function toSquareMil(dia) {
  return Math.PI * toMil(dia)**2/4; // square mil
}

// column index
const Din   = 0; // diameter inches
const Dmm   = 1; // diameter mm
const Amm2  = 2; // area mm squared
const Rpkft = 3; // ohms per 1000 ft
const Rpkm  = 4; // ohms per km
const Ach   = 5; // ampacity chassis
const Apt   = 6; // ampacity power transmission
const freq  = 7;
const Bforce= 8; // breaking force

function ampacity(awg) {
  return table(awg, Ach);
}

function table(awg, col) {
  let tab = {
    "AWG" :"Din       Dmm       Amm2      Rpkft   Rpkm      Ach   Apt     freq      Bforce",
    "-3"  :"0.4600 ,	11.68400, 107.000, 	0.0490, 0.16072 ,	380 ,	302 	, 125 Hz 	, 6120 lbs",
    "-2"  :"0.4096 ,	10.40384, 84.9000, 	0.0618, 0.202704, 328 ,	239 	, 160 Hz 	, 4860 lbs",
    "-1"  :"0.3648 ,	9.26592 ,	67.4000, 	0.0779, 0.255512, 283 ,	190 	, 200 Hz 	, 3860 lbs",
    "0"   :"0.3249 ,	8.25246 ,	53.5000, 	0.0983, 0.322424, 245 ,	150 	, 250 Hz 	, 3060 lbs",
    "1"   :"0.2893 ,	7.34822 ,	42.4000, 	0.1239, 0.406392, 211 ,	119 	, 325 Hz 	, 2430 lbs",
    "2"   :"0.2576 ,	6.54304 ,	33.6000, 	0.1563, 0.512664, 181 ,	94 	  , 410 Hz 	, 1930 lbs",
    "3"   :"0.2294 ,	5.82676 ,	26.7000, 	0.1970, 0.64616 ,	158 ,	75 	  , 500 Hz 	, 1530 lbs",
    "4"   :"0.2043 ,	5.18922 ,	21.1000, 	0.2485, 0.81508 ,	135 ,	60 	  , 650 Hz 	, 1210 lbs",
    "5"   :"0.1819 ,	4.62026 ,	16.8000, 	0.3133, 1.027624, 118 ,	47 	  , 810 Hz 	, 960 lbs",
    "6"   :"0.1620 ,	4.11480 ,	13.3000, 	0.3951, 1.295928, 101 ,	37 	  , 1100 Hz ,	760 lbs",
    "7"   :"0.1443 ,	3.66522 ,	10.6000, 	0.4982, 1.634096, 89  ,	30 	  , 1300 Hz ,	605 lbs",
    "8"   :"0.1285 ,	3.26390 ,	8.37000, 	0.6282, 2.060496, 73  ,	24 	  , 1650 Hz ,	480 lbs",
    "9"   :"0.1144 ,	2.90576 ,	6.63000, 	0.7921, 2.598088, 64  ,	19 	  , 2050 Hz ,	380 lbs",
    "10"  :"0.1019 ,	2.58826 ,	5.26000, 	0.9989, 3.276392, 55  ,	15 	  , 2600 Hz ,	314 lbs",
    "11"  :"0.0907 ,	2.30378 ,	4.17000, 	1.260 ,	4.13280 ,	47  ,	12 	  , 3200 Hz ,	249 lbs",
    "12"  :"0.0808 ,	2.05232 ,	3.31000, 	1.588 ,	5.20864 ,	41  ,	9.3 	, 4150 Hz ,	197 lbs",
    "13"  :"0.0720 ,	1.82880 ,	2.63000, 	2.003 ,	6.56984 ,	35  ,	7.4 	, 5300 Hz ,	150 lbs",
    "14"  :"0.0641 ,	1.62814 ,	2.08000, 	2.525 ,	8.28200 ,	32  ,	5.9 	, 6700 Hz ,	119 lbs",
    "15"  :"0.0571 ,	1.45034 ,	1.65000, 	3.184 ,	10.44352, 28  ,	4.7 	, 8250 Hz ,	94 lbs",
    "16"  :"0.0508 ,	1.29032 ,	1.31000, 	4.016 ,	13.17248, 22  ,	3.7 	, 11 k Hz ,	75 lbs",
    "17"  :"0.0453 ,	1.15062 ,	1.04000, 	5.064 ,	16.60992, 19  ,	2.9 	, 13 k Hz ,	59 lbs",
    "18"  :"0.0403 ,	1.02362 ,	0.82300, 	6.385 ,	20.9428 ,	16  ,	2.3 	, 17 kHz 	, 47 lbs",
    "19"  :"0.0359 ,	0.91186 ,	0.65300, 	8.051 ,	26.40728, 14  ,	1.8 	, 21 kHz 	, 37 lbs",
    "20"  :"0.0320 ,	0.81280 ,	0.51900, 	10.15 ,	33.2920 ,	11  ,	1.5 	, 27 kHz 	, 29 lbs",
    "21"  :"0.0285 ,	0.72390 ,	0.41200, 	12.80 ,	41.9840 ,	9  	, 1.2 	, 33 kHz 	, 23 lbs",
    "22"  :"0.0253 ,	0.64516 ,	0.32700, 	16.14 ,	52.9392 ,	7  	, 0.92 	, 42 kHz 	, 18 lbs",
    "23"  :"0.0226 ,	0.57404 ,	0.25900, 	20.36 ,	66.7808 ,	4.7 ,	0.729 ,	53 kHz 	, 14.5 lbs",
    "24"  :"0.0201 ,	0.51054 ,	0.20500, 	25.67 ,	84.1976 ,	3.5 ,	0.577 ,	68 kHz 	, 11.5 lbs",
    "25"  :"0.0179 ,	0.45466 ,	0.16200, 	32.37 ,	106.1736, 2.7 ,	0.457 ,	85 kHz 	, 9 lbs",
    "26"  :"0.0159 ,	0.40386 ,	0.12800, 	40.81 ,	133.8568, 2.2 ,	0.361 ,	107 kHz ,	7.2 lbs",
    "27"  :"0.0142 ,	0.36068 ,	0.10200, 	51.47 ,	168.8216, 1.7 ,	0.288 ,	130 kHz ,	5.5 lbs",
    "28"  :"0.0126 ,	0.32004 ,	0.08000, 	64.90 ,	212.872 ,	1.4 ,	0.226 ,	170 kHz ,	4.5 lbs",
    "29"  :"0.0113 ,	0.28702 ,	0.06470, 	81.83 ,	268.4024, 1.2 ,	0.182 ,	210 kHz ,	3.6 lbs",
    "30"  :"0.0100 ,	0.25400 ,	0.05070, 	103.2 ,	338.496 ,	0.86, 0.142 ,	270 kHz ,	2.75 lbs",
    "31"  :"0.0089 ,	0.22606 ,	0.04010, 	130.1 ,	426.728 ,	0.7 ,	0.113 ,	340 kHz ,	2.25 lbs",
    "32"  :"0.0080 ,	0.20320 ,	0.03240, 	164.1 ,	538.248 ,	0.53, 0.091 ,	430 kHz ,	1.8 lbs",
    "33"  :"0.0071 ,	0.18034 ,	0.02550, 	206.9 ,	678.632 ,	0.43, 0.072 ,	540 kHz ,	1.3 lbs",
    "34"  :"0.0063 ,	0.16002 ,	0.02010, 	260.9 ,	855.752 ,	0.33, 0.056 ,	690 kHz ,	1.1 lbs",
    "35"  :"0.0056 ,	0.14224 ,	0.01590, 	329.0 ,	1079.12 ,	0.27, 0.044 ,	870 kHz ,	0.92 lbs",
    "36"  :"0.0050 ,	0.12700 ,	0.01270, 	414.8 ,	1360.00 ,	0.21, 0.035 ,	1100 kHz, 0.72 lbs",
    "37"  :"0.0045 ,	0.11430 ,	0.01030, 	523.1 ,	1715.00 ,	0.17, 0.0289, 1350 kHz, 0.57 lbs",
    "38"  :"0.0040 ,	0.10160 ,	0.00811, 	659.6 ,	2163.00 ,	0.13, 0.0228, 1750 kHz, 0.45 lbs",
    "39"  :"0.0035 ,	0.08890 ,	0.00621, 	831.8 ,	2728.00 ,	0.11, 0.0175, 2250 kHz, 0.36 lbs",
    "40"  :"0.0031 ,	0.07874 ,	0.00487,   1049 , 3440.00 ,	0.09, 0.0137, 2900 kHz, 0.29 lbs"
  };
  if (parseInt(awg) < -3) awg = "-3";
  if (parseInt(awg) > 40) awg = "40";
  return parseFloat(tab[awg].split(",")[col]);
}

// basic formula AWG to diameter
// din = 0.005*92^((36-AWG/39))
// dmm = 0.127*92^((36-AWG/39))
// dcm = 1.270*92^((36-AWG/39))
// 
// AWG = 36 - 39*log(din/0.005)/log(92)
// AWG = 36 - 39*log(dmm/0.127)/log(92)
//
// D = .460 * (57/64)^(awg +3) inches, another accurate formula by Mario Rodriguez
// 
// reference: https://www.powerstream.com/Wire_Size.htm
// Ampacity rule of thumb: 700 circular mills per amp for power transmission. 
//
// Electrical resistivity k, ohms * m^2 / m
// R = kL/A
// copper 1.724 x 10-8 Ω m (0.0174 μΩ m)
// aluminum 2.65 x 10-8 Ω m (0.0265 μΩ m)
// ambient temperature 31 - 40 oC: correction factor = 0.82
// ambient temperature 41 - 45 oC: correction factor = 0.71
// ambient temperature 45 - 50 oC: correction factor = 0.58
// Calculating Wire/Cable Size formula for single Phase Circuits
// Wire Circular mils = 2 x ρ x I x L / (% Allowable Voltage drop of source voltage)
