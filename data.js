/* ===========================================================
 * data.js — District-level Fog Bulletin (no icons)
 * ===========================================================
 */
(function () {
  "use strict";

  /* ---------- District list (used as “Sub Division” in table) ---------- */
  // Each entry: { state, name }  (name = district)
  const subdivisions = [
    // Haryana
    { state: "Haryana",        name: "Sirsa" },
    { state: "Haryana",        name: "Hisar" },
    { state: "Haryana",        name: "Fatehabad" },

    // Punjab
    { state: "Punjab",         name: "Mohali" },
    { state: "Punjab",         name: "Ludhiana" },
    { state: "Punjab",         name: "Patiala" },
    { state: "Punjab",         name: "Firozpur" },
    { state: "Punjab",         name: "Bathinda" },
    { state: "Punjab",         name: "Barnala" },
    { state: "Punjab",         name: "Faridkot" },
    { state: "Punjab",         name: "Mansa" },

    // Rajasthan
    { state: "Rajasthan",      name: "Jodhpur" },
    { state: "Rajasthan",      name: "Phalodi" },
    { state: "Rajasthan",      name: "Nagaur" },
    { state: "Rajasthan",      name: "Jaisalmer" },
    { state: "Rajasthan",      name: "Barmer" },
    { state: "Rajasthan",      name: "Banswara" },
    { state: "Rajasthan",      name: "Pali" },

    // Gujarat
    { state: "Gujarat",        name: "Jamnagar" },
    { state: "Gujarat",        name: "Surendranagar" },
    { state: "Gujarat",        name: "Rajkot" },
    { state: "Gujarat",        name: "Ahmedabad" },
    { state: "Gujarat",        name: "Bhavnagar" },
    { state: "Gujarat",        name: "Gandhinagar" },
    { state: "Gujarat",        name: "Kutch" },
    { state: "Gujarat",        name: "Dahod" },
    { state: "Gujarat",        name: "Sabarkantha" },

    // Madhya Pradesh
    { state: "Madhya Pradesh", name: "Raisen" },
    { state: "Madhya Pradesh", name: "Sehore" },
    { state: "Madhya Pradesh", name: "Vidisha" },
    { state: "Madhya Pradesh", name: "Chhindwara" },
    { state: "Madhya Pradesh", name: "Sagar" },
    { state: "Madhya Pradesh", name: "Betul" },
    { state: "Madhya Pradesh", name: "Guna" },
    { state: "Madhya Pradesh", name: "Sidhi" },

    // Uttar Pradesh
    { state: "Uttar Pradesh",  name: "Prayagraj" },
    { state: "Uttar Pradesh",  name: "Banda" },
    { state: "Uttar Pradesh",  name: "Hamirpur" },
    { state: "Uttar Pradesh",  name: "Fatehpur" }
  ].map(d => ({ ...d, id: `${d.state}:${d.name}` }));

  const subdivisionById = new Map(subdivisions.map(d => [d.id, d]));
  const subdivisionsByState = subdivisions.reduce((acc, d) => {
    (acc[d.state] ||= []).push(d);
    return acc;
  }, {});

  /* ---------- Fog palette & categories (5 classes) ---------- */

  const forecastColors = {
    "Almost Clear Sky":           "#66CCFF", // high vis, high GHI
    "Shallow/Light Fog/Mist":    "#7CFC00", // light green
    "Moderate Fog":              "#FFF500", // yellow
    "Dense/Thick Fog":           "#FF8A00", // orange
    "Very Dense/Very Thick Fog": "#FF0000"  // red
  };
  const forecastOptions = Object.keys(forecastColors);

  // Icons disabled: keep object but with empty strings
  const forecastIcons = {
    "Almost Clear Sky":           "",
    "Shallow/Light Fog/Mist":    "",
    "Moderate Fog":              "",
    "Dense/Thick Fog":           "",
    "Very Dense/Very Thick Fog": ""
  };

  const cloudRowColors = { ...forecastColors };

  // Visibility-based fog buckets (for classification table)
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

  const cloudRows = cloudBuckets.map(({ cover, label, type }) => ({ cover, label, type }));

  /* ---------- IST date utilities ---------- */
  const IST_TZ = "Asia/Kolkata";

  function formatISTDate(d = new Date()) {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: IST_TZ,
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(d);
  }

  function updateISTDate() {
    const el = document.getElementById("forecast-date");
    if (el) el.textContent = formatISTDate();
  }

  function startOfTodayIST() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: IST_TZ,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false
    })
      .formatToParts(now)
      .reduce((o, p) => ((o[p.type] = p.value), o), {});

    const y = Number(parts.year);
    const m = Number(parts.month) - 1;
    const d = Number(parts.day);
    const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}T00:00:00+05:30`;
    return new Date(new Date(iso).getTime());
  }

  /* ---------- Public API ---------- */
  window.subdivisions        = subdivisions;
  window.subdivisionById     = subdivisionById;
  window.subdivisionsByState = subdivisionsByState;

  window.forecastColors      = forecastColors;
  window.forecastOptions     = forecastOptions;
  window.cloudRowColors      = cloudRowColors;
  window.forecastIcons       = forecastIcons;

  window.cloudBuckets        = cloudBuckets;
  window.cloudRows           = cloudRows;

  window.labelByCloudPct     = labelByCloudPct;
  window.colorByCloudPct     = colorByCloudPct;
  window.iconByCloudPct      = iconByCloudPct;
  window.rowByCloudPct       = rowByCloudPct;

  window.updateISTDate       = updateISTDate;
  window.formatISTDate       = formatISTDate;
  window.startOfTodayIST     = startOfTodayIST;
})();
