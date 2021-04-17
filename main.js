function calculate() {
  let f = 60;
  let B = document.getElementById("flux").value;
  let w = document.getElementById("leg").value;
  let t = document.getElementById("thick").value;
  let A = w * t;
  let TPV = calculateTunsPerVolt(f, B, A);
  let priV = document.getElementById("pri-v").value;
  let secV = document.getElementById("sec-v").value;
  document.getElementById("pri-n").value = TPV * priV;
  document.getElementById("sec-n").value = TPV * secV;
}

function calculateTurnsPerVolt(f, B, A) {
  // formula TPV = = 1/(k*f*B*A)
  // f = in Hertz, Tesla, square meter
  let TPV = 1/(4.44 * f * B * A); 
  return TPV;
}
