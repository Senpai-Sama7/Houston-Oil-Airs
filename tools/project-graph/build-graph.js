#!/usr/bin/env node
/*
 Build a project knowledge graph for Houston Oil Airs.
 Produces:
  - docs/project-graph.json (primary)
  - docs/project-graph.dot (Graphviz DOT)
  - docs/project-graph.graphml (GraphML)
 No external deps; regex-based extraction for endpoints, classes, and imports.
*/
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function readFileSafe(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.git')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function addNode(nodes, id, type, name, attrs = {}) {
  if (nodes.has(id)) return nodes.get(id);
  const node = { id, type, name, ...attrs };
  nodes.set(id, node);
  return node;
}

function addEdge(edges, from, type, to, attrs = {}) {
  edges.push({ from, type, to, ...attrs });
}

function extractEndpoints(serverJs, file) {
  const endpoints = [];
  const re = /\bapp\.(get|post|put|delete|patch)\(\s*['\"]([^'\"]+)['\"]/g;
  let m;
  while ((m = re.exec(serverJs))) {
    endpoints.push({ method: m[1].toUpperCase(), path: m[2], file });
  }
  return endpoints;
}

function extractClasses(src, file) {
  const classes = [];
  const re = /\bclass\s+([A-Za-z0-9_]+)/g;
  let m;
  while ((m = re.exec(src))) {
    classes.push({ name: m[1], file });
  }
  return classes;
}

function extractImports(src, file) {
  const imports = [];
  // ES modules: import ... from '...'
  const reES = /\bimport\s+[^;]+?from\s+['\"]([^'\"]+)['\"]/g;
  let m;
  while ((m = reES.exec(src))) imports.push({ kind: 'import', spec: m[1], file });
  // CommonJS: require('...')
  const reCJS = /\brequire\(\s*['\"]([^'\"]+)['\"]\s*\)/g;
  while ((m = reCJS.exec(src))) imports.push({ kind: 'require', spec: m[1], file });
  // Java imports
  const reJava = /^\s*import\s+([a-zA-Z0-9_\.\*]+);/gm;
  while ((m = reJava.exec(src))) imports.push({ kind: 'java-import', spec: m[1], file });
  // C++ includes
  const reCpp = /^\s*#\s*include\s+[<\"]([^>\"]+)[>\"]/gm;
  while ((m = reCpp.exec(src))) imports.push({ kind: 'include', spec: m[1], file });
  return imports;
}

function writeDOT(graph, outPath) {
  const esc = s => String(s).replace(/"/g, '\\"');
  const lines = ['digraph G {'];
  for (const n of graph.nodes) {
    const label = `${n.name || n.id}\n(${n.type})`;
    lines.push(`  "${esc(n.id)}" [label="${esc(label)}"];`);
  }
  for (const e of graph.edges) {
    const lbl = e.type;
    lines.push(`  "${esc(e.from)}" -> "${esc(e.to)}" [label="${esc(lbl)}"];`);
  }
  lines.push('}');
  fs.writeFileSync(outPath, lines.join('\n'));
}

function writeGraphML(graph, outPath) {
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<graphml xmlns="http://graphml.graphdrawing.org/xmlns">');
  lines.push('  <key id="d0" for="node" attr.name="label" attr.type="string"/>');
  lines.push('  <key id="d1" for="node" attr.name="type" attr.type="string"/>');
  lines.push('  <key id="d2" for="edge" attr.name="type" attr.type="string"/>');
  lines.push('  <graph edgedefault="directed">');
  for (const n of graph.nodes) {
    lines.push(`    <node id="${esc(n.id)}">`);
    lines.push(`      <data key="d0">${esc(n.name || n.id)}</data>`);
    lines.push(`      <data key="d1">${esc(n.type || '')}</data>`);
    lines.push('    </node>');
  }
  let eid = 0;
  for (const e of graph.edges) {
    lines.push(`    <edge id="e${eid++}" source="${esc(e.from)}" target="${esc(e.to)}">`);
    lines.push(`      <data key="d2">${esc(e.type || '')}</data>`);
    lines.push('    </edge>');
  }
  lines.push('  </graph>');
  lines.push('</graphml>');
  fs.writeFileSync(outPath, lines.join('\n'));
}

function main() {
  // Args: --root=app:frontend --depth=3 --outfile=project-graph.frontend
  const argv = Object.fromEntries(process.argv.slice(2).map(a => {
    const [k, v] = a.split('=');
    return [k.replace(/^--/, ''), v ?? true];
  }));
  const nodes = new Map();
  const edges = [];

  // Root
  addNode(nodes, 'repo:houston-oil-airs', 'repository', 'Houston Oil Airs', { root: REPO_ROOT });

  // Subprojects
  const subprojects = [
    { id: 'app:frontend', type: 'frontend', name: 'Frontend (Vite)', dir: 'frontend' },
    { id: 'app:node', type: 'service', name: 'Node Backend', dir: 'backend/node-server' },
    { id: 'app:java', type: 'service', name: 'Java Analytics Service', dir: 'backend/java-services' },
    { id: 'app:cpp', type: 'native', name: 'C++ Engine', dir: 'backend/cpp-engine' },
    { id: 'ci:gha', type: 'ci', name: 'GitHub Actions', dir: '.github/workflows' }
  ];
  for (const sp of subprojects) {
    const p = addNode(nodes, sp.id, sp.type, sp.name, { dir: sp.dir });
    addEdge(edges, 'repo:houston-oil-airs', 'contains', sp.id);
  }

  // Frontend classes and key modules
  const feFiles = walk(path.join(REPO_ROOT, 'frontend'));
  const fileNodesSeen = new Set();
  for (const f of feFiles) {
    const rel = path.relative(REPO_ROOT, f);
    const src = readFileSafe(f);
    if (!src) continue;
    // Create file node
    const fileId = `file:${rel}`;
    if (!fileNodesSeen.has(fileId)) {
      addNode(nodes, fileId, 'file', rel, { file: rel });
      addEdge(edges, 'app:frontend', 'contains', fileId);
      fileNodesSeen.add(fileId);
    }
    for (const cls of extractClasses(src, rel)) {
      const id = `fe:${cls.name}`;
      addNode(nodes, id, 'class', cls.name, { file: rel });
      addEdge(edges, 'app:frontend', 'defines', id);
      addEdge(edges, id, 'defined_in', fileId);
      // Naive JS method extraction inside class body
      try {
        const classBodyRe = new RegExp(`class\\s+${cls.name}\\s*{([\\s\\S]*?)}`, 'm');
        const mb = classBodyRe.exec(src);
        if (mb) {
          const body = mb[1];
          const methRe = /(\w+)\s*\(/g; // methodName(
          const seen = new Set();
          let mm; while ((mm = methRe.exec(body))) {
            const mname = mm[1];
            if (!mname || mname === 'constructor' || seen.has(mname)) continue;
            seen.add(mname);
            const mid = `method:js:${cls.name}.${mname}`;
            addNode(nodes, mid, 'method', `${cls.name}.${mname}()`, { file: rel, class: cls.name });
            addEdge(edges, id, 'owns_method', mid);
          }
        }
      } catch {}
    }
    // Import edges
    for (const imp of extractImports(src, rel)) {
      const spec = imp.spec;
      if (spec.startsWith('.') || spec.startsWith('/')) {
        // Attempt to resolve to a file within repo
        let target = path.normalize(path.join(path.dirname(rel), spec));
        if (!/\.[a-z]+$/i.test(target)) {
          // add typical extensions / index
          const tryPaths = [
            `${target}.js`, `${target}.mjs`, `${target}.ts`, `${target}.jsx`, `${target}.tsx`,
            path.join(target, 'index.js')
          ];
          const resolved = tryPaths.find(p => fs.existsSync(path.join(REPO_ROOT, p)));
          if (resolved) target = resolved;
        }
        const toId = `file:${target}`;
        addNode(nodes, toId, 'file', target, { file: target });
        addEdge(edges, fileId, 'imports', toId, { via: imp.kind });
      } else {
        addEdge(edges, fileId, 'imports', spec, { external: true, via: imp.kind });
      }
    }
  }
  // Known frontend modules
  addNode(nodes, 'fe:VisualizationApp', 'class', 'VisualizationApp', { file: 'frontend/src/js/main.js' });
  addEdge(edges, 'app:frontend', 'defines', 'fe:VisualizationApp');
  addNode(nodes, 'fe:VisualizationEngine', 'class', 'VisualizationEngine', { file: 'frontend/src/js/visualization.js' });
  addEdge(edges, 'app:frontend', 'defines', 'fe:VisualizationEngine');
  addNode(nodes, 'fe:AdvancedParticleSystem', 'class', 'AdvancedParticleSystem', { file: 'frontend/src/js/visualization.js' });
  addNode(nodes, 'fe:NetworkVisualizationSystem', 'class', 'NetworkVisualizationSystem', { file: 'frontend/src/js/visualization.js' });
  addEdge(edges, 'fe:VisualizationEngine', 'composes', 'fe:AdvancedParticleSystem');
  addEdge(edges, 'fe:VisualizationEngine', 'composes', 'fe:NetworkVisualizationSystem');

  // Backend Node endpoints & classes
  const serverPath = path.join(REPO_ROOT, 'backend/node-server/src/server.js');
  const serverSrc = readFileSafe(serverPath);
  const nodeClasses = extractClasses(serverSrc, path.relative(REPO_ROOT, serverPath));
  for (const cls of nodeClasses) {
    const id = `node:${cls.name}`;
    addNode(nodes, id, 'class', cls.name, { file: cls.file });
    addEdge(edges, 'app:node', 'defines', id);
    addEdge(edges, id, 'defined_in', `file:${cls.file}`);
  }
  for (const ep of extractEndpoints(serverSrc, path.relative(REPO_ROOT, serverPath))) {
    const id = `ep:${ep.method}:${ep.path}`;
    addNode(nodes, id, 'endpoint', `${ep.method} ${ep.path}`, { file: ep.file });
    addEdge(edges, 'app:node', 'exposes', id);
  }
  // Imports in node server
  for (const imp of extractImports(serverSrc, path.relative(REPO_ROOT, serverPath))) {
    const fromId = `file:${path.relative(REPO_ROOT, serverPath)}`;
    if (imp.spec.startsWith('.') || imp.spec.startsWith('/')) {
      let target = path.normalize(path.join(path.dirname(fromId.replace(/^file:/, '')), imp.spec));
      if (!/\.[a-z]+$/i.test(target)) target += '.js';
      const toId = `file:${target}`;
      addNode(nodes, toId, 'file', target, { file: target });
      addEdge(edges, fromId, 'imports', toId, { via: imp.kind });
    } else {
      addEdge(edges, fromId, 'imports', imp.spec, { external: true, via: imp.kind });
    }
  }
  // Service relations
  addEdge(edges, 'app:frontend', 'calls', 'ep:GET:/api/research/visualization-data/:category');
  addEdge(edges, 'app:frontend', 'calls', 'ep:GET:/api/research/network-topology');
  addEdge(edges, 'app:frontend', 'calls', 'ep:GET:/ready');
  addEdge(edges, 'app:frontend', 'calls', 'ep:GET:/metrics.json');
  addEdge(edges, 'app:node', 'calls', 'app:java', { via: 'JAVA_SERVICE_URL' });
  addEdge(edges, 'app:node', 'uses', 'app:cpp', { mode: 'ffi (optional)' });
  addEdge(edges, 'app:node', 'uses', 'redis://', { cache: 'visualization-data' });

  // Java classes
  const javaDir = path.join(REPO_ROOT, 'backend/java-services/src/main/java');
  const javaFiles = fs.existsSync(javaDir) ? walk(javaDir) : [];
  for (const f of javaFiles) {
    const src = readFileSafe(f);
    const rel = path.relative(REPO_ROOT, f);
    const fileId = `file:${rel}`;
    addNode(nodes, fileId, 'file', rel, { file: rel });
    addEdge(edges, 'app:java', 'contains', fileId);
    const reClass = /\bclass\s+([A-Za-z0-9_]+)/g;
    let m; while ((m = reClass.exec(src))) {
      const id = `java:${m[1]}`;
      addNode(nodes, id, 'class', m[1], { file: rel });
      addEdge(edges, 'app:java', 'defines', id);
      addEdge(edges, id, 'defined_in', fileId);
      // Naive Java method extraction
      try {
        const classBodyRe = new RegExp(`class\\s+${m[1]}[\\s\\S]*?{([\\s\\S]*?)}`, 'm');
        const mb = classBodyRe.exec(src);
        if (mb) {
          const body = mb[1];
          const methRe = /\b(public|protected|private|static|final|\s)+\s+[\w<>,\[\]]+\s+(\w+)\s*\([^;{}]*\)\s*\{/g;
          const seen = new Set(); let mj;
          while ((mj = methRe.exec(body))) {
            const mname = mj[2];
            if (!mname || seen.has(mname)) continue;
            seen.add(mname);
            const mid = `method:java:${m[1]}.${mname}`;
            addNode(nodes, mid, 'method', `${m[1]}.${mname}()`, { file: rel, class: m[1] });
            addEdge(edges, id, 'owns_method', mid);
          }
        }
      } catch {}
    }
    for (const imp of extractImports(src, rel)) {
      if (imp.kind === 'java-import') {
        addEdge(edges, fileId, 'imports', imp.spec, { external: !imp.spec.startsWith('org.houstonoilairs') });
      }
    }
  }

  // Java Spring endpoints (@GetMapping/@PostMapping)
  for (const f of javaFiles) {
    const src = readFileSafe(f);
    const rel = path.relative(REPO_ROOT, f);
    const getRe = /@GetMapping\s*\(\s*value\s*=\s*"([^"]+)"|@GetMapping\s*\(\s*\)\s*\n\s*public/gm;
    const postRe = /@PostMapping\s*\(\s*value\s*=\s*"([^"]+)"|@PostMapping\s*\(\s*\)\s*\n\s*public/gm;
    let m;
    while ((m = getRe.exec(src))) {
      const p = m[1] || '';
      if (!p) continue;
      const id = `ep:GET:${p}`;
      addNode(nodes, id, 'endpoint', `GET ${p}`, { file: rel });
      addEdge(edges, 'app:java', 'exposes', id);
    }
    while ((m = postRe.exec(src))) {
      const p = m[1] || '';
      if (!p) continue;
      const id = `ep:POST:${p}`;
      addNode(nodes, id, 'endpoint', `POST ${p}`, { file: rel });
      addEdge(edges, 'app:java', 'exposes', id);
    }
  }

  // C++ classes
  const cppDir = path.join(REPO_ROOT, 'backend/cpp-engine/src');
  const cppFiles = fs.existsSync(cppDir) ? walk(cppDir) : [];
  for (const f of cppFiles) {
    const src = readFileSafe(f);
    const rel = path.relative(REPO_ROOT, f);
    const fileId = `file:${rel}`;
    addNode(nodes, fileId, 'file', rel, { file: rel });
    addEdge(edges, 'app:cpp', 'contains', fileId);
    const reClass = /\bclass\s+([A-Za-z0-9_]+)/g;
    let m; while ((m = reClass.exec(src))) {
      const id = `cpp:${m[1]}`;
      addNode(nodes, id, 'class', m[1], { file: rel });
      addEdge(edges, 'app:cpp', 'defines', id);
      addEdge(edges, id, 'defined_in', fileId);
      // Naive C++ method extraction from class body (headers)
      try {
        const classBodyRe = new RegExp(`class\\s+${m[1]}[\\s\\S]*?{([\\s\\S]*?)}`);
        const mb = classBodyRe.exec(src);
        if (mb) {
          const body = mb[1];
          const methRe = /(?:virtual\s+)?[A-Za-z_][\w:<>&\*\s]+\s+([A-Za-z_][A-Za-z0-9_]*)\s*\([^;{}]*\)\s*(?:const)?\s*;/g;
          const seen = new Set(); let mm;
          while ((mm = methRe.exec(body))) {
            const mname = mm[1];
            if (!mname || seen.has(mname)) continue;
            seen.add(mname);
            const mid = `method:cpp:${m[1]}.${mname}`;
            addNode(nodes, mid, 'method', `${m[1]}.${mname}()`, { file: rel, class: m[1] });
            addEdge(edges, id, 'owns_method', mid);
          }
        }
      } catch {}
    }
    for (const imp of extractImports(src, rel)) {
      if (imp.kind === 'include') {
        const spec = imp.spec;
        if (spec.startsWith('"') || !spec.includes('/')) {
          // Local-ish include: create file edge target if present
          const maybe = path.join(path.dirname(rel), spec.replace(/\"/g,''));
          const toId = `file:${maybe}`;
          addEdge(edges, fileId, 'includes', toId);
        } else {
          addEdge(edges, fileId, 'includes', spec, { external: true });
        }
      }
    }
  }

  // CI workflow
  const gha = path.join(REPO_ROOT, '.github/workflows/ci.yml');
  if (fs.existsSync(gha)) {
    addNode(nodes, 'ci:workflow:ci', 'workflow', 'CI Workflow', { file: '.github/workflows/ci.yml' });
    addEdge(edges, 'ci:gha', 'defines', 'ci:workflow:ci');
    addEdge(edges, 'ci:workflow:ci', 'checks', 'app:node');
    addEdge(edges, 'ci:workflow:ci', 'checks', 'app:frontend');
    addEdge(edges, 'ci:workflow:ci', 'checks', 'app:java');
    addEdge(edges, 'ci:workflow:ci', 'checks', 'app:cpp');
  }

  // Simple symbol call extraction (file-level)
  function extractCalls(src, langPrefix, fromId) {
    const re = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
    const skip = new Set(['if','for','while','switch','catch','function','return','class','new','typeof','console','import']);
    let m; const seen = new Set();
    while ((m = re.exec(src))) {
      const name = m[1];
      if (skip.has(name)) continue;
      const symId = `sym:${langPrefix}:${name}`;
      if (!nodes.has(symId)) addNode(nodes, symId, 'symbol', name, { language: langPrefix });
      addEdge(edges, fromId, 'calls', symId);
      seen.add(name);
    }
  }

  // JS calls in frontend files
  for (const f of feFiles) {
    const rel = path.relative(REPO_ROOT, f);
    const src = readFileSafe(f);
    if (!src) continue;
    extractCalls(src, 'js', `file:${rel}`);
  }
  // JS calls in node server
  extractCalls(serverSrc, 'js', `file:${path.relative(REPO_ROOT, serverPath)}`);

  // Java calls (file-level naive)
  for (const f of javaFiles) {
    const rel = path.relative(REPO_ROOT, f);
    const src = readFileSafe(f);
    if (!src) continue;
    extractCalls(src, 'java', `file:${rel}`);
  }

  let graph = { nodes: Array.from(nodes.values()), edges };
  const outDir = path.join(REPO_ROOT, 'docs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const emit = (g, baseName) => {
    const outPath = path.join(outDir, `${baseName}.json`);
    fs.writeFileSync(outPath, JSON.stringify(g, null, 2));
    console.log(`✅ Project graph written to ${path.relative(REPO_ROOT, outPath)} with ${g.nodes.length} nodes and ${g.edges.length} edges.`);
    const dotPath = path.join(outDir, `${baseName}.dot`);
    writeDOT(g, dotPath);
    console.log(`🟦 DOT graph written to ${path.relative(REPO_ROOT, dotPath)}`);
    const graphmlPath = path.join(outDir, `${baseName}.graphml`);
    writeGraphML(g, graphmlPath);
    console.log(`🟨 GraphML written to ${path.relative(REPO_ROOT, graphmlPath)}`);
    // Mermaid
    const mermaid = [];
    mermaid.push('flowchart LR');
    const core = new Set(['repo:houston-oil-airs','app:frontend','app:node','app:java','app:cpp']);
    for (const e of g.edges) {
      if (core.has(e.from) || core.has(e.to)) {
        const from = e.from.replace(/[:\-]/g, '_');
        const to = e.to.replace(/[:\-]/g, '_');
        mermaid.push(`  ${from} -->|${e.type}| ${to}`);
      }
    }
    fs.writeFileSync(path.join(outDir, `${baseName}.mmd`), mermaid.join('\n'));
    console.log(`🟢 Mermaid snippet written to docs/${baseName}.mmd`);
  };

  // Subset option: BFS from root up to depth (both directions)
  if (argv.root) {
    const depth = Number(argv.depth ?? Infinity);
    const root = argv.root;
    const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));
    const adjOut = new Map();
    const adjIn = new Map();
    for (const e of graph.edges) {
      if (!adjOut.has(e.from)) adjOut.set(e.from, []);
      if (!adjIn.has(e.to)) adjIn.set(e.to, []);
      adjOut.get(e.from).push(e);
      adjIn.get(e.to).push(e);
    }
    const seen = new Set();
    const q = [[root, 0]];
    const subEdges = [];
    while (q.length) {
      const [id, d] = q.shift();
      if (seen.has(id)) continue;
      seen.add(id);
      if (d >= depth) continue;
      const outs = adjOut.get(id) || [];
      for (const e of outs) { subEdges.push(e); q.push([e.to, d + 1]); }
      const ins = adjIn.get(id) || [];
      for (const e of ins) { subEdges.push(e); q.push([e.from, d + 1]); }
    }
    const subNodes = Array.from(seen).map(id => nodeMap.get(id)).filter(Boolean);
    const uniqEdges = []; const keyset = new Set();
    for (const e of subEdges) {
      const k = `${e.from}~${e.type}~${e.to}`;
      if (keyset.has(k)) continue; keyset.add(k); uniqEdges.push(e);
    }
    const subset = { nodes: subNodes, edges: uniqEdges };
    emit(subset, argv.outfile || `project-graph.subset`);
  }
  // Emit full graph
  emit(graph, 'project-graph');
}

if (require.main === module) main();
