import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Ensure correct import of react-router-dom
import ProblemList from './components/ProblemList';
import ProblemDetails from './components/ProblemDetails';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'bootstrap/dist/js/bootstrap.bundle.min'; // Import Bootstrap JS (with Popper.js)

function App() {
    return ( <
        div className = "App" > { /* Define the routes for ProblemList and ProblemDetails */ } <
        Routes >
        <
        Route path = "/"
        element = { < ProblemList / > }
        /> <
        Route path = "/problem/:id"
        element = { < ProblemDetails / > }
        /> <
        /Routes> <
        /div>
    );
}

export default App;