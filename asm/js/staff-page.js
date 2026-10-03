// Trang nhân viên (staff.html): 2 tab Snap / Staff, sắp xếp và lọc theo chiều cao.

class StaffPage {
    constructor(root) {
        this.root = root;
        this.tab = new URLSearchParams(location.search).get("tab") === "snap" ? "snap" : "staff";
        this.sort = "time";
        this.minH = 100;
        this.maxH = 200;
        this.filterOpen = false;
        this.render();
    }

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

    switchTab(tab) {
        this.tab = tab;
        this.sort = "time";
        this.root.querySelectorAll(".staffstart-tab").forEach(li => li.classList.toggle("active", li.dataset.tab === tab));
        try { history.replaceState(null, "", tab === "snap" ? "?tab=snap" : location.pathname); } catch (e) {}
        document.title = (tab === "snap" ? "Snap" : "Nhân viên") + " | Luna";

        Utils.$("staff-sorter").innerHTML = tab === "snap"
            ? '<option value="time">Sắp xếp theo snap mới nhất</option><option value="pv">Sắp xếp theo snap phổ biến</option>'
            : '<option value="time">Sắp xếp theo nhân viên mới nhất</option><option value="pv">Sắp xếp theo lượt xem nhiều nhất</option>';
        Utils.$("staff-filter-toggle").style.display = tab === "staff" ? "" : "none";
        if (tab !== "staff") this.toggleFilter(false);
        this.renderGrid();
    }

    toggleFilter(force) {
        this.filterOpen = typeof force === "boolean" ? force : !this.filterOpen;
        Utils.$("staff-filter-panel").classList.toggle("open", this.filterOpen);
        Utils.$("staff-filter-toggle").innerHTML = `Lọc <i class="fa-solid fa-${this.filterOpen ? "minus" : "plus"}"></i>`;
    }

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

    updateRangeUI() {
        Utils.setText("height-min-label", this.minH + "cm");
        Utils.setText("height-max-label", this.maxH + "cm");
        const fill = Utils.$("height-range-fill");
        fill.style.left = (this.minH - 100) + "%";
        fill.style.right = (200 - this.maxH) + "%";
    }

    clearFilter() {
        Utils.$("height-min").value = 100;
        Utils.$("height-max").value = 200;
        this.minH = 100;
        this.maxH = 200;
        this.updateRangeUI();
        this.renderGrid();
    }

    staffList() {
        const list = STAFF.filter(s => s.height === null || (s.height >= this.minH && s.height <= this.maxH));
        return this.sort === "pv" ? [...list].sort((a, b) => a.viewOrder - b.viewOrder) : list;
    }

    snapList() {
        const source = this.sort === "pv" ? [...SNAPS_POPULAR, ...SNAPS_LATEST] : [...SNAPS_LATEST, ...SNAPS_POPULAR];
        const seen = new Set();
        return source.filter(s => !seen.has(s.id) && seen.add(s.id));
    }

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

    snapItemHTML(snap) {
        const s = staffById(snap.staffId) || {};
        return `
            <div class="media-item">
                <div class="media-snap-wrapper"><img src="${snap.image}" alt="Snap ${s.name || ""}" class="media-image" loading="lazy"></div>
                <div class="staff-info">
                    <span class="staff-avatar-wrapper">${staffAvatarHTML(s, "staff-avatar")}</span>
                    <div class="staff-details">
                        <h3 class="staff-name">${s.name || ""}</h3>
                        <p class="staff-height">${s.height ? s.height + "cm" : ""}</p>
                        <p class="staff-location">${s.location || ""}</p>
                    </div>
                </div>
            </div>`;
    }

    renderGrid() {
        const grid = Utils.$("staff-grid");
        if (this.tab === "snap") {
            grid.className = "content-grid snap-grid";
            grid.innerHTML = this.snapList().map(s => this.snapItemHTML(s)).join("");
            return;
        }
        const list = this.staffList();
        grid.className = "content-grid staff-grid" + (list.length ? "" : " is-empty");
        grid.innerHTML = list.length
            ? list.map(s => this.staffItemHTML(s)).join("")
            : '<div class="empty-state">Không có nhân viên nào phù hợp.</div>';
    }
}

const staffPageRoot = document.getElementById("staff-page");
const staffPage = staffPageRoot ? new StaffPage(staffPageRoot) : null;
