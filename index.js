const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ── Your personal details ─────────────────────────────────────────
const USER_ID = "riyakapoor_25101004";          // e.g. "johndoe_17091999"
const EMAIL_ID = "rk5259@srmist.edu.in";  // your college email
const COLLEGE_ROLL = "RA23110056010268";        // your roll number
// ─────────────────────────────────────────────────────────────────

/* ----------------------------------------------------------------
   VALIDATION
---------------------------------------------------------------- */
function isValidEntry(raw) {
  const s = raw.trim();
  // Must match exactly X->Y where X,Y are single uppercase letters, X≠Y
  return /^[A-Z]->[A-Z]$/.test(s) && s[0] !== s[3];
}

/* ----------------------------------------------------------------
   CYCLE DETECTION  (DFS)
---------------------------------------------------------------- */
function hasCycle(node, adj, visited, recStack) {
  visited.add(node);
  recStack.add(node);
  for (const child of (adj[node] || [])) {
    if (!visited.has(child)) {
      if (hasCycle(child, adj, visited, recStack)) return true;
    } else if (recStack.has(child)) {
      return true;
    }
  }
  recStack.delete(node);
  return false;
}

/* ----------------------------------------------------------------
   BUILD NESTED TREE OBJECT  (DFS, avoids infinite loop via visited)
---------------------------------------------------------------- */
function buildTree(node, adj, visited = new Set()) {
  if (visited.has(node)) return {};
  visited.add(node);
  const children = {};
  for (const child of (adj[node] || [])) {
    children[child] = buildTree(child, adj, new Set(visited));
  }
  return children;
}

/* ----------------------------------------------------------------
   DEPTH CALCULATION
---------------------------------------------------------------- */
function calcDepth(node, adj, memo = {}) {
  if (memo[node] !== undefined) return memo[node];
  const kids = adj[node] || [];
  if (kids.length === 0) return (memo[node] = 1);
  const d = 1 + Math.max(...kids.map((k) => calcDepth(k, adj, memo)));
  memo[node] = d;
  return d;
}

/* ----------------------------------------------------------------
   MAIN ROUTE
---------------------------------------------------------------- */
app.post("/bfhl", (req, res) => {
  const data = req.body?.data ?? [];

  const invalidEntries = [];
  const duplicateEdges = [];
  const seenEdges = new Set();

  // adjacency list and parent tracker
  const adj = {};        // node → [children]
  const parentCount = {}; // child → first parent (for diamond rule)
  const allNodes = new Set();

  for (const raw of data) {
    const s = typeof raw === "string" ? raw.trim() : String(raw).trim();

    if (!isValidEntry(s)) {
      invalidEntries.push(raw);  // push original (untrimmed) as received
      continue;
    }

    const [parent, child] = s.split("->");

    // Duplicate check
    const edgeKey = `${parent}->${child}`;
    if (seenEdges.has(edgeKey)) {
      if (!duplicateEdges.includes(edgeKey)) duplicateEdges.push(edgeKey);
      continue;
    }
    seenEdges.add(edgeKey);

    // Diamond / multi-parent: first-encountered parent wins
    if (parentCount[child] !== undefined && parentCount[child] !== parent) {
      // silently discard this edge
      continue;
    }

    allNodes.add(parent);
    allNodes.add(child);
    if (!adj[parent]) adj[parent] = [];
    adj[parent].push(child);
    if (!adj[child]) adj[child] = [];  // ensure child exists
    parentCount[child] = parent;
  }

  /* ── Find connected components ─────────────────────────────── */
  const nodeList = [...allNodes];
  const visited = new Set();
  const components = [];

  function dfsCollect(node, component) {
    if (visited.has(node)) return;
    visited.add(node);
    component.push(node);
    for (const child of (adj[node] || [])) dfsCollect(child, component);
    // traverse upwards too (treat as undirected for component grouping)
    for (const n of nodeList) {
      if (!visited.has(n) && (adj[n] || []).includes(node)) dfsCollect(n, component);
    }
  }

  for (const node of nodeList) {
    if (!visited.has(node)) {
      const comp = [];
      dfsCollect(node, comp);
      components.push(comp);
    }
  }

  /* ── Build hierarchies ──────────────────────────────────────── */
  const hierarchies = [];

  for (const comp of components) {
    const compSet = new Set(comp);

    // Determine if cycle exists in this component
    const visitedCycle = new Set();
    const recStack = new Set();
    let cycleFound = false;
    for (const n of comp) {
      if (!visitedCycle.has(n)) {
        if (hasCycle(n, adj, visitedCycle, recStack)) { cycleFound = true; break; }
      }
    }

    // Find root(s): nodes with no parent within this component
    const roots = comp.filter((n) => parentCount[n] === undefined);

    let root;
    if (roots.length > 0) {
      root = roots.sort()[0]; // lexicographically smallest if multiple
    } else {
      // Pure cycle — all nodes appear as children; pick lex smallest
      root = [...compSet].sort()[0];
    }

    if (cycleFound) {
      hierarchies.push({ root, tree: {}, has_cycle: true });
    } else {
      const tree = { [root]: buildTree(root, adj) };
      const depth = calcDepth(root, adj);
      hierarchies.push({ root, tree, depth });
    }
  }

  /* ── Sort hierarchies: non-cyclic first, then cyclic ───────── */
  hierarchies.sort((a, b) => {
    if (a.has_cycle && !b.has_cycle) return 1;
    if (!a.has_cycle && b.has_cycle) return -1;
    return a.root.localeCompare(b.root);
  });

  /* ── Summary ────────────────────────────────────────────────── */
  const nonCyclic = hierarchies.filter((h) => !h.has_cycle);
  const totalTrees = nonCyclic.length;
  const totalCycles = hierarchies.filter((h) => h.has_cycle).length;

  let largestTreeRoot = "";
  let maxDepth = -1;
  for (const h of nonCyclic) {
    if (h.depth > maxDepth || (h.depth === maxDepth && h.root < largestTreeRoot)) {
      maxDepth = h.depth;
      largestTreeRoot = h.root;
    }
  }

  return res.json({
    user_id: USER_ID,
    email_id: EMAIL_ID,
    college_roll_number: COLLEGE_ROLL,
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary: {
      total_trees: totalTrees,
      total_cycles: totalCycles,
      largest_tree_root: largestTreeRoot,
    },
  });
});

app.get("/", (req, res) => res.send("BFHL API is running. POST to /bfhl"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
