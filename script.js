let history = JSON.parse(localStorage.getItem("history")) || [];

function getColor(n) {
  if (n === 0 || n === 5) return "violet";
  if ([1,3,7,9].includes(n)) return "green";
  return "red";
}

function getSize(n) {
  return n >= 5 ? "Big" : "Small";
}

function nextPeriod() {
  let base = "202602031000";
  return base + (11331 + history.length);
}

function predict() {
  if (history.length < 5) return "Waiting for data";

  let last = history.slice(-10);
  let big = last.filter(x => x.size === "Big").length;
  let small = last.length - big;

  let colors = {red:0, green:0, violet:0};
  last.forEach(x => colors[x.color]++);

  let size = big > small ? "Small" : "Big";
  let color = Object.entries(colors).sort((a,b)=>a[1]-b[1])[0][0];

  return `<b>${size}</b> / <span class="${color}">${color}</span>`;
}

function render() {
  document.getElementById("period").innerText = nextPeriod();
  document.getElementById("prediction").innerHTML = predict();

  let h = document.getElementById("history");
  h.innerHTML = "";
  history.slice().reverse().forEach(x=>{
    h.innerHTML += `${x.num} - ${x.color} - ${x.size}<br>`;
  });
}

function add(num) {
  history.push({
    num,
    color: getColor(num),
    size: getSize(num)
  });
  localStorage.setItem("history", JSON.stringify(history));
  render();
}

render();
