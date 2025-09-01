document.getElementById("search-box").addEventListener("keydown", async function(e) {
  if (e.key === "Enter") {
    const query = this.value.trim();
    const resultsDiv = document.getElementById("search-results");
    resultsDiv.innerHTML = ""; // clear old results

    if (!query) {
      resultsDiv.style.display = "none";
      return;
    }

    try {
      // Example: search cards by name
      const response = await fetch(`https://api.royaleapi.com/cards`);
      const cards = await response.json();

      // find matches (case insensitive)
      const matches = cards.filter(card =>
        card.name.toLowerCase().includes(query.toLowerCase())
      );

      if (matches.length === 0) {
        resultsDiv.innerHTML = `<p>No results found for "${query}".</p>`;
      } else {
        matches.forEach(card => {
          const div = document.createElement("div");
          div.classList.add("result-item");
          div.innerHTML = `
            <h3>${card.name}</h3>
            <p><strong>Rarity:</strong> ${card.rarity}</p>
            <p><strong>Elixir Cost:</strong> ${card.elixir}</p>
            <p><strong>Description:</strong> ${card.description}</p>
          `;
          resultsDiv.appendChild(div);
        });
      }

      resultsDiv.style.display = "block"; // 👈 show results box
    } catch (err) {
      console.error(err);
      resultsDiv.innerHTML = "<p>Error fetching data.</p>";
      resultsDiv.style.display = "block";
    }
  }
});