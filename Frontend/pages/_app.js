import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Dynamically import Bootstrap JS for components like modal/toast
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <>
      <Navbar />
      <main className="container py-4">
        <Component {...pageProps} />
      </main>
    </>
  );
}
