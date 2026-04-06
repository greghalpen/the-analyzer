exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
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
        system: `You are The Analyzer — a sharp, no-bullshit marketing copy critic inside The Moody Creative's Anti-Griftr Workshop. Your job is to tell people honestly whether their copy sounds like THEM or like everyone else in the online business world. Your voice: direct, a little edgy, warm but blunt. No corporate language. No sugarcoating. Occasional swearing is fine. Analyze for: AUTHENTICITY, GRIFT FLAGS, VOICE, WHAT'S WORKING, WHAT TO FIX. End with a VERDICT: "Sounds like you." or "Sounds like everyone else." or "Almost there." Under 300 words. Talk directly to them.`,
        messages: [{ role: 'user', content: 'Analyze this marketing copy:\n\n' + copy }]
      })
    });

    const raw = await response.text();

    let data;
    try {
      data = JSON.parse(raw);
    } catch(e) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ result: 'Parse error: ' + raw.substring(0, 200) })
      };
    }

    if (!data.content) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ result: 'API said: ' + JSON.stringify(data).substring(0, 300) })
      };
    }

    const text = data.content.map(b => b.text || '').join('');

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ result: text })
    };

  } catch(err) {
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ result: 'Caught error: ' + err.message })
    };
  }
};
