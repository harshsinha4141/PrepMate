import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';
import { UserStatsProvider } from './context/UserStatsContext';

const frontendApi = "pk_test_cnVsaW5nLWVhZ2xlLTIzLmNsZXJrLmFjY291bnRzLmRldiQ";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={frontendApi} navigate={(to) => {
    // handle redirects after sign in / sign up
    window.history.pushState(null, '', to);
  }}>
      <BrowserRouter>
      <UserStatsProvider>
        <App />
      </UserStatsProvider>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
);
