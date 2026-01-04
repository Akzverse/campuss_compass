export interface Node {
  id: string;
  name: string;
  type: 'location' | 'waypoint' | 'junction';
  floorId: string;
  buildingId: string;
  coordinates: { x: number; y: number };
  imageUrl?: string;
}

export interface Edge {
  id: string;
  from: string;
  to: string;
  distance: number;
  time: number;
  description: string;
}

export class CampusGraph {
  private nodes: Map<string, Node> = new Map();
  private edges: Map<string, Edge[]> = new Map();
  private adjacencyList: Map<string, string[]> = new Map();

  addNode(node: Node): void {
    this.nodes.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }
  }

  addEdge(edge: Edge): void {
    if (!this.nodes.has(edge.from) || !this.nodes.has(edge.to)) {
      throw new Error('Invalid node references in edge');
    }

    if (!this.edges.has(edge.from)) {
      this.edges.set(edge.from, []);
    }

    this.edges.get(edge.from)?.push(edge);

    const adjacentNodes = this.adjacencyList.get(edge.from) || [];
    if (!adjacentNodes.includes(edge.to)) {
      adjacentNodes.push(edge.to);
      this.adjacencyList.set(edge.from, adjacentNodes);
    }
  }

  getNode(id: string): Node | undefined {
    return this.nodes.get(id);
  }

  getEdges(from: string): Edge[] {
    return this.edges.get(from) || [];
  }

  getAdjacentNodes(nodeId: string): string[] {
    return this.adjacencyList.get(nodeId) || [];
  }

  getAllNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  getAllEdges(): Edge[] {
    const allEdges: Edge[] = [];
    this.edges.forEach((edges) => {
      allEdges.push(...edges);
    });
    return allEdges;
  }
}

export interface PathResult {
  nodes: Node[];
  edges: Edge[];
  totalDistance: number;
  totalTime: number;
}

export class Dijkstra {
  static findShortestPath(graph: CampusGraph, start: string, end: string): PathResult {
    const distances: Map<string, number> = new Map();
    const times: Map<string, number> = new Map();
    const previous: Map<string, string | null> = new Map();
    const visited: Set<string> = new Set();
    const unvisited: Set<string> = new Set();

    graph.getAllNodes().forEach((node) => {
      distances.set(node.id, Infinity);
      times.set(node.id, Infinity);
      previous.set(node.id, null);
      unvisited.add(node.id);
    });

    distances.set(start, 0);
    times.set(start, 0);

    while (unvisited.size > 0) {
      let currentNode = '';
      let minDistance = Infinity;

      unvisited.forEach((nodeId) => {
        const distance = distances.get(nodeId) || Infinity;
        if (distance < minDistance) {
          minDistance = distance;
          currentNode = nodeId;
        }
      });

      if (currentNode === '' || !unvisited.has(currentNode)) {
        break;
      }

      if (currentNode === end) {
        break;
      }

      unvisited.delete(currentNode);
      visited.add(currentNode);

      const edges = graph.getEdges(currentNode);
      edges.forEach((edge) => {
        if (!visited.has(edge.to)) {
          const newDistance = (distances.get(currentNode) || 0) + edge.distance;
          const newTime = (times.get(currentNode) || 0) + edge.time;

          if (newDistance < (distances.get(edge.to) || Infinity)) {
            distances.set(edge.to, newDistance);
            times.set(edge.to, newTime);
            previous.set(edge.to, currentNode);
          }
        }
      });
    }

    const path: string[] = [];
    let current: string | null = end;

    while (current !== null) {
      path.unshift(current);
      current = previous.get(current) || null;
    }

    if (path[0] !== start) {
      return {
        nodes: [],
        edges: [],
        totalDistance: 0,
        totalTime: 0,
      };
    }

    const pathNodes: Node[] = [];
    const pathEdges: Edge[] = [];

    for (let i = 0; i < path.length; i++) {
      const nodeId = path[i];
      const node = graph.getNode(nodeId);
      if (node) {
        pathNodes.push(node);
      }

      if (i < path.length - 1) {
        const nextNodeId = path[i + 1];
        const edges = graph.getEdges(nodeId);
        const edge = edges.find((e) => e.to === nextNodeId);
        if (edge) {
          pathEdges.push(edge);
        }
      }
    }

    return {
      nodes: pathNodes,
      edges: pathEdges,
      totalDistance: distances.get(end) || 0,
      totalTime: times.get(end) || 0,
    };
  }

  static findNearestNode(graph: CampusGraph, coordinates: { x: number; y: number }, maxDistance: number = 50): Node | null {
    let nearest: Node | null = null;
    let minDistance = maxDistance;

    graph.getAllNodes().forEach((node) => {
      const distance = Math.sqrt(
        Math.pow(node.coordinates.x - coordinates.x, 2) +
        Math.pow(node.coordinates.y - coordinates.y, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = node;
      }
    });

    return nearest;
  }
}
