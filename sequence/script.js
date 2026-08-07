const TOTAL_FRAMES = 270;
const FIRST_BATCH_COUNT = 15;
const BATCH_SIZE = 10;

const canvas = document.getElementById('sequence-canvas');
const ctx = canvas.getContext('2d');
const track = document.getElementById('scroll-track');
const loader = document.getElementById('loader');
const loadProgressText = document.getElementById('load-progress');
const textBlocks = document.querySelectorAll('.text-block');

// Image cache storage
const images = [];
let loadedCount = 0;
let firstFrameReady = false;

// Scroll & frame tracking
let currentFrame = 1;
let targetFrame = 1;

// Image path generator
function getFramePath(index) {
  const paddedIndex = String(index).padStart(3, '0');
  return `/videos/ezgif-553ccbb5e81480e9-jpg/ezgif-frame-${paddedIndex}.jpg`;
}

// Responsive canvas size adjustment with cover behavior
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  drawFrame(Math.round(currentFrame));
}

// Cover image drawing (analogous to object-fit: cover)
function drawFrame(frameIndex) {
  const img = images[frameIndex];
  if (!img || !img.complete) return;

  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;
  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;

  // Aspect ratio calculations
  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth, drawHeight, drawX, drawY;

  if (imgRatio > canvasRatio) {
    // Image is wider than canvas
    drawHeight = canvasHeight;
    drawWidth = canvasHeight * imgRatio;
    drawX = (canvasWidth - drawWidth) / 2;
    drawY = 0;
  } else {
    // Image is taller than canvas
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imgRatio;
    drawX = 0;
    drawY = (canvasHeight - drawHeight) / 2;
  }

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

// Animate overlays based on scroll progress
function updateOverlays(progressPercent) {
  textBlocks.forEach(block => {
    const start = parseFloat(block.getAttribute('data-start'));
    const end = parseFloat(block.getAttribute('data-end'));

    if (progressPercent >= start && progressPercent < end) {
      // Calculate normalized range progress (0 to 1)
      const range = end - start;
      const relativeProgress = (progressPercent - start) / range;
      
      // Fine-tuned opacity peak at center
      let opacity = 0;
      let blur = 10;
      let scale = 0.95;

      if (relativeProgress < 0.2) {
        // Fade in
        opacity = relativeProgress / 0.2;
        blur = 10 * (1 - opacity);
        scale = 0.95 + 0.05 * opacity;
      } else if (relativeProgress > 0.8) {
        // Fade out
        opacity = (1 - relativeProgress) / 0.2;
        blur = 10 * (1 - opacity);
        scale = 1.0 - 0.05 * (1 - opacity);
      } else {
        // Active Peak
        opacity = 1;
        blur = 0;
        scale = 1;
      }

      block.style.opacity = opacity;
      block.style.filter = `blur(${blur}px)`;
      block.style.transform = `translateY(${20 * (1 - opacity)}px) scale(${scale})`;
      block.classList.add('active');
    } else {
      block.style.opacity = 0;
      block.style.filter = 'blur(10px)';
      block.style.transform = 'translateY(20px) scale(0.95)';
      block.classList.remove('active');
    }
  });
}

// Primary Animation Loop (requestAnimationFrame)
function tick() {
  // Smoothly interpolate current frame to target frame
  const delta = targetFrame - currentFrame;
  if (Math.abs(delta) > 0.01) {
    currentFrame += delta * 0.15; // Smooth Easing Coefficient
    drawFrame(Math.round(currentFrame));
  }

  // Calculate scroll track progress percentage (0 - 100)
  const trackTop = track.offsetTop;
  const trackHeight = track.scrollHeight - window.innerHeight;
  const scrollOffset = window.scrollY - trackTop;
  const progress = Math.max(0, Math.min(1, scrollOffset / trackHeight));
  
  updateOverlays(progress * 100);

  requestAnimationFrame(tick);
}

// Progressive preloading engine
function preloadSequence() {
  // 1. Preload first 15 frames immediately
  const firstBatchPromises = [];
  for (let i = 1; i <= FIRST_BATCH_COUNT; i++) {
    firstBatchPromises.push(loadImage(i));
  }

  Promise.all(firstBatchPromises).then(() => {
    firstFrameReady = true;
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 800);
    resizeCanvas();
    tick();

    // 2. Queue remaining frames in batches using requestIdleCallback
    queueRemainingFrames(FIRST_BATCH_COUNT + 1);
  });
}

function loadImage(index) {
  return new Promise((resolve) => {
    if (images[index]) return resolve();

    const img = new Image();
    img.src = getFramePath(index);
    img.onload = () => {
      images[index] = img;
      loadedCount++;
      
      const progressPercent = Math.round((loadedCount / TOTAL_FRAMES) * 100);
      loadProgressText.textContent = `${progressPercent}%`;
      
      resolve();
    };
    img.onerror = () => {
      // Fallback placeholder in case of load failure
      console.warn(`Failed loading frame ${index}`);
      resolve();
    };
  });
}

function queueRemainingFrames(startIndex) {
  const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 100));
  
  idleCallback(() => {
    const end = Math.min(startIndex + BATCH_SIZE - 1, TOTAL_FRAMES);
    const batchPromises = [];

    for (let i = startIndex; i <= end; i++) {
      batchPromises.push(loadImage(i));
    }

    Promise.all(batchPromises).then(() => {
      if (end < TOTAL_FRAMES) {
        queueRemainingFrames(end + 1);
      }
    });
  });
}

// Event Listeners
window.addEventListener('resize', resizeCanvas);

window.addEventListener('scroll', () => {
  const trackTop = track.offsetTop;
  const trackHeight = track.scrollHeight - window.innerHeight;
  const scrollOffset = window.scrollY - trackTop;
  
  // Calculate relative frame target
  const fraction = Math.max(0, Math.min(1, scrollOffset / trackHeight));
  targetFrame = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(fraction * (TOTAL_FRAMES - 1)) + 1));
}, { passive: true });

// Start preloading
preloadSequence();
