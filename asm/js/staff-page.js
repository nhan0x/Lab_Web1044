// Trang nhân viên (staff.html): 2 tab Snap / Staff, sắp xếp và lọc theo chiều cao.

class StaffPage {
    // tab: "snap" hoặc "staff" (đọc từ ?tab=... trên URL, mặc định "staff"). sort: cách sắp xếp ("time" mới nhất / "pv" lượt xem).
    // minH / maxH: khoảng chiều cao đang lọc. filterOpen: bảng lọc đang mở không.
    constructor(root) {
        this.root = root;
        this.tab = "staff";
        if (new URLSearchParams(location.search).get("tab") === "snap") this.tab = "snap";
        this.sort = "time";
        this.minH = 100;
        this.maxH = 200;
        this.filterOpen = false;
        this.render();
    }

    // Dựng khung trang (2 tab, ô sắp xếp, nút và bảng lọc, lưới trống) rồi gắn sự kiện cho từng phần tử vừa tạo.
    // Gắn sự kiện sau khi gán innerHTML vì lúc đó các phần tử mới tồn tại. Cuối cùng chuyển tới tab hiện tại để đổ dữ liệu vào lưới.
    render() {
        this.root.innerHTML = `
            <div class="staffstart-navigation-tabs">
                <ul class="staffstart-tabs">
                    <li class="staffstart-tab" data-tab="snap"><a href="javascript:void(0)" class="staffstart-tab-link">Snap</a></li>
                    <li class="staffstart-tab" data-tab="staff"><a href="javascript:void(0)" class="staffstart-tab-link">Staff</a></li>
                </ul>
            </div>
            <div class="staff-list-page">
                <div class="staff-actions-bar">
                    <select class="staff-sorter" id="staff-sorter"></select>
                    <button type="button" class="filter-toggle" id="staff-filter-toggle">Lọc <i class="fa-solid fa-plus"></i></button>
                </div>
                <div class="staff-filter-panel" id="staff-filter-panel">
                    <div class="filter-options-title">Lọc theo chiều cao</div>
                    <div class="height-range">
                        <div class="height-range-track"><span id="height-range-fill"></span></div>
                        <input type="range" id="height-min" min="100" max="200" value="100">
                        <input type="range" id="height-max" min="100" max="200" value="200">
                    </div>
                    <div class="height-range-values"><span id="height-min-label">100cm</span><span id="height-max-label">200cm</span></div>
                    <a href="javascript:void(0)" class="filter-clear" id="staff-filter-clear">Xóa bộ lọc</a>
                </div>
                <div class="content-grid" id="staff-grid"></div>
            </div>`;

        this.root.querySelectorAll(".staffstart-tab").forEach(li =>
            li.addEventListener("click", () => this.switchTab(li.dataset.tab)));
        Utils.$("staff-sorter").addEventListener("change", e => { this.sort = e.target.value; this.renderGrid(); });
        Utils.$("staff-filter-toggle").addEventListener("click", () => this.toggleFilter());
        ["height-min", "height-max"].forEach(id => Utils.$(id).addEventListener("input", () => this.onRange(id)));
        Utils.$("staff-filter-clear").addEventListener("click", () => this.clearFilter());
        this.switchTab(this.tab);
    }

    // Đổi tab Snap / Staff: đặt lại cách sắp xếp, tô sáng tab đang chọn, cập nhật địa chỉ URL và tiêu đề tab trình duyệt,
    // đổi các lựa chọn của ô sắp xếp cho đúng tab. Nút "Lọc" chỉ hiện ở tab Staff (tab Snap thì ẩn và đóng bảng lọc).
    switchTab(tab) {
        this.tab = tab;
        this.sort = "time";
        this.root.querySelectorAll(".staffstart-tab").forEach(li => li.classList.toggle("active", li.dataset.tab === tab));

        let url = location.pathname;
        let title = "Nhân viên";
        let sorterOptions = '<option value="time">Sắp xếp theo nhân viên mới nhất</option><option value="pv">Sắp xếp theo lượt xem nhiều nhất</option>';
        if (tab === "snap") {
            url = "?tab=snap";
            title = "Snap";
            sorterOptions = '<option value="time">Sắp xếp theo snap mới nhất</option><option value="pv">Sắp xếp theo snap phổ biến</option>';
        }
        try { history.replaceState(null, "", url); } catch (e) {}
        document.title = title + " | Luna";

        Utils.$("staff-sorter").innerHTML = sorterOptions;
        if (tab === "staff") Utils.$("staff-filter-toggle").style.display = "";
        else Utils.$("staff-filter-toggle").style.display = "none";
        if (tab !== "staff") this.toggleFilter(false);
        this.renderGrid();
    }

    // Mở / đóng bảng lọc. force = true / false thì ép theo giá trị đó, không truyền thì đảo trạng thái hiện tại. Đổi dấu + / − trên nút.
    toggleFilter(force) {
        if (typeof force === "boolean") this.filterOpen = force;
        else this.filterOpen = !this.filterOpen;

        let icon = "plus";
        if (this.filterOpen) icon = "minus";
        Utils.$("staff-filter-panel").classList.toggle("open", this.filterOpen);
        Utils.$("staff-filter-toggle").innerHTML = `Lọc <i class="fa-solid fa-${icon}"></i>`;
    }

    // Kéo thanh trượt chiều cao (có 2 thanh: min và max). Nếu min vượt max thì kéo thanh còn lại theo cho hai đầu luôn hợp lệ.
    // Lưu khoảng mới, cập nhật nhãn / vùng tô rồi vẽ lại lưới.
    onRange(changedId) {
        let min = +Utils.$("height-min").value, max = +Utils.$("height-max").value;
        if (min > max) {
            if (changedId === "height-min") min = max; else max = min;
            Utils.$("height-min").value = min;
            Utils.$("height-max").value = max;
        }
        this.minH = min;
        this.maxH = max;
        this.updateRangeUI();
        this.renderGrid();
    }

    // Cập nhật chữ "xxxcm" ở hai đầu và vùng màu giữa hai thanh trượt (tính theo % trên thang 100-200cm).
    updateRangeUI() {
        Utils.setText("height-min-label", this.minH + "cm");
        Utils.setText("height-max-label", this.maxH + "cm");
        const fill = Utils.$("height-range-fill");
        fill.style.left = (this.minH - 100) + "%";
        fill.style.right = (200 - this.maxH) + "%";
    }

    // Bấm "Xóa bộ lọc": đưa hai thanh về 100-200cm và vẽ lại.
    clearFilter() {
        Utils.$("height-min").value = 100;
        Utils.$("height-max").value = 200;
        this.minH = 100;
        this.maxH = 200;
        this.updateRangeUI();
        this.renderGrid();
    }

    // Danh sách nhân viên sau khi lọc: giữ người chưa có chiều cao hoặc chiều cao nằm trong khoảng đang lọc;
    // nếu sắp xếp theo lượt xem thì sắp theo viewOrder (sao chép mảng bằng [...list] để không làm đổi mảng gốc).
    staffList() {
        const list = STAFF.filter(s => s.height === null || (s.height >= this.minH && s.height <= this.maxH));
        if (this.sort === "pv") return [...list].sort((a, b) => a.viewOrder - b.viewOrder);
        return list;
    }

    // Danh sách snap: ghép "mới nhất" và "phổ biến" (cái nào ưu tiên thì đứng trước theo cách sắp xếp),
    // dùng Set ghi nhớ id đã gặp để bỏ các snap trùng nhau.
    snapList() {
        let source = [...SNAPS_LATEST, ...SNAPS_POPULAR];
        if (this.sort === "pv") source = [...SNAPS_POPULAR, ...SNAPS_LATEST];
        const seen = new Set();
        return source.filter(s => !seen.has(s.id) && seen.add(s.id));
    }

    // HTML một thẻ nhân viên: ảnh đại diện, tên, chiều cao, nơi làm việc.
    staffItemHTML(s) {
        return `
            <div class="grid-item staff-item">
                <div class="staff-profile-wrapper">
                    <div class="staff-profile-image-container">${staffAvatarHTML(s, "staff-profile-image")}</div>
                </div>
                <div class="staff-info">
                    <h3 class="staff-name">${s.name}</h3>
                    <p class="staff-height">${s.height || ""}<span class="unit">cm</span></p>
                    <p class="staff-location">${s.location}</p>
                </div>
            </div>`;
    }

    // HTML một thẻ snap: ảnh snap và thông tin nhân viên đăng nó (tra theo staffId; không thấy thì dùng đối tượng rỗng để khỏi lỗi).
    snapItemHTML(snap) {
        const s = staffById(snap.staffId) || {};
        let heightText = "";
        if (s.height) heightText = s.height + "cm";
        return `
            <div class="media-item">
                <div class="media-snap-wrapper"><img src="${snap.image}" alt="Snap ${s.name || ""}" class="media-image" loading="lazy"></div>
                <div class="staff-info">
                    <span class="staff-avatar-wrapper">${staffAvatarHTML(s, "staff-avatar")}</span>
                    <div class="staff-details">
                        <h3 class="staff-name">${s.name || ""}</h3>
                        <p class="staff-height">${heightText}</p>
                        <p class="staff-location">${s.location || ""}</p>
                    </div>
                </div>
            </div>`;
    }

    // Đổ dữ liệu vào lưới theo tab: tab Snap hiện các snap; tab Staff hiện nhân viên đã lọc,
    // không có ai phù hợp thì hiện thông báo (và thêm class "is-empty" để CSS căn chỉnh).
    renderGrid() {
        const grid = Utils.$("staff-grid");
        if (this.tab === "snap") {
            grid.className = "content-grid snap-grid";
            grid.innerHTML = this.snapList().map(s => this.snapItemHTML(s)).join("");
            return;
        }
        const list = this.staffList();
        if (list.length) {
            grid.className = "content-grid staff-grid";
            grid.innerHTML = list.map(s => this.staffItemHTML(s)).join("");
        } else {
            grid.className = "content-grid staff-grid is-empty";
            grid.innerHTML = '<div class="empty-state">Không có nhân viên nào phù hợp.</div>';
        }
    }
}

// Chỉ tạo trang nhân viên khi trang hiện tại có #staff-page (staff.html).
const staffPageRoot = document.getElementById("staff-page");
let staffPage = null;
if (staffPageRoot) staffPage = new StaffPage(staffPageRoot);
