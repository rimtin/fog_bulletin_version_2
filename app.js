// === Fog Bulletin – table-only version with colors + filter ===

// ---- helper: color a Day1/Day2 <select> based on its label ----
function colorizeSelect(sel, label){
  const pal = window.forecastColors || {};
  const c   = pal[label] || "#ffffff";

  sel.style.backgroundColor = c;
  sel.style.color = "#000";
  sel.style.borderColor = "#000";
}

// ---- Fog classification table (top card) ----
function buildCloudTable(){
  const table = document.getElementById("cloudTable");
  if (!table) return;

  const tbody = table.querySelector("tbody") || table.appendChild(document.createElement("tbody"));
  tbody.innerHTML = "";

  const pal  = window.cloudRowColors || {};
  const rows = window.cloudRows || [];

  rows.forEach((r, i) => {
    const tr = document.createElement("tr");
    tr.style.background = pal[r.label] || "#fff";
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${r.cover}</td>
      <td>${r.label}</td>
      <td>${r.type}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ---- Forecast table (Districts with Day1/Day2 selects) ----
function buildFixedTable(){
  const tbody = document.getElementById("forecast-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  const options = window.forecastOptions || [];
  const byState = new Map();

  (window.subdivisions || []).forEach(row => {
    if (!byState.has(row.state)) byState.set(row.state, []);
    byState.get(row.state).push(row);
  });

  let i = 1;

  for (const [state, rows] of byState) {
    rows.forEach((row, j) => {
      const tr = document.createElement("tr");
      tr.dataset.state  = state;
      tr.dataset.subdiv = row.name;

      // S. No.
      const tdNo = document.createElement("td");
      tdNo.textContent = i++;
      tr.appendChild(tdNo);

      // State (rowspan for group)
      if (j === 0) {
        const tdState = document.createElement("td");
        tdState.textContent = state;
        tdState.rowSpan = rows.length;
        tdState.style.verticalAlign = "middle";
        tr.appendChild(tdState);
      }

      // District
      const tdDist = document.createElement("td");
      tdDist.textContent = row.name;
      tr.appendChild(tdDist);

      // Day 1 + Day 2 cells
      const td1 = document.createElement("td");
      const td2 = document.createElement("td");
      td1.setAttribute("data-col","day1");
      td2.setAttribute("data-col","day2");

      const s1 = document.createElement("select");
      const s2 = document.createElement("select");

      [s1, s2].forEach(sel => {
        options.forEach(opt => {
          const o = document.createElement("option");
          o.value = opt;
          o.textContent = opt;
          sel.appendChild(o);
        });
        sel.classList.add("select-clean");

        // initial color
        colorizeSelect(sel, sel.value);

        // when changed → recolor & re-apply filter
        sel.addEventListener("change", () => {
          colorizeSelect(sel, sel.value);
          applyFogFilter();
        });
      });

      td1.appendChild(s1);
      td2.appendChild(s2);
      tr.appendChild(td1);
      tr.appendChild(td2);

      tbody.appendChild(tr);
    });
  }
}

// ---- Filter: show only rows matching selected fog category ----
function initFogFilter(){
  const sel = document.getElementById("fog-filter");
  if (!sel) return;

  // build options: "All conditions" + actual categories from data.js
  sel.innerHTML = "";
  const optAll = document.createElement("option");
  optAll.value = "";
  optAll.textContent = "All conditions";
  sel.appendChild(optAll);

  (window.forecastOptions || []).forEach(label => {
    const o = document.createElement("option");
    o.value = label;
    o.textContent = label;
    sel.appendChild(o);
  });

  sel.addEventListener("change", applyFogFilter);
}

// called whenever dropdown or Day1/Day2 changes
function applyFogFilter(){
  const sel = document.getElementById("fog-filter");
  if (!sel) return;

  const target = sel.value;  // "" = show all

  const rows = document.querySelectorAll("#forecast-table-body tr");
  rows.forEach(tr => {
    if (!target) {
      tr.style.display = "";  // reset, show all
      return;
    }

    const d1Sel = tr.querySelector('td[data-col="day1"] select');
    const d2Sel = tr.querySelector('td[data-col="day2"] select');
    const d1 = d1Sel ? d1Sel.value : "";
    const d2 = d2Sel ? d2Sel.value : "";

    // Show row if Day1 OR Day2 equals selected fog category
    const match = (d1 === target) || (d2 === target);
    tr.style.display = match ? "" : "none";
  });
}

// ---- Notes mirror for print (optional; safe if #notes-print missing) ----
function wirePrintNotesMirror(){
  const live = document.getElementById('notes');
  const ghost = document.getElementById('notes-print');
  if (!live || !ghost) return;

  const sync = () => { ghost.value = live.value; };
  live.addEventListener('input', sync);
  window.addEventListener('beforeprint', sync);
  sync();
}

// ---- INIT ----
function init(){
  if (typeof updateISTDate === "function") updateISTDate();
  buildCloudTable();
  buildFixedTable();
  initFogFilter();   // populate & wire filter
  applyFogFilter();  // initial (show all)
  wirePrintNotesMirror();
}

document.addEventListener("DOMContentLoaded", init);
