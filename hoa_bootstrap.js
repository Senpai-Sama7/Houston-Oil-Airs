// Node 18+ required (built-in fetch). Minimal deps: express, open
import express from 'express';
import open from 'open';
import crypto from 'crypto';

const {
  NOTION_CLIENT_ID,
  NOTION_CLIENT_SECRET,
  NOTION_REDIRECT_URI = 'http://localhost:8080/callback',
} = process.env;

if (!NOTION_CLIENT_ID || !NOTION_CLIENT_SECRET) {
  console.error('Set NOTION_CLIENT_ID and NOTION_CLIENT_SECRET (use a freshly rotated secret).');
  process.exit(1);
}

const OAUTH_AUTH = 'https://api.notion.com/v1/oauth/authorize';
const OAUTH_TOKEN = 'https://api.notion.com/v1/oauth/token';
const NOTION_VER = '2022-06-28'; // current stable as of API v1
const app = express();

let server;
function b64url(buf) { return buf.toString('base64url'); }
const state = b64url(crypto.randomBytes(24));

const authUrl = `${OAUTH_AUTH}?client_id=${encodeURIComponent(NOTION_CLIENT_ID)}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(NOTION_REDIRECT_URI)}&state=${state}`;

function notionHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': NOTION_VER,
    'Content-Type': 'application/json'
  };
}

async function exchange(code) {
  const res = await fetch(OAUTH_TOKEN, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: NOTION_REDIRECT_URI,
      client_id: NOTION_CLIENT_ID,
      client_secret: NOTION_CLIENT_SECRET
    })
  });
  if (!res.ok) throw new Error(`OAuth token exchange failed: ${res.status}`);
  return res.json();
}

async function createTopPage(token) {
  const body = {
    parent: { type: 'workspace', workspace: true },
    icon: { type: 'emoji', emoji: '🛢️' },
    cover: { type: 'external', external: { url: 'https://images.unsplash.com/photo-1542228262-3d663b306a56' } },
    properties: { title: { title: [{ type: 'text', text: { content: 'Houston Oil Airs (HOA)' } }] } },
    children: [
      { object:'block', type:'heading_1', heading_1:{ rich_text:[{type:'text', text:{content:'Energy x Air — Signals, Ops, and Foresight for the Gulf Coast.'}}]}},
      { object:'block', type:'divider', divider:{} },
      { object:'block', type:'callout', callout:{ icon:{type:'emoji',emoji:'🗂️'}, rich_text:[{type:'text', text:{content:'Sections: Daily Signals | Incidents | Dashboards | Knowledge | Playbooks | Contacts'}}]}},
    ]
  };
  const res = await fetch('https://api.notion.com/v1/pages', { method:'POST', headers: notionHeaders(token), body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Create HOA page failed: ${res.status}`);
  return res.json();
}

async function createAssetsDB(token, parentPageId) {
  const properties = {
    "Asset Name": { title: {} },
    "Type": { select: { options: ["Refinery", "Pipeline", "Terminal", "Power Plant", "Port", "Petrochem"].map(n=>({name:n})) } },
    "Operator": { rich_text: {} },
    "Location": { rich_text: {} },
    "Latitude": { number: { format: "number" } },
    "Longitude": { number: { format: "number" } },
    "Capacity": { number: { format: "number" } },
    "Status": { select: { options: ["Operating","Maintenance","Outage"].map(n=>({name:n})) } },
    "Notes": { rich_text: {} }
  };
  const body = {
    parent: { type:'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: 'HOA Assets' } }],
    properties
  };
  const res = await fetch('https://api.notion.com/v1/databases', { method:'POST', headers: notionHeaders(token), body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Create Assets DB failed: ${res.status}`);
  return res.json();
}

async function createSignalsDB(token, parentPageId, assetsDbId) {
  const properties = {
    "Headline": { title: {} },
    "Date": { date: {} },
    "Category": { multi_select: { options: ["Exploration","Refining","Midstream","LNG","Shipping","Power/Grids","Petrochemicals","Air Quality","Policy/Regulation","Markets","ESG"].map(n=>({name:n})) } },
    "Region": { multi_select: { options: ["Houston Metro","Gulf Coast","Permian","GoM Offshore","Texas Statewide","U.S.","Global"].map(n=>({name:n})) } },
    "Asset": { relation: { database_id: assetsDbId, type:"single_property", single_property: {} } },
    "Summary": { rich_text: {} },
    "Source": { url: {} },
    "Outlet": { rich_text: {} },
    "Impact Score": { number: { format:"number" } },
    "Confidence": { select: { options: ["Low","Medium","High"].map(n=>({name:n})) } },
    "Indicators": { rich_text: {} },
    "Tags": { multi_select: {} },
    "Owner": { people: {} },
    "Status": { select: { options: ["New","Triage","Monitoring","In Progress","Resolved","Archived"].map(n=>({name:n})) } },
    "Due": { date: {} },
    "Prediction": { rich_text: {} },
    "Timeframe Days": { number: { format:"number" } },
    "Validation Criteria": { rich_text: {} },
    "Follow-ups": { rich_text: {} },
    "External Ticket": { url: {} }
  };
  const body = {
    parent: { type:'page_id', page_id: parentPageId },
    title: [{ type:'text', text:{ content:'HOA Signals & Ops' } }],
    properties
  };
  const res = await fetch('https://api.notion.com/v1/databases', { method:'POST', headers: notionHeaders(token), body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Create Signals DB failed: ${res.status}`);
  return res.json();
}

async function createKnowledgeDB(token, parentPageId, signalsDbId) {
  const properties = {
    "Title": { title: {} },
    "Summary": { rich_text: {} },
    "Category": { select: { options: ["Tech","Ops","Policy","Market","Environment","Other"].map(n=>({name:n})) } },
    "Tags": { multi_select: {} },
    "Source URL": { url: {} },
    "Attachments": { files: {} },
    "Related Signal": { relation: { database_id: signalsDbId, type:"single_property", single_property:{} } }
  };
  const body = {
    parent: { type:'page_id', page_id: parentPageId },
    title: [{ type:'text', text:{ content:'HOA Knowledge Base' } }],
    properties
  };
  const res = await fetch('https://api.notion.com/v1/databases', { method:'POST', headers: notionHeaders(token), body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Create Knowledge DB failed: ${res.status}`);
  return res.json();
}

async function seedSamples(token, signalsDbId, kbDbId) {
  const createSignal = async (headline, impact) => {
    const body = {
      parent: { database_id: signalsDbId },
      properties: {
        "Headline": { title: [{ type:'text', text:{ content: headline } }] },
        "Date": { date: { start: new Date().toISOString() } },
        "Category": { multi_select: [{ name: "Markets" }] },
        "Region": { multi_select: [{ name: "Gulf Coast" }] },
        "Impact Score": { number: impact },
        "Confidence": { select: { name: "Medium" } },
        "Status": { select: { name: "New" } },
        "Tags": { multi_select: [{ name: "SAMPLE" }] }
      },
      children: [
        { object:'block', type:'callout', callout:{ icon:{type:'emoji',emoji:'💡'}, rich_text:[{type:'text', text:{content:'Why it matters: '}}]}},
        { object:'block', type:'bulleted_list_item', bulleted_list_item:{ rich_text:[{type:'text', text:{content:'Fact 1'}}]}},
        { object:'block', type:'bulleted_list_item', bulleted_list_item:{ rich_text:[{type:'text', text:{content:'Fact 2'}}]}},
        { object:'block', type:'callout', callout:{ icon:{type:'emoji',emoji:'⏱️'}, rich_text:[{type:'text', text:{content:'72h Implications: '}}]}},
      ]
    };
    const res = await fetch('https://api.notion.com/v1/pages', { method:'POST', headers: notionHeaders(token), body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`Seed sample signal failed: ${res.status}`);
    return res.json();
  };

  const kbBody = {
    parent: { database_id: kbDbId },
    properties: {
      "Title": { title: [{ type:'text', text:{ content: "[SAMPLE] Houston energy overview" } }] },
      "Category": { select: { name: "Environment" } },
      "Tags": { multi_select: [{ name:"SAMPLE"}] }
    },
    children: [
      { object:'block', type:'paragraph', paragraph:{ rich_text:[{type:'text', text:{content:'Primer on Houston/Gulf Coast energy complex and air-quality touchpoints.'}}]} }
    ]
  };
  const kbRes = await fetch('https://api.notion.com/v1/pages', { method:'POST', headers: notionHeaders(token), body: JSON.stringify(kbBody) });
  if (!kbRes.ok) throw new Error(`Seed KB failed: ${kbRes.status}`);

  await createSignal('[SAMPLE] Gulf Coast throughput watch', 6);
  await createSignal('[SAMPLE] Ozone alert day — Houston Metro', 7);
}

async function createChildPage(token, parentPageId, title, emoji, note) {
  const body = {
    parent: { type:'page_id', page_id: parentPageId },
    icon: { type:'emoji', emoji },
    properties: { title: { title:[{ type:'text', text:{ content:title } }] } },
    children: note ? [{ object:'block', type:'callout', callout:{ icon:{type:'emoji',emoji:'🧭'}, rich_text:[{type:'text', text:{content:note}}]}}] : []
  };
  const res = await fetch('https://api.notion.com/v1/pages', { method:'POST', headers: notionHeaders(token), body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Create child page failed: ${res.status}`);
  return res.json();
}

async function bootstrap(token) {
  const top = await createTopPage(token);
  const topId = top.id;
  const topUrl = top.url;

  const assets = await createAssetsDB(token, topId);
  const signals = await createSignalsDB(token, topId, assets.id);
  const kb = await createKnowledgeDB(token, topId, signals.id);

  // Child pages (placeholders; add linked views manually in UI)
  await createChildPage(token, topId, 'Live Dashboard', '📊', 'Add linked database views: P1+ (Impact ≥7), Updated in 24h, Due ≤72h.');
  await createChildPage(token, topId, 'Executive Summary', '🧭', 'Link HOA Signals & Ops filtered: Date within past 7 days.');
  await createChildPage(token, topId, 'Market Monitor', '🛰️', 'Link HOA Signals & Ops filtered: Category=Markets.');
  await createChildPage(token, topId, 'Regulatory Watch', '🏛️', 'Link HOA Signals & Ops filtered: Category=Policy/Regulation.');
  await createChildPage(token, topId, 'Environment & Air Quality', '🌫️', 'Embed EPA/NOAA dashboards; link Air Quality signals.');
  await createChildPage(token, topId, 'Playbooks & SOPs', '🧰', 'Add Incident triage, Source vetting, Alert rubric checklists.');
  await createChildPage(token, topId, 'Contacts', '👥', 'Create a simple table (Name, Org, Role, Email/Slack, Notes).');

  await seedSamples(token, signals.id, kb.id);

  console.log('\n=== HOA CREATED ===');
  console.log('Space page:', topUrl);
  console.log('Assets DB:', assets.url);
  console.log('Signals & Ops DB:', (await (await fetch(`https://api.notion.com/v1/databases/${signals.id}`, {headers:notionHeaders(token)})).json()).url || '(open in UI)');
  console.log('Knowledge Base DB:', (await (await fetch(`https://api.notion.com/v1/databases/${kb.id}`, {headers:notionHeaders(token)})).json()).url || '(open in UI)');
}

app.get('/callback', async (req, res) => {
  try {
    if (req.query.state !== state) throw new Error('State mismatch');
    const { access_token } = await exchange(req.query.code);
    res.send('Authorized. You can close this tab.');
    await bootstrap(access_token);
    setTimeout(()=> { server?.close(); }, 500);
  } catch (e) {
    console.error(e);
    res.status(500).send('Failed: ' + e.message);
  }
});

server = app.listen(8080, async () => {
  console.log('Visit to authorize:', authUrl);
  await open(authUrl);
});

