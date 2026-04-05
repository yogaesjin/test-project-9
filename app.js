import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  where,
  limit,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const STORAGE_KEYS = {
  currentUserId: "flipbook_current_user_id_v1",
};

const firebaseConfig = {
  apiKey: "AIzaSyDcvXbAGd3TQvzOLA_0qVIBXbU0XxwWn2g",
  authDomain: "test-project-9-12aa8.firebaseapp.com",
  projectId: "test-project-9-12aa8",
  storageBucket: "test-project-9-12aa8.firebasestorage.app",
  messagingSenderId: "402753026519",
  appId: "1:402753026519:web:7ee58fe9c58fa62f907392",
  measurementId: "G-3WGBVXT5MN",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

const EGG_HINTS = [
  { id: "badge", name: "배지 연타", method: "상단 ROBLOX STYLE FLIPBOOK 배지를 5번 누르기", chance: "4.8%" },
  { id: "konami", name: "코나미 테마", method: "키보드로 ↑↑↓↓←→←→BA 입력", chance: "1.2%" },
  { id: "double", name: "플레이어 더블클릭", method: "플레이 미리보기 화면 더블클릭", chance: "6.4%" },
  { id: "ghost", name: "Ghost Grid", method: "6x6 + 투명 배경 + 핑퐁 재생 조합", chance: "0.8%" },
  { id: "triple", name: "Triple Three", method: "3x3 + 간격 3px 조합", chance: "1.1%" },
  { id: "classic", name: "클래식 4x4", method: "4x4 / 12FPS / Tween ON 상태로 생성", chance: "8.3%" },
  { id: "midnight", name: "자정 방문", method: "밤 12시에 접속", chance: "0.6%" },
  { id: "lunch", name: "점심 방문", method: "낮 12시에 접속", chance: "1.5%" },
  { id: "tiny", name: "Tiny Sheet", method: "타일 크기를 아주 작게 줄여 생성", chance: "2.7%" },
  { id: "huge", name: "초고품질 모드", method: "품질 배율을 거의 최대로 올리기", chance: "2.2%" },
  { id: "reverse", name: "역재생 시트", method: "프레임 순서를 역방향으로 생성", chance: "5.6%" },
  { id: "single", name: "1프레임 스티커", method: "1x1 플립북 또는 총 1프레임 생성", chance: "2.5%" },
  { id: "pingpong", name: "핑퐁 루프", method: "루프 + 핑퐁 재생 동시에 활성화", chance: "4.1%" },
  { id: "gif", name: "GIF 제작 완료", method: "GIF 다운로드 실행", chance: "7.1%" },
  { id: "metadata", name: "메타데이터 수집", method: "메타데이터 다운로드 실행", chance: "6.9%" },
  { id: "codepost", name: "코드 게시글", method: "코드가 포함된 게시글 작성", chance: "3.7%" },
  { id: "mediapost", name: "미디어 게시글", method: "이미지나 영상 첨부 게시글 작성", chance: "5.3%" },
  { id: "commenter", name: "댓글 작성", method: "아무 게시글에 댓글 달기", chance: "9.4%" },
  { id: "seed", name: "샘플 글 호출", method: "샘플 글 넣기 버튼 사용", chance: "10.2%" },
  { id: "search", name: "검색 키워드", method: "검색창에 lua/script/ui/flipbook/sprite 검색", chance: "5.9%" },
  { id: "nightowl", name: "올빼미 모드", method: "새벽 2시~4시에 접속", chance: "0.7%" },
  { id: "sunrise", name: "새벽 출석", method: "오전 5시~6시에 접속", chance: "0.9%" },
  { id: "zoom", name: "플레이어 줌", method: "플레이어 확대 배율을 크게 올리기", chance: "3.1%" },
  { id: "scrubend", name: "스크럽 끝 프레임", method: "프레임 스크럽을 맨 끝으로 이동", chance: "6.2%" },
  { id: "transparent", name: "투명 PNG", method: "투명 배경 + PNG 조합으로 생성", chance: "4.4%" },
  { id: "gapmax", name: "와이드 갭", method: "타일 간격을 크게 키워 생성", chance: "2.0%" },
  { id: "trimtight", name: "초압축 구간", method: "시작/끝 비율을 아주 가깝게 맞춰 생성", chance: "2.4%" },
  { id: "boardempty", name: "빈 게시판", method: "게시글이 하나도 없는 상태 만들기", chance: "1.8%" },
  { id: "nameflip", name: "파일명 감지", method: "파일 이름에 flip/book/sprite 포함", chance: "4.7%" },
  { id: "partyoff", name: "시크릿 테마 종료", method: "활성화된 시크릿 테마를 다시 끄기", chance: "1.3%" },
  { id: "copypost", name: "게시글 복사", method: "게시글 내용 복사 버튼 사용", chance: "5.5%" },
  { id: "copycode", name: "코드 복사", method: "코드 게시글의 코드 복사 버튼 사용", chance: "2.9%" },
  { id: "allmedia", name: "이미지+영상 동시 첨부", method: "한 게시글에 이미지와 영상 같이 첨부", chance: "1.0%" },
  { id: "nocommentname", name: "익명 댓글", method: "닉네임이 익명인 계정으로 댓글 작성", chance: "1.6%" },
  { id: "longpost", name: "장문 게시글", method: "아주 긴 게시글 작성", chance: "3.3%" },
  { id: "flipbookword", name: "제목 키워드", method: "게시글 제목에 flipbook 또는 sprite 넣기", chance: "3.9%" },
  { id: "autoplayoff", name: "수동 재생 모드", method: "자동 재생을 끄고 생성", chance: "2.1%" },
  { id: "loopoff", name: "비루프 종료 지점", method: "루프 재생을 끄고 마지막 프레임까지 이동", chance: "2.6%" },
];

const BANNED_WORDS = ["죽어", "병신", "시발", "씨발", "개새끼", "자살", "테러", "마약", "sex", "porn"];

const SEED_POSTS = [
  {
    id: `seed-${Date.now()}-1`,
    author: "BuilderMin",
    title: "ViewportFrame에서 회전 미리보기 부드럽게 하는 법",
    content: "TweenService로 회전시키는 대신 RenderStepped에서 누적 각도를 관리하면 끊김이 덜합니다.\nUI는 미리 캐싱해두면 더 안정적이에요.",
    createdAt: new Date().toISOString(),
    media: [],
    comments: [{ id: `seed-c-${Date.now()}-1`, author: "ScripterJin", content: "이 팁 좋네요.", createdAt: new Date().toISOString() }],
  },
  {
    id: `seed-${Date.now()}-2`,
    author: "LuaFox",
    title: "모듈 스크립트 구조 추천",
    content: "local ReplicatedStorage = game:GetService('ReplicatedStorage')\nlocal Modules = ReplicatedStorage:WaitForChild('Modules')\nlocal Inventory = require(Modules.Inventory)\n\nInventory.Init()",
    createdAt: new Date().toISOString(),
    media: [],
    comments: [],
  },
];

const elements = {
  heroBadge: document.getElementById("heroBadge"),
  timeNoticeBadge: document.getElementById("timeNoticeBadge"),
  timeBanner: document.getElementById("timeBanner"),
  videoInput: document.getElementById("videoInput"),
  videoMeta: document.getElementById("videoMeta"),
  columnsInput: document.getElementById("columnsInput"),
  rowsInput: document.getElementById("rowsInput"),
  tileSizeInput: document.getElementById("tileSizeInput"),
  gapInput: document.getElementById("gapInput"),
  qualityInput: document.getElementById("qualityInput"),
  qualityValue: document.getElementById("qualityValue"),
  fillModeInput: document.getElementById("fillModeInput"),
  trimStartInput: document.getElementById("trimStartInput"),
  trimStartValue: document.getElementById("trimStartValue"),
  trimEndInput: document.getElementById("trimEndInput"),
  trimEndValue: document.getElementById("trimEndValue"),
  frameOrderInput: document.getElementById("frameOrderInput"),
  formatInput: document.getElementById("formatInput"),
  compressionInput: document.getElementById("compressionInput"),
  compressionValue: document.getElementById("compressionValue"),
  backgroundInput: document.getElementById("backgroundInput"),
  gifSizeInput: document.getElementById("gifSizeInput"),
  gifQualityInput: document.getElementById("gifQualityInput"),
  gifQualityValue: document.getElementById("gifQualityValue"),
  transparentInput: document.getElementById("transparentInput"),
  sheetStats: document.getElementById("sheetStats"),
  generateButton: document.getElementById("generateButton"),
  downloadButton: document.getElementById("downloadButton"),
  gifButton: document.getElementById("gifButton"),
  metadataButton: document.getElementById("metadataButton"),
  previewCanvas: document.getElementById("previewCanvas"),
  previewOverlay: document.getElementById("previewOverlay"),
  sheetInfoLabel: document.getElementById("sheetInfoLabel"),
  playerCanvas: document.getElementById("playerCanvas"),
  playerOverlay: document.getElementById("playerOverlay"),
  playerInfoLabel: document.getElementById("playerInfoLabel"),
  playButton: document.getElementById("playButton"),
  resetButton: document.getElementById("resetButton"),
  playbackFpsInput: document.getElementById("playbackFpsInput"),
  playbackFpsValue: document.getElementById("playbackFpsValue"),
  playerScaleInput: document.getElementById("playerScaleInput"),
  playerScaleValue: document.getElementById("playerScaleValue"),
  frameScrubberInput: document.getElementById("frameScrubberInput"),
  frameScrubberValue: document.getElementById("frameScrubberValue"),
  loopInput: document.getElementById("loopInput"),
  pingPongInput: document.getElementById("pingPongInput"),
  tweenPreviewInput: document.getElementById("tweenPreviewInput"),
  autoplayInput: document.getElementById("autoplayInput"),
  fileNameLabel: document.getElementById("fileNameLabel"),
  statusLabel: document.getElementById("statusLabel"),
  boardAuthorInput: document.getElementById("boardAuthorInput"),
  boardTitleInput: document.getElementById("boardTitleInput"),
  boardContentInput: document.getElementById("boardContentInput"),
  boardMediaInput: document.getElementById("boardMediaInput"),
  boardSubmitButton: document.getElementById("boardSubmitButton"),
  boardSeedButton: document.getElementById("boardSeedButton"),
  boardSearchInput: document.getElementById("boardSearchInput"),
  boardStatsLabel: document.getElementById("boardStatsLabel"),
  boardFeed: document.getElementById("boardFeed"),
  authStatusLabel: document.getElementById("authStatusLabel"),
  authUsernameInput: document.getElementById("authUsernameInput"),
  authPasswordInput: document.getElementById("authPasswordInput"),
  authLoginButton: document.getElementById("authLoginButton"),
  authLogoutButton: document.getElementById("authLogoutButton"),
  renameInput: document.getElementById("renameInput"),
  renameButton: document.getElementById("renameButton"),
  renameHint: document.getElementById("renameHint"),
  eggHintsList: document.getElementById("eggHintsList"),
  eggCountLabel: document.getElementById("eggCountLabel"),
  dailyEggHintCard: document.getElementById("dailyEggHintCard"),
  eggProgressCard: document.getElementById("eggProgressCard"),
  remainingEggsList: document.getElementById("remainingEggsList"),
  eggDetailCard: document.getElementById("eggDetailCard"),
  secretToast: document.getElementById("secretToast"),
  fireworksLayer: document.getElementById("fireworksLayer"),
  sourceVideo: document.getElementById("sourceVideo"),
};

const previewContext = elements.previewCanvas.getContext("2d");
const playerContext = elements.playerCanvas.getContext("2d");
const captureCanvas = document.createElement("canvas");
const captureContext = captureCanvas.getContext("2d", { willReadFrequently: true });

const state = {
  file: null,
  fileUrl: "",
  lastBlob: null,
  lastMetadata: null,
  outputExtension: "png",
  gifRendering: false,
  badgeClicks: 0,
  konamiBuffer: "",
  toastTimer: 0,
  playerFrame: 0,
  playerDirection: 1,
  playerPlaying: false,
  playerRafId: 0,
  lastTickMs: 0,
  boardPosts: [],
  users: [],
  currentUserId: "",
  selectedEggId: "",
};

function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
function formatSeconds(seconds) { return Number.isFinite(seconds) ? seconds.toFixed(2) : "0.00"; }
function formatDateTime(value) { return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function createId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function sanitizeFileName(name) { return name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_가-힣]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "flipbook"; }
function escapeHtml(value) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function getCurrentUser() { return state.users.find((user) => user.id === state.currentUserId) || null; }
function isLoggedIn() { return Boolean(getCurrentUser()); }
function findUserByUsername(username) { return state.users.find((user) => user.username.toLowerCase() === username.toLowerCase()); }
function getEggById(id) { return EGG_HINTS.find((egg) => egg.id === id) || null; }
function getUserDiscoveredEggIds(user = getCurrentUser()) { return Array.isArray(user?.discoveredEggIds) ? user.discoveredEggIds : []; }
function getEggDiscoverers(eggId) { return state.users.filter((user) => getUserDiscoveredEggIds(user).includes(eggId)); }

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function saveUsers() {
  localStorage.setItem(STORAGE_KEYS.currentUserId, state.currentUserId || "");
}

function loadUsers() {
  state.currentUserId = localStorage.getItem(STORAGE_KEYS.currentUserId) || "";
}

function showSecretToast(message) {
  elements.secretToast.textContent = message;
  elements.secretToast.classList.add("is-visible");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => elements.secretToast.classList.remove("is-visible"), 2400);
}

function moderateText(text) {
  let output = (text || "").trim();
  BANNED_WORDS.forEach((word) => {
    output = output.replace(new RegExp(word, "gi"), `${word[0]}**`);
  });
  return output.replace(/https?:\/\/\S+/gi, "[링크 숨김]");
}

function renderAuthState() {
  const user = getCurrentUser();
  if (!user) {
    elements.authStatusLabel.textContent = "로그아웃 상태";
    elements.renameHint.textContent = "로그인 후 닉네임을 24시간에 한 번만 바꿀 수 있습니다.";
    elements.boardAuthorInput.value = "";
    elements.boardAuthorInput.disabled = false;
    return;
  }

  elements.authStatusLabel.textContent = `${user.username} 로그인 중`;
  elements.boardAuthorInput.value = user.username;
  elements.boardAuthorInput.disabled = true;
  if (!user.lastRenameAt) {
    elements.renameHint.textContent = "지금 바로 닉네임 변경이 가능합니다.";
    return;
  }

  const nextRenameAt = new Date(new Date(user.lastRenameAt).getTime() + 24 * 60 * 60 * 1000);
  const remainingMs = nextRenameAt.getTime() - Date.now();
  if (remainingMs <= 0) {
    elements.renameHint.textContent = "닉네임 변경 가능";
  } else {
    const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
    elements.renameHint.textContent = `다음 닉네임 변경까지 약 ${remainingHours}시간 남았습니다.`;
  }
}

async function loginOrSignup() {
  const username = moderateText(elements.authUsernameInput.value).slice(0, 24);
  const password = elements.authPasswordInput.value.trim();
  if (!username || !password) {
    showSecretToast("닉네임과 비밀번호를 입력해 주세요");
    return;
  }
  if (!/^[a-zA-Z0-9가-힣_-]{2,24}$/.test(username)) {
    showSecretToast("닉네임은 2~24자의 한글, 영문, 숫자, _, - 만 사용할 수 있어요");
    return;
  }
  if (password.length < 4) {
    showSecretToast("비밀번호는 4자 이상으로 설정해 주세요");
    return;
  }

  const existing = findUserByUsername(username);
  const passwordHash = await hashPassword(password);
  if (existing) {
    if (existing.passwordHash && existing.passwordHash !== passwordHash) {
      showSecretToast("비밀번호가 다릅니다");
      return;
    }
    if (!existing.passwordHash) {
      if (existing.legacyPassword !== password) {
        showSecretToast("비밀번호가 다릅니다");
        return;
      }
      existing.passwordHash = passwordHash;
      existing.legacyPassword = "";
    }
    state.currentUserId = existing.id;
    saveUsers();
    renderAuthState();
    renderEggHints();
    renderBoard();
    showSecretToast(`${existing.username} 로그인 완료`);
    return;
  }

  const user = {
    id: createId("user"),
    username,
    usernameLower: username.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
    lastRenameAt: "",
    discoveredEggIds: [],
  };
  const docRef = await addDoc(collection(db, "users"), user);
  state.currentUserId = user.id;
  saveUsers();
  showSecretToast(`${user.username} 계정 생성 및 로그인 완료`);
}

function logout() {
  state.currentUserId = "";
  saveUsers();
  renderAuthState();
  renderEggHints();
  renderBoard();
  showSecretToast("로그아웃했습니다");
}

async function renameCurrentUser() {
  const user = getCurrentUser();
  if (!user) {
    showSecretToast("먼저 로그인해 주세요");
    return;
  }

  const nextName = moderateText(elements.renameInput.value).slice(0, 24);
  if (!nextName) {
    showSecretToast("새 닉네임을 입력해 주세요");
    return;
  }
  if (!/^[a-zA-Z0-9가-힣_-]{2,24}$/.test(nextName)) {
    showSecretToast("닉네임은 2~24자의 한글, 영문, 숫자, _, - 만 사용할 수 있어요");
    return;
  }
  const duplicated = findUserByUsername(nextName);
  if (duplicated && duplicated.id !== user.id) {
    showSecretToast("이미 존재하는 닉네임입니다");
    return;
  }

  if (user.lastRenameAt) {
    const nextRenameTime = new Date(user.lastRenameAt).getTime() + 24 * 60 * 60 * 1000;
    if (Date.now() < nextRenameTime) {
      renderAuthState();
      showSecretToast("닉네임은 24시간에 한 번만 바꿀 수 있어요");
      return;
    }
  }

  const previousName = user.username;
  await updateDoc(doc(db, "users", user.docId), {
    username: nextName,
    usernameLower: nextName.toLowerCase(),
    lastRenameAt: new Date().toISOString(),
  });

  const ownedPosts = state.boardPosts.filter((post) => post.ownerId === user.id);
  await Promise.all(ownedPosts.map((post) => updateDoc(doc(db, "posts", post.docId), { author: nextName })));

  const commentUpdateTasks = [];
  state.boardPosts.forEach((post) => {
    const nextComments = post.comments.map((comment) => (
      comment.ownerId === user.id ? { ...comment, author: nextName } : comment
    ));
    if (JSON.stringify(nextComments) !== JSON.stringify(post.comments)) {
      commentUpdateTasks.push(updateDoc(doc(db, "posts", post.docId), { comments: nextComments }));
    }
  });
  await Promise.all(commentUpdateTasks);

  renderAuthState();
  renderEggHints();
  renderBoard();
  elements.renameInput.value = "";
  showSecretToast(`${previousName} -> ${nextName} 변경 완료`);
}

function looksLikeCode(text) {
  const signals = [/function\s+\w+/, /local\s+\w+\s*=/, /game:GetService/, /require\(/, /=>/, /const\s+\w+\s*=/, /if\s*\(/, /<\/?[a-z][\s\S]*>/i, /\{[\s\S]*\}/];
  return signals.some((pattern) => pattern.test(text)) || text.split("\n").length >= 6;
}

function getCodePayload(text) {
  if (!looksLikeCode(text)) { return null; }
  return { preview: text.split("\n").slice(0, 4).join("\n"), full: text };
}

function getLayoutConfig() {
  const columns = clamp(Number(elements.columnsInput.value) || 1, 1, 20);
  const rows = clamp(Number(elements.rowsInput.value) || 1, 1, 20);
  const tileSize = Math.round(clamp(Number(elements.tileSizeInput.value) || 256, 32, 1024) * clamp(Number(elements.qualityInput.value) || 1, 0.25, 2.5));
  const gap = clamp(Number(elements.gapInput.value) || 0, 0, 64);
  const totalFrames = columns * rows;
  return {
    columns,
    rows,
    tileSize,
    gap,
    totalFrames,
    sheetWidth: columns * tileSize + Math.max(columns - 1, 0) * gap,
    sheetHeight: rows * tileSize + Math.max(rows - 1, 0) * gap,
  };
}

function updateSliderLabels() {
  elements.qualityValue.textContent = `${Number(elements.qualityInput.value).toFixed(2)}x`;
  elements.compressionValue.textContent = Number(elements.compressionInput.value).toFixed(2);
  elements.gifQualityValue.textContent = elements.gifQualityInput.value;
  elements.trimStartValue.textContent = `${elements.trimStartInput.value}%`;
  elements.trimEndValue.textContent = `${elements.trimEndInput.value}%`;
  elements.playbackFpsValue.textContent = `${elements.playbackFpsInput.value} FPS`;
  elements.playerScaleValue.textContent = `${Number(elements.playerScaleInput.value).toFixed(2)}x`;
}

function syncTrimControls(changed) {
  let start = Number(elements.trimStartInput.value);
  let end = Number(elements.trimEndInput.value);
  if (changed === "start" && start >= end) { end = Math.min(100, start + 1); elements.trimEndInput.value = String(end); }
  if (changed === "end" && end <= start) { start = Math.max(0, end - 1); elements.trimStartInput.value = String(start); }
}

function syncBackgroundControls() {
  const transparentMode = elements.transparentInput.checked && elements.formatInput.value !== "image/jpeg";
  elements.backgroundInput.disabled = transparentMode;
  elements.backgroundInput.title = transparentMode ? "투명 배경 사용 중에는 색상이 적용되지 않습니다." : "";
}

function updateSheetStats() {
  const { sheetWidth, sheetHeight, totalFrames, tileSize, gap } = getLayoutConfig();
  elements.sheetStats.textContent = `예상 출력 크기: ${sheetWidth} x ${sheetHeight} / 총 프레임 ${totalFrames}장 / 타일 ${tileSize}px / 간격 ${gap}px / 범위 ${elements.trimStartInput.value}% ~ ${elements.trimEndInput.value}%`;
}

function updateVideoMeta() {
  if (!state.file) { elements.videoMeta.textContent = "아직 영상이 선택되지 않았습니다."; return; }
  const { videoWidth, videoHeight, duration } = elements.sourceVideo;
  const sizeMB = (state.file.size / 1024 / 1024).toFixed(2);
  const trimStart = duration * (Number(elements.trimStartInput.value) / 100);
  const trimEnd = duration * (Number(elements.trimEndInput.value) / 100);
  elements.videoMeta.textContent = `파일: ${state.file.name} / 영상 크기: ${videoWidth} x ${videoHeight} / 길이: ${formatSeconds(duration)}초 / 사용 구간: ${formatSeconds(trimStart)}초 ~ ${formatSeconds(trimEnd)}초 / 용량: ${sizeMB}MB`;
}

function setStatus(message) { elements.statusLabel.textContent = message; }
function setGenerateEnabled(isEnabled) { elements.generateButton.disabled = !isEnabled; }
function setPlayerEnabled(isEnabled) { elements.playButton.disabled = !isEnabled; elements.resetButton.disabled = !isEnabled; elements.frameScrubberInput.disabled = !isEnabled; }
function setDownloadsEnabled(isEnabled) {
  elements.downloadButton.disabled = !isEnabled;
  elements.gifButton.disabled = !isEnabled || state.gifRendering;
  elements.metadataButton.disabled = !isEnabled;
}
function updateGifButtonState() { elements.gifButton.disabled = !(state.lastMetadata && state.lastBlob) || state.gifRendering; }

function clearSheetPreview(message) {
  previewContext.clearRect(0, 0, elements.previewCanvas.width, elements.previewCanvas.height);
  elements.previewOverlay.hidden = false;
  elements.previewOverlay.textContent = message;
}

function clearPlayerPreview(message) {
  playerContext.clearRect(0, 0, elements.playerCanvas.width, elements.playerCanvas.height);
  elements.playerOverlay.hidden = false;
  elements.playerOverlay.textContent = message;
}

function waitForEvent(target, eventName) {
  return new Promise((resolve) => target.addEventListener(eventName, resolve, { once: true }));
}

function waitForEventOrError(target, eventName, errorEventName = "error") {
  return new Promise((resolve, reject) => {
    const onSuccess = () => { target.removeEventListener(errorEventName, onError); resolve(); };
    const onError = () => { target.removeEventListener(eventName, onSuccess); reject(new Error(`Failed while waiting for ${eventName}`)); };
    target.addEventListener(eventName, onSuccess, { once: true });
    target.addEventListener(errorEventName, onError, { once: true });
  });
}

async function seekVideoTo(time) {
  const safeTime = clamp(time, 0, Math.max(elements.sourceVideo.duration - 0.001, 0));
  if (Math.abs(elements.sourceVideo.currentTime - safeTime) < 0.0001) { return; }
  const seeked = waitForEvent(elements.sourceVideo, "seeked");
  elements.sourceVideo.currentTime = safeTime;
  await seeked;
}

function getFrameRect(frameIndex) {
  if (!state.lastMetadata) { return null; }
  const { columns, tileWidth, tileHeight, gap } = state.lastMetadata;
  return {
    sx: (frameIndex % columns) * (tileWidth + gap),
    sy: Math.floor(frameIndex / columns) * (tileHeight + gap),
    sw: tileWidth,
    sh: tileHeight,
  };
}

function drawFrameToTile({ targetContext, sourceWidth, sourceHeight, dx, dy, tileSize, fillMode, background }) {
  if (background !== null) {
    targetContext.fillStyle = background;
    targetContext.fillRect(dx, dy, tileSize, tileSize);
  } else {
    targetContext.clearRect(dx, dy, tileSize, tileSize);
  }
  const sourceRatio = sourceWidth / sourceHeight;
  let drawWidth = tileSize;
  let drawHeight = tileSize;
  let offsetX = dx;
  let offsetY = dy;
  if (fillMode === "contain") {
    if (sourceRatio > 1) {
      drawHeight = tileSize / sourceRatio;
      offsetY = dy + (tileSize - drawHeight) / 2;
    } else {
      drawWidth = tileSize * sourceRatio;
      offsetX = dx + (tileSize - drawWidth) / 2;
    }
  } else if (sourceRatio > 1) {
    drawWidth = tileSize * sourceRatio;
    offsetX = dx - (drawWidth - tileSize) / 2;
  } else {
    drawHeight = tileSize / sourceRatio;
    offsetY = dy - (drawHeight - tileSize) / 2;
  }
  targetContext.drawImage(captureCanvas, offsetX, offsetY, drawWidth, drawHeight);
}

function stopPlayback() {
  state.playerPlaying = false;
  if (state.playerRafId) {
    cancelAnimationFrame(state.playerRafId);
    state.playerRafId = 0;
  }
  elements.playButton.textContent = "재생";
}

function updateScrubberLabel(frameFloat) {
  const totalFrames = state.lastMetadata?.totalFrames ?? 0;
  const currentFrame = totalFrames > 0 ? clamp(Math.floor(frameFloat) + 1, 1, totalFrames) : 0;
  elements.frameScrubberValue.textContent = `${currentFrame} / ${totalFrames}`;
}

function resetPlayerState() {
  stopPlayback();
  state.playerFrame = 0;
  state.playerDirection = 1;
  state.lastTickMs = 0;
  updateScrubberLabel(0);
}

function drawPlayerFrame(frameFloat) {
  if (!state.lastMetadata) { return; }
  const totalFrames = state.lastMetadata.totalFrames;
  const maxFrame = Math.max(totalFrames - 1, 0);
  const clampedFrame = clamp(frameFloat, 0, maxFrame);
  const baseFrame = Math.floor(clampedFrame);
  const tweenAmount = clampedFrame - baseFrame;
  const nextFrame = Math.min(baseFrame + 1, maxFrame);
  const scale = Number(elements.playerScaleInput.value) || 1;
  playerContext.clearRect(0, 0, elements.playerCanvas.width, elements.playerCanvas.height);
  playerContext.imageSmoothingEnabled = true;
  playerContext.imageSmoothingQuality = "high";
  playerContext.save();
  playerContext.translate(elements.playerCanvas.width / 2, elements.playerCanvas.height / 2);
  playerContext.scale(scale, scale);
  playerContext.translate(-elements.playerCanvas.width / 2, -elements.playerCanvas.height / 2);
  const currentRect = getFrameRect(baseFrame);
  if (!currentRect) { playerContext.restore(); return; }
  playerContext.globalAlpha = 1;
  playerContext.drawImage(elements.previewCanvas, currentRect.sx, currentRect.sy, currentRect.sw, currentRect.sh, 0, 0, elements.playerCanvas.width, elements.playerCanvas.height);
  if (elements.tweenPreviewInput.checked && tweenAmount > 0.001 && nextFrame !== baseFrame) {
    const nextRect = getFrameRect(nextFrame);
    playerContext.globalAlpha = tweenAmount;
    playerContext.drawImage(elements.previewCanvas, nextRect.sx, nextRect.sy, nextRect.sw, nextRect.sh, 0, 0, elements.playerCanvas.width, elements.playerCanvas.height);
  }
  playerContext.restore();
  elements.playerOverlay.hidden = true;
  elements.playerInfoLabel.textContent = `프레임 ${baseFrame + 1} / ${totalFrames}`;
  elements.frameScrubberInput.value = String(clampedFrame);
  updateScrubberLabel(clampedFrame);
}

function maybeCelebrateFrame(frameFloat) {
  if (!state.lastMetadata) { return; }
  if (Math.round(frameFloat) === state.lastMetadata.totalFrames - 1 && elements.loopInput.checked) {
    elements.playerInfoLabel.textContent = "마지막 프레임 도착";
  }
}

function stepPlayback(timestamp) {
  if (!state.playerPlaying || !state.lastMetadata) { return; }
  if (!state.lastTickMs) { state.lastTickMs = timestamp; }
  const fps = clamp(Number(elements.playbackFpsInput.value) || 12, 1, 60);
  const frameDuration = 1000 / fps;
  const elapsed = timestamp - state.lastTickMs;
  const advance = elapsed / frameDuration;
  const totalFrames = state.lastMetadata.totalFrames;
  const maxFrame = Math.max(totalFrames - 1, 0);
  if (advance > 0) {
    state.lastTickMs = timestamp;
    let nextFrame = state.playerFrame + advance * state.playerDirection;
    if (elements.pingPongInput.checked && totalFrames > 1) {
      if (nextFrame >= maxFrame) {
        if (elements.loopInput.checked) {
          nextFrame = maxFrame - (nextFrame - maxFrame);
          state.playerDirection = -1;
        } else {
          nextFrame = maxFrame;
          stopPlayback();
        }
      } else if (nextFrame <= 0) {
        if (elements.loopInput.checked) {
          nextFrame = Math.abs(nextFrame);
          state.playerDirection = 1;
        } else {
          nextFrame = 0;
          stopPlayback();
        }
      }
    } else if (nextFrame >= maxFrame) {
      nextFrame = elements.loopInput.checked ? (maxFrame === 0 ? 0 : nextFrame % totalFrames) : maxFrame;
      if (!elements.loopInput.checked) { stopPlayback(); }
    }
    state.playerFrame = clamp(nextFrame, 0, maxFrame);
  }
  drawPlayerFrame(state.playerFrame);
  maybeCelebrateFrame(state.playerFrame);
  if (state.playerPlaying) { state.playerRafId = requestAnimationFrame(stepPlayback); }
}

function playPlayback() {
  if (!state.lastMetadata) { return; }
  if (state.playerPlaying) { stopPlayback(); return; }
  state.playerPlaying = true;
  state.lastTickMs = 0;
  elements.playButton.textContent = "일시정지";
  state.playerRafId = requestAnimationFrame(stepPlayback);
}

function revealEggHint(id) {
  const user = getCurrentUser();
  if (!user) {
    return false;
  }
  if (!user.discoveredEggIds.includes(id) && user.docId) {
    updateDoc(doc(db, "users", user.docId), {
      discoveredEggIds: arrayUnion(id),
    }).catch((error) => {
      console.error(error);
    });
    return true;
  }
  return false;
}

function getDailyHint() {
  const now = new Date();
  const key = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  let hash = 0;
  for (const char of key) {
    hash = (hash * 31 + char.charCodeAt(0)) % EGG_HINTS.length;
  }
  return EGG_HINTS[hash];
}

function launchFireworks() {
  const colors = ["#00d98a", "#ff78b2", "#7c5cff", "#53c4ff", "#ffd166", "#ff8c42"];
  for (let burst = 0; burst < 3; burst += 1) {
    const originX = 20 + Math.random() * 60;
    const originY = 25 + Math.random() * 30;
    for (let i = 0; i < 18; i += 1) {
      const particle = document.createElement("span");
      particle.className = "firework-particle";
      particle.style.left = `${originX}%`;
      particle.style.top = `${originY}%`;
      particle.style.background = colors[(i + burst) % colors.length];
      particle.style.setProperty("--dx", `${(Math.random() - 0.5) * 220}px`);
      particle.style.setProperty("--dy", `${(Math.random() - 0.5) * 220}px`);
      particle.style.setProperty("--rot", `${Math.random() * 360}deg`);
      particle.style.animationDelay = `${burst * 120}ms`;
      elements.fireworksLayer.appendChild(particle);
      setTimeout(() => particle.remove(), 1400);
    }
  }
}

function discoverEgg(id, message) {
  if (!isLoggedIn()) {
    return;
  }
  const newlyDiscovered = revealEggHint(id);
  if (!newlyDiscovered) {
    return;
  }
  state.selectedEggId = id;
  renderEggHints();
  showSecretToast(`이스터에그 발견: ${message}`);
  launchFireworks();
}

function togglePartyMode(force) {
  const nextState = typeof force === "boolean" ? force : !document.body.classList.contains("party-mode");
  document.body.classList.toggle("party-mode", nextState);
  showSecretToast(nextState ? "시크릿 테마 활성화" : "시크릿 테마 종료");
  if (nextState) {
    discoverEgg("konami", "코나미 테마");
  } else {
    discoverEgg("partyoff", "시크릿 테마 종료");
  }
}

function updateTimeNotice() {
  const hour = new Date().getHours();
  let banner = "오늘도 멋진 작업 해봅시다.";
  let badge = "커뮤니티 + 툴";
  if (hour === 0) {
    banner = "지금 시간은 자정 12시입니다. 잠자세요.";
    badge = "자정 알림";
    discoverEgg("midnight", "자정 방문");
  } else if (hour === 12) {
    banner = "지금 시간은 낮 12시입니다. 밥먹어요.";
    badge = "점심 알림";
    discoverEgg("lunch", "점심 시간 방문");
  } else if (hour >= 2 && hour <= 4) {
    discoverEgg("nightowl", "올빼미 모드");
  } else if (hour >= 5 && hour <= 6) {
    discoverEgg("sunrise", "새벽 출석");
  }
  elements.timeBanner.textContent = banner;
  elements.timeNoticeBadge.textContent = badge;
}

function checkSecretCombos() {
  const layout = getLayoutConfig();
  const fps = Number(elements.playbackFpsInput.value);
  if (layout.columns === 4 && layout.rows === 4 && fps === 12 && elements.tweenPreviewInput.checked) {
    elements.sheetInfoLabel.textContent = "클래식 4x4 프리셋 감지";
    discoverEgg("classic", "클래식 4x4 프리셋");
  }
  if (layout.columns === 6 && layout.rows === 6 && elements.transparentInput.checked && elements.pingPongInput.checked) {
    discoverEgg("ghost", "Ghost Grid");
  }
  if (layout.columns === 3 && layout.rows === 3 && Number(elements.gapInput.value) === 3) {
    discoverEgg("triple", "Triple Three");
  }
  if (layout.tileSize <= 80) {
    discoverEgg("tiny", "Tiny Sheet");
  }
  if (Number(elements.qualityInput.value) >= 2.45) {
    discoverEgg("huge", "초고품질 모드");
  }
  if (elements.frameOrderInput.value === "reverse") {
    discoverEgg("reverse", "역재생 시트");
  }
  if (layout.columns === 1 && layout.rows === 1) {
    discoverEgg("single", "1x1 스티커");
  }
  if (elements.pingPongInput.checked && elements.loopInput.checked) {
    discoverEgg("pingpong", "핑퐁 루프");
  }
  if (elements.transparentInput.checked && elements.formatInput.value === "image/png") {
    discoverEgg("transparent", "투명 PNG");
  }
  if (Number(elements.gapInput.value) >= 24) {
    discoverEgg("gapmax", "와이드 갭");
  }
  if (Math.abs(Number(elements.trimEndInput.value) - Number(elements.trimStartInput.value)) <= 5) {
    discoverEgg("trimtight", "초압축 구간");
  }
  if (!elements.autoplayInput.checked) {
    discoverEgg("autoplayoff", "수동 재생 모드");
  }
}

function setupPlayerAfterGeneration() {
  if (!state.lastMetadata) { setPlayerEnabled(false); return; }
  elements.frameScrubberInput.min = "0";
  elements.frameScrubberInput.max = String(Math.max(state.lastMetadata.totalFrames - 1, 0));
  elements.frameScrubberInput.step = "0.001";
  setPlayerEnabled(true);
  updateGifButtonState();
  resetPlayerState();
  drawPlayerFrame(0);
  if (elements.autoplayInput.checked) { playPlayback(); }
  if (state.lastMetadata.totalFrames === 1) { discoverEgg("single", "1프레임 스티커"); }
}

async function generateFlipbookSheet() {
  if (!state.file) {
    clearSheetPreview("먼저 영상을 업로드해 주세요.");
    clearPlayerPreview("먼저 플립북을 생성해 주세요.");
    return;
  }
  const { columns, rows, tileSize, gap, totalFrames, sheetWidth, sheetHeight } = getLayoutConfig();
  const mimeType = elements.formatInput.value;
  const fillMode = elements.fillModeInput.value;
  const transparent = elements.transparentInput.checked && mimeType !== "image/jpeg";
  const background = transparent ? null : elements.backgroundInput.value;
  const trimStartRatio = Number(elements.trimStartInput.value) / 100;
  const trimEndRatio = Number(elements.trimEndInput.value) / 100;
  const trimStartTime = elements.sourceVideo.duration * trimStartRatio;
  const trimEndTime = elements.sourceVideo.duration * trimEndRatio;
  const sampledDuration = Math.max(trimEndTime - trimStartTime, 0.001);
  stopPlayback();
  setStatus("프레임 추출 중");
  setGenerateEnabled(false);
  setDownloadsEnabled(false);
  updateGifButtonState();
  setPlayerEnabled(false);
  elements.previewOverlay.hidden = true;
  elements.playerOverlay.hidden = false;
  elements.playerOverlay.textContent = "플립북을 조합하는 중입니다.";
  elements.previewCanvas.width = sheetWidth;
  elements.previewCanvas.height = sheetHeight;
  previewContext.clearRect(0, 0, sheetWidth, sheetHeight);
  previewContext.imageSmoothingEnabled = true;
  previewContext.imageSmoothingQuality = "high";
  captureCanvas.width = elements.sourceVideo.videoWidth;
  captureCanvas.height = elements.sourceVideo.videoHeight;
  captureContext.imageSmoothingEnabled = true;
  captureContext.imageSmoothingQuality = "high";
  let timestamps = Array.from({ length: totalFrames }, (_, index) => totalFrames === 1 ? trimStartTime : trimStartTime + sampledDuration * ((index + 0.5) / totalFrames));
  if (elements.frameOrderInput.value === "reverse") { timestamps = timestamps.reverse(); }
  for (let index = 0; index < timestamps.length; index += 1) {
    await seekVideoTo(timestamps[index]);
    captureContext.clearRect(0, 0, captureCanvas.width, captureCanvas.height);
    captureContext.drawImage(elements.sourceVideo, 0, 0, captureCanvas.width, captureCanvas.height);
    drawFrameToTile({
      targetContext: previewContext,
      sourceWidth: captureCanvas.width,
      sourceHeight: captureCanvas.height,
      dx: (index % columns) * (tileSize + gap),
      dy: Math.floor(index / columns) * (tileSize + gap),
      tileSize,
      fillMode,
      background,
    });
  }
  const compression = clamp(Number(elements.compressionInput.value) || 0.96, 0.4, 1);
  const blob = await new Promise((resolve) => elements.previewCanvas.toBlob(resolve, mimeType, compression));
  if (!blob) { throw new Error("Canvas export failed"); }
  state.outputExtension = mimeType.split("/")[1].replace("jpeg", "jpg");
  state.lastBlob = blob;
  state.lastMetadata = {
    sourceFile: state.file.name, sheetWidth, sheetHeight, tileWidth: tileSize, tileHeight: tileSize, gap, columns, rows, totalFrames, fillMode,
    background: background ?? "transparent", transparentBackground: transparent, mimeType, compression, trimStartRatio, trimEndRatio,
    trimStartTime: Number(trimStartTime.toFixed(4)), trimEndTime: Number(trimEndTime.toFixed(4)), sourceDuration: Number(elements.sourceVideo.duration.toFixed(4)),
    frameOrder: elements.frameOrderInput.value, timestamps: timestamps.map((time, index) => ({ frame: index, time: Number(time.toFixed(4)) })),
  };
  elements.fileNameLabel.textContent = `${sanitizeFileName(state.file.name)}-flipbook.${state.outputExtension}`;
  elements.sheetInfoLabel.textContent = `${columns} x ${rows} / ${tileSize}px / gap ${gap}px`;
  clearPlayerPreview("플레이어를 준비 중입니다.");
  setupPlayerAfterGeneration();
  setStatus("다운로드 준비 완료");
  setDownloadsEnabled(true);
  updateGifButtonState();
  setGenerateEnabled(true);
  checkSecretCombos();
}

async function handleVideoSelected(event) {
  const file = event.target.files?.[0];
  if (!file) { return; }
  if (state.fileUrl) { URL.revokeObjectURL(state.fileUrl); }
  stopPlayback();
  state.file = file;
  state.lastBlob = null;
  state.lastMetadata = null;
  state.gifRendering = false;
  setDownloadsEnabled(false);
  updateGifButtonState();
  setPlayerEnabled(false);
  setStatus("영상 로드 중");
  elements.sheetInfoLabel.textContent = "입력 확인 중";
  elements.playerInfoLabel.textContent = "재생 대기";
  state.fileUrl = URL.createObjectURL(file);
  elements.sourceVideo.src = state.fileUrl;
  elements.sourceVideo.load();
  await waitForEventOrError(elements.sourceVideo, "loadedmetadata");
  updateVideoMeta();
  updateSheetStats();
  setGenerateEnabled(true);
  setStatus("생성 준비 완료");
  clearSheetPreview("플립북 생성 버튼을 누르면 시트가 만들어집니다.");
  clearPlayerPreview("플립북 생성 후 영상처럼 재생해서 확인할 수 있습니다.");
  if (/flip|book|sprite/i.test(file.name)) { showSecretToast("이름에서 플립북 기운이 느껴집니다"); }
  if (/flip|book|sprite/i.test(file.name)) { discoverEgg("nameflip", "파일명 감지"); }
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function handleDownloadImage() {
  if (!state.lastBlob || !state.file) { return; }
  downloadBlob(state.lastBlob, `${sanitizeFileName(state.file.name)}-flipbook.${state.outputExtension}`);
}

function handleDownloadMetadata() {
  if (!state.lastMetadata || !state.file) { return; }
  discoverEgg("metadata", "메타데이터 수집");
  downloadBlob(new Blob([JSON.stringify(state.lastMetadata, null, 2)], { type: "application/json" }), `${sanitizeFileName(state.file.name)}-flipbook.json`);
}

async function handleDownloadGif() {
  if (!state.lastMetadata || !state.file || state.gifRendering) { return; }
  if (typeof GIF === "undefined") { setStatus("GIF 라이브러리 로드 실패"); return; }
  state.gifRendering = true;
  updateGifButtonState();
  setStatus("GIF 렌더링 중");
  const gifSize = clamp(Number(elements.gifSizeInput.value) || 512, 128, 1024);
  const fps = clamp(Number(elements.playbackFpsInput.value) || 12, 1, 60);
  const gif = new GIF({
    workers: 2,
    quality: clamp(Number(elements.gifQualityInput.value) || 8, 1, 20),
    width: gifSize,
    height: gifSize,
    workerScript: "https://cdn.jsdelivr.net/npm/gif.js.optimized@1.0.1/dist/gif.worker.js",
  });
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = gifSize;
  tempCanvas.height = gifSize;
  const tempContext = tempCanvas.getContext("2d");
  for (let index = 0; index < state.lastMetadata.totalFrames; index += 1) {
    const frameRect = getFrameRect(index);
    tempContext.clearRect(0, 0, gifSize, gifSize);
    tempContext.drawImage(elements.previewCanvas, frameRect.sx, frameRect.sy, frameRect.sw, frameRect.sh, 0, 0, gifSize, gifSize);
    gif.addFrame(tempCanvas, { copy: true, delay: Math.round(1000 / fps) });
  }
  const blob = await new Promise((resolve, reject) => {
    gif.on("finished", resolve);
    gif.on("abort", () => reject(new Error("GIF render aborted")));
    gif.on("error", reject);
    gif.render();
  });
  state.gifRendering = false;
  updateGifButtonState();
  setStatus("GIF 다운로드 완료");
  discoverEgg("gif", "GIF 제작 완료");
  downloadBlob(blob, `${sanitizeFileName(state.file.name)}-flipbook.gif`);
}

function subscribeUsers() {
  onSnapshot(query(collection(db, "users"), orderBy("createdAt", "asc")), (snapshot) => {
    state.users = snapshot.docs.map((snapshotDoc) => ({
      docId: snapshotDoc.id,
      ...snapshotDoc.data(),
      discoveredEggIds: Array.isArray(snapshotDoc.data().discoveredEggIds) ? snapshotDoc.data().discoveredEggIds : [],
      passwordHash: snapshotDoc.data().passwordHash || "",
      legacyPassword: "",
    }));
    if (state.currentUserId && !getCurrentUser()) {
      state.currentUserId = "";
      saveUsers();
    }
    renderAuthState();
    renderEggHints();
    renderBoard();
  });
}

function subscribePosts() {
  onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc")), (snapshot) => {
    state.boardPosts = snapshot.docs.map((snapshotDoc) => ({
      docId: snapshotDoc.id,
      ...snapshotDoc.data(),
      comments: Array.isArray(snapshotDoc.data().comments) ? snapshotDoc.data().comments : [],
      media: Array.isArray(snapshotDoc.data().media) ? snapshotDoc.data().media : [],
    }));
    renderBoard();
    if (!state.boardPosts.length) {
      discoverEgg("boardempty", "빈 게시판");
    }
  });
}

function renderEggHints(showAll = false) {
  const user = getCurrentUser();
  const foundIds = getUserDiscoveredEggIds(user);
  elements.eggCountLabel.textContent = user ? `${foundIds.length}개 발견` : "로그인 필요";
  const visible = EGG_HINTS.filter((hint) => foundIds.includes(hint.id));
  const remaining = EGG_HINTS.filter((hint) => !foundIds.includes(hint.id));
  const todayHint = getDailyHint();
  elements.dailyEggHintCard.textContent = `오늘의 힌트: ${todayHint.method}`;
  elements.eggProgressCard.textContent = `발견 ${visible.length} / 남은 ${remaining.length} / 전체 ${EGG_HINTS.length}`;
  elements.eggHintsList.innerHTML = visible.length
    ? visible.map((hint) => {
      const discovererCount = getEggDiscoverers(hint.id).length;
      return `<li><button class="egg-entry-button" type="button" data-egg-id="${hint.id}"><strong>${escapeHtml(hint.name)}</strong><br>${escapeHtml(hint.method)}<br>찾은 사람 수 ${discovererCount}명 / 확률 ${escapeHtml(hint.chance)}</button></li>`;
    }).join("")
    : "<li>로그인 후 이스터에그를 찾으면 여기에 표시됩니다.</li>";
  elements.remainingEggsList.innerHTML = remaining.length
    ? remaining.map((hint) => {
      const discovererCount = getEggDiscoverers(hint.id).length;
      return `<li><button class="egg-entry-button is-hidden" type="button" data-egg-id="${hint.id}"><strong>???</strong><br>???<br>찾은 사람 수 ${discovererCount}명 / 확률 ${escapeHtml(hint.chance)}</button></li>`;
    }).join("")
    : "<li>모든 이스터에그를 찾았습니다.</li>";

  const selectedEgg = getEggById(state.selectedEggId) || visible[0] || remaining[0] || null;
  if (!selectedEgg) {
    elements.eggDetailCard.textContent = "도감에서 이스터에그를 누르면 상세 정보가 표시됩니다.";
    return;
  }

  const found = foundIds.includes(selectedEgg.id);
  const discoverers = getEggDiscoverers(selectedEgg.id);
  const discovererNames = discoverers.length ? discoverers.map((userItem) => userItem.username).join(", ") : "아직 없음";
  elements.eggDetailCard.innerHTML = found
    ? `<strong>${escapeHtml(selectedEgg.name)}</strong><br>${escapeHtml(selectedEgg.method)}<br>찾은 사람 수 ${discoverers.length}명<br>찾은 사람: ${escapeHtml(discovererNames)}<br>확률 ${escapeHtml(selectedEgg.chance)}`
    : `<strong>???</strong><br>???<br>찾은 사람 수 ${discoverers.length}명<br>확률 ${escapeHtml(selectedEgg.chance)}`;
}

function filterPosts() {
  const keyword = elements.boardSearchInput.value.trim().toLowerCase();
  if (!keyword) { return state.boardPosts; }
  return state.boardPosts.filter((post) => [post.title, post.author, post.content].join(" ").toLowerCase().includes(keyword));
}

function renderMedia(media) {
  if (!media?.length) { return ""; }
  return `<div class="post-media-grid">${media.map((item) => item.type.startsWith("image/") ? `<img src="${item.dataUrl}" alt="${escapeHtml(item.name)}">` : `<video src="${item.dataUrl}" controls preload="metadata"></video>`).join("")}</div>`;
}

function renderCodeBlock(content) {
  const payload = getCodePayload(content);
  if (!payload) { return ""; }
  return `
    <div class="code-shell" data-code-shell>
      <div class="code-head">
        <strong>코드로 감지됨</strong>
        <div class="inline-actions">
          <button class="ghost-button" type="button" data-toggle-code>더보기</button>
          <button class="ghost-button" type="button" data-copy-code>복사</button>
        </div>
      </div>
      <div class="code-preview">${escapeHtml(payload.preview)}</div>
      <pre class="code-full">${escapeHtml(payload.full)}</pre>
    </div>
  `;
}

function renderPostBody(post) {
  if (getCodePayload(post.content)) {
    return `<div class="post-body">코드가 포함된 게시글입니다. 더보기를 눌러 전체 코드를 확인하세요.</div>${renderCodeBlock(post.content)}`;
  }
  return `<div class="post-body">${escapeHtml(post.content)}</div>`;
}

function renderComment(comment) {
  return `
    <div class="comment-card">
      <div class="comment-head">
        <strong>${escapeHtml(comment.author)}</strong>
        <span class="comment-meta">${formatDateTime(comment.createdAt)}</span>
      </div>
      <div class="comment-body">${escapeHtml(comment.content)}</div>
    </div>
  `;
}

function renderBoard() {
  const posts = filterPosts();
  const currentUser = getCurrentUser();
  elements.boardStatsLabel.textContent = `게시글 ${posts.length}개`;
  if (!posts.length) {
    elements.boardFeed.innerHTML = `<div class="empty-board">아직 게시글이 없습니다. 첫 글을 올려보세요.</div>`;
    return;
  }
  elements.boardFeed.innerHTML = posts.map((post) => `
    <article class="post-card" data-post-id="${post.id}">
      <div class="post-head">
        <div>
          <strong>${escapeHtml(post.title)}</strong>
          <div class="post-meta">${escapeHtml(post.author)} · ${formatDateTime(post.createdAt)}</div>
        </div>
        <div class="post-meta">${post.ownerId && currentUser && post.ownerId === currentUser.id ? '<span class="owner-badge">내 글</span>' : `댓글 ${post.comments.length}개`}</div>
      </div>
      ${renderPostBody(post)}
      ${renderMedia(post.media)}
      <div class="post-actions">
        <button class="ghost-button" type="button" data-copy-post>내용 복사</button>
        ${post.ownerId && currentUser && post.ownerId === currentUser.id ? '<button class="danger-button" type="button" data-delete-post>삭제</button>' : ""}
      </div>
      <div class="comment-list">${post.comments.map(renderComment).join("")}</div>
      <div class="comment-form">
        <span>댓글 달기</span>
        <textarea rows="3" maxlength="300" placeholder="댓글을 입력하세요." data-comment-content></textarea>
        <button class="primary-button" type="button" data-submit-comment>댓글 작성</button>
      </div>
    </article>
  `).join("");
}

function readFilesAsDataUrls(fileList) {
  return Promise.all(Array.from(fileList).map((file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, dataUrl: reader.result });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  })));
}

async function uploadBoardMedia(files, postId) {
  const uploads = await Promise.all(Array.from(files).map(async (file, index) => {
    const safeName = sanitizeFileName(file.name || `media-${index}`);
    const storageRef = ref(storage, `posts/${postId}/${Date.now()}-${safeName}`);
    await uploadBytes(storageRef, file);
    return {
      name: file.name,
      type: file.type,
      size: file.size,
      dataUrl: await getDownloadURL(storageRef),
    };
  }));
  return uploads;
}

async function handleBoardSubmit() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showSecretToast("게시글을 쓰려면 먼저 로그인해 주세요");
    return;
  }
  const author = moderateText(elements.boardAuthorInput.value || "익명");
  const title = moderateText(elements.boardTitleInput.value);
  const content = moderateText(elements.boardContentInput.value);
  if (!title || !content) { showSecretToast("제목과 내용을 입력해 주세요"); return; }
  const files = Array.from(elements.boardMediaInput.files || []);
  if (files.length > 4) { showSecretToast("첨부는 최대 4개까지 가능합니다"); return; }
  if (files.some((file) => file.size > 2.5 * 1024 * 1024)) { showSecretToast("첨부 파일은 개당 2.5MB 이하로 올려주세요"); return; }
  const postId = createId("post");
  const media = files.length ? await uploadBoardMedia(files, postId) : [];
  await addDoc(collection(db, "posts"), {
    id: postId,
    ownerId: currentUser.id,
    author: currentUser.username,
    authorLower: currentUser.username.toLowerCase(),
    title,
    content,
    createdAt: Date.now(),
    media,
    comments: [],
  });
  elements.boardTitleInput.value = "";
  elements.boardContentInput.value = "";
  elements.boardMediaInput.value = "";
  if (getCodePayload(content)) { discoverEgg("codepost", "코드 게시글"); }
  if (media.length) { discoverEgg("mediapost", "미디어 게시글"); }
  if (media.some((item) => item.type.startsWith("image/")) && media.some((item) => item.type.startsWith("video/"))) {
    discoverEgg("allmedia", "이미지+영상 동시 첨부");
  }
  if (content.length >= 280) { discoverEgg("longpost", "장문 게시글"); }
  if (/flipbook|sprite/i.test(title)) { discoverEgg("flipbookword", "제목 키워드"); }
  showSecretToast(getCodePayload(content) ? "코드 게시글로 감지되어 접기 UI가 적용됐습니다" : "게시글이 올라갔습니다");
}

function addSeedPosts() {
  if (state.boardPosts.length) { showSecretToast("이미 게시글이 있어 샘플은 넣지 않았습니다"); return; }
  Promise.all(SEED_POSTS.map((post) => addDoc(collection(db, "posts"), { ...post, createdAt: Date.now() - Math.floor(Math.random() * 100000) }))).catch((error) => {
    console.error(error);
    showSecretToast("샘플 글 업로드에 실패했습니다");
  });
  discoverEgg("seed", "샘플 글 호출");
  showSecretToast("샘플 글을 넣었습니다");
}

function copyText(text, successMessage) {
  navigator.clipboard.writeText(text).then(() => showSecretToast(successMessage)).catch(() => showSecretToast("복사에 실패했습니다"));
}

function handleBoardFeedClick(event) {
  const postCard = event.target.closest("[data-post-id]");
  if (!postCard) { return; }
  const post = state.boardPosts.find((item) => item.id === postCard.dataset.postId);
  if (!post) { return; }

  if (event.target.matches("[data-toggle-code]")) {
    const shell = postCard.querySelector("[data-code-shell]");
    if (shell) {
      shell.classList.toggle("is-open");
      event.target.textContent = shell.classList.contains("is-open") ? "접기" : "더보기";
    }
  }
  if (event.target.matches("[data-copy-code]")) { copyText(post.content, "코드를 복사했습니다"); }
  if (event.target.matches("[data-copy-code]")) { discoverEgg("copycode", "코드 복사"); }
  if (event.target.matches("[data-copy-post]")) { copyText(post.content, "게시글 내용을 복사했습니다"); discoverEgg("copypost", "게시글 복사"); }
  if (event.target.matches("[data-delete-post]")) {
    if (post.ownerId !== getCurrentUser()?.id) {
      showSecretToast("본인 글만 삭제할 수 있습니다");
      return;
    }
    deleteDoc(doc(db, "posts", post.docId)).catch((error) => {
      console.error(error);
      showSecretToast("게시글 삭제에 실패했습니다");
    });
    showSecretToast("게시글을 삭제했습니다");
  }
  if (event.target.matches("[data-submit-comment]")) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      showSecretToast("댓글을 쓰려면 먼저 로그인해 주세요");
      return;
    }
    const contentInput = postCard.querySelector("[data-comment-content]");
    const content = moderateText(contentInput.value);
    if (!content) { showSecretToast("댓글 내용을 입력해 주세요"); return; }
    updateDoc(doc(db, "posts", post.docId), {
      comments: arrayUnion({
        id: createId("comment"),
        ownerId: currentUser.id,
        author: currentUser.username,
        content,
        createdAt: Date.now(),
      }),
    }).catch((error) => {
      console.error(error);
      showSecretToast("댓글 등록에 실패했습니다");
    });
    showSecretToast("댓글이 등록됐습니다");
    discoverEgg("commenter", "댓글 작성");
    if (currentUser.username === "익명") { discoverEgg("nocommentname", "익명 댓글"); }
  }
}

function attachEvents() {
  [
    elements.columnsInput, elements.rowsInput, elements.tileSizeInput, elements.gapInput, elements.qualityInput, elements.fillModeInput,
    elements.trimStartInput, elements.trimEndInput, elements.frameOrderInput, elements.formatInput, elements.compressionInput,
    elements.backgroundInput, elements.transparentInput, elements.gifSizeInput, elements.gifQualityInput, elements.playbackFpsInput, elements.playerScaleInput,
  ].forEach((control) => {
    control.addEventListener("input", () => {
      if (control === elements.trimStartInput) { syncTrimControls("start"); }
      if (control === elements.trimEndInput) { syncTrimControls("end"); }
      updateSliderLabels();
      syncBackgroundControls();
      updateVideoMeta();
      updateSheetStats();
      if (control === elements.playerScaleInput && Number(elements.playerScaleInput.value) >= 1.75) {
        discoverEgg("zoom", "플레이어 줌");
      }
      if (state.lastMetadata && (control === elements.playerScaleInput || control === elements.playbackFpsInput)) { drawPlayerFrame(state.playerFrame); }
    });
    control.addEventListener("change", () => {
      updateSliderLabels();
      syncBackgroundControls();
      updateVideoMeta();
      updateSheetStats();
    });
  });

  elements.videoInput.addEventListener("change", (event) => {
    handleVideoSelected(event).catch((error) => {
      console.error(error);
      state.file = null;
      setGenerateEnabled(false);
      setStatus("영상 로드 실패");
      updateVideoMeta();
      clearSheetPreview("브라우저가 이 영상을 읽지 못했습니다. 다른 파일로 다시 시도해 주세요.");
      clearPlayerPreview("플레이 미리보기를 준비할 수 없습니다.");
    });
  });
  elements.generateButton.addEventListener("click", () => generateFlipbookSheet().catch((error) => {
    console.error(error);
    setStatus("생성 실패");
    clearSheetPreview("시트를 만드는 중 문제가 생겼습니다. 설정을 바꿔 다시 시도해 주세요.");
    clearPlayerPreview("생성 실패로 인해 플레이할 수 없습니다.");
    setGenerateEnabled(true);
  }));
  elements.downloadButton.addEventListener("click", handleDownloadImage);
  elements.metadataButton.addEventListener("click", handleDownloadMetadata);
  elements.gifButton.addEventListener("click", () => handleDownloadGif().catch((error) => {
    console.error(error);
    state.gifRendering = false;
    updateGifButtonState();
    setStatus("GIF 생성 실패");
  }));
  elements.playButton.addEventListener("click", playPlayback);
  elements.resetButton.addEventListener("click", () => { resetPlayerState(); drawPlayerFrame(0); showSecretToast("첫 프레임으로 복귀"); });
  elements.frameScrubberInput.addEventListener("input", () => {
    if (!state.lastMetadata) { return; }
    stopPlayback();
    state.playerFrame = clamp(Number(elements.frameScrubberInput.value) || 0, 0, state.lastMetadata.totalFrames - 1);
    drawPlayerFrame(state.playerFrame);
    if (state.lastMetadata && state.playerFrame >= state.lastMetadata.totalFrames - 1) {
      discoverEgg("scrubend", "스크럽 끝 프레임");
      if (!elements.loopInput.checked) {
        discoverEgg("loopoff", "비루프 종료 지점");
      }
    }
  });
  elements.tweenPreviewInput.addEventListener("change", () => {
    if (state.lastMetadata) { drawPlayerFrame(state.playerFrame); }
    showSecretToast(elements.tweenPreviewInput.checked ? "Tween 미리보기 ON" : "Tween 미리보기 OFF");
  });
  elements.heroBadge.addEventListener("click", () => {
    state.badgeClicks += 1;
    if (state.badgeClicks === 3) { showSecretToast("배지를 세 번 눌렀네요"); }
    if (state.badgeClicks === 5) {
      togglePartyMode(true);
      discoverEgg("badge", "배지 연타");
      state.badgeClicks = 0;
    }
  });
  elements.playerCanvas.addEventListener("dblclick", () => {
    if (!state.lastMetadata) { return; }
    elements.playerScaleInput.value = elements.playerScaleInput.value === "1.25" ? "1" : "1.25";
    updateSliderLabels();
    drawPlayerFrame(state.playerFrame);
    discoverEgg("double", "플레이어 더블클릭");
    showSecretToast("더블클릭: 플레이어 확대 토글");
  });
  window.addEventListener("keydown", (event) => {
    const allowed = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "b", "a", "B", "A"];
    if (!allowed.includes(event.key)) { state.konamiBuffer = ""; return; }
    state.konamiBuffer = `${state.konamiBuffer}|${event.key}`.slice(-80);
    const secret = "arrowup|arrowup|arrowdown|arrowdown|arrowleft|arrowright|arrowleft|arrowright|b|a";
    if (state.konamiBuffer.toLowerCase().endsWith(secret)) {
      togglePartyMode();
      state.konamiBuffer = "";
    }
  });
  elements.boardSubmitButton.addEventListener("click", () => handleBoardSubmit().catch((error) => {
    console.error(error);
    showSecretToast("게시글 저장에 실패했습니다");
  }));
  elements.authLoginButton.addEventListener("click", () => loginOrSignup().catch((error) => {
    console.error(error);
    showSecretToast("로그인 처리 중 오류가 발생했습니다");
  }));
  elements.authLogoutButton.addEventListener("click", logout);
  elements.renameButton.addEventListener("click", renameCurrentUser);
  elements.boardSeedButton.addEventListener("click", addSeedPosts);
  elements.boardSearchInput.addEventListener("input", () => {
    renderBoard();
    if (/lua|script|ui|flipbook|sprite/i.test(elements.boardSearchInput.value)) {
      discoverEgg("search", "검색 키워드");
    }
  });
  elements.boardFeed.addEventListener("click", handleBoardFeedClick);
  [elements.eggHintsList, elements.remainingEggsList].forEach((list) => {
    list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-egg-id]");
      if (!button) {
        return;
      }
      state.selectedEggId = button.dataset.eggId;
      renderEggHints();
    });
  });
}

function initialize() {
  loadUsers();
  attachEvents();
  subscribeUsers();
  subscribePosts();
  updateSliderLabels();
  syncBackgroundControls();
  updateSheetStats();
  updateVideoMeta();
  updateTimeNotice();
  renderAuthState();
  setPlayerEnabled(false);
  updateGifButtonState();
  clearSheetPreview("영상을 업로드하면 여기에서 플립북 시트를 볼 수 있습니다.");
  clearPlayerPreview("플립북 생성 후 영상처럼 재생해서 확인할 수 있습니다.");
  renderEggHints();
}

initialize();
