
/* Without vs with HAX: one prompt typed into two chats at once. The bare
   one answers almost instantly with a confident line and nothing else. The
   HAX one is the real thing: pg-preview/compare.html draws it with the
   @hax/react components (trace, message, disclosure, consent) and
   plays it part by part in step with the bare chat; as each part arrives the
   legend beside "With HAX" lights its name, and pointing at a name rings
   that part in the card. Plays when first seen; Replay runs it again.
   Reduced motion shows both finished. Timings are the named constants below
   (the card keeps the same ones). */
(function () {
  var root = document.getElementById('vs'); if (!root) return;
  var TYPE = 26, THINK = 700, GAP = 420, START = 250;   // ms: per typed char, bare reply delay, between parts, first part
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var X = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  var OK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M8 12.5l2.8 2.8L16 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var TASK = {
    prompt: 'Can I get a refund on my annual plan? I bought it 45 days ago.',
    bare: 'Yes, you can get a refund. Just contact our support team and they’ll process it for you.',
    misses: ['Guesses — cites nothing', 'Sounds certain when it isn’t', 'Leaves the next step to you'],
    gains: ['Shows what it checked', 'Says it’s an AI', 'Asks before it acts'],
    parts: ['trace', 'message', 'disclosure', 'consent'],   /* the card's parts, in order: the legend */
    labels: { disclosure: 'Disclosure', trace: 'Stream of Thought', message: 'Streaming', consent: 'Consent' }   /* each part's pattern name in the library */
  };

  function side(sel) { var el = root.querySelector(sel); return { hd: el.querySelector('[data-hd]'), body: el.querySelector('[data-body]'), notes: el.querySelector('[data-notes]') }; }
  var A = side('.vs__side--without'), B = side('.vs__side--with');
  var legend = root.querySelector('[data-legend]'), live = null, timers = [];
  var ready = false, queued = null;

  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function stop() { timers.forEach(clearTimeout); timers = []; }
  function p(cls, html) { return '<div class="vs__p ' + cls + '">' + html + '</div>'; }
  function notes(list, icon) { return list.map(function (t) { return '<li>' + icon + '<span>' + t + '</span></li>'; }).join(''); }
  function card(msg) { hx(msg); }
  /* the "With HAX" card is drawn natively: prompt → trace (Stream of Thought) →
     streamed reply → disclosure → consent, on the same clock as the bare chat */
  var HXREPLY = 'You’re past the 30-day window, but Billing can still review it — they approve most requests up to 60 days.';
  var hxT = [];
  function hxQ(ms, fn) { hxT.push(setTimeout(fn, ms)); }
  function hxEl(k) { return B.body.querySelector('[data-hx="' + k + '"]'); }
  function hxLight(k) { var c = legend.querySelector('[data-part="' + k + '"]'); if (c) c.classList.add('is-on'); }
  function hxNotes() { [].slice.call(B.notes.children).forEach(function (li, j) { setTimeout(function () { li.classList.add('is-in'); }, still ? 0 : j * 180); }); }
  function hxReset() {
    hxT.forEach(clearTimeout); hxT = [];
    B.body.querySelectorAll('.hx__p, .hx__step').forEach(function (el) { el.classList.remove('is-in', 'is-done', 'is-hl'); });
    hxEl('prompt').textContent = ''; B.body.querySelector('.hx__bubble').textContent = '';
  }
  function hx(msg) {
    var type = msg.type;
    if (type === 'vs-hl') {
      B.body.querySelectorAll('.hx__p').forEach(function (el) { el.classList.toggle('is-hl', el.getAttribute('data-hx') === msg.part); });
      return;
    }
    hxReset();
    if (type === 'vs-final') {
      B.body.querySelectorAll('.hx__p, .hx__step').forEach(function (el) { el.classList.add('is-in', 'is-done'); });
      hxEl('prompt').textContent = TASK.prompt; B.body.querySelector('.hx__bubble').textContent = HXREPLY;
      TASK.parts.forEach(hxLight); hxNotes(); return;
    }
    if (type !== 'vs-play') return;
    var t = START, pr = hxEl('prompt');
    hxQ(t, function () {
      pr.classList.add('is-in');
      var n = 0, id = setInterval(function () { n++; pr.textContent = TASK.prompt.slice(0, n); if (n >= TASK.prompt.length) clearInterval(id); }, TYPE);
      hxT.push(id);
    });
    t += TASK.prompt.length * TYPE + 350;
    /* trace: each check spins, then ticks */
    var steps = B.body.querySelectorAll('.hx__step');
    hxQ(t, function () { hxEl('trace').classList.add('is-in'); hxLight('trace'); });
    [].forEach.call(steps, function (st, i) {
      hxQ(t + i * 760, function () { st.classList.add('is-in'); });
      hxQ(t + i * 760 + 620, function () { st.classList.add('is-done'); });
    });
    t += steps.length * 760 + GAP;
    /* streamed reply, word by word */
    var words = HXREPLY.split(' '), bub = B.body.querySelector('.hx__bubble');
    hxQ(t, function () { hxEl('message').classList.add('is-in'); hxLight('message'); });
    words.forEach(function (w, i) { hxQ(t + 150 + i * 55, function () { bub.textContent = words.slice(0, i + 1).join(' '); }); });
    t += 150 + words.length * 55 + GAP;
    hxQ(t, function () { hxEl('disclosure').classList.add('is-in'); hxLight('disclosure'); });
    t += GAP + 120;
    hxQ(t, function () { hxEl('consent').classList.add('is-in'); hxLight('consent'); });
    hxQ(t + 500, hxNotes);
  }

  /* messages from the card */
  addEventListener('message', function (e) {
    if (!live || e.source !== live.contentWindow) return;
    var d = e.data || {};
    if (d.type === 'vs-ready') { ready = true; if (queued) { card(queued); queued = null; } }
    else if (d.type === 'vs-height') live.style.height = d.h + 'px';
    else if (d.type === 'vs-arrive') { var c = legend.querySelector('[data-part="' + d.part + '"]'); if (c) c.classList.add('is-on'); }
    else if (d.type === 'vs-done') [].slice.call(B.notes.children).forEach(function (li, j) { setTimeout(function () { li.classList.add('is-in'); }, still ? 0 : j * 180); });
  });

  function render() {
    var s = TASK;
    A.hd.innerHTML = '<i aria-hidden="true"></i><b>Assistant</b>';
    A.body.innerHTML = p('vs__user', '') + p('vs__bot', '<i aria-hidden="true"></i><p></p>');
    A.notes.innerHTML = notes(s.misses, X);
    B.notes.innerHTML = notes(s.gains, OK);
    legend.innerHTML = s.parts.map(function (k) { return '<button type="button" class="vs__chip" data-part="' + k + '">' + s.labels[k] + '</button>'; }).join('');
    [].slice.call(legend.children).forEach(function (c) {
      var k = c.getAttribute('data-part');
      function on() { card({ type: 'vs-hl', part: k }); }
      function off() { card({ type: 'vs-hl', part: null }); }
      c.addEventListener('pointerenter', on); c.addEventListener('pointerleave', off);
      c.addEventListener('focus', on); c.addEventListener('blur', off);
    });
  }
  function finished() {                        /* both screens complete, no motion */
    root.querySelectorAll('.vs__p, .vs__side--without .vs__notes li').forEach(function (el) { el.classList.add('is-in'); });
    A.body.querySelector('.vs__user').textContent = TASK.prompt;
    A.body.querySelector('.vs__bot p').textContent = TASK.bare;
    card({ type: 'vs-final' });
  }
  function play() {
    stop(); render();
    if (still) { finished(); return; }
    var s = TASK, a = A.body.children, t = START;   /* both prompts start together */
    function show(el, ms) { at(ms, function () { el.classList.add('is-in'); }); }
    card({ type: 'vs-play' });
    /* the same prompt types into both chats (the card types its own copy on the same clock) */
    show(a[0], t);
    at(t, function () {
      var n = 0, id = setInterval(function () { n++; a[0].textContent = s.prompt.slice(0, n); if (n >= s.prompt.length) clearInterval(id); }, TYPE);
      timers.push(id);
    });
    t += s.prompt.length * TYPE + 350;
    /* without: a moment of dots, then one confident line, then what it missed */
    var bare = a[1].querySelector('p');
    at(t, function () { bare.innerHTML = '<span class="vs__dots" aria-hidden="true"><b></b><b></b><b></b></span>'; });
    show(a[1], t);
    at(t + THINK, function () { bare.textContent = s.bare; });
    [].slice.call(A.notes.children).forEach(function (li, j) { show(li, t + THINK + 600 + j * 180); });
  }

  var rp = root.querySelector('.vs__replay');
  rp.addEventListener('click', function () { rp.classList.remove('is-spin'); void rp.offsetWidth; rp.classList.add('is-spin'); play(); });

  render();
  if (still || !('IntersectionObserver' in window)) { play(); return; }
  var io = new IntersectionObserver(function (es) {   /* first play when it comes into view */
    if (es[0].isIntersecting) { io.disconnect(); play(); }
  }, { threshold: 0.3 });
  io.observe(root.querySelector('.vs__grid'));
})();
