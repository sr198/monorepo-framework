import { Route, Routes, Link } from 'react-router-dom';
import { TicketForm } from '../components/TicketForm';
import { TicketList } from '../components/TicketList';
import styles from './app.module.css';

export function App() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🎫 Workalaya Ticketing System</h1>
        <p>Enterprise Ticketing Platform with AI Integration</p>
      </header>

      <nav className={styles.nav}>
        <Link to="/" className={styles.navLink}>
          Dashboard
        </Link>
        <Link to="/create" className={styles.navLink}>
          Create Ticket
        </Link>
        <Link to="/tickets" className={styles.navLink}>
          All Tickets
        </Link>
      </nav>

      <main className={styles.main}>
        <Routes>
          <Route
            path="/"
            element={
              <div className={styles.welcome}>
                <h2>Welcome to Workalaya</h2>
                <p>
                  Your intelligent ticketing platform powered by AI and
                  microservices!
                </p>

                <div className={styles.features}>
                  <div className={styles.feature}>
                    <h3>🎯 Smart Analysis</h3>
                    <p>
                      AI-powered ticket classification, sentiment analysis, and
                      routing
                    </p>
                  </div>
                  <div className={styles.feature}>
                    <h3>🚀 Modern Stack</h3>
                    <p>
                      React frontend, Node.js & Python microservices, gRPC
                      communication
                    </p>
                  </div>
                  <div className={styles.feature}>
                    <h3>⚡ Real-time</h3>
                    <p>
                      Live updates, webhook integration, and instant AI insights
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex gap-4 justify-center">
                  <Link
                    to="/create"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    🚀 Create Your First Ticket
                  </Link>
                  <Link
                    to="/tickets"
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    📋 View All Tickets
                  </Link>
                </div>
              </div>
            }
          />
          <Route
            path="/create"
            element={
              <div className={styles.page}>
                <TicketForm
                  onSuccess={() => {
                    // Could navigate to tickets list or show success message
                    window.location.hash = '/tickets';
                  }}
                />
              </div>
            }
          />
          <Route
            path="/tickets"
            element={
              <div className={styles.page}>
                <TicketList />
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
