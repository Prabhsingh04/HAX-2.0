/* HAX site override (hand-written): draws Prabh's pattern legend as callouts with leader lines out of
   the card parts. The hidden legend chips stay the source of truth: a callout lights when its chip
   does (part arrived), and pointing at a callout fires the chip's own hover, which rings the part. */
(function () {
  var root = document.getElementById('vs'); if (!root) return;
  var side = root.querySelector('.vs__side--with'), card = side.querySelector('.vs__card'), legend = side.querySelector('[data-legend]');
  var NS = 'http://www.w3.org/2000/svg';
  /* where each callout leaves its part: left into the gap between the cards, or down below the card */
  var DIR = { trace: 'left', message: 'left', disclosure: 'left', consent: 'down' };
  var ORDER = ['trace', 'message', 'disclosure', 'consent'];
  /* v3: Consent joins the others in the left column, pointing at the approval card's icon */
  var V3 = !!root.closest('.hax-v3');
  if (V3) DIR.consent = 'left';
  var co = document.createElement('div'); co.className = 'vs-co';
  var svg = document.createElementNS(NS, 'svg'); co.appendChild(svg); side.appendChild(co);
  var items = {};
  ORDER.forEach(function (k) {
    var g = document.createElementNS(NS, 'g'), ln = document.createElementNS(NS, 'line'), dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('r', '2.5'); g.appendChild(ln); g.appendChild(dot); svg.appendChild(g);
    var lab = document.createElement('button'); lab.type = 'button'; lab.className = 'vs-co__lab'; lab.dataset.part = k; co.appendChild(lab);
    items[k] = { g: g, ln: ln, dot: dot, lab: lab };
    function chip() { return legend.querySelector('[data-part="' + k + '"]'); }
    function fire(t, hot) { var c = chip(); if (c) c.dispatchEvent(new Event(t)); g.classList.toggle('is-hot', hot); lab.classList.toggle('is-hot', hot); }
    lab.addEventListener('pointerenter', function () { fire('pointerenter', true); });
    lab.addEventListener('pointerleave', function () { fire('pointerleave', false); });
    lab.addEventListener('focus', function () { fire('focus', true); });
    lab.addEventListener('blur', function () { fire('blur', false); });
  });
  function anchor(k) {   /* the exact UI bit each callout points at */
    var b = card.querySelector('[data-hx="' + k + '"]');
    if (k === 'trace') return b.querySelector('.hx__ck');
    if (k === 'message') return b.querySelector('.hx__av');
    if (k === 'disclosure') return b.querySelector('svg');
    if (k === 'consent' && DIR.consent === 'left') return b.querySelector('.hx__doc') || b;
    return b;
  }
  function layout() {
    if (getComputedStyle(co).display === 'none') return;
    var o = side.getBoundingClientRect(), c = card.getBoundingClientRect();
    ORDER.forEach(function (k) {
      var it = items[k], a = anchor(k); if (!a) return;
      var r = a.getBoundingClientRect(), x1, y1, x2, y2;
      var ch = legend.querySelector('[data-part="' + k + '"]');
      it.lab.textContent = ch ? ch.textContent : k;
      var lw = it.lab.offsetWidth, lh = it.lab.offsetHeight;
      if (DIR[k] === 'left') {
        y1 = r.top - o.top + r.height / 2;
        x1 = r.left - o.left - 6; x2 = c.left - o.left - 12; y2 = y1;
        it.lab.style.left = (x2 - lw) + 'px'; it.lab.style.top = (y2 - lh / 2) + 'px'; it.lab.style.setProperty('--dy', '0');
        it.lab.style.transformOrigin = 'right center';
      } else {
        /* drop past the card and its notes row, clear of the notes' text, so the label never sits on them */
        var nb = side.querySelector('.vs__notes').getBoundingClientRect();
        x1 = r.right - o.left - 24; y1 = r.bottom - o.top + 6; x2 = x1; y2 = Math.max(c.bottom, nb.bottom) - o.top + 12;
        it.lab.style.left = Math.min(x2 - lw / 2, c.right - o.left - lw) + 'px'; it.lab.style.top = y2 + 'px'; it.lab.style.setProperty('--dy', '-4px');
        it.lab.style.transformOrigin = 'center top';
      }
      it.ln.setAttribute('x1', x2); it.ln.setAttribute('y1', y2); it.ln.setAttribute('x2', x1); it.ln.setAttribute('y2', y1);
      it.g.style.setProperty('--len', Math.hypot(x2 - x1, y2 - y1).toFixed(1));
      it.dot.setAttribute('cx', x1); it.dot.setAttribute('cy', y1);
    });
  }
  function sync() {   /* mirror the chips: lit when the part has arrived */
    ORDER.forEach(function (k) {
      var ch = legend.querySelector('[data-part="' + k + '"]'), on = !!(ch && ch.classList.contains('is-on'));
      items[k].g.classList.toggle('is-on', on); items[k].lab.classList.toggle('is-on', on);
    });
    layout();
  }
  new MutationObserver(sync).observe(legend, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  var ro = new ResizeObserver(layout); ro.observe(card); ro.observe(side); ro.observe(root);
  card.addEventListener('transitionend', layout);
  addEventListener('resize', layout);
  if (document.fonts) document.fonts.ready.then(layout);
  sync();
})();
