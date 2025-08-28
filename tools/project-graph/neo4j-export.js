#!/usr/bin/env node
/*
 Export docs/project-graph.json to Neo4j Cypher.
 Usage: node tools/project-graph/neo4j-export.js > docs/project-graph.cypher
*/
const fs = require('fs');
const path = require('path');

const graphPath = path.resolve(__dirname, '..', '..', 'docs', 'project-graph.json');
const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));

function esc(str) {
  return String(str).replace(/\\/g,'\\\\').replace(/"/g,'\\"');
}

function relType(t) { return String(t || 'REL').replace(/[^A-Za-z0-9_]/g,'_').toUpperCase(); }

const out = [];
out.push('// Constraints');
out.push('CREATE CONSTRAINT node_id IF NOT EXISTS FOR (n:Node) REQUIRE n.id IS UNIQUE;');
out.push('\n// Nodes');
for (const n of graph.nodes) {
  const props = {
    id: n.id,
    type: n.type || '',
    name: n.name || '',
    file: n.file || '',
    dir: n.dir || '',
    language: n.language || ''
  };
  const json = JSON.stringify(props).replace(/\\u2028|\\u2029/g,' ');
  out.push(`MERGE (:Node ${json});`);
}

out.push('\n// Relationships');
for (const e of graph.edges) {
  const T = relType(e.type);
  const attrs = { via: e.via || '', external: e.external ? 1 : 0, cache: e.cache || '', mode: e.mode || '' };
  const ajson = JSON.stringify(attrs).replace(/\\u2028|\\u2029/g,' ');
  out.push(`MATCH (a:Node {id:"${esc(e.from)}"}),(b:Node {id:"${esc(e.to)}"}) MERGE (a)-[r:${T} ${ajson}]->(b);`);
}

process.stdout.write(out.join('\n'));

