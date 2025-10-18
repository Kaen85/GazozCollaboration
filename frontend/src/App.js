import { useEffect, useState } from "react";
import api from './services/api';
import './App.css';

function App() {
   const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/').then(res => setMessage(res.data));
  }, []);

  return <h1>{message}</h1>
}

export default App;
