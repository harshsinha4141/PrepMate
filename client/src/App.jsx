import React from 'react';
import Route from './routing/Route';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <div>
      <Route />
      <ToastContainer /> {/* Shows all toast notifications */}
    </div>
  )
}

export default App;
