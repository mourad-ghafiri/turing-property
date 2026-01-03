# 🏷️ Metadata System

Metadata provides descriptive information about properties — labels, hints, visibility, styling, and more. **All metadata supports dynamic expressions!**

---

## 🎯 The Power of Dynamic Metadata

Unlike traditional systems where metadata is static, Turing Property allows metadata values to be **expressions** that evaluate at runtime:

```typescript
import { pText, label, hint, visible, op, ref, lit } from 'turing-property';

const companyField = pText('company', {
    metadata: {
        // Static label
        label: label('Company Name'),
        
        // Dynamic hint based on another field
        hint: hint(
            op('if',
                ref(['parent', 'children', 'isEnterprise', 'value']),
                lit('Enter your enterprise organization name'),
                lit('Enter your company name')
            )
        ),
        
        // Dynamic visibility
        visible: visible(
            op('eq',
                ref(['parent', 'children', 'accountType', 'value']),
                lit('business')
            )
        )
    }
});
```

---

## 📂 Metadata Categories

### 🎨 Common (Display/Presentation)

```typescript
import {
    label, hint, description, placeholder, tooltip, helpText,
    icon, prefix, suffix,
    visible, hidden, disabled, readonly, required, loading, optional
} from 'turing-property';

const priceField = pCurrency('price', '$', {
    metadata: {
        label: label('Product Price'),
        hint: hint('Enter the base price before tax'),
        description: description('This will be displayed to customers'),
        placeholder: placeholder('0.00'),
        tooltip: tooltip('Price must be positive'),
        helpText: helpText('Prices are in USD'),
        prefix: prefix('$'),
        suffix: suffix('USD'),
        required: required(true),
        disabled: disabled(false)
    }
});
```

### ⌨️ Input Metadata

```typescript
import {
    inputType, autocomplete, inputMode, enterKeyHint,
    spellCheck, autoCapitalize, autoCorrect, autoFocus,
    step, min, max, rows, cols, accept, multiple
} from 'turing-property';

const searchField = pText('search', {
    metadata: {
        inputType: inputType('search'),
        inputMode: inputMode('text'),
        enterKeyHint: enterKeyHint('search'),
        autocomplete: autocomplete('off'),
        autoFocus: autoFocus(true),
        spellCheck: spellCheck(false)
    }
});

const ageField = pNumber('age', {
    metadata: {
        inputType: inputType('number'),
        min: min(0),
        max: max(150),
        step: step(1)
    }
});
```

### 📐 Format Metadata

```typescript
import {
    format, pattern, mimeType, encoding, locale, timezone,
    unit, currency, precision, scale, examples, fallback
} from 'turing-property';

const temperatureField = pNumber('temperature', {
    metadata: {
        unit: unit('°C'),
        precision: precision(1),
        format: format('decimal')
    }
});

const currencyField = pCurrency('amount', '€', {
    metadata: {
        currency: currency('EUR'),
        locale: locale('de-DE'),
        precision: precision(2)
    }
});
```

### 📏 Layout Metadata

```typescript
import {
    layout, gap, order, tabIndex, width, height, size,
    align, justify, variant, color, bgColor, styleClasses, styles
} from 'turing-property';

const cardSection = pCard('details', {
    name: pText('name'),
    email: pEmail('email')
}, {
    metadata: {
        layout: layout('column'),
        gap: gap(16),
        variant: variant('elevated'),
        width: width('100%')
    }
});
```

### 📚 Collection Metadata

```typescript
import {
    options, maxSelections, minItems, maxItems,
    searchable, clearable, sortable, editable, deletable, draggable,
    itemTemplate
} from 'turing-property';

const tagsField = pMultiSelect('tags', [
    { value: 'js', label: 'JavaScript' },
    { value: 'ts', label: 'TypeScript' },
    { value: 'py', label: 'Python' }
], {
    metadata: {
        searchable: searchable(true),
        clearable: clearable(true),
        maxSelections: maxSelections(5)
    }
});

const itemsList = pRepeater('items', itemTemplate, {
    metadata: {
        minItems: minItems(1),
        maxItems: maxItems(10),
        sortable: sortable(true),
        deletable: deletable(true)
    }
});
```

### 📦 Container Metadata

```typescript
import {
    isGroup, isForm, isStep, isWizard, isComputed, isRepeater, isTabs, isConditional,
    collapsible, collapsed, resizable
} from 'turing-property';

const settingsSection = pCollapsible('advanced', {
    debug: pSwitch('debug'),
    verbose: pSwitch('verbose')
}, true, {
    metadata: {
        label: label('Advanced Settings'),
        collapsible: collapsible(true),
        collapsed: collapsed(true)
    }
});
```

### 🎬 Action Metadata

```typescript
import {
    submitLabel, resetLabel, cancelLabel, showReset,
    nextLabel, prevLabel, finishLabel, showProgress, allowSkip,
    addLabel, removeLabel, currentStep, totalSteps, activeTab
} from 'turing-property';

const wizardForm = pWizard('onboarding', steps, {
    metadata: {
        nextLabel: nextLabel('Continue'),
        prevLabel: prevLabel('Go Back'),
        finishLabel: finishLabel('Complete Setup'),
        showProgress: showProgress(true),
        allowSkip: allowSkip(false)
    }
});
```

---

## 💡 Dynamic Metadata Examples

### 🎭 Conditional Visibility

Show/hide fields based on other values:

```typescript
const form = pForm('order', {
    isGift: pCheckbox('isGift', {
        metadata: { label: label('This is a gift') }
    }),
    
    // Only show when isGift is true
    giftMessage: pTextarea('giftMessage', {
        metadata: {
            label: label('Gift Message'),
            visible: visible(
                ref(['parent', 'children', 'isGift', 'value'])
            )
        }
    }),
    
    recipientEmail: pEmail('recipientEmail', {
        metadata: {
            label: label('Recipient Email'),
            visible: visible(
                ref(['parent', 'children', 'isGift', 'value'])
            )
        }
    })
});
```

### 📝 Dynamic Labels

Change labels based on context:

```typescript
const accountForm = pForm('account', {
    accountType: pSelect('accountType', [
        { value: 'personal', label: 'Personal' },
        { value: 'business', label: 'Business' }
    ]),
    
    name: pText('name', {
        metadata: {
            // Label changes based on account type
            label: label(
                op('if',
                    op('eq', ref(['parent', 'children', 'accountType', 'value']), lit('business')),
                    lit('Company Name'),
                    lit('Full Name')
                )
            ),
            placeholder: placeholder(
                op('if',
                    op('eq', ref(['parent', 'children', 'accountType', 'value']), lit('business')),
                    lit('Acme Corporation'),
                    lit('John Doe')
                )
            )
        }
    })
});
```

### 💬 Context-Aware Hints

```typescript
const passwordField = pPassword('password', 8, {
    metadata: {
        hint: hint(
            op('if',
                op('lt', op('strlen', ref(['self', 'value'])), lit(8)),
                lit('Password must be at least 8 characters'),
                op('if',
                    op('not', op('matches', ref(['self', 'value']), lit('[A-Z]'))),
                    lit('Add at least one uppercase letter'),
                    op('if',
                        op('not', op('matches', ref(['self', 'value']), lit('[0-9]'))),
                        lit('Add at least one number'),
                        lit('✓ Password is strong')
                    )
                )
            )
        )
    }
});
```

### 🎨 Dynamic Styling

```typescript
const statusField = pSelect('status', [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'inactive', label: 'Inactive' }
], {
    metadata: {
        color: color(
            op('if',
                op('eq', ref(['self', 'value']), lit('active')),
                lit('green'),
                op('if',
                    op('eq', ref(['self', 'value']), lit('pending')),
                    lit('orange'),
                    lit('red')
                )
            )
        )
    }
});
```

### 🔢 Computed Metadata Values

```typescript
const itemsList = pRepeater('items', itemTemplate, {
    metadata: {
        label: label(
            op('concat',
                lit('Items ('),
                op('toString', op('len', ref(['self', 'value']))),
                lit(')')
            )
        )
    }
});
// Label shows: "Items (5)" when 5 items exist
```

### 🌍 Locale-Aware Metadata

```typescript
const translations = {
    en: { name: 'Name', email: 'Email' },
    es: { name: 'Nombre', email: 'Correo' },
    fr: { name: 'Nom', email: 'E-mail' }
};

const form = pForm('contact', {
    locale: pSelect('locale', [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Español' },
        { value: 'fr', label: 'Français' }
    ]),
    
    name: pText('name', {
        metadata: {
            label: label(
                op('get',
                    op('get', lit(translations), ref(['parent', 'children', 'locale', 'value'])),
                    lit('name')
                )
            )
        }
    })
});
```

---

## 🔄 Accessing Metadata

Use `PropertyNode` to get evaluated metadata:

```typescript
import { PropertyNode, defaultRegistry } from 'turing-property';

const form = new PropertyNode(myForm);
form.setRegistry(defaultRegistry);

// Get metadata (evaluates expressions!)
const label = await form.child('name')?.getMetadata('label');
const isVisible = await form.child('company')?.getMetadata('visible');
const hint = await form.child('password')?.getMetadata('hint');
```

---

## 📚 Next Steps

- 🏷️ [Types](./types.md) — The type system
- ✅ [Constraints](./constraints.md) — Validation system
- 🧩 [Properties](./properties.md) — All builtin properties
- 💡 [Examples](./examples/) — Real-world patterns

