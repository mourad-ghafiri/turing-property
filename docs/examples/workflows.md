# 🔄 Workflow Modeling Examples

Using Turing Property to model complex workflows — CI/CD pipelines, BPMN processes, agentic AI flows, and automation systems.

---

## 🎯 Why Model Workflows with Properties?

Turing Property's design is ideal for workflow modeling:
- **Steps are Properties** — Each step carries its own config, constraints, and metadata
- **Flow Control is Expressions** — Conditions, loops, and branching use OP expressions
- **State is Data** — Current state, history, and context are all Properties
- **Serializable** — Entire workflows persist as JSON
- **Dynamic** — Runtime evaluation enables adaptive workflows

---

## 🚀 CI/CD Pipeline

### Build Pipeline

```typescript
const PIPELINE: Property = { id: 'Pipeline', type: TYPE };
const STAGE: Property = { id: 'Stage', type: TYPE };
const JOB: Property = { id: 'Job', type: TYPE };
const STEP: Property = { id: 'Step', type: TYPE };

const buildPipeline: Property = {
    id: 'build-pipeline',
    type: PIPELINE,
    metadata: {
        name: { id: 'name', type: STRING, value: 'Build & Deploy' },
        trigger: { id: 'trigger', type: STRING, value: 'push' },
        branches: { id: 'branches', type: { id: 'List', type: TYPE }, value: ['main', 'develop'] }
    },
    children: {
        stages: {
            id: 'stages',
            type: { id: 'StageList', type: TYPE },
            children: {
                // Stage 1: Build
                build: {
                    id: 'build',
                    type: STAGE,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Build' },
                        order: { id: 'order', type: NUMBER, value: 1 }
                    },
                    children: {
                        jobs: {
                            id: 'jobs',
                            type: { id: 'JobList', type: TYPE },
                            children: {
                                buildApp: {
                                    id: 'buildApp',
                                    type: JOB,
                                    metadata: {
                                        name: { id: 'name', type: STRING, value: 'Build Application' },
                                        runner: { id: 'runner', type: STRING, value: 'ubuntu-latest' }
                                    },
                                    children: {
                                        steps: {
                                            id: 'steps',
                                            type: { id: 'StepList', type: TYPE },
                                            children: {
                                                checkout: {
                                                    id: 'checkout',
                                                    type: STEP,
                                                    metadata: {
                                                        name: { id: 'name', type: STRING, value: 'Checkout' },
                                                        uses: { id: 'uses', type: STRING, value: 'actions/checkout@v4' }
                                                    }
                                                },
                                                setupNode: {
                                                    id: 'setupNode',
                                                    type: STEP,
                                                    metadata: {
                                                        name: { id: 'name', type: STRING, value: 'Setup Node.js' },
                                                        uses: { id: 'uses', type: STRING, value: 'actions/setup-node@v4' },
                                                        with: {
                                                            id: 'with',
                                                            type: { id: 'Object', type: TYPE },
                                                            value: { 'node-version': '20' }
                                                        }
                                                    }
                                                },
                                                install: {
                                                    id: 'install',
                                                    type: STEP,
                                                    metadata: {
                                                        name: { id: 'name', type: STRING, value: 'Install Dependencies' },
                                                        run: { id: 'run', type: STRING, value: 'npm ci' }
                                                    }
                                                },
                                                build: {
                                                    id: 'build',
                                                    type: STEP,
                                                    metadata: {
                                                        name: { id: 'name', type: STRING, value: 'Build' },
                                                        run: { id: 'run', type: STRING, value: 'npm run build' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                
                // Stage 2: Test
                test: {
                    id: 'test',
                    type: STAGE,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Test' },
                        order: { id: 'order', type: NUMBER, value: 2 },
                        dependsOn: { id: 'dependsOn', type: REF, value: ['parent', 'children', 'build'] }
                    },
                    children: {
                        jobs: {
                            id: 'jobs',
                            type: { id: 'JobList', type: TYPE },
                            children: {
                                unitTests: {
                                    id: 'unitTests',
                                    type: JOB,
                                    metadata: {
                                        name: { id: 'name', type: STRING, value: 'Unit Tests' },
                                        runner: { id: 'runner', type: STRING, value: 'ubuntu-latest' }
                                    },
                                    children: {
                                        steps: {
                                            id: 'steps',
                                            type: { id: 'StepList', type: TYPE },
                                            children: {
                                                test: {
                                                    id: 'test',
                                                    type: STEP,
                                                    metadata: {
                                                        name: { id: 'name', type: STRING, value: 'Run Tests' },
                                                        run: { id: 'run', type: STRING, value: 'npm test -- --coverage' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                e2eTests: {
                                    id: 'e2eTests',
                                    type: JOB,
                                    metadata: {
                                        name: { id: 'name', type: STRING, value: 'E2E Tests' },
                                        runner: { id: 'runner', type: STRING, value: 'ubuntu-latest' }
                                    },
                                    children: {
                                        steps: {
                                            id: 'steps',
                                            type: { id: 'StepList', type: TYPE },
                                            children: {
                                                e2e: {
                                                    id: 'e2e',
                                                    type: STEP,
                                                    metadata: {
                                                        name: { id: 'name', type: STRING, value: 'Run E2E Tests' },
                                                        run: { id: 'run', type: STRING, value: 'npm run test:e2e' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                
                // Stage 3: Deploy
                deploy: {
                    id: 'deploy',
                    type: STAGE,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Deploy' },
                        order: { id: 'order', type: NUMBER, value: 3 },
                        dependsOn: { id: 'dependsOn', type: REF, value: ['parent', 'children', 'test'] },
                        // Conditional: only deploy from main branch
                        condition: {
                            id: 'condition',
                            type: OP,
                            value: 'eq',
                            children: {
                                arg0: { id: 'arg0', type: REF, value: ['root', 'metadata', 'branch', 'value'] },
                                arg1: { id: 'arg1', type: LIT, value: 'main' }
                            }
                        }
                    },
                    children: {
                        jobs: {
                            id: 'jobs',
                            type: { id: 'JobList', type: TYPE },
                            children: {
                                deployProd: {
                                    id: 'deployProd',
                                    type: JOB,
                                    metadata: {
                                        name: { id: 'name', type: STRING, value: 'Deploy to Production' },
                                        environment: { id: 'environment', type: STRING, value: 'production' }
                                    },
                                    children: {
                                        steps: {
                                            id: 'steps',
                                            type: { id: 'StepList', type: TYPE },
                                            children: {
                                                deploy: {
                                                    id: 'deploy',
                                                    type: STEP,
                                                    metadata: {
                                                        name: { id: 'name', type: STRING, value: 'Deploy' },
                                                        run: { id: 'run', type: STRING, value: 'npm run deploy:prod' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
```

---

## 📊 BPMN Process

### Order Processing Workflow

```typescript
const PROCESS: Property = { id: 'BPMNProcess', type: TYPE };
const START_EVENT: Property = { id: 'StartEvent', type: TYPE };
const END_EVENT: Property = { id: 'EndEvent', type: TYPE };
const TASK: Property = { id: 'Task', type: TYPE };
const GATEWAY: Property = { id: 'Gateway', type: TYPE };
const SEQUENCE_FLOW: Property = { id: 'SequenceFlow', type: TYPE };

const orderProcess: Property = {
    id: 'order-process',
    type: PROCESS,
    metadata: {
        name: { id: 'name', type: STRING, value: 'Order Processing' },
        version: { id: 'version', type: STRING, value: '1.0' }
    },
    children: {
        elements: {
            id: 'elements',
            type: { id: 'ElementMap', type: TYPE },
            children: {
                // Start Event
                start: {
                    id: 'start',
                    type: START_EVENT,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Order Received' }
                    }
                },
                
                // Task: Validate Order
                validateOrder: {
                    id: 'validateOrder',
                    type: TASK,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Validate Order' },
                        taskType: { id: 'taskType', type: STRING, value: 'service' },
                        assignee: { id: 'assignee', type: STRING, value: 'system' }
                    }
                },
                
                // Gateway: Validation Result
                validationGateway: {
                    id: 'validationGateway',
                    type: GATEWAY,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Valid?' },
                        gatewayType: { id: 'gatewayType', type: STRING, value: 'exclusive' }
                    }
                },
                
                // Task: Check Inventory
                checkInventory: {
                    id: 'checkInventory',
                    type: TASK,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Check Inventory' },
                        taskType: { id: 'taskType', type: STRING, value: 'service' }
                    }
                },
                
                // Gateway: Inventory Available
                inventoryGateway: {
                    id: 'inventoryGateway',
                    type: GATEWAY,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'In Stock?' },
                        gatewayType: { id: 'gatewayType', type: STRING, value: 'exclusive' }
                    }
                },
                
                // Task: Process Payment
                processPayment: {
                    id: 'processPayment',
                    type: TASK,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Process Payment' },
                        taskType: { id: 'taskType', type: STRING, value: 'service' }
                    }
                },
                
                // Task: Prepare Shipment
                prepareShipment: {
                    id: 'prepareShipment',
                    type: TASK,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Prepare Shipment' },
                        taskType: { id: 'taskType', type: STRING, value: 'manual' },
                        assignee: { id: 'assignee', type: STRING, value: 'warehouse' }
                    }
                },
                
                // Task: Notify Customer (Backorder)
                notifyBackorder: {
                    id: 'notifyBackorder',
                    type: TASK,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Notify Backorder' },
                        taskType: { id: 'taskType', type: STRING, value: 'send' }
                    }
                },
                
                // Task: Reject Order
                rejectOrder: {
                    id: 'rejectOrder',
                    type: TASK,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Reject Order' },
                        taskType: { id: 'taskType', type: STRING, value: 'service' }
                    }
                },
                
                // End Events
                endSuccess: {
                    id: 'endSuccess',
                    type: END_EVENT,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Order Fulfilled' }
                    }
                },
                endRejected: {
                    id: 'endRejected',
                    type: END_EVENT,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Order Rejected' }
                    }
                },
                endBackorder: {
                    id: 'endBackorder',
                    type: END_EVENT,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Awaiting Stock' }
                    }
                }
            }
        },
        
        flows: {
            id: 'flows',
            type: { id: 'FlowList', type: TYPE },
            children: {
                startToValidate: {
                    id: 'startToValidate',
                    type: SEQUENCE_FLOW,
                    metadata: {
                        from: { id: 'from', type: REF, value: ['root', 'children', 'elements', 'children', 'start'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'elements', 'children', 'validateOrder'] }
                    }
                },
                validateToGateway: {
                    id: 'validateToGateway',
                    type: SEQUENCE_FLOW,
                    metadata: {
                        from: { id: 'from', type: REF, value: ['root', 'children', 'elements', 'children', 'validateOrder'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'elements', 'children', 'validationGateway'] }
                    }
                },
                gatewayToInventory: {
                    id: 'gatewayToInventory',
                    type: SEQUENCE_FLOW,
                    metadata: {
                        from: { id: 'from', type: REF, value: ['root', 'children', 'elements', 'children', 'validationGateway'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'elements', 'children', 'checkInventory'] },
                        condition: {
                            id: 'condition',
                            type: OP,
                            value: 'eq',
                            children: {
                                arg0: { id: 'arg0', type: REF, value: ['root', 'metadata', 'isValid', 'value'] },
                                arg1: { id: 'arg1', type: LIT, value: true }
                            }
                        }
                    }
                },
                gatewayToReject: {
                    id: 'gatewayToReject',
                    type: SEQUENCE_FLOW,
                    metadata: {
                        from: { id: 'from', type: REF, value: ['root', 'children', 'elements', 'children', 'validationGateway'] },
                        to: { id: 'to', type: REF, value: ['root', 'children', 'elements', 'children', 'rejectOrder'] },
                        condition: {
                            id: 'condition',
                            type: OP,
                            value: 'eq',
                            children: {
                                arg0: { id: 'arg0', type: REF, value: ['root', 'metadata', 'isValid', 'value'] },
                                arg1: { id: 'arg1', type: LIT, value: false }
                            }
                        }
                    }
                }
                // ... more flows
            }
        }
    }
};
```

---

## 🤖 Agentic AI Workflow

### Multi-Agent RAG Pipeline

```typescript
const AGENT: Property = { id: 'Agent', type: TYPE };
const TOOL: Property = { id: 'Tool', type: TYPE };
const FLOW_NODE: Property = { id: 'FlowNode', type: TYPE };

const ragPipeline: Property = {
    id: 'rag-pipeline',
    type: { id: 'AgenticWorkflow', type: TYPE },
    metadata: {
        name: { id: 'name', type: STRING, value: 'RAG Q&A Pipeline' },
        description: { id: 'description', type: STRING, value: 'Multi-agent retrieval-augmented generation' }
    },
    children: {
        // Define agents
        agents: {
            id: 'agents',
            type: { id: 'AgentMap', type: TYPE },
            children: {
                queryAnalyzer: {
                    id: 'queryAnalyzer',
                    type: AGENT,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Query Analyzer' },
                        role: { id: 'role', type: STRING, value: 'Analyze user query and determine intent' },
                        model: { id: 'model', type: STRING, value: 'gpt-4o-mini' },
                        systemPrompt: {
                            id: 'systemPrompt',
                            type: STRING,
                            value: 'You analyze user queries and extract key entities, intent, and required context.'
                        }
                    },
                    children: {
                        tools: {
                            id: 'tools',
                            type: { id: 'ToolList', type: TYPE },
                            value: []  // No tools needed
                        }
                    }
                },
                
                retriever: {
                    id: 'retriever',
                    type: AGENT,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Document Retriever' },
                        role: { id: 'role', type: STRING, value: 'Retrieve relevant documents from vector store' },
                        model: { id: 'model', type: STRING, value: 'gpt-4o-mini' }
                    },
                    children: {
                        tools: {
                            id: 'tools',
                            type: { id: 'ToolList', type: TYPE },
                            children: {
                                vectorSearch: {
                                    id: 'vectorSearch',
                                    type: TOOL,
                                    metadata: {
                                        name: { id: 'name', type: STRING, value: 'vector_search' },
                                        description: { id: 'description', type: STRING, value: 'Search vector database for relevant documents' },
                                        parameters: {
                                            id: 'parameters',
                                            type: { id: 'Object', type: TYPE },
                                            value: {
                                                query: { type: 'string', required: true },
                                                topK: { type: 'number', default: 5 },
                                                minScore: { type: 'number', default: 0.7 }
                                            }
                                        }
                                    }
                                },
                                webSearch: {
                                    id: 'webSearch',
                                    type: TOOL,
                                    metadata: {
                                        name: { id: 'name', type: STRING, value: 'web_search' },
                                        description: { id: 'description', type: STRING, value: 'Search the web for current information' }
                                    }
                                }
                            }
                        }
                    }
                },
                
                synthesizer: {
                    id: 'synthesizer',
                    type: AGENT,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Answer Synthesizer' },
                        role: { id: 'role', type: STRING, value: 'Synthesize final answer from retrieved context' },
                        model: { id: 'model', type: STRING, value: 'gpt-4o' },
                        systemPrompt: {
                            id: 'systemPrompt',
                            type: STRING,
                            value: 'You synthesize accurate, helpful answers based on retrieved context. Always cite sources.'
                        }
                    }
                },
                
                validator: {
                    id: 'validator',
                    type: AGENT,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Response Validator' },
                        role: { id: 'role', type: STRING, value: 'Validate and fact-check the synthesized response' },
                        model: { id: 'model', type: STRING, value: 'gpt-4o' }
                    }
                }
            }
        },
        
        // Define flow
        flow: {
            id: 'flow',
            type: { id: 'FlowGraph', type: TYPE },
            children: {
                // Node 1: Receive query
                receiveQuery: {
                    id: 'receiveQuery',
                    type: FLOW_NODE,
                    metadata: {
                        nodeType: { id: 'nodeType', type: STRING, value: 'input' },
                        name: { id: 'name', type: STRING, value: 'Receive User Query' }
                    }
                },
                
                // Node 2: Analyze query
                analyzeQuery: {
                    id: 'analyzeQuery',
                    type: FLOW_NODE,
                    metadata: {
                        nodeType: { id: 'nodeType', type: STRING, value: 'agent' },
                        agent: { id: 'agent', type: REF, value: ['root', 'children', 'agents', 'children', 'queryAnalyzer'] },
                        name: { id: 'name', type: STRING, value: 'Analyze Query' }
                    },
                    children: {
                        input: {
                            id: 'input',
                            type: REF,
                            value: ['root', 'children', 'flow', 'children', 'receiveQuery', 'metadata', 'output']
                        }
                    }
                },
                
                // Node 3: Retrieve documents
                retrieve: {
                    id: 'retrieve',
                    type: FLOW_NODE,
                    metadata: {
                        nodeType: { id: 'nodeType', type: STRING, value: 'agent' },
                        agent: { id: 'agent', type: REF, value: ['root', 'children', 'agents', 'children', 'retriever'] },
                        name: { id: 'name', type: STRING, value: 'Retrieve Context' }
                    },
                    children: {
                        input: {
                            id: 'input',
                            type: REF,
                            value: ['root', 'children', 'flow', 'children', 'analyzeQuery', 'metadata', 'output']
                        }
                    }
                },
                
                // Node 4: Check if context is sufficient
                contextCheck: {
                    id: 'contextCheck',
                    type: FLOW_NODE,
                    metadata: {
                        nodeType: { id: 'nodeType', type: STRING, value: 'condition' },
                        name: { id: 'name', type: STRING, value: 'Context Sufficient?' },
                        condition: {
                            id: 'condition',
                            type: OP,
                            value: 'gte',
                            children: {
                                arg0: { id: 'arg0', type: REF, value: ['parent', 'children', 'retrieve', 'metadata', 'contextScore'] },
                                arg1: { id: 'arg1', type: LIT, value: 0.7 }
                            }
                        }
                    }
                },
                
                // Node 5: Synthesize answer
                synthesize: {
                    id: 'synthesize',
                    type: FLOW_NODE,
                    metadata: {
                        nodeType: { id: 'nodeType', type: STRING, value: 'agent' },
                        agent: { id: 'agent', type: REF, value: ['root', 'children', 'agents', 'children', 'synthesizer'] },
                        name: { id: 'name', type: STRING, value: 'Synthesize Answer' }
                    },
                    children: {
                        input: {
                            id: 'input',
                            type: { id: 'Object', type: TYPE },
                            value: {
                                query: { id: 'query', type: REF, value: ['root', 'children', 'flow', 'children', 'analyzeQuery', 'metadata', 'output'] },
                                context: { id: 'context', type: REF, value: ['root', 'children', 'flow', 'children', 'retrieve', 'metadata', 'output'] }
                            }
                        }
                    }
                },
                
                // Node 6: Validate response
                validate: {
                    id: 'validate',
                    type: FLOW_NODE,
                    metadata: {
                        nodeType: { id: 'nodeType', type: STRING, value: 'agent' },
                        agent: { id: 'agent', type: REF, value: ['root', 'children', 'agents', 'children', 'validator'] },
                        name: { id: 'name', type: STRING, value: 'Validate Response' }
                    }
                },
                
                // Node 7: Return response
                returnResponse: {
                    id: 'returnResponse',
                    type: FLOW_NODE,
                    metadata: {
                        nodeType: { id: 'nodeType', type: STRING, value: 'output' },
                        name: { id: 'name', type: STRING, value: 'Return Response' }
                    }
                }
            }
        },
        
        // Execution state
        state: {
            id: 'state',
            type: { id: 'ExecutionState', type: TYPE },
            metadata: {
                currentNode: { id: 'currentNode', type: STRING, value: '' },
                status: { id: 'status', type: STRING, value: 'idle' },
                startedAt: { id: 'startedAt', type: { id: 'DateTime', type: TYPE }, value: null },
                completedAt: { id: 'completedAt', type: { id: 'DateTime', type: TYPE }, value: null }
            },
            children: {
                history: {
                    id: 'history',
                    type: { id: 'List', type: TYPE },
                    value: []
                },
                context: {
                    id: 'context',
                    type: { id: 'Object', type: TYPE },
                    value: {}
                }
            }
        }
    }
};
```

### Agent Orchestrator (ReAct Pattern)

```typescript
const reactAgent: Property = {
    id: 'react-agent',
    type: AGENT,
    metadata: {
        name: { id: 'name', type: STRING, value: 'ReAct Agent' },
        model: { id: 'model', type: STRING, value: 'gpt-4o' },
        maxIterations: { id: 'maxIterations', type: NUMBER, value: 10 },
        systemPrompt: {
            id: 'systemPrompt',
            type: STRING,
            value: 'You are an AI assistant that follows the ReAct (Reason + Act) pattern. For each step: 1) Thought: reason about what to do, 2) Action: choose a tool to use, 3) Observation: analyze the result.'
        }
    },
    children: {
        tools: {
            id: 'tools',
            type: { id: 'ToolMap', type: TYPE },
            children: {
                search: {
                    id: 'search',
                    type: TOOL,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'search' },
                        description: { id: 'description', type: STRING, value: 'Search for information online' }
                    }
                },
                calculate: {
                    id: 'calculate',
                    type: TOOL,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'calculate' },
                        description: { id: 'description', type: STRING, value: 'Perform mathematical calculations' }
                    }
                },
                lookup: {
                    id: 'lookup',
                    type: TOOL,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'lookup' },
                        description: { id: 'description', type: STRING, value: 'Look up facts in knowledge base' }
                    }
                }
            }
        },
        
        // ReAct loop state
        loop: {
            id: 'loop',
            type: { id: 'ReactLoop', type: TYPE },
            metadata: {
                iteration: { id: 'iteration', type: NUMBER, value: 0 },
                status: { id: 'status', type: STRING, value: 'thinking' }
            },
            children: {
                steps: {
                    id: 'steps',
                    type: { id: 'StepList', type: TYPE },
                    value: []
                }
            }
        }
    }
};
```

---

## ⚡ Event-Driven Automation

### Serverless Event Flow

```typescript
const EVENT: Property = { id: 'Event', type: TYPE };
const HANDLER: Property = { id: 'Handler', type: TYPE };
const TRIGGER: Property = { id: 'Trigger', type: TYPE };

const eventDrivenWorkflow: Property = {
    id: 'event-workflow',
    type: { id: 'EventDrivenWorkflow', type: TYPE },
    metadata: {
        name: { id: 'name', type: STRING, value: 'Order Event Processing' }
    },
    children: {
        // Event definitions
        events: {
            id: 'events',
            type: { id: 'EventMap', type: TYPE },
            children: {
                orderCreated: {
                    id: 'orderCreated',
                    type: EVENT,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'order.created' },
                        schema: {
                            id: 'schema',
                            type: { id: 'Object', type: TYPE },
                            value: {
                                orderId: 'string',
                                customerId: 'string',
                                total: 'number',
                                items: 'array'
                            }
                        }
                    }
                },
                paymentReceived: {
                    id: 'paymentReceived',
                    type: EVENT,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'payment.received' }
                    }
                },
                inventoryReserved: {
                    id: 'inventoryReserved',
                    type: EVENT,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'inventory.reserved' }
                    }
                },
                shipmentCreated: {
                    id: 'shipmentCreated',
                    type: EVENT,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'shipment.created' }
                    }
                }
            }
        },
        
        // Handler functions
        handlers: {
            id: 'handlers',
            type: { id: 'HandlerMap', type: TYPE },
            children: {
                processOrder: {
                    id: 'processOrder',
                    type: HANDLER,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'processOrder' },
                        trigger: { id: 'trigger', type: REF, value: ['root', 'children', 'events', 'children', 'orderCreated'] },
                        runtime: { id: 'runtime', type: STRING, value: 'nodejs20.x' },
                        timeout: { id: 'timeout', type: NUMBER, value: 30 },
                        emits: {
                            id: 'emits',
                            type: { id: 'List', type: TYPE },
                            value: [
                                { type: 'ref', value: ['root', 'children', 'events', 'children', 'paymentReceived'] },
                                { type: 'ref', value: ['root', 'children', 'events', 'children', 'inventoryReserved'] }
                            ]
                        }
                    }
                },
                createShipment: {
                    id: 'createShipment',
                    type: HANDLER,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'createShipment' },
                        // Wait for both events
                        trigger: {
                            id: 'trigger',
                            type: { id: 'Object', type: TYPE },
                            value: {
                                type: 'all',
                                events: [
                                    { ref: ['root', 'children', 'events', 'children', 'paymentReceived'] },
                                    { ref: ['root', 'children', 'events', 'children', 'inventoryReserved'] }
                                ]
                            }
                        },
                        emits: {
                            id: 'emits',
                            type: { id: 'List', type: TYPE },
                            value: [
                                { type: 'ref', value: ['root', 'children', 'events', 'children', 'shipmentCreated'] }
                            ]
                        }
                    }
                },
                notifyCustomer: {
                    id: 'notifyCustomer',
                    type: HANDLER,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'notifyCustomer' },
                        trigger: { id: 'trigger', type: REF, value: ['root', 'children', 'events', 'children', 'shipmentCreated'] }
                    }
                }
            }
        }
    }
};
```

---

## 📋 Approval Workflow

### Document Approval Process

```typescript
const APPROVAL_STEP: Property = { id: 'ApprovalStep', type: TYPE };

const approvalWorkflow: Property = {
    id: 'document-approval',
    type: { id: 'ApprovalWorkflow', type: TYPE },
    metadata: {
        name: { id: 'name', type: STRING, value: 'Document Approval' },
        escalationTimeout: { id: 'escalationTimeout', type: NUMBER, value: 48 }  // hours
    },
    children: {
        steps: {
            id: 'steps',
            type: { id: 'StepList', type: TYPE },
            children: {
                submit: {
                    id: 'submit',
                    type: APPROVAL_STEP,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Submit Document' },
                        stepType: { id: 'stepType', type: STRING, value: 'submit' },
                        actor: { id: 'actor', type: STRING, value: 'submitter' }
                    }
                },
                
                managerReview: {
                    id: 'managerReview',
                    type: APPROVAL_STEP,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Manager Review' },
                        stepType: { id: 'stepType', type: STRING, value: 'approval' },
                        approvers: { id: 'approvers', type: { id: 'List', type: TYPE }, value: ['manager'] },
                        requiredApprovals: { id: 'requiredApprovals', type: NUMBER, value: 1 },
                        actions: {
                            id: 'actions',
                            type: { id: 'List', type: TYPE },
                            value: ['approve', 'reject', 'requestChanges']
                        }
                    }
                },
                
                legalReview: {
                    id: 'legalReview',
                    type: APPROVAL_STEP,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Legal Review' },
                        stepType: { id: 'stepType', type: STRING, value: 'approval' },
                        approvers: { id: 'approvers', type: { id: 'List', type: TYPE }, value: ['legal'] },
                        // Conditional: only for contracts over $10k
                        condition: {
                            id: 'condition',
                            type: OP,
                            value: 'and',
                            children: {
                                arg0: {
                                    id: 'isContract',
                                    type: OP,
                                    value: 'eq',
                                    children: {
                                        arg0: { id: 'a', type: REF, value: ['root', 'metadata', 'documentType', 'value'] },
                                        arg1: { id: 'b', type: LIT, value: 'contract' }
                                    }
                                },
                                arg1: {
                                    id: 'overThreshold',
                                    type: OP,
                                    value: 'gt',
                                    children: {
                                        arg0: { id: 'a', type: REF, value: ['root', 'metadata', 'amount', 'value'] },
                                        arg1: { id: 'b', type: LIT, value: 10000 }
                                    }
                                }
                            }
                        }
                    }
                },
                
                executiveApproval: {
                    id: 'executiveApproval',
                    type: APPROVAL_STEP,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Executive Approval' },
                        stepType: { id: 'stepType', type: STRING, value: 'approval' },
                        approvers: { id: 'approvers', type: { id: 'List', type: TYPE }, value: ['cfo', 'ceo'] },
                        requiredApprovals: { id: 'requiredApprovals', type: NUMBER, value: 1 },
                        // Conditional: only for amounts over $100k
                        condition: {
                            id: 'condition',
                            type: OP,
                            value: 'gt',
                            children: {
                                arg0: { id: 'a', type: REF, value: ['root', 'metadata', 'amount', 'value'] },
                                arg1: { id: 'b', type: LIT, value: 100000 }
                            }
                        }
                    }
                },
                
                finalize: {
                    id: 'finalize',
                    type: APPROVAL_STEP,
                    metadata: {
                        name: { id: 'name', type: STRING, value: 'Finalize' },
                        stepType: { id: 'stepType', type: STRING, value: 'complete' }
                    }
                }
            }
        },
        
        // Current state
        state: {
            id: 'state',
            type: { id: 'WorkflowState', type: TYPE },
            metadata: {
                currentStep: { id: 'currentStep', type: REF, value: ['root', 'children', 'steps', 'children', 'submit'] },
                status: { id: 'status', type: STRING, value: 'pending' }
            },
            children: {
                approvals: {
                    id: 'approvals',
                    type: { id: 'ApprovalList', type: TYPE },
                    value: []
                }
            }
        }
    }
};
```

---

## 📚 Next Steps

- 🕸️ [Graph Examples](./graphs.md) — General graph modeling
- 🧙 [Wizard Examples](./wizards.md) — Multi-step UI processes
- 🎨 [Dynamic UI Examples](./dynamic-ui.md)

