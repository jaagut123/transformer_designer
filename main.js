function calculateTurnsPerVolt(f, B, A) {
  // formula TPV = = 1/(k*f*B*A)
  // f = in Hertz, Tesla, square meter
  let TPV = 1/(4.44 * f * B * A); 
  return TPV;
}
