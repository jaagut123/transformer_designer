function calculate() {
  let f = 60;
  let B = document.getElementById("flux").value; // Tesla
  let w = document.getElementById("leg").value; // mm
  let t = document.getElementById("thick").value; // mm
  let A = w * t / 1000000; // square meters
  let TPV = calculateTurnsPerVolt(f, B, A);
  let priV = document.getElementById("pri-v").value;
  let secV = document.getElementById("sec-v").value;
  document.getElementById("pri-n").value = floor(TPV * priV + 1);
  document.getElementById("sec-n").value = floor(TPV * secV + 1);
}

function calculateTurnsPerVolt(f, B, A) {
  // formula TPV = = 1/(k*f*B*A)
  // f = in Hertz, Tesla, square meter
  let TPV = 1/(4.44 * f * B * A); 
  return TPV;
}
