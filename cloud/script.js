function prepareNotesForPDF() {
  const source = document.getElementById('notes-box');      // original (textarea or div)
  const target = document.getElementById('notes-print-content'); // printable div

  if (!source || !target) return;

  // If textarea, use .value
  if (source.tagName === 'TEXTAREA') {
    target.textContent = source.value || '';
  } else {
    // If contenteditable div
    target.textContent = source.innerText || source.textContent || '';
  }
}

function downloadPDF() {
  prepareNotesForPDF(); // ✅ critical

  const element = document.getElementById('pdf-root'); // export root

  const opt = {
    margin: 12,
    filename: 'Cloud_Forecast_Bulletin.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, scrollY: 0, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}

document.getElementById('downloadBtn')?.addEventListener('click', downloadPDF);
