import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import UploadPage from './pages/UploadPage.jsx';
import AgentDetailPage from './pages/AgentDetailPage.jsx';
import EditAgentPage from './pages/EditAgentPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import FeaturedPage from './pages/FeaturedPage.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/featured" element={<FeaturedPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/agent/:id/edit" element={<EditAgentPage />} />
        <Route path="/agent/:id" element={<AgentDetailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </>
  );
}