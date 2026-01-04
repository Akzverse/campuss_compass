import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Node {
  id: string;
  name: string;
  type: string;
  floorId: string;
  buildingId: string;
  coordinates: { x: number; y: number };
}

interface Edge {
  from: string;
  to: string;
  distance: number;
  time: number;
}

class DijkstraPathfinder {
  private distances: Map<string, number> = new Map();
  private previous: Map<string, string | null> = new Map();
  private visited: Set<string> = new Set();

  findPath(nodes: Map<string, Node>, adjacency: Map<string, string[]>, start: string, end: string): string[] {
    nodes.forEach((node) => {
      this.distances.set(node.id, Infinity);
      this.previous.set(node.id, null);
    });

    this.distances.set(start, 0);

    while (this.visited.size < nodes.size) {
      let current = "";
      let minDistance = Infinity;

      nodes.forEach((node) => {
        if (!this.visited.has(node.id)) {
          const dist = this.distances.get(node.id) || Infinity;
          if (dist < minDistance) {
            minDistance = dist;
            current = node.id;
          }
        }
      });

      if (current === "" || !nodes.has(current)) break;

      if (current === end) break;

      this.visited.add(current);

      const neighbors = adjacency.get(current) || [];
      neighbors.forEach((neighbor) => {
        if (!this.visited.has(neighbor)) {
          const startNode = nodes.get(current)!;
          const endNode = nodes.get(neighbor)!;
          const edgeDistance = Math.sqrt(
            Math.pow(endNode.coordinates.x - startNode.coordinates.x, 2) +
            Math.pow(endNode.coordinates.y - startNode.coordinates.y, 2)
          );

          const newDistance = (this.distances.get(current) || 0) + edgeDistance;
          if (newDistance < (this.distances.get(neighbor) || Infinity)) {
            this.distances.set(neighbor, newDistance);
            this.previous.set(neighbor, current);
          }
        }
      });
    }

    const path: string[] = [];
    let current: string | null = end;

    while (current !== null) {
      path.unshift(current);
      current = this.previous.get(current) || null;
    }

    return path[0] === start ? path : [];
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { locations, waypoints, navigationSteps, startLocationId, endLocationId } = await req.json();

    if (!startLocationId || !endLocationId) {
      return new Response(
        JSON.stringify({ error: "Missing start or end location" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const allNodes = new Map<string, Node>();
    const adjacency = new Map<string, string[]>();

    locations.forEach((loc: any) => {
      const node: Node = {
        id: loc.id,
        name: loc.name,
        type: "location",
        floorId: loc.floor_id,
        buildingId: loc.building_id || "",
        coordinates: { x: Math.random() * 200, y: Math.random() * 200 },
      };
      allNodes.set(node.id, node);
      adjacency.set(node.id, []);
    });

    waypoints.forEach((wp: any) => {
      const node: Node = {
        id: wp.id,
        name: wp.name,
        type: "waypoint",
        floorId: wp.floor_id || "",
        buildingId: wp.building_id,
        coordinates: { x: Math.random() * 200, y: Math.random() * 200 },
      };
      allNodes.set(node.id, node);
      adjacency.set(node.id, []);
    });

    navigationSteps.forEach((step: any) => {
      const fromAdj = adjacency.get(step.from_location_id) || [];
      const toAdj = adjacency.get(step.to_location_id) || [];

      if (!fromAdj.includes(step.waypoint_id)) {
        fromAdj.push(step.waypoint_id);
      }
      if (!toAdj.includes(step.waypoint_id)) {
        toAdj.push(step.waypoint_id);
      }

      adjacency.set(step.from_location_id, fromAdj);
      adjacency.set(step.to_location_id, toAdj);
    });

    const pathfinder = new DijkstraPathfinder();
    const path = pathfinder.findPath(allNodes, adjacency, startLocationId, endLocationId);

    if (path.length === 0) {
      return new Response(
        JSON.stringify({ error: "No path found between locations" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const pathWithNodes = path.map((nodeId) => allNodes.get(nodeId));
    let totalDistance = 0;

    for (let i = 0; i < path.length - 1; i++) {
      const node1 = allNodes.get(path[i])!;
      const node2 = allNodes.get(path[i + 1])!;
      totalDistance += Math.sqrt(
        Math.pow(node2.coordinates.x - node1.coordinates.x, 2) +
        Math.pow(node2.coordinates.y - node1.coordinates.y, 2)
      );
    }

    return new Response(
      JSON.stringify({
        path: pathWithNodes,
        totalDistance: Math.round(totalDistance),
        estimatedTime: Math.round(totalDistance / 1.4),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in pathfinding:", error);
    return new Response(
      JSON.stringify({ error: "Pathfinding failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
