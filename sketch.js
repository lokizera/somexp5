let video;

// Indica se o vídeo já carregou ou não.
let videoLoaded = false;

// Guarda os pixels do frame anterior.
let prevPixels;

// Guarda as diferenças entre pixels do frame atual e o anterior.
let pixelDiffs;

let bugs = [];

let xoff= 0;

let M1;

let M2;

let M3;

let M4;

let M5;

let M6;


function setup() {
  createCanvas(1290, 720);
  pixelDensity(1);
  frameRate(20);

  video = createCapture(VIDEO, function () {
    videoLoaded = true;
  });
  video.size(width, height);
  video.hide();

  prevPixels = Array(4 * video.width * video.height).fill(0);
  pixelDiffs = Array(video.width * video.height).fill(0);

  for (let i = 0; i < 45; i++) {
    bugs.push(new Jitter());
  }
  
  
}

let totalTime = 0;
let numSamples = 0;

function draw() {
  // Não fazer nada se o vídeo não tiver carregado.
  if (!videoLoaded)
    return;

  let time0 = millis();

  // Calcular as diferenças dos pixels
  detectMotion();

  let avgMotion1 = avgMotion(0, 430, 0, 360);
  let avgMotion2 = avgMotion(430, 860, 0, 360);
  let avgMotion3 = avgMotion(860, 1280, 0, 360);
  let avgMotion4 = avgMotion(0, 430, 360, 720);
  let avgMotion5 = avgMotion(430, 860, 360, 720);
  let avgMotion6 = avgMotion(860, 1280, 360, 720);

  noStroke();
  fill(0);
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  for (let i = 0; i < bugs.length; i++) {
    bugs[i].move();
    bugs[i].display();
  }

  M1 = avgMotion1 * 2;
  M2 = avgMotion2 * 2;
  M3 = avgMotion3 * 2;
  M4 = avgMotion4 * 2;
  M5 = avgMotion5 * 2;
  M6 = avgMotion6 * 2;
  xoff += 0.1;
  let noiseM1 = map(noise(xoff),0,1,-M1/2,M1/2);
  xoff += 0.1;
  let noiseM2 = map(noise(xoff),0,1,-M2/2,M2/2);
  xoff += 0.1;
  let noiseM3 = map(noise(xoff),0,1,-M3/2,M3/2);
  xoff += 0.1;
  let noiseM4 = map(noise(xoff),0,1,-M4/2,M4/2);
  xoff += 0.1;
  let noiseM5 = map(noise(xoff),0,1,-M5/2,M5/2);
  xoff += 0.1;
  let noiseM6 = map(noise(xoff),0,1,-M6/2,M6/2);
  
  
  
  fill(M2, M2 / 5 - M2, M2 / 8 + M2);
  circle(215 + 430 + noiseM2, 180, 70 + M2);
 
  
  
  fill(M6 / 3, M6 / 2 - M6, M6 + M6);
  circle(225 + noiseM6 , 180 + 360, 70 + M6);
  
  push();
  angleMode(DEGREES);
  translate(width/2,height/2);
  rotate(M1);
  rectMode(CENTER)
  fill(M1, M1 / 4 + M1, M1 / 1 - M1);
  rect(185 - M1 + noiseM1, 130 - M1-360, 100 + M1 * 2);
  pop();
  
  push();
  angleMode(DEGREES);
  translate(width/2,height/2);
  rotate(-M3);
  rectMode(CENTER);
  fill(M3, M3 / 4 + M3, M3 / 1 - M3);
  rect(185-400 - M3 + noiseM3, 130 - M3-360, 100 + M3 * 2);
  pop();
   

  fill(M5 / 3, M5 / 2 - M5, M5 + M5);
  triangle(185 - M5 + 430, 145 - M5 + 360, 215 + 430, 197 + M5 + 360, 245 + M5 + 430, 145 - M5 + 360);

  fill(M4, M4 / 5 - M4, M4 / 8 + M4);
  circle(215 + 860  + noiseM4 , 180 + 360, 70 + M4);

  let time1 = millis();

  totalTime += time1 - time0;
  numSamples++;

  if ((numSamples % 100) == 0) {
    console.log(totalTime / numSamples, "ms");
  }
} 

class Jitter {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.diameter = random(5, 17);
    this.speedY = 30;
    this.speedX = 15;
  }

  move() {
    fill(random(M1,M6),random(M2,M5),random(M3,M4),random(M1+M2+M3+M4+M5+M6));
    this.x += random(10, this.speedX);
    this.y += random(-this.speedY, this.speedY);
    if (this.x > width) {
      this.x = 0;  
    }
  }

  display() {
    square(this.x, this.y, this.diameter);
  }
}

// Detecta as diferenças entre o último frame e o frame atual.
// Guarda as diferenças no array pixelDiffs.
// Se um pixel anterior for exatamente igual ao pixel atual, não
// atualiza a diferença. Isso pode acontecer caso a framerate do
// canvas seja maior do que a framerate do vídeo.
function detectMotion() {
  video.loadPixels();

  // Loop para cada pixel do vídeo
  for (let y = 0; y < video.height; y++) {
    for (let x = 0; x < video.width; x++) {
      // Passo 1: Qual a posição do pixel (x, y) no array?
      const loc = (x + y * width) * 4;

      // Passo 2: Qual era a cor do pixel anterior?
      const r1 = prevPixels[loc];
      const g1 = prevPixels[loc + 1];
      const b1 = prevPixels[loc + 2];

      // Passo 3: Qual é a cor do pixel atual?
      const r2 = video.pixels[loc];
      const g2 = video.pixels[loc + 1];
      const b2 = video.pixels[loc + 2];

      // Passo 4: Compara as cores (anterior vs atual)
      const diff = fastdist(r1, g1, b1, r2, g2, b2);

      // Passo 5: Se houver diferença, atualiza a diferença
      if (diff !== 0)
        pixelDiffs[x + y * width] = diff;

      // Passo 6: Atualizar pixel anterior.
      prevPixels[loc] = r2;
      prevPixels[loc + 1] = g2;
      prevPixels[loc + 2] = b2;
    }
  }
}

// Calcula a quantidade de movimento no retângulo que possui canto superior
// esquerdo (x1, y1) e canto inferior direito (x2, y2).
function avgMotion(x1, x2, y1, y2) {
  let sum = 0;
  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      sum += pixelDiffs[x + y * width];
    }
  }
  // Divide a quantidade de movimento pela área do retângulo
  return sum / ((x2 - x1) * (y2 - y1));
}

// Calcula a distância entre duas cores (r1,g1,b1) e (r2,g2,b2).
// Faz a mesma coisa que a função `dist` nativa do p5.js, mas MUITO mais
// rápida, porque não checa se você passou parâmetros dos tipos corretos.
function fastdist(r1 = 0, g1 = 0, b1 = 0, r2 = 0, g2 = 0, b2 = 0) {
  return Math.sqrt(
    (r1 - r2) * (r1 - r2) +
    (g1 - g2) * (g1 - g2) +
    (b1 - b2) * (b1 - b2)
  )
  
 
  
  
  
}