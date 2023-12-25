[⬅️ Back](../../../README.md)

# State Management

State is used to store and share lightweight data between screens and components.

We use [redux](https://redux-toolkit.js.org/) as it's:
- widespread
- simple enough
- has good documentation and toolkit

To receive better experience use following recommendations:
- do not store big arrays ( 50+ items ) or complex objects in store - better use async storage for it
- several small stores work better than one huge storage
- use local state inside components and screens if data not reusable in other places
- keep it simple
