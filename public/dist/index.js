// src/core/types.ts
var TYPE = {
  id: "Type",
  type: null
};
TYPE.type = TYPE;
var EXPR = {
  id: "Expr",
  type: TYPE
};
var OPERATOR = {
  id: "Operator",
  type: TYPE
};
var CONSTRAINT = {
  id: "Constraint",
  type: TYPE
};
var PROPERTY = {
  id: "Property",
  type: TYPE
};
var LIT = {
  id: "Lit",
  type: EXPR
};
var REF = {
  id: "Ref",
  type: EXPR
};
var OP = {
  id: "Op",
  type: EXPR
};
// src/core/expressions.ts
var lit = (value) => ({
  id: "lit",
  type: LIT,
  value
});
var ref = (path) => ({
  id: "ref",
  type: REF,
  value: typeof path === "string" ? path.split(".") : path
});
var op = (name, ...args) => ({
  id: name,
  type: OP,
  children: args.reduce((acc, arg, i) => ({ ...acc, [`arg${i}`]: arg }), {})
});
// src/core/Registry.ts
class Registry {
  operators = new Map;
  register(name, fn) {
    this.operators.set(name, fn);
    return this;
  }
  unregister(name) {
    return this.operators.delete(name);
  }
  get(name) {
    return this.operators.get(name);
  }
  has(name) {
    return this.operators.has(name);
  }
  keys() {
    return this.operators.keys();
  }
  get size() {
    return this.operators.size;
  }
  clear() {
    this.operators.clear();
    return this;
  }
}
var createRegistry = () => new Registry;
// src/core/guards.ts
var TYPE_LIT = "Lit";
var TYPE_REF = "Ref";
var TYPE_OP = "Op";
var TYPE_EXPR = "Expr";
var TYPE_TYPE = "Type";
var TYPE_CONSTRAINT = "Constraint";
var TYPE_OPERATOR = "Operator";
var isLit = (p) => p.type?.id === TYPE_LIT;
var isRef = (p) => p.type?.id === TYPE_REF;
var isOp = (p) => p.type?.id === TYPE_OP;
var isExpr = (p) => {
  const typeId = p.type?.id;
  return typeId === TYPE_LIT || typeId === TYPE_REF || typeId === TYPE_OP || typeId === TYPE_EXPR;
};
var isType = (p) => p.type?.id === TYPE_TYPE;
var isConstraint = (p) => p.type?.id === TYPE_CONSTRAINT;
var isOperator = (p) => p.type?.id === TYPE_OPERATOR;
var getTypeName = (p) => p.type?.id ?? "Unknown";
var isProperty = (val) => {
  if (!val || typeof val !== "object")
    return false;
  const obj = val;
  const type = obj.type;
  if (!type || typeof type !== "object")
    return false;
  return typeof obj.id === "string" && typeof type.id === "string";
};

// src/core/Evaluator.ts
var MAX_DEPTH = 1000;
var sortedArgsCache = new WeakMap;
var getSortedArgKeys = (expr) => {
  let keys = sortedArgsCache.get(expr);
  if (!keys && expr.children) {
    keys = Object.keys(expr.children).sort((a, b) => {
      const numA = parseInt(a.replace("arg", ""), 10);
      const numB = parseInt(b.replace("arg", ""), 10);
      return numA - numB;
    });
    sortedArgsCache.set(expr, keys);
  }
  return keys ?? [];
};
var findParent = (target, root, parent) => {
  if (root === target)
    return parent;
  if (root.children) {
    for (const child of Object.values(root.children)) {
      if (child === target)
        return root;
      const found = findParent(target, child, root);
      if (found)
        return found;
    }
  }
  if (root.metadata) {
    for (const meta of Object.values(root.metadata)) {
      if (meta === target)
        return root;
      const found = findParent(target, meta, root);
      if (found)
        return found;
    }
  }
  if (root.constraints) {
    for (const constraint of Object.values(root.constraints)) {
      if (constraint === target)
        return root;
      const found = findParent(target, constraint, root);
      if (found)
        return found;
    }
  }
  return;
};
var evaluate = async (expr, ctx) => {
  const depth = (ctx.depth ?? 0) + 1;
  if (depth > MAX_DEPTH) {
    throw new Error("Maximum evaluation depth exceeded - possible circular reference");
  }
  if (isLit(expr)) {
    return expr.value;
  }
  const evalCtx = {
    ...ctx,
    depth
  };
  if (isRef(expr)) {
    return resolveRef(expr.value, evalCtx);
  }
  if (isOp(expr)) {
    const opName = expr.id;
    const opFn = ctx.registry.get(opName);
    if (!opFn) {
      throw new Error(`Unknown operator: ${opName}`);
    }
    const args = [];
    if (expr.children) {
      for (const key of getSortedArgKeys(expr)) {
        const arg = expr.children[key];
        if (arg)
          args.push(arg);
      }
    }
    const result = opFn(args, evalCtx);
    return result instanceof Promise ? await result : result;
  }
  return expr.value ?? null;
};
var resolveRef = async (path, ctx) => {
  if (path.length === 0)
    return null;
  let current;
  let owner;
  let i = 0;
  const start = path[0];
  switch (start) {
    case "self":
      current = ctx.current;
      owner = ctx.current;
      i = 1;
      break;
    case "root":
      current = ctx.root;
      owner = ctx.root;
      i = 1;
      break;
    case "parent":
      current = ctx.findParent ? ctx.findParent(ctx.current) : findParent(ctx.current, ctx.root);
      owner = current;
      i = 1;
      break;
    default:
      if (ctx.bindings && start in ctx.bindings) {
        if (path.length === 1) {
          return ctx.bindings[start];
        }
        let val = ctx.bindings[start];
        for (let j = 1;j < path.length; j++) {
          if (val && typeof val === "object") {
            val = val[path[j]];
          } else {
            return;
          }
        }
        return val;
      }
      current = ctx.current;
      owner = ctx.current;
      i = 0;
  }
  while (current && i < path.length) {
    const segment = path[i];
    switch (segment) {
      case "value":
        if (current.value !== undefined) {
          if (isLit(current) || isRef(current) || isOp(current)) {
            return evaluate(current, { ...ctx, current: owner });
          }
          if (isProperty(current.value)) {
            return evaluate(current.value, { ...ctx, current: owner });
          }
          return current.value;
        }
        return null;
      case "type":
        current = current.type;
        owner = current;
        break;
      case "id":
        return current.id;
      case "children":
        i++;
        if (i < path.length && current.children) {
          current = current.children[path[i]];
          owner = current;
        } else {
          return;
        }
        break;
      case "metadata":
        i++;
        if (i < path.length && current.metadata) {
          owner = current;
          current = current.metadata[path[i]];
        } else {
          return;
        }
        break;
      case "constraints":
        i++;
        if (i < path.length && current.constraints) {
          owner = current;
          current = current.constraints[path[i]];
        } else {
          return;
        }
        break;
      case "parent":
        current = ctx.findParent ? ctx.findParent(current) : findParent(current, ctx.root);
        owner = current;
        break;
      default:
        if (current.children?.[segment]) {
          current = current.children[segment];
          owner = current;
        } else if (current.metadata?.[segment]) {
          owner = current;
          current = current.metadata[segment];
        } else {
          return;
        }
    }
    i++;
  }
  if (current) {
    if (isLit(current) || isRef(current) || isOp(current)) {
      return evaluate(current, { ...ctx, current: owner });
    }
    if (current.value !== undefined) {
      if (isProperty(current.value)) {
        return evaluate(current.value, { ...ctx, current: owner });
      }
      return current.value;
    }
    return current;
  }
  return;
};
var evalArg = async (arg, ctx) => {
  return evaluate(arg, ctx);
};
var evalArgs = async (args, ctx) => {
  const results = new Array(args.length);
  for (let i = 0;i < args.length; i++) {
    results[i] = await evaluate(args[i], ctx);
  }
  return results;
};
var evalArgsParallel = async (args, ctx) => {
  return Promise.all(args.map((arg) => evaluate(arg, ctx)));
};
var withBindings = (ctx, bindings) => ({
  ...ctx,
  bindings: ctx.bindings ? { ...ctx.bindings, ...bindings } : bindings
});
var createLoopContext = (ctx) => {
  const bindings = ctx.bindings ? { ...ctx.bindings } : {};
  const loopCtx = { ...ctx, bindings };
  return { loopCtx, bindings };
};
// src/core/PropertyNode.ts
class PropertyNode {
  property;
  registry = null;
  parentNode = null;
  childNodes = new Map;
  subscriptionId = 0;
  subscriptions = new Map;
  destroyed = false;
  batchedChanges = null;
  constructor(property) {
    this.property = property;
  }
  static create(property, registry) {
    const node = new PropertyNode(property);
    if (registry) {
      node.setRegistry(registry);
    }
    return node;
  }
  static wrap(property, registry) {
    return PropertyNode.create(property, registry);
  }
  static fromJSON(json, typeResolver) {
    const property = PropertyNode.deserializeProperty(json, typeResolver);
    return new PropertyNode(property);
  }
  static cloneProperty(property) {
    return PropertyNode.deepCloneProperty(property);
  }
  setRegistry(registry) {
    this.registry = registry;
    return this;
  }
  getRegistry() {
    return this.registry ?? this.parentNode?.getRegistry() ?? null;
  }
  getProperty() {
    return this.property;
  }
  get id() {
    return this.property.id;
  }
  get type() {
    return this.property.type;
  }
  get parent() {
    return this.parentNode;
  }
  get root() {
    let node = this;
    while (node.parentNode) {
      node = node.parentNode;
    }
    return node;
  }
  get isRoot() {
    return this.parentNode === null;
  }
  get depth() {
    let d = 0;
    let node = this.parentNode;
    while (node) {
      d++;
      node = node.parentNode;
    }
    return d;
  }
  child(key) {
    if (!this.property.children?.[key])
      return null;
    let node = this.childNodes.get(key);
    if (!node) {
      node = new PropertyNode(this.property.children[key]);
      node.parentNode = this;
      node.registry = this.registry;
      this.childNodes.set(key, node);
    }
    return node;
  }
  children() {
    if (!this.property.children)
      return [];
    return Object.keys(this.property.children).map((key) => this.child(key));
  }
  childKeys() {
    return this.property.children ? Object.keys(this.property.children) : [];
  }
  hasChildren() {
    return this.property.children !== undefined && Object.keys(this.property.children).length > 0;
  }
  get childCount() {
    return this.property.children ? Object.keys(this.property.children).length : 0;
  }
  get(path) {
    const parts = typeof path === "string" ? path.split(".") : path;
    if (parts.length === 0 || parts.length === 1 && parts[0] === "") {
      return this;
    }
    let node = this;
    for (const part of parts) {
      if (!node)
        return null;
      node = node.child(part);
    }
    return node;
  }
  path() {
    const parts = [];
    let node = this;
    while (node?.parentNode) {
      const parentProp = node.parentNode.property;
      if (parentProp.children) {
        for (const [key, child] of Object.entries(parentProp.children)) {
          if (child === node.property) {
            parts.unshift(key);
            break;
          }
        }
      }
      node = node.parentNode;
    }
    return parts;
  }
  pathString() {
    return this.path().join(".");
  }
  ancestors() {
    const result = [];
    let node = this.parentNode;
    while (node) {
      result.push(node);
      node = node.parentNode;
    }
    return result;
  }
  descendants() {
    const result = [];
    this.traverse((node) => {
      if (node !== this) {
        result.push(node);
      }
    });
    return result;
  }
  siblings() {
    if (!this.parentNode)
      return [];
    return this.parentNode.children().filter((n) => n !== this);
  }
  get nextSibling() {
    if (!this.parentNode)
      return null;
    const keys = this.parentNode.childKeys();
    const myPath = this.path();
    const myKey = myPath[myPath.length - 1];
    const idx = keys.indexOf(myKey);
    if (idx >= 0 && idx < keys.length - 1) {
      return this.parentNode.child(keys[idx + 1]);
    }
    return null;
  }
  get previousSibling() {
    if (!this.parentNode)
      return null;
    const keys = this.parentNode.childKeys();
    const myPath = this.path();
    const myKey = myPath[myPath.length - 1];
    const idx = keys.indexOf(myKey);
    if (idx > 0) {
      return this.parentNode.child(keys[idx - 1]);
    }
    return null;
  }
  getRawValue() {
    return this.property.value;
  }
  setValue(value, options) {
    this.checkDestroyed();
    const path = options?.path;
    const silent = options?.silent ?? false;
    if (path) {
      const node = this.get(path);
      if (node) {
        node.property.value = value;
        if (!silent) {
          const targetPath = typeof path === "string" ? path : path.join(".");
          this.emitChange(targetPath);
        }
      }
    } else {
      this.property.value = value;
      if (!silent) {
        this.emitChange("");
      }
    }
  }
  async getValue(path) {
    this.checkDestroyed();
    const node = path ? this.get(path) : this;
    if (!node)
      return;
    const registry = this.getRegistry();
    if (!registry) {
      throw new Error("No registry set. Call setRegistry() first.");
    }
    const prop = node.property;
    const ctx = this.createContext(node);
    if (isExpr(prop)) {
      return evaluate(prop, ctx);
    }
    if (prop.value !== undefined && isProperty(prop.value) && isExpr(prop.value)) {
      return evaluate(prop.value, ctx);
    }
    return prop.value;
  }
  getDefaultValue() {
    return this.property.defaultValue;
  }
  hasDefaultValue() {
    return this.property.defaultValue !== undefined;
  }
  hasValue() {
    return this.property.value !== undefined;
  }
  isEmpty() {
    return !this.hasValue() && !this.hasChildren();
  }
  reset(options) {
    this.checkDestroyed();
    if (this.hasDefaultValue()) {
      this.setValue(this.property.defaultValue, { silent: options?.silent });
    }
  }
  resetDeep(options) {
    const silent = options?.silent ?? false;
    if (silent) {
      this.reset({ silent: true });
      for (const child of this.children()) {
        child.resetDeep({ silent: true });
      }
    } else {
      this.batch(() => {
        this.reset({ silent: true });
        for (const child of this.children()) {
          child.resetDeep({ silent: true });
        }
      });
    }
  }
  metadataKeys() {
    return this.property.metadata ? Object.keys(this.property.metadata) : [];
  }
  hasMetadata(key) {
    if (key) {
      return this.property.metadata?.[key] !== undefined;
    }
    return this.property.metadata !== undefined && Object.keys(this.property.metadata).length > 0;
  }
  getRawMetadata(key) {
    return this.property.metadata?.[key];
  }
  async getMetadata(key) {
    this.checkDestroyed();
    const meta = this.property.metadata?.[key];
    if (!meta)
      return;
    const registry = this.getRegistry();
    if (!registry) {
      throw new Error("No registry set. Call setRegistry() first.");
    }
    if (isExpr(meta)) {
      const ctx = this.createContext(this);
      return evaluate(meta, ctx);
    }
    return meta.value;
  }
  setMetadata(key, value, options) {
    this.checkDestroyed();
    if (!this.property.metadata) {
      this.property.metadata = {};
    }
    this.property.metadata[key] = value;
    if (!options?.silent) {
      this.emitChange(`metadata.${key}`);
    }
  }
  removeMetadata(key, options) {
    this.checkDestroyed();
    if (this.property.metadata?.[key]) {
      delete this.property.metadata[key];
      if (!options?.silent) {
        this.emitChange(`metadata.${key}`);
      }
      return true;
    }
    return false;
  }
  constraintKeys() {
    return this.property.constraints ? Object.keys(this.property.constraints) : [];
  }
  hasConstraints(key) {
    if (key) {
      return this.property.constraints?.[key] !== undefined;
    }
    return this.property.constraints !== undefined && Object.keys(this.property.constraints).length > 0;
  }
  getRawConstraint(key) {
    return this.property.constraints?.[key];
  }
  async getConstraint(key) {
    this.checkDestroyed();
    const constraint = this.property.constraints?.[key];
    if (!constraint)
      return true;
    if (constraint.value === undefined) {
      return true;
    }
    if (typeof constraint.value === "boolean") {
      return constraint.value;
    }
    if (isExpr(constraint.value)) {
      const registry = this.getRegistry();
      if (!registry) {
        throw new Error("No registry set. Call setRegistry() first.");
      }
      const ctx = this.createContext(this);
      const result = await evaluate(constraint.value, ctx);
      return Boolean(result);
    }
    return Boolean(constraint.value);
  }
  setConstraint(key, value, options) {
    this.checkDestroyed();
    if (!this.property.constraints) {
      this.property.constraints = {};
    }
    this.property.constraints[key] = value;
    if (!options?.silent) {
      this.emitChange(`constraints.${key}`);
    }
  }
  removeConstraint(key, options) {
    this.checkDestroyed();
    if (this.property.constraints?.[key]) {
      delete this.property.constraints[key];
      if (!options?.silent) {
        this.emitChange(`constraints.${key}`);
      }
      return true;
    }
    return false;
  }
  async validate() {
    this.checkDestroyed();
    const errors = {};
    if (this.property.constraints) {
      for (const [key, constraint] of Object.entries(this.property.constraints)) {
        const isValid = await this.getConstraint(key);
        if (!isValid) {
          const message = constraint.metadata?.message;
          errors[key] = message?.value ?? `Constraint ${key} failed`;
        }
      }
    }
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
  async validateDeep() {
    this.checkDestroyed();
    const allErrors = {};
    const nodesToValidate = [];
    this.traverse((node, nodePath) => {
      nodesToValidate.push({ node, path: [...nodePath] });
    });
    for (const { node, path } of nodesToValidate) {
      const result = await node.validate();
      if (!result.valid) {
        allErrors[path.join(".") || "root"] = result.errors;
      }
    }
    return {
      valid: Object.keys(allErrors).length === 0,
      errors: allErrors
    };
  }
  addChild(key, property) {
    this.checkDestroyed();
    if (!this.property.children) {
      this.property.children = {};
    }
    this.property.children[key] = property;
    this.childNodes.delete(key);
    return this.child(key);
  }
  removeChild(key) {
    this.checkDestroyed();
    if (this.property.children?.[key]) {
      const cachedNode = this.childNodes.get(key);
      if (cachedNode) {
        cachedNode.destroy();
      }
      this.childNodes.delete(key);
      delete this.property.children[key];
      return true;
    }
    return false;
  }
  traverse(visitor) {
    this.traverseInternal(visitor, []);
  }
  traverseInternal(visitor, currentPath) {
    const result = visitor(this, currentPath);
    if (result === false)
      return false;
    for (const key of this.childKeys()) {
      const child = this.child(key);
      if (child) {
        const shouldContinue = child.traverseInternal(visitor, [...currentPath, key]);
        if (!shouldContinue)
          return false;
      }
    }
    return true;
  }
  traversePostOrder(visitor) {
    this.traversePostOrderInternal(visitor, []);
  }
  traversePostOrderInternal(visitor, currentPath) {
    for (const key of this.childKeys()) {
      const child = this.child(key);
      if (child) {
        const shouldContinue = child.traversePostOrderInternal(visitor, [...currentPath, key]);
        if (!shouldContinue)
          return false;
      }
    }
    const result = visitor(this, currentPath);
    return result !== false;
  }
  traverseBreadthFirst(visitor) {
    const queue = [{ node: this, path: [] }];
    while (queue.length > 0) {
      const { node, path } = queue.shift();
      const result = visitor(node, path);
      if (result === false)
        return;
      for (const key of node.childKeys()) {
        const child = node.child(key);
        if (child) {
          queue.push({ node: child, path: [...path, key] });
        }
      }
    }
  }
  find(predicate) {
    let found = null;
    this.traverse((node) => {
      if (predicate(node)) {
        found = node;
        return false;
      }
    });
    return found;
  }
  findAll(predicate) {
    const result = [];
    this.traverse((node) => {
      if (predicate(node)) {
        result.push(node);
      }
    });
    return result;
  }
  findById(id) {
    return this.find((node) => node.id === id);
  }
  findByType(typeId) {
    return this.findAll((node) => node.type.id === typeId);
  }
  map(fn) {
    const results = [];
    this.traverse((node, path) => {
      results.push(fn(node, path));
    });
    return results;
  }
  filter(predicate) {
    return this.findAll(predicate);
  }
  reduce(fn, initial) {
    let result = initial;
    this.traverse((node, path) => {
      result = fn(result, node, path);
    });
    return result;
  }
  some(predicate) {
    return this.find(predicate) !== null;
  }
  every(predicate) {
    let allMatch = true;
    this.traverse((node) => {
      if (!predicate(node)) {
        allMatch = false;
        return false;
      }
    });
    return allMatch;
  }
  count() {
    let n = 0;
    this.traverse(() => {
      n++;
    });
    return n;
  }
  subscribe(callback, filter) {
    this.checkDestroyed();
    const id = `sub_${++this.subscriptionId}`;
    const subscriptions = this.subscriptions;
    subscriptions.set(id, { callback, filter });
    return {
      id,
      get isActive() {
        return subscriptions.has(id);
      },
      unsubscribe() {
        subscriptions.delete(id);
      }
    };
  }
  watch(path, callback) {
    const pathStr = typeof path === "string" ? path : path.join(".");
    return this.subscribe(callback, pathStr);
  }
  emitChange(path) {
    const pathStr = typeof path === "string" ? path : path.join(".");
    if (this.batchedChanges !== null) {
      this.batchedChanges.push(pathStr);
    } else {
      this.notify([pathStr]);
      if (this.parentNode) {
        const myKey = this.getKeyInParent();
        if (myKey !== null) {
          const parentPath = pathStr ? `${myKey}.${pathStr}` : myKey;
          this.parentNode.emitChange(parentPath);
        }
      }
    }
  }
  getKeyInParent() {
    if (!this.parentNode)
      return null;
    const parentChildren = this.parentNode.property.children;
    if (!parentChildren)
      return null;
    for (const [key, child] of Object.entries(parentChildren)) {
      if (child === this.property) {
        return key;
      }
    }
    return null;
  }
  batch(fn) {
    if (this.batchedChanges !== null) {
      fn();
      return;
    }
    this.batchedChanges = [];
    try {
      fn();
      if (this.batchedChanges.length > 0) {
        const uniquePaths = [...new Set(this.batchedChanges)];
        this.notify(uniquePaths);
      }
    } finally {
      this.batchedChanges = null;
    }
  }
  transaction(fn) {
    const snapshot = this.toJSON();
    try {
      return fn();
    } catch (error) {
      this.restoreFromSnapshot(snapshot);
      throw error;
    }
  }
  notify(paths) {
    for (const { callback, filter } of this.subscriptions.values()) {
      const filtered = filter ? this.filterPaths(paths, filter) : paths;
      if (filtered.length > 0) {
        callback(filtered);
      }
    }
  }
  filterPaths(paths, filter) {
    if (typeof filter === "string") {
      return paths.filter((p) => p === filter || p.startsWith(filter + "."));
    }
    if (Array.isArray(filter)) {
      return paths.filter((p) => filter.some((f) => p === f || p.startsWith(f + ".")));
    }
    return paths.filter(filter);
  }
  unsubscribeAll() {
    this.subscriptions.clear();
  }
  get subscriptionCount() {
    return this.subscriptions.size;
  }
  toJSON() {
    return PropertyNode.serializeProperty(this.property);
  }
  async snapshot() {
    this.checkDestroyed();
    return this.buildSnapshot();
  }
  async buildSnapshot() {
    const result = {};
    if (this.hasValue()) {
      const value = await this.getValue();
      if (!this.hasChildren()) {
        return value;
      }
      result._value = value;
    }
    for (const key of this.childKeys()) {
      const child = this.child(key);
      if (child) {
        if (child.hasChildren()) {
          result[key] = await child.buildSnapshot();
        } else {
          result[key] = await child.getValue();
        }
      }
    }
    return result;
  }
  clone() {
    const clonedProperty = PropertyNode.deepCloneProperty(this.property);
    const clonedNode = new PropertyNode(clonedProperty);
    if (this.registry) {
      clonedNode.setRegistry(this.registry);
    }
    return clonedNode;
  }
  restoreFromSnapshot(snapshot) {
    if (snapshot.value !== undefined) {
      this.property.value = snapshot.value;
    }
    if (snapshot.children && this.property.children) {
      for (const [key, childSnapshot] of Object.entries(snapshot.children)) {
        const child = this.child(key);
        if (child) {
          child.restoreFromSnapshot(childSnapshot);
        }
      }
    }
  }
  static serializeProperty(property) {
    const result = {
      id: property.id,
      type: { id: property.type.id }
    };
    if (property.value !== undefined) {
      result.value = PropertyNode.serializeValue(property.value);
    }
    if (property.defaultValue !== undefined) {
      result.defaultValue = PropertyNode.serializeValue(property.defaultValue);
    }
    if (property.metadata) {
      result.metadata = {};
      for (const [key, meta] of Object.entries(property.metadata)) {
        result.metadata[key] = PropertyNode.serializeProperty(meta);
      }
    }
    if (property.constraints) {
      result.constraints = {};
      for (const [key, constraint] of Object.entries(property.constraints)) {
        result.constraints[key] = PropertyNode.serializeProperty(constraint);
      }
    }
    if (property.children) {
      result.children = {};
      for (const [key, child] of Object.entries(property.children)) {
        result.children[key] = PropertyNode.serializeProperty(child);
      }
    }
    return result;
  }
  static serializeValue(value) {
    if (isProperty(value)) {
      return PropertyNode.serializeProperty(value);
    }
    if (Array.isArray(value)) {
      return value.map((v) => PropertyNode.serializeValue(v));
    }
    if (value && typeof value === "object") {
      const result = {};
      for (const [k, v] of Object.entries(value)) {
        result[k] = PropertyNode.serializeValue(v);
      }
      return result;
    }
    return value;
  }
  static deserializeProperty(json, typeResolver) {
    const type = typeResolver ? typeResolver(json.type.id) : { id: json.type.id, type: null };
    const property = {
      id: json.id,
      type
    };
    if (json.value !== undefined) {
      property.value = json.value;
    }
    if (json.defaultValue !== undefined) {
      property.defaultValue = json.defaultValue;
    }
    if (json.metadata) {
      property.metadata = {};
      for (const [key, meta] of Object.entries(json.metadata)) {
        property.metadata[key] = PropertyNode.deserializeProperty(meta, typeResolver);
      }
    }
    if (json.constraints) {
      property.constraints = {};
      for (const [key, constraint] of Object.entries(json.constraints)) {
        property.constraints[key] = PropertyNode.deserializeProperty(constraint, typeResolver);
      }
    }
    if (json.children) {
      property.children = {};
      for (const [key, child] of Object.entries(json.children)) {
        property.children[key] = PropertyNode.deserializeProperty(child, typeResolver);
      }
    }
    return property;
  }
  static deepCloneProperty(property) {
    const cloned = {
      id: property.id,
      type: property.type
    };
    if (property.value !== undefined) {
      cloned.value = PropertyNode.deepCloneValue(property.value);
    }
    if (property.defaultValue !== undefined) {
      cloned.defaultValue = PropertyNode.deepCloneValue(property.defaultValue);
    }
    if (property.metadata) {
      cloned.metadata = {};
      for (const [key, meta] of Object.entries(property.metadata)) {
        cloned.metadata[key] = PropertyNode.deepCloneProperty(meta);
      }
    }
    if (property.constraints) {
      cloned.constraints = {};
      for (const [key, constraint] of Object.entries(property.constraints)) {
        cloned.constraints[key] = PropertyNode.deepCloneProperty(constraint);
      }
    }
    if (property.children) {
      cloned.children = {};
      for (const [key, child] of Object.entries(property.children)) {
        cloned.children[key] = PropertyNode.deepCloneProperty(child);
      }
    }
    return cloned;
  }
  static deepCloneValue(value) {
    if (value === null || value === undefined) {
      return value;
    }
    if (isProperty(value)) {
      return PropertyNode.deepCloneProperty(value);
    }
    if (Array.isArray(value)) {
      return value.map((v) => PropertyNode.deepCloneValue(v));
    }
    if (typeof value === "object") {
      const result = {};
      for (const [k, v] of Object.entries(value)) {
        result[k] = PropertyNode.deepCloneValue(v);
      }
      return result;
    }
    return value;
  }
  equals(other) {
    return PropertyNode.propertyEquals(this.property, other.property);
  }
  static propertyEquals(a, b) {
    if (a.id !== b.id)
      return false;
    if (a.type.id !== b.type.id)
      return false;
    if (!PropertyNode.valueEquals(a.value, b.value))
      return false;
    if (!PropertyNode.valueEquals(a.defaultValue, b.defaultValue))
      return false;
    const aChildKeys = a.children ? Object.keys(a.children) : [];
    const bChildKeys = b.children ? Object.keys(b.children) : [];
    if (aChildKeys.length !== bChildKeys.length)
      return false;
    for (const key of aChildKeys) {
      if (!b.children?.[key])
        return false;
      if (!PropertyNode.propertyEquals(a.children[key], b.children[key]))
        return false;
    }
    const aMetaKeys = a.metadata ? Object.keys(a.metadata) : [];
    const bMetaKeys = b.metadata ? Object.keys(b.metadata) : [];
    if (aMetaKeys.length !== bMetaKeys.length)
      return false;
    for (const key of aMetaKeys) {
      if (!b.metadata?.[key])
        return false;
      if (!PropertyNode.propertyEquals(a.metadata[key], b.metadata[key]))
        return false;
    }
    const aConstKeys = a.constraints ? Object.keys(a.constraints) : [];
    const bConstKeys = b.constraints ? Object.keys(b.constraints) : [];
    if (aConstKeys.length !== bConstKeys.length)
      return false;
    for (const key of aConstKeys) {
      if (!b.constraints?.[key])
        return false;
      if (!PropertyNode.propertyEquals(a.constraints[key], b.constraints[key]))
        return false;
    }
    return true;
  }
  static valueEquals(a, b) {
    if (a === b)
      return true;
    if (a === null || b === null)
      return false;
    if (a === undefined || b === undefined)
      return false;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length)
        return false;
      return a.every((v, i) => PropertyNode.valueEquals(v, b[i]));
    }
    if (typeof a === "object" && typeof b === "object") {
      if (isProperty(a) && isProperty(b)) {
        return PropertyNode.propertyEquals(a, b);
      }
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length)
        return false;
      return aKeys.every((key) => PropertyNode.valueEquals(a[key], b[key]));
    }
    return false;
  }
  get isDestroyed() {
    return this.destroyed;
  }
  destroy() {
    for (const child of this.childNodes.values()) {
      child.destroy();
    }
    this.destroyed = true;
    this.subscriptions.clear();
    this.childNodes.clear();
    this.parentNode = null;
  }
  checkDestroyed() {
    if (this.destroyed) {
      throw new Error("PropertyNode has been destroyed");
    }
  }
  createContext(node) {
    const registry = this.getRegistry();
    if (!registry) {
      throw new Error("No registry set");
    }
    return {
      current: node.property,
      root: this.root.property,
      registry,
      findParent: (target) => this.findParentProperty(target)
    };
  }
  findParentProperty(target) {
    const search = (node) => {
      if (node.property === target) {
        return node.parentNode?.property;
      }
      for (const child of node.children()) {
        const found = search(child);
        if (found)
          return found;
      }
      return;
    };
    return search(this.root);
  }
  toString() {
    return `PropertyNode(${this.id}, type=${this.type.id}, path=${this.pathString() || "root"})`;
  }
  printTree(indent = 0) {
    const lines = [];
    const prefix = "  ".repeat(indent);
    const value = this.property.value !== undefined ? ` = ${JSON.stringify(this.property.value)}` : "";
    lines.push(`${prefix}${this.id} (${this.type.id})${value}`);
    for (const key of this.childKeys()) {
      const childNode = this.child(key);
      if (childNode) {
        lines.push(`${prefix}  [${key}]:`);
        lines.push(childNode.printTree(indent + 2));
      }
    }
    return lines.join(`
`);
  }
}
export {
  withBindings,
  ref,
  op,
  lit,
  isType,
  isRef,
  isProperty,
  isOperator,
  isOp,
  isLit,
  isExpr,
  isConstraint,
  getTypeName,
  evaluate,
  evalArgsParallel,
  evalArgs,
  evalArg,
  createRegistry,
  createLoopContext,
  TYPE,
  Registry,
  REF,
  PropertyNode,
  PROPERTY,
  OPERATOR,
  OP,
  LIT,
  EXPR,
  CONSTRAINT
};
