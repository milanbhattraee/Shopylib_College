function generateStrongPassword(length = 10) {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()+=[]{}|<>?";
  const allChars = upper + lower + numbers + symbols;

  let password = "";

  // Ensure at least one from each category
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest with random characters from all sets
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle password so required characters are not always at the start
  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}

import NodeCache from "node-cache";
const cache = new NodeCache({ stdTTL: 50000 }); // 50000 seconds = ~14 hours


async function getCurrencyRates() {
  try {
    // Check cache first
    const cachedRates = cache.get("currencyRates");
    if (cachedRates) {
      console.log("Returning cached currency rates");
      return cachedRates;
    }

    console.log("Fetching currency rates from API");

    // If not cached, fetch from API
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/NPR"
    );
    const data = await response.json();

    // Save to cache
    cache.set("currencyRates", data.rates);

    return data.rates;
  } catch (error) {
    console.error("Error fetching currency rates:", error);
    throw new Error("Failed to fetch currency rates");
  }
}

export { generateStrongPassword, getCurrencyRates };
