// === Fog Bulletin – Table Version Only (No Map) ===

// ---- Apply fog colors to Day1/Day2 selects ----
function colorizeSelect(sel, label){
  const pal = window.forecastColors || {};
  const c   = pal[label] || "#ffffff";

  sel.style.backgroundColor = c;
  sel.style.color = "#000";
  sel.style.borderColor = "#000";
}

// ---- Fog Classification Table ----
function buildCloudTable(){
  const table = document.getElementById("cloudTable");
  if (!table) return;

  const tbody = table.querySelector("tbody");
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

// ---- Forecast Table (Districts) ----
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
      tr.innerHTML = `<td>${i++}</td>`;

      // State (rowspan)
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

      // Day 1 / Day 2
      const td1 = document.createElement("td");
      const td2 = document.createElement("td");
      td1.setAttribute("data-col","day1");
      td2.setAttribute("data-col","day2");

      const s1 = document.createElement("select");
      const s2 = document.createElement("select");

      [s1, s2].forEach(sel=>{
        options.forEach(opt=>{
          const o=document.createElement("option");
          o.value = opt;
          o.textContent = opt;
          sel.appendChild(o);
        });
        sel.classList.add("select-clean");
        colorizeSelect(sel, sel.value);

        sel.addEventListener("change", ()=>{
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

// ---- Filter Logic ----
function initFogFilter(){
  const sel = document.getElementById("fog-filter");
  if (!sel) return;

  sel.innerHTML = "";

  const optAll = document.createElement("option");
  optAll.value = "";
  optAll.textContent = "All conditions";
  sel.appendChild(optAll);

  (window.forecastOptions || []).forEach(label=>{
    const o=document.createElement("option");
    o.value = label;
    o.textContent = label;
    sel.appendChild(o);
  });

  sel.addEventListener("change", applyFogFilter);
}

function applyFogFilter(){
  const sel = document.getElementById("fog-filter");
  if (!sel) return;

  const target = sel.value;

  const rows = document.querySelectorAll("#forecast-table-body tr");
  rows.forEach(tr => {
    if (!target){ tr.style.display = ""; return; }

    const d1 = tr.querySelector('td[data-col="day1"] select')?.value;
    const d2 = tr.querySelector('td[data-col="day2"] select')?.value;

    const match = (d1 === target || d2 === target);
    tr.style.display = match ? "" : "none";
  });
}

// ---- Notes Mirror for Print ----
function wirePrintNotesMirror(){
  const live = document.getElementById('notes');
  const ghost = document.getElementById('notes-print');
  if (!live || !ghost) return;

  const sync = () => ghost.value = live.value;
  live.addEventListener('input', sync);
  window.addEventListener('beforeprint', sync);
  sync();
}

// ---- INIT ----
function init(){
  if (typeof updateISTDate === "function") updateISTDate();

  buildCloudTable();
  buildFixedTable();
  initFogFilter();
  applyFogFilter(); 
  wirePrintNotesMirror();
}

document.addEventListener("DOMContentLoaded", init);
