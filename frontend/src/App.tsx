
import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/hello')
        .then((response) => response.text())
        .then((data) => setMessage(data))
        .catch((error) => console.error(error));
  }, []);

  return (
      <main>
        <h1>My Portfolio</h1>
        <p>{message}</p>
      </main>
  );
}

export default App;
