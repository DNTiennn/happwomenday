/* =====================================================
   ✏️  PHẦN CẦN SỬA: toàn bộ nội dung nằm trong CONFIG
   Có thể dùng cho bất kỳ ngày nào (8/3, sinh nhật, Valentine...)
   ===================================================== */
const CONFIG = {
    date: "20/10", // Chữ hiện trên huy hiệu
    sticker: "🌸 Happy Women's Day 🌸", // Dòng nhỏ phía trên
    title: "Chúc mừng Ngày Phụ nữ Việt Nam", // Tiêu đề chính
    giftText: "Bấm để mở quà nè", // Chữ dưới hộp quà
    giftEmoji: "🎁",

    recipient: "Nguyễn Kim Ngân", // Gửi cho ai
    sender: "Một người luôn ủng hộ bạn", // Người gửi

    // Lời chúc chính (xuống dòng bằng \n)
    message: "Chúc Kim Ngân 20/10 thật vui vẻ và luôn hạnh phúc nhé! 🌷\n" +
        "Mong bạn luôn giữ được nhiệt huyết với con đường mình đã chọn, sớm trở thành một bác sĩ giỏi, có tâm và luôn được mọi người yêu quý.\n" +
        "Chúc kn dù học tập có vất vả đến đâu cũng đừng quên chăm sóc bản thân và mỉm cười thật nhiều nhé.\n" +
        "Cố gắng lên, bác sĩ tương lai! 🩺💗",

    // Các "chip" nhỏ + kho lời chúc ngẫu nhiên khi bấm "Chúc thêm"
    wishes: [
        "Luôn xinh 🌷",
        "Bình an 🍀",
        "Deadline tránh xa 🏃‍♀️",
        "Ví luôn đầy 💸",
        "Cười thật nhiều 😆",
        "Yêu bản thân trước 🫶",
        "Mãi tự tin 👑",
        "Mỗi ngày là một món quà 🎀"
    ],

    // Emoji bay lên ở nền
    emojis: ["🌸", "💖", "✨", "🌷", "🎀", "💐", "🦋", "🍓"],

    // Đếm ngược tới ngày (định dạng YYYY-MM-DD). Để "" để tắt.
    countdownDate: "2026-10-20",
    countdownToday: "🎉 Hôm nay chính là ngày đó rồi!",
    countdownBefore: "⏳ Hôm nay là một ngày đặc biệt",
    countdownAfter: "💌 Ngày đặc biệt đã qua {n} ngày, nhưng lời chúc thì vẫn mới!",

    footer: "Made with 💖 • bấm vào card để thả tim",
    typingSpeed: 35, // ms mỗi ký tự (nhỏ = nhanh)
    theme: 0 // 0..3 (xem THEMES bên dưới)
};

/* Bộ màu: thêm/bớt tuỳ thích */
const THEMES = [
    { c1: "#ff6bb5", c2: "#a66bff", c3: "#ffc46b", a: "#ffe3f1", b: "#e9deff", text: "#3b1d4f" }, // Kẹo hồng-tím
    { c1: "#ff8a6b", c2: "#ff5d8f", c3: "#ffd36b", a: "#fff0e0", b: "#ffe0ea", text: "#4d2020" }, // Đào sunset
    { c1: "#4ee0c0", c2: "#6b8bff", c3: "#c7ff6b", a: "#dffaf3", b: "#e0e8ff", text: "#173a4a" }, // Bạc hà
    { c1: "#ff3cac", c2: "#784ba0", c3: "#2b86c5", a: "#2a1646", b: "#0f1b3d", text: "#ffffff" } // Neon tối
];

/* =====================================================
   PHẦN XỬ LÝ (thường không cần sửa)
   ===================================================== */
const $ = (id) => document.getElementById(id);

// Cho phép đổi nội dung qua link: ?to=Lan&from=Minh&date=8/3&title=...&msg=...
(function readParams() {
    const p = new URLSearchParams(location.search);
    if (p.get("to")) CONFIG.recipient = p.get("to");
    if (p.get("from")) CONFIG.sender = p.get("from");
    if (p.get("date")) CONFIG.date = p.get("date");
    if (p.get("title")) CONFIG.title = p.get("title");
    if (p.get("msg")) CONFIG.message = p.get("msg");
    if (p.get("theme") !== null && !isNaN(+p.get("theme"))) CONFIG.theme = +p.get("theme");
})();

let themeIndex = CONFIG.theme % THEMES.length;
let typingTimer = null;

function applyTheme(i) {
    const t = THEMES[i];
    const r = document.documentElement.style;
    r.setProperty("--c1", t.c1);
    r.setProperty("--c2", t.c2);
    r.setProperty("--c3", t.c3);
    r.setProperty("--bg-a", t.a);
    r.setProperty("--bg-b", t.b);
    r.setProperty("--text", t.text);
}

function fillContent() {
    $("date").textContent = CONFIG.date;
    $("sticker").textContent = CONFIG.sticker;
    $("title").textContent = CONFIG.title;
    $("giftText").textContent = CONFIG.giftText;
    document.querySelector(".gift-emoji").textContent = CONFIG.giftEmoji;
    $("recipient").textContent = CONFIG.recipient;
    $("sender").textContent = CONFIG.sender;
    $("footer").textContent = CONFIG.footer;
    document.title = CONFIG.title + " 💖";

    // chips
    const ul = $("chips");
    ul.innerHTML = "";
    CONFIG.wishes.slice(0, 5).forEach((w, i) => addChip(w, i));

    // đếm ngược
    const cd = $("countdown");
    if (CONFIG.countdownDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(CONFIG.countdownDate + "T00:00:00");
        const diff = Math.round((target - today) / 86400000);
        if (diff === 0) cd.textContent = CONFIG.countdownToday;
        else if (diff > 0) cd.textContent = CONFIG.countdownBefore.replace("{n}", diff);
        else cd.textContent = CONFIG.countdownAfter.replace("{n}", Math.abs(diff));
    } else {
        cd.textContent = "";
    }
}

function addChip(text, i = 0) {
    const li = document.createElement("li");
    li.textContent = text;
    li.style.animationDelay = i * 0.08 + "s";
    $("chips").appendChild(li);
}

function typeMessage(text) {
    const el = $("message");
    clearInterval(typingTimer);
    el.textContent = "";
    el.classList.remove("done");
    let i = 0;
    typingTimer = setInterval(() => {
        el.textContent += text[i++];
        if (i >= text.length) {
            clearInterval(typingTimer);
            el.classList.add("done");
        }
    }, CONFIG.typingSpeed);
}

/* ---------- Emoji bay ---------- */
function spawnFloater(x) {
    const span = document.createElement("span");
    span.className = "floater";
    span.textContent = CONFIG.emojis[Math.floor(Math.random() * CONFIG.emojis.length)];
    const dur = 6 + Math.random() * 6;
    span.style.left = (x !== undefined ? x + "px" : Math.random() * 100 + "vw");
    span.style.fontSize = 18 + Math.random() * 26 + "px";
    span.style.animationDuration = dur + "s";
    span.style.setProperty("--rot", (Math.random() * 80 - 40) + "deg");
    $("floaters").appendChild(span);
    setTimeout(() => span.remove(), dur * 1000);
}
setInterval(spawnFloater, 700);

/* ---------- Confetti ---------- */
const canvas = $("confetti");
const ctx = canvas.getContext("2d");
let pieces = [];

function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}
addEventListener("resize", resize);
resize();

function boom(x = innerWidth / 2, y = innerHeight / 2, count = 120) {
    const colors = [THEMES[themeIndex].c1, THEMES[themeIndex].c2, THEMES[themeIndex].c3, "#fff"];
    for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 4 + Math.random() * 9;
        pieces.push({
            x,
            y,
            vx: Math.cos(a) * s,
            vy: Math.sin(a) * s - 4,
            size: 5 + Math.random() * 7,
            rot: Math.random() * 6,
            vr: (Math.random() - 0.5) * 0.4,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 100 + Math.random() * 60
        });
    }
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces = pieces.filter((p) => p.life > 0);
    for (const p of pieces) {
        p.vy += 0.25;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life--;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.min(1, p.life / 40);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
    }
    requestAnimationFrame(loop);
}
loop();

/* ---------- Sự kiện ---------- */
$("giftBtn").addEventListener("click", (e) => {
    $("giftBtn").hidden = true;
    $("reveal").hidden = false;
    typeMessage(CONFIG.message);
    const r = e.currentTarget.getBoundingClientRect();
    boom(r.left + r.width / 2, r.top + r.height / 2, 160);
});

$("moreBtn").addEventListener("click", () => {
    const w = CONFIG.wishes[Math.floor(Math.random() * CONFIG.wishes.length)];
    addChip(w);
    const chips = $("chips");
    if (chips.children.length > 9) chips.removeChild(chips.firstChild);
    boom(innerWidth / 2, innerHeight / 2, 40);
});

$("boomBtn").addEventListener("click", () => {
    boom(innerWidth * 0.25, innerHeight * 0.5, 100);
    boom(innerWidth * 0.75, innerHeight * 0.5, 100);
    boom(innerWidth * 0.5, innerHeight * 0.3, 100);
});

$("themeBtn").addEventListener("click", () => {
    themeIndex = (themeIndex + 1) % THEMES.length;
    applyTheme(themeIndex);
});

$("shareBtn").addEventListener("click", async(e) => {
    const p = new URLSearchParams({
        to: CONFIG.recipient,
        from: CONFIG.sender,
        date: CONFIG.date,
        title: CONFIG.title,
        msg: CONFIG.message,
        theme: themeIndex
    });
    const url = location.origin + location.pathname + "?" + p.toString();
    const btn = e.currentTarget;

});

// Bấm vào card để thả tim
$("card").addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    for (let i = 0; i < 5; i++) setTimeout(() => spawnFloater(e.clientX + (Math.random() * 60 - 30)), i * 80);
});

/* ---------- Khởi động ---------- */
applyTheme(themeIndex);
fillContent();