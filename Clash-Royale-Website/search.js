async function setupCardSearch() {
  const cards = await fetch('https://royaleapi.github.io/cr-api-data/json/cards.json').then(res => res.json());
  const input = document.getElementById("search-box");
  const resultsDiv = document.getElementById("search-results");

  input.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    const query = this.value.trim().toLowerCase();
    resultsDiv.innerHTML = "";

    if (!query) {
      resultsDiv.style.display = "none";
      return;
    }

    const matches = cards.filter(card => card.name.toLowerCase().includes(query));

    if (matches.length === 0) {
      resultsDiv.innerHTML = `<p>No card found for "${this.value}".</p>`;
    } else {
      matches.forEach(card => {
        const div = document.createElement("div");
        div.classList.add("result-item");
        div.innerHTML = `
          <h3>${card.name}</h3>
          ${card.rarity ? `<p><strong>Rarity:</strong> ${card.rarity}</p>` : ''}
          ${card.elixir ? `<p><strong>Elixir Cost:</strong> ${card.elixir}</p>` : ''}
          ${card.description ? `<p><strong>Description:</strong> ${card.description}</p>` : ''}
        `;
        resultsDiv.appendChild(div);
      });
    }

    resultsDiv.style.display = "block";
  });
}

document.addEventListener("DOMContentLoaded", setupCardSearch);