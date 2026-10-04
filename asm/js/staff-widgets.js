// Trang chủ: khối Snap (2 tab, băng chuyền) và khối Xếp hạng nhân viên.

// Tìm nhân viên theo id (không thấy thì undefined).
const staffById = id => STAFF.find(s => s.id === id);

// HTML ảnh đại diện nhân viên (cls là class CSS). Không có nhân viên hoặc chưa có ảnh thì dùng hình tròn trống thay thế.
function staffAvatarHTML(s, cls) {
    if (s && s.avatar) return `<img src="${s.avatar}" alt="${s.name}" class="${cls}" loading="lazy">`;
    return '<span class="avatar-fallback"></span>';
}

// Khối Snap ở trang chủ: băng chuyền ảnh 2 hàng, 2 tab "Mới nhất" / "Phổ biến", trượt bằng nút hoặc vuốt.
class SnapWidget {
    // tab: tab đang chọn; index: cột đầu tiên đang hiện; gap: khoảng cách giữa các cột (px).
    // Đổi kích thước cửa sổ thì tính lại vị trí.
    constructor(root) {
        this.root = root;
        this.tab = "latest";
        this.index = 0;
        this.gap = 20;
        this.render();
        window.addEventListener("resize", () => this.move(this.index));
    }

    // Số cột hiện cùng lúc: màn hình rộng (>= 768px) hiện 5 cột, điện thoại hiện 2 cột.
    visible() {
        if (window.innerWidth >= 768) return 5;
        return 2;
    }

    // Danh sách snap của tab đang chọn.
    list() {
        if (this.tab === "latest") return SNAPS_LATEST;
        return SNAPS_POPULAR;
    }

    // HTML một thẻ snap: ảnh (bấm sang trang snap), avatar và thông tin nhân viên. Không tìm thấy nhân viên thì dùng {} để khỏi lỗi.
    itemHTML(snap) {
        const s = staffById(snap.staffId) || {};
        let heightText = "";
        if (s.height) heightText = s.height + "cm";
        return `
            <div class="media-item">
                <a class="media-snap-wrapper" href="staff.html?tab=snap">
                    <img src="${snap.image}" alt="Snap ${s.name || ""}" class="media-image" loading="lazy">
                </a>
                <div class="staff-info">
                    <a class="staff-avatar-wrapper" href="staff.html">${staffAvatarHTML(s, "staff-avatar")}</a>
                    <div class="staff-details">
                        <h3 class="staff-name"><a href="staff.html">${s.name || ""}</a></h3>
                        <p class="staff-height">${heightText}</p>
                        <p class="staff-location">${s.location || ""}</p>
                    </div>
                </div>
            </div>`;
    }

    // Dựng khung khối Snap, lưu các phần tử cần dùng lại, gắn sự kiện (đổi tab, nút trước / sau, vuốt) rồi đổ snap vào.
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

    // Đổi tab: tô sáng nút tab đang chọn rồi đổ lại danh sách snap.
    switchTab(tab) {
        this.tab = tab;
        this.root.querySelectorAll(".tab-button").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
        this.fill();
    }

    // Đổ các thẻ snap của tab hiện tại vào băng chuyền và đưa về cột đầu.
    fill() {
        this.track.innerHTML = this.list().map(s => this.itemHTML(s)).join("");
        this.move(0);
    }

    // Trượt tới cột thứ index. Băng chuyền có 2 hàng nên số cột = số snap / 2 (làm tròn lên); cột đầu lớn nhất có thể = số cột - số cột hiện.
    // index được kẹp trong khoảng [0, maxIndex]. Mỗi cột rộng = (chiều rộng khung - các khoảng cách) / số cột hiện;
    // dịch cả dải sang trái index cột bằng transform. Nút "trước" ẩn khi ở đầu, nút "sau" ẩn khi ở cuối.
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

    // Vuốt trên điện thoại: nhớ vị trí ngón tay lúc chạm, lúc nhả tính quãng đã vuốt (dx).
    // Vuốt quá 40px mới tính: vuốt sang trái (dx < 0) thì tới cột sau, sang phải thì về cột trước.
    bindSwipe() {
        let startX = null;
        this.viewport.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
        this.viewport.addEventListener("touchend", e => {
            if (startX === null) return;
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 40) {
                if (dx < 0) this.move(this.index + 1);
                else this.move(this.index - 1);
            }
            startX = null;
        });
    }
}

// Khối Xếp hạng nhân viên ở trang chủ: dải nhân viên tự trượt mỗi 3 giây, có chấm tròn và vuốt.
class StaffRanking {
    // index: vị trí đang hiện; interval: thời gian giữa 2 lần tự trượt (ms). Đổi kích thước cửa sổ thì dàn lại.
    constructor(root) {
        this.root = root;
        this.index = 0;
        this.interval = 3000;
        this.render();
        window.addEventListener("resize", () => this.layout());
    }

    // Số nhân viên hiện cùng lúc theo độ rộng màn hình: >= 1200px hiện 8, >= 992px hiện 6, >= 768px hiện 5, nhỏ hơn hiện 3.
    visible() {
        const w = window.innerWidth;
        if (w >= 1200) return 8;
        if (w >= 992) return 6;
        if (w >= 768) return 5;
        return 3;
    }

    // HTML một nhân viên trong bảng xếp hạng, kèm số thứ hạng (rank) trên ảnh.
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

    // Đổi danh sách id xếp hạng thành nhân viên (bỏ id không tồn tại), dựng khung, gắn sự kiện
    // (rê chuột vào thì dừng tự trượt, rê ra thì chạy tiếp, vuốt), dàn bố cục rồi bắt đầu tự trượt.
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

    // Số "trang" (vị trí có thể trượt tới) = số nhân viên - số đang hiện + 1, tối thiểu là 1.
    pages() { return Math.max(1, this.items.length - this.visible() + 1); }

    // Dàn bố cục: chia đều chiều rộng khung cho các nhân viên, tạo lại các chấm tròn theo số trang
    // (chỉ 1 trang thì ẩn chấm) và đưa về vị trí hiện tại.
    layout() {
        const itemWidth = this.viewport.clientWidth / this.visible();
        this.track.querySelectorAll(".staff-item").forEach(el => { el.style.width = itemWidth + "px"; });
        const pages = this.pages();
        this.dots.innerHTML = Array.from({ length: pages }, (_, i) => `<li data-i="${i}"></li>`).join("");
        if (pages > 1) this.dots.style.display = "";
        else this.dots.style.display = "none";
        this.dots.querySelectorAll("li").forEach(li =>
            li.addEventListener("click", () => { this.goTo(+li.dataset.i); this.start(); }));
        this.goTo(this.index);
    }

    // Trượt tới vị trí i, chạy vòng tròn: công thức ((i % pages) + pages) % pages cho ra số trong [0, pages)
    // kể cả khi i âm (vuốt lùi từ vị trí đầu thì nhảy về vị trí cuối). Dịch dải sang trái và tô sáng chấm tương ứng.
    goTo(i) {
        const pages = this.pages();
        this.index = ((i % pages) + pages) % pages;
        const itemWidth = this.viewport.clientWidth / this.visible();
        this.track.style.transform = `translateX(${-this.index * itemWidth}px)`;
        this.dots.querySelectorAll("li").forEach((li, n) => li.classList.toggle("active", n === this.index));
    }

    // Bật tự trượt: huỷ bộ đếm cũ trước (tránh chạy chồng), rồi cứ mỗi interval thì sang vị trí kế.
    start() {
        this.stop();
        this.timer = setInterval(() => this.goTo(this.index + 1), this.interval);
    }

    // Dừng tự trượt.
    stop() { clearInterval(this.timer); }

    // Vuốt trên điện thoại: chạm thì dừng tự trượt, nhả tay thì tính quãng vuốt (quá 40px mới tính: trái = tới, phải = lùi)
    // rồi bật tự trượt trở lại.
    bindSwipe() {
        let startX = null;
        this.viewport.addEventListener("touchstart", e => { startX = e.touches[0].clientX; this.stop(); }, { passive: true });
        this.viewport.addEventListener("touchend", e => {
            if (startX !== null) {
                const dx = e.changedTouches[0].clientX - startX;
                if (Math.abs(dx) > 40) {
                    if (dx < 0) this.goTo(this.index + 1);
                    else this.goTo(this.index - 1);
                }
                startX = null;
            }
            this.start();
        });
    }
}

// Mỗi khối chỉ được tạo khi trang có phần tử chứa nó (trang chủ); các trang khác sẽ bỏ qua.
const snapRoot = document.getElementById("snap-widget");
const rankingRoot = document.getElementById("staff-ranking");
let snapWidget = null;
if (snapRoot) snapWidget = new SnapWidget(snapRoot);

let staffRanking = null;
if (rankingRoot) staffRanking = new StaffRanking(rankingRoot);
