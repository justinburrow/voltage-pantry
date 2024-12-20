# Electronic Component Inventory

## Current System State
The application currently provides electronic component inventory management with the following features:
- Location-based tracking and management
- Component categorization and metadata
- Quantity tracking
- Search functionality
- Barcode integration for rapid lookups

## Planned Enhancements

### 1. Project Base Structure
**Complexity: 2/5**
**Purpose:** Establish foundation for project-based component management

Required Implementation:
- Project schema with core fields:
  ```typescript
  interface Project {
    id: string
    name: string
    dateCreated: Date
    components: ProjectComponent[]
    availabilityPercentage: number
    costRemaining: number
  }
  ```
- CRUD operations implementation
- Project listing view with sorting/filtering
- Detailed project view with component management

### 2. Component-Project Association
**Complexity: 3/5**
**Purpose:** Enable inventory allocation and tracking within projects

Required Implementation:
- Component association interface:
  ```typescript
  interface ProjectComponent {
    componentId: string
    quantityNeeded: number
    priority?: 1 | 2 | 3 | 4 | 5
    dateNeeded: Date
  }
  ```
- Quantity allocation system
- Component search/add workflow
- Real-time availability tracking
- Completion percentage calculator

### 3. Missing Components Management
**Complexity: 3/5**
**Purpose:** Track and manage procurement needs for unavailable components

Required Implementation:
- Extended ProjectComponent interface:
  ```typescript
  interface ProjectComponent {
    estimatedCost?: number
    purchaseUrl?: string
  }
  ```
- Shopping list view implementation
- Priority ranking system (1-5)
- Project cost remaining calculator
- Purchase URL management

### 4. Allocation Queue System
**Complexity: 4/5**
**Purpose:** Manage component distribution across multiple projects

Required Implementation:
- Priority-based allocation logic
- Secondary sorting by timestamp
- Allocation event handlers
- Automatic status updates
- Component availability triggers
- Reallocation system

### 5. Project Status Dashboard
**Complexity: 2/5**
**Purpose:** Provide project overview and status monitoring

Required Implementation:
- Status overview UI components
- Advanced filtering/sorting capabilities
- Cost summary displays
- Availability percentage visualization
- Shopping list integration
- Project readiness indicators

## Implementation Order
1. Project Base Structure
2. Component-Project Association
3. Missing Components Management
4. Project Status Dashboard
5. Allocation Queue System

This order maximizes incremental value delivery while managing implementation complexity. Each phase builds upon previous functionality while maintaining system stability.

## Core Architecture

### Database Schema
```sql
component_types: {
  id: uuid PK
  name: text
  value_type: component_value_type
  unit: text
  created_at: timestamptz
}

components: {
  id: uuid PK
  type_id: uuid FK(component_types)
  family: text
  manufacturer: text
  quantity: integer
  location_id: uuid FK(locations)
  user_id: uuid FK(auth.users)
  base_value: numeric
  display_value: text
  search_vector: tsvector
  created_at: timestamptz
  updated_at: timestamptz
}

locations: {
  id: uuid PK
  name: text
  description: text
  created_at: timestamptz
}

projects: {
  id: uuid PK
  name: text
  user_id: uuid FK(auth.users)
  components: jsonb
  created_at: timestamptz
  updated_at: timestamptz
}
```

### Search Implementation
- Combined full-text and trigram search using Postgres
- Normalized value storage for range-based queries
- Computed search vectors for efficient text matching
- Value normalization handling for common component notations (e.g., 10k = 10000)

### Value Normalization
Built-in handling for:
- Resistance: mΩ to MΩ with standard multipliers
- Capacitance: pF to F with metric prefixes
- Switch configurations: Standard patterns (SPST, DPDT) and custom NpMt formats

## Feature Status

### Completed
1. **Component Management**
   - Location-based tracking
   - Quantity management
   - Value normalization and storage
   - Type categorization

2. **Search Functionality**
   - Fuzzy text search with similarity matching
   - Value-based range queries
   - Combined type and value filtering
   - URL-driven search state

### In Progress
1. **Project Management**
   - Schema structure implemented
   - Basic JSONB storage for component lists
   - Groundwork for component allocation

### Planned
1. **Project Implementation**
   - Component allocation UI
   - Availability tracking
   - Project status dashboard

2. **Inventory Planning**
   - Shopping list generation
   - Project-based allocation queues
   - Reorder point tracking

## Technical Decisions

### Schema Simplification
- Merged normalized_values into components table
- Implemented computed columns for search optimization
- Used JSONB for flexible project component storage
- Simplified relationships to reduce join complexity

### Search Optimization
- Combined tsvector and trigram matching for robust text search
- Implemented base_value storage for efficient range queries
- Pre-computed search vectors for performance
- URL-driven search state for shareability

### Project Structure
- Simplified from traditional relational model to JSONB storage
- Maintains query efficiency while reducing schema complexity
- Enables flexible component allocation without complex joins
- Supports future extension without schema modifications

## Implementation Notes

### Value Normalization
```typescript
interface NormalizedResult {
  base_value: number;    // Stored in base unit (e.g., ohms)
  display_value: string; // Formatted for display (e.g., "4.7kΩ")
}
```

### Component Search
```sql
search_vector: tsvector generated always as (
  to_tsvector('english',
    coalesce(family, '') || ' ' ||
    coalesce(manufacturer, '') || ' ' ||
    coalesce(display_value, '')
  )
) stored
```

### Project Components
```typescript
type ProjectComponent = {
  component_id: string;
  quantity_needed: number;
  priority?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
};
```