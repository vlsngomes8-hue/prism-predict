let history = JSON.parse(localStorage.getItem("history")) || [];

function getColor(num) {
  if (num === 0 || num === 5) return "violet";
  if ([1,3,7,9].includes(num)) return "green";
  return "red";
}

function getSize(num) {
  return num >= 5 ? "Big" : "Small";
}

function nextPeriod() {
  let base = "202602031000";
  let next = history.length + 11331;
  return base + next;
}

function render() {
  document.getElementById("period").innerText = nextPeriod();

  let h = document.getElementById("history");
  h.innerHTML = "";
  history.slice().reverse().forEach(r => {
    h.innerHTML += `
      <div class="history-item">
        <span>${r.num} <span class="${r.color}">${r.color}</span></span>
        <span class="${r.size.toLowerCase()}">${r.size}</span>
      </div>`;
  });

  predict();
}

function predict() {
  if (history.length < 5) {
    document.getElementById("prediction").innerText = "Waiting for data";
    return;
  }

  let last = history.slice(-10);
  let big = last.filter(x => x.size === "Big").length;
  let small = last.length - big;

  let colors = { red:0, green:0, violet:0 };
  last.forEach(x => colors[x.color]++);

  let size = big > small ? "Small" : "Big";
  let color = Object.entries(colors).sort((a,b)=>a[1]-b[1])[0][0];

  document.getElementById("prediction").innerHTML =
    `<b>${size}</b> / <b class="${color}">${color}</b>`;
}

function addResult(num) {
  history.push({
    num,
    color: getColor(num),
    size: getSize(num)
  });
  localStorage.setItem("history", JSON.stringify(history));
  render();
}

render();
async function uploadPhoto() {
  let file = document.getElementById("photo").files[0];
  let fd = new FormData();
  fd.append("file", file);

  let res = await fetch("https://YOUR-BACKEND-URL/ocr", {
    method: "POST",
    body: fd
  });

  let data = await res.json();
  data.forEach(r => history.push(r));

  localStorage.setItem("history", JSON.stringify(history));
  render();
}
