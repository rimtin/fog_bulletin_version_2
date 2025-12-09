/* ===========================================================
 * data.js — Canonical data + helpers for Fog Bulletin
 * -----------------------------------------------------------
 * Exposes ONLY namespaced globals on `window` so other files
 * (app.js / daily.js / hourly.js) can consume them safely.
 * ===========================================================
 */
(function () {
  "use strict";

  /* ---------- Subdivisions ----------
   * Each entry gets a stable `id` you can use as a key across
   * tables, maps, and fetch layers (format: `${state}:${name}`).
   * (Same 19 met-subdivisions as before)
   */
  const subdivisions = [
    { state: "Punjab",         name: "Punjab" },
    { state: "Rajasthan",      name: "West Rajasthan" },
    { state: "Rajasthan",      name: "East Rajasthan" },
    { state: "Gujarat",        name: "Saurashtra & Kachh" },
    { state: "Gujarat",        name: "Gujarat region" },
    { state: "Uttar Pradesh",  name: "West Uttar Pradesh" },
    { state: "Uttar Pradesh",  name: "East Uttar Pradesh" },
    { state: "Madhya Pradesh", name: "West Madhya Pradesh" },
    { state: "Madhya Pradesh", name: "East Madhya Pradesh" },
    { state: "Chhattisgarh",   name: "Chhattisgarh" },
    { state: "Maharashtra",    name: "Madhya Maharashtra" },
    { state: "Maharashtra",    name: "Marathwada" },
    { state: "Maharashtra",    name: "Vidarbha" },
    { state: "Telangana",      name: "Telangana" },
    { state: "Andhra Pradesh", name: "Coastal Andhra Pradesh" },
    { state: "Andhra Pradesh", name: "Rayalaseema" },
    { state: "Karnataka",      name: "N.I. Karnataka" },
    { state: "Karnataka",      name: "S.I. Karnataka" },
    { state: "Tamil Nadu",     name: "Tamil Nadu & Puducherry" }
  ].map(d => ({ ...d, id: `${d.state}:${d.name}` }));

  // Fast lookup maps
  const subdivisionById = new Map(subdivisions.map(d => [d.id, d]));
  const subdivisionsByState = subdivisions.reduce((acc, d) => {
    (acc[d.state] ||= []).push(d);
    return acc;
  }, {});

  /* ---------- District lists for THIS project ---------- */
  // Exactly the 39 districts & 6 states you provided
  const districtLists = {
    "Haryana": [
      "Sirsa",
      "Hisar",
      "Fatehabad"
    ],
    "Punjab": [
      "Mohali",
      "Ludhiana",
      "Patiala",
      "Firozpur",
      "Bathinda",
      "Barnala",
      "Faridkot",
      "Mansa"
    ],
    "Rajasthan": [
      "Jodhpur",
      "Phalodi",
      "Nagaur",
      "Jaisalmer",
      "Barmer",
      "Banswara",
      "Pali"
    ],
    "Gujarat": [
      "Jamnagar",
      "Surendranagar",
      "Rajkot",
      "Ahmedabad",
      "Bhavnagar",
      "Gandhinagar",
      "Kutch",
      "Dahod",
      "Sabarkantha"
    ],
    "Madhya Pradesh": [
      "Raisen",
      "Sehore",
      "Vidisha",
      "Chhindwara",
      "Sagar",
      "Betul",
      "Guna",
      "Sidhi"
    ],
    "Uttar Pradesh": [
      "Prayagraj",
      "Banda",
      "Hamirpur",
      "Fatehpur"
    ]
  };

  // Order of columns / sections when you render these
  const districtStatesOrder = [
    "Haryana",
    "Punjab",
    "Rajasthan",
    "Gujarat",
    "Madhya Pradesh",
    "Uttar Pradesh"
  ];

  // Tiny helper to fetch a list by key
  function getDistricts(key) {
    return districtLists[key] || [];
  }

  /* ---------- Fog palette & categories (5 classes) ---------- */

  const forecastColors = {
    "Almost Clear Sky":           "#66CCFF", // high vis, high GHI
    "Shallow/Light Fog/Mist":    "#7CFC00", // light green
    "Moderate Fog":              "#FFF500", // yellow
    "Dense/Thick Fog":           "#FF8A00", // orange
    "Very Dense/Very Thick Fog": "#FF0000"  // red
  };
  const forecastOptions = Object.keys(forecastColors);

  const forecastIcons = {
    "Almost Clear Sky":           "🌤️",
    "Shallow/Light Fog/Mist":    "🌫️",
    "Moderate Fog":              "🌫️",
    "Dense/Thick Fog":           "🌫️",
    "Very Dense/Very Thick Fog": "🌫️"
  };

  const cloudRowColors = { ...forecastColors };

  // Fog buckets based on visibility (meters)
  const cloudBuckets = [
    {
      min: 1001,
      max: 99999,
      label: "Almost Clear Sky",
      cover: "More than 1000 meters",
      type:  "High GHI"
    },
    {
      min: 501,
      max: 1000.0001,
      label: "Shallow/Light Fog/Mist",
      cover: "501 meters to 1 kilometer (1000 meters)",
      type:  "Mild to moderate reduction in GHI; some sunlight penetration is possible, though scattered."
    },
    {
      min: 201,
      max: 500.0001,
      label: "Moderate Fog",
      cover: "201 meters to 500 meters",
      type:  "Low GHI; sunlight is highly diffused and weakened; direct sunlight is minimal or absent."
    },
    {
      min: 51,
      max: 200.0001,
      label: "Dense/Thick Fog",
      cover: "51 meters to 200 meters",
      type:  "Very low GHI; nearly all direct sunlight is blocked and scattered."
    },
    {
      min: 0,
      max: 50.0001,
      label: "Very Dense/Very Thick Fog",
      cover: "0 meters to 50 meters (or less than 50 meters)",
      type:  "GHI is extremely low or near zero; direct sunlight is completely absent, making conditions dark even during the day."
    }
  ];

  function labelByCloudPct(x) {
    const v = Number.isFinite(x) ? x : 0;
    const b = cloudBuckets.find(b => v >= b.min && v < b.max) || cloudBuckets.at(-1);
    return b.label;
  }
  function colorByCloudPct(x) { return forecastColors[labelByCloudPct(x)]; }
  function iconByCloudPct(x)  { return forecastIcons[labelByCloudPct(x)]; }
  function rowByCloudPct(x) {
    const v = Number.isFinite(x) ? x : 0;
    return cloudBuckets.find(b => v >= b.min && v < b.max) || cloudBuckets.at(-1);
  }

  // These rows feed the Fog Classification table
  const cloudRows = cloudBuckets.map(({ cover, label, type }) => ({ cover, label, type }));

  /* ---------- IST date utilities ---------- */
  const IST_TZ = "Asia/Kolkata";
  function formatISTDate(d = new Date()) {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: IST_TZ, day: "2-digit", month: "long", year: "numeric"
    }).format(d);
  }
  function updateISTDate() {
    const el = document.getElementById("forecast-date");
    if (el) el.textContent = formatISTDate();
  }
  function startOfTodayIST() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: IST_TZ, year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", second: "numeric", hour12: false
    }).formatToParts(now).reduce((o, p) => (o[p.type] = p.value, o), {});
    const y = Number(parts.year), m = Number(parts.month) - 1, d = Number(parts.day);
    return new Date(new Date(
      `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}T00:00:00+05:30`
    ).getTime());
  }

  /* ---------- Public API (attach to window) ---------- */
  window.subdivisions          = subdivisions;
  window.subdivisionById       = subdivisionById;
  window.subdivisionsByState   = subdivisionsByState;

  window.districtLists         = districtLists;          // { state -> [districts] }
  window.districtStatesOrder   = districtStatesOrder;    // order for UI
  window.getDistricts          = getDistricts;

  window.forecastColors        = forecastColors;
  window.forecastOptions       = forecastOptions;
  window.cloudRowColors        = cloudRowColors;
  window.forecastIcons         = forecastIcons;

  window.cloudBuckets          = cloudBuckets;
  window.cloudRows             = cloudRows;

  window.labelByCloudPct       = labelByCloudPct;
  window.colorByCloudPct       = colorByCloudPct;
  window.iconByCloudPct        = iconByCloudPct;
  window.rowByCloudPct         = rowByCloudPct;

  window.updateISTDate         = updateISTDate;
  window.formatISTDate         = formatISTDate;
  window.startOfTodayIST       = startOfTodayIST;

})();
