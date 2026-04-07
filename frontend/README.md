# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


 "dependencies": {
    "@react-three/drei": "^10.7.7",
    "@react-three/fiber": "^9.5.0",
    "@react-three/postprocessing": "^3.0.4",
    "@types/three": "^0.183.1",
    "framer-motion": "^12.34.3",
    "gsap": "^3.14.2",
    "lucide-react": "^0.575.0",
    "postprocessing": "^6.38.3",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-icons": "^5.6.0",
    "react-router-dom": "^7.14.0",
    "three": "^0.160.0"
  }