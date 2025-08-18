// src/layouts/Layout.jsx  ← 교체
import Navigation from './Navigation.jsx';
import Footer from './Footer.jsx';

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Navigation />
      <main className="app-main">
        {children}
      </main>
      <Footer />
    </div>
  );
}
