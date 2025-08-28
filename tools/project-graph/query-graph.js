#!/usr/bin/env node
/*
 Simple query tool for docs/project-graph.json
 Usage examples:
   node tools/project-graph/query-graph.js --type=endpoint
   node tools/project-graph/query-graph.js --name=VisualizationEngine
   node tools/project-graph/query-graph.js --edge=exposes
   node tools/project-graph/query-graph.js --from=app:frontend --edge=calls
*/
const fs = require('fs');
const path = require('path');

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.split('=');
  return [k.replace(/^--/, ''), v ?? true];
}));
const graphPath = path.resolve(__dirname, '..', '..', 'docs', 'project-graph.json');
const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));

function matchNode(n) {
  if (args.type && n.type !== args.type) return false;
  if (args.name && !String(n.name).includes(args.name)) return false;
  if (args.id && n.id !== args.id) return false;
  return true;
}

function matchEdge(e) {
  if (args.edge && e.type !== args.edge) return false;
  if (args.from && e.from !== args.from) return false;
  if (args.to && e.to !== args.to) return false;
  return true;
}

const out = {};
if (args.edge || args.from || args.to) {
  out.edges = graph.edges.filter(matchEdge);
} else {
  out.nodes = graph.nodes.filter(matchNode);
}

console.log(JSON.stringify(out, null, 2));

