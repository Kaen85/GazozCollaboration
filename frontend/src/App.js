// En üstte importlar
import React, { useEffect, useState } from "react";
import api from './services/api';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/')
      .then(res => setMessage(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600">{message}</h1>
    </div>
  );
}

export default App;
