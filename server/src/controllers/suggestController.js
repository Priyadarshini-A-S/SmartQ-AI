import { asyncHandler } from "../utils/asyncHandler.js";

// Simulated weather conditions per city
const weatherProfiles = {
  Bengaluru: [
    { condition: "Sunny", tempC: 28, rainChance: 5 },
    { condition: "Partly Cloudy", tempC: 25, rainChance: 20 },
    { condition: "Light Rain", tempC: 22, rainChance: 75 }
  ],
  Chennai: [
    { condition: "Hot & Humid", tempC: 36, rainChance: 10 },
    { condition: "Sunny", tempC: 33, rainChance: 5 },
    { condition: "Heavy Rain", tempC: 27, rainChance: 90 }
  ],
  Hyderabad: [
    { condition: "Sunny", tempC: 32, rainChance: 8 },
    { condition: "Partly Cloudy", tempC: 29, rainChance: 25 },
    { condition: "Thunderstorm", tempC: 24, rainChance: 85 }
  ]
};

// Simulated crowd patterns per slot (0 = least busy)
const slotCrowdScore = {
  "10:00 AM - 10:30 AM": 8,
  "11:00 AM - 11:30 AM": 9,
  "12:00 PM - 12:30 PM": 6,
  "02:00 PM - 02:30 PM": 4,
  "03:00 PM - 03:30 PM": 3
};

const slots = Object.keys(slotCrowdScore);

function getSimulatedWeather(city) {
  const profiles = weatherProfiles[city] || weatherProfiles["Bengaluru"];
  return profiles[Math.floor(Math.random() * profiles.length)];
}

function scoreSlot(slot, weather) {
  let score = 10 - slotCrowdScore[slot]; // higher = better (less crowd)

  // Penalise morning slots on rainy days (people rush early to avoid rain)
  if (weather.rainChance > 60) {
    if (slot.includes("10:00") || slot.includes("11:00")) score -= 3;
    if (slot.includes("02:00") || slot.includes("03:00")) score += 2;
  }

  // Penalise midday on very hot days
  if (weather.tempC > 34 && slot.includes("12:00")) score -= 2;

  return score;
}

export const suggestTime = asyncHandler(async (req, res) => {
  const { city = "Bengaluru", appointmentDate } = req.query;

  const weather = getSimulatedWeather(city);

  const scored = slots.map((slot) => ({
    slot,
    score: scoreSlot(slot, weather),
    crowdLevel: slotCrowdScore[slot] >= 8 ? "High" : slotCrowdScore[slot] >= 5 ? "Medium" : "Low"
  }));

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  const reasons = [];
  if (weather.rainChance > 60)
    reasons.push(`Rain chance is ${weather.rainChance}% — afternoon slots have fewer rush visitors.`);
  if (weather.tempC > 34)
    reasons.push(`Temperature is ${weather.tempC}°C — avoid midday heat.`);
  if (best.crowdLevel === "Low")
    reasons.push(`${best.slot} historically has low crowd.`);
  if (reasons.length === 0)
    reasons.push(`${best.slot} has the best balance of low crowd and comfortable weather.`);

  return res.status(200).json({
    suggestedSlot: best.slot,
    crowdLevel: best.crowdLevel,
    weather: {
      city,
      condition: weather.condition,
      tempC: weather.tempC,
      rainChance: weather.rainChance
    },
    allSlots: scored,
    reason: reasons.join(" ")
  });
});
