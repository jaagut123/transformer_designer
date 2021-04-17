let prevUnit = "mm" // mm, cm, in

function recalc() {
  let newUnit = document.getElementById("unit").value;
  let factor = 1;
  if (prevUnit=="mm" && newUnit=="cm") factor = 1/10;
  if (prevUnit=="mm" && newUnit=="in") factor = 1/25.4;
  if (prevUnit=="cm" && newUnit=="mm") factor = 10;
  if (prevUnit=="cm" && newUnit=="in") factor = 1/2.54;
  if (prevUnit=="in" && newUnit=="mm") factor = 25.4;
  if (prevUnit=="in" && newUnit=="cm") factor = 2.54;
  let newValue;
  newValue = document.getElementById("leg").value * factor; 
  document.getElementById("leg").value = newValue.toFixed(2);
  newValue = document.getElementById("thick").value *  factor; 
  document.getElementById("thick").value = newValue.toFixed(2);
  prevUnit = newUnit; // track current unit
  calculate();
}

function calculate() {
  let k = 4.44;
  if (document.getElementById("shape").value == "square") k = 4;
  let f = document.getElementById("freq").value;
  let B = document.getElementById("flux").value; // Tesla
  let w = document.getElementById("leg").value;
  let t = document.getElementById("thick").value;
  let sf = document.getElementById("stacking").value;
  let factor = 1; // factor to convert unit to meters
  let newUnit = document.getElementById("unit").value;
  if (newUnit=="mm") factor = 1/1000; // mm to m
  if (newUnit=="cm") factor = 1/100; // cm to m
  if (newUnit=="in") factor = 2.54/100; // in to m
  let A = (1-sf/100) * w * t * factor*factor; // square meters
  let TPV = calculateTurnsPerVolt(k, f, B, A);
  let priV = document.getElementById("pri-v").value;
  let secV = document.getElementById("sec-v").value;
  document.getElementById("pri-n").value = Math.floor(TPV * priV + 1);
  document.getElementById("sec-n").value = Math.floor(TPV * secV + 1);
}

function calculateTurnsPerVolt(k, f, B, A) {
  // formula TPV = = 1/(k*f*B*A)
  // f = in Hertz, B = Tesla, A = square meter
  let TPV = 1/(k * f * B * A); 
  return TPV;
}
