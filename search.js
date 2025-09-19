async function setupCardSearch() {
  const input = document.getElementById("search-box");
  const resultsDiv = document.getElementById("search-results");
  if (!input || !resultsDiv) {
    console.error("Missing #search-box or #search-results in DOM");
    return;
  }

  const DATA_URLS = {
    base: 'https://royaleapi.github.io/cr-api-data/json/cards.json',
    troop: 'https://royaleapi.github.io/cr-api-data/json/cards_stats_troop.json',
    spell: 'https://royaleapi.github.io/cr-api-data/json/cards_stats_spell.json',
    building: 'https://royaleapi.github.io/cr-api-data/json/cards_stats_building.json'
  };

  // Utility: normalize keys for matching between files
  function normalizeKey(obj) {
    if (!obj) return '';
    if (obj.key) return String(obj.key).toLowerCase();
    if (obj.idName) return String(obj.idName).toLowerCase();
    if (obj.name) return String(obj.name).toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return '';
  }

  // Utility: safely get stat value at level index
  function statAtLevel(statsObj, possibleKeys, lvlIndex) {
    if (!statsObj) return null;
    for (const k of possibleKeys) {
      if (k in statsObj && statsObj[k] != null) {
        const v = statsObj[k];
        if (Array.isArray(v)) {
          // prefer requested index, else fallback to last element
          return v[lvlIndex] ?? v[v.length - 1];
        } else {
          return v; // scalar
        }
      }
    }
    return null;
  }

  // load data
  let CARDS = [];
  const STATS_MAP = new Map();
  try {
    const [cards, troops, spells, buildings] = await Promise.all([
      fetch(DATA_URLS.base).then(r => r.json()),
      fetch(DATA_URLS.troop).then(r => r.json()),
      fetch(DATA_URLS.spell).then(r => r.json()),
      fetch(DATA_URLS.building).then(r => r.json())
    ]);

    CARDS = Array.isArray(cards) ? cards : [];

    // merge stats arrays into map
    [troops, spells, buildings].forEach(arr => {
      if (!Array.isArray(arr)) return;
      arr.forEach(s => {
        const k = normalizeKey(s);
        if (k) STATS_MAP.set(k, s);
      });
    });

  } catch (err) {
    console.error("Failed to load card data:", err);
    resultsDiv.innerHTML = `<p>Error loading card data. Check console for details.</p>`;
    resultsDiv.style.display = "block";
    return;
  }

  // Enter-to-search handler
  input.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    const q = this.value.trim().toLowerCase();
    resultsDiv.innerHTML = "";

    if (!q) {
      resultsDiv.style.display = "none";
      return;
    }

    // Find matches from base card list (but only keep cards that have stats)
    const matches = CARDS.filter(card => {
      const nameMatch = card.name && card.name.toLowerCase().includes(q);
      const k = normalizeKey(card);
      const keyMatch = k && k.includes(q);
      return (nameMatch || keyMatch) && STATS_MAP.has(k); // ensure we have stats (filters out test/fake cards)
    });

    if (matches.length === 0) {
      resultsDiv.innerHTML = `<p>No card found for "<strong>${this.value}</strong>".</p>`;
      resultsDiv.style.display = "block";
      return;
    }

    // Limit results to first 10 matches to keep UI tidy
    const show = matches.slice(0, 10);

    show.forEach(card => {
      const k = normalizeKey(card);
      const stats = STATS_MAP.get(k);

      // Determine level index: spells often show level 9 in-game (index 8), troops/buildings use level 11 (index 10)
      const typeLower = (card.type || "").toString().toLowerCase();
      const levelIndex = typeLower.includes("spell") ? 8 : 10;

      // Try multiple possible key names for hp/dmg/dps until first match
      const hp = statAtLevel(stats, ['hitpoints', 'shieldHitpoints', 'spawnHealth', 'hit_points'], levelIndex);
      const dmg = statAtLevel(stats, ['damage', 'damage_per_hit', 'damagePerHit', 'area_damage', 'areaDamage'], levelIndex);
      const dps = statAtLevel(stats, ['dps', 'damagePerSecond', 'damage_per_second'], levelIndex);

      // Some spells have 'crownTowerDamage' or 'tower_damage' instead
      const towerDmg = statAtLevel(stats, ['crown_tower_damage', 'crownTowerDamage', 'tower_damage'], levelIndex);

      // Build result HTML (only show fields that exist)
      const parts = [];
      parts.push(`<h3>${card.name}</h3>`);
      if (card.rarity) parts.push(`<p><strong>Rarity:</strong> ${card.rarity}</p>`);
      if (card.elixir != null) parts.push(`<p><strong>Elixir Cost:</strong> ${card.elixir}</p>`);
      if (card.description) parts.push(`<p>${card.description}</p>`);

      // Stats block
      const statPieces = [];
      if (hp != null) statPieces.push(`<div class="stat"><strong>HP (Lvl ${levelIndex+1}):</strong> ${hp}</div>`);
      if (dmg != null) statPieces.push(`<div class="stat"><strong>Damage (Lvl ${levelIndex+1}):</strong> ${dmg}</div>`);
      if (dps != null) statPieces.push(`<div class="stat"><strong>DPS (Lvl ${levelIndex+1}):</strong> ${dps}</div>`);
      if (towerDmg != null && dmg == null) statPieces.push(`<div class="stat"><strong>Damage (Lvl ${levelIndex+1}):</strong> ${towerDmg}</div>`);

      if (statPieces.length) {
        parts.push(`<div class="stats">${statPieces.join("")}</div>`);
      } else {
        parts.push(`<p><em>No in-game HP/Damage/DPS available for this card.</em></p>`);
      }

      const wrapper = document.createElement("div");
      wrapper.className = "result-item";
      wrapper.innerHTML = parts.join("");
      resultsDiv.appendChild(wrapper);
    });

    // optional info
    resultsDiv.insertAdjacentHTML('beforeend',
      `<div class="results-note">Showing ${show.length} of ${matches.length} match(es). Data from RoyaleAPI static JSON.</div>`);
    resultsDiv.style.display = "block";
  });
}

document.addEventListener("DOMContentLoaded", setupCardSearch);
