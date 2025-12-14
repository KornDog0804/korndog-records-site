<script>
  // === CONFIG: YOUR REPO ===
  const OWNER = "KornDog0804";
  const REPO = "korndog-records-site";
  const BRANCH = "main";

  // 🔥 LOCKED IN: only products.json2 (never products.json)
  const PRODUCTS_PATH = "products.json2";
  const IMAGES_FOLDER = "images";

  // === STATUS HELPERS ===
  const statusEl = document.getElementById("status");
  const statusText = document.getElementById("status-text");
  function setStatus(message, kind = "ok") {
    statusText.textContent = message;
    statusEl.classList.remove("ok", "error");
    if (kind === "ok") statusEl.classList.add("ok");
    if (kind === "error") statusEl.classList.add("error");
  }

  // normalize for search
  function norm(str) { return (str || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }

  // === TOKEN HANDLING ===
  const TOKEN_KEY = "korndog_github_token";
  const tokenInput = document.getElementById("token-input");
  const saveTokenBtn = document.getElementById("save-token-btn");

  function getToken() { return localStorage.getItem(TOKEN_KEY) || ""; }
  function requireToken() {
    const token = getToken();
    if (!token) { setStatus("No GitHub token set. Paste it above first.", "error"); throw new Error("Missing GitHub token"); }
    return token;
  }

  (function initTokenDisplay() {
    const existing = getToken();
    if (existing) {
      tokenInput.placeholder = "Token already set (•••" + existing.slice(-6) + ")";
      setStatus("GitHub token loaded. You’re ready to go.", "ok");
    }
  })();

  saveTokenBtn.addEventListener("click", () => {
    const value = tokenInput.value.trim();
    if (!value) {
      localStorage.removeItem(TOKEN_KEY);
      setStatus("GitHub token cleared. Paste a new one before saving records.", "error");
      return;
    }
    localStorage.setItem(TOKEN_KEY, value);
    tokenInput.value = "";
    tokenInput.placeholder = "Token set (•••" + value.slice(-6) + ")";
    setStatus("GitHub token saved. You’re wired into the repo.", "ok");
    refreshCaches().then(renderInventory).catch(()=>{});
  });

  // === GITHUB HELPERS ===
  async function githubRequest(path, options = {}) {
    const token = requireToken();
    const headers = { Authorization: "token " + token, Accept: "application/vnd.github+json" };

    const res = await fetch(
      "https://api.github.com/repos/" + OWNER + "/" + REPO + "/contents/" + path,
      { ...options, headers: { ...headers, ...(options.headers || {}) } }
    );

    if (!res.ok) {
      const msg = await res.text();
      console.error("GitHub error:", res.status, msg);
      throw new Error("GitHub API error: " + res.status);
    }
    return res.json();
  }

  async function getFile(path) {
    const data = await githubRequest(path, { method: "GET" });
    const decoded = atob((data.content || "").replace(/\n/g, ""));
    return { text: decoded, sha: data.sha };
  }

  async function putFile(path, contentText, message, sha) {
    const encoded = btoa(unescape(encodeURIComponent(contentText)));
    const body = { message, content: encoded, branch: BRANCH };
    if (sha) body.sha = sha;
    return githubRequest(path, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  async function putFileBase64(path, base64Content, message, sha) {
    const body = { message, content: base64Content, branch: BRANCH };
    if (sha) body.sha = sha;
    return githubRequest(path, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  async function uploadImage(file) {
    const safeName = Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const path = IMAGES_FOLDER + "/" + safeName;

    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        const comma = result.indexOf(",");
        if (comma === -1) return reject(new Error("Bad data URL"));
        resolve(result.slice(comma + 1));
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    await putFileBase64(path, base64, "Add image " + safeName);
    return path;
  }

  // === JSON LOAD/SAVE (ONLY products.json2) ===
  async function loadJsonArray(path) {
    try {
      const { text, sha } = await getFile(path);
      let data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error(path + " must be an array");
      return { items: data, sha };
    } catch (e) {
      console.warn("loadJsonArray fallback for", path, e.message);
      return { items: [], sha: undefined };
    }
  }

  async function saveJsonArray(path, items, sha, message) {
    const text = JSON.stringify(items, null, 2);
    await putFile(path, text, message, sha);
  }

  async function loadProductsJson2() {
    const { items, sha } = await loadJsonArray(PRODUCTS_PATH);
    return { products: items, sha };
  }
  async function saveProductsJson2(products, sha, message) {
    await saveJsonArray(PRODUCTS_PATH, products, sha, message);
  }

  // === CACHE ===
  let cacheProducts = null;
  async function refreshCaches() {
    const { products } = await loadProductsJson2();
    cacheProducts = products;
    return { products };
  }
  async function getAllRecords() {
    if (!cacheProducts) return refreshCaches();
    return { products: cacheProducts };
  }

  // === EDIT MODE STATE ===
  let editMode = { active: false, id: "" };

  const editModeHint = document.getElementById("edit-mode-hint");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  const saveRecordBtn = document.getElementById("save-record-btn");

  function enterEditMode(record) {
    editMode = { active: true, id: record.id };
    editModeHint.style.display = "block";
    cancelEditBtn.style.display = "inline-flex";
    saveRecordBtn.textContent = "Save Update";

    artistIdInput.value = record.id || "";
    artistIdInput.disabled = true;

    artistInput.value = record.artist || "";
    titleInput.value = record.title || "";
    priceInput.value = (record.price != null ? record.price : "");
    gradeInput.value = record.grade || "";
    descInput.value = record.description || "";
    qtyInput.value = record.quantity || 1;
    availableInput.checked = (record.available !== false);

    // Tier mapping: keep whatever tier exists, default to premium
    tierSelect.value = record.tier || "premium";

    coverFrontInput.value = "";
    coverBackInput.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });

    setStatus("Editing: " + (record.artist ? record.artist + " — " : "") + (record.title || record.id), "ok");
  }

  function exitEditMode() {
    editMode = { active: false, id: "" };
    editModeHint.style.display = "none";
    cancelEditBtn.style.display = "none";
    saveRecordBtn.textContent = "Save to Site";
    addForm.reset();
    qtyInput.value = "1";
    availableInput.checked = true;
    tierSelect.value = "premium";
    artistIdInput.disabled = false;
  }

  cancelEditBtn.addEventListener("click", exitEditMode);

  // === FORCE TIER OPTIONS to include threefor25 ===
  (function patchTierDropdown() {
    const wanted = [
      { v: "premium", t: "Premium" },
      { v: "tenbin", t: "$10 Bin" },
      { v: "threefor25", t: "3 for $25" },
      { v: "budget", t: "Budget" },
      { v: "sealed", t: "Sealed" },
    ];

    const existing = Array.from(document.querySelectorAll("#tier option")).map(o => o.value);
    if (existing.includes("threefor25")) return;

    const sel = document.getElementById("tier");
    sel.innerHTML = "";
    wanted.forEach(o => {
      const opt = document.createElement("option");
      opt.value = o.v;
      opt.textContent = o.t;
      sel.appendChild(opt);
    });

    // also patch filter dropdown in section 4
    const f = document.getElementById("inv-filter");
    if (f) {
      const has = Array.from(f.options).map(o=>o.value);
      if (!has.includes("threefor25")) {
        const opt = document.createElement("option");
        opt.value = "threefor25";
        opt.textContent = "3 for $25";
        f.appendChild(opt);
      }
    }
  })();

  // === ADD / EDIT FORM LOGIC ===
  const addForm = document.getElementById("add-form");
  const artistInput = document.getElementById("artist");
  const tierSelect = document.getElementById("tier");
  const artistIdInput = document.getElementById("artist-id");
  const titleInput = document.getElementById("title");
  const priceInput = document.getElementById("price");
  const gradeInput = document.getElementById("grade");
  const descInput = document.getElementById("description");
  const qtyInput = document.getElementById("quantity");
  const coverFrontInput = document.getElementById("cover-front");
  const coverBackInput = document.getElementById("cover-back");
  const availableInput = document.getElementById("available");

  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try { requireToken(); } catch { return; }

    const artist = artistInput.value.trim();
    const tier = (tierSelect.value || "premium").trim();
    const id = artistIdInput.value.trim();
    const title = titleInput.value.trim();
    const price = parseFloat(priceInput.value);
    const grade = gradeInput.value.trim();
    const description = descInput.value.trim();
    const quantity = parseInt(qtyInput.value || "1", 10) || 1;
    const available = availableInput.checked;

    const frontFile = coverFrontInput.files[0];
    const backFile = coverBackInput.files[0];

    if (!artist || !id || !title || !grade || isNaN(price)) {
      setStatus("Missing required fields. Artist, ID, Title, Price, Grade are required.", "error");
      return;
    }
    if (!editMode.active && !frontFile) {
      setStatus("Front photo required for NEW records.", "error");
      return;
    }

    setStatus(editMode.active ? "Saving update to GitHub (products.json2)..." : "Uploading photo(s) to GitHub…");

    try {
      const { products, sha } = await loadProductsJson2();

      const idx = products.findIndex((p) => p.id === id);
      const existing = idx >= 0 ? products[idx] : {};

      // Keep existing images on edit unless replaced
      let frontPath = existing.imageFront || existing.image || (existing.images && existing.images.front) || "";
      let backPath = existing.imageBack || (existing.images && existing.images.back) || frontPath;

      if (frontFile) frontPath = await uploadImage(frontFile);
      if (backFile) backPath = await uploadImage(backFile);
      if (!backPath) backPath = frontPath;

      const newProduct = {
        id,
        artist,
        title,
        tier,
        price,
        grade,
        description,
        quantity,
        available,

        image: frontPath,
        imageFront: frontPath,
        imageBack: backPath,
        images: { front: frontPath, back: backPath }
      };

      if (idx >= 0) products[idx] = { ...products[idx], ...newProduct };
      else products.push(newProduct);

      products.sort((a, b) =>
        (a.artist || "").localeCompare(b.artist || "") ||
        (a.title || "").localeCompare(b.title || "")
      );

      await saveProductsJson2(products, sha, (editMode.active ? "Update record: " : "Add record: ") + id);

      await refreshCaches();
      renderInventory();

      setStatus("Saved to products.json2 ✅ " + artist + " — " + title + " (" + tier + ")", "ok");

      if (editMode.active) {
        const { products: p2 } = await getAllRecords();
        const rec = p2.find(r => r.id === id);
        if (rec) enterEditMode(rec);
      } else {
        addForm.reset();
        qtyInput.value = "1";
        availableInput.checked = true;
        tierSelect.value = "premium";
      }
    } catch (err) {
      console.error(err);
      setStatus("GitHub save failed. Check token permissions.", "error");
    }
  });

  // === SECTION 3: TOGGLE AVAILABLE (NO SOLD FILE) ===
  const toggleIdInput = document.getElementById("toggle-id");
  const searchResults = document.getElementById("search-results");
  const markSoldBtn = document.getElementById("mark-sold-btn");
  const markAvailableBtn = document.getElementById("mark-available-btn");
  const availabilityActionSelect = document.getElementById("availability-action");
  const availabilitySaveBtn = document.getElementById("availability-save-btn");

  // Patch labels so it doesn’t talk about sold/archive
  (function patchSection3Labels(){
    const sel = document.getElementById("availability-action");
    if (!sel) return;
    sel.innerHTML = `
      <option value="hide">Hide (available = false)</option>
      <option value="show">Show (available = true)</option>
    `;
  })();

  async function refreshSearchSuggestions() {
    const termRaw = toggleIdInput.value.trim();
    const term = norm(termRaw);
    searchResults.innerHTML = "";
    if (!term) return;

    try { requireToken(); } catch { return; }

    try {
      const { products } = await getAllRecords();
      const matches = products
        .filter((p) => {
          const id = norm(p.id);
          const title = norm(p.title);
          const artist = norm(p.artist);
          return id.includes(term) || title.includes(term) || artist.includes(term);
        })
        .slice(0, 10);

      matches.forEach((p) => {
        const pill = document.createElement("button");
        pill.type = "button";
        pill.className = "search-pill";
        const label = (p.artist ? (p.artist + " — ") : "") + (p.title || p.id || "Unknown");
        pill.textContent = label;
        pill.addEventListener("click", () => {
          toggleIdInput.value = p.id || p.title || "";
          searchResults.innerHTML = "";
        });
        searchResults.appendChild(pill);
      });
    } catch (err) {
      console.error(err);
    }
  }

  toggleIdInput.addEventListener("input", refreshSearchSuggestions);

  async function setAvailability(flag) {
    const rawInput = toggleIdInput.value.trim();
    if (!rawInput) { setStatus("Type part of the artist/title/id, then tap a pill or enter the id.", "error"); return; }
    if (!getToken()) { setStatus("GitHub token missing. Set it at the top first.", "error"); return; }

    const search = norm(rawInput);
    setStatus("Updating products.json2…", "ok");

    try {
      const { products, sha } = await loadProductsJson2();

      const idx = products.findIndex((p) =>
        norm(p.id).includes(search) || norm(p.title).includes(search) || norm(p.artist).includes(search)
      );

      if (idx === -1) { setStatus("No record found matching: " + rawInput, "error"); return; }

      products[idx].available = (flag === "show");

      await saveProductsJson2(products, sha, "Toggle availability: " + (products[idx].id || products[idx].title));

      await refreshCaches();
      renderInventory();

      toggleIdInput.value = "";
      searchResults.innerHTML = "";
      setStatus("Done. Availability updated in products.json2 ✅", "ok");
    } catch (err) {
      console.error(err);
      setStatus("Could not update availability. Check token permissions.", "error");
    }
  }

  markSoldBtn.textContent = "Quick: Hide";
  markAvailableBtn.textContent = "Quick: Show";
  markSoldBtn.addEventListener("click", () => setAvailability("hide"));
  markAvailableBtn.addEventListener("click", () => setAvailability("show"));
  availabilitySaveBtn.addEventListener("click", () => setAvailability(availabilityActionSelect.value === "hide" ? "hide" : "show"));

  // === INVENTORY VIEW + EDIT ===
  const invSearch = document.getElementById("inv-search");
  const invFilter = document.getElementById("inv-filter");
  const invRefreshBtn = document.getElementById("inv-refresh");
  const invList = document.getElementById("inv-list");

  function recordLabel(r) {
    const artist = r.artist ? r.artist + " — " : "";
    return artist + (r.title || r.id || "Unknown");
  }

  function badge(text, cls) {
    const span = document.createElement("span");
    span.className = "badge " + (cls || "");
    span.textContent = text;
    return span;
  }

  function passesFilter(r) {
    const f = invFilter.value;
    if (f === "all") return true;

    // "live/sold" filters are meaningless now; keep them simple:
    if (f === "live") return r.available !== false;
    if (f === "sold") return r.available === false;

    return (r.tier || "premium") === f;
  }

  function passesSearch(r) {
    const q = norm(invSearch.value.trim());
    if (!q) return true;
    return (
      norm(r.id).includes(q) ||
      norm(r.title).includes(q) ||
      norm(r.artist).includes(q) ||
      norm(r.tier).includes(q)
    );
  }

  async function renderInventory() {
    invList.innerHTML = "";
    try { requireToken(); } catch { return; }

    const { products } = await getAllRecords();
    const filtered = products.filter((r) => passesFilter(r) && passesSearch(r));

    if (!filtered.length) {
      const empty = document.createElement("div");
      empty.className = "hint";
      empty.style.marginTop = "10px";
      empty.textContent = "No matches. Try another search or filter.";
      invList.appendChild(empty);
      return;
    }

    filtered.slice(0, 200).forEach((r) => {
      const card = document.createElement("div");
      card.className = "inv-card";

      const meta = document.createElement("div");
      meta.className = "inv-meta";

      const title = document.createElement("p");
      title.className = "inv-title";
      title.textContent = recordLabel(r);

      const sub = document.createElement("p");
      sub.className = "inv-sub";
      const tier = (r.tier || "premium");
      sub.textContent =
        "ID: " + (r.id || "") +
        " · $" + (r.price ?? "") +
        " · " + (r.grade || "") +
        " · Qty: " + (r.quantity ?? 1);

      const badges = document.createElement("div");
      badges.className = "inv-badges";
      badges.appendChild(badge(r.available === false ? "HIDDEN" : "LIVE", r.available === false ? "sold" : "live"));
      badges.appendChild(badge("Tier: " + tier));
      if (tier === "tenbin") badges.appendChild(badge("$10 BIN", "live"));
      if (tier === "threefor25") badges.appendChild(badge("3 FOR $25", "live"));

      meta.appendChild(title);
      meta.appendChild(sub);
      meta.appendChild(badges);

      const actions = document.createElement("div");
      actions.style.display = "flex";
      actions.style.gap = "8px";
      actions.style.flexWrap = "wrap";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn btn-primary";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => enterEditMode(r));

      actions.appendChild(editBtn);

      card.appendChild(meta);
      card.appendChild(actions);
      invList.appendChild(card);
    });
  }

  invRefreshBtn.addEventListener("click", async () => {
    try { requireToken(); } catch { return; }
    setStatus("Refreshing products.json2…", "ok");
    await refreshCaches();
    await renderInventory();
    setStatus("Inventory refreshed.", "ok");
  });

  invSearch.addEventListener("input", () => renderInventory().catch(()=>{}));
  invFilter.addEventListener("change", () => renderInventory().catch(()=>{}));

  // initial inventory load if token exists
  (async function boot() {
    if (!getToken()) return;
    try {
      await refreshCaches();
      await renderInventory();
    } catch (e) {
      console.warn(e);
    }
  })();
</script>
