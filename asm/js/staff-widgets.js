// Trang chủ: khối Snap (2 tab, băng chuyền) và khối Xếp hạng nhân viên.

const staffById = id => STAFF.find(s => s.id === id);

function staffAvatarHTML(s, cls) {
    return s && s.avatar
        ? `<img src="${s.avatar}" alt="${s.name}" class="${cls}" loading="lazy">`
        : '<span class="avatar-fallback"></span>';
}

class SnapWidget {
    constructor(root) {
        this.root = root;
        this.tab = "latest";
        this.index = 0;
        this.gap = 20;
        this.render();
        window.addEventListener("resize", () => this.move(this.index));
    }

    visible() { return window.innerWidth >= 768 ? 5 : 2; }

    list() { return this.tab === "latest" ? SNAPS_LATEST : SNAPS_POPULAR; }

    itemHTML(snap) {
        const s = staffById(snap.staffId) || {};
        return `
            <div class="media-item">
                <a class="media-snap-wrapper" href="staff.html?tab=snap">
                    <img src="${snap.image}" alt="Snap ${s.name || ""}" class="media-image" loading="lazy">
                </a>
                <div class="staff-info">
                    <a class="staff-avatar-wrapper" href="staff.html">${staffAvatarHTML(s, "staff-avatar")}</a>
                    <div class="staff-details">
                        <h3 class="staff-name"><a href="staff.html">${s.name || ""}</a></h3>
                        <p class="staff-height">${s.height ? s.height + "cm" : ""}</p>
                        <p class="staff-location">${s.location || ""}</p>
                    </div>
                </div>
            </div>`;
    }

    render() {
        this.root.innerHTML = `
            <div class="staff-media-container">
                <h2 class="staff-media-title">Snap</h2>
                <div class="staff-media-tabs">
                    <button class="tab-button active" data-tab="latest">Mới nhất</button>
                    <button class="tab-button" data-tab="popular">Phổ biến</button>
                </div>
                <div class="snap-carousel">
                    <button class="snap-arrow snap-prev" aria-label="Trước"></button>
                    <div class="snap-viewport"><div class="snap-track"></div></div>
                    <button class="snap-arrow snap-next" aria-label="Sau"></button>
                </div>
                <div class="staff-media-actions">
                    <a href="staff.html?tab=snap" class="btn-view-all">Xem thêm</a>
                </div>
            </div>`;
        this.track = this.root.querySelector(".snap-track");
        this.viewport = this.root.querySelector(".snap-viewport");
        this.root.querySelectorAll(".tab-button").forEach(b =>
            b.addEventListener("click", () => this.switchTab(b.dataset.tab)));
        this.root.querySelector(".snap-prev").addEventListener("click", () => this.move(this.index - 1));
        this.root.querySelector(".snap-next").addEventListener("click", () => this.move(this.index + 1));
        this.bindSwipe();
        this.fill();
    }

    switchTab(tab) {
        this.tab = tab;
        this.root.querySelectorAll(".tab-button").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
        this.fill();
    }

    fill() {
        this.track.innerHTML = this.list().map(s => this.itemHTML(s)).join("");
        this.move(0);
    }

    move(index) {
        const visible = this.visible();
        const columns = Math.ceil(this.list().length / 2);
        const maxIndex = Math.max(0, columns - visible);
        this.index = Math.min(Math.max(index, 0), maxIndex);
        const colWidth = (this.viewport.clientWidth - (visible - 1) * this.gap) / visible;
        this.track.style.gridAutoColumns = colWidth + "px";
        this.track.style.transform = `translateX(${-this.index * (colWidth + this.gap)}px)`;
        this.root.querySelector(".snap-prev").classList.toggle("hidden", this.index === 0);
        this.root.querySelector(".snap-next").classList.toggle("hidden", this.index === maxIndex);
    }

    bindSwipe() {
        let startX = null;
        this.viewport.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
        this.viewport.addEventListener("touchend", e => {
            if (startX === null) return;
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 40) this.move(this.index + (dx < 0 ? 1 : -1));
            startX = null;
        });
    }
}

class StaffRanking {
    constructor(root) {
        this.root = root;
        this.index = 0;
        this.interval = 3000;
        this.render();
        window.addEventListener("resize", () => this.layout());
    }

    visible() {
        const w = window.innerWidth;
        return w >= 1200 ? 8 : w >= 992 ? 6 : w >= 768 ? 5 : 3;
    }

    itemHTML(s, rank) {
        return `
            <div class="staff-item">
                <a class="staff-avatar" href="staff.html">
                    ${staffAvatarHTML(s, "")}
                    <span class="staff-rank" data-rank="${rank}">${rank}</span>
                </a>
                <div class="staff-info">
                    <h3 class="staff-name"><a href="staff.html">${s.name}</a></h3>
                    <p class="staff-height">${s.height}cm</p>
                    <p class="staff-location">${s.location}</p>
                </div>
            </div>`;
    }

    render() {
        this.items = STAFF_RANKING.map(staffById).filter(Boolean);
        this.root.innerHTML = `
            <div class="staff-ranking-container">
                <h2 class="staff-ranking-title">Xếp hạng nhân viên</h2>
                <div class="ranking-viewport">
                    <div class="ranking-track">${this.items.map((s, i) => this.itemHTML(s, i + 1)).join("")}</div>
                </div>
                <ul class="ranking-dots"></ul>
                <div class="staff-actions">
                    <a href="staff.html" class="btn-view-all">Xem danh sách nhân viên</a>
                </div>
            </div>`;
        this.track = this.root.querySelector(".ranking-track");
        this.viewport = this.root.querySelector(".ranking-viewport");
        this.dots = this.root.querySelector(".ranking-dots");
        this.root.addEventListener("mouseenter", () => this.stop());
        this.root.addEventListener("mouseleave", () => this.start());
        this.bindSwipe();
        this.layout();
        this.start();
    }

    pages() { return Math.max(1, this.items.length - this.visible() + 1); }

    layout() {
        const itemWidth = this.viewport.clientWidth / this.visible();
        this.track.querySelectorAll(".staff-item").forEach(el => { el.style.width = itemWidth + "px"; });
        const pages = this.pages();
        this.dots.innerHTML = Array.from({ length: pages }, (_, i) => `<li data-i="${i}"></li>`).join("");
        this.dots.style.display = pages > 1 ? "" : "none";
        this.dots.querySelectorAll("li").forEach(li =>
            li.addEventListener("click", () => { this.goTo(+li.dataset.i); this.start(); }));
        this.goTo(this.index);
    }

    goTo(i) {
        const pages = this.pages();
        this.index = ((i % pages) + pages) % pages;
        const itemWidth = this.viewport.clientWidth / this.visible();
        this.track.style.transform = `translateX(${-this.index * itemWidth}px)`;
        this.dots.querySelectorAll("li").forEach((li, n) => li.classList.toggle("active", n === this.index));
    }

    start() {
        this.stop();
        this.timer = setInterval(() => this.goTo(this.index + 1), this.interval);
    }

    stop() { clearInterval(this.timer); }

    bindSwipe() {
        let startX = null;
        this.viewport.addEventListener("touchstart", e => { startX = e.touches[0].clientX; this.stop(); }, { passive: true });
        this.viewport.addEventListener("touchend", e => {
            if (startX !== null) {
                const dx = e.changedTouches[0].clientX - startX;
                if (Math.abs(dx) > 40) this.goTo(this.index + (dx < 0 ? 1 : -1));
                startX = null;
            }
            this.start();
        });
    }
}

const snapRoot = document.getElementById("snap-widget");
const rankingRoot = document.getElementById("staff-ranking");
const snapWidget = snapRoot ? new SnapWidget(snapRoot) : null;
const staffRanking = rankingRoot ? new StaffRanking(rankingRoot) : null;
