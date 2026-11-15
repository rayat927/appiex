(() => {
  'use strict';
  const form = document.getElementById('lead-calc');
  if (!form) return;

  const ids = ['monthly-visits','current-rate','target-rate','qualified-rate','closing-rate','deal-value'];
  const fields = Object.fromEntries(ids.map(id => [id,document.getElementById(id)]));
  const output = id => document.getElementById(id);
  const error = output('calc-error');
  const summaryButton = output('copy-results');
  const feedback = output('copy-feedback');
  const integer = new Intl.NumberFormat('en-US',{maximumFractionDigits:0});
  const decimal = new Intl.NumberFormat('en-US',{maximumFractionDigits:1});
  const currency = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
  const asNumber = el => {
    const raw = String(el.value).trim();
    return raw === '' ? NaN : Number(raw);
  };

  function calculate(input) {
    if (!Number.isFinite(input.visits) || input.visits < 0 || input.visits > 10000000 || !Number.isInteger(input.visits)) return null;
    for (const key of ['before','after','qualified','close']) {
      if (!Number.isFinite(input[key]) || input[key] < 0 || input[key] > 100) return null;
    }
    if (!Number.isFinite(input.value) || input.value < 0 || input.value > 10000000) return null;

    const current = input.visits * input.before / 100;
    const projected = input.visits * input.after / 100;
    const difference = projected - current;
    const qualifiedDifference = difference * input.qualified / 100;
    const clientsDifference = qualifiedDifference * input.close / 100;
    const revenueDifference = clientsDifference * input.value;
    return {current,projected,difference,qualifiedDifference,clientsDifference,revenueDifference};
  }

  const signed = (number,format) => number > 0.000001 ? '+'+format(number) : number < -0.000001 ? '−'+format(-number) : format(0);
  const model = () => calculate({
    visits:asNumber(fields['monthly-visits']),
    before:asNumber(fields['current-rate']),
    after:asNumber(fields['target-rate']),
    qualified:asNumber(fields['qualified-rate']),
    close:asNumber(fields['closing-rate']),
    value:asNumber(fields['deal-value'])
  });
  let last = null;

  function render() {
    const result = model();
    error.hidden = Boolean(result);
    summaryButton.disabled = !result;
    if (!result) {
      last=null;
      for (const id of ['extra-enquiries','current-leads','future-leads','extra-qualified','extra-clients','revenue-change']) output(id).textContent = '—';
      output('context-line').textContent='Enter valid numbers to compare scenarios.';
      return;
    }
    last=result;
    output('current-leads').textContent=decimal.format(result.current);
    output('future-leads').textContent=decimal.format(result.projected);
    output('extra-enquiries').textContent=signed(result.difference,decimal.format.bind(decimal));
    output('extra-qualified').textContent=signed(result.qualifiedDifference,decimal.format.bind(decimal));
    output('extra-clients').textContent=signed(result.clientsDifference,decimal.format.bind(decimal));
    output('revenue-change').textContent=signed(result.revenueDifference,currency.format.bind(currency));
    output('context-line').textContent=integer.format(asNumber(fields['monthly-visits']))+' visits per month at the entered rates.';
    feedback.textContent='';
  }

  ids.forEach(id=>{
    fields[id].addEventListener('input',render);
    fields[id].addEventListener('change',render);
  });
  form.addEventListener('reset',()=>requestAnimationFrame(render));
  form.addEventListener('submit',event=>event.preventDefault());

  summaryButton.addEventListener('click',async()=>{
    if(!last) return;
    const s=[
      'Appiex Free Website Lead Calculator — scenario, not a prediction',
      'Monthly visits: '+integer.format(asNumber(fields['monthly-visits'])),
      'Current conversion: '+fields['current-rate'].value+'%',
      'Scenario conversion: '+fields['target-rate'].value+'%',
      'Qualified share: '+fields['qualified-rate'].value+'%',
      'Qualified close rate: '+fields['closing-rate'].value+'%',
      'Current enquiries: '+decimal.format(last.current),
      'Scenario enquiries: '+decimal.format(last.projected),
      'Enquiry difference: '+signed(last.difference,decimal.format.bind(decimal)),
      'Qualified lead difference: '+signed(last.qualifiedDifference,decimal.format.bind(decimal)),
      'Expected clients difference: '+signed(last.clientsDifference,decimal.format.bind(decimal)),
      'Potential gross monthly client revenue difference: '+signed(last.revenueDifference,currency.format.bind(currency)),
      'Before costs, taxes and uncertainty. Not a projection of actual business results.',
      'Free calculator: https://appiex.com/website-lead-calculator'
    ].join('\n');
    try {
      if (!navigator.clipboard?.writeText) throw Error('clipboard-not-supported');
      await navigator.clipboard.writeText(s);
      feedback.textContent='Scenario summary copied.';
    } catch (_) {
      feedback.textContent='Copy unavailable in this browser. You can select your results above instead.';
    }
  });
  render();

  // Pageview can be tracked by the site analytics integration. This calculator
  // deliberately does not transmit numbers, client information or estimates.
})();
