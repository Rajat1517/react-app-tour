# React Tour Walk

A lightweight, customizable guided tour component for React applications. Highlight elements, show step-by-step popups, and help users onboard or discover features interactively.

## Features
- Step-by-step guided tours
- Highlight any React element
- Customizable popup content and styles
- Route-aware (works with React Router)
- Easy integration and extensibility

## Installation
```bash
npm install react-tour-walk
```

## Usage
```tsx
import Tour, { TourPopup, Highlighter, TourRoute } from 'react-tour-walk';

const steps = [
  { title: 'Welcome', content: 'This is the first step!' },
  { title: 'Feature', content: 'Highlight a feature here.' },
];

function App() {
  return (
    <Tour steps={steps} id="main-tour">
      <Highlighter passedStep={0}>
        <button>Click me</button>
        <TourPopup passedStep={0} />
      </Highlighter>
      <Highlighter passedStep={1}>
        <div>Some feature</div>
        <TourPopup passedStep={1} />
      </Highlighter>
    </Tour>
  );
}
```

## API
- `<Tour steps={steps} id="unique-id">` — Wrap your app or section to enable the tour context.
- `<Highlighter passedStep={n}>` — Wrap elements to highlight for a given step.
- `<TourPopup passedStep={n}>` — Show a popup for a given step.
- `<TourRoute>` — Optional, for route-aware tours.

- `<Title/>` , `<Content/>` — Proxy Components for accessing current tour title and content
- `<TourButtonBack/>`,`<TourButtonNext/>`, `<TourButtonFinish/>` — Button wrappers with necessary default logic, behaviour can be customised with handler props 
- `useTourNavigate` — Optional, for route navigation in tour mode
- `useTour` — Hook for retrieving current tour states for custom logic


## Customization
- The library give full liberty for customization starting from default components to navigatino handlers. 
- The components come with some default styling which can be overriden with custom styling
- Extend step objects with custom fields as needed.

## License
MIT

## Author
Rajat Mishra
