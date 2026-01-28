// OCR 与图像识别工具

const BASE_W = 720;
const BASE_H = 1280;

const REGIONS = {
  attackButton: { x: 0.02, y: 0.78, w: 0.26, h: 0.18 },
  armyCapA: { x: 0.34, y: 0.02, w: 0.18, h: 0.06 },
  armyCapB: { x: 0.52, y: 0.02, w: 0.18, h: 0.06 },
  lootGold: { x: 0.04, y: 0.18, w: 0.24, h: 0.06 },
  lootElixir: { x: 0.04, y: 0.25, w: 0.24, h: 0.06 },
  destruction: { x: 0.43, y: 0.03, w: 0.18, h: 0.06 },
  returnBtn: { x: 0.70, y: 0.78, w: 0.28, h: 0.18 },
  cloudCheck: { x: 0.18, y: 0.18, w: 0.64, h: 0.46 }
};

// 共享截图机制 - 避免同一循环内多次截图
let _sharedImg = null;

function captureShared() {
  if (_sharedImg) {
    return _sharedImg;
  }
  _sharedImg = captureScreenSafe();
  return _sharedImg;
}

function recycleShared() {
  if (_sharedImg && typeof _sharedImg.recycle === "function") {
    _sharedImg.recycle();
  }
  _sharedImg = null;
}

function isInHome() {
  const img = captureShared();
  if (!img) {
    return false;
  }
  const region = scaleRegion(REGIONS.attackButton);
  const texts = ocrTextFromRegion(img, region);
  if (texts.length === 0) {
    return false;
  }
  return hasText(texts, ["进攻", "攻击"]);
}

function getArmyCapacity() {
  const img = captureShared();
  if (!img) {
    return null;
  }
  const regions = [scaleRegion(REGIONS.armyCapA), scaleRegion(REGIONS.armyCapB)];
  for (let i = 0; i < regions.length; i += 1) {
    const text = joinText(ocrTextFromRegion(img, regions[i]));
    const match = parseCapacity(text);
    if (match) {
      return match;
    }
  }
  return null;
}

function isSearchingCloud() {
  const img = captureShared();
  if (!img) {
    return true;
  }
  const region = scaleRegion(REGIONS.cloudCheck);
  return isMostlyWhite(img, region, 25, 0.7);
}

function getLoot() {
  const img = captureShared();
  if (!img) {
    return null;
  }
  const goldText = joinText(ocrTextFromRegion(img, scaleRegion(REGIONS.lootGold)));
  const elixirText = joinText(ocrTextFromRegion(img, scaleRegion(REGIONS.lootElixir)));
  const gold = parseNumber(goldText);
  const elixir = parseNumber(elixirText);
  if (gold <= 0 && elixir <= 0) {
    return null;
  }
  return { gold: gold, elixir: elixir };
}

function getBattleStats() {
  const img = captureShared();
  if (!img) {
    return null;
  }
  const text = joinText(ocrTextFromRegion(img, scaleRegion(REGIONS.destruction)));
  const destruction = parsePercent(text);
  return {
    remainingRate: -1,
    destruction: destruction,
    elapsedMs: Date.now() - battleStartAt()
  };
}

function hasReturnButton() {
  const img = captureShared();
  if (!img) {
    return false;
  }
  const texts = ocrTextFromRegion(img, scaleRegion(REGIONS.returnBtn));
  return hasText(texts, ["回营", "返回", "回到村庄"]);
}

let _battleStartAt = 0;

function battleStartAt() {
  if (_battleStartAt <= 0) {
    _battleStartAt = Date.now();
  }
  return _battleStartAt;
}

function resetBattleStartAt() {
  _battleStartAt = Date.now();
}

function captureScreenSafe() {
  let img = null;
  try {
    if (typeof images !== "undefined" && typeof images.captureScreen === "function") {
      img = images.captureScreen();
    } else if (typeof captureScreen === "function") {
      img = captureScreen();
    }
  } catch (err) {
    img = null;
  }
  if (img) {
    return img;
  }
  const path = "/sdcard/coc_bot_screen.png";
  const res = shell("screencap -p " + path, true);
  if (!res || res.code !== 0) {
    return null;
  }
  try {
    if (typeof images !== "undefined" && typeof images.read === "function") {
      return images.read(path);
    }
  } catch (err) {
    return null;
  }
  return null;
}

function ocrTextFromRegion(img, region) {
  if (typeof images === "undefined" || typeof images.clip !== "function") {
    return [];
  }
  const clip = images.clip(img, region.x, region.y, region.w, region.h);
  const result = recognizeText(clip);
  if (clip && typeof clip.recycle === "function") {
    clip.recycle();
  }
  return result;
}

let _ocrEngine = null;

function ensureOcrEngine() {
  if (_ocrEngine) {
    return _ocrEngine;
  }
  if (typeof paddleOCR !== "undefined") {
    _ocrEngine = paddleOCR();
  } else if (typeof $ocr !== "undefined") {
    _ocrEngine = $ocr;
  } else if (typeof ocr !== "undefined") {
    _ocrEngine = ocr;
  }
  return _ocrEngine;
}

function recognizeText(img) {
  const engine = ensureOcrEngine();
  if (!engine) {
    return [];
  }
  try {
    const res = typeof engine.recognize === "function" ? engine.recognize(img) : engine.detect(img);
    return normalizeOcrResult(res);
  } catch (err) {
    return [];
  }
}

function normalizeOcrResult(res) {
  if (!res) {
    return [];
  }
  if (Array.isArray(res)) {
    return res.map(toTextItem).filter(Boolean);
  }
  if (Array.isArray(res.results)) {
    return res.results.map(toTextItem).filter(Boolean);
  }
  return [];
}

function toTextItem(item) {
  if (!item) {
    return null;
  }
  if (typeof item === "string") {
    return { text: item };
  }
  if (typeof item.text === "string") {
    return { text: item.text, confidence: item.confidence || item.score };
  }
  if (Array.isArray(item) && typeof item[1] === "string") {
    return { text: item[1], confidence: item[2] };
  }
  return null;
}

function hasText(texts, keywords) {
  const merged = joinText(texts);
  for (let i = 0; i < keywords.length; i += 1) {
    if (merged.indexOf(keywords[i]) >= 0) {
      return true;
    }
  }
  return false;
}

function joinText(texts) {
  return texts.map(item => item.text || "").join(" ");
}

function parseCapacity(text) {
  const match = /([0-9]{1,4})\s*[\/]\s*([0-9]{1,4})/.exec(text);
  if (!match) {
    return null;
  }
  return { current: parseInt(match[1], 10), max: parseInt(match[2], 10) };
}

function parseNumber(text) {
  const cleaned = text.replace(/[,\s]/g, "");
  const match = /([0-9]+)/.exec(cleaned);
  if (!match) {
    return 0;
  }
  return parseInt(match[1], 10);
}

function parsePercent(text) {
  const match = /([0-9]{1,3})\s*%/.exec(text);
  if (!match) {
    return 0;
  }
  return parseInt(match[1], 10) / 100;
}

function scaleRegion(region) {
  const w = device.width || BASE_W;
  const h = device.height || BASE_H;
  return {
    x: Math.round(region.x * w),
    y: Math.round(region.y * h),
    w: Math.round(region.w * w),
    h: Math.round(region.h * h)
  };
}

function isMostlyWhite(img, region, samples, threshold) {
  if (typeof images === "undefined" || typeof images.pixel !== "function" || typeof colors === "undefined") {
    return false;
  }
  const total = samples * samples;
  let whiteCount = 0;
  const stepX = Math.max(1, Math.floor(region.w / samples));
  const stepY = Math.max(1, Math.floor(region.h / samples));
  for (let i = 0; i < samples; i += 1) {
    for (let j = 0; j < samples; j += 1) {
      const x = region.x + i * stepX;
      const y = region.y + j * stepY;
      const c = images.pixel(img, x, y);
      const r = colors.red(c);
      const g = colors.green(c);
      const b = colors.blue(c);
      if (r > 230 && g > 230 && b > 230) {
        whiteCount += 1;
      }
    }
  }
  return whiteCount / total >= threshold;
}

module.exports = {
  isInHome,
  getArmyCapacity,
  isSearchingCloud,
  getLoot,
  getBattleStats,
  hasReturnButton,
  resetBattleStartAt,
  recycleShared
};
