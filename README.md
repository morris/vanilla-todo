# VANILLA TODO

A [TeuxDeux](https://teuxdeux.com) clone in plain HTML, CSS and JavaScript (no
build steps). It's fully animated and runs smoothly at 60 FPS with a total
transfer size of **55 KB** (unminified).

**[Try it online →](https://morris.github.io/vanilla-todo/)**

More importantly, it's a case study showing that **vanilla web development** is
viable in terms of [maintainability](#521-the-good), and worthwhile in terms of
[user experience](#51-user-experience) (**50%** less time to load and **95%**
less bandwidth in this case).

**There's no custom framework invented here.** Instead, the case study was
[designed](#22-rules) to discover minimum viable
[patterns](#321-mount-functions) that are truly vanilla. The result is
maintainable, albeit [verbose](#522-the-verbose) and with considerable
duplication.

If anything, the case study validates the value of build steps and frameworks,
but also demonstrates that standard web technologies can be used effectively and
there are only a few [critical areas](#523-the-bad) where a vanilla approach is
clearly inferior.

_While the first version of the case study has been published in 2020, it has
received significant [updates](#9-changelog) over time. Also, further work is
being done with **[Vanilla Prime](https://github.com/morris/vanilla-prime)**, a
practical guide to (almost) vanilla web development based on insights from this
case study._

_Intermediate understanding of the web platform is required to follow through._

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
- [4. Tooling](#4-tooling)
  - [4.1. Local Development Server](#41-local-development-server)
  - [4.2. Formatting and Linting](#42-formatting-and-linting)
  - [4.3. Testing](#43-testing)
    - [4.3.1. Code Coverage](#431-code-coverage)
  - [4.4. Pipeline](#44-pipeline)
  - [4.5. Debugging](#45-debugging)
- [5. Assessment](#5-assessment)
  - [5.1. User Experience](#51-user-experience)
  - [5.2. Code Quality](#52-code-quality)
    - [5.2.1. The Good](#521-the-good)
    - [5.2.2. The Verbose](#522-the-verbose)
    - [5.2.3. The Bad](#523-the-bad)
  - [5.3. Generality of Patterns](#53-generality-of-patterns)
- [6. Conclusion](#6-conclusion)
- [7. Beyond Vanilla](#7-beyond-vanilla)
- [8. Appendix](#8-appendix)
  - [8.1. Links](#81-links)
  - [8.2. Response](#82-response)
- [9. Changelog](#9-changelog)

## 1. Motivation

I believe too little has been invested in researching practical, scalable
methods for building web applications without third party dependencies.

It's not enough to describe how to create DOM nodes or how to toggle a class
without a framework. It's also rather harmful to write an article saying you
don't need library X, and then proceed in describing how to roll your own
untested, inferior version of X.

What's missing are thorough examples of complex web applications built only with
standard web technologies, covering as many aspects of the development process
as possible.

This case study is an attempt to fill this gap, at least a little bit, and
inspire further research in the area.

## 2. Method

The method for this case study is as follows:

- Pick an interesting subject.
- Implement it using only standard web technologies.
- Document techniques and patterns found during the process.
- Assess the results by common quality standards.

This section describes the method in more detail.

### 2.1. Subject

I've chosen to build a (functionally reduced) clone of
[TeuxDeux](https://teuxdeux.com) for this study. The user interface has
interesting challenges, in particular performant drag & drop when combined with
animations.

_The original TeuxDeux app deserves praise here. In my opinion it has the best
over-all concept and UX of all the to-do apps out there.
[Thank you!](https://fictivekin.com/)_

The user interface is arguably small (which is good for a case study) but large
enough to require thought on its architecture.

However, it is lacking in some key areas:

- Routing
- Asynchronous resource requests
- Complex forms
- Server-side rendering

### 2.2. Rules

To produce valid vanilla solutions, and because constraints spark creativity, I
came up with a set of rules to follow throughout the process:

- Only use standard web technologies.
- Only use widely supported JS features unless they can be polyfilled (1).
- No runtime JS dependencies (except polyfills).
- No build steps.
- No general-purpose utility functions related to the DOM/UI (2).

(1) This is a moving target; the current version is using ES2020.

(2) These usually end up becoming a custom micro-framework, thereby questioning
why you didn't use one of the established and tested libraries/frameworks in the
first place.

### 2.3. Goals

The results are going to be assessed by three major concerns:

#### 2.3.1. User Experience

The product should be comparable to or better than the original regarding
functionality, performance and design.

This includes testing major browsers and devices.

#### 2.3.2. Code Quality

The implementation should be _maintainable_ and follow established code quality
standards.

This will be difficult to assess objectively, as we will see later.

#### 2.3.3. Generality of Patterns

The discovered techniques and patterns should be applicable in a wide range of
scenarios.

## 3. Implementation

This section walks through the implementation, highlighting techniques and
problems found during the process. You're encouraged to inspect the
[source code](./public) alongside this section.

### 3.1. Basic Structure

Since build steps are ruled out, the codebase consists of plain HTML, CSS and JS
files. The HTML and CSS follows [rscss](https://ricostacruz.com/rscss/) (devised
by [Rico Sta. Cruz](https://ricostacruz.com)) resulting in an intuitive,
component-oriented structure.

The stylesheets are slightly verbose.
[CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
did help but I missed [SCSS](https://sass-lang.com/) here; I think it's a
must-have for bigger projects. Additionally, the global CSS namespace problem is
unaddressed (see e.g.
[CSS Modules](https://github.com/css-modules/css-modules)).

All JavaScript files are ES modules (`import`/`export`). I added a few
[JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
comments to functions to get additional code completion in VSCode. This helps,
but using TypeScript would be much safer and less verbose.

Note that I've opted out of web components completely. My attempts to refactor
the implementation using web components either added more complexity, or did not
show significant value over the initial, more basic approach.

---

The basic structure comes with some boilerplate, e.g. referencing all the
individual stylesheets and scripts from the HTML; probably enough to justify a
simple build step.

It is otherwise straight-forward&mdash;literally a bunch of HTML, CSS and JS
files.

### 3.2. JavaScript Architecture

Naturally, the JavaScript architecture is the most interesting part of this
study.

I found that using a combination of functions, query selectors and DOM events is
sufficient to build a scalable, maintainable codebase, albeit with some
trade-offs as we will see later.

Conceptually, the proposed architecture loosely maps CSS selectors to JS
functions which are _mounted_ (i.e. called) once per matching element. This
simple mental model aligns well with the DOM and styles:

```
TodoList -> .todo-list
  scripts/TodoList.js
  styles/todo-list.css

AppCollapsible -> .app-collapsible
  scripts/AppCollapsible.js
  styles/app-collapsible.css

...
```

This proved to be a useful, repeatable pattern throughout all of the
implementation process.

#### 3.2.1. Mount Functions

_Mount functions_ take a DOM element as their first argument. Their
responsibility is to set up initial state, event listeners, and provide behavior
and rendering for the target element.

For example, this mount function implements a simple counter:

```js
// Define mount function.
// Loosely mapped to ".my-counter".
export function MyCounter(el) {
  // Define initial state.
  let value = 0;

  // Set rigid base HTML.
  el.innerHTML = `
    <span class="value"></span>
    <button class="increment">Increment</button>
    <button class="decrement">Decrement</button>
  `;

  // Attach event listeners.
  el.querySelector('.increment').addEventListener('click', () => {
    // Dispatch a custom event, using .detail to transport data.
    // Parent components can listen to this event to receive the counter's value.
    el.dispatchEvent(
      new CustomEvent('counter', {
        detail: value + 1,
        bubbles: true,
      }),
    );
  });

  el.querySelector('.decrement').addEventListener('click', () => {
    el.dispatchEvent(
      new CustomEvent('counter', {
        detail: value - 1,
        bubbles: true,
      }),
    );
  });

  // This event handler supports the increment/decrement actions above,
  // as well as resetting the counter from the outside.
  el.addEventListener('counter', (e) => {
    // Update state and re-render.
    value = e.detail;
    update();
  });

  // Define idempotent update function.
  function update() {
    el.querySelector('.value').innerText = value;
  }

  // Initial update.
  update();
}

// Mount MyCounter component(s).
// Any <div class="my-counter"></div> in the document will be mounted.
document.querySelectorAll('.my-counter').forEach(MyCounter);
```

This comes with quite some boilerplate but has useful properties, as we will see
in the following sections.

Note that a mount function does not have to set any base HTML, and may instead
only set event listeners to enable some behavior. Also note that an element can
be mounted with multiple mount functions. For example, to-do items are mounted
with `TodoItem` and `AppDraggable`.

Compared to React components, mount functions provide interesting flexibility as
components and behaviors can be implemented using the same idiom and combined
arbitrarily.

Reference:

- [AppIcon.js](./public/scripts/AppIcon.js)
- [TodoItem.js](./public/scripts/TodoItem.js)
- [TodoItemInput.js](./public/scripts/TodoItemInput.js)

#### 3.2.2. Data Flow

I found it effective to implement one-way data flow similar to React's approach,
however exclusively using custom DOM events.

- **Data flows downwards** from parent components to child components through
  custom DOM events. Data events are in noun-form.
- **Actions flow upwards** through custom DOM events (bubbling up), usually
  resulting in some parent component state change which is in turn propagated
  downwards through data events. Action events are in verb-form.

The business logic is factored into a pure functional core
([TodoLogic.js](./public/scripts/TodoLogic.js)). This is a sensible approach in
most UI architectures as it encapsulates state transitions in portable, testable
units.

The controller is factored into a separate behavior
([TodoController.js](./public/scripts/TodoController.js)). It only receives and
dispatches events, calling the business logic to apply changes and emit state.
It also handles persistence in Local Storage.

Listening to and dispatching events is slightly verbose with standard APIs and
certainly justifies introducing helpers. I didn't need event delegation à la
jQuery for this study but I believe it's a useful concept that is difficult to
do concisely with standard APIs.

Reference:

- [TodoDay.js](./public/scripts/TodoDay.js)
- [TodoController.js](./public/scripts/TodoController.js)
- [TodoLogic.js](./public/scripts/TodoLogic.js)

#### 3.2.3. Rendering

Naively re-rendering a whole component using `.innerHTML` should be avoided as
this may hurt performance and will likely break important functionality like:

- `<a>`, `<button>`, `<input>`, etc. may lose focus.
- Form inputs may lose data.
- Text selection may be reset.
- CSS transitions may not work correctly.
- Event listeners may need to be reattached.

As seen in [3.2.1.](#321-mount-functions), rendering is therefore split into
some rigid base HTML and an idempotent, complete update function which only
makes necessary changes.

- **Idempotence:** Update functions may be called at any time and should always
  render the component correctly.
- **Completeness:** Update functions should render the whole component,
  regardless of what triggered the update.

In effect, this means almost all DOM manipulation is done in update functions,
which greatly contributes to robustness and readability of the codebase.

As seen above this approach is quite verbose and ugly compared to JSX, for
example. However, it's very performant and can be further optimized by checking
for data changes, caching selectors, etc. It is also simple to understand.

Reference:

- [TodoItem.js](./public/scripts/TodoItem.js)
- [TodoCustomList.js](./public/scripts/TodoCustomList.js)

#### 3.2.4. Reconciliation

Expectedly, the hardest part of the study was rendering a variable amount of
dynamic components efficiently. Here's a commented example from the
implementation outlining the reconciliation algorithm:

```js
export function TodoList(el) {
  let items = [];

  el.innerHTML = `<div class="items"></div>`;

  el.addEventListener('todoItems', (e) => {
    items = e.detail;
    update();
  });

  function update() {
    const container = el.querySelector('.items');

    // Mark current children for removal
    const obsolete = new Set(container.children);

    // Map current children by data-key
    const childrenByKey = new Map();
    obsolete.forEach((child) => childrenByKey.set(child.dataset.key, child));

    // Build new list of child elements from data
    const children = items.map((item) => {
      // Find existing child by data-key
      let child = childrenByKey.get(item.id);

      if (child) {
        // If child exists, keep it
        obsolete.delete(child);
      } else {
        // Otherwise, create new child
        child = document.createElement('div');
        child.classList.add('todo-item');

        // Set data-key
        child.dataset.key = item.id;

        // Mount component
        TodoItem(child);
      }

      // Update child
      child.dispatchEvent(new CustomEvent('todoItem', { detail: item }));

      return child;
    });

    // Remove obsolete children
    obsolete.forEach((child) => container.removeChild(child));

    // (Re-)insert new list of children
    children.forEach((child, index) => {
      if (child !== container.children[index]) {
        container.insertBefore(child, container.children[index]);
      }
    });
  }
}
```

It's very verbose, with lots of opportunities to introduce bugs. Compared to a
simple loop in JSX, this approach seems unreasonable. It is quite efficient as
it does minimal work, but it's definitely a candidate for a utility function or
library.

### 3.3. Drag & Drop

Implementing drag & drop from scratch was challenging, especially regarding
browser/device consistency.

Using a library would have been a lot more cost-effective initially. However,
having a customized implementation paid off once I started introducing
animations as both had to be coordinated closely. I can imagine this would have
been a difficult problem when using third party code for either.

The drag & drop implementation is (again) based on DOM events and integrates
well with the remaining architecture. It's clearly the most complex part of the
study but I was able to implement it without changing existing code besides
mounting behaviors and adding event handlers.

I suspect the drag & drop implementation to have some subtle problems on touch
devices, as I haven't extensively tested them. Using a library for identifying
the gestures could be more sensible and would reduce costs in testing browsers
and devices.

Reference:

- [AppDraggable.js](./public/scripts/AppDraggable.js)
- [AppSortable.js](./public/scripts/AppSortable.js)
- [TodoList.js](./public/scripts/TodoList.js)

### 3.4. Animations

For the final product I wanted smooth animations for most user interactions.
This is a cross-cutting concern which was implemented using the
[FLIP](https://aerotwist.com/blog/flip-your-animations/) technique as devised by
[Paul Lewis](https://twitter.com/aerotwist).

Implementing FLIP animations without a large refactoring was the biggest
challenge of this case study, especially in combination with drag & drop. After
days of work I was able to implement the algorithm in isolation and coordinate
it with other concerns at the application's root level. The `useCapture` mode of
`addEventListener` proved to be very useful in this case.

Reference:

- [AppFlip.js](./public/scripts/AppFlip.js)
- [TodoApp.js](./public/scripts/TodoApp.js)

## 4. Tooling

While no runtime dependencies or build steps were allowed, I did introduce some
local tooling to support the development experience.

As a quick start, here are the steps to get a local development server up and
running:

- Install [git](https://git-scm.com/)
- Install [Node.js](https://nodejs.org/) (>= 20)
- Install an IDE (I used [VSCode](https://code.visualstudio.com/))
- Clone this repository
- Open a terminal in the repository's directory
- Run `npm install`
- Run `npm run dev`
- Visit [http://localhost:8080](http://localhost:8080)

The following sections describe the tooling in more detail.

### 4.1. Local Development Server

Because ES modules are not allowed under the `file://` protocol I needed to run
a local web server for development. Initially, I used
[serve](https://www.npmjs.com/package/serve) which was good enough to get going
but requires manually reloading the application on every change.

Most modern frameworks support _hot reloading_, i.e. updating the application in
place when changing source files. Hot reloading provides fast feedback during
development, especially useful for fine-tuning visuals.

Unfortunately, I could not find a local development server supporting some form
of hot reloading without introducing a framework or build system, but I was able
to implement a [minimal local development server](https://github.com/morris/s4d)
with the following behavior:

- Changes to stylesheets or images will hot replace the changed resources.
- Other changes (e.g. JavaScript or HTML) will cause a full page reload.

While it's not proper
[hot module replacement](https://webpack.js.org/concepts/hot-module-replacement/)
(which needs immense infrastructure), it requires zero changes to the
application source and provides a similar experience because page reloads are
fast.

### 4.2. Formatting and Linting

Basic code consistency is provided by

- [Prettier](https://prettier.io),
- [ESLint](https://eslint.org), and
- [stylelint](https://stylelint.io).

I've set the ESLint parser to ES2020 to ensure only ES2020 code is allowed. I've
also added stylelint rules to check for rscss-compatible CSS.

Run these commands to try it out:

- `npm run format-check` to check formatting
- `npm run format` to apply formatting
- `npm run lint` to lint JavaScript
- `npm run lint-styles` to lint CSS

These tools only required minimal configuration to be effective. They also
integrate well with VSCode so I've rarely had to run these manually.

### 4.3. Testing

I've implemented some end-to-end and unit tests using
[Playwright](https://playwright.dev/). While running a local web server (see
above), you can run the tests with

- `npm run test` for headless tests, or
- `npm run test-ui` for interactive mode.

These might ask you to install Playwright; just follow the instructions.

There's a lot more to explore here, but it's not much different from testing
other frontend stacks. It's actually simpler as there was zero configuration and
just one dependency.

Reference:

- [addItem.test.js](./test/e2e/addItem.test.js)
- [util.test.js](./test/unit/util.test.js)

#### 4.3.1. Code Coverage

I was able to set up code coverage for unit _and_ end-to-end tests via
[Playwright's code coverage feature](https://playwright.dev/docs/api/class-coverage)
and [c8](https://github.com/bcoe/c8). This introduced another dependency and was
slightly more involved to get right, e.g. mapping localhost URLs to file URLs.

Use `npm run test-coverage` to run the tests and produce an LCOV test coverage
report in `./coverage`.

Note that the implementation is specific to the project structure, e.g.
`/public` as web root and port `8080` are hard-coded.

Reference:

- [test-coverage.sh](./scripts/test-coverage.sh)
- [coverage.js](./test/coverage.js)

### 4.4. Pipeline

I've added a simple CI/CD pipeline via GitHub Actions. It runs linters and
tests, and deploys to GitHub Pages on success. This was straight-forward and is
orthogonal to the application code and other tooling.

Reference:

- [pipeline.yml](./.github/workflows/pipeline.yml)

### 4.5. Debugging

I've mostly used [Chrome DevTools](https://developer.chrome.com/docs/devtools)
for debugging and the experience was fantastic. It feels incredibly _immediate_
inspecting an application without third-party code or any kind of cruft (e.g.
source maps).

## 5. Assessment

### 5.1. User Experience

Most important features from the original TeuxDeux application are implemented
and usable:

- Daily to-do lists
- Add/edit/delete to-do items
- Custom to-do lists
- Add/edit/delete custom to-do lists
- Drag & drop to-do items across lists
- Reorder custom to-do lists via drag & drop
- Local Storage persistence

Additionally, most interactions are smoothly animated at 60 frames per second.
In particular, dragging and dropping gives proper visual feedback when elements
are reordered.

_The latter was an improvement over the original application when I started
working on the case study in 2019. In the meantime, the TeuxDeux team released
an update with a much better drag & drop experience. Great job!_

One notable missing feature is Markdown support. It would be unreasonable to
implement Markdown from scratch; this is a valid candidate for using an external
library as it is entirely orthogonal to the remaining codebase.

The application has been tested on latest Chrome, Firefox, Safari, and Safari on
iOS.

_TODO Test more browsers and devices._

A fresh load of the original TeuxDeux application transfers around **1.2 MB**
and finishes loading at over **1000 ms**, sometimes up to 2000ms (measured in
12/2023). Reloads finish at around **700 ms**.

With a transferred size of around **55 KB**, the vanilla application
consistently loads in **300-500 ms**&mdash;not minified and with each script,
stylesheet and icon served as an individual file. Reloads finish at **100-200
ms**; again, not optimized at all (with e.g. asset hashing/indefinite caching).

_To be fair, my implementation misses quite a few features from the original. I
suspect a fully equivalent clone to be well below 100 KB transfer, though._

While there is still optimization potential, the
[Lighthouse](https://developer.chrome.com/docs/lighthouse) score is perfect.

### 5.2. Code Quality

Unfortunately, it is quite hard to find undisputed, objective measurements for
code quality (besides trivialities like code style, linting, etc.). The only
generally accepted assessment seems to be peer reviewal.

To have at least some degree of assessment of the code's quality, the following
sections summarize relevant facts about the codebase and some opinionated
statements based on my experience in the industry.

#### 5.2.1. The Good

- No build steps
- No external dependencies at runtime besides polyfills
  - No dependency maintenance
  - No breaking changes to monitor
- Used only standard technologies:
  - Plain HTML, CSS and JavaScript
  - Standard DOM APIs
- Very few concepts introduced:
  - Mount functions (loosely mapped by CSS class names)
  - State separated from the DOM
  - Idempotent updates
  - Data flow using custom events
- Compare the proposed architecture to the API/conceptual surface of Angular or
  React...
- Progressive developer experience
  - Markup, style, and behavior are orthogonal and can be developed separately.
  - Adding behavior has little impact on the markup besides adding classes.
- Debugging is straight-forward using modern browser developer tools.
- The app can be naturally enhanced from the outside by handling/dispatching
  events (just like you can naturally animate some existing HTML).
- Little indirection
- Low coupling
- The result is literally just a bunch of HTML, CSS, and JS files.
- Straight-forward testing with Playwright (including code coverage)

All source files (HTML, CSS and JS) combine to **under 3000 lines of code**,
including comments and empty lines.

For comparison, prettifying the original TeuxDeux's minified JS assets yields
**81602 LOC** (12/2023).

_To be fair, my implementation misses quite a few features from the original. I
suspect a fully equivalent clone to be well below 10000 LOC, though._

#### 5.2.2. The Verbose

- Stylesheets are a bit verbose. SCSS would help here.
- Simple components require quite some boilerplate code.
- `el.querySelectorAll(':scope ...')` is somewhat default/expected and would
  justify a helper.
- Listening to and dispatching events is slightly verbose.
- Although not used in this study, event delegation seems hard to implement
  without code duplication.

Eliminating verbosity through build steps and a minimal set of helpers would
reduce the comparably low code size (see above) even further.

#### 5.2.3. The Bad

- Class names share a global namespace.
- Event names share a global namespace.
  - Especially problematic for events that bubble up.
- No syntax highlighting or code completion in HTML strings.
  - Can be mitigated with
    [es6-string-html](https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html)
- The separation between base HTML and dynamic rendering is not ideal when
  compared to JSX, for example.
- JSX/virtual DOM techniques provide much better development ergonomics.
- Reconciliation is verbose, brittle and repetitive. I wouldn't recommend the
  proposed technique without a well-tested helper function, at least.
- You have to remember mounting behaviors correctly when creating new elements.
  It would be helpful to automate this somehow, e.g. watch elements of selector
  X (at all times) and ensure the desired behaviors are mounted once on them.
- No type safety. I've always been a proponent of dynamic languages but since
  TypeScript's type system provides the best of both worlds, I cannot recommend
  using it enough.
- We're effectively locked out of using NPM dependencies that don't provide
  browser-ready builds (ES modules or UMD).
- Most frameworks handle a lot of browser inconsistencies and continuously
  monitor regressions with extensive test suites. The cost of browser testing is
  possibly higher when using a vanilla approach.

---

Besides the issues described above, I believe the codebase is well organized and
there are clear paths for bugfixes and feature development. Since there's no
third party code, bugs are easy to find and fix, and there are no dependency
limitations to work around.

A certain degree of DOM API knowledge is required but I believe this should be a
goal for any web developer.

### 5.3. Generality of Patterns

Assessing the generality of the discovered techniques objectively is not really
possible without production usage. From my experience, however, I can't imagine
any scenario where mount functions, event-based data flow etc. are not
applicable. The underlying principles power the established frameworks, after
all:

- State is separated from the DOM (React, Angular, Vue).
- Rendering is idempotent and complete (React's pure `render` function).
- One-way data flow (React)

An open question is if these patterns hold for library authors. Although not
considered during the study, some observations can be made:

- The JavaScript itself would be fine to share as ES modules.
- Event naming needs great care, as dispatching (bubbling) events from imported
  behaviors can trigger parent listeners in consumer code.
  - Can be mitigated by providing options to prefix or map event names.
- CSS names share a global namespace and need to be managed as well.
  - Can also be mitigated by prefixing, however making the JavaScript a bit more
    complex.

## 6. Conclusion

The result of this study is a working to-do application with decent UI/UX and
most of the functionality of the original TeuxDeux app, built using only
standard web technologies. It comes with better overall performance at a
fraction of the code size and bandwidth.

The codebase seems manageable through a handful of simple concepts, although it
is quite verbose and even messy in some areas. This could be mitigated by a
small number of helper functions and simple build steps (e.g. SCSS and
TypeScript).

The study's method helped discovering patterns and techniques that are at least
on par with a framework-based approach for the given subject, without
accidentally building a custom framework.

A notable exception to the latter is rendering variable numbers of elements in a
concise way. I was unable to eliminate the verbosity involved in basic but
efficient reconciliation. Further research is needed in this area, but for now
this appears to be a valid candidate for a (possibly external) general-purpose
utility.

When looking at the downsides, remember that all of the individual parts are
self-contained, highly decoupled, portable, and congruent to the web platform.
The implementation cannot "rust", by definition, as no dependencies can become
out of date.

Another thought to be taken with a grain of salt: I believe frameworks make
simple tasks even simpler, but hard tasks (e.g. implementing cross-cutting
concerns or performance optimizations) often more difficult.

---

Setting some constraints up-front forced me to challenge my assumptions and
preconceptions about vanilla web development. It was quite liberating to avoid
general-purpose utilities and get things done with what's readily available.

While I think the study is relatively complete, there's always more to explore.
[Ideas, questions, bug reports](https://github.com/morris/vanilla-todo/issues)
and pull requests are more than welcome!

Finally, this case study does not question using dependencies, libraries or
frameworks in general&mdash;code sharing is an essential part of software
engineering. It was a constrained experiment designed to discover novel methods
for vanilla web development and, hopefully, inspire innovation and further
research in the area.

## 7. Beyond Vanilla

As detailed in the assessment, the result of the case study could be
significantly improved if build steps and helpers were allowed. Beyond the
strict rules I've used in this experiment, here are a few ideas I'd like to see
explored in the future:

- Run another case study with TypeScript, SCSS, and build steps (seems
  promising).
  - _See [Vanilla Prime](https://github.com/morris/vanilla-prime)._
- Extrapolate deep utility functions (e.g. `reconcile()`) to mitigate some of
  the discovered downsides.
  - _See [exdom](https://github.com/morris/exdom)._
- Experiment with architectures based on virtual DOM rendering and standard DOM
  events.
- Compile discovered rules, patterns and techniques into a comprehensive guide.
  - _See [Vanilla Prime](https://github.com/morris/vanilla-prime)._

Case studies constrained by a set of formal rules are an effective way to find
new patterns and techniques in a wide range of domains. I'd love to see similar
experiments in the future

## 8. Appendix

### 8.1. Links

General resources I've used extensively:

- [MDN Web Docs](https://developer.mozilla.org) as a reference for DOM APIs
- [Can I use...](https://caniuse.com) as a reference for browser support
- [React](https://reactjs.org) as inspiration for the architecture

Useful articles regarding FLIP animations:

- [FLIP Your Animations (aerotwist.com)](https://aerotwist.com/blog/flip-your-animations)
- [Animating Layouts with the FLIP Technique (css-tricks.com)](https://css-tricks.com/animating-layouts-with-the-flip-technique)
- [Animating the Unanimatable (medium.com)](https://medium.com/developers-writing/animating-the-unanimatable-1346a5aab3cd)

Projects I've inspected for drag & drop architecture:

- [React DnD](https://github.com/react-dnd/react-dnd/)
- [react-beautiful-dnd](https://github.com/atlassian/react-beautiful-dnd)
- [dragula](https://github.com/bevacqua/dragula)

Useful VSCode extensions:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)
- [es6-string-html](https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html)

### 8.2. Response

#### 12/2023

- [Lobsters](https://lobste.rs/s/jofho9/case_study_on_vanilla_web_development)

#### 10/2020

- Trending on [Hacker News](https://news.ycombinator.com/item?id=24893247)
- [Lobsters](https://lobste.rs/s/5gcrxh/case_study_on_vanilla_web_development)
- [@desandro (Twitter)](https://twitter.com/desandro/status/1321095247091433473)
  (developer for the original TeuxDeux)
- [Reddit](https://www.reddit.com/r/javascript/comments/jj10k9/vanillatodo_a_case_study_on_viable_techniques_for/)

Thanks!

## 9. Changelog

### 12/2024

- Add dark mode
- Add Playwright config for testing more browsers
- Scroll automatically when dragging items at the window border
- Improve drag and drop behavior on touch devices
- Update dependencies

### 08/2024

- Link to [Vanilla Prime](https://github.com/morris/vanilla-prime)
- Link to [exdom](https://github.com/morris/exdom)
- Update dependencies

### 06/2024

- Use [s4d](https://github.com/morris/s4d) as local development server
- Run pipeline checks for pull requests
  ([#13](https://github.com/morris/vanilla-todo/issues/13))
- Move past items to today when not done
  ([#14](https://github.com/morris/vanilla-todo/issues/14))
- Update dependencies

### 01/2024

- Add [web app manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- Fix merged [code coverage](#431-code-coverage) from end-to-end and unit tests
- Remove FPS counter

### 12/2023

- Add [debugging section](#45-debugging)
- Redesign with CSS variables
- Add GitHub action for running checks and deployment
- Edit closing section
- Update numbers

### 11/2023

- Add [tooling section](#4-tooling)
- Refactor business logic into pure functional module
- Add support for [code coverage](#431-code-coverage)
- Add [local development server](#41-local-development-server) with live reload
- Fix some visual issues
- Update dependencies

### 05/2023

- Add basic testing
- Fix stylelint errors
- Update dependencies

### 08/2022

- Fix date seeking bug on Safari

### 05/2022

- Refactor for ES2020
- Refactor for event-driven communication exclusively
- Move original ES5-based version of the study to [/es5](./es5)
- Add assessment regarding library development
- Add date picker

### 01/2021

- Add [response section](#82-response)

### 10/2020

- Refactor for `dataset` ([#2](https://github.com/morris/vanilla-todo/issues/2))
  &mdash; [@opethrocks](https://github.com/opethrocks)
- Fix [#3](https://github.com/morris/vanilla-todo/issues/3) (navigation bug)
  &mdash; [@anchepiece](https://github.com/anchepiece),
  [@jcoussard](https://github.com/jcoussard)
- Fix [#4](https://github.com/morris/vanilla-todo/issues/4) (double item
  creation) &mdash; [@n0nick](https://github.com/n0nick)
- Fix [#1](https://github.com/morris/vanilla-todo/issues/4) (bad links) &mdash;
  [@roryokane](https://github.com/roryokane)
- Initial version
