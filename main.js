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
  document.getElementById("leg").value *= factor; 
  document.getElementById("thick").value *=  factor; 
  prevUnit = newUnit; // track current unit
}

function calculate() {
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
  let A = sf * w * t * factor * factor; // square meters
  let TPV = calculateTurnsPerVolt(f, B, A);
  let priV = document.getElementById("pri-v").value;
  let secV = document.getElementById("sec-v").value;
  document.getElementById("pri-n").value = Math.floor(TPV * priV + 1);
  document.getElementById("sec-n").value = Math.floor(TPV * secV + 1);
}

function calculateTurnsPerVolt(f, B, A) {
  // formula TPV = = 1/(k*f*B*A)
  // f = in Hertz, Tesla, square meter
  let TPV = 1/(4.44 * f * B * A); 
  return TPV;
}
