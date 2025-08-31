const searchBox = document.getElementById("search-box");
const resultsBox = document.getElementById("search-results");
let cards = [];

// Load cards from RoyaleAPI
fetch("https://royaleapi.github.io/cr-api-data/json/cards.json")
  .then(res => res.json())
  .then(data => {
    cards = data;
  });

// Handle search on Enter
searchBox.addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    const query = searchBox.value.toLowerCase();
    resultsBox.innerHTML = ""; // clear old results

    const matches = cards.filter(card =>
      card.name.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
      resultsBox.innerHTML = "<p>No results found.</p>";
    } else {
      matches.forEach(card => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("search-result");
        cardDiv.innerHTML = `
          <strong>${card.name}</strong><br>
          Elixir: ${card.elixir} <br>
          Rarity: ${card.rarity} <br>
          <img src="https://royaleapi.github.io/cr-api-assets/cards/${card.key}.png" 
               alt="${card.name}" style="width:80px; margin-top:10px;">
        `;
        resultsBox.appendChild(cardDiv);
      });
    }

    resultsBox.style.display = "block"; // show results
  }
});
