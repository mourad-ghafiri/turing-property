# 🕸️ Graph Modeling Examples

Using Turing Property to model any kind of graph structure — from simple trees to complex networks.

---

## 🎯 Why Model Graphs with Properties?

Turing Property's homoiconic nature makes it perfect for graph modeling:
- **Nodes are Properties** — Each node carries its own data, metadata, and constraints
- **Edges are References** — Connect nodes using REF expressions
- **Traversal is Native** — PropertyNode provides tree navigation built-in
- **Serializable** — Entire graphs serialize to JSON
- **Dynamic** — Node properties can be computed expressions

---

## 🌳 Tree Structures

### Organization Hierarchy

```typescript
// Define node structure
const orgNode: Property = {
    id: 'employee',
    type: { id: 'OrgNode', type: TYPE },
    metadata: {
        name: { id: 'name', type: STRING, value: '' },
        title: { id: 'title', type: STRING, value: '' },
        department: { id: 'department', type: STRING, value: '' },
        level: { id: 'level', type: NUMBER, value: 0 }
    },
    children: {}  // Direct reports
};

// Build the org chart
const orgChart: Property = {
    id: 'ceo',
    type: { id: 'OrgNode', type: TYPE },
    metadata: {
        name: { id: 'name', type: STRING, value: 'Alice Johnson' },
        title: { id: 'title', type: STRING, value: 'CEO' },
        level: { id: 'level', type: NUMBER, value: 0 }
    },
    children: {
        cto: {
            id: 'cto',
            type: { id: 'OrgNode', type: TYPE },
            metadata: {
                name: { id: 'name', type: STRING, value: 'Bob Smith' },
                title: { id: 'title', type: STRING, value: 'CTO' },
                level: { id: 'level', type: NUMBER, value: 1 }
            },
            children: {
                leadDev: {
                    id: 'leadDev',
                    type: { id: 'OrgNode', type: TYPE },
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Carol White' },
                        title: { id: 'title', type: STRING, value: 'Lead Developer' },
                        level: { id: 'level', type: NUMBER, value: 2 }
                    },
                    children: {
                        dev1: {
                            id: 'dev1',
                            type: { id: 'OrgNode', type: TYPE },
                            metadata: {
                                name: { id: 'name', type: STRING, value: 'David Brown' },
                                title: { id: 'title', type: STRING, value: 'Senior Developer' },
                                level: { id: 'level', type: NUMBER, value: 3 }
                            }
                        },
                        dev2: {
                            id: 'dev2',
                            type: { id: 'OrgNode', type: TYPE },
                            metadata: {
                                name: { id: 'name', type: STRING, value: 'Eve Davis' },
                                title: { id: 'title', type: STRING, value: 'Developer' },
                                level: { id: 'level', type: NUMBER, value: 3 }
                            }
                        }
                    }
                }
            }
        },
        cfo: {
            id: 'cfo',
            type: { id: 'OrgNode', type: TYPE },
            metadata: {
                name: { id: 'name', type: STRING, value: 'Frank Miller' },
                title: { id: 'title', type: STRING, value: 'CFO' },
                level: { id: 'level', type: NUMBER, value: 1 }
            },
            children: {
                accountant: {
                    id: 'accountant',
                    type: { id: 'OrgNode', type: TYPE },
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Grace Lee' },
                        title: { id: 'title', type: STRING, value: 'Senior Accountant' },
                        level: { id: 'level', type: NUMBER, value: 2 }
                    }
                }
            }
        }
    }
};
```

### File System Tree

```typescript
const FILE_NODE: Property = { id: 'File', type: TYPE };
const DIR_NODE: Property = { id: 'Directory', type: TYPE };

const fileSystem: Property = {
    id: 'root',
    type: DIR_NODE,
    metadata: {
        name: { id: 'name', type: STRING, value: '/' },
        permissions: { id: 'permissions', type: STRING, value: 'rwxr-xr-x' }
    },
    children: {
        home: {
            id: 'home',
            type: DIR_NODE,
            metadata: {
                name: { id: 'name', type: STRING, value: 'home' }
            },
            children: {
                user: {
                    id: 'user',
                    type: DIR_NODE,
                    metadata: { name: { id: 'name', type: STRING, value: 'user' } },
                    children: {
                        documents: {
                            id: 'documents',
                            type: DIR_NODE,
                            metadata: { name: { id: 'name', type: STRING, value: 'documents' } },
                            children: {
                                readme: {
                                    id: 'readme',
                                    type: FILE_NODE,
                                    metadata: {
                                        name: { id: 'name', type: STRING, value: 'readme.txt' },
                                        size: { id: 'size', type: NUMBER, value: 1024 },
                                        modified: { id: 'modified', type: STRING, value: '2024-01-15' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        etc: {
            id: 'etc',
            type: DIR_NODE,
            metadata: { name: { id: 'name', type: STRING, value: 'etc' } },
            children: {
                config: {
                    id: 'config',
                    type: FILE_NODE,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'config.json' },
                        size: { id: 'size', type: NUMBER, value: 256 }
                    }
                }
            }
        }
    }
};
```

---

## 🔗 Directed Graphs

### Dependency Graph

```typescript
const PACKAGE_NODE: Property = { id: 'Package', type: TYPE };

// Each package references its dependencies
const dependencyGraph: Property = {
    id: 'packages',
    type: { id: 'DependencyGraph', type: TYPE },
    children: {
        react: {
            id: 'react',
            type: PACKAGE_NODE,
            metadata: {
                name: { id: 'name', type: STRING, value: 'react' },
                version: { id: 'version', type: STRING, value: '18.2.0' }
            },
            children: {
                // Dependencies stored as references
                dependencies: {
                    id: 'dependencies',
                    type: { id: 'List', type: TYPE },
                    value: []  // No dependencies
                }
            }
        },
        reactDom: {
            id: 'reactDom',
            type: PACKAGE_NODE,
            metadata: {
                name: { id: 'name', type: STRING, value: 'react-dom' },
                version: { id: 'version', type: STRING, value: '18.2.0' }
            },
            children: {
                dependencies: {
                    id: 'dependencies',
                    type: { id: 'List', type: TYPE },
                    value: [
                        // Reference to react package
                        { id: 'dep0', type: REF, value: ['root', 'children', 'react'] }
                    ]
                }
            }
        },
        nextjs: {
            id: 'nextjs',
            type: PACKAGE_NODE,
            metadata: {
                name: { id: 'name', type: STRING, value: 'next' },
                version: { id: 'version', type: STRING, value: '14.0.0' }
            },
            children: {
                dependencies: {
                    id: 'dependencies',
                    type: { id: 'List', type: TYPE },
                    value: [
                        { id: 'dep0', type: REF, value: ['root', 'children', 'react'] },
                        { id: 'dep1', type: REF, value: ['root', 'children', 'reactDom'] }
                    ]
                }
            }
        }
    }
};
```

### Knowledge Graph

```typescript
const CONCEPT_NODE: Property = { id: 'Concept', type: TYPE };
const RELATION_EDGE: Property = { id: 'Relation', type: TYPE };

const knowledgeGraph: Property = {
    id: 'knowledge',
    type: { id: 'KnowledgeGraph', type: TYPE },
    children: {
        nodes: {
            id: 'nodes',
            type: { id: 'NodeMap', type: TYPE },
            children: {
                javascript: {
                    id: 'javascript',
                    type: CONCEPT_NODE,
                    metadata: {
                        label: { id: 'label', type: STRING, value: 'JavaScript' },
                        category: { id: 'category', type: STRING, value: 'Programming Language' }
                    }
                },
                typescript: {
                    id: 'typescript',
                    type: CONCEPT_NODE,
                    metadata: {
                        label: { id: 'label', type: STRING, value: 'TypeScript' },
                        category: { id: 'category', type: STRING, value: 'Programming Language' }
                    }
                },
                nodejs: {
                    id: 'nodejs',
                    type: CONCEPT_NODE,
                    metadata: {
                        label: { id: 'label', type: STRING, value: 'Node.js' },
                        category: { id: 'category', type: STRING, value: 'Runtime' }
                    }
                },
                react: {
                    id: 'react',
                    type: CONCEPT_NODE,
                    metadata: {
                        label: { id: 'label', type: STRING, value: 'React' },
                        category: { id: 'category', type: STRING, value: 'Framework' }
                    }
                }
            }
        },
        edges: {
            id: 'edges',
            type: { id: 'EdgeList', type: TYPE },
            children: {
                tsExtendsJs: {
                    id: 'tsExtendsJs',
                    type: RELATION_EDGE,
                    metadata: {
                        relation: { id: 'relation', type: STRING, value: 'extends' },
                        from: { id: 'from', type: REF, value: ['root', 'children', 'nodes', 'children', 'typescript'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'nodes', 'children', 'javascript'] }
                    }
                },
                nodeRunsJs: {
                    id: 'nodeRunsJs',
                    type: RELATION_EDGE,
                    metadata: {
                        relation: { id: 'relation', type: STRING, value: 'runs' },
                        from: { id: 'from', type: REF, value: ['root', 'children', 'nodes', 'children', 'nodejs'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'nodes', 'children', 'javascript'] }
                    }
                },
                reactUsesJs: {
                    id: 'reactUsesJs',
                    type: RELATION_EDGE,
                    metadata: {
                        relation: { id: 'relation', type: STRING, value: 'uses' },
                        from: { id: 'from', type: REF, value: ['root', 'children', 'nodes', 'children', 'react'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'nodes', 'children', 'javascript'] }
                    }
                }
            }
        }
    }
};
```

---

## 🔀 State Machines

### Finite State Machine

```typescript
const STATE_NODE: Property = { id: 'State', type: TYPE };
const TRANSITION_EDGE: Property = { id: 'Transition', type: TYPE };

const trafficLightFSM: Property = {
    id: 'trafficLight',
    type: { id: 'StateMachine', type: TYPE },
    metadata: {
        initial: { id: 'initial', type: STRING, value: 'red' },
        current: { id: 'current', type: STRING, value: 'red' }
    },
    children: {
        states: {
            id: 'states',
            type: { id: 'StateMap', type: TYPE },
            children: {
                red: {
                    id: 'red',
                    type: STATE_NODE,
                    metadata: {
                        label: { id: 'label', type: STRING, value: '🔴 Red' },
                        duration: { id: 'duration', type: NUMBER, value: 30 }
                    }
                },
                yellow: {
                    id: 'yellow',
                    type: STATE_NODE,
                    metadata: {
                        label: { id: 'label', type: STRING, value: '🟡 Yellow' },
                        duration: { id: 'duration', type: NUMBER, value: 5 }
                    }
                },
                green: {
                    id: 'green',
                    type: STATE_NODE,
                    metadata: {
                        label: { id: 'label', type: STRING, value: '🟢 Green' },
                        duration: { id: 'duration', type: NUMBER, value: 25 }
                    }
                }
            }
        },
        transitions: {
            id: 'transitions',
            type: { id: 'TransitionList', type: TYPE },
            children: {
                redToGreen: {
                    id: 'redToGreen',
                    type: TRANSITION_EDGE,
                    metadata: {
                        event: { id: 'event', type: STRING, value: 'timer' },
                        from: { id: 'from', type: REF, value: ['root', 'children', 'states', 'children', 'red'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'states', 'children', 'green'] }
                    }
                },
                greenToYellow: {
                    id: 'greenToYellow',
                    type: TRANSITION_EDGE,
                    metadata: {
                        event: { id: 'event', type: STRING, value: 'timer' },
                        from: { id: 'from', type: REF, value: ['root', 'children', 'states', 'children', 'green'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'states', 'children', 'yellow'] }
                    }
                },
                yellowToRed: {
                    id: 'yellowToRed',
                    type: TRANSITION_EDGE,
                    metadata: {
                        event: { id: 'event', type: STRING, value: 'timer' },
                        from: { id: 'from', type: REF, value: ['root', 'children', 'states', 'children', 'yellow'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'states', 'children', 'red'] }
                    }
                }
            }
        }
    }
};
```

### Order Status State Machine

```typescript
const orderStatusMachine: Property = {
    id: 'orderStatus',
    type: { id: 'StateMachine', type: TYPE },
    metadata: {
        initial: { id: 'initial', type: STRING, value: 'pending' }
    },
    children: {
        states: {
            id: 'states',
            type: { id: 'StateMap', type: TYPE },
            children: {
                pending: {
                    id: 'pending',
                    type: STATE_NODE,
                    metadata: {
                        label: { id: 'label', type: STRING, value: '⏳ Pending' },
                        allowedActions: { id: 'allowedActions', type: { id: 'List', type: TYPE }, value: ['confirm', 'cancel'] }
                    }
                },
                confirmed: {
                    id: 'confirmed',
                    type: STATE_NODE,
                    metadata: {
                        label: { id: 'label', type: STRING, value: '✅ Confirmed' },
                        allowedActions: { id: 'allowedActions', type: { id: 'List', type: TYPE }, value: ['ship', 'cancel'] }
                    }
                },
                shipped: {
                    id: 'shipped',
                    type: STATE_NODE,
                    metadata: {
                        label: { id: 'label', type: STRING, value: '📦 Shipped' },
                        allowedActions: { id: 'allowedActions', type: { id: 'List', type: TYPE }, value: ['deliver'] }
                    }
                },
                delivered: {
                    id: 'delivered',
                    type: STATE_NODE,
                    metadata: {
                        label: { id: 'label', type: STRING, value: '🎉 Delivered' },
                        final: { id: 'final', type: BOOLEAN, value: true }
                    }
                },
                cancelled: {
                    id: 'cancelled',
                    type: STATE_NODE,
                    metadata: {
                        label: { id: 'label', type: STRING, value: '❌ Cancelled' },
                        final: { id: 'final', type: BOOLEAN, value: true }
                    }
                }
            }
        },
        transitions: {
            id: 'transitions',
            type: { id: 'TransitionList', type: TYPE },
            children: {
                confirm: {
                    id: 'confirm',
                    type: TRANSITION_EDGE,
                    metadata: {
                        event: { id: 'event', type: STRING, value: 'confirm' },
                        from: { id: 'from', type: REF, value: ['root', 'children', 'states', 'children', 'pending'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'states', 'children', 'confirmed'] }
                    }
                },
                ship: {
                    id: 'ship',
                    type: TRANSITION_EDGE,
                    metadata: {
                        event: { id: 'event', type: STRING, value: 'ship' },
                        from: { id: 'from', type: REF, value: ['root', 'children', 'states', 'children', 'confirmed'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'states', 'children', 'shipped'] }
                    }
                },
                deliver: {
                    id: 'deliver',
                    type: TRANSITION_EDGE,
                    metadata: {
                        event: { id: 'event', type: STRING, value: 'deliver' },
                        from: { id: 'from', type: REF, value: ['root', 'children', 'states', 'children', 'shipped'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'states', 'children', 'delivered'] }
                    }
                },
                cancelFromPending: {
                    id: 'cancelFromPending',
                    type: TRANSITION_EDGE,
                    metadata: {
                        event: { id: 'event', type: STRING, value: 'cancel' },
                        from: { id: 'from', type: REF, value: ['root', 'children', 'states', 'children', 'pending'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'states', 'children', 'cancelled'] }
                    }
                },
                cancelFromConfirmed: {
                    id: 'cancelFromConfirmed',
                    type: TRANSITION_EDGE,
                    metadata: {
                        event: { id: 'event', type: STRING, value: 'cancel' },
                        from: { id: 'from', type: REF, value: ['root', 'children', 'states', 'children', 'confirmed'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'states', 'children', 'cancelled'] }
                    }
                }
            }
        }
    }
};
```

---

## 🌐 Network Topology

### Computer Network

```typescript
const DEVICE_NODE: Property = { id: 'Device', type: TYPE };
const CONNECTION_EDGE: Property = { id: 'Connection', type: TYPE };

const networkTopology: Property = {
    id: 'network',
    type: { id: 'NetworkTopology', type: TYPE },
    children: {
        devices: {
            id: 'devices',
            type: { id: 'DeviceMap', type: TYPE },
            children: {
                router: {
                    id: 'router',
                    type: DEVICE_NODE,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Main Router' },
                        ip: { id: 'ip', type: STRING, value: '192.168.1.1' },
                        deviceType: { id: 'deviceType', type: STRING, value: 'router' }
                    }
                },
                switch1: {
                    id: 'switch1',
                    type: DEVICE_NODE,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Switch A' },
                        ip: { id: 'ip', type: STRING, value: '192.168.1.2' },
                        deviceType: { id: 'deviceType', type: STRING, value: 'switch' }
                    }
                },
                server1: {
                    id: 'server1',
                    type: DEVICE_NODE,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Web Server' },
                        ip: { id: 'ip', type: STRING, value: '192.168.1.10' },
                        deviceType: { id: 'deviceType', type: STRING, value: 'server' }
                    }
                },
                server2: {
                    id: 'server2',
                    type: DEVICE_NODE,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Database Server' },
                        ip: { id: 'ip', type: STRING, value: '192.168.1.11' },
                        deviceType: { id: 'deviceType', type: STRING, value: 'server' }
                    }
                },
                workstation1: {
                    id: 'workstation1',
                    type: DEVICE_NODE,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Developer PC' },
                        ip: { id: 'ip', type: STRING, value: '192.168.1.100' },
                        deviceType: { id: 'deviceType', type: STRING, value: 'workstation' }
                    }
                }
            }
        },
        connections: {
            id: 'connections',
            type: { id: 'ConnectionList', type: TYPE },
            children: {
                routerToSwitch: {
                    id: 'routerToSwitch',
                    type: CONNECTION_EDGE,
                    metadata: {
                        from: { id: 'from', type: REF, value: ['root', 'children', 'devices', 'children', 'router'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'devices', 'children', 'switch1'] },
                        bandwidth: { id: 'bandwidth', type: STRING, value: '1Gbps' }
                    }
                },
                switchToServer1: {
                    id: 'switchToServer1',
                    type: CONNECTION_EDGE,
                    metadata: {
                        from: { id: 'from', type: REF, value: ['root', 'children', 'devices', 'children', 'switch1'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'devices', 'children', 'server1'] },
                        bandwidth: { id: 'bandwidth', type: STRING, value: '1Gbps' }
                    }
                },
                switchToServer2: {
                    id: 'switchToServer2',
                    type: CONNECTION_EDGE,
                    metadata: {
                        from: { id: 'from', type: REF, value: ['root', 'children', 'devices', 'children', 'switch1'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'devices', 'children', 'server2'] },
                        bandwidth: { id: 'bandwidth', type: STRING, value: '1Gbps' }
                    }
                },
                switchToWorkstation: {
                    id: 'switchToWorkstation',
                    type: CONNECTION_EDGE,
                    metadata: {
                        from: { id: 'from', type: REF, value: ['root', 'children', 'devices', 'children', 'switch1'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'devices', 'children', 'workstation1'] },
                        bandwidth: { id: 'bandwidth', type: STRING, value: '100Mbps' }
                    }
                }
            }
        }
    }
};
```

---

## 🗺️ Geographical / Spatial Graphs

### City Map (Points of Interest)

```typescript
const LOCATION_NODE: Property = { id: 'Location', type: TYPE };
const ROUTE_EDGE: Property = { id: 'Route', type: TYPE };

const cityMap: Property = {
    id: 'cityMap',
    type: { id: 'SpatialGraph', type: TYPE },
    children: {
        locations: {
            id: 'locations',
            type: { id: 'LocationMap', type: TYPE },
            children: {
                airport: {
                    id: 'airport',
                    type: LOCATION_NODE,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'City Airport' },
                        lat: { id: 'lat', type: NUMBER, value: 40.6413 },
                        lng: { id: 'lng', type: NUMBER, value: -73.7781 },
                        category: { id: 'category', type: STRING, value: 'transport' }
                    }
                },
                downtown: {
                    id: 'downtown',
                    type: LOCATION_NODE,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Downtown' },
                        lat: { id: 'lat', type: NUMBER, value: 40.7128 },
                        lng: { id: 'lng', type: NUMBER, value: -74.0060 },
                        category: { id: 'category', type: STRING, value: 'district' }
                    }
                },
                museum: {
                    id: 'museum',
                    type: LOCATION_NODE,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'City Museum' },
                        lat: { id: 'lat', type: NUMBER, value: 40.7794 },
                        lng: { id: 'lng', type: NUMBER, value: -73.9632 },
                        category: { id: 'category', type: STRING, value: 'attraction' }
                    }
                }
            }
        },
        routes: {
            id: 'routes',
            type: { id: 'RouteList', type: TYPE },
            children: {
                airportToDowntown: {
                    id: 'airportToDowntown',
                    type: ROUTE_EDGE,
                    metadata: {
                        from: { id: 'from', type: REF, value: ['root', 'children', 'locations', 'children', 'airport'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'locations', 'children', 'downtown'] },
                        distance: { id: 'distance', type: NUMBER, value: 15.2 },
                        duration: { id: 'duration', type: NUMBER, value: 45 },
                        mode: { id: 'mode', type: STRING, value: 'subway' }
                    }
                },
                downtownToMuseum: {
                    id: 'downtownToMuseum',
                    type: ROUTE_EDGE,
                    metadata: {
                        from: { id: 'from', type: REF, value: ['root', 'children', 'locations', 'children', 'downtown'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'locations', 'children', 'museum'] },
                        distance: { id: 'distance', type: NUMBER, value: 7.5 },
                        duration: { id: 'duration', type: NUMBER, value: 20 },
                        mode: { id: 'mode', type: STRING, value: 'bus' }
                    }
                }
            }
        }
    }
};
```

---

## 🧬 Abstract Syntax Trees (AST)

### Simple Expression AST

```typescript
const AST_NODE: Property = { id: 'ASTNode', type: TYPE };

// Representing: (2 + 3) * 4
const expressionAST: Property = {
    id: 'expression',
    type: AST_NODE,
    metadata: {
        operator: { id: 'operator', type: STRING, value: 'multiply' }
    },
    children: {
        left: {
            id: 'left',
            type: AST_NODE,
            metadata: {
                operator: { id: 'operator', type: STRING, value: 'add' }
            },
            children: {
                left: {
                    id: 'left',
                    type: AST_NODE,
                    metadata: {
                        nodeType: { id: 'nodeType', type: STRING, value: 'literal' },
                        value: { id: 'value', type: NUMBER, value: 2 }
                    }
                },
                right: {
                    id: 'right',
                    type: AST_NODE,
                    metadata: {
                        nodeType: { id: 'nodeType', type: STRING, value: 'literal' },
                        value: { id: 'value', type: NUMBER, value: 3 }
                    }
                }
            }
        },
        right: {
            id: 'right',
            type: AST_NODE,
            metadata: {
                nodeType: { id: 'nodeType', type: STRING, value: 'literal' },
                value: { id: 'value', type: NUMBER, value: 4 }
            }
        }
    }
};
```

---

## 📚 Next Steps

- 🔄 [Workflow Examples](./workflows.md) — CI/CD, BPMN, agentic flows
- 🧙 [Wizard Examples](./wizards.md) — Multi-step UI processes
- 🏢 [Data Modeling Examples](./data-modeling.md)

