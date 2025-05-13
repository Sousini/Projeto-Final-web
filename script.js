const canvas1 = document.getElementById("canvas1");
const canvas2 = document.getElementById("canvas2");
const ctx1 = canvas1.getContext("2d");
const ctx2 = canvas2.getContext("2d");
const radiusSlider = document.getElementById("radiusSlider");
const centerXInput = document.getElementById("centerX");
const centerYInput = document.getElementById("centerY");

let radius = 80;
let dragging = false;

// Estado do centro em coordenadas reais
let centerReal = { x: 0, y: 0 };

const radiusValue = document.getElementById("radiusValue");

radiusSlider.addEventListener("input", (e) => {
  radius = parseFloat(e.target.value);
  radiusValue.textContent = (radius / 80).toFixed(2);
  drawCircle();
  drawTransformed();
});

centerXInput.addEventListener("input", (e) => {
  centerReal.x = parseFloat(e.target.value);
  drawCircle();
  drawTransformed();
});

centerYInput.addEventListener("input", (e) => {
  centerReal.y = parseFloat(e.target.value);
  drawCircle();
  drawTransformed();
});

function drawAxes(ctx, axisLabels = { x: "x", y: "y" }) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const step = 40;
  
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    ctx.beginPath();
  
    // Eixos principais
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();
  
    // Label dos eixos (x ou ζ / y ou η)
    ctx.fillStyle = "#000";
    ctx.font = "bold 14px Segoe UI";
    ctx.textAlign = "right";
    ctx.fillText(axisLabels.x, w - 5, cy - 6);
    ctx.textAlign = "left";
    ctx.fillText(axisLabels.y, cx + 6, 10);
  
    ctx.fillStyle = "#555";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
  
    // Marcas horizontais (para o eixo X)
    for (let x = cx + step; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, cy - 5);
      ctx.lineTo(x, cy + 5);
      ctx.stroke();
      ctx.fillText(((x - cx) / 80).toFixed(1), x, cy + 8);
    }
  
    for (let x = cx - step; x > 0; x -= step) {
      ctx.beginPath();
      ctx.moveTo(x, cy - 5);
      ctx.lineTo(x, cy + 5);
      ctx.stroke();
      ctx.fillText(((x - cx) / 80).toFixed(1), x, cy + 8);
    }
  
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
  
    // Marcas verticais (para o eixo Y)
    for (let y = cy + step; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(cx - 5, y);
      ctx.lineTo(cx + 5, y);
      ctx.stroke();
      ctx.fillText((-(y - cy) / 80).toFixed(1) + "i", cx + 6, y); // Adicionando "i"
    }
  
    for (let y = cy - step; y > 0; y -= step) {
      ctx.beginPath();
      ctx.moveTo(cx - 5, y);
      ctx.lineTo(cx + 5, y);
      ctx.stroke();
      ctx.fillText((-(y - cy) / 80).toFixed(1) + "i", cx + 6, y); // Adicionando "i"
    }
}
  
  
function drawCircle() {
  ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
  drawAxes(ctx1, { x: "x", y: "y" });


  const cx = 200 + centerReal.x * 80;
  const cy = 200 - centerReal.y * 80;

  ctx1.beginPath();
  ctx1.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx1.strokeStyle = "blue";
  ctx1.lineWidth = 2;
  ctx1.stroke();

  ctx1.beginPath();
  ctx1.arc(cx, cy, 5, 0, 2 * Math.PI);
  ctx1.fillStyle = "black";
  ctx1.fill();

  drawLabels(ctx1);
}

function drawLabels(ctx) {
    ctx.fillStyle = "#000";
    ctx.font = "14px Segoe UI";
  
    ctx.fillText(`Centro: ${centerReal.x.toFixed(2)}, ${centerReal.y.toFixed(2)}`, 10, 20);
    ctx.fillText(`Raio: ${(radius / 80).toFixed(2)}`, 10, 40);
}
  

function applyTransformation(zx, zy, type) {
  if (type === "joukowsky") {
    const denom = zx ** 2 + zy ** 2 || 1e-10;
    return {
      u: zx + zx / denom,
      v: zy - zy / denom
    };
  }
  return { u: zx, v: zy };
}


function drawTransformed() {
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
  drawAxes(ctx2, { x: "u", y: "v" });
  const type = "joukowsky";
  const points = [];

  const cx = 200 + centerReal.x * 80;
  const cy = 200 - centerReal.y * 80;

  for (let t = 0; t < 2 * Math.PI; t += 0.01) {
    const x = cx + radius * Math.cos(t);
    const y = cy + radius * Math.sin(t);
    const zx = (x - 200) / 80;
    const zy = (200 - y) / 80;
    const { u, v } = applyTransformation(zx, zy, type);
    const tx = 200 + u * 80;
    const ty = 200 - v * 80;
    points.push({ x: tx, y: ty });
  }

  ctx2.beginPath();
  ctx2.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx2.lineTo(points[i].x, points[i].y);
  }
  ctx2.closePath();
  ctx2.strokeStyle = "red";
  ctx2.lineWidth = 2;
  ctx2.stroke();
}







// Permitir arrastar o centro com o rato
canvas1.addEventListener("mousedown", (e) => {
  const rect = canvas1.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const cx = 200 + centerReal.x * 80;
  const cy = 200 - centerReal.y * 80;
  const dx = x - cx;
  const dy = y - cy;
  if (Math.hypot(dx, dy) < 10) dragging = true;
});

canvas1.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  const rect = canvas1.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  centerReal.x = (x - 200) / 80;
  centerReal.y = (200 - y) / 80;
  centerXInput.value = centerReal.x.toFixed(2);
  centerYInput.value = centerReal.y.toFixed(2);
  drawCircle();
  drawTransformed();
});

canvas1.addEventListener("mouseup", () => dragging = false);
canvas1.addEventListener("mouseleave", () => dragging = false);

// Inicialização
radiusValue.textContent = (radius / 80).toFixed(2);
centerXInput.value = centerReal.x.toFixed(2);
centerYInput.value = centerReal.y.toFixed(2);
drawCircle();
drawTransformed();
const predefinidoBtn = document.getElementById("predefinido");

// Lista de valores predefinidos
const predefinidos = [
  { x: 0.1, y: 0, r: 0.5 },
  { x: 0.2, y: 1, r: 0.8 },
  { x: 1, y: 1, r: 1},
  { x: -2 , y: 3 , r: 4.2426 },
  { x: 0.2, y: 1, r: 1.2806 },
  { x: 0.1, y: 0.3, r: 0.9487 },
  { x: -0.1, y: 0.1, r: 1.1045 },
  { x: -0.2, y: 0.1, r: 1.2042},
  { x: 0.3, y: -0.2, r: 0.6000 },
  { x: -0.3, y: 0.5, r: 0.9000 },
  { x: -0.5, y: -0.5, r: 1.1000 },
  { x: 0.4, y: 0.6, r: 1.5000 },
  { x: 0.5, y: 0, r: 2.0000 },
  { x: -0.4, y: -0.3, r: 2.5000 },
  { x: 0.2, y: -0.4, r: 3.0000 },
  { x: -0.1, y: 0.2, r: 3.5000 },
 
];

let indiceAtual = 0;

predefinidoBtn.addEventListener("click", () => {
  const valor = predefinidos[indiceAtual];

  // Atualiza os valores
  centerReal.x = valor.x;
  centerReal.y = valor.y;
  radius = valor.r * 80;

  // Atualiza os inputs
  centerXInput.value = valor.x.toFixed(2);
  centerYInput.value = valor.y.toFixed(2);
  radiusSlider.value = radius;
  radiusValue.textContent = valor.r.toFixed(2);

  drawCircle();
  drawTransformed();

  // Avança o índice (loop circular)
  indiceAtual = (indiceAtual + 1) % predefinidos.length;
});
