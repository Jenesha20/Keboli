import './App.css'
import { Link, Route, Routes } from 'react-router-dom'
import LoginPage from './features/auth/components/LoginPage'
import ProtectedRoute from './features/auth/components/ProtectedRoute'
import AssessmentManagement from './features/assessment/components/AssessmentManagement';
import { useAuth } from './features/auth/hooks/useAuth'
import CandidateInterviewLive from './features/interview/components/CandidateInterviewLive';

function App() {

  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-indigo-600">Keboli</span>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/interview" element={<CandidateInterviewLive /> } />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold">Dashboard</div>
                      <div className="text-sm text-gray-600">Signed in as {user?.email}</div>
                    </div>
                    <button className="border rounded px-3 py-1" onClick={() => logout()}>
                      Logout
                    </button>
                  </div>
                  <div className="mt-6">
                    <Link className="underline" to="/">Home</Link>
                  </div>
                  <AssessmentManagement />
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
