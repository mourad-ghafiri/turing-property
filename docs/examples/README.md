# 💡 Examples

Real-world examples demonstrating Turing Property across different domains.

---

## 📚 Available Examples

| Example | Description |
|---------|-------------|
| [🕸️ Graphs](./graphs.md) | Trees, DAGs, state machines, networks, knowledge graphs |
| [🔄 Workflows](./workflows.md) | CI/CD, BPMN, agentic AI, event-driven automation |

---

## 🎯 By Domain

### 🕸️ Graph Structures
- [Organization Hierarchies](./graphs.md#organization-hierarchy)
- [File System Trees](./graphs.md#file-system-tree)
- [Dependency Graphs](./graphs.md#dependency-graph)
- [Knowledge Graphs](./graphs.md#knowledge-graph)
- [State Machines](./graphs.md#finite-state-machine)
- [Network Topology](./graphs.md#computer-network)
- [Abstract Syntax Trees](./graphs.md#simple-expression-ast)

### 🔄 Workflows & Automation
- [CI/CD Pipelines](./workflows.md#build-pipeline)
- [BPMN Business Processes](./workflows.md#order-processing-workflow)
- [Agentic AI Flows](./workflows.md#multi-agent-rag-pipeline)
- [ReAct Pattern Agents](./workflows.md#agent-orchestrator-react-pattern)
- [Event-Driven Automation](./workflows.md#serverless-event-flow)
- [Approval Workflows](./workflows.md#document-approval-process)

---

## 🚀 Quick Examples

### Simple Property

```typescript
const name: Property = {
    id: 'name',
    type: STRING,
    value: 'John'
};
```

### Expression (Computed Value)

```typescript
const greeting: Property = {
    id: 'greeting',
    type: STRING,
    value: {
        id: 'concat',
        type: OP,
        value: 'concat',
        children: {
            arg0: { id: 'arg0', type: LIT, value: 'Hello, ' },
            arg1: { id: 'arg1', type: REF, value: ['parent', 'children', 'name', 'value'] }
        }
    }
};
```

### Graph Node with References

```typescript
const node: Property = {
    id: 'nodeA',
    type: { id: 'GraphNode', type: TYPE },
    metadata: {
        label: { id: 'label', type: STRING, value: 'Node A' }
    },
    children: {
        edges: {
            id: 'edges',
            type: { id: 'EdgeList', type: TYPE },
            children: {
                toB: {
                    id: 'toB',
                    type: { id: 'Edge', type: TYPE },
                    metadata: {
                        target: { id: 'target', type: REF, value: ['root', 'children', 'nodeB'] },
                        weight: { id: 'weight', type: NUMBER, value: 1 }
                    }
                }
            }
        }
    }
};
```

### Workflow Step with Condition

```typescript
const step: Property = {
    id: 'deploy',
    type: { id: 'WorkflowStep', type: TYPE },
    metadata: {
        name: { id: 'name', type: STRING, value: 'Deploy to Production' },
        condition: {
            id: 'condition',
            type: OP,
            value: 'eq',
            children: {
                arg0: { id: 'arg0', type: REF, value: ['root', 'metadata', 'branch', 'value'] },
                arg1: { id: 'arg1', type: LIT, value: 'main' }
            }
        }
    }
};
```

---

## 📖 Learn More

- [🚀 Getting Started](../getting-started.md)
- [🧠 Core Concepts](../core-concepts.md)
- [🔢 Expressions](../expressions.md)
- [🏷️ Metadata](../metadata.md)
- [✅ Constraints](../constraints.md)
