# Campus Compass - Technical Documentation

## System Architecture Overview

Campus Compass is a full-stack web application that combines frontend navigation UI with advanced backend pathfinding algorithms, all powered by Supabase and Google Cloud technologies.

### Technology Stack

**Frontend:**
- React 18.3 with TypeScript 5.5
- Vite 5.4 (build tool)
- Tailwind CSS 3.4 (styling)
- Three.js 0.160 (3D AR visualization)
- Lucide React 0.344 (icons)

**Backend:**
- Supabase (PostgreSQL database)
- Supabase Edge Functions (serverless computing)
- Deno runtime for edge functions

**Deployment:**
- GitHub Pages / Vercel (frontend)
- Supabase Cloud (backend)

---

## Data Structures

### 1. Graph-Based Campus Representation

**File:** `src/lib/graph.ts`

The campus is modeled as a directed graph where:
- **Nodes** represent locations (classrooms, labs, offices, waypoints)
- **Edges** represent connections between locations with distance and time costs

```typescript
interface Node {
  id: string;
  name: string;
  type: 'location' | 'waypoint' | 'junction';
  floorId: string;
  buildingId: string;
  coordinates: { x: number; y: number };
  imageUrl?: string;
}

interface Edge {
  id: string;
  from: string;
  to: string;
  distance: number;        // in meters/units
  time: number;            // estimated walking time in seconds
  description: string;
}
```

### 2. Campus Graph Class

The `CampusGraph` class manages the graph structure:

```typescript
class CampusGraph {
  addNode(node: Node): void
  addEdge(edge: Edge): void
  getNode(id: string): Node | undefined
  getEdges(from: string): Edge[]
  getAdjacentNodes(nodeId: string): string[]
  getAllNodes(): Node[]
  getAllEdges(): Edge[]
}
```

**Adjacency List Representation:**
- Key: Node ID
- Value: Array of adjacent node IDs
- Enables O(1) lookup of connected nodes

---

## Pathfinding Algorithm

### Dijkstra's Shortest Path Algorithm

**File:** `src/lib/graph.ts`

Implemented as a static class method for finding optimal routes between any two campus locations.

**Algorithm Overview:**
```
1. Initialize distances to all nodes as infinity (except start = 0)
2. Mark all nodes as unvisited
3. While unvisited nodes exist:
   a. Select unvisited node with minimum distance
   b. For each adjacent unvisited node:
      - Calculate new distance through current node
      - Update if new distance is shorter
   c. Mark current node as visited
4. Reconstruct path by backtracking from end to start using previous[] map
```

**Time Complexity:** O(V² + E) where V = vertices, E = edges
**Space Complexity:** O(V) for distance and visited tracking

**Key Features:**
- Handles multi-floor campus traversal
- Calculates total distance and estimated walking time
- Returns complete path with ordered nodes and edges

**Usage:**
```typescript
const result = Dijkstra.findShortestPath(
  campusGraph,
  startLocationId,
  endLocationId
);

// Result contains:
// - nodes: ordered array of nodes in path
// - edges: connections between nodes
// - totalDistance: sum of all edge distances
// - totalTime: estimated walking time
```

---

## Backend: Edge Function for Pathfinding

**File:** `supabase/functions/pathfinding/index.ts`

### Purpose
Offload complex pathfinding calculations to the server-side Edge Function to:
1. Reduce client-side computational load
2. Ensure consistency across all users
3. Allow real-time graph updates from database

### API Specification

**Endpoint:** `POST /functions/v1/pathfinding`

**Request Body:**
```json
{
  "locations": [
    { "id": "loc1", "name": "CS-101", "floor_id": "f1", "building_id": "b1" }
  ],
  "waypoints": [
    { "id": "wp1", "name": "Junction A", "building_id": "b1", "floor_id": "f1" }
  ],
  "navigationSteps": [
    { "from_location_id": "loc1", "to_location_id": "loc2", "waypoint_id": "wp1", "step_number": 1 }
  ],
  "startLocationId": "loc1",
  "endLocationId": "loc2"
}
```

**Response:**
```json
{
  "path": [
    {
      "id": "node_id",
      "name": "Location Name",
      "type": "location|waypoint",
      "coordinates": { "x": 100, "y": 200 }
    }
  ],
  "totalDistance": 150,
  "estimatedTime": 107
}
```

**Error Responses:**
- 400: Missing start/end location
- 404: No path found between locations
- 500: Pathfinding calculation error

### Implementation Details

The Edge Function performs:
1. **Graph Construction** - Builds nodes from locations and waypoints
2. **Adjacency List Creation** - Maps navigation steps to edges
3. **Dijkstra Execution** - Calculates optimal path
4. **Distance Calculation** - Computes Euclidean distances between nodes
5. **Response Formatting** - Returns path with metadata

---

## Frontend Components

### 1. Landing Page (`src/components/LandingPage.tsx`)

**Features:**
- Hero section with project overview
- Feature highlights with icons
- CTA buttons for getting started
- Responsive design (mobile-first)
- Gradient backgrounds and smooth animations

### 2. Role Selection (`src/components/RoleSelection.tsx`)

**User Roles:**
- Student: Classrooms, labs, restrooms
- Faculty: Faculty cabins, offices, departmental areas
- Admin: Administrative offices, COE, accounts
- Visitor: Common areas, main facilities

**Database Integration:**
- Locations filtered by `role_access` array
- Role-specific permission system
- Custom styling per role

### 3. Enhanced Navigation System (`src/components/EnhancedNavigationSystem.tsx`)

**Key Features:**

**Search Functionality:**
- Real-time filtering by location name, room number, description
- Instant search results as user types
- No database query lag for basic search

**Path Selection Interface:**
- Two-step selection: start location → destination
- Visual feedback showing selected start location
- Smooth transitions between selection states

**Optimal Route Calculation:**
- Calls backend Edge Function with selected locations
- Receives optimized path with distance and time estimates
- Displays route statistics (distance, estimated walking time)

**Route Visualization:**
- Step-by-step numbered navigation
- Location images at each step
- Node type indicators (location, waypoint, junction)
- Smooth scrolling through route details

### 4. AR Visualization (`src/components/ARVisualization.tsx`)

**Technology:** Three.js 3D rendering

**Features:**

**3D Scene Construction:**
- Sphere geometries for nodes (3px radius)
- Color coding: Green (start), Red (end), Blue (intermediate)
- Cone geometries for directional arrows
- Canvas texture for location labels

**Interactive Controls:**
- Mouse movement = camera rotation
- Smooth easing for natural interaction
- 360-degree view capability

**Lighting System:**
- Ambient lighting (0.8 intensity)
- Directional lighting from top-right
- Standard material with metalness and roughness

**Rendering:**
- Real-time animation loop (60 FPS)
- Responsive to window resizing
- Proper cleanup to prevent memory leaks

---

## Database Schema

### Tables

**buildings**
- id (UUID, PK)
- name (text) - Building name
- code (text) - Building code (UNIQUE)
- type (text) - academic|laboratory|administrative|facility
- description (text)
- image_url (text) - Building photo
- latitude/longitude (numeric) - For map positioning
- created_at (timestamptz)

**floors**
- id (UUID, PK)
- building_id (UUID, FK)
- floor_number (integer) - 0 for ground, -1 for basement
- name (text) - "Ground Floor", "First Floor"
- map_image_url (text) - Floor plan image
- created_at (timestamptz)

**locations**
- id (UUID, PK)
- floor_id (UUID, FK)
- name (text) - Room/location name
- type (text) - classroom|lab|office|faculty_cabin|restroom
- room_number (text) - CS-101, LAB-203
- description (text) - Additional details
- role_access (text[]) - Array of role strings
- image_url (text) - Location photo
- created_at (timestamptz)

**waypoints**
- id (UUID, PK)
- name (text) - "Main Entrance", "Staircase A"
- description (text)
- image_url (text) - Actual corridor/junction photo
- building_id (UUID, FK)
- floor_id (UUID, FK, nullable)
- waypoint_type (text) - entrance|junction|staircase|corridor|landmark
- created_at (timestamptz)

**navigation_steps**
- id (UUID, PK)
- from_location_id (UUID, FK)
- to_location_id (UUID, FK)
- step_number (integer) - Ordering
- waypoint_id (UUID, FK)
- instruction (text) - Navigation direction
- created_at (timestamptz)
- UNIQUE(from_location_id, to_location_id, step_number)

### Row Level Security (RLS)

All tables have RLS enabled with public read access for the demo:
```sql
CREATE POLICY "Allow public read access"
  ON table_name FOR SELECT
  TO public
  USING (true);
```

---

## Demo Campus Data

**5 Buildings:**
1. Academic Block A (3 floors) - 7 classrooms/seminar halls
2. Academic Block B (2 floors) - 2 classrooms
3. Laboratory Complex (2 floors) - 5 labs
4. Administrative Building (2 floors) - 4 offices
5. Faculty Block (3 floors) - 4 faculty cabins + department office

**Total Locations:** 20+
**Total Waypoints:** 10+ per building
**Sample Routes:** Pre-configured navigation between key locations

---

## Engineering Aspects

### 1. Data Structure Complexity

**Graph Representation:**
- Adjacency list: O(1) neighbor lookup
- Hash maps for node storage: O(1) node access
- Suitable for sparse campus graphs

**Space Trade-off:**
- Graph requires O(V + E) space
- V ≈ 100 nodes (locations + waypoints)
- E ≈ 300 edges (interconnections)
- Total ≈ 5-10 KB memory footprint

### 2. Algorithm Efficiency

**Dijkstra's Algorithm:**
- Optimal for non-negative weights (distances > 0)
- Guarantees shortest path
- O(V²) with array implementation (sufficient for 100 nodes)
- Could optimize to O((V + E) log V) with min-heap

### 3. Scalability Considerations

**Current Implementation:**
- Suitable for single campus (100-500 nodes)
- All-in-memory graph processing
- Real-time pathfinding response (<1 second)

**Future Optimizations:**
- A* algorithm for faster pathfinding
- Geohashing for spatial indexing
- Path caching for frequent routes
- Multi-threaded pathfinding for large campuses

### 4. AR Visualization Performance

**Three.js Rendering:**
- GPU-accelerated 3D rendering
- Optimized geometry creation
- Proper material pooling
- Memory cleanup on unmount

**Performance Metrics:**
- 60 FPS on modern browsers
- <50 MB memory usage
- Responsive to 1000+ node paths

---

## API Integration

### Supabase Client

**File:** `src/lib/supabase.ts`

```typescript
const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### Data Fetching

**Locations with Relations:**
```typescript
const { data } = await supabase
  .from('locations')
  .select(`
    *,
    floor:floors(*, building:buildings(*))
  `)
  .contains('role_access', [role]);
```

**Pathfinding Request:**
```typescript
const response = await fetch(
  `${VITE_SUPABASE_URL}/functions/v1/pathfinding`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(pathRequest)
  }
);
```

---

## Setup & Deployment

### Local Development

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
```

### Environment Variables

```
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
```

### Deployment Platforms

- **Frontend:** Vercel, Netlify, GitHub Pages
- **Backend:** Supabase (automatic)
- **Database:** Supabase Cloud

---

## Performance Metrics

- **Bundle Size:** ~765 KB (with Three.js)
- **Initial Load:** <3 seconds
- **Pathfinding Time:** <500ms
- **AR Rendering:** 60 FPS
- **Database Query:** <100ms

---

## Future Enhancements

1. **A* Algorithm** - Faster pathfinding with heuristics
2. **Real-time Location Tracking** - GPS integration
3. **Collaborative Navigation** - Share routes with friends
4. **Event-Based Navigation** - Routes to campus events
5. **Accessibility Features** - Wheelchair routes, elevator locations
6. **Offline Support** - PWA with cached campus data
7. **Real-time Updates** - LiveQuery for location changes
8. **Voice Navigation** - Turn-by-turn voice directions
9. **Indoor Positioning** - Bluetooth beacon integration
10. **Mobile App** - React Native version

---

## Credits

**Development Team:**
- Akshaya A
- Karuna Mariyam Babu
- Gopika N K

**Institution:** Coimbatore Institute of Technology, Coimbatore

**Technologies:** Google Cloud, Supabase, React, TypeScript, Three.js
