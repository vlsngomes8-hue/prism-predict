function predict(){
  const input = document.getElementById("data").value;

  let arr = input.split(",")
    .map(n => parseInt(n.trim()))
    .filter(n => !isNaN(n) && n >= 0 && n <= 9);

  if(arr.length < 8){
    document.getElementById("output").innerText =
      "Enter at least 8–10 numbers";
    return;
  }

  // Use last 10 only
  arr = arr.slice(-10);

  let score = Array(10).fill(0);

  // 1️⃣ Frequency (hot numbers)
  arr.forEach(n => score[n] += 2);

  // 2️⃣ Recent trend (last 4 stronger)
  arr.slice(-4).forEach(n => score[n] += 3);

  // 3️⃣ Gap (numbers missing)
  for(let i=0;i<=9;i++){
    if(!arr.includes(i)) score[i] += 4;
  }

  // 4️⃣ Avoid repeating last
  score[arr[arr.length-1]] -= 5;

  const pick = score.indexOf(Math.max(...score));

  document.getElementById("output").innerText = pick;
}
