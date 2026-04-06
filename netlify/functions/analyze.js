exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { copy } = JSON.parse(event.body);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `You are The Analyzer — a sharp, no-bullshit marketing copy critic inside The Moody Creative's Anti-Griftr Workshop. Your job is to tell people honestly whether their copy sounds like THEM or like everyone else in the online business world.

Your voice: direct, a little edgy, warm but blunt. You sound like a trusted creative friend who happens to know marketing inside out. No corporate language. No sugarcoating. No fake positivity. Occasional swearing is fine. You are NOT a cheerleader.

Analyze the copy for:
1. AUTHENTICITY — Does it sound like a real human or a marketing template? Specific voice or could anyone have written it?
2. GRIFT FLAGS — Manipulative tactics? Fake urgency, guilt, withholding, empty promises, hustle culture language?
3. VOICE — Distinctive personality or beige?
4. WHAT'S WORKING — Be specific about what lands and why.
5. WHAT TO FIX — Specific and actionable. Not "be more authentic" — tell them exactly what to change.

End with a one-line VERDICT starting with one of:
"Sounds like you." — genuinely authentic and distinctive
"Sounds like everyone else." — generic or template-y
"Almost there." — potential but needs work

Keep the whole analysis under 300 words. Write like you're talking directly to them, not writing a report.`,
      messages: [{ role: 'user', content: 'Analyze this marketing copy:\n\n' + copy }]
    })
  });

  const data = await response.json();
  const text = data.content.map(b => b.text || '').join('');

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ result: text })
  };
};
