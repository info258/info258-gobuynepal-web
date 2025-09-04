
// GoBuy Nepal — universal back button injector
(function(){
  const FALLBACK = "home.html";   // change to "index.html" if you prefer

  // ---- styles (self-contained; no extra CSS file needed)
  const css = `
  .gbn-back{
    display:inline-flex;align-items:center;gap:8px;
    padding:8px 12px;border-radius:999px;background:#fff;
    border:1px solid var(--line,#e6e7ef);
    box-shadow:var(--shadow,0 8px 16px rgba(27,31,35,.08));
    color:var(--ink,#1f2033);font-weight:800;cursor:pointer;
    text-decoration:none; user-select:none;
  }
  .gbn-back:hover{ background:#fafbff }
  .gbn-back .ico{ width:16px;height:16px; display:inline-block }
  .gbn-back-wrap{ position:fixed; top:12px; left:12px; z-index:9999 }
  @media (max-width:520px){ .gbn-back .txt{ display:none } }
  `;
  const style = document.createElement('style'); style.textContent = css;
  document.head.appendChild(style);

  // ---- button element (SVG icon to avoid FA dependency)
  function makeBtn(){
    const btn = document.createElement('button');
    btn.type = "button"; btn.className = "gbn-back";
    btn.innerHTML = `
      <span class="ico" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M14.7 5.3a1 1 0 0 1 0 1.4L10.41 11H20a1 1 0 1 1 0 2h-9.59l4.3 4.3a1 1 0 0 1-1.42 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.42 0z"/>
        </svg>
      </span>
      <span class="txt">Back</span>
    `;
    btn.addEventListener('click', ()=>{
      if (history.length > 1) history.back();
      else window.location.href = FALLBACK;
    });
    return btn;
  }

  // ---- where to place it
  function insertIntoHeader(){
    // Prefer a page header with class .h (your layout), else <header>, else fallback
    const header = document.querySelector('.h') || document.querySelector('header');
    const btn = makeBtn();

    if (header){
      // Put on the left side; if header already left-aligned logo/title exists,
      // we insert the back button as the first element.
      // Also add a small gap so it looks good with existing content.
      btn.style.marginRight = "8px";

      // If header has a wrapping left container (first child is a div with flex), insert inside
      const left = header.firstElementChild;
      if (left && getComputedStyle(left).display.includes('flex')){
        left.prepend(btn);
      } else {
        header.prepend(btn);
      }
      return true;
    }
    return false;
  }

  // Try header first; if not found, add a floating button.
  const placed = insertIntoHeader();
  if (!placed){
    const wrap = document.createElement('div');
    wrap.className = "gbn-back-wrap";
    wrap.appendChild(makeBtn());
    document.body.appendChild(wrap);
  }
})();

