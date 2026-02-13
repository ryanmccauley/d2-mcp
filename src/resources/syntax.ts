export const D2_SYNTAX_REFERENCE = `# D2 Language Syntax Reference

## Shapes
Shapes are declared by their name:
\`\`\`d2
server
database
my_shape: Custom Label
\`\`\`

### Shape Types
Set shape type with the \`shape\` attribute:
\`\`\`d2
my_shape: {
  shape: rectangle  # default
}
\`\`\`

Available shapes: rectangle, square, page, parallelogram, document, cylinder, queue, package, step, callout, stored_data, person, diamond, oval, circle, hexagon, cloud, text, code, class, sql_table, image, sequence_diagram, grid

## Connections
Connect shapes with arrows:
\`\`\`d2
a -> b: label            # directed
a -- b: label            # undirected
a <- b: label            # reverse direction
a <-> b: label           # bidirectional
\`\`\`

### Arrow types
\`\`\`d2
a -> b: {
  source-arrowhead: {
    shape: diamond       # none, arrow, triangle, diamond, filled-diamond, circle, filled-circle, cf-one, cf-many, cf-one-required, cf-many-required
  }
  target-arrowhead: {
    shape: arrow
    label: 1..*
  }
}
\`\`\`

## Containers (Nesting)
Group shapes inside containers:
\`\`\`d2
server: {
  api: API Server
  db: Database
  api -> db
}
\`\`\`

## Labels
\`\`\`d2
x: My Label              # inline label
x: |md
  # Markdown heading
  **bold** and *italic*
|                         # markdown label
x: |go
  func main() {}
|                         # code block with syntax highlighting
\`\`\`

## Styling
\`\`\`d2
my_shape: {
  style: {
    fill: "#ff0000"
    stroke: "#0000ff"
    stroke-width: 3
    stroke-dash: 5
    border-radius: 8
    opacity: 0.8
    shadow: true
    3d: true
    multiple: true
    font-size: 20
    font-color: "#333"
    bold: true
    italic: true
    underline: true
    animated: true        # for connections
    filled: true
    double-border: true
    fill-pattern: dots    # dots, lines, grain, none
  }
}
\`\`\`

## Icons
\`\`\`d2
my_shape: {
  icon: https://icons.terrastruct.com/essentials%2F112-server.svg
}
# Standalone icon (image shape)
github: {
  icon: https://icons.terrastruct.com/dev%2Fgithub.svg
  shape: image
}
\`\`\`

Icons from https://icons.terrastruct.com include: AWS, GCP, Azure, Kubernetes, dev tools, and essentials.

## SQL Tables
\`\`\`d2
users: {
  shape: sql_table
  id: int {constraint: primary_key}
  name: varchar
  email: varchar {constraint: unique}
  org_id: int {constraint: foreign_key}
}
\`\`\`

## UML Classes
\`\`\`d2
MyClass: {
  shape: class
  +public_field: string
  -private_field: int
  #protected_method(): void
}
\`\`\`

## Sequence Diagrams
\`\`\`d2
shape: sequence_diagram
alice -> bob: Hello
bob -> alice: Hi!
alice -> charlie: Hey
\`\`\`

## Grid Diagrams
\`\`\`d2
grid: {
  shape: grid
  rows: 2
  columns: 3
  cell1
  cell2
  cell3
  cell4
  cell5
  cell6
}
\`\`\`

## Text and Notes
\`\`\`d2
explanation: |md
  # Architecture Overview
  This diagram shows the system architecture.
  - **API** handles requests
  - **DB** stores data
| {
  near: top-center
}
\`\`\`

## Positions
\`\`\`d2
title: System {
  near: top-center        # top-left, top-center, top-right, center-left, center-right, bottom-left, bottom-center, bottom-right
}
\`\`\`

## Tooltips and Links
\`\`\`d2
server: {
  tooltip: This is the main API server
  link: https://example.com
}
\`\`\`

## Variables
\`\`\`d2
vars: {
  primary: "#4A90D9"
  server-color: "#E8F4FD"
}
server: {
  style.fill: \${primary}
}
\`\`\`

## Layers, Scenarios, and Steps
\`\`\`d2
# Base diagram
a -> b

layers: {
  deploy: {
    a -> b -> c
  }
}

scenarios: {
  failure: {
    a -> b: {style.stroke: red}
  }
}

steps: {
  1: {
    a -> b: Request
  }
  2: {
    b -> a: Response
  }
}
\`\`\`

## Imports
\`\`\`d2
# Import from another file
...@shared/styles.d2

# Import specific shape
my_shape: @imported_shape
\`\`\`

## Globs
\`\`\`d2
# Style all shapes
*.style.fill: "#f0f0f0"

# Style all connections
(* -> *)[*].style.stroke: red

# Style specific patterns
server.*.style.fill: blue
\`\`\`

## Direction
\`\`\`d2
direction: right          # right, down, left, up
\`\`\`

## Comments
\`\`\`d2
# This is a comment
\`\`\`

## Full Example
\`\`\`d2
direction: right

vars: {
  d2-config: {
    theme-id: 4
    sketch: true
  }
}

network: {
  cell tower: {
    icon: https://icons.terrastruct.com/essentials%2F187-cloud.svg
  }
  satellites: {
    icon: https://icons.terrastruct.com/essentials%2F112-server.svg
  }
  cell tower -> satellites: send
  satellites -> transmitter: send
  transmitter -> cell tower: send
}

user -> network.cell tower: make call
network.transmitter -> online portal: access
online portal -> data processor: display
data processor -> storage: persist
\`\`\`
`;
