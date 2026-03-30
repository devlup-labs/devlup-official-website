import { useState } from 'react'
import './App.css'
import axios from "axios";
import { useEffect } from "react";

function App() {

  useEffect(() => {
    axios.get("http://localhost:8000/test")
      .then(res => console.log(res.data))
      .catch(err => console.error("Error:", err));
  }, []);

  return <h1>Check Console</h1>;
}

export default App;
