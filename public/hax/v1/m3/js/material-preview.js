/* ============================================================
   MATERIAL 3.0 — LIVE PREVIEW PLAYGROUND

   Section 2 of the pattern page, and deliberately NOT the
   simulator further down.

     Live Preview  — the pattern itself, isolated, with every
                     state reachable by hand. You come here to
                     inspect: what does "expanded" look like,
                     what happens on dismiss, what markup is
                     behind each state.

     Simulator     — the same pattern inside a working product,
                     where it appears because a workflow made it
                     appear. You come there to understand context.

   Confusing the two is the commonest failure of a pattern page:
   a specimen pretending to be a product, or a product that
   never lets you reach the state you actually wanted to study.

   THREE THINGS ARE LOCKED TOGETHER by construction:

     1. the stage           — the state's markup, mounted
     2. the code pane       — the SAME string, escaped
     3. the state read-out  — trigger / behaviour / next action

   One `view(state)` produces all three, so the code a reader
   copies is always the code behind what they are looking at,
   and the documentation cannot describe a state the component
   is not in.

   MOTION. State changes that are a container opening (expand,
   dismiss, reveal) mutate the live DOM first so the CSS
   transition actually runs, and repaint once it has landed.
   Re-rendering first would destroy the element mid-transition
   and the pattern would jump — which is precisely the thing
   the neural expressive language is about: one surface
   transforming into another, not a popup replacing it.
   ============================================================ */
(function () {
  'use strict';

  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  function wait(ms) {
    return new Promise(function (r) { setTimeout(r, reduce ? Math.min(ms, 80) : ms); });
  }
  var MORPH = reduce ? 0 : 420;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* Same highlighter as the code panes elsewhere: the attribute pass
     runs INSIDE the tag callback, because String.replace never
     re-scans a callback's return value — highlighting tags and then
     attributes over one string makes the second pass match the spans
     the first pass just wrote. */
  function highlight(code) {
    return esc(code).replace(/&lt;(\/?)([a-zA-Z][\w-]*)([\s\S]*?)(\/?)&gt;/g,
      function (_, slash, tag, attrs, selfClose) {
        var a = attrs.replace(/([a-zA-Z-][\w-]*)(=)("[^"]*")/g,
          '<span class="a">$1</span>$2<span class="v">$3</span>');
        return '&lt;' + slash + '<span class="t">' + tag + '</span>' + a + selfClose + '&gt;';
      });
  }

  var SPARK = '<path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>';

  var MIC =
    '<svg viewBox="0 0 24 24" aria-hidden="true">\n' +
    '      <rect x="9" y="3" width="6" height="11" rx="3"/>\n' +
    '      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" fill="none"\n' +
    '            stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>\n' +
    '    </svg>';

  /* ══════════════════════════════════════════════════════════
     THE PATTERNS

     Each one declares:
       initial   the state it opens in
       states    id → { label, trigger, behaviour, action }
                 — the four things a state has to document
       view      state → markup (stage AND code, one string)
       act       what the component's OWN controls do

     There is no separate control bar. The state chips move
     between states, and everything else is driven by the
     pattern itself — the chip that expands, the button that
     refreshes — so a reader is always operating the component
     rather than a rig built around it.
     ══════════════════════════════════════════════════════════ */
  var PATTERNS = {


    /* ── Example gallery ────────────────────────────────────
       Browse → filter → open one → it lands in the composer.
       The last step is the pattern's whole point: an example
       that ends in a copy button ends outside the product. */
    'example-gallery': {
      initial: 'browsing',

      /* A gallery's decisions are about the EXAMPLES: what the ask
         says, what came back, and whether the result is shown at all
         — the result is the half that teaches range, so hiding it is
         a real (and usually wrong) choice a team can inspect here. */
      customize: {
        groups: [
          { id: 'layout', label: 'Layout', states: ['browsing', 'filtered'],
            controls: [
              { id: 'layout', label: 'Arrangement', type: 'segment', value: 'grid',
                options: [['grid', 'Grid'], ['list', 'List']] },
              { id: 'showResult', label: 'Show what came back', type: 'toggle', value: true,
                capability: true,
                hint: 'An example that shows only the prompt teaches the syntax, not the range.' },
              { id: 'showUse', label: 'Show the “use this” affordance',
                type: 'toggle', value: true }
            ] },

          { id: 'example', label: 'The example', states: ['browsing', 'filtered'],
            controls: [
              { id: 'category', label: 'Category', type: 'text', value: 'Analysis' },
              { id: 'ask', label: 'Ask', type: 'text',
                value: 'Which renewals are at risk this quarter?' },
              { id: 'result', label: 'Result', type: 'text',
                value: 'A ranked list of seven accounts with the signal behind each one.',
                visibleWhen: function (c) { return !!c.showResult; } }
            ] },

          { id: 'opened', label: 'Opened', states: ['opened'],
            note: 'The whole exchange, and one control that matters.',
            controls: [
              { id: 'useLabel', label: 'Primary action', type: 'text',
                value: 'Use this prompt' }
            ] },

          { id: 'applied', label: 'In the composer', states: ['applied'],
            note: 'It has to come back out as editable text, or the example ends outside the product.',
            controls: [
              { id: 'appliedNote', label: 'Note', type: 'text',
                value: 'From an example — edit freely' },
              { id: 'sendLabel', label: 'Send', type: 'text', value: 'Send' }
            ] }
        ]
      },

      states: {
        browsing: { label: 'Browsing',
                    trigger: 'The user reaches an empty surface with nothing to react to.',
                    behaviour: 'Worked examples, each showing the ask and a line of what came ' +
                               'back. The result is the half that teaches range.',
                    action: 'Filter, or open an example' },
        filtered: { label: 'Filtered',
                    trigger: 'The user narrows to the job they are actually doing.',
                    behaviour: 'M3 filter chips: the selected one carries a leading tick as well ' +
                               'as the tonal ground, so the state is never colour alone.',
                    action: 'Open an example' },
        opened:   { label: 'Opened',
                    trigger: 'An example is selected.',
                    behaviour: 'The whole exchange — the full ask, the full result — and one ' +
                               'control that matters.',
                    action: 'Use the prompt' },
        applied:  { label: 'Applied',
                    trigger: 'The user takes the example.',
                    behaviour: 'It lands in their own composer, editable, so they start from a ' +
                               'working request rather than a blank field.',
                    action: 'Back to browsing' }
      },
      view: function (s) {
        var c = s.cfg;
        if (s.state === 'applied') {
          return '' +
'<div class="pv-composer">\n' +
'  <p class="pv-composer__label md-body-small">Your prompt</p>\n' +
'  <p class="pv-composer__value md-body-large">\n' +
'    Which renewals are at risk this quarter, and why?<span class="pv-caretbar"></span>\n' +
'  </p>\n' +
'  <div class="pv-composer__foot">\n' +
'    <span class="md-hint md-body-small">\n' +
'      <span class="md-hint__dot" aria-hidden="true"></span>' + esc(c.appliedNote) + '\n' +
'    </span>\n' +
'    <button class="md-button md-button--filled md-button--sm" type="button"\n' +
'            data-act="browse">' + esc(c.sendLabel) + '</button>\n' +
'  </div>\n' +
'</div>';
        }
        if (s.state === 'opened') {
          return '' +
'<div class="md-ex-open" role="dialog" aria-labelledby="ex-t">\n' +
'  <span class="md-ex__k md-label-small">' + esc(c.category) + '</span>\n' +
'  <h3 class="md-tpl__name md-title-medium" id="ex-t">Renewal risk, ranked</h3>\n' +
'  <p class="md-ex-open__ask md-body-medium">\n' +
'    ' + esc(c.ask) + '\n' +
'  </p>\n' +
'  <p class="md-ex-open__out md-body-medium">\n' +
'    Seven accounts, ranked by weighted value. Each carries the signal behind it —\n' +
'    support escalations, usage drop, or a champion who has left.\n' +
'  </p>\n' +
'  <div class="md-ex-open__foot">\n' +
'    <button class="md-button md-button--filled md-button--sm" type="button" data-act="apply">\n' +
'      ' + esc(c.useLabel) + '\n' +
'    </button>\n' +
'    <button class="md-button md-button--text md-button--sm" type="button" data-act="browse">\n' +
'      Back\n' +
'    </button>\n' +
'  </div>\n' +
'</div>';
        }

        var on = s.state === 'filtered' ? c.category : 'All';
        function filter(label) {
          var sel = label === on;
          return '  <button class="md-filter' + (sel ? ' is-on' : '') + '" type="button" ' +
                 'aria-pressed="' + sel + '" data-act="filter:' + label + '">\n' +
                 '    <svg class="md-filter__tick" viewBox="0 0 24 24" aria-hidden="true">\n' +
                 '      <path d="M5 12.5 10 17.5 19 7"/>\n' +
                 '    </svg>\n' +
                 '    ' + label + '\n' +
                 '  </button>\n';
        }
        var drafting = s.state === 'filtered' ? '' :
'    <button class="md-ex" type="button" data-act="open">\n' +
'      <span class="md-ex__k md-label-small">Drafting</span>\n' +
'      <p class="md-ex__ask md-body-medium">Draft the renewal note to Dana</p>\n' +
   (c.showResult
? '      <p class="md-ex__out md-body-small">A three-line message with the Q2 figures\n' +
  '        attached, ready to edit.</p>\n' : '') +
'    </button>\n';

        return '' +
'<div class="md-gallery" data-layout="' + c.layout + '">\n' +
'  <div class="md-gallery__filters" role="group" aria-label="Filter examples">\n' +
   filter('All') + filter(c.category) +
'  </div>\n' +
'\n' +
'  <div class="md-grid">\n' +
'    <button class="md-ex" type="button" data-act="open">\n' +
'      <span class="md-ex__k md-label-small">' + esc(c.category) + '</span>\n' +
'      <p class="md-ex__ask md-body-medium">' + esc(c.ask) + '</p>\n' +
   (c.showResult
? '      <p class="md-ex__out md-body-small">' + esc(c.result) + '</p>\n' : '') +
   (c.showUse
? '      <span class="md-ex__use">Use this\n' +
  '        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"\n' +
  '             stroke-width="2.4" stroke-linecap="round" aria-hidden="true">\n' +
  '          <path d="M5 12h14M13 6l6 6-6 6"/>\n' +
  '        </svg>\n' +
  '      </span>\n' : '') +
'    </button>\n' +
   drafting +
'  </div>\n' +
'</div>';
      },
      act: function (a, ctx) {
        if (a.indexOf('filter:') === 0) {
          ctx.s.state = a.split(':')[1] === 'All' ? 'browsing' : 'filtered';
          ctx.paint(); return;
        }
        if (a === 'open')   { ctx.s.state = 'opened';  ctx.paint(); return; }
        if (a === 'apply')  { ctx.s.state = 'applied'; ctx.paint();
                              ctx.announce('Prompt placed in your composer'); return; }
        if (a === 'browse') { ctx.s.state = 'browsing'; ctx.paint(); }
      }
    },

    /* ── Templates ──────────────────────────────────────────
       Empty → filling → complete → assembled. The last state
       is the one most implementations skip: the prompt has to
       come back out as editable text, or the scaffold is a
       form the user cannot leave. */
    templates: {
      initial: 'empty',

      /* A template is a sentence with holes in it, so what there is to
         decide is the sentence: its name, what it is for, and what
         each slot is called before anything is chosen. The slot LABELS
         are the teaching surface — "a source" tells you what kind of
         answer belongs there, "click here" does not. */
      customize: {
        groups: [
          { id: 'template', label: 'The template',
            states: ['empty', 'partial', 'complete'],
            controls: [
              { id: 'shape', label: 'Corner', type: 'segment', value: 'large',
                options: [['extra-large', 'X-large'], ['large', 'Large'], ['medium', 'Medium']] },
              { id: 'name', label: 'Name', type: 'text', value: 'Weekly update' },
              { id: 'desc', label: 'Description', type: 'text',
                value: 'The one people send every Friday.' }
            ] },

          { id: 'slots', label: 'Slots', states: ['empty', 'partial', 'complete'],
            note: 'Empty slots stay dashed and named — the difference is shape before it is colour.',
            controls: [
              /* A slot's LABEL is what shows before anything is chosen.
                 Once the slot is filled the label is gone from the
                 sentence, so it leaves the panel with it: in Complete
                 there is nothing left to name. */
              { id: 'slot1', label: 'First slot', type: 'text', value: 'a source',
                visibleWhen: function (c, state) { return state === 'empty'; } },
              { id: 'slot2', label: 'Second slot', type: 'text', value: 'an audience',
                visibleWhen: function (c, state) { return state === 'empty'; } },
              { id: 'slot3', label: 'Third slot', type: 'text', value: 'a tone',
                visibleWhen: function (c, state) { return state !== 'complete'; } },
              { id: 'slot4', label: 'Fourth slot', type: 'text', value: 'a length',
                visibleWhen: function (c, state) { return state !== 'complete'; } },
              { id: 'count', label: 'Show the progress count', type: 'toggle', value: true,
                hint: 'What is still missing, said in numbers rather than implied by colour.' }
            ] },

          { id: 'run', label: 'Actions', states: ['empty', 'partial', 'complete'],
            controls: [
              { id: 'runLabel', label: 'Run', type: 'text', value: 'Run it' },
              { id: 'escape', label: 'Can be edited as text', type: 'toggle', value: true,
                capability: true,
                hint: 'A scaffold you cannot leave is a form, and the user knows the exception.' },
              { id: 'escapeLabel', label: 'Escape label', type: 'text', value: 'Edit as text',
                visibleWhen: function (c) { return !!c.escape; } }
            ] },

          { id: 'astext', label: 'As text', states: ['assembled'],
            requires: 'escape',
            controls: [
              { id: 'assembledNote', label: 'Note', type: 'text',
                value: 'Assembled from a template' },
              { id: 'backLabel', label: 'Way back', type: 'text', value: 'Back to the template' }
            ] }
        ]
      },

      states: {
        empty:     { label: 'Empty',
                     trigger: 'A template is chosen but nothing is filled.',
                     behaviour: 'The sentence still reads as a sentence. That is what makes a ' +
                                'scaffold teach: the shape of a good request is legible before ' +
                                'anything is decided.',
                     action: 'Fill a slot' },
        partial:   { label: 'Partly filled',
                     trigger: 'Some slots are chosen.',
                     behaviour: 'Filled slots become solid chips, empty ones stay dashed — the ' +
                                'difference is shape before it is colour. The count says what ' +
                                'is still missing.',
                     action: 'Fill the rest' },
        complete:  { label: 'Complete',
                     trigger: 'Every slot has a value.',
                     behaviour: 'Nothing is missing, so the run control takes full weight. The ' +
                                'template never guessed on the user’s behalf.',
                     action: 'Run it, or edit as text' },
        assembled: { label: 'As text',
                     trigger: 'The user breaks out of the scaffold.',
                     behaviour: 'The assembled prompt, editable. A scaffold you cannot leave is ' +
                                'a form, and the user is the one who knows the exception.',
                     action: 'Back to the template' }
      },
      view: function (s) {
        var c = s.cfg;
        var set = s.state === 'complete' || s.state === 'assembled' ? 4
                : s.state === 'partial' ? 2 : 0;

        if (s.state === 'assembled') {
          return '' +
'<div class="pv-composer">\n' +
'  <p class="pv-composer__label md-body-small">Your prompt</p>\n' +
'  <p class="pv-composer__value md-body-large">\n' +
'    Summarise this week&rsquo;s pipeline for the leadership team in a plain,\n' +
'    unhedged tone, no longer than five bullets.<span class="pv-caretbar"></span>\n' +
'  </p>\n' +
'  <div class="pv-composer__foot">\n' +
'    <span class="md-hint md-body-small">\n' +
'      <span class="md-hint__dot" aria-hidden="true"></span>' + esc(c.assembledNote) + '\n' +
'    </span>\n' +
'    <button class="md-button md-button--text md-button--sm" type="button" data-act="back">\n' +
'      ' + esc(c.backLabel) + '\n' +
'    </button>\n' +
'  </div>\n' +
'</div>';
        }

        function slot(i, filled, label, act) {
          var on = i <= set;
          return '    <button class="md-slot' + (on ? ' is-set' : '') + '" type="button" ' +
                 'data-act="' + act + '">' + (on ? filled : label) + '\n' +
                 '      <svg class="md-slot__caret" viewBox="0 0 24 24" aria-hidden="true">\n' +
                 '        <path d="M6 9.5 12 15.5 18 9.5"/></svg>\n' +
                 '    </button>';
        }

        return '' +
'<section class="md-tpl" data-shape="' + c.shape + '">\n' +
'  <h3 class="md-tpl__name md-title-medium">' + esc(c.name) + '</h3>\n' +
'  <p class="md-tpl__desc md-body-medium">' + esc(c.desc) + '</p>\n' +
'\n' +
'  <p class="md-tpl__line md-body-large">\n' +
'    Summarise\n' +
   slot(1, 'this week&rsquo;s pipeline', esc(c.slot1), 'fill') + '\n' +
'    for\n' +
   slot(2, 'the leadership team', esc(c.slot2), 'fill') + '\n' +
'    in\n' +
   slot(3, 'a plain, unhedged tone', esc(c.slot3), 'fill') + ',\n' +
'    no longer than\n' +
   slot(4, 'five bullets', esc(c.slot4), 'fill') + '.\n' +
'  </p>\n' +
'\n' +
'  <div class="md-tpl__foot">\n' +
'    <button class="md-button md-button--filled md-button--sm" type="button"' +
     (set === 4 ? '' : ' disabled') + '>' + esc(c.runLabel) + '</button>\n' +
   (c.escape
? '    <button class="md-button md-button--text md-button--sm" type="button" data-act="text">\n' +
  '      ' + esc(c.escapeLabel) + '\n' +
  '    </button>\n' : '') +
   (c.count
? '    <span class="md-tpl__count md-body-small">' + set + ' of 4 chosen</span>\n' : '') +
'  </div>\n' +
'</section>';
      },
      act: function (a, ctx) {
        var s = ctx.s;
        if (a === 'fill') {
          s.state = s.state === 'empty' ? 'partial'
                  : s.state === 'partial' ? 'complete' : 'empty';
          ctx.paint(); return;
        }
        if (a === 'text') { s.state = 'assembled'; ctx.paint(); return; }
        if (a === 'back') { s.state = 'complete'; ctx.paint(); }
      }
    },

    /* ── Nudges ─────────────────────────────────────────────
       Dormant → offered → accepted or dismissed. Dismissed is
       a real, sticky outcome here, because the difference
       between a hint and a nag is whether no is remembered. */
    nudges: {
      initial: 'dormant',

      /* The decisions a nudge actually has: what it offers, why it is
         being said NOW, what the two answers are called, and whether
         no is available at all. Dismissibility is a capability here —
         turn it off and the dismiss controls stop existing, which is
         exactly the design a team should have to look at deliberately. */
      customize: {
        groups: [
          { id: 'offer', label: 'The offer', states: ['offered'],
            controls: [
              { id: 'shape', label: 'Corner', type: 'segment', value: 'large',
                options: [['extra-large', 'X-large'], ['large', 'Large'], ['medium', 'Medium']] },
              { id: 'title', label: 'Offer', type: 'text', value: 'Aria can draft this reply' },
              { id: 'why', label: 'Why now', type: 'text',
                value: 'You have written three of these by hand this week.',
                hint: 'A nudge on a timer rather than on evidence is an advertisement.' }
            ] },

          { id: 'actions', label: 'Actions', states: ['offered'],
            controls: [
              { id: 'acceptLabel', label: 'Accept', type: 'text', value: 'Try it' },
              { id: 'dismissible', label: 'Can be dismissed', type: 'toggle', value: true,
                capability: true },
              { id: 'dismissLabel', label: 'Decline', type: 'text', value: 'Not now',
                visibleWhen: function (c) { return !!c.dismissible; } },
              { id: 'closeX', label: 'Also show the close control', type: 'toggle', value: true,
                visibleWhen: function (c) { return !!c.dismissible; } }
            ] },

          { id: 'quiet', label: 'Quiet form', states: ['quiet'],
            note: 'The same offer riding on the control itself — no overlay, no dismissal needed.',
            controls: [
              { id: 'quietText', label: 'Line', type: 'text',
                value: 'Aria can summarise this thread' },
              { id: 'quietAction', label: 'Action', type: 'text', value: 'Show me' }
            ] },

          { id: 'accepted', label: 'Accepted', states: ['accepted'],
            note: 'The capability opens in place. A nudge that leads to a settings page wasted its moment.',
            controls: [
              { id: 'draftText', label: 'What arrives', type: 'text',
                value: 'Thanks Dana — the renewal figures are attached. Happy to walk through ' +
                       'them on Thursday if that helps.' },
              { id: 'draftChip', label: 'Attribution chip', type: 'text',
                value: 'Drafted by Aria' }
            ] },

          { id: 'dismissed', label: 'Dismissed', states: ['dismissed'],
            requires: 'dismissible',
            note: 'Once is a hint; the same one three times is a nag.',
            controls: [
              { id: 'dismissedText', label: 'What stays', type: 'text',
                value: 'Hint dismissed. This one does not come back — not on the next reply, ' +
                       'not next week.' }
            ] },

          { id: 'dormant', label: 'Dormant', states: ['dormant'],
            controls: [
              { id: 'dormantText', label: 'Note', type: 'text',
                value: 'Nothing offered. The product has no evidence yet that help would land.' }
            ] }
        ]
      },

      states: {
        dormant:   { label: 'Dormant',
                     trigger: 'Nothing in the user’s behaviour has earned an offer.',
                     behaviour: 'Silence. A nudge on a timer rather than on evidence is an ' +
                                'advertisement, and users learn to close those unread.',
                     action: 'Earn the nudge' },
        offered:   { label: 'Offered',
                     trigger: 'The user has done the same thing by hand three times.',
                     behaviour: 'A small anchored card with a tail pointing at the control it ' +
                                'is about, saying what it does and why it is being said now.',
                     action: 'Accept, or dismiss' },
        accepted:  { label: 'Accepted',
                     trigger: 'The user takes the offer.',
                     behaviour: 'The capability opens immediately, in place. A nudge that leads ' +
                                'to a settings page has wasted the moment it earned.',
                     action: 'Reset' },
        dismissed: { label: 'Dismissed',
                     trigger: 'The user says no.',
                     behaviour: 'Gone, and gone for good for this hint. Once is a hint; the ' +
                                'same one three times is a nag.',
                     action: 'Reset' },
        quiet:     { label: 'Quiet form',
                     trigger: 'The surface is too dense for a floating card.',
                     behaviour: 'The same offer riding on the control itself — one line, no ' +
                                'overlay, no dismissal needed.',
                     action: 'Reset' }
      },
      view: function (s) {
        var c = s.cfg;
        if (s.state === 'dormant') {
          return '' +
'<div class="pv-card pv-card--quiet">\n' +
'  <p class="md-body-medium">Reply to Dana Khoury</p>\n' +
'  <p class="pv-card__meta md-body-small">' + esc(c.dormantText) + '</p>\n' +
'</div>';
        }
        if (s.state === 'quiet') {
          return '' +
'<span class="md-hint md-body-small">\n' +
'  <span class="md-hint__dot" aria-hidden="true"></span>\n' +
'  ' + esc(c.quietText) + '\n' +
'  <button class="md-button md-button--text md-button--sm" type="button">' +
   esc(c.quietAction) + '</button>\n' +
'</span>';
        }
        if (s.state === 'accepted') {
          return '' +
'<div class="pv-card">\n' +
'  <p class="pv-card__meta md-body-small">Reply to Dana</p>\n' +
'  <p class="pv-card__body md-body-medium">' + esc(c.draftText) + '</p>\n' +
'  <span class="md-assist-chip md-assist-chip--tonal">\n' +
'    <svg class="md-assist-chip__icon" viewBox="0 0 24 24" aria-hidden="true">\n' +
'      <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
'    </svg>\n' +
'    ' + esc(c.draftChip) + '\n' +
'  </span>\n' +
'</div>';
        }
        if (s.state === 'dismissed') {
          return '' +
'<div class="pv-card pv-card--quiet" role="status">\n' +
'  <p class="md-body-medium">Reply to Dana Khoury</p>\n' +
'  <p class="pv-card__meta md-body-small">' + esc(c.dismissedText) + '</p>\n' +
'</div>';
        }
        return '' +
'<div class="md-nudge" role="status" data-shape="' + c.shape + '">\n' +
'  <div class="md-nudge__head">\n' +
'    <svg class="md-nudge__ico" viewBox="0 0 24 24" aria-hidden="true">\n' +
'      <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
'    </svg>\n' +
'    <div>\n' +
'      <p class="md-nudge__t md-body-medium">' + esc(c.title) + '</p>\n' +
'      <p class="md-nudge__d md-body-small">' + esc(c.why) + '</p>\n' +
'    </div>\n' +
   (c.dismissible && c.closeX
? '    <button class="md-nudge__x" type="button" aria-label="Dismiss this hint"\n' +
  '            data-act="dismiss">&times;</button>\n' : '') +
'  </div>\n' +
'  <div class="md-nudge__foot">\n' +
'    <button class="md-button md-button--filled md-button--sm" type="button"\n' +
'            data-act="accept">' + esc(c.acceptLabel) + '</button>\n' +
   (c.dismissible
? '    <button class="md-button md-button--text md-button--sm" type="button"\n' +
  '            data-act="dismiss">' + esc(c.dismissLabel) + '</button>\n' : '') +
'  </div>\n' +
'</div>';
      },
      act: function (a, ctx) {
        if (a === 'accept')  { ctx.s.state = 'accepted';  ctx.paint();
                               ctx.announce('Draft written'); return; }
        if (a === 'dismiss') { ctx.s.state = 'dismissed'; ctx.paint();
                               ctx.announce('Hint dismissed for good'); }
      }
    },

    /* ── Disclaimer ─────────────────────────────────────────
       Stated in full once, then compact forever — and the
       compact form has to reopen the full one, or the limits
       were said and then hidden. */
    disclaimer: {
      initial: 'unseen',

      /* Three labelled rows and one standing line. Everything here is
         the WORDS, because that is what a disclaimer is — and the
         named gaps in "cannot see" are the only part anyone acts on,
         so they are editable rather than fixed prose. */
      customize: {
        groups: [
          { id: 'statement', label: 'The statement', states: ['full'],
            controls: [
              { id: 'title', label: 'Title', type: 'text',
                value: 'What Aria can and cannot do' },
              { id: 'intro', label: 'Opening', type: 'text',
                value: 'Aria is an assistant, not a person, and its answers are generated. ' +
                       'Worth knowing before you rely on one:' }
            ] },

          { id: 'rows', label: 'Can, will not, cannot see', states: ['full'],
            note: 'Named gaps. “May be inaccurate” is something readers learn to skip.',
            controls: [
              { id: 'can', label: 'Can', type: 'text',
                value: 'Read your pipeline and the Q2 board pack, and draft replies for you to send.' },
              { id: 'wontDo', label: 'Will not', type: 'text',
                value: 'Send mail, change a record or spend money without you approving it first.' },
              { id: 'cannot', label: 'Cannot see', type: 'text',
                value: 'Anything renewed outside Salesforce, or contracts signed before March.' }
            ] },

          { id: 'ack', label: 'Acknowledgement', states: ['full'],
            controls: [
              { id: 'ackLabel', label: 'Accept', type: 'text', value: 'Got it' },
              { id: 'moreLink', label: 'Offer the detail', type: 'toggle', value: true,
                capability: true },
              { id: 'moreLabel', label: 'Detail label', type: 'text', value: 'Data & retention',
                visibleWhen: function (c) { return !!c.moreLink; } }
            ] },

          { id: 'standing', label: 'Standing line', states: ['standing'],
            note: 'A limit stated once and then made unreachable is a limit nobody has — the line reopens the statement.',
            controls: [
              { id: 'lineText', label: 'Line', type: 'text',
                value: 'Aria can be wrong. Check anything before you send it.' },
              { id: 'lineIcon', label: 'Show the icon', type: 'toggle', value: true }
            ] },

          { id: 'unseen', label: 'Before it is stated', states: ['unseen'],
            controls: [
              { id: 'startLabel', label: 'Trigger', type: 'text', value: 'Start a session' }
            ] }
        ]
      },

      states: {
        unseen:   { label: 'Not yet stated',
                    trigger: 'Before first run.',
                    behaviour: 'The composer is open and nothing has said what this thing is ' +
                               'for or where it stops.',
                    action: 'Show the statement' },
        full:     { label: 'Full statement',
                    trigger: 'First run, before the first request.',
                    behaviour: 'Three labelled rows — can, will not, cannot see — with the ' +
                               'actual gaps named rather than a general warning.',
                    action: 'Acknowledge it' },
        standing: { label: 'Standing line',
                    trigger: 'The statement is acknowledged.',
                    behaviour: 'One compact line beside the composer. The line itself reopens ' +
                               'the full statement — a limit stated once and then made ' +
                               'unreachable is a limit nobody has.',
                    action: 'Reopen it' }
      },
      view: function (s) {
        var c = s.cfg;
        if (s.state === 'unseen') {
          return '' +
'<div class="pv-composer">\n' +
'  <p class="pv-composer__label md-body-small">Ask Aria</p>\n' +
'  <p class="pv-composer__value md-body-large pv-muted">\n' +
'    Nothing has said what this can and cannot do.\n' +
'  </p>\n' +
'  <div class="pv-composer__foot">\n' +
'    <button class="md-button md-button--filled md-button--sm" type="button" data-act="show">\n' +
'      ' + esc(c.startLabel) + '\n' +
'    </button>\n' +
'  </div>\n' +
'</div>';
        }
        if (s.state === 'standing') {
          return '' +
'<div class="pv-composer">\n' +
'  <p class="pv-composer__label md-body-small">Ask Aria</p>\n' +
'  <p class="pv-composer__value md-body-large">How did renewals land in Q2?</p>\n' +
'</div>\n' +
'\n' +
'<!-- beneath the composer, outside it: a footnote to what you are\n' +
'     about to send, not a label on the field -->\n' +
'<button class="md-disclaim-line md-body-small" type="button" data-act="show"\n' +
'        aria-label="What Aria can and cannot do">\n' +
   (c.lineIcon
? '  <svg class="md-disclaim-line__ico" viewBox="0 0 24 24" aria-hidden="true">\n' +
  '    <path d="M12 2.6a9.4 9.4 0 1 0 0 18.8 9.4 9.4 0 0 0 0-18.8Zm.1 4.2v5.6m0 3.1v.1"\n' +
  '          fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>\n' +
  '  </svg>\n' : '') +
'  ' + esc(c.lineText) + '\n' +
'</button>';
        }
        return '' +
'<section class="md-disclaim" role="dialog" aria-labelledby="dc-t" aria-modal="true">\n' +
'  <svg class="md-disclaim__ico" viewBox="0 0 24 24" aria-hidden="true">\n' +
'    <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
'  </svg>\n' +
'  <h2 class="md-disclaim__t md-headline-small" id="dc-t">' + esc(c.title) + '</h2>\n' +
'  <p class="md-disclaim__b md-body-medium">' + esc(c.intro) + '</p>\n' +
'  <ul class="md-disclaim__list md-body-medium">\n' +
'    <li>\n' +
'      <span class="md-disclaim__k">Can</span>\n' +
'      <span>' + esc(c.can) + '</span>\n' +
'    </li>\n' +
'    <li>\n' +
'      <span class="md-disclaim__k">Will not</span>\n' +
'      <span>' + esc(c.wontDo) + '</span>\n' +
'    </li>\n' +
'    <li>\n' +
'      <span class="md-disclaim__k">Cannot see</span>\n' +
'      <span>' + esc(c.cannot) + '</span>\n' +
'    </li>\n' +
'  </ul>\n' +
'  <div class="md-disclaim__foot">\n' +
   (c.moreLink
? '    <button class="md-button md-button--text" type="button">' + esc(c.moreLabel) + '</button>\n' : '') +
'    <button class="md-button md-button--filled" type="button" data-act="ack">' +
   esc(c.ackLabel) + '</button>\n' +
'  </div>\n' +
'</section>';
      },
      act: function (a, ctx) {
        if (a === 'show') { ctx.s.state = 'full'; ctx.paint(); return; }
        if (a === 'ack')  { ctx.s.state = 'standing'; ctx.paint();
                            ctx.announce('Limits acknowledged, statement still reachable'); }
      }
    },
    /* ── Disclosure ─────────────────────────────────────────
       The full loop: nothing → the agent works → the marker
       arrives with the content → the reader opens it → it
       closes back into the chip it came from. */
    disclosure: {
      initial: 'idle',

      /* ── Customize ────────────────────────────────────────
         A STATE-AWARE schema. The panel is not a list of every
         property this component has; it is the list of decisions
         that have an effect on WHAT YOU ARE LOOKING AT.

         Three scopes, declared rather than hard-coded:

           global    always relevant — the surface itself, and the
                     shape language the whole thing inherits.
           states    a group names the states it bites in. In any
                     other state it is not disabled, not greyed,
                     not annotated: it is ABSENT. A control you
                     cannot see is a control you cannot mis-set,
                     and the panel stops being a quiz about which
                     half of it is live.
           capability
                     a group can require a capability toggle. Turn
                     "Opens for detail" off and the detail panel's
                     controls stop existing, because the surface
                     they configure stops existing.

         `visibleWhen(cfg, state)` handles the last case: controls
         whose relevance depends on another control's value.

         Any other pattern gets a customizer by declaring this
         object. No customizer UI is written per pattern. */
      customize: {
        groups: [
          /* ── Always ─────────────────────────────────────── */
          { id: 'surface', label: 'Surface',
            note: 'The product surface the pattern is sitting in.',
            controls: [
              { id: 'density', label: 'Density', type: 'segment', value: 'comfortable',
                options: [['comfortable', 'Comfortable'], ['compact', 'Compact']] }
            ] },

          { id: 'shape', label: 'Shape',
            note: 'One corner token drives the marker and the panel it grows into.',
            controls: [
              /* The values ARE the design system's token names, so what the
                 panel writes, what the markup carries and what the
                 stylesheet resolves are one vocabulary — nothing to
                 translate between, nothing to drift. */
              { id: 'shape', label: 'Corner', type: 'segment', value: 'full',
                options: [['full', 'Full'], ['extra-large', 'X-large'],
                          ['large', 'Large'], ['small', 'Small']],
                hint: 'Material shape tokens, not free pixels — a panel cannot be a pill.' }
            ] },

          /* ── Idle ───────────────────────────────────────── */
          { id: 'trigger', label: 'Trigger', states: ['idle'],
            note: 'The control that produces the generated content.',
            controls: [
              { id: 'trigger', label: 'Label', type: 'text', value: 'Generate summary' },
              { id: 'triggerEmphasis', label: 'Emphasis', type: 'segment', value: 'filled',
                options: [['filled', 'Filled'], ['tonal', 'Tonal'], ['text', 'Text']] },
              { id: 'outcome', label: 'Simulated outcome', type: 'segment', value: 'ok',
                options: [['ok', 'Succeeds'], ['fail', 'Fails']],
                hint: 'What pressing it leads to, so the failure path is inspectable too.' }
            ] },

          /* ── Processing ─────────────────────────────────── */
          { id: 'activity', label: 'Activity', states: ['processing'],
            note: 'How the wait is shown on the surface that will hold the result.',
            controls: [
              { id: 'status', label: 'Status text', type: 'text', value: 'Reading the transcript' },
              { id: 'activity', label: 'Indicator', type: 'segment', value: 'full',
                options: [['full', 'Ring + lines'], ['ring', 'Ring only'], ['text', 'Text only']] },
              { id: 'lines', label: 'Placeholder lines', type: 'range', value: 3,
                min: 1, max: 4, step: 1,
                visibleWhen: function (c) { return c.activity === 'full'; } }
            ] },

          /* ── The marker ─────────────────────────────────── */
          { id: 'marker', label: 'Marker', states: ['generated', 'expanded', 'sources'],
            note: 'What settles in beside the content once it exists.',
            controls: [
              { id: 'label', label: 'Label', type: 'text', value: 'Generated with AI',
                hint: 'Say what happened, not that a model exists.' },
              { id: 'emphasis', label: 'Emphasis', type: 'segment', value: 'tonal',
                options: [['tonal', 'Tonal'], ['outlined', 'Outlined'], ['plain', 'Plain']] },
              { id: 'icon', label: 'Reserved glyph', type: 'toggle', value: true },
              { id: 'placement', label: 'Placement', type: 'segment', value: 'below',
                options: [['above', 'Above'], ['below', 'Below']] }
            ] },

          { id: 'behaviour', label: 'Behaviour', states: ['generated', 'expanded', 'sources'],
            note: 'Whether there is anything behind the marker.',
            controls: [
              { id: 'expandable', label: 'Opens for detail', type: 'toggle', value: true,
                capability: true,
                hint: 'Off makes it a static note, and the detail settings below go with it.' }
            ] },

          /* ── The panel behind it ────────────────────────── */
          { id: 'detail', label: 'Detail panel', states: ['expanded', 'sources'],
            requires: 'expandable',
            note: 'The explanation the chip grows into.',
            controls: [
              { id: 'explain', label: 'Explanation', type: 'text',
                value: 'Written by the Meeting Summary agent from this call’s transcript.' },
              { id: 'check', label: 'Ask for a check', type: 'toggle', value: true,
                hint: 'One line telling the reader what to verify before forwarding.' }
            ] },

          { id: 'sources', label: 'Sources', states: ['sources'],
            requires: 'expandable',
            note: 'What the agent read, and what it did not.',
            controls: [
              { id: 'missed', label: 'Name the gap', type: 'toggle', value: true,
                hint: 'What it could not see is the half that changes how the result is read.' }
            ] },

          /* ── Failure ────────────────────────────────────── */
          { id: 'error', label: 'Failure', states: ['error'],
            note: 'What the surface says when nothing was produced.',
            controls: [
              { id: 'errorText', label: 'Message', type: 'text',
                value: 'The transcript could not be read' },
              { id: 'errorRetry', label: 'Retry label', type: 'text', value: 'Try again' },
              { id: 'errorReason', label: 'Give the reason', type: 'toggle', value: true,
                hint: 'A failure with no cause leaves the reader with nothing to act on.' }
            ] }
        ]
      },

      states: {
        idle: {
          label: 'Idle',
          trigger: 'No agent action has happened yet.',
          behaviour: 'The surface is ordinary. No marker, because there is nothing to mark.',
          action: 'Generate the summary'
        },
        processing: {
          label: 'Processing',
          trigger: 'The agent starts generating.',
          behaviour: 'Activity is visible on the surface that will hold the result. The marker ' +
                     'is not shown yet — there is no generated content to attach it to.',
          action: 'Wait for the result'
        },
        generated: {
          label: 'Generated',
          trigger: 'Generation completes.',
          behaviour: 'The marker settles in beside the content, at its head, so it survives ' +
                     'the content being quoted, forwarded or cut.',
          action: 'Open the marker'
        },
        expanded: {
          label: 'Expanded',
          trigger: 'The reader activates the marker.',
          behaviour: 'The chip grows into a panel in place — same surface, more of it — ' +
                     'carrying what was used, what to check, and where the limits are.',
          action: 'Close it, or read the sources'
        },
        sources: {
          label: 'Sources',
          trigger: 'The reader asks how it was generated.',
          behaviour: 'The inputs are named individually, with what the agent did to them and ' +
                     'what it could not see.',
          action: 'Close it'
        },
        error: {
          label: 'Error',
          trigger: 'Generation fails, or is refused.',
          behaviour: 'Nothing is marked, because nothing was produced. The surface says what ' +
                     'went wrong and leaves the way back in.',
          action: 'Try again'
        }
      },

      view: function (s) {
        var c = s.cfg;

        /* ONE surface for every state. Idle, Processing, Generated,
           Expanded, Sources and Error all open with this string, so a
           global setting — density, shape — is global by construction
           rather than by six copies agreeing with each other.

           The shape travels as a TOKEN NAME, not a pixel value. Each
           role then resolves it in the stylesheet: the card takes the
           container interpretation (capped at extra-large, because a
           card is not a pill), the marker takes the chip one. */
        var card = '<article class="pv-card' +
                   (c.density === 'compact' ? ' pv-card--compact' : '') + '"' +
                   ' data-shape="' + c.shape + '"';
        var head =
'  <h3 class="pv-card__title md-title-medium">Weekly team sync</h3>\n' +
'  <p class="pv-card__meta md-body-small">42 minutes &middot; 5 participants</p>\n';

        if (s.state === 'idle') {
          var emph = c.triggerEmphasis === 'text' ? 'text'
                   : c.triggerEmphasis === 'tonal' ? 'tonal' : 'filled';
          return '' +
card + '>\n' + head +
'  <p class="pv-card__empty md-body-medium">No summary yet.</p>\n' +
'  <button class="md-button md-button--' + emph + ' md-button--sm" type="button" data-act="gen">\n' +
'    ' + esc(c.trigger) + '\n' +
'  </button>\n' +
'</article>';
        }

        if (s.state === 'processing') {
          var lines = '';
          for (var i = 0; i < c.lines; i++) lines += '<span></span>';
          return '' +
card + ' aria-busy="true">\n' + head +
'  <div class="pv-status" role="status">\n' +
   (c.activity === 'text' ? '' :
'    <span class="pv-status__ring" aria-hidden="true"></span>\n') +
'    <span class="md-body-medium">' + esc(c.status) + '&hellip;</span>\n' +
'  </div>\n' +
   (c.activity === 'full'
? '  <div class="pv-skeleton" aria-hidden="true">\n' +
  '    ' + lines + '\n' +
  '  </div>\n' : '') +
'</article>';
        }

        if (s.state === 'error') {
          return '' +
card + '>\n' + head +
'  <div class="pv-error" role="alert">\n' +
'    <svg class="pv-error__ico" viewBox="0 0 24 24" aria-hidden="true">\n' +
'      <path d="M12 3 22 20H2Zm0 6v5m0 3v.5"/>\n' +
'    </svg>\n' +
'    <div>\n' +
'      <p class="md-body-medium">' + esc(c.errorText) + '</p>\n' +
   (c.errorReason
? '      <p class="pv-error__why md-body-small">The last four minutes of audio were missing, so\n' +
  '         no summary was written rather than a partial one.</p>\n' : '') +
'    </div>\n' +
'  </div>\n' +
'  <button class="md-button md-button--outlined md-button--sm" type="button" data-act="retry">\n' +
'    ' + esc(c.errorRetry) + '\n' +
'  </button>\n' +
'</article>';
        }

        var open = s.state === 'expanded' || s.state === 'sources';

        var glyph = c.icon
          ? '      <svg class="pv-disclose__ico" viewBox="0 0 24 24" aria-hidden="true">\n' +
            '        <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
            '      </svg>\n'
          : '';

        var chev = c.expandable
          ? '      <svg class="pv-disclose__chev" viewBox="0 0 24 24" aria-hidden="true">\n' +
            '        <path d="M6 9.5 12 15.5 18 9.5"/>\n' +
            '      </svg>\n'
          : '';

        /* Not expandable means not a button: a control that opens
           nothing should not be focusable or announce itself as
           pressable. The markup changes shape, not just its classes. */
        var chip = c.expandable
          ? '    <button class="pv-disclose__chip pv-disclose__chip--' + c.emphasis + '" type="button"\n' +
            '            data-act="' + (open ? 'dismiss' : 'expand') + '"\n' +
            '            aria-expanded="' + open + '" aria-controls="pv-disclose-detail">\n' +
            glyph +
            '      <span class="md-label-medium">' + esc(c.label) + '</span>\n' +
            chev +
            '    </button>\n'
          : '    <span class="pv-disclose__chip pv-disclose__chip--' + c.emphasis + '" role="note">\n' +
            glyph +
            '      <span class="md-label-medium">' + esc(c.label) + '</span>\n' +
            '    </span>\n';

        var detail = c.expandable
          ? '\n' +
            '    <div class="pv-disclose__detail" id="pv-disclose-detail" role="region">\n' +
            '      <div class="pv-disclose__inner">\n' +
            '        <p class="md-body-medium">\n' +
            '          ' + esc(c.explain) + '\n' +
                 (c.check
? '          Check names and dates before you forward it.\n' : '') +
            '        </p>\n' +
                 (s.state === 'sources'
? '        <ul class="pv-sources md-body-small">\n' +
  '          <li><span class="pv-sources__k">Read</span>Transcript &middot; 42 min, auto-captioned</li>\n' +
  '          <li><span class="pv-sources__k">Read</span>Agenda in the calendar invite</li>\n' +
   (c.missed
? '          <li><span class="pv-sources__k">Missed</span>The last four minutes &mdash; audio dropped</li>\n' : '') +
  '        </ul>\n'
: '        <button class="md-button md-button--text md-button--sm" type="button" data-act="sources">\n' +
  '          How this was generated\n' +
  '        </button>\n') +
            '      </div>\n' +
            '    </div>\n'
          : '';

        var marker =
'  <!-- The disclosure surface. Compact and expanded are the SAME\n' +
'       element in two states, so the panel grows out of the chip\n' +
'       rather than appearing beside it. It carries the same shape\n' +
'       token as the card it sits in. -->\n' +
'  <div class="pv-disclose" data-open="' + open + '" data-shape="' + c.shape + '">\n' +
   chip + detail +
'  </div>\n';

        var body =
'  <p class="pv-card__body md-body-medium">\n' +
'    Renewals are the blocker for Q2. Dana owns the enterprise tier and will\n' +
'    bring numbers on Thursday; nothing else is waiting on a decision.\n' +
'  </p>\n';

        return '' +
card + '>\n' + head +
   (c.placement === 'above' ? marker + body : body + marker) +
'</article>';
      },

      act: async function (a, ctx) {
        var s = ctx.s;
        if (a === 'gen' || a === 'retry') {
          s.state = 'processing'; ctx.paint();
          await wait(1400);
          if (a === 'gen' && ctx.cfg().outcome === 'fail') {
            s.state = 'error'; ctx.paint();
            ctx.announce('Generation failed');
            return;
          }
          s.state = 'generated'; ctx.paint();
          ctx.announce('Summary generated, marked as AI generated');
          return;
        }
        /* Expand and dismiss are the same container changing size, so
           they are mutated in place and repainted after the motion. */
        if (a === 'expand')   { return ctx.morph('expanded', function (root) {
          var d = root.querySelector('.pv-disclose'); if (d) d.dataset.open = 'true';
        }); }
        if (a === 'dismiss')  { return ctx.morph('generated', function (root) {
          var d = root.querySelector('.pv-disclose'); if (d) d.dataset.open = 'false';
        }); }
        if (a === 'sources')  { s.state = 'sources'; ctx.paint(); }
      }
    },

    /* ── Consent ────────────────────────────────────────────── */
    consent: {
      initial: 'idle',

      /* Consent's own decisions. Nothing here is borrowed from
         Disclosure: there is no activity indicator, because nothing
         is generated; there is no marker, because nothing is marked.
         What a permission request actually has to decide is what it
         asks for, how it says why, what the two answers are called,
         and whether a no can be undone. */
      customize: {
        groups: [
          { id: 'surface', label: 'Surface',
            note: 'The shape the request and its aftermath share.',
            controls: [
              { id: 'shape', label: 'Corner', type: 'segment', value: 'extra-large',
                options: [['extra-large', 'X-large'], ['large', 'Large'],
                          ['medium', 'Medium']] }
            ] },

          { id: 'lead', label: 'Before the ask', states: ['idle'],
            note: 'What the surface says while nothing has been requested.',
            controls: [
              { id: 'idleLead', label: 'Line', type: 'text',
                value: 'Ask Aria for something outside what it already holds.' },
              { id: 'idleNote', label: 'Note', type: 'text',
                value: 'Nothing is requested until a task needs it.' }
            ] },

          { id: 'request', label: 'The request', states: ['requested'],
            note: 'Say what is needed and why, in the words of the task at hand.',
            controls: [
              { id: 'title', label: 'Title', type: 'text',
                value: 'Aria needs access to answer this' },
              { id: 'subtitle', label: 'Subtitle', type: 'text',
                value: 'Grant what you are comfortable with. You can change this later.' },
              { id: 'reason', label: 'Reason on the scope', type: 'text',
                value: 'To find the deals behind the number you asked about',
                hint: 'The reason is the row that turns a permission list into a request.' }
            ] },

          { id: 'scopes', label: 'Scopes', states: ['requested'],
            note: 'One row per source. Asking for more than the task needs is how a request gets dismissed.',
            controls: [
              { id: 'showUnneeded', label: 'Show a scope it is not asking for',
                type: 'toggle', value: true,
                hint: 'Naming what it does NOT need is what makes the rest credible.' },
              { id: 'unneededName', label: 'Its label', type: 'text',
                value: 'Send email on your behalf',
                visibleWhen: function (c) { return !!c.showUnneeded; } }
            ] },

          { id: 'actions', label: 'Actions', states: ['requested'],
            note: 'Both answers named. "Not now" is a real answer, not a cancel.',
            controls: [
              { id: 'allowLabel', label: 'Allow', type: 'text', value: 'Allow selected' },
              { id: 'denyLabel', label: 'Decline', type: 'text', value: 'Not now' },
              { id: 'denyEmphasis', label: 'Decline emphasis', type: 'segment', value: 'text',
                options: [['text', 'Text'], ['outlined', 'Outlined']] }
            ] },

          { id: 'granted', label: 'Standing grant', states: ['granted'],
            note: 'What was allowed, kept visible after the moment has passed.',
            controls: [
              { id: 'grantedTitle', label: 'Heading', type: 'text',
                value: 'Aria can currently see' },
              { id: 'revocable', label: 'Each grant can be taken back',
                type: 'toggle', value: true, capability: true,
                hint: 'Off makes the list a receipt rather than a control.' }
            ] },

          { id: 'refused', label: 'After a no', states: ['declined', 'revoked'],
            note: 'What the agent says it lost. Declining is never a dead end.',
            controls: [
              { id: 'declinedText', label: 'Declined line', type: 'text',
                value: 'Understood — I will leave Salesforce alone.',
                visibleWhen: function (c, state) { return state === 'declined'; } },
              { id: 'revokedText', label: 'Revoked line', type: 'text',
                value: 'Salesforce access ended.',
                visibleWhen: function (c, state) { return state === 'revoked'; } },
              { id: 'consequence', label: 'Name the consequence', type: 'toggle', value: true,
                hint: 'What it can still do, and how much worse that answer is.' },
              { id: 'askAgainLabel', label: 'Way back in', type: 'text',
                value: 'Ask me again' }
            ] }
        ]
      },

      states: {
        idle:      { label: 'Idle',
                     trigger: 'The agent has not needed anything it does not already hold.',
                     behaviour: 'Nothing is asked. A permission request with no task behind it ' +
                                'is a dialog people learn to dismiss.',
                     action: 'Ask for something it cannot see' },
        requested: { label: 'Requested',
                     trigger: 'A task needs a source that was never granted.',
                     behaviour: 'A scoped request rises into place, one row per source, each ' +
                                'with the reason it is being asked for.',
                     action: 'Allow, or decline' },
        granted:   { label: 'Granted',
                     trigger: 'The reader allows what they selected.',
                     behaviour: 'The grant becomes a standing, visible list — and each item ' +
                                'carries its own way back out.',
                     action: 'Revoke a source' },
        declined:  { label: 'Declined',
                     trigger: 'The reader declines.',
                     behaviour: 'The agent continues in a smaller form and says exactly what ' +
                                'it lost. Declining is never a dead end.',
                     action: 'Ask again' },
        revoked:   { label: 'Revoked',
                     trigger: 'A granted source is taken back.',
                     behaviour: 'Access ends immediately and the agent states the consequence ' +
                                'rather than quietly getting worse.',
                     action: 'Ask again' }
      },
      view: function (s) {
        var c = s.cfg;
        var shape = ' data-shape="' + c.shape + '"';

        if (s.state === 'idle') {
          return '' +
'<div class="pv-card pv-card--quiet"' + shape + '>\n' +
'  <p class="md-body-medium">' + esc(c.idleLead) + '</p>\n' +
'  <p class="pv-card__meta md-body-small">' + esc(c.idleNote) + '</p>\n' +
'</div>';
        }
        if (s.state === 'requested') {
          return '' +
'<section class="pv-consent" role="dialog" aria-labelledby="pv-consent-t"' + shape + '>\n' +
'  <span class="pv-consent__k md-label-small">Permission</span>\n' +
'  <h3 class="pv-consent__t md-title-medium" id="pv-consent-t">\n' +
'    ' + esc(c.title) + '\n' +
'  </h3>\n' +
'  <p class="pv-consent__s md-body-small">' + esc(c.subtitle) + '</p>\n' +
'  <ul class="m3-scopes">\n' +
'    <li class="m3-scope">\n' +
'      <div>\n' +
'        <div class="m3-scope__n">Salesforce &mdash; pipeline, read only</div>\n' +
'        <div class="m3-scope__d">' + esc(c.reason) + '</div>\n' +
'      </div>\n' +
'      <button class="m3-toggle is-on" type="button" role="switch" aria-checked="true">\n' +
'        <span class="m3-toggle__knob"></span>\n' +
'      </button>\n' +
'    </li>\n' +
   (c.showUnneeded
? '    <li class="m3-scope">\n' +
  '      <div>\n' +
  '        <div class="m3-scope__n">' + esc(c.unneededName) + '</div>\n' +
  '        <div class="m3-scope__d">Not needed for this answer</div>\n' +
  '      </div>\n' +
  '      <button class="m3-toggle" type="button" role="switch" aria-checked="false">\n' +
  '        <span class="m3-toggle__knob"></span>\n' +
  '      </button>\n' +
  '    </li>\n' : '') +
'  </ul>\n' +
'  <div class="pv-consent__foot">\n' +
'    <button class="md-button md-button--filled md-button--sm" type="button" data-act="allow">\n' +
'      ' + esc(c.allowLabel) + '\n' +
'    </button>\n' +
'    <button class="md-button md-button--' + c.denyEmphasis + ' md-button--sm" type="button" data-act="deny">\n' +
'      ' + esc(c.denyLabel) + '\n' +
'    </button>\n' +
'  </div>\n' +
'</section>';
        }
        if (s.state === 'declined' || s.state === 'revoked') {
          return '' +
'<div class="pv-card pv-card--quiet" role="status"' + shape + '>\n' +
'  <p class="md-body-medium">' +
    esc(s.state === 'declined' ? c.declinedText : c.revokedText) + '</p>\n' +
   (c.consequence
? '  <p class="pv-card__meta md-body-small">\n' +
  '    I can still answer from the board pack, which is three weeks old, and I will\n' +
  '    say so every time I use it.\n' +
  '  </p>\n' : '') +
'  <button class="md-button md-button--outlined md-button--sm" type="button" data-act="ask">\n' +
'    ' + esc(c.askAgainLabel) + '\n' +
'  </button>\n' +
'</div>';
        }
        return '' +
'<div class="m3-granted" role="status"' + shape + '>\n' +
'  <div class="m3-granted__head">\n' +
'    <span class="m3-granted__t">' + esc(c.grantedTitle) + '</span>\n' +
'  </div>\n' +
'  <div class="m3-chips">\n' +
'    <span class="m3-chip">Salesforce pipeline\n' +
   (c.revocable
? '      <button class="m3-chip__x" type="button" data-act="revoke"\n' +
  '              aria-label="Revoke Salesforce access">&times;</button>\n' : '') +
'    </span>\n' +
'    <span class="m3-chip m3-chip--off">Email sending &mdash; off</span>\n' +
'  </div>\n' +
'</div>';
      },
      act: async function (a, ctx) {
        var s = ctx.s;
        if (a === 'ask')    { s.state = 'requested'; ctx.paint(); ctx.announce('Permission requested'); return; }
        if (a === 'allow')  { s.state = 'granted';   ctx.paint(); ctx.announce('Access granted'); return; }
        if (a === 'deny')   { s.state = 'declined';  ctx.paint(); ctx.announce('Access declined'); return; }
        if (a === 'revoke') { s.state = 'revoked';   ctx.paint(); ctx.announce('Access revoked'); }
      }
    },

    /* ── Caveat ─────────────────────────────────────────────
       Off → under the input → repeated under output that is
       about to leave the product → riding the action itself.
       The pattern is one line of muted text; what changes
       between states is WHERE it sits, which is the whole
       design decision. */
    caveat: {
      initial: 'off',

      /* Caveat is one line of muted text. What there is to decide is
         what it SAYS and where it sits — so the schema is content and
         placement, and there is nothing here about surfaces, actions
         or activity, because the pattern has none of those.

         'Absent' deliberately declares nothing: it is the state where
         no reminder exists, so there is nothing to configure, and the
         panel says so rather than offering controls that write into
         markup that is not on screen. */
      customize: {
        groups: [
          { id: 'presentation', label: 'Presentation',
            states: ['input', 'output', 'specific'],
            note: 'A reminder, not a warning. Muted by default; caution only where the risk is real.',
            controls: [
              { id: 'showIcon', label: 'Show the icon', type: 'toggle', value: true,
                capability: true },
              { id: 'tone', label: 'Tone', type: 'segment', value: 'informational',
                options: [['informational', 'Informational'], ['caution', 'Caution']],
                hint: 'Caution earns colour. Every caption in the product carrying it does not.' }
            ] },

          { id: 'composer', label: 'Under the input', states: ['input'],
            note: 'Present every session, read before anything is sent.',
            controls: [
              { id: 'inputText', label: 'Caption', type: 'text',
                value: 'Aria can make mistakes. Check anything important before you use it.' }
            ] },

          { id: 'output', label: 'Under the output', states: ['output'],
            note: 'The same reminder, repeated where the output is about to leave.',
            controls: [
              { id: 'outputText', label: 'Caption', type: 'text',
                value: 'Generated summary — verify before sharing.' }
            ] },

          { id: 'gap', label: 'The named gap', states: ['specific'],
            note: 'A gap you can act on beats “may contain errors”, which readers learn to skip.',
            controls: [
              { id: 'gapText', label: 'What was missed', type: 'text',
                value: 'Two accounts renewed outside Salesforce and are not counted here — ' +
                       'including them would move this by about a point.' }
            ] },

          { id: 'onAction', label: 'On the action', states: ['action'],
            note: 'The reminder rides the control, on hover and on focus.',
            controls: [
              { id: 'tipText', label: 'Tooltip', type: 'text',
                value: 'Output may be inaccurate — check it before you send.' },
              { id: 'actionLabel', label: 'Button', type: 'text', value: 'Generate' }
            ] }
        ]
      },

      states: {
        off:      { label: 'Absent',
                    trigger: 'Nothing has been said about the reliability of the output.',
                    behaviour: 'A composer with no reminder. Every session starts with the ' +
                               'user assuming whatever they assumed last time.',
                    action: 'Put it under the input' },
        input:    { label: 'Below the input',
                    trigger: 'The default placement.',
                    behaviour: 'A caption under the composer, present every session, read ' +
                               'before anything is sent. Muted, never alarming.',
                    action: 'Repeat it under output' },
        output:   { label: 'Under the output',
                    trigger: 'Output is about to be sent, published or deployed.',
                    behaviour: 'The reminder repeats where the risk actually is, on a ground ' +
                               'so it separates from the content it qualifies.',
                    action: 'Try it on the action instead' },
        action:   { label: 'On the action',
                    trigger: 'The surface is too dense for a standing caption.',
                    behaviour: 'The reminder rides the generate control, on hover and on ' +
                               'focus, so it is never in the way and never unreachable.',
                    action: 'See the specific form' },
        specific: { label: 'Naming the gap',
                    trigger: 'The agent knows what it could not see.',
                    behaviour: 'The strongest version of the same reminder: a named gap is ' +
                               'actionable, where “may contain errors” is something readers ' +
                               'learn to skip.',
                    action: 'Back to the default' }
      },
      view: function (s) {
        var c = s.cfg;
        var ICO = c.showIcon
          ? '    <svg class="md-caveat__ico" viewBox="0 0 24 24" aria-hidden="true">\n' +
            '      <circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6v.1"/>\n' +
            '    </svg>\n'
          : '';
        var tone = c.tone === 'caution' ? ' md-caveat--caution' : '';

        if (s.state === 'off' || s.state === 'input') {
          return '' +
'<div class="md-composer">\n' +
'  <p class="md-composer__field md-body-medium">Ask Aria anything&hellip;</p>\n' +
   (s.state === 'input'
? '  <p class="md-caveat' + tone + ' md-body-small" role="note">\n' + ICO +
'    ' + esc(c.inputText) + '\n' +
'  </p>\n' : '') +
'</div>';
        }

        if (s.state === 'action') {
          return '' +
'<div class="md-caveat-action">\n' +
'  <button class="md-button md-button--filled md-button--sm" type="button"\n' +
'          aria-describedby="cav-tip">\n' +
'    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">\n' +
'      <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
'    </svg>\n' +
'    ' + esc(c.actionLabel) + '\n' +
'  </button>\n' +
'  <span class="md-caveat-tip md-body-small" id="cav-tip" role="tooltip">\n' +
'    ' + esc(c.tipText) + '\n' +
'  </span>\n' +
'</div>';
        }

        return '' +
'<div class="m3-answer">\n' +
'  <p class="m3-answer__text">\n' +
'    Renewals are tracking at <b>94%</b> for the quarter, up four points on Q1.\n' +
'    Enterprise accounts drive almost all of the improvement.\n' +
'  </p>\n' +
'  <p class="md-caveat md-caveat--boxed' + tone + ' md-body-small" role="note">\n' + ICO +
'    ' + esc(s.state === 'specific' ? c.gapText : c.outputText) + '\n' +
'  </p>\n' +
'</div>';
      },
      act: function () {}
    },
    /* ── Avatar ─────────────────────────────────────────────── */
    avatar: {
      initial: 'ready',

      /* An agent mark has no content and no actions, so there is
         nothing here about labels, emphasis or activity indicators.
         What it decides is size, whether the disclosure chip rides
         alongside, and what the line under it says in each state —
         which is different in each state, and so lives there. */
      customize: {
        groups: [
          { id: 'mark', label: 'The mark',
            note: 'A container role with the reserved glyph — never a face, never initials.',
            controls: [
              { id: 'size', label: 'Size', type: 'segment', value: 'md',
                options: [['sm', 'Small'], ['md', 'Medium'], ['lg', 'Large']] },
              /* A stood-down agent shows no chip at all, so the control
                 has nothing to do there and is not offered there. */
              { id: 'chip', label: 'Show the disclosure chip', type: 'toggle', value: true,
                hint: 'The mark says which agent. The chip says it is one.',
                visibleWhen: function (c, state) { return state !== 'off'; } }
            ] },

          { id: 'identity', label: 'Identity',
            controls: [
              { id: 'name', label: 'Name', type: 'text', value: 'Aria' }
            ] },

          { id: 'ready', label: 'At rest', states: ['ready'],
            controls: [
              { id: 'readyLine', label: 'Line', type: 'text',
                value: 'Assistant · answers from your pipeline' }
            ] },

          { id: 'working', label: 'Working', states: ['working'],
            note: 'State belongs on the thing whose state it is, not on a spinner elsewhere.',
            controls: [
              { id: 'workingLine', label: 'Line', type: 'text',
                value: 'Reading the pipeline…' }
            ] },

          { id: 'answered', label: 'Answered', states: ['answered'],
            controls: [
              { id: 'answeredLine', label: 'Line', type: 'text',
                value: '£4.1m, 6% ahead of plan.' }
            ] },

          { id: 'handover', label: 'The person', states: ['handed'],
            note: 'Both marks on screen at once — the only test that matters is telling them apart.',
            controls: [
              { id: 'humanName', label: 'Name', type: 'text', value: 'Dana Khoury' },
              { id: 'humanInitials', label: 'Initials', type: 'text', value: 'DK' },
              { id: 'humanRole', label: 'Role', type: 'text',
                value: 'Revenue operations · now assigned' }
            ] },

          { id: 'stooddown', label: 'Stood down', states: ['off'],
            note: 'Muted rather than gone, so absence is legible instead of looking broken.',
            controls: [
              { id: 'offLine', label: 'Line', type: 'text', value: 'Off for this ticket' }
            ] }
        ]
      },

      states: {
        ready:    { label: 'Ready',
                    trigger: 'The agent is available and idle.',
                    behaviour: 'The mark sits at rest: a container role with the reserved glyph, ' +
                               'never a face and never initials.',
                    action: 'Set it working' },
        working:  { label: 'Working',
                    trigger: 'The agent starts a task.',
                    behaviour: 'A ring runs on the mark itself. State belongs on the thing whose ' +
                               'state it is, not on a spinner somewhere else.',
                    action: 'Finish, or hand over' },
        answered: { label: 'Answered',
                    trigger: 'The task completes.',
                    behaviour: 'The ring stops immediately. Motion that outlives the work it ' +
                               'described is decoration.',
                    action: 'Hand to a person' },
        handed:   { label: 'Handed over',
                    trigger: 'A person takes the thread.',
                    behaviour: 'Both marks are on screen at once — the only test that matters ' +
                               'is whether you can tell them apart at a glance.',
                    action: 'Stand the agent down' },
        off:      { label: 'Stood down',
                    trigger: 'The agent is switched off for this surface.',
                    behaviour: 'The mark stays, muted, so its absence is legible rather than ' +
                               'looking like a loading failure.',
                    action: 'Bring it back' }
      },
      view: function (s) {
        var c = s.cfg;
        var size = c.size === 'sm' ? ' md-agentav--sm' : c.size === 'lg' ? ' md-agentav--lg' : '';
        var cls = size +
                  (s.state === 'working' ? ' md-agentav--thinking'
                 : s.state === 'off'     ? ' md-agentav--muted' : '');
        var line = s.state === 'working'  ? esc(c.workingLine)
                 : s.state === 'off'      ? esc(c.offLine)
                 : s.state === 'handed'   ? 'Answered, then handed over'
                 : s.state === 'answered' ? esc(c.answeredLine)
                 : esc(c.readyLine);

        return '' +
'<div class="md-idstack">\n' +
'  <div class="md-idrow">\n' +
'    <span class="md-agentav' + cls + '"' +
       (s.state === 'working'
         ? ' role="status" aria-label="' + esc(c.name) + ' is working"'
         : ' aria-hidden="true"') + '>\n' +
'      <svg viewBox="0 0 24 24">\n' +
'        <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
'      </svg>\n' +
'    </span>\n' +
'    <div>\n' +
'      <p class="md-idrow__name md-body-large">' + esc(c.name) + '\n' +
       (s.state === 'off' || !c.chip ? '' :
'        <span class="md-assist-chip md-assist-chip--tonal">AI generated</span>\n') +
'      </p>\n' +
'      <p class="md-idrow__sub md-body-medium">' + line + '</p>\n' +
'    </div>\n' +
'  </div>\n' +
   (s.state === 'handed'
? '\n' +
'  <div class="md-idrow">\n' +
'    <span class="md-agentav' + size + ' md-agentav--human" aria-hidden="true">' +
     esc(c.humanInitials) + '</span>\n' +
'    <div>\n' +
'      <p class="md-idrow__name md-body-large">' + esc(c.humanName) + '</p>\n' +
'      <p class="md-idrow__sub md-body-medium">' + esc(c.humanRole) + '</p>\n' +
'    </div>\n' +
'  </div>\n' : '') +
'</div>';
      },
      act: async function (a, ctx) {
        var s = ctx.s;
        if (a === 'off')  { s.state = s.state === 'off' ? 'ready' : 'off'; ctx.paint(); return; }
        if (a === 'hand') { s.state = s.state === 'handed' ? 'ready' : 'handed'; ctx.paint(); return; }
        if (a === 'work') {
          s.state = 'working'; ctx.paint(); ctx.announce('Working');
          await wait(1600);
          if (s.state === 'working') { s.state = 'answered'; ctx.paint(); ctx.announce('Answered'); }
        }
      }
    },

    /* ── Name ───────────────────────────────────────────────── */
    name: {
      initial: 'unknown',

      /* A name is words. The schema is the words, plus whether the
         name is allowed to open into what it can reach — because a
         name that cannot answer "what can it see?" is decoration. */
      customize: {
        groups: [
          { id: 'identity', label: 'Identity',
            states: ['introduced', 'detail', 'attributed'],
            note: 'The name never carries the disclosure on its own; the role line does that.',
            controls: [
              { id: 'name', label: 'Name', type: 'text', value: 'Aria' },
              /* The attribution trace carries the name and a timestamp,
                 never the role line — so the control stays behind. */
              { id: 'role', label: 'Role line', type: 'text',
                value: 'Assistant in Helpdesk · not a person',
                visibleWhen: function (c, state) { return state !== 'attributed'; } }
            ] },

          { id: 'unnamed', label: 'Before the introduction', states: ['unknown'],
            note: 'Nothing here can be reported, praised or complained about by name.',
            controls: [
              { id: 'unknownLabel', label: 'Generic label', type: 'text',
                value: 'The assistant' }
            ] },

          { id: 'card', label: 'Introduction card', states: ['introduced', 'detail'],
            controls: [
              { id: 'chipLabel', label: 'Chip', type: 'text', value: 'AI assistant' },
              { id: 'openable', label: 'Opens into its scope', type: 'toggle', value: true,
                capability: true,
                hint: 'Off leaves the name with nothing behind it.' }
            ] },

          { id: 'scope', label: 'What it can reach', states: ['detail'],
            requires: 'openable',
            note: 'Two things it can see and one it cannot. The last line is the one that is believed.',
            controls: [
              { id: 'fact1', label: 'First', type: 'text',
                value: 'Salesforce pipeline, read only' },
              { id: 'fact2', label: 'Second', type: 'text',
                value: 'The Q2 board pack in Drive' },
              { id: 'limit', label: 'The limit', type: 'text',
                value: 'Cannot send mail without you' }
            ] },

          { id: 'trace', label: 'Attribution', states: ['attributed'],
            note: 'The same name weeks later, in a record it touched — where a consistent name pays for itself.',
            controls: [
              { id: 'fieldLabel', label: 'Field', type: 'text', value: 'Account summary' },
              { id: 'stamp', label: 'Byline', type: 'text', value: '14 March, 10:24' }
            ] }
        ]
      },

      states: {
        unknown:    { label: 'Unnamed',
                      trigger: 'The agent has not been introduced.',
                      behaviour: 'Generic labelling. Nothing here can be referred to in a bug ' +
                                 'report, a support ticket or a sentence.',
                      action: 'Introduce it' },
        introduced: { label: 'Introduced',
                      trigger: 'First meeting.',
                      behaviour: 'The name arrives with a role line underneath. The name is ' +
                                 'never asked to carry the disclosure on its own.',
                      action: 'Open what it can see' },
        detail:     { label: 'Scope shown',
                      trigger: 'The reader asks what it can see.',
                      behaviour: 'The card grows in place to list what the named thing actually ' +
                                 'reaches — the name and the scope stay attached.',
                      action: 'Close it' },
        attributed: { label: 'Attributed',
                      trigger: 'The agent leaves a trace somewhere else in the product.',
                      behaviour: 'The same name appears in a record it touched weeks ago, which ' +
                                 'is where a consistent name pays for itself.',
                      action: 'Back to the introduction' }
      },
      view: function (s) {
        if (s.state === 'unknown') {
          return '' +
'<div class="pv-card pv-card--quiet">\n' +
'  <p class="md-body-medium">' + esc(s.cfg.unknownLabel) + '</p>\n' +
'  <p class="pv-card__meta md-body-small">\n' +
'    Unnamed. Nothing here can be reported, praised or complained about by name.\n' +
'  </p>\n' +
'</div>';
        }
        if (s.state === 'attributed') {
          return '' +
'<div class="md-field">\n' +
'  <label class="md-field__label md-body-small">' + esc(s.cfg.fieldLabel) + '</label>\n' +
'  <p class="md-field__value md-body-large">\n' +
'    Renewal risk moved to <b>medium</b> after two support escalations in March.\n' +
'  </p>\n' +
'  <div class="md-field__foot">\n' +
'    <span class="md-agentav md-agentav--sm" aria-hidden="true">\n' +
'      <svg viewBox="0 0 24 24">\n' +
'        <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
'      </svg>\n' +
'    </span>\n' +
'    <span class="md-body-small">Written by ' + esc(s.cfg.name) + ' &middot; ' +
       esc(s.cfg.stamp) + '</span>\n' +
'  </div>\n' +
'</div>';
        }
        var open = s.state === 'detail';
        var c = s.cfg;
        return '' +
'<div class="md-idcard pv-namecard" data-open="' + open + '">\n' +
'  <div class="md-idcard__head">\n' +
'    <span class="md-agentav md-agentav--lg" aria-hidden="true">\n' +
'      <svg viewBox="0 0 24 24">\n' +
'        <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
'      </svg>\n' +
'    </span>\n' +
'    <div>\n' +
'      <p class="md-idcard__name md-title-medium">' + esc(c.name) + '</p>\n' +
'      <p class="md-idcard__role md-body-medium">' + esc(c.role) + '</p>\n' +
'    </div>\n' +
'  </div>\n' +
'\n' +
   (c.openable
? '  <div class="pv-namecard__detail" role="region">\n' +
  '    <div class="pv-namecard__inner">\n' +
  '      <ul class="md-facts md-body-medium">\n' +
  '        <li><span class="md-facts__bullet"></span>' + esc(c.fact1) + '</li>\n' +
  '        <li><span class="md-facts__bullet"></span>' + esc(c.fact2) + '</li>\n' +
  '        <li><span class="md-facts__bullet"></span>' + esc(c.limit) + '</li>\n' +
  '      </ul>\n' +
  '    </div>\n' +
  '  </div>\n' : '') +
'\n' +
'  <div class="md-idcard__foot">\n' +
'    <span class="md-assist-chip md-assist-chip--tonal">' + esc(c.chipLabel) + '</span>\n' +
   (c.openable
? '    <button class="md-button md-button--text md-button--sm md-idcard__spacer" type="button"\n' +
  '            data-act="' + (open ? 'intro' : 'detail') + '" aria-expanded="' + open + '">\n' +
  '      ' + (open ? 'Hide what ' + esc(c.name) + ' can see'
                  : 'What ' + esc(c.name) + ' can see') + '\n' +
  '    </button>\n' : '') +
'  </div>\n' +
'</div>';
      },
      act: function (a, ctx) {
        var s = ctx.s;
        if (a === 'attr')  { s.state = 'attributed'; ctx.paint(); return; }
        if (a === 'detail') {
          if (s.state !== 'introduced') { s.state = 'detail'; ctx.paint(); return; }
          return ctx.morph('detail', function (root) {
            var c = root.querySelector('.pv-namecard'); if (c) c.dataset.open = 'true';
          });
        }
        if (a === 'intro') {
          if (s.state === 'detail') {
            return ctx.morph('introduced', function (root) {
              var c = root.querySelector('.pv-namecard'); if (c) c.dataset.open = 'false';
            });
          }
          s.state = 'introduced'; ctx.paint();
        }
      }
    },

    /* ── Personality ────────────────────────────────────────── */
    personality: {
      initial: 'brief',

      /* Voice is words, so the schema is the words — one answer per
         register, each editable on its own. Nothing here claims to
         change what the model is; it changes what this surface says,
         which is the only thing a pattern library can hold. */
      customize: {
        groups: [
          { id: 'speaker', label: 'Speaker',
            controls: [
              { id: 'name', label: 'Name', type: 'text', value: 'Aria' },
              { id: 'chip', label: 'Show the disclosure chip', type: 'toggle', value: true }
            ] },

          { id: 'brief', label: 'Brief register', states: ['brief'],
            note: 'Answer first, nothing after it. Length is the reader’s setting.',
            controls: [
              { id: 'briefText', label: 'Answer', type: 'text',
                value: '94% renewal rate. Two accounts missing.' }
            ] },

          { id: 'full', label: 'Explanatory register', states: ['full'],
            note: 'Same voice, more of it — the answer still comes first.',
            controls: [
              { id: 'fullText', label: 'Answer', type: 'text',
                value: 'Renewals closed at 94%, four points up on Q1. Northwind and Contoso ' +
                       'renewed outside Salesforce, so they are not counted here.' }
            ] },

          { id: 'failure', label: 'Under failure', states: ['failure'],
            note: 'The real test: same directness, no grovelling, a next step instead of an apology.',
            controls: [
              { id: 'failText', label: 'Answer', type: 'text',
                value: 'Salesforce timed out, so I have nothing for Q2 yet. I can retry, or ' +
                       'answer from the board pack — which is three weeks old.' }
            ] },

          { id: 'offvoice', label: 'Off-voice', states: ['flattery'],
            note: 'Shown so the rule has something to be a rule against.',
            controls: [
              { id: 'flatterText', label: 'Answer', type: 'text',
                value: 'Great question! I’m so sorry for the trouble — I really appreciate ' +
                       'your patience. 94% renewal rate, two accounts missing.' }
            ] }
        ]
      },

      states: {
        brief:    { label: 'Brief',
                    trigger: 'The reader has chosen the short register.',
                    behaviour: 'Answer first, nothing after it. Length is a setting the reader ' +
                               'controls.',
                    action: 'Switch register, or break the source' },
        full:     { label: 'Explanatory',
                    trigger: 'The reader has chosen the longer register.',
                    behaviour: 'Same voice, more of it — the answer still comes first, the ' +
                               'reasoning follows.',
                    action: 'Break the source' },
        failure:  { label: 'Under failure',
                    trigger: 'A source the agent depends on goes down.',
                    behaviour: 'The real test. Same directness, no grovelling, and a next step ' +
                               'instead of an apology.',
                    action: 'See the failure mode' },
        flattery: { label: 'Off-voice',
                    trigger: 'The voice profile is not enforced.',
                    behaviour: 'Padding before substance and an apology for nothing. Shown so ' +
                               'the rule has something to be a rule against.',
                    action: 'Return to the voice' }
      },
      view: function (s) {
        var c = s.cfg;
        var text = esc(
          s.state === 'brief'   ? c.briefText :
          s.state === 'full'    ? c.fullText :
          s.state === 'failure' ? c.failText : c.flatterText);
        return '' +
'<div class="md-list-item">\n' +
'  <span class="md-agentav" aria-hidden="true">\n' +
'    <svg viewBox="0 0 24 24">\n' +
'      <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
'    </svg>\n' +
'  </span>\n' +
'  <div class="md-list-item__content">\n' +
'    <div class="md-list-item__line">\n' +
'      <p class="md-list-item__headline md-body-large">' + esc(c.name) + '</p>\n' +
   (c.chip
? '      <span class="md-assist-chip md-assist-chip--tonal">AI generated</span>\n' : '') +
'    </div>\n' +
'    <p class="md-list-item__supporting md-body-medium">\n' +
'    ' + text + '\n' +
'    </p>\n' +
'  </div>\n' +
'</div>';
      },
      act: function (a, ctx) {
        var map = { brief: 'brief', full: 'full', fail: 'failure', flatter: 'flattery' };
        ctx.s.state = map[a] || 'brief'; ctx.paint();
      }
    },

    /* ── Iconography ────────────────────────────────────────── */
    iconography: {
      initial: 'quiet',

      /* The emphasis ladder IS the state model here, so emphasis is
         not a setting — selecting a state is how you change it. What
         is left to decide is the label the glyph leads, and whether
         the container is drawn at all. */
      customize: {
        groups: [
          { id: 'action', label: 'The action it leads',
            states: ['quiet', 'tonal', 'filled'],
            note: 'One reserved glyph, one meaning: generated by an agent.',
            controls: [
              { id: 'label', label: 'Label', type: 'text', value: 'Draft with Aria' },
              { id: 'container', label: 'Draw the container', type: 'toggle', value: true,
                hint: 'The tile carries the emphasis; without it the glyph carries it alone.' }
            ] },

          { id: 'audit', label: 'Audit', states: ['audit'],
            note: 'Every use at once, so a stray sparkle on “new” is visible in one glance.',
            controls: [
              { id: 'auditLabels', label: 'Name each step', type: 'toggle', value: true }
            ] }
        ]
      },

      states: {
        quiet:  { label: 'Quiet',
                  trigger: 'The glyph sits in a low-emphasis placement.',
                  behaviour: 'Surface container with the glyph in primary — a menu row, a list, ' +
                             'anywhere it should be findable but not loud.',
                  action: 'Raise the emphasis' },
        tonal:  { label: 'Tonal',
                  trigger: 'The glyph rides on a chip or a secondary action.',
                  behaviour: 'Secondary container. Same drawing, more presence, still not the ' +
                             'loudest thing on the surface.',
                  action: 'Raise it again' },
        filled: { label: 'Filled',
                  trigger: 'The glyph leads a primary action.',
                  behaviour: 'Primary with on-primary. This is the ceiling — one placement per ' +
                             'surface, or the emphasis stops meaning anything.',
                  action: 'Run the audit' },
        audit:  { label: 'Audited',
                  trigger: 'A reviewer checks the reservation holds.',
                  behaviour: 'Every use of the glyph is outlined at once, so a stray sparkle on ' +
                             '“new” or “featured” is visible in one glance.',
                  action: 'Back to quiet' }
      },
      view: function (s) {
        var box = s.state === 'tonal'  ? ' md-icontile__box--tonal'
                : s.state === 'filled' ? ' md-icontile__box--filled' : '';
        if (s.state === 'audit') {
          return '' +
'<div class="md-icons sc-audit">\n' +
'  <div class="md-icontile">\n' +
'    <span class="md-icontile__box">\n' +
'      <svg class="sc-glyph" viewBox="0 0 24 24" aria-hidden="true">\n' +
'        <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
'      </svg>\n' +
'    </span>\n' +
   (s.cfg.auditLabels
? '    <span class="md-icontile__label md-label-small">Quiet</span>\n' : '') +
'  </div>\n' +
'  <div class="md-icontile">\n' +
'    <span class="md-icontile__box md-icontile__box--tonal">\n' +
'      <svg class="sc-glyph" viewBox="0 0 24 24" aria-hidden="true">\n' +
'        <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
'      </svg>\n' +
'    </span>\n' +
   (s.cfg.auditLabels
? '    <span class="md-icontile__label md-label-small">Tonal</span>\n' : '') +
'  </div>\n' +
'  <div class="md-icontile">\n' +
'    <span class="md-icontile__box md-icontile__box--filled">\n' +
'      <svg class="sc-glyph" viewBox="0 0 24 24" aria-hidden="true">\n' +
'        <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
'      </svg>\n' +
'    </span>\n' +
   (s.cfg.auditLabels
? '    <span class="md-icontile__label md-label-small">Filled</span>\n' : '') +
'  </div>\n' +
'</div>';
        }
        var c = s.cfg;
        return '' +
'<div class="pv-iconstate">\n' +
   (c.container
? '  <span class="md-icontile__box' + box + '">\n' +
  '    <svg viewBox="0 0 24 24" aria-hidden="true">\n' +
  '      <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
  '    </svg>\n' +
  '  </span>\n'
: '  <svg class="pv-iconstate__bare" viewBox="0 0 24 24" aria-hidden="true">\n' +
  '    <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
  '  </svg>\n') +
'\n' +
'  <button class="md-button md-button--' +
     (s.state === 'filled' ? 'filled' : s.state === 'tonal' ? 'outlined' : 'text') +
     ' md-button--sm" type="button">\n' +
'    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">\n' +
'      <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
'    </svg>\n' +
'    ' + esc(c.label) + '\n' +
'  </button>\n' +
'</div>';
      },
      act: function (a, ctx) { ctx.s.state = a; ctx.paint(); }
    },

    /* ── Color ──────────────────────────────────────────────── */
    color: {
      initial: 'idle',

      /* This pattern is an argument about a semantic role, not a
         colour picker: there is no hex here, and there is no accent
         setting, because the whole point is that ONE role is reserved
         for agent presence. What is configurable is what the presence
         says, and what the record left behind is called. */
      customize: {
        groups: [
          { id: 'presence', label: 'Presence', states: ['active'],
            note: 'The reserved role appears only while an agent is working in the surface.',
            controls: [
              { id: 'presenceLabel', label: 'Label', type: 'text',
                value: 'Aria is drafting here' },
              { id: 'dot', label: 'Show the dot', type: 'toggle', value: true,
                hint: 'Shape as well as colour — the greyscale state is the test.' }
            ] },

          { id: 'record', label: 'Authorship', states: ['active', 'done', 'grey'],
            note: 'Colour signalled presence and leaves with it. The chip is what records who wrote this.',
            controls: [
              { id: 'chipLabel', label: 'Chip', type: 'text', value: 'Drafted by Aria' }
            ] },

          { id: 'answer', label: 'The exchange', states: ['active', 'done', 'grey'],
            controls: [
              { id: 'answerText', label: 'Answer', type: 'text',
                value: '£4.1m, 6% ahead of plan — almost all of it enterprise renewals.' }
            ] },

          { id: 'ask', label: 'The question',
            controls: [
              { id: 'askText', label: 'Question', type: 'text',
                value: 'Where did Q2 renewals land?' }
            ] }
        ]
      },

      states: {
        idle:   { label: 'Idle',
                  trigger: 'No agent is working in the surface.',
                  behaviour: 'The document is the person&rsquo;s. No accent, because there is ' +
                             'no presence to signal.',
                  action: 'Start the agent' },
        active: { label: 'Active',
                  trigger: 'The agent begins working inside the surface.',
                  behaviour: 'The reserved accent appears as an outline and a label. It is the ' +
                             'only thing on screen using that role.',
                  action: 'Accept the draft, or go greyscale' },
        done:   { label: 'Accepted',
                  trigger: 'The person accepts the output.',
                  behaviour: 'The accent leaves with the work. What stays is the chip: colour ' +
                             'signalled presence, the chip records authorship.',
                  action: 'Start again' },
        grey:   { label: 'Greyscale',
                  trigger: 'Colour is removed entirely.',
                  behaviour: 'The proof. Ground, corner shape and chip still separate the two ' +
                             'authors, because no signal here is colour alone.',
                  action: 'Restore colour' }
      },
      view: function (s) {
        var c = s.cfg;
        var live = s.state === 'active';
        return '' +
'<div class="pv-doc' + (live ? ' is-live' : '') + (s.state === 'grey' ? ' sc-grey' : '') + '">\n' +
   (live
? '  <div class="pv-doc__head">\n' +
   (c.dot
? '    <span class="md-presence__dot" aria-hidden="true"></span>\n' : '') +
'    <span class="md-presence__label md-label-large">' + esc(c.presenceLabel) + '</span>\n' +
'  </div>\n' : '') +
'  <div class="md-turns">\n' +
'    <div class="md-bubble md-bubble--human md-body-medium">\n' +
'      ' + esc(c.askText) + '\n' +
'    </div>\n' +
   (s.state === 'idle'
? '' :
'    <div class="md-bubble md-bubble--agent md-body-medium">\n' +
'      ' + esc(c.answerText) + '\n' +
'      <span class="pv-doc__tag">\n' +
'        <span class="md-assist-chip md-assist-chip--tonal">' + esc(c.chipLabel) + '</span>\n' +
'      </span>\n' +
'    </div>\n') +
'  </div>\n' +
'</div>';
      },
      act: async function (a, ctx) {
        var s = ctx.s;
        if (a === 'grey')   { s.state = s.state === 'grey' ? 'done' : 'grey'; ctx.paint(); return; }
        if (a === 'accept') { s.state = 'done'; ctx.paint(); ctx.announce('Draft accepted'); return; }
        if (a === 'start')  { s.state = 'active'; ctx.paint(); ctx.announce('Aria is drafting'); }
      }
    },

    /* ══════════════════════════════════════════════════════════
       INITIALLY · ENTRY POINTS

       Eight doors. Each playground is built around the ONE thing
       its pattern can get wrong, because that is the state a
       reader actually needs to reach by hand:

         initial-cta       is the label about this screen, or
                           about the product?
         open-input        what does it look like while it is
                           busy — and is your draft still there?
         suggested-prompts does choosing one fill the composer,
                           or fire it?
         ai-icons          does the glyph appear anywhere a model
                           does not run?
         search-filter     can you see, and correct, what the
                           sentence was understood as?
         autocomplete      can the offer be committed by accident?
         proactive         does it lead with what it noticed?
         randomize         can you roll again without losing what
                           you had?
       ══════════════════════════════════════════════════════════ */

    /* ── Initial CTA ────────────────────────────────────────
       The empty state is the most expensive screen in the
       product. Turn the specificity off and read the same
       layout: it becomes an advertisement for an assistant. */
    'initial-cta': {
      initial: 'invitation',

      customize: {
        groups: [
          { id: 'copy', label: 'The invitation', states: ['invitation'],
            controls: [
              { id: 'title', label: 'Action', type: 'text', value: 'Summarise this thread',
                hint: 'A verb applied to what is on screen. “Get started” is the failure.' },
              { id: 'desc', label: 'What happens', type: 'text',
                value: 'Aria reads ticket #4821 and gives you the disagreement in two lines.' },
              { id: 'primary', label: 'Primary label', type: 'text', value: 'Summarise it' },
              { id: 'secondary', label: 'Other way in', type: 'toggle', value: true,
                capability: true,
                hint: 'For people who arrived already knowing what they wanted.' },
              { id: 'secondaryLabel', label: 'Secondary label', type: 'text',
                value: 'Ask something else',
                visibleWhen: function (c) { return !!c.secondary; } }
            ] },

          { id: 'form', label: 'Form', states: ['invitation', 'generic'],
            controls: [
              { id: 'ground', label: 'Ground', type: 'segment', value: 'filled',
                options: [['filled', 'Filled'], ['quiet', 'Quiet']] },
              { id: 'glyph', label: 'Carry the reserved glyph', type: 'toggle', value: true }
            ] },

          { id: 'generic', label: 'Written generically', states: ['generic'],
            note: 'The same component with the specificity removed. This is what most products ship.',
            controls: [
              { id: 'genericTitle', label: 'Action', type: 'text', value: 'Ask me anything' },
              { id: 'genericDesc', label: 'What happens', type: 'text',
                value: 'Your AI assistant is here to help.' }
            ] },

          { id: 'retired', label: 'Retired', states: ['retired'],
            note: 'What replaces it once the screen has content. An invitation that never leaves is an advertisement.',
            controls: [
              { id: 'retiredText', label: 'Note', type: 'text',
                value: 'The surface has work on it now, so the invitation is gone and the ' +
                       'composer carries the way in.' }
            ] }
        ]
      },

      states: {
        invitation: { label: 'Invitation',
                      trigger: 'The surface is empty and the agent has produced nothing yet.',
                      behaviour: 'One oversized entry point naming what the agent will do to ' +
                                 'the material already on screen, with a quieter second way in.',
                      action: 'Compare it with the generic wording' },
        generic:    { label: 'Written generically',
                      trigger: 'The same component, written about the product instead of the screen.',
                      behaviour: 'Identical layout, no information. The user still has to work ' +
                                 'out what to ask, which is the problem the pattern exists to solve.',
                      action: 'Go back' },
        retired:    { label: 'Retired',
                      trigger: 'The surface now has real content on it.',
                      behaviour: 'The invitation is gone. A call to action competing with work ' +
                                 'is noise, and a permanent one reads as an advertisement.',
                      action: 'Reset' }
      },

      view: function (s) {
        var c = s.cfg;
        if (s.state === 'retired') {
          return '' +
'<div class="pv-card pv-card--quiet">\n' +
'  <p class="md-body-medium">Ticket #4821 — 3 messages</p>\n' +
'  <p class="pv-card__meta md-body-small">' + esc(c.retiredText) + '</p>\n' +
'</div>';
        }
        var generic = s.state === 'generic';
        var title = generic ? c.genericTitle : c.title;
        var desc  = generic ? c.genericDesc  : c.desc;
        return '' +
'<section class="md-cta' + (c.ground === 'quiet' ? ' md-cta--quiet' : '') +
   '" aria-labelledby="cta-t">\n' +
   (c.glyph
? '  <svg class="md-cta__ico" viewBox="0 0 24 24" aria-hidden="true">\n' +
  '    <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
  '  </svg>\n' : '') +
'  <h2 class="md-cta__t md-headline-small" id="cta-t">' + esc(title) + '</h2>\n' +
'  <p class="md-cta__d md-body-medium">' + esc(desc) + '</p>\n' +
'  <div class="md-cta__foot">\n' +
'    <button class="md-button md-button--filled" type="button"\n' +
'            data-act="use">' + esc(c.primary) + '</button>\n' +
   (c.secondary
? '    <button class="md-button md-button--text" type="button">' +
     esc(c.secondaryLabel) + '</button>\n' : '') +
'  </div>\n' +
'</section>';
      },

      act: function (a, ctx) {
        if (a === 'use') { ctx.s.state = 'retired'; ctx.paint();
                           ctx.announce('Invitation taken, and retired'); }
      }
    },

    /* ── Open Input ─────────────────────────────────────────
       The composer is the most-used control in the product and
       the one most often shipped in a single state. Busy is the
       state worth reaching: the send control changes, the field
       does not, and the draft is still there. */
    'open-input': {
      initial: 'rest',

      customize: {
        groups: [
          { id: 'field', label: 'The field', states: ['rest', 'typing', 'busy'],
            controls: [
              { id: 'placeholder', label: 'Placeholder', type: 'text',
                value: 'Ask Aria about #4821',
                hint: 'Name what THIS field is for, in the product’s own nouns.' },
              { id: 'glyph', label: 'Carry the reserved glyph', type: 'toggle', value: true },
              { id: 'hint', label: 'Show the send hint', type: 'toggle', value: true,
                capability: true },
              { id: 'hintText', label: 'Hint', type: 'text',
                value: 'Enter to send · Shift + Enter for a new line',
                visibleWhen: function (c) { return !!c.hint; } }
            ] },

          { id: 'typed', label: 'What is typed', states: ['typing', 'busy'],
            controls: [
              { id: 'typed', label: 'Draft', type: 'text',
                value: 'Where did Q2 renewals actually land?' }
            ] },

          { id: 'busy', label: 'While it works', states: ['busy'],
            note: 'The busy state belongs to the action, never to the reader’s text.',
            controls: [
              { id: 'keepEditable', label: 'Field stays editable', type: 'toggle', value: true,
                hint: 'Disabling it takes away the draft somebody was still writing.' },
              { id: 'stoppable', label: 'Send becomes stop', type: 'toggle', value: true,
                hint: 'A wait with no way out is the commonest composer bug.' }
            ] }
        ]
      },

      states: {
        rest:   { label: 'Rest',
                  trigger: 'Nothing typed yet.',
                  behaviour: 'A capsule field with its placeholder. No send control, because ' +
                             'there is nothing to send — an empty press is impossible rather ' +
                             'than merely ignored.',
                  action: 'Type something' },
        typing: { label: 'Typing',
                  trigger: 'The field has content.',
                  behaviour: 'Send appears as the only filled element in the row. The outline ' +
                             'takes primary on focus: one property, one state.',
                  action: 'Send it' },
        busy:   { label: 'Working',
                  trigger: 'A request is in flight.',
                  behaviour: 'Send becomes stop; the field stays live and keeps its text. ' +
                             'Nothing the reader wrote is taken away by a wait.',
                  action: 'Reset' }
      },

      view: function (s) {
        var c = s.cfg;
        var busy = s.state === 'busy';
        var typing = s.state === 'typing' || busy;
        var G =
'    <svg class="md-entry__glyph" viewBox="0 0 24 24" aria-hidden="true">\n' +
'      <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
'    </svg>\n';
        return '' +
'<form class="md-entry' + (busy ? ' md-entry--busy' : '') + '">\n' +
   (c.glyph ? G : '') +
'  <input class="md-entry__input md-body-medium" type="text"\n' +
'         value="' + (typing ? esc(c.typed) : '') + '"\n' +
'         placeholder="' + esc(c.placeholder) + '" aria-label="Ask Aria"' +
   (busy && !c.keepEditable ? ' disabled' : '') + ' />\n' +
   (typing
? (busy && c.stoppable
? '  <button class="md-entry__send md-entry__send--stop" type="button"\n' +
  '          data-act="stop" aria-label="Stop">\n' +
  '    <svg viewBox="0 0 24 24" aria-hidden="true">\n' +
  '      <rect x="7" y="7" width="10" height="10" rx="2"/>\n' +
  '    </svg>\n' +
  '  </button>\n'
: busy
? ''
: '  <button class="md-entry__send" type="button" data-act="send" aria-label="Send">\n' +
  '    <svg viewBox="0 0 24 24" aria-hidden="true">\n' +
  '      <path d="M3.4 20.4 21.9 12 3.4 3.6 3.4 10.1 16.5 12 3.4 13.9Z"/>\n' +
  '    </svg>\n' +
  '  </button>\n')
: '') +
'</form>' +
   (c.hint
? '\n<span class="md-entry__hint md-body-small">' + esc(c.hintText) + '</span>'
: '');
      },

      act: function (a, ctx) {
        if (a === 'send') { ctx.s.state = 'busy'; ctx.paint(); ctx.announce('Sent, working'); return; }
        if (a === 'stop') { ctx.s.state = 'typing'; ctx.paint();
                            ctx.announce('Stopped, and your text is still here'); }
      }
    },

    /* ── Suggested Prompts ──────────────────────────────────
       The single decision this pattern has is what happens when
       one is pressed. Landing in the composer teaches phrasing;
       firing straight off hides it. */
    'suggested-prompts': {
      initial: 'offered',

      customize: {
        groups: [
          { id: 'set', label: 'The set', states: ['offered', 'chosen'],
            controls: [
              { id: 'p1', label: 'First', type: 'text', value: 'What is this ticket about?' },
              { id: 'p2', label: 'Second', type: 'text', value: 'Where did Q2 renewals land?' },
              { id: 'p3', label: 'Third', type: 'text', value: 'Draft a reply to Dana' },
              { id: 'fourth', label: 'A fourth', type: 'toggle', value: false, capability: true,
                hint: 'Three or four. A wall of chips is the menu this pattern replaces.' },
              { id: 'p4', label: 'Fourth', type: 'text', value: 'Who else has touched this?',
                visibleWhen: function (c) { return !!c.fourth; } }
            ] },

          { id: 'behaviour', label: 'On choosing one', states: ['offered', 'chosen'],
            controls: [
              { id: 'fills', label: 'Lands in the composer', type: 'toggle', value: true,
                hint: 'Off, it sends immediately — and the reader never sees the request they made.' },
              { id: 'refresh', label: 'Offer a refresh', type: 'toggle', value: true,
                capability: true },
              { id: 'refreshLabel', label: 'Refresh label', type: 'text', value: 'Other ideas',
                visibleWhen: function (c) { return !!c.refresh; } }
            ] },

          { id: 'quiet', label: 'While typing', states: ['quiet'],
            note: 'Ideas must never compete with the sentence somebody is already writing.',
            controls: [
              { id: 'quietText', label: 'Note', type: 'text',
                value: 'Suggestions are withdrawn while the field has content of its own.' }
            ] }
        ]
      },

      states: {
        offered: { label: 'Offered',
                   trigger: 'The composer is empty and the surface has material worth asking about.',
                   behaviour: 'Three or four outlined capsules, worded against what is on ' +
                              'screen, staggered in on emphasized easing because the system ' +
                              'raised them.',
                   action: 'Choose one' },
        chosen:  { label: 'Chosen',
                   trigger: 'The reader presses one.',
                   behaviour: 'Its text moves into the composer, editable and unsent — one ' +
                              'surface becoming another, rather than a request fired on their behalf.',
                   action: 'Reset' },
        quiet:   { label: 'Withdrawn',
                   trigger: 'The reader starts typing.',
                   behaviour: 'The set is withdrawn. Offering ideas beside a half-written ' +
                              'sentence competes with the thought already in progress.',
                   action: 'Reset' }
      },

      view: function (s) {
        var c = s.cfg;
        if (s.state === 'quiet') {
          return '' +
'<form class="md-entry">\n' +
'  <input class="md-entry__input md-body-medium" type="text"\n' +
'         value="Can you check the renewal figure agai" aria-label="Ask Aria" />\n' +
'</form>\n' +
'<!-- ' + esc(c.quietText) + ' -->';
        }
        if (s.state === 'chosen') {
          return '' +
'<form class="md-entry">\n' +
'  <input class="md-entry__input md-body-medium" type="text"\n' +
'         value="' + esc(c.fills ? c.p2 : '') + '" aria-label="Ask Aria" />\n' +
'  <button class="md-entry__send" type="button" aria-label="Send">\n' +
'    <svg viewBox="0 0 24 24" aria-hidden="true">\n' +
'      <path d="M3.4 20.4 21.9 12 3.4 3.6 3.4 10.1 16.5 12 3.4 13.9Z"/>\n' +
'    </svg>\n' +
'  </button>\n' +
'</form>';
        }
        var items = [c.p1, c.p2, c.p3].concat(c.fourth ? [c.p4] : []);
        return '' +
'<div class="md-suggests" role="group" aria-label="Suggested questions">\n' +
   items.map(function (t, i) {
     return '  <button class="md-suggest md-body-small" type="button"' +
            (i === 1 ? ' data-act="choose"' : '') + '>' + esc(t) + '</button>\n';
   }).join('') +
   (c.refresh
? '  <button class="md-suggest md-suggest__refresh md-body-small" type="button">' +
  esc(c.refreshLabel) + '</button>\n' : '') +
'</div>';
      },

      act: function (a, ctx) {
        if (a === 'choose') {
          ctx.s.state = 'chosen'; ctx.paint();
          ctx.announce(ctx.s.cfg.fills ? 'Placed in the composer, unsent' : 'Sent immediately');
        }
      }
    },

    /* ── Icons ──────────────────────────────────────────────
       "Reserved" is a claim about a whole screen, so the state
       worth reaching is the audit — and the one that proves the
       cost is the misuse. */
    'ai-icons': {
      initial: 'inline',

      customize: {
        groups: [
          { id: 'placement', label: 'Placement', states: ['inline', 'toolbar', 'iconOnly'],
            controls: [
              { id: 'label', label: 'Field label', type: 'text', value: 'Reply to Dana' },
              { id: 'action', label: 'Accessible name', type: 'text',
                value: 'Draft this with Aria',
                hint: 'Say what pressing it does, not what the picture is.' }
            ] },

          { id: 'word', label: 'The word beside it', states: ['toolbar'],
            controls: [
              { id: 'withWord', label: 'Pair the glyph with a word', type: 'toggle', value: true,
                hint: 'Icon-only belongs to dense rows where the neighbours are icons too.' },
              { id: 'wordText', label: 'Word', type: 'text', value: 'Draft with Aria',
                visibleWhen: function (c) { return !!c.withWord; } }
            ] },

          { id: 'state', label: 'Agent state', states: ['inline', 'toolbar'],
            note: 'Thinking is a hue rotation, never a spin: a spinner says wait, a hue shift says the agent is doing something.',
            controls: [
              { id: 'thinking', label: 'Working', type: 'toggle', value: false }
            ] },

          { id: 'misuse', label: 'Spent elsewhere', states: ['misuse'],
            note: 'The whole cost of the pattern, in one screen: once the mark means two things it means nothing.',
            controls: [
              { id: 'misuseLabel', label: 'The other use', type: 'text', value: 'New' }
            ] }
        ]
      },

      states: {
        inline:   { label: 'In a field',
                    trigger: 'The agent can fill this particular field.',
                    behaviour: 'The glyph sits at the end of the input it acts on, carrying ' +
                               'primary and an accessible name that says what pressing it does.',
                    action: 'Try the other placements' },
        toolbar:  { label: 'In a toolbar',
                    trigger: 'The agent can act on the whole surface.',
                    behaviour: 'The glyph rides on a labelled button, because anywhere a person ' +
                               'might press by mistake deserves a word.',
                    action: 'Drop the word' },
        iconOnly: { label: 'Icon only',
                    trigger: 'A dense row where every neighbour is also an icon.',
                    behaviour: 'The glyph alone, with the word carried by a tooltip and an ' +
                               'accessible name — never by the glyph doing extra work.',
                    action: 'Reset' },
        misuse:   { label: 'Spent on “new”',
                    trigger: 'Somebody uses the mark for something a model does not do.',
                    behaviour: 'Both uses stop being legible at once. This is why the rule is ' +
                               'one glyph, one meaning, and why the audit is worth running.',
                    action: 'Reset' }
      },

      view: function (s) {
        var c = s.cfg;
        var think = c.thinking ? ' md-glyph--thinking' : '';
        var G = function (cls) {
          return '<svg class="md-glyph' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">\n' +
                 '        <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
                 '      </svg>';
        };
        if (s.state === 'toolbar') {
          return '' +
'<div class="md-iconrow">\n' +
'  <button class="md-button md-button--filled md-button--sm" type="button">\n' +
'    ' + G(think) + '\n' +
   (c.withWord ? '    ' + esc(c.wordText) + '\n' : '') +
'  </button>\n' +
'  <button class="md-button md-button--text md-button--sm" type="button">Add a note</button>\n' +
'</div>';
        }
        if (s.state === 'iconOnly') {
          return '' +
'<div class="md-iconrow">\n' +
'  <button class="md-icononly" type="button" aria-label="' + esc(c.action) + '">\n' +
'    ' + G('') + '\n' +
'  </button>\n' +
'  <span class="md-caveat-tip md-body-small" role="tooltip">' + esc(c.action) + '</span>\n' +
'</div>';
        }
        if (s.state === 'misuse') {
          return '' +
'<div class="md-iconrow">\n' +
'  <button class="md-button md-button--filled md-button--sm" type="button">\n' +
'    ' + G('') + '\n' +
'    Draft with Aria\n' +
'  </button>\n' +
'  <!-- the same mark, on something no model touches -->\n' +
'  <span class="md-assist-chip md-assist-chip--tonal">\n' +
'    <svg class="md-assist-chip__icon" viewBox="0 0 24 24" aria-hidden="true">\n' +
'      <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
'    </svg>\n' +
'    ' + esc(c.misuseLabel) + '\n' +
'  </span>\n' +
'</div>';
        }
        return '' +
'<label class="md-field">\n' +
'  <span class="md-field__label md-body-small">' + esc(c.label) + '</span>\n' +
'  <span class="md-field__row">\n' +
'    <input class="md-field__input md-body-medium" type="text"\n' +
'           placeholder="Write a reply, or let Aria draft it" />\n' +
'    <button class="md-field-glyph" type="button" aria-label="' + esc(c.action) + '">\n' +
'      ' + G(think) + '\n' +
'    </button>\n' +
'  </span>\n' +
'</label>';
      },

      act: function () {}
    },

    /* ── Searching & Filtering ──────────────────────────────
       The pattern is not language replacing filters. It is the
       translation being made visible — and correctable. */
    'search-filter': {
      initial: 'understood',

      customize: {
        groups: [
          { id: 'query', label: 'The query', states: ['asked', 'understood', 'partial'],
            controls: [
              { id: 'query', label: 'Typed', type: 'text',
                value: 'open enterprise tickets from this week' }
            ] },

          { id: 'reading', label: 'What it was understood as', states: ['understood', 'partial'],
            note: 'Chips rather than a sentence: a filter you can remove is a translation you can correct.',
            controls: [
              { id: 'f1', label: 'First filter', type: 'text', value: 'status: open' },
              { id: 'f2', label: 'Second filter', type: 'text', value: 'tier: enterprise' },
              { id: 'f3', label: 'Third filter', type: 'text', value: 'opened: last 7 days' },
              { id: 'count', label: 'Show the result count', type: 'toggle', value: true,
                capability: true,
                hint: 'Before the results, so a wrong reading is obvious at a glance.' },
              { id: 'countText', label: 'Count', type: 'text', value: '7 tickets',
                visibleWhen: function (c) { return !!c.count; } }
            ] },

          { id: 'partial', label: 'What it could not read', states: ['partial'],
            note: 'A clause silently dropped is the failure people never forgive.',
            controls: [
              { id: 'ignored', label: 'Said out loud', type: 'text',
                value: '“that Dana cares about” was ignored — there is no field behind it.' }
            ] },

          { id: 'manual', label: 'The manual way', states: ['asked', 'understood', 'partial'],
            controls: [
              { id: 'manual', label: 'Keep the filter controls reachable', type: 'toggle',
                value: true,
                hint: 'This is an addition to the filter panel, not a replacement for it.' }
            ] }
        ]
      },

      states: {
        asked:      { label: 'Asked',
                      trigger: 'A sentence is typed and sent.',
                      behaviour: 'The query field alone. Nothing has been claimed yet, so ' +
                                 'there is nothing to check.',
                      action: 'See how it was read' },
        understood: { label: 'Understood',
                      trigger: 'The sentence is translated into the product’s own filters.',
                      behaviour: 'Each clause becomes a removable chip at 8dp — sharp, because ' +
                                 'it is evidence — with the result count before the results.',
                      action: 'Try a clause it cannot read' },
        partial:    { label: 'Partly understood',
                      trigger: 'Part of the sentence has no field behind it.',
                      behaviour: 'What was ignored is said out loud beside what was applied. ' +
                                 'A dropped clause the reader never learns about is the ' +
                                 'failure that costs the feature its user.',
                      action: 'Reset' }
      },

      view: function (s) {
        var c = s.cfg;
        var field = '' +
'<form class="md-nlsearch">\n' +
'  <svg class="md-nlsearch__ico" viewBox="0 0 24 24" fill="none" stroke="currentColor"\n' +
'       stroke-width="1.8" aria-hidden="true">\n' +
'    <circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>\n' +
'  </svg>\n' +
'  <input class="md-nlsearch__input md-body-medium" type="text"\n' +
'         value="' + esc(c.query) + '" aria-label="Search in your own words" />\n' +
'</form>';

        if (s.state === 'asked') return field;

        var chip = function (t, n) {
          return '  <span class="md-fchip md-body-small">' + esc(t) + '\n' +
                 '    <button type="button" aria-label="Remove ' + esc(t) + '">&times;</button>\n' +
                 '  </span>\n';
        };
        return field + '\n' +
'<div class="md-applied" role="group" aria-label="Filters applied">\n' +
'  <span class="md-applied__k md-body-small">Understood as</span>\n' +
   chip(c.f1) + chip(c.f2) + chip(c.f3) +
   (c.count
? '  <span class="md-applied__n md-body-small">' + esc(c.countText) + '</span>\n' : '') +
'</div>' +
   (s.state === 'partial'
? '\n<p class="md-ignored md-body-small">' + esc(c.ignored) + '</p>'
: '') +
   (c.manual
? '\n<p class="md-ignored md-body-small">\n' +
  '  <button class="md-button md-button--text md-button--sm" type="button">\n' +
  '    Use the filter panel instead\n' +
  '  </button>\n' +
  '</p>'
: '');
      },

      act: function () {}
    },

    /* ── Autocomplete ───────────────────────────────────────
       The whole pattern is keeping the offer separate from the
       sentence until the moment it is taken. */
    autocomplete: {
      initial: 'offered',

      customize: {
        groups: [
          { id: 'text', label: 'The line', states: ['offered', 'accepted', 'rejected'],
            controls: [
              { id: 'typed', label: 'Typed', type: 'text',
                value: 'Thanks Dana — Q2 closed at' },
              { id: 'ghost', label: 'Offered', type: 'text',
                value: '£4.1m, 6% ahead of plan.' }
            ] },

          { id: 'form', label: 'How it reads', states: ['offered'],
            note: 'Same face, same size, lower emphasis — a different size would move the caret, which is worse than no suggestion.',
            controls: [
              { id: 'distinct', label: 'Offer is visibly not theirs', type: 'toggle', value: true,
                hint: 'Off, the offer renders as typed text — and gets sent as the reader’s own.' },
              { id: 'hint', label: 'Say which key takes it', type: 'toggle', value: true,
                capability: true },
              { id: 'key', label: 'Accept key', type: 'segment', value: 'Tab',
                options: [['Tab', 'Tab'], ['→', 'Right arrow']],
                visibleWhen: function (c) { return !!c.hint; } }
            ] },

          { id: 'rejected', label: 'Typed past', states: ['rejected'],
            note: 'Any other keystroke retires it, silently and without comment.',
            controls: [
              { id: 'own', label: 'What they wrote instead', type: 'text',
                value: '£4.1m — figures attached.' }
            ] }
        ]
      },

      states: {
        offered:  { label: 'Offered',
                    trigger: 'The next few words are predictable from what is typed and what ' +
                             'is on screen.',
                    behaviour: 'One continuation ahead of the caret at lower emphasis. Enter ' +
                               'still sends what was typed; only the accept key takes the offer.',
                    action: 'Accept it, or type past it' },
        accepted: { label: 'Accepted',
                    trigger: 'The reader presses the accept key.',
                    behaviour: 'The ghost hardens to full emphasis in 180ms — the boundary of ' +
                               'certainty resolving as the words stop being the agent’s.',
                    action: 'Reset' },
        rejected: { label: 'Typed past',
                    trigger: 'The reader keeps typing.',
                    behaviour: 'The offer disappears without comment, and the same completion ' +
                               'is not offered again for this sentence.',
                    action: 'Reset' }
      },

      view: function (s) {
        var c = s.cfg;
        if (s.state === 'rejected') {
          return '' +
'<div class="md-ghostfield">\n' +
'  <p class="md-ghostfield__line md-body-medium">\n' +
'    <span>' + esc(c.typed) + ' ' + esc(c.own) + '</span>\n' +
'    <span class="md-ghostfield__caret" aria-hidden="true"></span>\n' +
'  </p>\n' +
'</div>';
        }
        var taken = s.state === 'accepted';
        return '' +
'<div class="md-ghostfield">\n' +
'  <p class="md-ghostfield__line md-body-medium">\n' +
'    <span class="md-ghostfield__typed">' + esc(c.typed) + '</span>\n' +
   (taken ? '' :
'    <span class="md-ghostfield__caret" aria-hidden="true"></span>\n') +
'    <span class="md-ghostfield__ghost' +
     (taken || !c.distinct ? ' md-ghostfield__ghost--taken' : '') + '">' +
     esc(c.ghost) + '</span>\n' +
   (taken ?
'    <span class="md-ghostfield__caret" aria-hidden="true"></span>\n' : '') +
'  </p>\n' +
   (!taken && c.hint
? '  <p class="md-ghostfield__hint md-body-small">\n' +
  '    <kbd class="md-kbd">' + esc(c.key) + '</kbd> to accept\n' +
  '  </p>\n' : '') +
   (!taken
? '  <div class="md-cta__foot" style="justify-content:flex-start;margin-top:12px">\n' +
  '    <button class="md-button md-button--filled md-button--sm" type="button"\n' +
  '            data-act="accept">Accept</button>\n' +
  '    <button class="md-button md-button--text md-button--sm" type="button"\n' +
  '            data-act="reject">Keep typing</button>\n' +
  '  </div>\n' : '') +
'</div>';
      },

      act: function (a, ctx) {
        if (a === 'accept') { ctx.s.state = 'accepted'; ctx.paint();
                              ctx.announce('Accepted — the words are yours now'); return; }
        if (a === 'reject') { ctx.s.state = 'rejected'; ctx.paint();
                              ctx.announce('Offer retired'); }
      }
    },

    /* ── Proactive Suggestions ──────────────────────────────
       The only pattern in the category where the agent speaks
       first, which makes it the one with the highest cost of
       being wrong. */
    proactive: {
      initial: 'observed',

      customize: {
        groups: [
          { id: 'content', label: 'What it says', states: ['observed', 'quiet'],
            note: 'Observation first. Reverse the two lines and the card is an advertisement.',
            controls: [
              { id: 'obs', label: 'What changed', type: 'text',
                value: 'Two renewals closed since you last looked.' },
              { id: 'offer', label: 'What it means', type: 'text',
                value: 'The £4.1m in your draft to Dana is now out of date.' },
              { id: 'accept', label: 'Action', type: 'text', value: 'Update the figure' }
            ] },

          { id: 'form', label: 'Form', states: ['observed'],
            controls: [
              { id: 'dismissible', label: 'Can be dismissed', type: 'toggle', value: true,
                capability: true,
                hint: 'A proactive agent with no off switch is a notification system.' },
              { id: 'dismissLabel', label: 'Decline', type: 'text', value: 'Dismiss',
                visibleWhen: function (c) { return !!c.dismissible; } },
              { id: 'offSwitch', label: 'Show where to turn the category off', type: 'toggle',
                value: true,
                visibleWhen: function (c) { return !!c.dismissible; } }
            ] },

          { id: 'unearned', label: 'Unearned', states: ['unearned'],
            note: 'The same component with nothing behind it. This is what trains people to dismiss without reading.',
            controls: [
              { id: 'unearnedText', label: 'What it says', type: 'text',
                value: 'Did you know Aria can draft replies for you?' }
            ] },

          { id: 'quiet', label: 'Quiet form', states: ['quiet'],
            note: 'For surfaces too dense for a card: the same observation on one line.',
            controls: [
              { id: 'quietAction', label: 'Action', type: 'text', value: 'Update it' }
            ] }
        ]
      },

      states: {
        observed: { label: 'Raised on evidence',
                    trigger: 'Something changed in the reader’s own data that bears on what ' +
                             'they are doing.',
                    behaviour: 'A rounded primary-container card arriving from below on ' +
                               'emphasized easing — never a spring, because the reader did not ' +
                               'cause it. The observation leads; the offer follows.',
                    action: 'See it unearned' },
        unearned: { label: 'Unearned',
                    trigger: 'The same card fired on a timer instead of on evidence.',
                    behaviour: 'Identical component, no observation to justify it. This is the ' +
                               'version that teaches people to dismiss without reading, which ' +
                               'disables the mechanism permanently.',
                    action: 'Go back' },
        quiet:    { label: 'Quiet form',
                    trigger: 'The surface is too dense for a card.',
                    behaviour: 'One line carrying the same observation and the same action, ' +
                               'costing no vertical space and no attention.',
                    action: 'Reset' },
        dismissed:{ label: 'Dismissed',
                    trigger: 'The reader says no.',
                    behaviour: 'Gone, and gone for this class of suggestion. Ignoring it was ' +
                               'free; dismissing it is permanent.',
                    action: 'Reset' }
      },

      view: function (s) {
        var c = s.cfg;
        if (s.state === 'dismissed') {
          return '' +
'<div class="pv-card pv-card--quiet" role="status">\n' +
'  <p class="md-body-medium">Nothing raised.</p>\n' +
'  <p class="pv-card__meta md-body-small">Dismissed for this class of suggestion. Ignoring it\n' +
'     was free; dismissing it is permanent.</p>\n' +
'</div>';
        }
        if (s.state === 'quiet') {
          return '' +
'<span class="md-proactive--line md-body-small" role="status">\n' +
'  <svg class="md-proactive__ico" viewBox="0 0 24 24" aria-hidden="true">\n' +
'    <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
'  </svg>\n' +
'  ' + esc(c.obs) + '\n' +
'  <button class="md-button md-button--text md-button--sm" type="button">' +
   esc(c.quietAction) + '</button>\n' +
'</span>';
        }
        var unearned = s.state === 'unearned';
        return '' +
'<aside class="md-proactive" role="status">\n' +
'  <div class="md-proactive__head">\n' +
'    <svg class="md-proactive__ico" viewBox="0 0 24 24" aria-hidden="true">\n' +
'      <path d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6Z"/>\n' +
'    </svg>\n' +
'    <p class="md-proactive__obs md-body-medium">' +
   esc(unearned ? c.unearnedText : c.obs) + '</p>\n' +
'  </div>\n' +
   (unearned ? '' :
'  <p class="md-proactive__offer md-body-small">' + esc(c.offer) + '</p>\n') +
'  <div class="md-proactive__foot">\n' +
'    <button class="md-button md-button--filled md-button--sm" type="button">' +
   esc(unearned ? 'Try it' : c.accept) + '</button>\n' +
   (c.dismissible
? '    <button class="md-button md-button--text md-button--sm" type="button"\n' +
  '            data-act="dismiss">' + esc(c.dismissLabel) + '</button>\n' : '') +
   (c.dismissible && c.offSwitch && !unearned
? '    <button class="md-button md-button--text md-button--sm" type="button">\n' +
  '      Turn these off\n' +
  '    </button>\n' : '') +
'  </div>\n' +
'</aside>';
      },

      act: function (a, ctx) {
        if (a === 'dismiss') { ctx.s.state = 'dismissed'; ctx.paint();
                               ctx.announce('Dismissed for this class of suggestion'); }
      }
    },

    /* ── Randomize ──────────────────────────────────────────
       A way in for somebody with no intent at all. The two
       things it must never do: produce a fragment, and destroy
       what the reader already had. */
    randomize: {
      initial: 'ready',

      customize: {
        groups: [
          { id: 'control', label: 'The control', states: ['ready', 'rolled', 'guarded'],
            controls: [
              { id: 'label', label: 'Label', type: 'text', value: 'Surprise me' },
              { id: 'ico', label: 'Show the dice', type: 'toggle', value: true }
            ] },

          { id: 'result', label: 'The roll', states: ['rolled'],
            note: 'Complete and plausible, never a fragment — and editable, so the result teaches the shape of a good request.',
            controls: [
              { id: 'roll', label: 'What came up', type: 'text',
                value: 'Which renewals are at risk this quarter, and why?' },
              { id: 'useLabel', label: 'Take it', type: 'text', value: 'Use this' },
              { id: 'again', label: 'Can be rolled again', type: 'toggle', value: true,
                capability: true,
                hint: 'One press. A dice you cannot re-roll is a slot machine.' },
              { id: 'againLabel', label: 'Roll again', type: 'text', value: 'Roll again',
                visibleWhen: function (c) { return !!c.again; } },
              { id: 'back', label: 'Keep a way back to the last roll', type: 'toggle',
                value: true,
                visibleWhen: function (c) { return !!c.again; } }
            ] },

          { id: 'guarded', label: 'When the field has work in it', states: ['guarded'],
            note: 'The roll goes somewhere the reader can compare it. Overwriting is the one unforgivable behaviour here.',
            controls: [
              { id: 'existing', label: 'What was already there', type: 'text',
                value: 'Can you check the renewal figure before Thursday?' }
            ] }
        ]
      },

      states: {
        ready:   { label: 'Ready',
                   trigger: 'An empty surface and a reader with no particular intent.',
                   behaviour: 'A single capsule control. Cheap to press, and the only playful ' +
                              'motion in the system — one spring and rotate, while nothing ' +
                              'else on screen moves.',
                   action: 'Roll it' },
        rolled:  { label: 'Rolled',
                   trigger: 'The reader presses it.',
                   behaviour: 'A complete, editable request arrives on emphasized easing. It ' +
                              'settles from a tinted, soft-edged ground into a defined ' +
                              'container — a roll is uncertain until it is a result.',
                   action: 'See what happens with work in the field' },
        guarded: { label: 'Work already there',
                   trigger: 'The composer is not empty when the dice is pressed.',
                   behaviour: 'The roll lands beside what the reader wrote rather than over it, ' +
                              'so the two can be compared and either kept.',
                   action: 'Reset' }
      },

      view: function (s) {
        var c = s.cfg;
        var dice = '' +
'<button class="md-dice" type="button" data-act="roll">\n' +
   (c.ico
? '  <svg class="md-dice__ico" viewBox="0 0 24 24" aria-hidden="true">\n' +
  '    <rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none"\n' +
  '          stroke="currentColor" stroke-width="1.8"/>\n' +
  '    <circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/>\n' +
  '    <circle cx="12" cy="12" r="1.5"/>\n' +
  '  </svg>\n' : '') +
'  ' + esc(c.label) + '\n' +
'</button>';

        if (s.state === 'ready') return dice;

        if (s.state === 'guarded') {
          return dice + '\n' +
'<form class="md-entry" style="margin-top:16px">\n' +
'  <input class="md-entry__input md-body-medium" type="text"\n' +
'         value="' + esc(c.existing) + '" aria-label="Ask Aria" />\n' +
'</form>\n' +
'<div class="md-roll">\n' +
'  <p class="md-roll__k md-body-small">Rolled — your own is still above</p>\n' +
'  <p class="md-roll__v md-body-large">' + esc(c.roll) + '</p>\n' +
'  <div class="md-roll__foot">\n' +
'    <button class="md-button md-button--filled md-button--sm" type="button">Use this instead</button>\n' +
'    <button class="md-button md-button--text md-button--sm" type="button">Keep mine</button>\n' +
'  </div>\n' +
'</div>';
        }

        return dice + '\n' +
'<div class="md-roll">\n' +
'  <p class="md-roll__k md-body-small">Rolled for you</p>\n' +
'  <p class="md-roll__v md-body-large">' + esc(c.roll) + '</p>\n' +
'  <div class="md-roll__foot">\n' +
'    <button class="md-button md-button--filled md-button--sm" type="button">' +
   esc(c.useLabel) + '</button>\n' +
   (c.again
? '    <button class="md-button md-button--text md-button--sm" type="button"\n' +
  '            data-act="roll">' + esc(c.againLabel) + '</button>\n' : '') +
   (c.again && c.back
? '    <button class="md-button md-button--text md-button--sm" type="button">Last roll</button>\n'
: '') +
'  </div>\n' +
'</div>';
      },

      /* The roll is the one place motion is allowed to be playful, so
         the spin runs on the live button and the repaint waits for it.
         Repainting first would destroy the element mid-spin, which is
         the same mistake as animating a popup in beside a control
         instead of transforming the control itself. */
      act: function (a, ctx) {
        if (a !== 'roll') return;
        return ctx.morph('rolled', function (stage) {
          var btn = stage.querySelector('.md-dice');
          if (btn) btn.classList.add('is-rolling');
        }).then(function () { ctx.announce('Rolled — and nothing you had was overwritten'); });
      }
    },

    /* ══════════════════════════════════════════════════════════
       INITIALLY · EXPRESSIVE INPUT

       Every one of these is a guess about what somebody meant, so
       every playground here is built around the same question in
       five different materials: can you SEE the guess before it
       becomes a fact, and can you fix it in one move?

         voice-input       what happens when nothing was heard
         visual-input      does it say which part it read, and
                           which part it could not
         handwriting       does the ink survive the reading
         gesture           is there a visible control doing the
                           same job
         structured-input  can you tell a pinned value from prose
       ══════════════════════════════════════════════════════════ */

    /* ── Model selection ────────────────────────────────────
       Eight states of the composer's own chip and the menu behind
       it. There is no second control and no settings page: a
       choice that only matters at the moment of asking belongs
       where the asking happens.

       Two states earn the most room. "Open" is where the whole
       argument lives — every row says what the model is FOR
       rather than what it is — and "Restricted" is where the
       library takes a position: an unavailable model is ABSENT,
       not greyed out, because a row you can see and never press
       is an advertisement for a thing you cannot have. */
    'model-selection': {
      initial: 'resting',

      customize: {
        groups: [
          { id: 'menu', label: 'The menu',
            states: ['open', 'automatic', 'changed', 'at-cap', 'restricted', 'retiring'],
            note: 'What a person is given to decide with. None of these is a specification.',
            controls: [
              { id: 'why', label: 'Say what each is for', type: 'toggle', value: true,
                capability: true,
                hint: 'Off, this is a list of names, and a list of names answers none of the ' +
                      'questions somebody actually has.' },
              { id: 'effort', label: 'Offer an effort level', type: 'toggle', value: true,
                hint: 'The second axis the industry converged on. How hard to think is a ' +
                      'different question from which model thinks, and they are set ' +
                      'separately.' },
              { id: 'when', label: 'Say when a change takes effect', type: 'toggle', value: true,
                capability: true,
                hint: 'Exactly one shipping product answers this, in one sentence. Everybody ' +
                      'else leaves people guessing whether switching rewrites what was ' +
                      'already said.' }
            ] },

          { id: 'after', label: 'Afterwards',
            states: ['resting', 'changed', 'attributed', 'at-cap'],
            note: 'What the product says about a choice once it has been made.',
            controls: [
              { id: 'credit', label: 'Say which model answered', type: 'toggle', value: true,
                capability: true,
                hint: 'Ahead of current practice &mdash; no mainstream product ships this. ' +
                      'But silent substitution does, which is what makes the absence worth ' +
                      'designing against.' }
            ] }
        ]
      },

      states: {
        resting:    { label: 'Resting',
                      trigger: 'The product at rest.',
                      behaviour: 'One small chip carrying two values: which model, and how ' +
                                 'hard to think. It is the composer&rsquo;s own mode slot, ' +
                                 'not a control added beside it.',
                      action: 'Open it' },
        open:       { label: 'Open',
                      trigger: 'The chip is pressed.',
                      behaviour: 'Every row says what the model is FOR and what choosing it ' +
                                 'costs. No context windows, no parameter counts &mdash; ' +
                                 'nobody chooses a model by its context window.',
                      action: 'Choose Automatic' },
        automatic:  { label: 'Automatic',
                      trigger: 'The router is selected.',
                      behaviour: 'And it names what it is optimising for. The credibility of ' +
                                 'a router rests entirely on whether its stated objective is ' +
                                 'its real one.',
                      action: 'Change the model' },
        changed:    { label: 'Changed',
                      trigger: 'A different model is chosen.',
                      behaviour: 'The label updates and the menu has already said what happens ' +
                                 'to the conversation: the change applies from the next ' +
                                 'message, and nothing already said is rewritten.',
                      action: 'Run out of allowance' },
        'at-cap':   { label: 'At your cap',
                      trigger: 'The week&rsquo;s allowance for a model is used up.',
                      behaviour: 'The row stays and says what answers instead. A model that ' +
                                 'silently becomes a different model is the failure this ' +
                                 'state exists to prevent &mdash; and it is shipping today.',
                      action: 'Let the organisation limit it' },
        restricted: { label: 'Restricted',
                      trigger: 'An organisation narrows what may be used.',
                      behaviour: 'The model is ABSENT, with one line saying why. Not a locked ' +
                                 'row: a row you can see and never press is an advertisement ' +
                                 'for a thing you cannot have.',
                      action: 'See one retiring' },
        retiring:   { label: 'Retiring',
                      trigger: 'A model has a sunset date.',
                      behaviour: 'Still selectable, and dated. The alternative is the ' +
                                 'disappearance people notice by the answer getting worse.',
                      action: 'See an answer attributed' },
        attributed: { label: 'Attributed',
                      trigger: 'An answer arrives.',
                      behaviour: 'Which model produced it &mdash; and whether it was the one ' +
                                 'you asked for. No mainstream product does this, and silent ' +
                                 'fallback is already normal.',
                      action: 'Back to resting' }
      },

      view: function (s) {
        var c = s.cfg;
        var st = s.state;
        var M = window.MaterialModel, S = window.MaterialSim;
        if (!M || !S || !S.composer) return '';

        var models = M.MODELS.map(function (m) {
          var o = Object.assign({}, m);
          if (c.why === false) { o.for = ''; o.note = ''; }
          return o;
        });

        if (st === 'at-cap') {
          models.forEach(function (m) {
            if (m.id === 'deep') {
              m.state = 'capped';
              m.note = c.why === false ? ''
                : 'You have used this week’s allowance. Swift is answering instead ' +
                  'until Monday.';
            }
          });
        }
        if (st === 'retiring') {
          models.forEach(function (m) {
            if (m.id === 'swift') { m.state = 'retiring'; m.until = 'in March'; }
          });
        }
        /* Absence, not a locked row. */
        if (st === 'restricted') {
          models = models.filter(function (m) { return m.id !== 'deep'; });
        }

        var cur = st === 'automatic' ? 'auto'
                : st === 'changed'   ? 'deep'
                : 'balanced';
        var open = st !== 'resting' && st !== 'attributed';

        var html = S.composer({
          agent: 'Aria',
          ask: 'Ask about the quarter…',
          plus: ['Attach a file', 'Add a source'],
          models: models, model: cur,
          effort: c.effort === false ? null : 'standard',
          aim: 'even',
          modesOpen: open,
          restricted: st === 'restricted'
            ? 'Your organisation has limited which models are available here.' : null
        });

        if (c.effort === false) {
          html = html.replace(/<div class="md-ml__sub">(?:(?!<\/div>)[\s\S])*?How hard to think[\s\S]*?<\/div>/, '');
        }
        if (c.when === false) {
          html = html.replace(/<p class="md-ml__note md-ml__note--when">[\s\S]*?<\/p>/, '');
        }

        /* Attribution belongs on an answer, so the state that
           shows it shows an answer. */
        if (st === 'attributed' && c.credit !== false) {
          html = '<div class="pv-mlturn">' +
              '<p class="pv-mlq">Compare this quarter against the last four.</p>' +
              '<p class="pv-mla">Up 8%, carried by mid-market at 21% against a flat ' +
                'enterprise.</p>' +
              M.credit('Swift', true) +
            '</div>' + html;
        }
        return html;
      },

      act: function (a, ctx) {
        var ORDER = ['resting', 'open', 'automatic', 'changed',
                     'at-cap', 'restricted', 'retiring', 'attributed'];
        var S = ctx.s;
        if (a.indexOf('go:') === 0) { S.state = a.slice(3); }
        /* The real control does the real thing. */
        else if (a === 'ax:mode') { S.state = S.state === 'open' ? 'resting' : 'open'; }
        else if (a.indexOf('model:pick:') === 0) {
          var id = a.slice(11);
          S.state = id === 'auto' ? 'automatic' : id === 'deep' ? 'changed' : 'resting';
        }
        else if (a.indexOf('model:aim:') === 0)    { return; }
        else if (a.indexOf('model:effort:') === 0) { return; }
        else return;
        ctx.paint();
        ctx.announce(S.state === 'resting' ? 'Model menu closed' : 'Model menu open');
        return ORDER;
      }
    },

    /* ── Knowledge bases ────────────────────────────────────
       Eight states of one panel. The control that carries the
       pattern is the CHECKBOX on each source: including and
       excluding without deleting is what makes a persistent scope
       real rather than decorative, and it is the one affordance
       here that cannot be mistaken for file management.

       "Left out" earns the most room, because it is the state
       that proves the difference from an attachment — the source
       is still there, still listed, and simply not being read. */
    'knowledge-base': {
      initial: 'ready',

      customize: {
        groups: [
          { id: 'scope', label: 'The scope',
            states: ['ready', 'left-out', 'partial', 'out-of-date', 'failed', 'no-access'],
            note: 'What the agent may read, and how visible that is. Nothing here deletes ' +
                  'anything.',
            controls: [
              { id: 'open', label: 'Show the sources', type: 'toggle', value: true,
                capability: true,
                hint: 'Closed is right most of the time: the question is usually &ldquo;what ' +
                      'scope am I in&rdquo;, not &ldquo;what is in it&rdquo;. Open is one ' +
                      'press away.' },
              { id: 'choose', label: 'Let sources be left out', type: 'toggle', value: true,
                capability: true,
                hint: 'Off, the only way to narrow an answer is to delete something. That is ' +
                      'the difference between a scope and a folder.' },
              { id: 'added', label: 'Say when each was added', type: 'toggle', value: true,
                hint: 'A source added six weeks ago by somebody else is a different thing ' +
                      'from one added this morning, and the answer may depend on which.' },
              { id: 'name', label: 'Knowledge base', type: 'text', value: 'Product research' }
            ] },

          { id: 'prov', label: 'Provenance',
            /* Including `cited` — the one state where these
               controls have anything to act on. Leaving it out
               put the settings on every state except the one
               they were written for. */
            states: ['cited', 'ready', 'left-out', 'partial'],
            note: 'What an answer says about where it came from.',
            controls: [
              { id: 'cite', label: 'Say which sources it read', type: 'toggle', value: true,
                capability: true,
                hint: 'Without this the answer is just as fluent and there is no way to tell ' +
                      'which of six sources it came from.' },
              { id: 'left', label: 'And which it could not', type: 'toggle', value: true,
                visibleWhen: function (c) { return c.cite !== false; },
                hint: 'The half that matters more. A citation list that omits it tells you ' +
                      'where the answer came from while hiding where it was not allowed ' +
                      'to look.' }
            ] }
        ]
      },

      states: {
        ready:       { label: 'Ready',
                       trigger: 'Every source has been read.',
                       behaviour: 'The scope, its size and when it last changed. This existed ' +
                                  'before the conversation and will outlive it &mdash; which ' +
                                  'is the entire difference from an attachment.',
                       action: 'Leave one out' },
        'left-out':  { label: 'Left out',
                       trigger: 'A source is turned off for answering.',
                       behaviour: 'It stays in the list at reduced emphasis, and the count ' +
                                  'moves. Nothing was deleted, and the act is reversible in ' +
                                  'one press.',
                       action: 'See one still reading' },
        partial:     { label: 'Partly ready',
                       trigger: 'A source has just been added.',
                       behaviour: 'Asking still makes sense &mdash; most of the material is ' +
                                  'there, and the answer will say what it could not see. ' +
                                  'Per source, never per base.',
                       action: 'See one go out of date' },
        'out-of-date': { label: 'Out of date',
                       trigger: 'A synced source changed after it was read.',
                       behaviour: 'The answer would be right about a version that no longer ' +
                                  'exists. Reading it again is one press, on the row.',
                       action: 'See one fail' },
        failed:      { label: 'Source failed',
                       trigger: 'A source could not be read.',
                       behaviour: 'One source, not the base. A knowledge base that calls ' +
                                  'itself broken because one PDF would not open has told you ' +
                                  'the wrong thing.',
                       action: 'See one you cannot open' },
        'no-access': { label: 'No access',
                       trigger: 'Somebody else added a source you cannot read.',
                       behaviour: 'Named but not readable, and with no checkbox to tick, ' +
                                  'because the choice is not yours to make. The knowledge ' +
                                  'base does not leak its contents.',
                       action: 'See it cited' },
        cited:       { label: 'Cited',
                       trigger: 'An answer arrives.',
                       behaviour: 'Which sources were read, and which were left out. The ' +
                                  'second list is what makes the first one checkable.',
                       action: 'See it empty' },
        empty:       { label: 'Empty',
                       trigger: 'A knowledge base with nothing in it.',
                       behaviour: 'Says what a source is for rather than showing an empty ' +
                                  'list &mdash; the distinction from attaching a file is the ' +
                                  'thing somebody needs at this moment.',
                       action: 'Back to ready' }
      },

      view: function (s) {
        var c = s.cfg;
        var st = s.state;
        var K = window.MaterialKB;
        if (!K) return '';

        function base(over) {
          return [
            { name: 'Onboarding interviews, Aug', kind: 'doc', state: 'ready',
              added: 'added 3 weeks ago' },
            { name: 'Support tickets Q3', kind: 'sheet', state: 'ready',
              added: 'added 3 weeks ago' },
            { name: 'First-run funnel', kind: 'sheet', state: 'ready',
              added: 'added 12 days ago' },
            { name: 'Competitor teardown', kind: 'url', state: 'ready',
              added: 'added 6 weeks ago' }
          ].map(function (x, i) {
            var o = Object.assign({}, x, over[i] || {});
            if (c.added === false) delete o.added;
            if (c.choose === false) delete o.on;
            return o;
          });
        }

        var SETS = {
          ready:        base([]),
          'left-out':   base([{}, { on: false }]),
          partial:      base([{}, {}, {}, { name: 'Usability session 4', kind: 'audio',
                                            state: 'reading', added: 'added today' }]),
          'out-of-date': base([{}, {}, {}, { state: 'stale',
                                             note: 'Changed since it was read' }]),
          failed:       base([{}, {}, {}, { name: 'Market sizing.pdf', kind: 'doc',
                                            state: 'failed',
                                            note: 'Could not be read — the file is protected' }]),
          'no-access':  base([{}, {}, {}, { name: 'Pricing research', kind: 'doc',
                                            state: 'denied', added: 'added by Dana' }]),
          cited:        base([{}, { on: false }]),
          empty:        []
        };
        var srcs = SETS[st] || [];

        var state = st === 'empty' ? 'empty'
                  : st === 'partial' ? 'partial'
                  : (st === 'failed' || st === 'no-access' || st === 'out-of-date')
                      ? 'trouble' : 'ready';

        var html = K.panel({
          name: c.name || 'Product research',
          sources: srcs,
          state: state,
          updated: 'updated today',
          open: st !== 'empty' && c.open !== false
        });

        /* The cited state shows the panel AND the provenance under
           an answer, because the two only make sense together. */
        if (st === 'cited' && c.cite !== false) {
          var used = srcs.filter(function (x) { return x.on !== false; })
                         .map(function (x) { return { name: x.name }; });
          var left = srcs.filter(function (x) { return x.on === false; })
                         .map(function (x) { return { name: x.name }; });
          html += K.cited(used, c.left === false ? [] : left);
        }
        if (c.choose === false) {
          html = html.replace(/<button class="md-kb__box[\s\S]*?<\/button>/g,
            '<span class="md-kb__box md-kb__box--void" aria-hidden="true"></span>');
        }
        return html;
      },

      act: function (a, ctx) {
        var ORDER = ['ready', 'left-out', 'partial', 'out-of-date',
                     'failed', 'no-access', 'cited', 'empty'];
        var S = ctx.s;
        if (a.indexOf('go:') === 0) { S.state = a.slice(3); }
        /* The real controls do the real thing: ticking a box in
           the preview includes and excludes, exactly as it does in
           a product. */
        else if (a.indexOf('kb:use:') === 0) {
          S.state = S.state === 'left-out' ? 'ready' : 'left-out';
        }
        else if (a === 'kb:open')  { S.cfg.open = true; }
        else if (a === 'kb:close') { S.cfg.open = false; }
        else if (a === 'kb:add')   { S.state = S.state === 'empty' ? 'partial' : 'partial'; }
        else if (a.indexOf('kb:refresh:') === 0) { S.state = 'ready'; }
        else if (a.indexOf('kb:drop:') === 0)    { S.state = 'ready'; }
        else if (a.indexOf('kb:peek:') === 0)    { return; }
        else return;
        ctx.paint();
        ctx.announce((window.MaterialKB.STATES[
          S.state === 'left-out' ? 'ready' : S.state] || {}).say || '');
        return ORDER;
      }
    },

    /* ── MCP connectors ─────────────────────────────────────
       Eight states of one panel. The panel has to carry four
       things a connector card does not, and each of them is a
       state or a control here rather than a paragraph in the
       documentation: a discovery step, a per-tool switch, an
       approval gate at call time, and a sentence saying who wrote
       the capability descriptions.

       "Needs approval" is the state that earns the most room,
       because it is the one the protocol asks for by name and the
       one clients most often reduce to a yes/no with the
       arguments hidden. */
    mcp: {
      initial: 'unset',

      customize: {
        groups: [
          { id: 'surface', label: 'The capability surface',
            states: ['ready', 'partial', 'approval', 'stale'],
            note: 'What the server says it offers. Everything here changes how much of that ' +
                  'is taken at face value.',
            controls: [
              { id: 'open', label: 'Show the capabilities', type: 'toggle', value: true,
                capability: true,
                hint: 'Closed is the right default for most people: &ldquo;Forge &mdash; ' +
                      'Ready, 9 tools&rdquo; is the summary. Open is what somebody auditing ' +
                      'it needs, and it must be one press away.' },
              { id: 'destructive', label: 'Offer destructive tools', type: 'toggle', value: true,
                hint: 'Off, the server&rsquo;s riskiest capabilities are simply not available. ' +
                      'A real option, and often the right one.' },
              { id: 'trust', label: 'Say who wrote the labels', type: 'toggle', value: true,
                capability: true,
                hint: 'The protocol says clients MUST treat tool annotations as untrusted ' +
                      'unless the server is trusted. Without this line the risk bands look ' +
                      'like the product&rsquo;s verdict rather than the server&rsquo;s claim.' },
              { id: 'name', label: 'Server', type: 'text', value: 'Forge' }
            ] },

          { id: 'gate', label: 'The approval gate',
            states: ['approval'],
            note: 'What a person is actually agreeing to when they approve a call.',
            controls: [
              { id: 'args', label: 'Show the arguments', type: 'toggle', value: true,
                capability: true,
                hint: 'The spec asks clients to show tool inputs before calling the server. ' +
                      'An approval that hides what is being sent has approved nothing in ' +
                      'particular.' }
            ] }
        ]
      },

      states: {
        unset:      { label: 'Not configured',
                      trigger: 'A server address and nothing else.',
                      behaviour: 'This is the whole difference from an app connector: there ' +
                                 'the tool surface is fixed and reviewed before you press ' +
                                 'anything; here nothing is known until the client asks.',
                      action: 'Validate it' },
        validating: { label: 'Validating',
                      trigger: 'The address is submitted.',
                      behaviour: 'Three named steps rather than a spinner. Reaching a server ' +
                                 'and understanding it are different problems with different ' +
                                 'fixes, and a failure has to say which.',
                      action: 'Start discovery' },
        discovering:{ label: 'Discovering',
                      trigger: 'The protocol version is agreed.',
                      behaviour: 'The client enumerates what the server exposes. Until this ' +
                                 'returns, nobody &mdash; including the product &mdash; knows ' +
                                 'what this connection can do.',
                      action: 'See what it offers' },
        ready:      { label: 'Ready',
                      trigger: 'Discovery completes.',
                      behaviour: 'Tools, resources and prompts, counted. Destructive tools ' +
                                 'arrive disabled, because the protocol&rsquo;s own defaults ' +
                                 'are pessimistic and so is this.',
                      action: 'Turn some off' },
        partial:    { label: 'Partly enabled',
                      trigger: 'Individual capabilities are switched off.',
                      behaviour: 'Per-tool, not per-server. Connecting is not consent to ' +
                                 'everything a server happens to expose, and the count in the ' +
                                 'header says how many were declined.',
                      action: 'See a call asking' },
        approval:   { label: 'Needs approval',
                      trigger: 'The agent tries to invoke a destructive tool.',
                      behaviour: 'At call time, with the arguments visible, and no ' +
                                 '&ldquo;always allow&rdquo;. A blanket yes to something that ' +
                                 'deletes is the failure this gate exists to prevent.',
                      action: 'See a stale list' },
        stale:      { label: 'Stale',
                      trigger: 'The server stops answering.',
                      behaviour: 'The list on screen is what it said earlier. A tool surface ' +
                                 'that can change underneath you has to say when it was last ' +
                                 'confirmed.',
                      action: 'See it fail' },
        unreachable:{ label: 'Unreachable',
                      trigger: 'The address answers with something this client cannot speak.',
                      behaviour: 'Names which step failed and says nothing was enabled, ' +
                                 'because a half-configured server is worse than none.',
                      action: 'Back to the start' }
      },

      view: function (s) {
        var c = s.cfg;
        var st = s.state;
        var M = window.MaterialMCP;
        if (!M) return '';

        var TOOLS = [
          { name: 'search_issues', what: 'Find issues by text, label or milestone', risk: 'read' },
          { name: 'get_issue',     what: 'Read one issue and its comments',         risk: 'read' },
          { name: 'list_releases', what: 'Read the release history',                risk: 'read' },
          { name: 'create_issue',  what: 'Open a new issue',                        risk: 'write' },
          { name: 'update_issue',  what: 'Change title, labels or assignee',        risk: 'write' },
          { name: 'cut_release',   what: 'Tag a release and start the pipeline',    risk: 'destroy' },
          { name: 'delete_branch', what: 'Remove a branch and its history',         risk: 'destroy' }
        ];
        var tools = TOOLS
          .filter(function (t) { return c.destructive !== false || t.risk !== 'destroy'; })
          .map(function (t) {
            return Object.assign({}, t, {
              on: st === 'partial' ? t.risk === 'read' : t.risk !== 'destroy'
            });
          });

        var has = st !== 'unset' && st !== 'validating' && st !== 'discovering' &&
                  st !== 'unreachable';

        var html = M.panel({
          name: c.name || 'Forge',
          url: st === 'unset' ? '' : 'https://forge.internal/mcp',
          state: st === 'approval' ? (c.destructive === false ? 'ready' : 'partial') : st,
          note: st === 'approval' ? 'Waiting for you' : '',
          why: st === 'unreachable'
            ? 'The address answered, but not with a protocol version this client speaks. ' +
              'Nothing was enabled.'
            : '',
          cached: '2 hours ago',
          tools: has ? tools : [],
          resources: has ? 4 : undefined,
          prompts: has ? 2 : undefined,
          open: has && c.open !== false,
          ask: st === 'approval'
            ? { server: c.name || 'Forge', tool: 'cut_release',
                what: 'Tags the release and starts the deploy pipeline. This cannot be undone ' +
                      'from here.',
                args: c.args === false ? null
                    : { tag: 'v4.12.0', branch: 'release/4.12', deploy: 'production' } }
            : null
        });

        if (c.trust === false) {
          html = html.replace(/<p class="md-mcp__trust">[\s\S]*?<\/p>/, '');
        }
        return html;
      },

      act: function (a, ctx) {
        var ORDER = ['unset', 'validating', 'discovering', 'ready',
                     'partial', 'approval', 'stale', 'unreachable'];
        var S = ctx.s;
        if (a.indexOf('go:') === 0) { S.state = a.slice(3); }
        /* The real controls do the real thing. */
        else if (a === 'mcp:add')    { S.state = S.state === 'unset' ? 'validating' : 'ready'; }
        else if (a === 'mcp:cancel' || a === 'mcp:remove') { S.state = 'unset'; }
        /* Show/hide is a SETTING, not a state — it is the same
           panel either way — so it writes to the config the
           Customize panel also writes to. */
        else if (a === 'mcp:open')   { S.cfg.open = true; }
        else if (a === 'mcp:close')  { S.cfg.open = false; }
        else if (a.indexOf('mcp:tool:') === 0) {
          S.state = S.state === 'partial' ? 'ready' : 'partial';
        }
        else if (a === 'mcp:approve' || a === 'mcp:deny') { S.state = 'ready'; }
        else return;
        ctx.paint();
        ctx.announce((window.MaterialMCP.STATES[S.state] || {}).say || '');
        return ORDER;
      }
    },

    /* ── Connectors ─────────────────────────────────────────
       Eight states of one card. The card appears in two places —
       a settings list and, more importantly, inside a
       conversation where the agent has just found a wall — and
       the "Inside a conversation" switch is the one that matters:
       it is the same component, and only the sentence above it
       changes.

       The state that earns the most room is "Needs your approval",
       because that is where the scope list is doing the work. The
       provider's consent screen is written by the party that
       benefits from it; this one is written by the product, and
       it arrives early enough to refuse cheaply. */
    connectors: {
      initial: 'available',

      customize: {
        groups: [
          { id: 'ask', label: 'What it asks for',
            states: ['available', 'authorise', 'connected', 'limited',
                     'stale', 'error', 'blocked', 'connecting'],
            note: 'Access is a ladder, not a switch. Everything here changes what the card ' +
                  'promises the agent will be able to do.',
            controls: [
              { id: 'write', label: 'Ask to write', type: 'toggle', value: false,
                hint: 'A different question from reading, and it should be asked as one. ' +
                      'Bundled, a summarising assistant ends up able to close tickets.' },
              { id: 'admin', label: 'Ask to manage settings', type: 'toggle', value: false,
                hint: 'Almost never needed to answer a question. Leave it on and watch the ' +
                      'list make the over-reach visible &mdash; which is the argument for ' +
                      'writing the list.' },
              { id: 'scopes', label: 'Show what access means', type: 'toggle', value: true,
                capability: true,
                hint: 'Off, the person is approving a logo. The provider&rsquo;s consent ' +
                      'screen is not a substitute: it is written by the other party and it ' +
                      'arrives after the decision has been made.' },
              { id: 'name', label: 'Service', type: 'text', value: 'Beacon' }
            ] },

          { id: 'where', label: 'Where it appears',
            states: ['available', 'authorise', 'connected', 'limited',
                     'stale', 'error', 'blocked', 'connecting'],
            note: 'The same card, in the two places a connector is genuinely encountered.',
            controls: [
              { id: 'inline', label: 'Inside a conversation', type: 'toggle', value: true,
                capability: true,
                hint: 'On, the agent has hit a wall and is naming the door. Off, this is a ' +
                      'row in a settings list that somebody went looking for.' },
              { id: 'account', label: 'Name the account', type: 'toggle', value: true,
                visibleWhen: function (c, st) {
                  return st === 'connected' || st === 'limited' || st === 'stale';
                },
                hint: '&ldquo;Connected as whom&rdquo; is the question people actually have ' +
                      'about a connection they set up months ago.' }
            ] }
        ]
      },

      states: {
        available:  { label: 'Available',
                      trigger: 'The agent needs something it has not been given.',
                      behaviour: 'Names the service, says what connecting would allow, and ' +
                                 'says who you will be signing in with &mdash; all before ' +
                                 'anything leaves the product.',
                      action: 'Press Connect' },
        authorise:  { label: 'Needs your approval',
                      trigger: 'Connect is pressed.',
                      behaviour: 'The decision point, in the product&rsquo;s own words. This ' +
                                 'is the step products skip, and then wonder why nobody reads ' +
                                 'the provider&rsquo;s scope screen.',
                      action: 'Allow it' },
        connecting: { label: 'Connecting',
                      trigger: 'Approval is given.',
                      behaviour: 'The product does not impersonate the sign-in. It waits, says ' +
                                 'it is waiting, and leaves a way out.',
                      action: 'See it connected' },
        connected:  { label: 'Connected',
                      trigger: 'The service confirms.',
                      behaviour: 'The word, the account, and a dot &mdash; in that order. A ' +
                                 'green dot on its own is nothing to anyone who cannot see it.',
                      action: 'See a narrower grant' },
        limited:    { label: 'Read only',
                      trigger: 'Some of what was asked for was refused, or never asked for.',
                      behaviour: 'Connected is not a permission. This state exists so that ' +
                                 '&ldquo;it is connected but it cannot do that&rdquo; is ' +
                                 'visible before somebody asks it to.',
                      action: 'Let the sign-in expire' },
        stale:      { label: 'Needs reauth',
                      trigger: 'The sign-in expires.',
                      behaviour: 'The agent stops rather than guessing, and the way back is ' +
                                 'one press. The state most connector designs forget, and the ' +
                                 'one people meet most often.',
                      action: 'See it fail' },
        error:      { label: 'Error',
                      trigger: 'The service cannot be reached.',
                      behaviour: 'Says what happened rather than what failed internally, and ' +
                                 'keeps a retry. Distinct from an expired sign-in, because ' +
                                 'the remedies are different.',
                      action: 'See it blocked' },
        blocked:    { label: 'Blocked by admin',
                      trigger: 'The organisation has turned this connector off.',
                      behaviour: 'Says who decided and offers the only real way forward, which ' +
                                 'is a person rather than a retry. No Connect button, because ' +
                                 'pressing it could never work.',
                      action: 'Back to available' }
      },

      view: function (s) {
        var c = s.cfg;
        var st = s.state;
        var C = window.MaterialConnect;
        if (!C) return '';

        var asking = ['read', 'search']
          .concat(c.write ? ['write'] : [])
          .concat(c.admin ? ['admin'] : []);
        var granted = st === 'connected' ? asking
                    : st === 'limited'   ? ['read']
                    : st === 'stale'     ? asking : [];

        var BECAUSE = {
          available: 'Your design backlog lives in ' + (c.name || 'Beacon') + ', and I have ' +
                     'never been given it. Here is what connecting would let me do.',
          authorise: 'Before I hand you over: this is what I will be able to do once you ' +
                     'sign in.',
          connecting: 'Waiting for you to finish signing in.',
          connected: 'Connected. I can search this from now on without being asked again.',
          limited: 'Connected, but read only — I can find things here and I cannot change them.',
          stale: 'The sign-in has expired, so I stopped rather than guessing. Signing in again ' +
                 'picks up exactly where this left off.',
          error: 'I could not reach it just now. Nothing was changed.',
          blocked: 'Your organisation has turned this connector off for everyone.'
        };

        return C.card({
          inline: c.inline !== false,
          name: c.name || 'Beacon',
          mark: (c.name || 'Beacon').slice(0, 2),
          state: st,
          because: c.inline !== false ? BECAUSE[st] : '',
          blurb: 'Issue tracking for the design and platform teams.',
          account: (c.account !== false &&
                    (st === 'connected' || st === 'limited' || st === 'stale'))
                    ? 'p.singh@intelligaia.com' : '',
          asking: asking,
          granted: granted,
          scopes: c.scopes !== false
        });
      },

      act: function (a, ctx) {
        var ORDER = ['available', 'authorise', 'connecting', 'connected',
                     'limited', 'stale', 'error', 'blocked'];
        var S = ctx.s;
        if (a.indexOf('go:') === 0) { S.state = a.slice(3); }
        /* The controls on the card are the real ones, so they do
           the real thing. */
        else if (a === 'conn:connect') {
          S.state = S.state === 'stale' || S.state === 'error' ? 'connected' : 'authorise';
        }
        else if (a === 'conn:allow')   { S.state = 'connecting'; }
        else if (a === 'conn:cancel')  { S.state = 'available'; }
        else if (a === 'conn:off')     { S.state = 'available'; }
        else if (a === 'conn:manage')  { S.state = S.state === 'connected' ? 'limited' : 'connected'; }
        else if (a === 'conn:ask')     { return; }
        else return;
        ctx.paint();
        ctx.announce((window.MaterialConnect.STATES[S.state] || {}).say || '');
        return ORDER;
      }
    },

    /* ── Attachments ────────────────────────────────────────
       Eight states of the SHARED composer carrying context. The
       first is the composer with nothing on it, because the claim
       of this pattern is that an attachment is a thing that joins
       a message rather than a place you go.

       Two of the eight earn most of the room. "Uploading" and
       "Reading" have to be unmistakably different — a file that
       has arrived has not been read, and collapsing the two is
       why people fire a request at a document nothing has opened.
       And a refusal has to name its limit, or it is a dead end
       with a red border. */
    attachments: {
      initial: 'empty',

      customize: {
        groups: [
          { id: 'object', label: 'The object',
            states: ['one', 'uploading', 'processing', 'several', 'toobig', 'failed', 'image'],
            note: 'One component per attached thing, inside the composer. Everything here ' +
                  'changes what the object says — never which composer it sits in.',
            controls: [
              { id: 'meta', label: 'Show type and size', type: 'toggle', value: true,
                hint: 'Type earns its place because it predicts whether the agent can read ' +
                      'it. Size earns its place only next to a limit.' },
              { id: 'thumb', label: 'Preview images', type: 'toggle', value: true,
                visibleWhen: function (c, st) { return st === 'image'; },
                capability: true,
                hint: 'Images get a thumbnail because it identifies the file faster than its ' +
                      'name. Documents deliberately do not — an invented page preview is a ' +
                      'claim about content nobody has read.' },
              { id: 'name', label: 'File', type: 'text', value: 'Northwind-proposal.pdf' }
            ] },

          { id: 'lifetime', label: 'Lifetime',
            states: ['empty', 'one', 'processing', 'several', 'toobig', 'failed', 'image'],
            note: 'The question a remove control raises, and the answer it owes.',
            controls: [
              { id: 'lifetime', label: 'Say how long it lasts', type: 'toggle', value: true,
                capability: true,
                hint: 'Removal is forward-only in every product that documents it. Offering ' +
                      'the control without the sentence implies an undo the product cannot ' +
                      'perform.' },
              { id: 'remove', label: 'Allow removing', type: 'toggle', value: true,
                hint: 'Off, the only way to correct a mis-attached file is to start the ' +
                      'conversation again.' }
            ] }
        ]
      },

      states: {
        empty:      { label: 'Nothing attached',
                      trigger: 'The product at rest.',
                      behaviour: 'The ordinary composer. Attaching is one control away and it ' +
                                 'does not go anywhere else — the row appears above the input, ' +
                                 'inside the same bar.',
                      action: 'Attach one' },
        uploading:  { label: 'Uploading',
                      trigger: 'A file is chosen.',
                      behaviour: 'The object joins the composer immediately, carrying a ' +
                                 'determinate bar because there is a real number to show.',
                      action: 'Finish the upload' },
        processing: { label: 'Reading',
                      trigger: 'The bytes have arrived.',
                      behaviour: 'Uploaded is not readable. The bar stops claiming a ' +
                                 'percentage it no longer has, and the word changes.',
                      action: 'Finish reading' },
        one:        { label: 'Ready',
                      trigger: 'The agent can read it.',
                      behaviour: 'Name, type, and the word Ready. The composer has grown by ' +
                                 'exactly one row and nothing else has moved.',
                      action: 'Attach a second' },
        several:    { label: 'Several',
                      trigger: 'More context is added.',
                      behaviour: 'They wrap within the row. Each keeps its own state, because ' +
                                 'one failing has nothing to do with the others.',
                      action: 'See one refused' },
        toobig:     { label: 'Too large',
                      trigger: 'The file is over the limit.',
                      behaviour: 'Refused before a byte moves, with the limit in the message, ' +
                                 'and still listed so it can be swapped rather than hunted for.',
                      action: 'See an upload fail' },
        failed:     { label: 'Failed',
                      trigger: 'The upload does not complete.',
                      behaviour: 'A retry control on the object itself, so recovering costs ' +
                                 'one press rather than finding the file again.',
                      action: 'See an image' },
        image:      { label: 'Image',
                      trigger: 'The attachment is a picture.',
                      behaviour: 'A real thumbnail, because for an image it identifies the ' +
                                 'file faster than the filename does.',
                      action: 'Back to empty' }
      },

      /* THE COMPOSER ITSELF, carrying attachments — not a drawing
         of it. `MaterialSim.composer` is the same function the
         twenty-six simulators render through. */
      view: function (s) {
        var c = s.cfg;
        var st = s.state;
        var M = window.MaterialSim, A = window.MaterialAttach;
        if (!M || !M.composer || !A) return '';

        var nm = c.name || 'Northwind-proposal.pdf';
        function f(o) {
          if (!c.meta) { delete o.type; delete o.size; }
          if (c.remove === false) o.fixed = true;
          return o;
        }

        var SETS = {
          empty:      [],
          uploading:  [f({ name: nm, kind: 'doc', type: 'PDF', size: '2.4 MB',
                           state: 'uploading', pct: 71 })],
          processing: [f({ name: nm, kind: 'doc', type: 'PDF · 34 pages', size: '2.4 MB',
                           state: 'processing' })],
          one:        [f({ name: nm, kind: 'doc', type: 'PDF · 34 pages', size: '2.4 MB',
                           state: 'ready' })],
          several:    [f({ name: nm, kind: 'doc', type: 'PDF · 34 pages', size: '2.4 MB',
                           state: 'ready' }),
                       f({ name: 'rate-card.xlsx', kind: 'sheet', type: 'Spreadsheet',
                           size: '88 KB', state: 'ready' }),
                       f({ name: 'security-review.docx', kind: 'doc', type: 'Document',
                           size: '340 KB', state: 'processing' })],
          toobig:     [f({ name: 'full-tender-pack.zip', kind: 'doc', type: 'Archive',
                           size: '840 MB', state: 'toobig',
                           note: 'Too large — 500 MB is the limit' })],
          failed:     [f({ name: nm, kind: 'doc', type: 'PDF', size: '2.4 MB',
                           state: 'failed', note: 'Upload failed — connection lost' })],
          image:      [f({ name: 'pricing-table.png', kind: 'image',
                           thumb: c.thumb === false ? '' :
                             'linear-gradient(135deg,#d7d2e6,#eee8f4)',
                           type: 'PNG', size: '1.2 MB', state: 'ready' })]
        };
        var list = SETS[st] || [];

        var html = M.composer({
          agent: 'Aria',
          ask: 'Ask about the proposal…',
          plus: ['Upload a file', 'Upload a photo', 'Paste text'],
          atts: list
        });

        /* The remove control is what raises the lifetime question,
           so the answer is rendered with it and disappears with it. */
        if (c.remove === false) {
          html = html.replace(/<button class="md-att__btn md-att__btn--x"[\s\S]*?<\/button>/g, '');
        }
        if (c.lifetime && list.length) {
          html += '<p class="ax__cnote ax__cnote--life">' + A.LIFETIME + '</p>';
        }
        return html;
      },

      act: function (a, ctx) {
        var ORDER = ['empty', 'uploading', 'processing', 'one', 'several',
                     'toobig', 'failed', 'image'];
        if (a.indexOf('go:') === 0) { ctx.s.state = a.slice(3); }
        /* The controls in the preview are the real ones, so they
           carry the real actions: removing in the preview removes. */
        else if (a.indexOf('att:rm:') === 0) { ctx.s.state = 'empty'; }
        else if (a.indexOf('att:retry:') === 0) { ctx.s.state = 'uploading'; }
        else if (a === 'ax:plus') {
          ctx.s.state = ctx.s.state === 'empty' ? 'uploading' : ctx.s.state;
        } else return;
        ctx.paint();
        ctx.announce(window.MaterialAttach
          ? window.MaterialAttach.summary(ctx.s.state === 'empty' ? [] : [{ state: 'ready' }])
          : '');
        return ORDER;
      }
    },

    /* ── Voice input ────────────────────────────────────────
       Six states of ONE component — the shared prompt composer —
       and the first of them is that composer doing nothing
       special at all. A preview that never shows the resting
       state cannot make this pattern's argument, which is that
       voice is a mode of the bar you were already using.

       Two of the six earn most of the room. "Listening" and
       "Speaking" have to be unmistakably different, or an open
       microphone looks identical to a heard one. And "Processing"
       has to be visibly less than either, or the strokes go on
       implying that something is still being heard.

       The selector is a documentation affordance: in a product
       these states arrive because somebody pressed a microphone
       and started talking, which is what the simulator shows. */
    'voice-input': {
      initial: 'default',

      customize: {
        groups: [
          { id: 'composer', label: 'The composer',
            states: ['default', 'listening', 'speaking', 'processing', 'muted', 'error'],
            note: 'One component. Voice is a mode of it, and everything below changes what ' +
                  'the bar contains — never which bar it is.',
            controls: [
              { id: 'amp', label: 'Respond to the voice', type: 'toggle', value: true,
                capability: true,
                hint: 'Off, the strokes run a loop instead — which is what makes a hung ' +
                      'microphone look healthy.' },
              { id: 'mode', label: 'Offer a mode chip', type: 'toggle', value: false,
                visibleWhen: function (c, st) { return st === 'default'; },
                hint: 'Only where a scenario actually has two modes. A control with no use ' +
                      'in the screen it is standing in is furniture.' },
              { id: 'agentName', label: 'Agent', type: 'text', value: 'Aria' }
            ] },

          { id: 'words', label: 'In words',
            states: ['listening', 'speaking', 'processing', 'muted', 'error'],
            note: 'Every state has a text equivalent, in a live region. None of the motion ' +
                  'is allowed to be the only way to know what is going on.',
            controls: [
              { id: 'status', label: 'Say the state in words', type: 'toggle', value: true,
                capability: true,
                hint: 'Turn this off and the pattern depends entirely on five small moving ' +
                      'strokes, which rules out anybody who cannot see them or has asked ' +
                      'for less movement.' },
              { id: 'transcript', label: 'Show the line being heard', type: 'toggle', value: true,
                visibleWhen: function (c, st) { return st === 'speaking'; },
                hint: 'One line, clipped. A transcript that grows the composer as you speak ' +
                      'is a composer that moves under your hand.' }
            ] }
        ]
      },

      states: {
        default:    { label: 'Default',
                      trigger: 'The product at rest.',
                      behaviour: 'The ordinary composer, with a microphone in it where the ' +
                                 'scenario supports speaking. Nothing else about it is ' +
                                 'special, and that is the whole claim of the pattern.',
                      action: 'Press the microphone' },
        listening:  { label: 'Listening',
                      trigger: 'The microphone control is pressed.',
                      behaviour: 'Same bar, same width, about a line taller. The strokes sit ' +
                                 'at rest because nothing is being said — an open microphone ' +
                                 'drawn like a heard one is the commonest lie here.',
                      action: 'Say something' },
        speaking:   { label: 'Speaking',
                      trigger: 'Speech is detected.',
                      behaviour: 'The strokes follow amplitude with smooth interpolation, ' +
                                 'gaps included. Middle strokes take more of it than outer ' +
                                 'ones, which is what stops the row reading as a bar chart.',
                      action: 'Stop, and let it think' },
        processing: { label: 'Processing',
                      trigger: 'The utterance completes.',
                      behaviour: 'The same strokes, shorter and slower, rather than a spinner ' +
                                 'dropped where the voice used to be. Nothing about the bar ' +
                                 'moves except what is inside it.',
                      action: 'Mute the microphone' },
        muted:      { label: 'Muted',
                      trigger: 'Mute is pressed.',
                      behaviour: 'Colour drains and the strokes stop moving with speech. An ' +
                                 'indicator that still moves while muted is claiming to hear ' +
                                 'you.',
                      action: 'See it fail' },
        error:      { label: 'Error',
                      trigger: 'The microphone is taken, or permission is refused.',
                      behaviour: 'The semantic error accent, no motion, a sentence saying what ' +
                                 'happened — and the keyboard route still in the same bar, ' +
                                 'because voice failing is not a reason to lose the composer.',
                      action: 'Back to the composer' }
      },

      /* THE COMPOSER ITSELF. Not a drawing of it, not a copy kept
         in step by hand: `MaterialSim.composer` is the function the
         twenty-five simulators render through, called here with an
         options object instead of a scenario. If the preview and
         the product ever disagree, it will be because somebody
         deleted this call. */
      view: function (s) {
        var c = s.cfg;
        var st = s.state;
        var agent = c.agentName || 'Aria';
        var M = window.MaterialSim;
        if (!M || !M.composer) return '';

        var STATUS = {
          listening: 'Listening…', speaking: 'Listening…', processing: 'Thinking…',
          muted: 'Microphone muted', error: 'Microphone unavailable'
        };
        var LINE = {
          speaking: '“Compare the onboarding feedback from this quarter with the previous one…',
          muted: agent + ' is still here; it just cannot hear you.',
          error: 'Another application is using it. Type instead, or try again.'
        };

        var html = M.composer({
          agent: agent,
          ask: 'Ask ' + agent + ' about the feedback…',
          plus: ['Attach a file', 'Add a source'],
          modes: c.mode ? ['Balanced', 'Thorough'] : null,
          mic: true,
          mode: st === 'default' ? 'text' : 'voice',
          voice: st,
          status: c.status ? STATUS[st] : '',
          /* Muted and error say their piece in the second line
             whether or not the transcript is on: they are not a
             transcript, they are the reason. */
          line: (st === 'speaking' ? (c.transcript ? LINE.speaking : '') : (LINE[st] || ''))
        });

        /* With the response turned off the indicator loses its live
           hook and falls back to the sway alone — which is exactly
           the failure the toggle exists to show. */
        if (!c.amp) html = html.replace(/ data-vx-live="[a-z]+"/, '');
        if (!c.status) html = html.replace(/<span class="ax__vstatus"[^>]*><\/span>/, '');
        return html;
      },

      /* The driver is started after every paint, because a repaint
         replaces the element the previous loop was writing to. */
      mounted: function (root) {
        if (window.MaterialVoice) window.MaterialVoice.drive(root);
      },

      act: function (a, ctx) {
        if (a.indexOf('go:') === 0) { ctx.s.state = a.slice(3); }
        /* The controls in the preview are the real ones, so they
           carry the real actions. Pressing Mute in the preview has
           to do what pressing Mute does. */
        else if (a === 'voice:start')  { ctx.s.state = 'listening'; }
        else if (a === 'voice:stop')   { ctx.s.state = 'default'; }
        else if (a === 'voice:cancel') { ctx.s.state = 'default'; }
        else if (a === 'voice:retry')  { ctx.s.state = 'listening'; }
        else if (a === 'voice:mute')   {
          ctx.s.state = ctx.s.state === 'muted' ? 'listening' : 'muted';
        } else return;
        ctx.paint();
        ctx.announce(({
          default: 'Text composer', listening: 'Listening',
          speaking: 'Listening', processing: 'Thinking',
          muted: 'Microphone muted', error: 'Microphone unavailable'
        })[ctx.s.state] || '');
      }
    },

    /* ── Visual input ───────────────────────────────────────
       Five states, one per act plus the two that carry the
       argument: an image sitting there doing nothing, and an
       answer that admits what the crop removed. */
    'visual-input': {
      initial: 'empty',

      customize: {
        groups: [
          { id: 'attach', label: 'Attaching',
            states: ['empty', 'attached'],
            controls: [
              { id: 'ways', label: 'What the empty state offers', type: 'text',
                value: 'Paste, drag, choose a file, or use the camera' },
              { id: 'kind', label: 'What it says the image is', type: 'text',
                value: 'Screenshot · 1440 × 900' },
              { id: 'retain', label: 'Say what happens to the image', type: 'toggle',
                value: true, capability: true,
                hint: 'A photo is the most personal thing most people will ever hand an ' +
                      'agent. Say it where they hand it over, not in a policy.' },
              { id: 'retainText', label: 'The line', type: 'text',
                value: 'Kept with this ticket · not used for training' }
            ] },

          { id: 'ask', label: 'Instructing',
            states: ['instructing'],
            note: 'The half products drop. An image is not a question.',
            controls: [
              { id: 'wait', label: 'Wait for an instruction', type: 'toggle', value: true,
                capability: true,
                hint: 'Turn this off to see the failure: the same screenshot supports three ' +
                      'different questions, and it will answer one of them.' },
              { id: 'question', label: 'The question', type: 'text',
                value: 'is this the same bug as #4412?' }
            ] },

          { id: 'read', label: 'Analysing',
            states: ['region', 'reshoot'],
            controls: [
              { id: 'region', label: 'Mark the region the answer used', type: 'toggle',
                value: true, capability: true,
                hint: 'An answer that does not say where it looked cannot be checked.' },
              { id: 'answer', label: 'The reading', type: 'text',
                value: 'a null map key in ScheduleResolver.' },
              { id: 'reshoot', label: 'The specific shot that would settle it', type: 'text',
                value: 'Scroll up three lines and screenshot again.' }
            ] }
        ]
      },

      states: {
        empty:       { label: 'Empty',
                       trigger: 'No image yet.',
                       behaviour: 'The four ways in are named, because people reach for ' +
                                  'different ones — and the drop target is the whole surface, ' +
                                  'not a 24px paperclip.',
                       action: 'Attach one' },
        attached:    { label: 'Attached',
                       trigger: 'The image is here.',
                       behaviour: 'And nothing is happening. Visibly waiting, not visibly ' +
                                  'working — no spinner, because no answer is coming until ' +
                                  'somebody says what they want. This is the state most ' +
                                  'implementations skip.',
                       action: 'Write the question' },
        instructing: { label: 'Instructing',
                       trigger: 'The question is typed against the image.',
                       behaviour: 'Image and words go together as one message. This is what ' +
                                  'turns an attachment into a request — and the same ' +
                                  'screenshot would have supported three different ones.',
                       action: 'Send it' },
        region:      { label: 'Region found',
                       trigger: 'The reading settles.',
                       behaviour: 'The edge hardens, the lines it used read hotter than the ' +
                                  'rest, and the answer names the region before it states a ' +
                                  'conclusion.',
                       action: 'See what it could not read' },
        reshoot:     { label: 'Needs another shot',
                       trigger: 'Part of the image could not be read.',
                       behaviour: 'The crop is shown as a crop, the gap is named, and it asks ' +
                                  'for one specific further image. “A clearer photo” is not a ' +
                                  'request anybody can act on.',
                       action: 'Back to empty' }
      },

      view: function (s) {
        var c = s.cfg;
        var st = s.state;

        function shot(mode) {
          var lines = '';
          for (var i = 0; i < 8; i++) {
            var cls = '';
            if (mode === 'hot' && i >= 3 && i <= 5) cls = ' class="is-hot"';
            if (mode === 'cut' && i === 0)          cls = ' class="is-cut"';
            if (mode === 'cut' && i >= 3 && i <= 5) cls = ' class="is-hot"';
            lines += '      <b' + cls + '></b>\n';
          }
          return '' +
'    <div class="md-vis__shot" role="img"\n' +
'         aria-label="Screenshot of a stack trace, eight lines">\n' + lines +
'    </div>\n';
        }

        /* `false` means no region at all — the correct state for
           everything before analysis has run. A marked region on an
           image nobody has asked about yet is the exact failure
           this pattern is about. */
        function region(kind) {
          return (kind !== false && c.region)
? '    <span class="md-vis__region' + (kind ? ' md-vis__region--' + kind : '') +
  '"\n          style="--x:6%;--y:36%;--w:86%;--h:30%"></span>\n' : '';
        }

        function figure(mode, kind, caption) {
          return '' +
'<figure class="md-vis">\n' +
'  <div class="md-vis__frame">\n' + shot(mode) + region(kind) +
'  </div>\n' +
'  <p class="md-vis__meta">' + esc(c.kind) +
   (c.retain ? ' <span>·</span> ' + esc(c.retainText) : '') + '</p>\n' +
   (caption || '') +
'</figure>';
        }

        if (st === 'empty') return '' +
'<div class="md-vis__drop" role="button" tabindex="0" data-act="attach">\n' +
'  <strong>Add an image</strong>\n' +
'  <span>' + esc(c.ways) + '</span>\n' +
'</div>';

        if (st === 'attached') return figure('', false,
'  <p class="md-vis__wait">Attached, and nothing is being asked. This same screenshot ' +
'supports at least three different questions — what the error is, whether it matches a known ' +
'bug, or how to fix it — and they have three different answers.</p>\n' +
'  <div class="md-vis__read">\n' +
'    <button class="md-button md-button--filled md-button--sm" type="button"\n' +
'            data-act="instruct">Write the question</button>\n' +
'  </div>\n');

        if (st === 'instructing') return c.wait
? figure('', false,
  '  <div class="md-sel__bar" style="margin-top:12px">\n' +
  '    <span class="md-sel__q md-body-medium">' + esc(c.question) +
  '<span class="pv-caretbar"></span></span>\n' +
  '    <button class="md-button md-button--filled md-button--sm" type="button"\n' +
  '            data-act="read">Send</button>\n' +
  '  </div>\n')
: figure('hot', '',
  '  <div class="md-vis__read">\n' +
  '    <p class="md-vis__t md-body-medium">This is a NullPointerException in ' +
  'ScheduleResolver — here is how to fix it.</p>\n' +
  '    <p class="md-vis__gap md-body-small">Nobody asked for a fix. It answered the moment ' +
  'the image landed, and the question the person actually had is now three paragraphs ' +
  'away.</p>\n' +
  '  </div>\n');

        if (st === 'region') return figure('hot', '',
'  <div class="md-vis__read">\n' +
'    <p class="md-vis__t md-body-medium">In the highlighted lines: ' + esc(c.answer) + '</p>\n' +
   (c.region ? ''
: '    <p class="md-vis__gap md-body-small">No region marked. “The highlighted lines” refers ' +
  'to nothing, and nobody can check this against the image.</p>\n') +
'  </div>\n');

        /* reshoot */
        return figure('cut', '',
'  <div class="md-vis__read">\n' +
'    <p class="md-vis__t md-body-medium">In the highlighted lines: ' + esc(c.answer) + '</p>\n' +
'    <p class="md-vis__gap md-body-small">The first three frames are above the crop, so I ' +
'cannot see where it started. <b>' + esc(c.reshoot) + '</b></p>\n' +
'  </div>\n');
      },

      act: function (a, ctx) {
        var go = function (st, say) { ctx.s.state = st; ctx.paint(); if (say) ctx.announce(say); };
        if (a === 'attach')   return go('attached', 'Image attached. Nothing is being asked yet');
        if (a === 'instruct') return go('instructing');
        if (a === 'read')     return go('region', 'Region used: lines 4 to 6');
      }
    },

    /* ── Handwriting ────────────────────────────────────────
       Five states across the two modes this pattern covers: an
       ordinary field a pen writes into, where the ink is
       transient — and ink that is itself the record, where
       converting is destructive. Merging those two is the failure
       the page is about. */
    handwriting: {
      initial: 'nopen',

      customize: {
        groups: [
          { id: 'field', label: 'Writing into a field',
            states: ['nopen', 'writing'],
            note: 'There is no handwriting button here, and there should not be one: the ' +
                  'platform already lets a pen write into any field.',
            controls: [
              { id: 'text', label: 'What was written', type: 'text',
                value: 'is this working right?' },
              { id: 'bounds', label: 'Show the handwriting bounds', type: 'toggle',
                value: true, capability: true,
                hint: 'Android’s are 40dp above and below, 10dp either side. Without them a ' +
                      'stroke has to start inside a 52px target, and every one that misses ' +
                      'is silently lost.' }
            ] },

          { id: 'ink', label: 'Ink as the record',
            states: ['ink', 'lowconf', 'corrected'],
            note: 'Maths, annotation, anything drawn in front of somebody. Here converting ' +
                  'is destructive.',
            controls: [
              { id: 'keep', label: 'Keep the strokes', type: 'toggle', value: true,
                capability: true,
                hint: 'Replacing ink with the reading throws away the only thing a reader ' +
                      'can appeal to.' },
              { id: 'doubt', label: 'The part it was unsure of', type: 'text',
                value: 'squared' },
              { id: 'mark', label: 'Mark low-confidence readings', type: 'toggle', value: true,
                hint: 'Off, a wrong exponent is indistinguishable from a right one — and it ' +
                      'is a different equation.' }
            ] }
        ]
      },

      states: {
        nopen:     { label: 'No pen',
                     trigger: 'A touch or mouse session.',
                     behaviour: 'An ordinary text field, and nothing at all about handwriting ' +
                                'on screen. This is most of the time, and it is why there is ' +
                                'no button.',
                     action: 'Write into it with a pen' },
        writing:   { label: 'Writing',
                     trigger: 'A pen writes into that same field.',
                     behaviour: 'Strokes at one-to-one, unsmoothed, converting behind the nib ' +
                                '— and the handwriting bounds around the field are why a ' +
                                'stroke starting slightly outside still lands in it.',
                     action: 'Switch to ink as the record' },
        ink:       { label: 'Ink kept',
                     trigger: 'A page of working, written by hand.',
                     behaviour: 'The strokes are the document. No conversion has happened and ' +
                                'none needs to: the ink is already a usable record.',
                     action: 'Recognise it' },
        lowconf:   { label: 'Low confidence',
                     trigger: 'The recogniser could not settle the exponent.',
                     behaviour: 'The reading sits beneath the ink, never over it, with the ' +
                                'doubtful part marked in the agent’s own primary. In an ' +
                                'equation this is not a typo — it is a different equation.',
                     action: 'Correct it' },
        corrected: { label: 'Corrected',
                     trigger: 'The marked reading is tapped and settled.',
                     behaviour: 'Replaced in place, the mark comes off, and the ink is ' +
                                'untouched. It was always the original.',
                     action: 'Back to the start' }
      },

      view: function (s) {
        var c = s.cfg;
        var st = s.state;

        /* The un-converted tail: one joined stroke on the same line
           as the words that have already resolved. Joined, because
           separated glyph shapes read as a strange font rather than
           as somebody's hand still moving. */
        var LINE =
'  <svg class="md-ink__live" viewBox="0 0 130 26" aria-hidden="true">\n' +
'    <path d="M3 19c2-9 4-11 5-4s2 9 5 3 5-9 6-3 2 7 5 2 4-9 5-3 1 7 4 5\n' +
'             c4-3 3-12 1-16-2-4-3 1-3 5 0 6 2 10 6 10 3 0 5-3 6-7\n' +
'             s2 5 5 5 5-4 6-8 1 6 4 7c3 1 5-2 6-6s2 4 5 4\n' +
'             c3 0 4-3 5-6 1 4 2 8 5 8 2 0 4-2 5-5"/>\n' +
'    <path d="M120 8c1-4 8-4 8 0s-7 4-7 8m-1 5v1"/>\n' +
'  </svg>\n';

        /* The page of working. Drawn once, unsmoothed, with the
           exponent small and raised — because misreading it has to
           be believable rather than a contrivance. */
        var EQ =
'  <svg class="md-ink__strokes md-ink__strokes--eq" viewBox="0 0 400 190"\n' +
'       aria-label="Handwritten working. Line one: x squared plus three x minus four equals\n' +
'                   zero. Line two: open bracket x plus four close bracket, open bracket x\n' +
'                   plus one close bracket, equals zero.">\n' +
'    <g transform="rotate(-1.1 200 95)">\n' +
'      <path d="M22 48c9 8 19 20 27 27M50 47c-9 9-19 20-27 28"/>\n' +
'      <path d="M60 34c1-7 15-9 15-1 0 7-15 9-16 17l18-1"/>\n' +
'      <path d="M94 63h27M107 48v27"/>\n' +
'      <path d="M141 50c12-8 23 0 15 7-5 4-10 3-10 3m-1 1c15-3 23 5 15 12-7 6-17 0-19-3"/>\n' +
'      <path d="M178 52c8 8 17 17 25 24M203 50c-8 9-17 18-25 26"/>\n' +
'      <path d="M222 64h28"/>\n' +
'      <path d="M291 41v38M291 41l-24 28h32"/>\n' +
'      <path d="M315 56h29M313 68h30"/>\n' +
'      <path d="M375 44c-12-1-19 8-19 17s7 18 18 17 17-8 17-18-5-16-16-16Z"/>\n' +
'      <path d="M22 122c-8 13-8 33-1 45"/>\n' +
'      <path d="M38 132c8 8 16 17 23 23M60 131c-8 8-16 17-23 24"/>\n' +
'      <path d="M74 144h23M85 133v23"/>\n' +
'      <path d="M128 126v35M128 126l-21 25h29"/>\n' +
'      <path d="M144 122c8 13 8 33 1 45"/>\n' +
'      <path d="M162 122c-8 13-8 33-1 45"/>\n' +
'      <path d="M178 132c8 8 16 17 23 23M200 131c-8 8-16 17-23 24"/>\n' +
'      <path d="M214 144h23M225 133v23"/>\n' +
'      <path d="M262 124v37M262 124l-9 8"/>\n' +
'      <path d="M280 122c8 13 8 33 1 45"/>\n' +
'      <path d="M300 138h27M299 150h28"/>\n' +
'      <path d="M356 126c-11-1-18 7-18 16s6 17 16 17 17-7 17-16-5-16-15-17Z"/>\n' +
'    </g>\n' +
'  </svg>\n';

        /* ── Writing into a field ─────────────────────────── */
        if (st === 'nopen') return '' +
'<label class="md-ink__field">\n' +
'  <span class="md-ink__value md-ink__value--ghost md-body-medium">Ask about this working' +
   '</span>\n' +
'</label>\n' +
'<p class="md-ink__hint md-body-small" style="margin-top:14px">An ordinary text field. No ' +
'handwriting button, because the platform already accepts a pen here.</p>';

        if (st === 'writing') return '' +
'<label class="md-ink__field md-ink__field--focus">\n' +
   (c.bounds ? '  <span class="md-ink__bounds" aria-hidden="true"></span>\n' : '') +
'  <span class="md-ink__value md-body-medium">is this wor</span>\n' +
   LINE +
'  <span class="md-ink__caret" aria-hidden="true"></span>\n' +
'</label>\n' +
'<p class="md-ink__hint md-body-small">' +
   (c.bounds
     ? 'The handwriting area is bigger than the field — 40dp above and below, 10dp either ' +
       'side — so a stroke starting anywhere in here lands in it.'
     : 'No bounds. A stroke has to start inside a 52px-high target, and every one that ' +
       'misses is silently lost.') + '</p>';

        /* ── Ink as the record ────────────────────────────── */
        if (st === 'ink') return '' +
'<div class="md-ink">\n' + (c.keep ? EQ : '') +
'  <p class="md-ink__read md-ink__read--pending md-body-medium">Not recognised yet — the ink ' +
'is already the record.</p>\n' +
'</div>';

        var fixed = st === 'corrected';
        var body =
'    <span class="md-ink__word">x</span>\n' +
   (c.mark && !fixed
? '    <button class="md-ink__doubt md-ink__word" type="button" data-act="fix"\n' +
  '            aria-label="Low confidence, tap to correct: ' + esc(c.doubt) + '">' +
  esc(c.doubt) + '</button>\n'
: '    <span class="md-ink__word' + (fixed ? ' md-ink__doubt is-fixed' : '') + '">' +
  esc(c.doubt) + '</span>\n') +
'    <span class="md-ink__word">+ 3x − 4 = 0</span>\n';

        return '' +
'<div class="md-ink">\n' + (c.keep ? EQ : '') +
'  <p class="md-ink__read md-body-medium">\n' + body +
'  </p>\n' +
'</div>' +
  (!c.keep
? '\n<p class="md-ink__hint md-body-small" style="margin-top:14px">The ink is gone, so the ' +
  'reading is now the only version of the working. If the exponent is wrong there is nothing ' +
  'left to check it against.</p>'
: (st === 'lowconf'
? '\n<p class="md-ink__hint md-body-small" style="margin-top:14px">x&nbsp;squared and ' +
  'x&nbsp;times&nbsp;2 are different equations. This is why the mark is not cosmetic.</p>'
: '\n<p class="md-ink__hint md-body-small" style="margin-top:14px">Corrected in one tap, and ' +
  'the strokes above are exactly as they were.</p>'));
      },

      act: function (a, ctx) {
        if (a === 'fix') { ctx.s.state = 'corrected'; ctx.paint();
                           ctx.announce('Corrected in place; the ink is unchanged'); }
      }
    },

    /* ── Gesture input · contextual selection ───────────────
       Five states, which is the whole interaction: nothing, the
       mark, the region it resolved to, the region as a term in
       the request, and the answer. Everything else this pattern
       does — failure, adjustment, multiple regions, the keyboard
       route — is documented in Reference and demonstrated in the
       simulator, because a state list nobody reads to the end is
       a specification rather than a page. */
    gesture: {
      initial: 'inactive',

      customize: {
        groups: [
          { id: 'layer', label: 'The layer',
            states: ['inactive', 'selecting'],
            note: 'The layer is what makes a stroke safe: inside it a drag selects, ' +
                  'outside it a drag still scrolls.',
            controls: [
              { id: 'entry', label: 'Entry point', type: 'text',
                value: 'Ask about this screen' },
              { id: 'teach', label: 'Teach the marks in place', type: 'toggle', value: true,
                capability: true,
                hint: 'One line, once, in the layer. Not a tour on second launch.' },
              { id: 'teachText', label: 'The line', type: 'text',
                value: 'Circle, highlight, scribble or tap anything.',
                visibleWhen: function (c) { return !!c.teach; } }
            ] },

          { id: 'region', label: 'The region',
            states: ['confirmed'],
            note: 'Snapping is what lets an imprecise stroke land on the right object. ' +
                  'Turn it off to see what the raw mark alone is worth.',
            controls: [
              { id: 'snap', label: 'Snap to objects the product knows', type: 'toggle',
                value: true, capability: true },
              { id: 'label', label: 'What the region is called', type: 'text',
                value: 'Revenue · 12–19 Sept',
                visibleWhen: function (c) { return !!c.snap; } },
              { id: 'handles', label: 'Adjustable before it is sent', type: 'toggle',
                value: true, capability: true,
                hint: 'Without handles a wrong snap can only be undone by starting again.' }
            ] },

          { id: 'chip', label: 'On the composer',
            states: ['attached', 'result'],
            note: 'The chip is a term in the request, not a badge on it.',
            controls: [
              { id: 'placeholder', label: 'Placeholder', type: 'text',
                value: 'Ask about this' },
              { id: 'question', label: 'The question', type: 'text',
                value: 'why did this happen?' },
              { id: 'removable', label: 'The chip can be removed', type: 'toggle',
                value: true, capability: true,
                hint: 'And removing it must not take the typed sentence with it.' }
            ] }
        ]
      },

      states: {
        inactive:  { label: 'Inactive',
                     trigger: 'The product at rest.',
                     behaviour: 'No layer, no hidden stroke. One visible, nameable entry ' +
                                'point — which is also the only thing on screen that says ' +
                                'this capability exists.',
                     action: 'Invoke the layer and draw' },
        selecting: { label: 'Selecting',
                     trigger: 'The layer is up and the pointer is down.',
                     behaviour: 'The screen beneath is frozen and dimmed one step, and the ' +
                                'stroke follows the pointer one-to-one with no smoothing. ' +
                                'Nothing is interpreted yet.',
                     action: 'Release, and let it snap' },
        confirmed: { label: 'Selection confirmed',
                     trigger: 'The mark closes and the snap resolves.',
                     behaviour: 'The edge hardens and handles appear. The region is now an ' +
                                'object that can be corrected rather than a mark that has ' +
                                'already been acted on — and nothing has been sent.',
                     action: 'Use this region' },
        attached:  { label: 'Context attached',
                     trigger: 'The selection is accepted.',
                     behaviour: 'The region travels to the composer and becomes a chip. One ' +
                                'object in a second position — which is why the chip needs ' +
                                'no caption saying where it came from.',
                     action: 'Ask the question' },
        result:    { label: 'Result',
                     trigger: 'The agent answers.',
                     behaviour: 'It names the region it used before it states a conclusion, ' +
                                'and the chip is still there — so the same region can be ' +
                                'asked about again without drawing it twice.',
                     action: 'Back to the start' }
      },

      view: function (s) {
        var c = s.cfg;
        var st = s.state;

        /* One screen, drawn once. The pattern is the layer over it,
           so the chart under it stays deliberately quiet. */
        var COLS = [['3', 34], ['5', 41], ['7', 36], ['9', 45], ['11', 38],
                    ['13', 74], ['15', 88], ['17', 96], ['19', 90]];
        function screen(mark) {
          return '' +
'  <div class="md-sel__screen">\n' +
'    <p class="md-sel__head">Weekly revenue</p>\n' +
'    <p class="md-sel__sub">Self-serve · September</p>\n' +
'    <div class="md-sel__chart" role="img"\n' +
'         aria-label="Weekly revenue, flat until 12 September then rising sharply">\n' +
   COLS.map(function (col, i) {
     var hot = mark && i >= 5;
     return '      <span class="md-sel__col' + (hot ? ' md-sel__col--hot' : '') +
            '" style="--h:' + col[1] + '%"><i></i><b>' + col[0] + '</b></span>\n';
   }).join('') +
'    </div>\n' +
'  </div>\n';
        }

        var REGION = '--x:55%;--y:12%;--w:41%;--h:70%';
        var name = c.snap ? c.label : 'Region · 240 × 96';

        function chipEl(label, act) {
          return '' +
'    <button class="md-sel__chip" type="button" data-act="' + act + '"\n' +
'            aria-label="Remove ' + esc(label) + '">\n' +
'      <svg class="md-sel__chip-i" viewBox="0 0 24 24" aria-hidden="true">\n' +
'        <rect x="4" y="4" width="16" height="16" rx="3"/>\n' +
'      </svg>\n' +
'      ' + esc(label) + '\n' +
   (c.removable ? '      <span class="md-sel__x" aria-hidden="true">×</span>\n' : '') +
'    </button>\n';
        }

        /* ── Inactive ─────────────────────────────────────── */
        if (st === 'inactive') {
          return '' +
'<div class="md-sel">\n' +
'  <div class="md-sel__stage">\n' + screen(false) +
'  </div>\n' +
'  <div class="md-sel__bar">\n' +
'    <button class="md-button md-button--outlined md-button--sm" type="button"\n' +
'            data-act="select">' + esc(c.entry) + '</button>\n' +
'    <span class="md-sel__q md-body-medium" style="opacity:.6">' +
       esc(c.placeholder) + '</span>\n' +
'  </div>\n' +
'</div>';
        }

        /* ── Inside the layer ─────────────────────────────── */
        if (st === 'selecting' || st === 'confirmed') {
          var inner = st === 'selecting'
            ? '    <svg class="md-sel__ink" viewBox="0 0 400 200" aria-hidden="true">\n' +
              '      <path d="M232 26c58-8 132 6 148 54 14 42-6 96-54 108-46 12-104 6-122-28' +
              '-14-26-10-58 2-78"/>\n' +
              '    </svg>\n'
            : '    <div class="md-sel__region" style="' + REGION + '">\n' +
              '      <span class="md-sel__label">' + esc(name) + '</span>\n' +
              (c.handles
                ? '      <span class="md-sel__h md-sel__h--nw"></span>\n' +
                  '      <span class="md-sel__h md-sel__h--se"></span>\n' : '') +
              '    </div>\n';

          return '' +
'<div class="md-sel">\n' +
'  <div class="md-sel__stage">\n' + screen(st === 'confirmed') +
'  <div class="md-sel__layer" role="dialog" aria-modal="true"\n' +
'       aria-label="Select something to ask about">\n' + inner +
   (c.teach
? '    <p class="md-sel__teach md-body-small">' + esc(c.teachText) + '</p>\n' : '') +
'  </div>\n' +
'  </div>\n' +
   (st === 'confirmed'
? '  <div class="md-sel__bar">\n' +
  '    <button class="md-button md-button--filled md-button--sm" type="button"\n' +
  '            data-act="attach">Use this</button>\n' +
  '    <span class="md-sel__q md-body-small" style="opacity:.6">Nothing is sent while ' +
  'the selection is still being adjusted.</span>\n' +
  '  </div>\n' : '') +
'</div>';
        }

        /* ── On the composer ──────────────────────────────── */
        var bar = '' +
'  <div class="md-sel__bar">\n' + chipEl(name, 'clear') +
'    <span class="md-sel__q md-body-medium">' +
   (st === 'result' ? esc(c.question) : esc(c.placeholder)) + '</span>\n' +
'  </div>\n';

        return '' +
'<div class="md-sel">\n' +
'  <div class="md-sel__stage">\n' + screen(true) + '  </div>\n' + bar +
  (st === 'result'
? '  <p class="md-sel__miss md-body-small">In <b>' + esc(name) + '</b>: the rise starts on ' +
  '12 September, the day the self-serve trial length changed from 7 days to 14. Nothing ' +
  'else shipped that week.</p>\n' : '') +
'</div>';
      },

      act: function (a, ctx) {
        var go = function (st, say) { ctx.s.state = st; ctx.paint(); if (say) ctx.announce(say); };
        if (a === 'select') return go('selecting', 'Selection layer open');
        if (a === 'attach') return go('attached', 'Region attached to the composer');
        if (a === 'clear')  return go('inactive', 'Region removed');
      }
    },

    /* ── Structured input ───────────────────────────────────
       Five states: the prose, the questions, the skip that states
       its own assumption, the answer carrying its constraints,
       and the inline variant. */
    'structured-input': {
      initial: 'request',

      customize: {
        groups: [
          { id: 'ask', label: 'What it asks for',
            states: ['request', 'asking', 'skipped'],
            note: 'Ask for what changes the answer, not for everything the API accepts.',
            controls: [
              { id: 'req', label: 'The request', type: 'text',
                value: 'Create a customer research report on mid-market churn.' },
              { id: 'restraint', label: 'Ask only for what changes the answer',
                type: 'toggle', value: true, capability: true,
                hint: 'Turn this off to see the same moment as a form: eight questions, and ' +
                      'no way to tell which two matter.' },
              { id: 'why', label: 'Say what each question changes', type: 'toggle',
                value: true, capability: true,
                hint: 'A question that cannot explain its own effect on the answer should ' +
                      'not be asked.' },
              { id: 'skippable', label: 'Every question can be skipped', type: 'toggle',
                value: true, capability: true,
                hint: 'A question that cannot be skipped is a required field in a friendlier ' +
                      'voice — and should be labelled as one.' }
            ] },

          { id: 'result', label: 'After the answer',
            states: ['answered'],
            controls: [
              { id: 'showSet', label: 'Keep the constraints beside the result',
                type: 'toggle', value: true, capability: true,
                hint: 'Buried in the transcript, the result cannot be reproduced.' }
            ] },

          { id: 'inline', label: 'Typed entities',
            states: ['typed'],
            note: 'The other way to reach the same structure: from inside the sentence.',
            controls: [
              { id: 'kinds', label: 'Show the type on the chip', type: 'toggle', value: true,
                hint: 'Without it, a metric and a segment are the same lozenge.' }
            ] }
        ]
      },

      states: {
        request:  { label: 'Free request',
                    trigger: 'Somebody types what they want.',
                    behaviour: 'A sentence, and nothing else. No fields, no dropdowns, no form ' +
                               'standing between the person and the ask.',
                    action: 'Send it, and see what it asks back' },
        asking:   { label: 'Asking',
                    trigger: 'Three parameters would change the answer.',
                    behaviour: 'Three, not eight — and each one names what it changes. The ' +
                               'whole group arrives at once, so the size of the ask is never ' +
                               'a surprise.',
                    action: 'Skip one' },
        skipped:  { label: 'Skipped',
                    trigger: 'A question is declined.',
                    behaviour: 'The default is stated in the same breath, and it settles as an ' +
                               'assumption rather than a choice: lower emphasis, with the word ' +
                               '“default” in its accessible name.',
                    action: 'Run it' },
        answered: { label: 'Answered',
                    trigger: 'The work finishes.',
                    behaviour: 'The result with its constraints beside it — which is what lets ' +
                               'one value be changed and the same question re-run into a ' +
                               'comparable number.',
                    action: 'See the inline variant' },
        typed:    { label: 'Typed entity',
                    trigger: 'Typing inside the sentence.',
                    behaviour: 'The other route to the same structure: a word resolves from ' +
                               'the product’s own schema and becomes a chip carrying its type.',
                    action: 'Back to the request' }
      },

      view: function (s) {
        var c = s.cfg;
        var st = s.state;
        var REQ = '<p class="md-struct__req">' + esc(c.req) + '</p>\n';

        function chipEl(kind, value, cls, act) {
          return '<button class="md-echip' + (cls ? ' ' + cls : '') + '" type="button"' +
                 (act ? ' data-act="' + act + '"' : '') + '>' +
                 (kind && c.kinds ? '<span class="md-echip__k">' + kind + '</span>' : '') +
                 value + '</button>';
        }

        function question(id, title, why, opts, skip, act) {
          return '' +
'  <div class="md-struct__q">\n' +
'    <p class="md-struct__qt md-body-medium" id="' + id + '">' + title + '</p>\n' +
   (c.why ? '    <p class="md-struct__qw md-body-small">' + why + '</p>\n' : '') +
'    <div class="md-struct__opts">\n' +
     opts.map(function (o) {
       return '      <button class="md-echip" type="button" aria-describedby="' + id + '"' +
              (act ? ' data-act="' + act + '"' : '') + '>' + o + '</button>\n';
     }).join('') +
   (c.skippable && skip
? '      <button class="md-echip md-echip--unresolved" type="button" data-act="skip">' +
  skip + '</button>\n' : '') +
'    </div>\n' +
'  </div>\n';
        }

        var Q_AUD = question('q-aud', 'Who is it for?',
          'Changes how much background I include.',
          ['The exec team', 'The product team'],
          'Skip &mdash; I&rsquo;ll assume the product team', 'skip');
        var Q_RANGE = question('q-range', 'Over what period?',
          'Changes which cohorts are complete enough to compare.',
          ['Last 12 months', 'Since the pricing change'],
          'Skip &mdash; I&rsquo;ll use the last 12 months', 'skip');
        var Q_SRC = question('q-src', 'Which sources?',
          'Changes what I am able to cite.',
          ['Product data', 'Product data and support tickets'],
          'Skip &mdash; I&rsquo;ll use product data', 'run');

        /* The failure, reachable on purpose: everything the report
           accepts as a parameter, asked at once, with no way to
           tell which two of them decide the answer. */
        var FORM = ['Who is it for?', 'Over what period?', 'Which sources?', 'Output format?',
                    'Length?', 'Tone?', 'Include appendices?', 'Chart style?']
          .map(function (t) {
            return '  <div class="md-struct__q">\n' +
                   '    <p class="md-struct__qt md-body-medium">' + t + '</p>\n' +
                   '    <div class="md-struct__opts">' +
                   '<button class="md-echip md-echip--unresolved" type="button">Choose' +
                   '</button></div>\n  </div>\n';
          }).join('');

        function set(rows) {
          return '<div class="md-struct__set">' +
            '<span class="md-struct__setk">Using</span>' + rows.join('') + '</div>';
        }
        var AUD = chipEl('audience', 'exec team', '', '');
        var SRC = chipEl('sources', 'product data', '', '');
        var RANGE_D = '<button class="md-echip md-echip--default" type="button" ' +
          'aria-label="Period, default: last 12 months">' +
          (c.kinds ? '<span class="md-echip__k">period</span>' : '') +
          'last 12 months &middot; default</button>';

        if (st === 'request') return '' +
'<div class="md-struct" role="textbox" aria-label="Ask for anything">\n' +
'  <span>' + esc(c.req) + '</span>\n' +
'</div>\n' +
'<p class="md-struct__note">A sentence, and nothing else. No form stands between the person ' +
'and the ask.</p>\n' +
'<div class="md-struct__opts" style="margin-top:12px">\n' +
'  <button class="md-button md-button--filled md-button--sm" type="button"\n' +
'          data-act="ask">Send the request</button>\n' +
'</div>';

        if (st === 'asking') return REQ +
   (c.restraint
? '<div class="md-struct__ask" role="group" aria-label="Three things I need">\n' +
  Q_AUD + Q_RANGE + Q_SRC + '</div>\n' +
  '<p class="md-struct__note">' +
  (c.skippable
    ? 'Three questions, each naming what it changes. Everything else this report accepts as ' +
      'a parameter, it has a sensible answer for already.'
    : 'Nothing here can be declined, which makes these required fields. Calling them ' +
      'questions does not change that — and a required field should be labelled as one.') +
  '</p>'
: '<div class="md-struct__ask" role="group" aria-label="Eight things I need">\n' + FORM +
  '</div>\n' +
  '<p class="md-struct__note">Eight questions and no way to tell which two of them decide ' +
  'the answer. This is a form with a friendlier voice.</p>');

        if (st === 'skipped') return REQ +
'<div class="md-struct__ask" role="group" aria-label="One thing I still need">\n' + Q_SRC +
'</div>\n' + set([AUD, RANGE_D]) +
'<p class="md-struct__note">Skipped, and the assumption was stated in the same breath rather ' +
'than made quietly. The middle value sits at lower emphasis because it is an assumption, not ' +
'a choice.</p>';

        if (st === 'answered') return REQ +
   (c.showSet ? set([AUD, RANGE_D, SRC]) : '') +
'<p class="md-struct__note">Mid-market churn at <b>3.4%</b>, concentrated in accounts under ' +
'nine seats. The period is my assumption, not your choice.</p>' +
   (c.showSet
? '<p class="md-struct__note">Change one value and ask again: the two numbers are comparable ' +
  'because the difference between them is a value, not a differently-worded question.</p>'
: '<p class="md-struct__note">The constraints are somewhere in the transcript. Nobody can ' +
  'reproduce this number next month, including the person who asked for it.</p>');

        /* typed */
        return '' +
'<div class="md-struct" role="textbox" aria-label="Ask a question">\n' +
'  <span>Show</span>\n' +
'  ' + chipEl('metric', 'activation rate', '', '') + '\n' +
'  <span>for</span>\n' +
'  ' + chipEl('segment', 'self-serve', '', '') + '\n' +
'  <span>since 12 September</span>\n' +
'</div>\n' +
'<p class="md-struct__note">' +
   (c.kinds
     ? 'Two words pinned to real values, the rest still prose. The type sits on the chip, so a ' +
       'metric is never mistaken for a segment — and four metrics here have “activation” in ' +
       'the name.'
     : 'Without the type, a metric and a segment are the same lozenge — and picking the wrong ' +
       'one still returns a perfectly plausible number.') + '</p>';
      },

      act: function (a, ctx) {
        var go = function (st, say) { ctx.s.state = st; ctx.paint(); if (say) ctx.announce(say); };
        if (a === 'ask')  return go('asking');
        if (a === 'skip') return go('skipped', 'Skipped. Using the last 12 months');
        if (a === 'run')  return go('answered');
      }
    }
  };

  /* ══════════════════════════════════════════════════════════
     THE PLAYGROUND SHELL
     ══════════════════════════════════════════════════════════ */
  var EYE =
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8">' +
    '<path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z"/>' +
    '<circle cx="12" cy="12" r="3"/></svg>';
  var CODE_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6"/></svg>';

  /* ══════════════════════════════════════════════════════════
     CUSTOMIZE

     A properties panel beside the preview: one row per option,
     label on the left, control on the right, current value shown
     where a value is not self-evident.

     Two rules keep it honest.

     One: every control writes into the same `cfg` object the view
     builds from, so the Code tab is the CUSTOMISED markup. A panel
     that changes the picture but not the code teaches nothing you
     can take away with you.

     Two: the options are decisions, not CSS. Wording, emphasis,
     shape, placement, whether it opens — each has a defensible
     answer on both sides. Exposing every property would make every
     combination look equally endorsed, and most are not.
     ══════════════════════════════════════════════════════════ */
  /* Material Symbols "tune" — the design system's own glyph for
     adjusting settings, used as authored rather than redrawn. It ships
     on a 0 -960 960 960 grid, which is why the viewBox differs from the
     hand-drawn icons elsewhere in this file. */
  var TUNE =
    '<svg class="pv-edit__ico" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">' +
    '<path d="M440-120v-240h80v80h320v80H520v80h-80Zm-320-80v-80h240v80H120Zm160-160v-80H120v-80h160' +
    'v-80h80v240h-80Zm160-80v-80h400v80H440Zm160-160v-240h80v80h160v80H680v80h-80Z"/></svg>';

  var TICK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M5 12.5 10 17.5 19 7"/></svg>';

  var CHEV_DOWN =
    '<svg class="pv-select__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M6 9.5 12 15.5 18 9.5"/></svg>';

  /* ══════════════════════════════════════════════════════════
     THE CUSTOMIZER ENGINE

     Generic. It knows nothing about disclosure, or about any
     other pattern: it reads `def.customize.groups` and renders
     whatever a pattern declares. Adding a customizer to the next
     pattern is a schema, not a UI.

     THE RULE IT ENFORCES. The panel shows the settings that have
     an effect on the state you are looking at, and nothing else.
     Not disabled. Not greyed. Not annotated with "only in
     Generated". Absent. A control that cannot bite is noise
     dressed as a choice, and it teaches the reader to ignore
     the panel.

     Three ways a group can drop out:

       states    the group names the states it belongs to
       requires  a capability toggle is off, so the surface the
                 group configures does not exist
       visibleWhen
                 a single control depends on another control's
                 value (placeholder lines, when there are no
                 placeholders)

     A group whose controls have all dropped out drops out too,
     so there are never empty headings.
     ══════════════════════════════════════════════════════════ */

  function groups(def) {
    return (def.customize && def.customize.groups) || [];
  }

  /* Configuration is kept PER PATTERN, for the life of the session.
     Customise Consent, walk over to Caveat, come back — Consent is
     still as you left it, and nothing Consent declared has leaked
     into Caveat, because the two never shared a bag of values. */
  var STORE = {};
  function configFor(id, def) {
    if (!STORE[id]) STORE[id] = defaults(def);
    return STORE[id];
  }
  function eachControl(def, fn) {
    groups(def).forEach(function (g) { g.controls.forEach(function (c) { fn(c, g); }); });
  }
  function defaults(def) {
    var o = {};
    eachControl(def, function (c) { o[c.id] = c.value; });
    return o;
  }
  function findControl(def, id) {
    var hit = null;
    eachControl(def, function (c) { if (c.id === id) hit = c; });
    return hit;
  }

  /* What the panel shows right now: groups in scope, each carrying
     only the controls that are live. */
  function liveGroups(def, cfg, state) {
    return groups(def).map(function (g) {
      if (g.states && g.states.indexOf(state) === -1) return null;
      if (g.requires && !cfg[g.requires]) return null;
      var live = g.controls.filter(function (c) {
        return !c.visibleWhen || c.visibleWhen(cfg, state);
      });
      return live.length ? { g: g, controls: live } : null;
    }).filter(Boolean);
  }

  function changed(def, cfg, id) {
    var c = findControl(def, id);
    return !!c && cfg[id] !== c.value;
  }
  /* Dirty FOR A STATE means: something a reader would see if they
     went there. Global groups count in every state, because they
     change every state. */
  function stateDirty(def, cfg, state) {
    return liveGroups(def, cfg, state).some(function (x) {
      return x.controls.some(function (c) { return cfg[c.id] !== c.value; });
    });
  }
  function anyDirty(def, cfg) {
    var d = false;
    eachControl(def, function (c) { if (cfg[c.id] !== c.value) d = true; });
    return d;
  }
  /* Reset scoped to the state resets what is on screen and leaves
     the rest of the pattern alone — including the global groups,
     which belong to every state and are not this state's to clear. */
  function stateScoped(def, state) {
    return groups(def).filter(function (g) {
      return g.states && g.states.indexOf(state) !== -1;
    });
  }
  /* Named while it fits, counted when it does not: three state names
     in a chip truncate to nothing useful, and "3 states" with the
     names on hover reads better than "Generated · Expanded · So…". */
  function scopeNames(def, g) {
    return g.states.map(function (k) {
      return def.states[k] ? def.states[k].label : k;
    });
  }
  function scopeLabel(def, g) {
    if (!g.states) return 'All states';
    var n = scopeNames(def, g);
    return n.length > 2 ? n.length + ' states' : n.join(' · ');
  }

  var DOT = '<span class="pvc-dot" aria-hidden="true"></span>';

  function controlHTML(f, value, isChanged) {
    var body;

    if (f.type === 'text') {
      body = '<input class="pvc-input" type="text" data-cfg="' + f.id + '" ' +
             'value="' + esc(value) + '" aria-label="' + esc(f.label) + '" />';

    } else if (f.type === 'toggle') {
      body = '<button class="pvc-switch' + (value ? ' is-on' : '') + '" type="button" ' +
             'role="switch" aria-checked="' + !!value + '" data-cfg="' + f.id + '" ' +
             'aria-label="' + esc(f.label) + '">' +
               '<span class="pvc-switch__track"><span class="pvc-switch__knob"></span></span>' +
             '</button>';

    } else if (f.type === 'segment') {
      body = '<div class="pvc-seg" role="group" aria-label="' + esc(f.label) + '">' +
        f.options.map(function (o) {
          return '<button class="pvc-seg__btn" type="button" data-cfg="' + f.id + '" ' +
                 'data-value="' + o[0] + '" aria-pressed="' + (o[0] === value) + '">' +
                 o[1] + '</button>';
        }).join('') + '</div>';

    } else { /* range */
      body = '<input class="pvc-range" type="range" data-cfg="' + f.id + '" ' +
             'min="' + f.min + '" max="' + f.max + '" step="' + (f.step || 1) + '" ' +
             'value="' + value + '" aria-label="' + esc(f.label) + '" />';
    }

    var shown = f.display ? f.display(value)
              : f.type === 'range' ? value + (f.unit || '')
              : '';

    /* data-row is the row's IDENTITY. Reconciliation matches on it, so
       a row that is already on screen is left alone — which is how the
       caret, the text selection and the panel's scroll position all
       survive an edit. */
    return '' +
      '<div class="pvc-row' + (f.capability ? ' pvc-row--cap' : '') + '" ' +
        'data-row="' + f.id + '">' +
        '<div class="pvc-row__head">' +
          '<span class="pvc-row__label">' + esc(f.label) +
            (isChanged ? DOT : '') + '</span>' +
          (shown ? '<span class="pvc-row__value">' + esc(shown) + '</span>' : '') +
        '</div>' +
        '<div class="pvc-row__control">' + body + '</div>' +
        (f.hint ? '<p class="pvc-row__hint">' + esc(f.hint) + '</p>' : '') +
      '</div>';
  }

  function rowsHTML(def, cfg, controls) {
    return controls.map(function (c) {
      return controlHTML(c, cfg[c.id], changed(def, cfg, c.id));
    }).join('');
  }

  function groupHTML(def, cfg, x) {
    return '<section class="pvc-group" data-group="' + x.g.id + '">' +
             '<div class="pvc-group__head">' +
               '<h4 class="pvc-group__label">' + esc(x.g.label) + '</h4>' +
               '<span class="pvc-group__scope" title="' +
                 esc(x.g.states ? scopeNames(def, x.g).join(' · ')
                                : 'Applies in every state') + '">' +
                 esc(scopeLabel(def, x.g)) + '</span>' +
             '</div>' +
             (x.g.note ? '<p class="pvc-group__note">' + esc(x.g.note) + '</p>' : '') +
             '<div class="pvc-group__rows">' + rowsHTML(def, cfg, x.controls) + '</div>' +
           '</section>';
  }

  /* Two different nothings, and they mean different things to a
     reader: this PATTERN has nothing to configure yet, or this STATE
     has nothing of its own. Neither is a reason to invent settings. */
  function emptyHTML(def, here) {
    if (!groups(def).length) {
      return '<p class="pvc-empty">No customization is available for this pattern yet.</p>';
    }
    return '<p class="pvc-empty">Nothing to configure in <strong>' + esc(here) + '</strong>. ' +
           'The settings that shape this state live in the states that produce it.</p>';
  }

  function resetMenuHTML(def, cfg, state, open) {
    var here = def.states[state] ? def.states[state].label : state;
    var scopedDirty = stateScoped(def, state).some(function (g) {
      return g.controls.some(function (c) { return cfg[c.id] !== c.value; });
    });
    return '' +
      '<button class="pvc__reset" type="button" data-cfg-reset-open ' +
        'aria-haspopup="menu" aria-expanded="' + !!open + '"' +
        (anyDirty(def, cfg) ? '' : ' disabled') + '>Reset</button>' +
      (open
        ? '<div class="pvc__menu" role="menu">' +
            '<button class="pvc__menu-item" type="button" role="menuitem" ' +
              'data-cfg-reset="state"' + (scopedDirty ? '' : ' disabled') + '>' +
              'Reset ' + esc(here) +
              '<span>Only what this state owns</span></button>' +
            '<button class="pvc__menu-item" type="button" role="menuitem" ' +
              'data-cfg-reset="all">Reset everything' +
              '<span>Every state, back to the defaults</span></button>' +
          '</div>'
        : '');
  }

  function panelHTML(def, cfg, state, resetMenu) {
    var live = liveGroups(def, cfg, state);
    var here = def.states[state] ? def.states[state].label : state;

    var body = live.length
      ? live.map(function (x) { return groupHTML(def, cfg, x); }).join('')
      : emptyHTML(def, here);

    return '' +
      '<aside class="pvc" aria-label="Customize the pattern">' +
        '<div class="pvc__head">' +
          '<div class="pvc__heading">' +
            '<span class="pvc__title">Customize</span>' +
            '<span class="pvc__scope">' + esc(here) + '</span>' +
          '</div>' +
          '<div class="pvc__reset-wrap" data-reset-wrap>' +
            resetMenuHTML(def, cfg, state, resetMenu) +
          '</div>' +
          '<button class="pvc__close" type="button" data-cfg-close ' +
            'aria-label="Close customize panel">&times;</button>' +
        '</div>' +
        '<div class="pvc__body">' + body + '</div>' +
      '</aside>';
  }
  function mount(root, id) {
    var def = PATTERNS[id];
    if (!def) return;

    var s = { state: def.initial, view: 'preview', cfg: configFor(id, def),
              panel: false, menu: false, reset: false };
    var busy = false;
    var tunable = groups(def).length > 0;

    /* States were a row of pills. At five or six they filled the head
       and pushed everything else around; as a select they cost one
       control, name the current state in words, and leave room for the
       things that belong beside them. */
    function stateSelect() {
      var keys = Object.keys(def.states);
      /* A pattern with one state has nothing to select. Showing a
         dropdown that cannot go anywhere is furniture pretending to be
         a control — the state read-out below still names the state. */
      if (keys.length < 2) return '';
      return '' +
        '<div class="pv-select" data-select>' +
          '<button class="pv-select__btn" type="button" data-select-open ' +
            'aria-haspopup="listbox" aria-expanded="' + !!s.menu + '">' +
            '<span class="pv-select__k">State</span>' +
            '<span class="pv-select__v">' + def.states[s.state].label + '</span>' +
            CHEV_DOWN +
          '</button>' +
          (s.menu
            ? '<div class="pv-select__menu" role="listbox" tabindex="-1">' +
                keys.map(function (k) {
                  /* A dot on a state you are not in says the pattern
                     has been customised there — so a reader who left
                     changes behind in Expanded can see it from Idle. */
                  return '<button class="pv-select__opt" type="button" role="option" ' +
                         'aria-selected="' + (k === s.state) + '" data-state="' + k + '">' +
                         '<span class="pv-select__tick">' + (k === s.state ? TICK : '') + '</span>' +
                         def.states[k].label +
                         (stateDirty(def, s.cfg, k) ? DOT : '') + '</button>';
                }).join('') +
              '</div>'
            : '') +
        '</div>';
    }

    /* paint() is a FULL rebuild of the playground, and it is reserved
       for the things that are genuinely a new context: the state, the
       pattern, opening or closing the panel. Editing a setting never
       comes through here — see sync() below — because rebuilding the
       panel destroys the scroll container the reader is working in,
       along with their caret and their place in a long list. */
    function paint() {
      var st   = def.states[s.state];
      var code = def.view(s);

      root.innerHTML = '' +
        '<div class="pv' + (s.panel ? ' pv--tuning' : '') + '">' +
          '<div class="pv-head">' +
            '<div class="mp-seg" role="tablist" aria-label="Preview or code">' +
              '<button class="mp-seg__btn" type="button" role="tab" data-view="preview" ' +
                'aria-selected="' + (s.view === 'preview') + '">' + EYE + 'Preview</button>' +
              '<button class="mp-seg__btn" type="button" role="tab" data-view="code" ' +
                'aria-selected="' + (s.view === 'code') + '">' + CODE_ICON + 'Code</button>' +
            '</div>' +
            /* Left: what you are looking at. Right: which state, and the
               way in to changing it. */
            '<div class="pv-head__right">' +
              stateSelect() +
              (tunable
                ? '<button class="pv-edit' + (s.panel ? ' is-on' : '') + '" type="button" ' +
                    'data-cfg-open aria-expanded="' + s.panel + '" ' +
                    'aria-label="Customize the pattern">' + TUNE +
                    '<span>Customize</span>' +
                    (anyDirty(def, s.cfg)
                      ? '<span class="pv-edit__dot" aria-hidden="true"></span>' : '') +
                  '</button>'
                : '') +
            '</div>' +
          '</div>' +

          '<div class="pv-work">' +
          '<div class="pv-frame">' +
            '<div class="pv-stage"' + (s.view === 'code' ? ' hidden' : '') + ' data-stage>' +
              code +
            '</div>' +
            '<pre class="pv-code"' + (s.view === 'preview' ? ' hidden' : '') + '>' +
              '<button class="pv-copy" type="button" data-copy aria-label="Copy the markup">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
                'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                '<rect x="9" y="9" width="11" height="11" rx="2"/>' +
                '<path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg></button>' +
              '<code>' + highlight(code) + '</code></pre>' +
          '</div>' +
          (s.panel ? panelHTML(def, s.cfg, s.state, s.reset) : '') +
          '</div>' +

          /* The state read-out. Four rows, because a state that
             cannot say what triggered it or what the reader can do
             next is not documented, it is just drawn. */
          '<dl class="pv-doc-rows">' +
            row('State', st.label) +
            row('Trigger', st.trigger) +
            row('Behaviour', st.behaviour) +
            row('Next', st.action) +
          '</dl>' +

          '<p class="pv-live" role="status" aria-live="polite">' + (s.said || '') + '</p>' +
        '</div>';

      /* A repaint replaces the element any running animation loop
         was writing to, so anything script-driven has to be
         re-attached to the new one. */
      if (def.mounted) def.mounted(root, s);
    }

    function row(k, v) {
      return '<div class="pv-row"><dt class="pv-row__k">' + k + '</dt>' +
             '<dd class="pv-row__v">' + v + '</dd></div>';
    }

    var ctx = {
      s: s,
      paint: paint,
      /* Patterns read their own customised values when they simulate:
         the "succeeds / fails" choice is a setting, so pressing the
         trigger in the preview has to consult it. */
      cfg: function () { return s.cfg; },
      wait: wait,
      announce: function (msg) {
        s.said = msg;
        var el = root.querySelector('.pv-live');
        if (el) el.textContent = msg;
      },
      /* Mutate the mounted DOM first so the container transition
         runs, then repaint once it has finished so the code pane and
         the read-out catch up with where the component now is. */
      morph: function (next, mutate) {
        s.state = next;
        var stage = root.querySelector('[data-stage]');
        if (stage) mutate(stage);
        var rows = root.querySelector('.pv-doc-rows');
        if (rows) {
          var st = def.states[next];
          rows.innerHTML = row('State', st.label) + row('Trigger', st.trigger) +
                           row('Behaviour', st.behaviour) + row('Next', st.action);
        }
        return new Promise(function (r) {
          setTimeout(function () { paint(); r(); }, MORPH);
        });
      }
    };

    /* Text and range write on every keystroke / drag, so they are
       patched rather than repainted: re-rendering under a dragging
       thumb takes the control out from under the pointer. The stage
       and the code pane are rebuilt in place instead. */
    function repaintOutput() {
      var code = def.view(s);
      var stage = root.querySelector('[data-stage]');
      var pre   = root.querySelector('.pv-code code');
      if (stage) {
        /* Entrance animations belong to a state ARRIVING, not to a
           slider moving. Without this the chip replayed its settle
           on every keystroke, which reads as flicker rather than as
           the thing the reader is adjusting. */
        stage.classList.add('is-quiet');
        stage.innerHTML = code;
      }
      if (pre)   pre.innerHTML = highlight(code);
      if (def.mounted) def.mounted(root, s);
      var dot = root.querySelector('.pv-edit__dot');
      var dirty = anyDirty(def, s.cfg);
      if (dirty && !dot) {
        var btn = root.querySelector('[data-cfg-open]');
        if (btn) btn.insertAdjacentHTML('beforeend',
          '<span class="pv-edit__dot" aria-hidden="true"></span>');
      } else if (!dirty && dot) { dot.remove(); }
      var reset = root.querySelector('[data-cfg-reset-open]');
      if (reset) reset.disabled = !dirty;
    }

    /* ── Reconciliation ──────────────────────────────────────
       Editing a setting patches the panel; it never rebuilds it.

       Groups are matched on data-group, rows on data-row. A group or
       row that is already on screen is left EXACTLY as it is — same
       DOM node, same scroll offset, same caret, same text selection.
       Only what genuinely changed is inserted or removed: a group a
       capability just switched off, a row a visibleWhen just retired.

       Removing rows can leave scrollTop past the new maximum. The
       browser clamps that itself, which is the right amount of
       movement; nothing here resets it. */
    function place(parent, els) {
      els.forEach(function (el, i) {
        if (parent.children[i] !== el) parent.insertBefore(el, parent.children[i] || null);
      });
      while (parent.children.length > els.length) parent.removeChild(parent.lastElementChild);
    }
    function nodeFrom(html) {
      var d = document.createElement('div');
      d.innerHTML = html;
      return d.firstElementChild;
    }

    function syncPanel() {
      var body = root.querySelector('.pvc__body');
      if (!body) return;
      var live = liveGroups(def, s.cfg, s.state);
      var here = def.states[s.state] ? def.states[s.state].label : s.state;

      if (!live.length) {
        if (!body.querySelector('.pvc-empty')) body.innerHTML = emptyHTML(def, here);
        return;
      }
      if (body.querySelector('.pvc-empty')) body.innerHTML = '';

      var wanted = live.map(function (x) {
        var g = body.querySelector('[data-group="' + x.g.id + '"]');
        if (!g) return nodeFrom(groupHTML(def, s.cfg, x));

        var rows = g.querySelector('.pvc-group__rows');
        place(rows, x.controls.map(function (c) {
          var r = rows.querySelector('[data-row="' + c.id + '"]');
          return r || nodeFrom(controlHTML(c, s.cfg[c.id], changed(def, s.cfg, c.id)));
        }));
        return g;
      });
      place(body, wanted);

      /* The head is not part of the scroll container, so it can be
         rewritten freely: the Reset button's availability and the dots
         on the state list both follow the values that just changed. */
      var wrap = root.querySelector('[data-reset-wrap]');
      if (wrap) wrap.innerHTML = resetMenuHTML(def, s.cfg, s.state, s.reset);
      var sel = root.querySelector('[data-select]');
      if (sel) sel.outerHTML = stateSelect();
    }

    /* One entry point for "a setting changed": preview, code, panel
       contents. No full paint, so the panel keeps its scroll. */
    function sync(id) {
      if (id) touchRow(id);
      repaintOutput();
      syncPanel();
    }

    /* The state select and the Preview/Code switch are head furniture:
       patched where they stand, so neither costs the reader their
       place in the panel. */
    function syncSelect() {
      var sel = root.querySelector('[data-select]');
      if (sel) sel.outerHTML = stateSelect();
    }
    function syncView() {
      var stage = root.querySelector('[data-stage]');
      var pre   = root.querySelector('.pv-code');
      if (stage) stage.hidden = s.view === 'code';
      if (pre)   pre.hidden   = s.view === 'preview';
      root.querySelectorAll('.mp-seg__btn').forEach(function (b) {
        b.setAttribute('aria-selected', String(b.dataset.view === s.view));
      });
    }

    /* Reset changes every value at once. Emptying the row containers
       and re-syncing rebuilds the CONTROLS while the group sections —
       and the scroll container above them — stay put. */
    function rebuildRows() {
      root.querySelectorAll('.pvc-group__rows').forEach(function (r) { r.innerHTML = ''; });
      sync();
    }

    /* Patch one row in place: its read-out, and the dot that says this
       value is no longer the default. */
    function touchRow(id) {
      var f = findControl(def, id), el = root.querySelector('[data-cfg="' + id + '"]');
      if (!f || !el) return;
      var row = el.closest('.pvc-row'); if (!row) return;
      var out = row.querySelector('.pvc-row__value');
      if (out) out.textContent = f.display ? f.display(s.cfg[id]) : s.cfg[id] + (f.unit || '');
      var label = row.querySelector('.pvc-row__label');
      var has = label && label.querySelector('.pvc-dot');
      if (label && changed(def, s.cfg, id) && !has) label.insertAdjacentHTML('beforeend', DOT);
      else if (has && !changed(def, s.cfg, id)) has.remove();
    }

    root.addEventListener('input', function (e) {
      var el = e.target.closest('[data-cfg]');
      if (!el || (el.type !== 'text' && el.type !== 'range')) return;
      s.cfg[el.dataset.cfg] = el.type === 'range' ? +el.value : el.value;
      sync(el.dataset.cfg);
    });

    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-cfg-open]')) {
        s.panel = !s.panel; s.reset = false; paint(); return; }
      if (e.target.closest('[data-cfg-close]')) { s.panel = false; paint(); return; }
      /* The menu lives in the panel's head, outside the scroll
         container, so it is patched there rather than repainted. */
      if (e.target.closest('[data-cfg-reset-open]')) {
        s.reset = !s.reset;
        var w = root.querySelector('[data-reset-wrap]');
        if (w) w.innerHTML = resetMenuHTML(def, s.cfg, s.state, s.reset);
        return;
      }

      /* Two resets, because there are two things a reader means by it:
         undo what I did here, or take the whole pattern back. */
      var rst = e.target.closest('[data-cfg-reset]');
      if (rst) {
        if (rst.dataset.cfgReset === 'all') {
          /* Written INTO the stored object, not swapped for a new one:
             the store holds this reference, and only this pattern's
             values are touched. */
          var d = defaults(def);
          Object.keys(d).forEach(function (k) { s.cfg[k] = d[k]; });
        }
        else {
          stateScoped(def, s.state).forEach(function (g) {
            g.controls.forEach(function (c) { s.cfg[c.id] = c.value; });
          });
        }
        s.reset = false;
        /* Every control on screen has a new value, so the rows are
           rebuilt — but the panel's own scroll container is not, and
           the reader stays where they were. */
        rebuildRows();
        return;
      }
      if (s.reset && !e.target.closest('[data-reset-wrap]')) {
        s.reset = false;
        var rw = root.querySelector('[data-reset-wrap]');
        if (rw) rw.innerHTML = resetMenuHTML(def, s.cfg, s.state, s.reset);
      }

      /* Toggles and segments repaint the whole panel rather than
         patching: a capability going off, or a value another control
         depends on changing, means the panel's CONTENTS change — rows
         leave, rows arrive. Only the free-running controls (text,
         range) are patched, because repainting under a caret or a
         dragging thumb takes the control away from the pointer. */
      var sw = e.target.closest('.pvc-switch[data-cfg]');
      if (sw) {
        var key = sw.dataset.cfg;
        s.cfg[key] = !s.cfg[key];
        /* The switch flips in place so its knob travels; sync() then
           adds or removes whatever depended on it. A capability going
           off takes a whole group with it and the reader still does
           not move. */
        sw.classList.toggle('is-on', !!s.cfg[key]);
        sw.setAttribute('aria-checked', String(!!s.cfg[key]));
        sync(key);
        return;
      }
      var opt = e.target.closest('.pvc-seg__btn[data-cfg]');
      if (opt) {
        var skey = opt.dataset.cfg;
        s.cfg[skey] = opt.dataset.value;
        opt.closest('.pvc-seg').querySelectorAll('.pvc-seg__btn').forEach(function (btn) {
          btn.setAttribute('aria-pressed', String(btn === opt));
        });
        sync(skey);
        return;
      }

      /* Preview / Code and the state list both sit in the head. Neither
         is a reason to rebuild the panel underneath them. */
      var seg = e.target.closest('.mp-seg__btn');
      if (seg) { s.view = seg.dataset.view; syncView(); return; }

      if (e.target.closest('[data-select-open]')) { s.menu = !s.menu; syncSelect(); return; }

      /* Changing the STATE is a context change: different sections,
         different preview. The panel is rebuilt and therefore opens at
         the top of the new state's configuration — deliberately. */
      var opt2 = e.target.closest('.pv-select__opt[data-state]');
      if (opt2) { s.state = opt2.dataset.state; s.menu = false; paint(); return; }

      /* A click anywhere else in the playground closes the list. The
         document-level handler below covers everything outside it. */
      if (s.menu && !e.target.closest('[data-select]')) { s.menu = false; syncSelect(); }

      var copy = e.target.closest('[data-copy]');
      if (copy) { copyText(root.querySelector('.pv-code code').textContent, copy); return; }

      var btn = e.target.closest('[data-act]');
      if (!btn || btn.disabled) return;
      var out = def.act(btn.dataset.act, ctx);
      if (out && typeof out.then === 'function') {
        if (busy) return;
        busy = true;
        out.then(function () { busy = false; }, function () { busy = false; });
      }
    });

    /* Outside-click and Escape, at document level: after a pointer
       click focus is not inside the playground, so a listener on the
       root would be dead exactly when the list is open. */
    document.addEventListener('click', function (e) {
      if (s.menu && !root.contains(e.target)) { s.menu = false; syncSelect(); }
      if (s.reset && !root.contains(e.target)) {
        s.reset = false;
        var w = root.querySelector('[data-reset-wrap]');
        if (w) w.innerHTML = resetMenuHTML(def, s.cfg, s.state, s.reset);
      }
    }, true);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (s.menu)  { s.menu = false; syncSelect(); }
      if (s.reset) {
        s.reset = false;
        var w = root.querySelector('[data-reset-wrap]');
        if (w) w.innerHTML = resetMenuHTML(def, s.cfg, s.state, s.reset);
      }
    });

    paint();
  }

  function copyText(text, btn) {
    var done = function () {
      btn.classList.add('is-done');
      setTimeout(function () { btn.classList.remove('is-done'); }, 1500);
    };
    var legacy = function () {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta); done();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, legacy);
    } else { legacy(); }
  }

  window.MaterialPreview = {
    has: function (id) { return !!PATTERNS[id]; },
    mount: mount
  };
})();
