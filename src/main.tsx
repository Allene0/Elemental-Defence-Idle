import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './Layout/App.tsx'
import 'semantic-ui-css/semantic.min.css';
import "./Layout/style.css"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
