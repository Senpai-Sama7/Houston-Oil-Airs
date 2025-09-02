# Project Knowledge Graph

This repository includes an auto-generated knowledge graph describing the architecture, components, and relationships across services.

- Generated file: `docs/project-graph.json`
- Builder script: `tools/project-graph/build-graph.js`
- Query tool: `tools/project-graph/query-graph.js`

## Model

Nodes have the form:

```
{ id, type, name, file?, dir? }
```

Key node types:

- `repository`: the root repo
- `frontend`: Vite frontend app
- `service`: backend services (Node, Java)
- `native`: native C++ engine
- `workflow`: CI/CD workflows
- `class`: classes discovered via regex in JS/Java/C++
- `endpoint`: HTTP routes exposed by the Node service

Edges have the form:

```
{ from, type, to, ...attributes }
```

Edge types include:

- `contains` — hierarchical ownership
- `defines` — a project defines a class or workflow
- `composes` — class composition (e.g., VisualizationEngine → Systems)
- `exposes` — endpoints exposed by a service
- `calls` — service or app calls another service/endpoint
- `uses` — service leverages infra or native engine
- `checks` — CI checks (targets)

## Building

Generate the graph locally:

```
make project-graph
```

Generate a subset graph (e.g., frontend scope up to 6 hops):

```
make graph-subset ARGS="--root=app:frontend --depth=6 --outfile=project-graph.frontend"
```

Serve the viewer locally (opens docs/ on port 8088):

```
make graph-serve
```

Viewer supports loading alternate graph files via query param `src`:

```
http://localhost:8088/graph-viewer.html?src=project-graph.frontend.json
```

CI builds and uploads the graph artifact on every push/PR.

## Querying

Basic query tool that outputs JSON:

```
node tools/project-graph/query-graph.js --type=endpoint
node tools/project-graph/query-graph.js --name=VisualizationEngine
node tools/project-graph/query-graph.js --edge=exposes
node tools/project-graph/query-graph.js --from=app:frontend --edge=calls
```

## Neo4j Export

Export the graph to Cypher for Neo4j:

```
make graph-cypher
```

Then load in `cypher-shell`:

```
cat docs/project-graph.cypher | cypher-shell -u neo4j -p password
```

## Formats

- JSON: canonical graph model
- DOT: Graphviz rendering input
- GraphML: import into Neo4j tooling or other graph analyzers
- Mermaid (mmd): quick docs snippet for core relations

## Architectural Highlights

- Frontend (`app:frontend`) defines `VisualizationApp` and `VisualizationEngine`, which composes particle and network visualization systems.
- Node backend (`app:node`) exposes HTTP endpoints for visualization data, network topology, health/readiness, and metrics; it optionally uses the native C++ engine via FFI and caches via Redis; it can call the Java analytics service.
- Java analytics service (`app:java`) defines `AIResearchAnalyzer` and its controller, providing trend and network analytics.
- C++ engine (`app:cpp`) defines `DataProcessor` that generates and filters research points for WebGL.
- CI workflow (`ci:workflow:ci`) checks frontend, backend (Node), Java, and C++ build/test pipelines.
