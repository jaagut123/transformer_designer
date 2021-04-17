function calculate() {
  let f = 60;
  let B = getElementById("flux").value;
  let w = getElementById("leg").value;
  let t = getElementById("thick").value;
  let A = w * t;
  let TPV = calculateTunsPerVolt(f, B, A);
  let priV = getElementById("pri-v").value;
  let secV = getElementById("sec-v").value;
  getElementById("pri-n).value = TPV * priV;
  getElementById("sec-n).value = TPV * secV;
}

function calculateTurnsPerVolt(f, B, A) {
  // formula TPV = = 1/(k*f*B*A)
  // f = in Hertz, Tesla, square meter
  let TPV = 1/(4.44 * f * B * A); 
  return TPV;
}
