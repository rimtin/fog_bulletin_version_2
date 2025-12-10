// === Fog Bulletin (No Map Version) ===

// Build fog classification table
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

// Build district forecast table (Day1 / Day2)
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

      tr.innerHTML = `
        <td>${i++}</td>
        ${j === 0 ? `<td rowspan="${rows.length}">${state}</td>` : ""}
        <td>${row.name}</td>
        <td data-col="day1"></td>
        <td data-col="day2"></td>
      `;

      const td1 = tr.querySelector('td[data-col="day1"]');
      const td2 = tr.querySelector('td[data-col="day2"]');

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
      });

      td1.appendChild(s1);
      td2.appendChild(s2);

      tbody.appendChild(tr);
    });
  }
}

// Notes mirror (if printing)
function wirePrintNotesMirror(){
  const live = document.getElementById('notes');
  const ghost = document.getElementById('notes-print');
  if (!live || !ghost) return;

  const sync = () => { ghost.value = live.value; };
  live.addEventListener('input', sync);
  window.addEventListener('beforeprint', sync);
  sync();
}

// INIT
function init(){
  if (typeof updateISTDate === "function") updateISTDate();
  buildCloudTable();
  buildFixedTable();
  wirePrintNotesMirror();
}

document.addEventListener("DOMContentLoaded", init);
