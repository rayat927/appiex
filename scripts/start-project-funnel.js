(() => {
  'use strict';
  const form = document.getElementById('project-fit-form');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('.funnel-step'));
  const progress = document.getElementById('funnel-progress');
  const fill = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');
  const next = document.getElementById('funnel-next');
  const back = document.getElementById('funnel-back');
  const error = document.getElementById('funnel-error');
  const handoff = document.getElementById('handoff-actions');
  const budgetGuide = document.getElementById('budget-guidance');
  const whatsApp = document.getElementById('funnel-whatsapp');
  const emailLink = document.getElementById('funnel-email');
  const budget = document.getElementById('budget');
  const read = name => {
    const field = form.elements.namedItem(name);
    return field && 'value' in field ? String(field.value || '').trim() : '';
  };
  const chosen = name => form.querySelector('input[name="' + name + '"]:checked')?.value || '';
  let step = 0;
  let prepared = false;

  // Only send aggregate funnel events, never names, email addresses, websites, or message text.
  const track = (name, values = {}) => {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: name, funnel_version: '2026-11', ...values });
    } catch (_) {}
  };

  const serviceOptions = {
    web: ['Web development','Launch or improve digital sales'],
    'web-development': ['Web development','Launch or improve digital sales'],
    ecommerce: ['Web development','Launch or improve digital sales'],
    ai: ['AI automation','Save time with automation'],
    'ai-automation': ['AI automation','Save time with automation'],
    'whatsapp-automation': ['AI automation','Save time with automation'],
    seo: ['SEO and growth','More qualified leads'],
    'seo-marketing': ['SEO and growth','More qualified leads'],
    growth: ['SEO and growth','More qualified leads'],
    software: ['Custom software and SaaS','Build software or a new product'],
    saas: ['Custom software and SaaS','Build software or a new product'],
    'ui-ux': ['UI/UX and product design','Build software or a new product']
  };
  const params = new URLSearchParams(window.location.search);
  const inputService = (params.get('service') || '').toLowerCase().slice(0, 40);
  if (Object.prototype.hasOwnProperty.call(serviceOptions, inputService)) {
    const [service, goal] = serviceOptions[inputService];
    const s = Array.from(form.querySelectorAll('input[name="service"]')).find(e => e.value === service);
    const g = Array.from(form.querySelectorAll('input[name="goal"]')).find(e => e.value === goal);
    if (s) s.checked = true;
    if (g) g.checked = true;
  }

  const render = () => {
    steps.forEach((section, i) => { section.hidden = i !== step; });
    label.textContent = 'Step ' + (step + 1) + ' of 4';
    progress.setAttribute('aria-valuenow', String(step + 1));
    fill.style.width = String(((step + 1) / steps.length) * 100) + '%';
    back.hidden = step === 0;
    next.hidden = prepared;
    next.textContent = step === 3 ? 'Prepare my enquiry →' : 'Continue →';
    handoff.hidden = !prepared;
    error.hidden = true;
  };
  const showError = message => {
    error.hidden = false;
    error.textContent = message;
    error.focus?.();
  };

  const validate = index => {
    switch (index) {
      case 0:
        if (!chosen('goal')) { showError('Choose the main business result you want.'); return false; }
        return true;
      case 1:
        if (!chosen('service')) { showError('Select the support you need, or choose “Not sure yet”.'); return false; }
        return true;
      case 2:
        if (!budget.value || !read('timeline')) { showError('Choose a budget and an approximate timeline. “Not decided” is fine.'); return false; }
        return true;
      case 3: {
        const name = form.elements.namedItem('client-name');
        const details = form.elements.namedItem('challenge');
        const email = form.elements.namedItem('email');
        if (!name.value.trim()) { showError('Please add your name.'); name.focus(); return false; }
        if (!details.value.trim() || details.value.trim().length < 12) {
          showError('Please describe your challenge in at least 12 characters.');
          details.focus();
          return false;
        }
        if (email.value.trim() && !email.checkValidity()) {
          showError('Please enter a valid work email, or leave it blank.');
          email.focus();
          return false;
        }
        return true;
      }
      default: return false;
    }
  };

  const renderGuidance = () => {
    const low = budget.value === 'Under $1,000';
    if (!low) { budgetGuide.hidden = true; budgetGuide.textContent = ''; return; }
    budgetGuide.hidden = false;
    budgetGuide.innerHTML = 'For very small budgets, focused advice or a limited first phase may fit better than a custom build. You can still enquire, or start with our <a href="/ai-search-readiness-checklist">free search-readiness checklist</a>.';
  };

  const createMessage = () => {
    const values = [
      'Hello Appiex, I would like to discuss a potential project.',
      '',
      'Goal: ' + chosen('goal'),
      'Service: ' + chosen('service'),
      'Budget: ' + read('budget'),
      'Timeline: ' + read('timeline'),
      'Name: ' + read('client-name')
    ];
    if (read('company')) values.push('Business: ' + read('company'));
    if (read('website')) values.push('Website: ' + read('website'));
    if (read('email')) values.push('Email: ' + read('email'));
    values.push('Challenge: ' + read('challenge'), '', 'Source: Appiex project-fit questionnaire');
    return values.join('\n');
  };

  const updateHandoff = () => {
    const message = createMessage();
    whatsApp.href = 'https://wa.me/8801917354847?text=' + encodeURIComponent(message);
    emailLink.href = 'mailto:contact@appiex.com?subject=' +
      encodeURIComponent('Appiex project enquiry — ' + chosen('service')) +
      '&body=' + encodeURIComponent(message);
  };
  const handleHandoff = (e, channel) => {
    if (!validate(3)) { e.preventDefault(); return; }
    updateHandoff();
    track('appiex_funnel_contact_handoff', {
      service: chosen('service'),
      goal: chosen('goal'),
      budget_band: read('budget'),
      timeline: read('timeline'),
      channel
    });
    // Do not call generate_lead here: opening a chat/email is not delivery.
  };

  next.addEventListener('click', () => {
    if (!validate(step)) return;
    track('appiex_funnel_step_complete', { step_number: step + 1, service: chosen('service') || 'not_selected' });
    if (step < steps.length - 1) {
      step++;
      render();
      steps[step].querySelector('legend')?.scrollIntoView({ behavior: 'auto', block: 'center' });
    } else {
      prepared = true;
      updateHandoff();
      render();
      track('appiex_funnel_prepared', { service: chosen('service'), budget_band: read('budget') });
      handoff.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
  back.addEventListener('click', () => {
    if (step > 0) {
      prepared = false;
      step--;
      render();
    }
  });
  form.addEventListener('submit', event => event.preventDefault());
  budget.addEventListener('change', renderGuidance);
  form.addEventListener('input', () => {
    if (prepared) updateHandoff();
    if (!error.hidden) error.hidden = true;
  });
  whatsApp.addEventListener('click', event => handleHandoff(event, 'whatsapp'));
  emailLink.addEventListener('click', event => handleHandoff(event, 'email'));
  render();
  renderGuidance();
  track('appiex_funnel_view', { source: 'project_fit', preselected_service: inputService in serviceOptions ? inputService : 'none' });
})();
