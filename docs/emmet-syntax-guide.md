# Enhanced h() Function - Emmet-Style Syntax Guide

The `h()` function now supports Emmet-style selectors, making DOM creation much more concise and readable.

## Basic Syntax

### Before (verbose)
```javascript
h("div", { className: "calendar-week-day-header" },
    h("div", { className: "calendar-week-day-name" }, weekdays[i]),
    h("div", { className: "calendar-week-day-number" }, date.getDate())
)
```

### After (concise)
```javascript
h('div.calendar-week-day-header', [
    h('div.calendar-week-day-name', weekdays[i]),
    h('div.calendar-week-day-number', date.getDate())
])
```

## Supported Syntax

### 1. Element with Classes
```javascript
// Single class
h('div.my-class', 'Content')
// Output: <div class="my-class">Content</div>

// Multiple classes
h('div.class1.class2.class3', 'Content')
// Output: <div class="class1 class2 class3">Content</div>
```

### 2. Element with ID
```javascript
h('div#my-id', 'Content')
// Output: <div id="my-id">Content</div>

// ID with classes
h('div#my-id.class1.class2', 'Content')
// Output: <div id="my-id" class="class1 class2">Content</div>
```

### 3. Element with Attributes
```javascript
// Simple attributes
h('input[type="text" placeholder="Enter name"]')
// Output: <input type="text" placeholder="Enter name">

// Mixed attributes with classes and ID
h('input#name-field.form-control[type="text" required]')
// Output: <input id="name-field" class="form-control" type="text" required>

// Attributes with quotes for values containing spaces
h('button[title="Click me!" data-action="submit"]', 'Submit')
// Output: <button title="Click me!" data-action="submit">Submit</button>
```

### 4. Different Content Types

#### Text Content
```javascript
h('div.message', 'Hello World!')
// Output: <div class="message">Hello World!</div>
```

#### Children Array
```javascript
h('div.container', [
    h('h1.title', 'Page Title'),
    h('p.description', 'Page description'),
    h('button.btn.primary', 'Click me')
])
```

#### Mixed Props and Children
```javascript
h('div.card', 
    { 
        onclick: () => console.log('clicked'),
        'data-id': '123' 
    }, 
    h('h2', 'Card Title'),
    h('p', 'Card content')
)
```

## Real-World Examples

### 1. Task Count Component (Before/After)
```javascript
// Before
return h("span", 
    { className, onclick: onClick },
    h("span", { className: "task-count-todo" }, todoCount.toString()),
    h("span", { className: "task-count-separator" }, "/"),
    h("span", { className: "task-count-done" }, doneCount.toString())
);

// After
return h(`span.${className}`, 
    { onclick: onClick },
    h('span.task-count-todo', todoCount.toString()),
    h('span.task-count-separator', '/'),
    h('span.task-count-done', doneCount.toString())
);
```

### 2. Calendar Time Slot (Before/After)
```javascript
// Before
h("div", {
    className: "calendar-time-slot",
    "data-time": time24,
    "data-hour": hour,
    "data-minute": minute,
}, time12)

// After
h(`div.calendar-time-slot[data-time="${time24}" data-hour="${hour}" data-minute="${minute}"]`, time12)
```

### 3. Form Elements
```javascript
// Input field with validation
h('input.form-input[type="email" required placeholder="Enter your email"]')

// Select dropdown
h('select.form-select[name="priority"]', [
    h('option[value="high"]', 'High Priority'),
    h('option[value="medium" selected]', 'Medium Priority'),
    h('option[value="low"]', 'Low Priority')
])

// Table cell with colspan
h('td.summary-cell[colspan="3"]', 'Total: $1,234.56')
```

## Advanced Usage

### Dynamic Classes
```javascript
const isActive = true;
const className = isActive ? 'button active' : 'button';
h(`button.${className}`, 'Click me')
```

### Combining Emmet Syntax with Props
```javascript
h('div.modal.fade[data-backdrop="static"]', 
    { 
        onclick: closeModal,
        style: { zIndex: 1050 }
    },
    h('div.modal-content', modalContent)
)
```

## Migration Guide

1. **Start Simple**: Convert basic elements first
   ```javascript
   // Easy wins
   h("div", { className: "container" }) → h('div.container')
   h("span", { className: "badge" }, text) → h('span.badge', text)
   ```

2. **Add Attributes**: Convert elements with data attributes
   ```javascript
   h("button", { "data-id": "123", className: "btn" }) 
   → h('button.btn[data-id="123"]')
   ```

3. **Complex Elements**: Handle elements with both props and attributes
   ```javascript
   // Keep props object for event handlers and complex attributes
   h('button.btn.primary[type="submit"]', { onclick: handler }, 'Submit')
   ```

## Benefits

- **80% less verbose** for common DOM creation patterns
- **Familiar syntax** - developers already know Emmet
- **Better readability** - structure is clearer at a glance
- **Fewer syntax errors** - less object literal syntax to get wrong
- **Maintains flexibility** - can still use props object when needed

## Backward Compatibility

The enhanced `h()` function is fully backward compatible. All existing code continues to work unchanged while you gradually adopt the new syntax.