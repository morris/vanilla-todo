# VANILLA TODO

A [TeuxDeux](https://teuxdeux.com) clone in plain HTML, CSS and
JavaScript, with zero dependencies.
It's fully animated and runs smoothly at 60 FPS.

More importantly, it's also a
**case study on viable techniques and patterns for vanilla web development.**

**[Try it online →](https://raw.githack.com/morris/vanilla-todo/main/public/index.html)**

_This document presents a "live" case study, expected to evolve a bit over time.
Intermediate understanding of the web platform is required to follow through._

## Table of Contents

- [1. Motivation](#1-motivation)
- [2. Method](#2-method)
  - [2.1. Subject](#21-subject)
  - [2.2. Rules](#22-rules)
  - [2.3. Goals](#23-goals)
    - [2.3.1. User Experience](#231-user-experience)
    - [2.3.2. Code Quality](#232-code-quality)
    - [2.3.3. Generality of Patterns](#233-generality-of-patterns)
- [3. Implementation](#3-implementation)
  - [3.1. Basic Structure](#31-basic-structure)
  - [3.2. JavaScript Architecture](#32-javascript-architecture)
    - [3.2.1. Mount Functions](#321-mount-functions)
    - [3.2.2. Data Flow](#322-data-flow)
    - [3.2.3. Rendering](#323-rendering)
    - [3.2.4. Reconciliation](#324-reconciliation)
  - [3.3. Drag & Drop](#33-drag--drop)
  - [3.4. Animations](#34-animations)
- [4. Testing](#4-testing)
- [5. Assessment](#5-assessment)
  - [5.1. User Experience](#51-user-experience)
  - [5.2. Code Quality](#52-code-quality)
    - [5.2.1. The Good](#521-the-good)
    - [5.2.2. The Verbose](#522-the-verbose)
    - [5.2.3. The Bad](#523-the-bad)
  - [5.3. Generality of Patterns](#53-generality-of-patterns)
- [6. Conclusion](#6-conclusion)
- [7. What's Next?](#7-whats-next)

## 1. Motivation

I believe too little has been invested in researching
practical, scalable methods for building web applications
without third party dependencies.

It's not enough to describe how to create DOM nodes
or how to toggle a class without a framework.
It's also rather harmful to write an article
saying you don't need library X, and then proceed in describing how
to roll your own untested, inferior version of X.

We're missing thorough examples of complex web applications
built only with standard web technologies, covering as many aspects of
the development process as possible.

This case study is an attempt to fill this gap, at least a little bit.

## 2. Method

The method for this case study is as follows:

- Pick an interesting subject.
- Implement it using only standard web technologies.
- Document techniques and patterns found during the process.
- Assess the results by common quality standards.

This section describes the method in more detail.

### 2.1. Subject

I've chosen to build a functionally equivalent clone of
[TeuxDeux](https://teuxdeux.com) for this study.
The user interface has interesting challenges,
in particular performant drag & drop when combined with animations.

The user interface is arguably small (which is good for a case study)
but large enough to require thought on its architecture.

However, it is lacking in some key areas:

- Routing
- Asynchronous resource requests
- Server-side rendering

### 2.2. Rules

To produce valid vanilla solutions, and because constraints spark creativity,
I came up with a set of rules to follow throughout the process:

- Only use standard web technologies.
- Only use widely supported JS features unless they can be polyfilled (1).
- No runtime JS dependencies (except polyfills).
- No build steps.
- No general-purpose utility functions related to the DOM/UI (2).

(1) This is a moving target; I used ES5 for maximum support.

(2) These usually end up becoming a custom micro-framework,
thereby questioning why you didn't use one of the
established and tested libraries/frameworks in the first place.

### 2.3. Goals

The results are going to be assessed by three major concerns:

#### 2.3.1. User Experience

The resulting product should be comparable to or better
than the original regarding functionality, performance and design.

This includes testing major browsers and devices.

#### 2.3.2. Code Quality

The resulting implementation should adhere to
established code quality standards in the industry.

This will be difficult to assess objectively, as we will see later.

#### 2.3.3. Generality of Patterns

The discovered techniques and patterns should be applicable in a wide
range of scenarios.

## 3. Implementation

This section walks through the resulting implementation, highlighting techniques
and problems found during the process. You're encouraged to inspect the
[source code](./public) alongside this section.

### 3.1. Basic Structure

Since build steps are ruled out, the codebase is organized around
plain HTML, CSS and JS files. The HTML and CSS mostly follows
[rscss](https://rscss.io) (devised by [Rico Sta. Cruz](https://ricostacruz.com))
which yields an intuitive, component-oriented structure.

The stylesheets are slightly verbose.
I missed [SCSS](https://sass-lang.com/) here,
and I think it's a must-have for bigger projects.

ES6 modules are ruled out so all JavaScript lives under
a global namespace (`VT`). This works everywhere but has some downsides
e.g. cannot be statically analyzed and may miss code completion.

Basic code quality (code style, linting) is enforced by [Prettier](https://prettier.io),
[stylelint](https://stylelint.io) and [ESLint](https://eslint.org).
I've set the ESLint parser to ES5 to ensure only ES5 code is allowed.

Note that I've opted out of web components completely.
I can't clearly articulate what I dislike about them
but I never missed them throughout this study.

---

The basic structure comes with some boilerplate,
e.g. referencing all the individual stylesheets and scripts from the HTML;
probably enough to justify a simple build step.

It is otherwise straight-forward and trivial to understand
(literally just a bunch of HTML, CSS and JS files).

### 3.2. JavaScript Architecture

Naturally, the JS architecture is the most interesting part of this study.

I found that using a combination of functions,
query selectors and DOM events is sufficient
to build a scalable, maintainable codebase,
albeit with some trade-offs as we will see later.

Conceptually, the proposed architecture loosely maps
CSS selectors to JS functions which are _mounted_ (i.e. called) once
per matching element. This yields a simple mental model and synergizes
with the DOM and styles:

```
.todo-list -> VT.TodoList
  scripts/TodoList.js
  styles/todo-list.css

.app-collapsible -> VT.AppCollapsible
  scripts/AppCollapsible.js
  styles/app-collapsible.css

...
```

This proved to be a useful, repeatable pattern throughout all of the implementation process.

#### 3.2.1. Mount Functions

_Mount functions_ take a DOM element as their (only) argument.
Their responsibility is to set up initial state, event listeners, and
provide behavior and rendering for the target element.

Here's a "Hello, World!" example of mount functions:

```js
// safely initialize namespace
window.MYAPP = window.MYAPP || {};

// define mount function
// loosely mapped to ".hello-world"
MYAPP.HelloWorld = function (el) {
  // define initial state
  var state = {
    title: 'Hello, World!',
    description: 'An example vanilla component',
    counter: 0,
  };

  // set rigid base HTML
  // no ES6 template literals :(
  el.innerHTML = [
    '<h1 class="title"></h1>',
    '<p class="description"></p>',
    '<div class="my-counter"></div>',
  ].join('\n');

  // mount sub-components
  el.querySelectorAll('.my-counter').forEach(MYAPP.MyCounter);

  // attach event listeners
  el.addEventListener('modifyCounter', function (e) {
    update({ counter: state.counter + e.detail });
  });

  // expose public interface
  el.helloWorld = {
    update: update,
  };

  // initial update
  update();

  // define idempotent update function
  function update(next) {
    // update state
    // optionally optimize, e.g. bail out if state hasn't changed
    Object.assign(state, next);

    // update own HTML
    el.querySelector('.title').innerText = state.title;
    el.querySelector('.description').innerText = state.description;

    // pass data to sub-scomponents
    el.querySelector('.my-counter').myCounter.update({
      value: state.counter,
    });
  }
};

// define another component
// loosely mapped to ".my-counter"
MYAPP.MyCounter = function (el) {
  // define initial state
  var state = {
    value: 0,
  };

  // set rigid base HTML
  // no ES6 template literals :(
  el.innerHTML = [
    '<p>',
    '  <span class="value"></span>',
    '  <button class="increment">Increment</button>',
    '  <button class="decrement">Decrement</button>',
    '</p>',
  ].join('\n');

  // attach event listeners
  el.querySelector('.increment').addEventListener('click', function () {
    // dispatch an action
    // use .detail to transport data
    el.dispatchEvent(
      new CustomEvent('modifyCounter', {
        detail: 1,
        bubbles: true,
      })
    );
  });

  el.querySelector('.decrement').addEventListener('click', function () {
    // dispatch an action
    // use .detail to transport data
    el.dispatchEvent(
      new CustomEvent('modifyCounter', {
        detail: -1,
        bubbles: true,
      })
    );
  });

  // expose public interface
  el.myCounter = {
    update: update,
  };

  // define idempotent update function
  function update(next) {
    Object.assign(state, next);

    el.querySelector('.value').innerText = state.value;
  }
};

// mount HelloWorld component(s)
// any <div class="hello-world"></div> in the document will be mounted
document.querySelectorAll('.hello-world').forEach(MYAPP.HelloWorld);
```

This comes with quite some boilerplate but has useful properties,
as we will see in the following sections.

Note that any part of a mount function is entirely optional.
For example, a mount function does not have to set any base HTML,
and may instead only set event listeners to enable some behavior.

Also note that an element can be mounted with multiple functions.
For example, to-do items are mounted with
`VT.TodoItem`, `VT.AppDraggable` and `VT.AppLateBlur`

See for example:

- [AppIcon.js](./public/scripts/AppIcon.js)
- [AppLateBlur.js](./public/scripts/AppLateBlur.js)
- [TodoItem.js](./public/scripts/TodoItem.js)
- [TodoItemInput.js](./public/scripts/TodoItemInput.js)

#### 3.2.2. Data Flow

I found it effective to implement one-way data flow similar to React's approach.

- **Data flows downwards** from parent components to child components
  through their public interfaces (usually `update` functions).
- **Actions flow upwards** through custom DOM events (bubbling up),
  usually resulting in some parent component state change which is in turn
  propagated downwards through `update` functions.

The data store is factored into a separate mount function (`TodoStore`).
It only receives and dispatches events, and encapsulates any data manipulation.

Listening to and dispatching events is slightly verbose with standard APIs and
certainly justifies introducing helpers.
I didn't need event delegation à la jQuery for this study
but I believe it's a useful concept that is likely hard to do
properly with standard APIs.

See for example:

- [TodoDay.js](./public/scripts/TodoDay.js)
- [TodoStore.js](./public/scripts/TodoStore.js)

#### 3.2.3. Rendering

Naively re-rendering a whole component using `.innerHTML` should be avoided,
as this may hurt performance and will likely break important functionality such as
input state, focus, text selection etc. which browsers have already been
optimizing for years.

As seen in 3.2.1., rendering is therefore split between setting a rigid base HTML
and an idempotent, complete update function which only makes necessary changes.

- **Idempotency** is key here, i.e. update functions may be called at any time
  and should always render the component correctly.
- **Completeness** is equally important, i.e. update functions should render
  the whole component, regardless of what triggered an update.

In effect, this means almost all DOM manipulation is done in update functions,
which greatly contributes to robustness and readability of the codebase.

As seen above, this approach is quite verbose and ugly compared to JSX, for example.
However, it's very performant and can be further optimized
by checking for data changes, caching selectors, etc.
It is also easy to understand.

See for example:

- [TodoItem.js](./public/scripts/TodoItem.js)
- [TodoCustomList.js](./public/scripts/TodoCustomList.js)

#### 3.2.4. Reconciliation

Expectedly, the hardest part of the study was rendering a variable
amount of dynamic components efficiently. Here's a commented example
from the implementation outlining the algorithm:

```js
/* global VT */
window.VT = window.VT || {};

VT.TodoList = function (el) {
  var state = {
    items: [],
  };

  el.innerHTML = '<div class="items"></div>';

  function update(next) {
    Object.assign(state, next);

    var container = el.querySelector('.items');

    // mark current children for removal
    var obsolete = new Set(container.children);

    // map current children by data-key
    var childrenByKey = new Map();

    obsolete.forEach(function (child) {
      childrenByKey.set(child.getAttribute('data-key'), child);
    });

    // build new list of child elements from data
    var children = state.items.map(function (item) {
      // find existing child by data-key
      var child = childrenByKey.get(item.id);

      if (child) {
        // if child exists, keep it
        obsolete.delete(child);
      } else {
        // otherwise, create new child
        child = document.createElement('div');
        child.classList.add('todo-item');
        child.setAttribute('data-key', item.id);
        VT.TodoItem(child);
      }

      // update child
      child.todoItem.update({ item: item });

      return child;
    });

    // remove obsolete children
    obsolete.forEach(function (child) {
      container.removeChild(child);
    });

    // insert new list of children (may reorder existing children)
    children.forEach(function (child, index) {
      if (child !== container.children[index]) {
        container.insertBefore(child, container.children[index]);
      }
    });
  }

  el.todoList = {
    update: update,
  };
};
```

It's very verbose and has lots of opportunity to introduce bugs.
Compared with a simple loop in JSX, this seems insane.
It is quite performant as it does minimal work but is otherwise messy;
definitely a candidate for a utility function or library.

### 3.3. Drag & Drop

Implementing drag & drop from scratch was challenging,
especially regarding browser/device consistency.

Using a library would have been a lot more cost-effective initially.
However, having a customized implementation paid off once I started
introducing animations, as both had to be coordinated closely.
I can imagine this would have been a difficult problem
when using third party code for either.

The drag & drop implementation is (again) based on DOM events and integrates
well with the remaining architecture.
It's clearly the most complex part of the study, but I was able to implement it
without changing existing code besides mounting behaviors and
adding event handlers.

Reference:

- [AppDraggable.js](./public/scripts/AppDraggable.js)
- [AppSortable.js](./public/scripts/AppSortable.js)
- [TodoList.js](./public/scripts/TodoList.js)

### 3.4. Animations

For the final product I wanted smooth animations for most user interactions.
This is a cross-cutting concern which was implemented using the
[FLIP](https://aerotwist.com/blog/flip-your-animations/) technique as devised
by [Paul Lewis](https://twitter.com/aerotwist).

Implementing FLIP animations without a large refactoring was the biggest
challenge of this case study, especially in combination with drag & drop.
After days of work I was able to implement the algorithm in isolation and
coordinate it with other concerns at the application's root level.
The `useCapture` mode of `addEventListener` was proven to be useful
in this case.

Reference:

- [AppFlip.js](./public/scripts/AppDraggable.js)
- [TodoApp.js](./public/scripts/AppSortable.js)

## 4. Testing

TODO

## 5. Assessment

### 5.1. User Experience

TODO

### 5.2. Code Quality

Unfortunately, it is quite hard to find undisputed, objective measurements
for code quality (besides trivialities like code style, linting, etc.).
The only generally accepted assessment seems to be peer reviewal
which is only possible after publication.

To have at least some degree of assessment of the code's quality,
the following sections provide relevant, objective facts about the codebase
and some of my own opinions based on my experience in the industry.

#### 5.2.1. The Good

- No build steps
- No external dependencies at runtime besides polyfills
- Used only standard technologies:
  - Plain HTML, CSS and JavaScript
  - Standard DOM APIs
- Very few concepts introduced:
  - Mount functions (loosely mapped by CSS class names)
  - Component = Rigid Base HTML + Event Listeners + Idempotent Update Function
  - Data flow using DOM events
- Compare the proposed architecture to the API/conceptual surface of Angular or React...
- Progressive developer experience
  - Markup, style, and behavior are orthogonal and can be developed separately.
  - Adding behavior has little impact on the markup besides adding classes.
- Debugging is straight-forward using modern browser developer tools.
- The app can be naturally enhanced from the outside by handling/dispatching
  events (just like you can naturally animate some existing HTML).
- Little indirection
- Low coupling
- The result is literally just a bunch of HTML, CSS, and JS files.

#### 5.2.2. The Verbose

- Stylesheets are a bit verbose. SCSS would help here.
- Simple components require quite some boilerplate code.
- ES5 is generally a lot more verbose than ES6.
  - Especially arrow functions, template literals,
    and async/await would make the code more readable.
  - ES6 modules would eliminate the need for a global namespace.
- `el.querySelectorAll(':scope ...')` is somewhat default/expected and
  would justify a helper.
- Listening to and dispatching events is slightly verbose.
- Although not used in this study,
  event delegation is not trivial to implement without code duplication.

#### 5.2.3. The Bad

- The separation between base HTML and dynamic rendering is not ideal
  when compared to JSX, for example.
- Reconciliation is verbose, brittle and repetitive.
  I wouldn't recommend the proposed technique
  without a well-tested helper function, at least.
- JSX/virtual DOM techniques provide much better development ergonomics.
- You have to remember mounting behaviors correctly when
  creating new elements. It would be helpful to automate this somehow,
  e.g. watch elements of selector X (at all times) and ensure the desired
  behaviors are mounted once on them.
- No type safety. I've always been a proponent of dynamic languages
  but since TypeScripts' type system provides the best of both worlds,
  I cannot recommend using it enough.

### 5.3. Generality of Patterns

Assessing the generality of the discovered techniques objectively is
not really possible without production usage.

From my experience, however, I can't imagine any
scenario where mount functions, event-based data flow etc. are not applicable.
The underlying principles power the established frameworks, after all:

- State is separated from the DOM (React, Angular, Vue).
- Rendering is idempotent and complete (React's pure `render` function).
- One-way data flow (React)

## 6. Conclusion

The result of this study is a working todo application with decent UI/UX and
most of the functionality of the original TeuxDeux app,
built using only standard web technologies.
Some extra features were introduced to demonstrate the implementation of
cross-cutting concerns in the study's codebase.

The codebase seems manageable through a handful of simple concepts,
although it is quite verbose and even messy in some areas.
This could be mitigated by a small number of helper functions and
simple build steps (e.g. SCSS and TypeScript).

The study's method helped discovering patterns and techniques that
are at least on par with a framework-based approach for the given subject,
without diverging into building a custom framework. except for
rendering variable numbers of elements efficiently.
Further research is needed in this area, but for now this appears to be
a valid candidate for a (possibly external) general-purpose utility.

When looking at the downsides, remember that all of the individual parts are
self-contained, highly decoupled, portable, and congruent to the web platform.
The resulting implementation cannot "rust", by definition.

---

Setting some constraints up-front forced me to challenge
my assumptions and preconceptions about vanilla web development.
It was quite liberating to avoid general-purpose utilities and
get things done with what's readily available.

As detailed in the discussion section,
the study would likely be more convincing if build steps were allowed.
Modern JavaScript and SCSS could reduce most of
the unnecessarily verbose parts to a minimum.

Finally, this case study does not question
using dependencies or frameworks in general.
It was a constrained experiment designed to discover novel methods
for vanilla web development and, hopefully,
inspire innovation and further research in the area.

## 7. What's Next?

I'd love to hear feedback and ideas on any aspect of the case study.
It's still lacking in some important areas, e.g. testing techniques.

Pull requests, questions, and bug reports are more than welcome!

---

Here are a few ideas I'd like to see explored in the future:

- Run another case study with TypeScript, SCSS, and build steps (seems promising).
- Research validation rules for utility functions and external dependencies.
- Experiment with architectures based on virtual DOM rendering and standard DOM events.
- Compile discovered rules, patterns and techniques into a comprehensive guide.
