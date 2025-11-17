import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { api } from './services/api';
import Layout from './components/Layout';
import Login from './pages/Login';
import AuditList from './pages/AuditList';
import NewAudit from './pages/NewAudit';
import AuditDetail from './pages/AuditDetail';
import AuditReport from './pages/AuditReport';
import NonConformityList from './pages/NonConformityList';
import NonConformityDetail from './pages/NonConformityDetail';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = api.getCurrentUser();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/audits" />} />
            <Route path="audits" element={<AuditList />} />
            <Route path="audits/new" element={<NewAudit />} />
            <Route path="audits/:id" element={<AuditDetail />} />
            <Route path="audits/:id/report" element={<AuditReport />} />
            <Route path="non-conformities" element={<NonConformityList />} />
            <Route path="non-conformities/:id" element={<NonConformityDetail />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
