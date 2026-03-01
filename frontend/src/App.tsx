import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import LoginPage from './features/auth/components/LoginPage'
import RegisterPage from './features/auth/components/RegisterPage'
import ProtectedRoute from './features/auth/components/ProtectedRoute'
import AssessmentManagement from './features/assessment/components/AssessmentManagement'
import MainLayout from './components/layout/MainLayout'
import CandidateInterviewLive from './features/interview/components/CandidateInterviewLive'
import CandidateManagementPage from './features/candidate/CandidateManagementPage'
import EvaluationReportPage from './features/evaluation/EvaluationReportPage'

function App() {
  const location = useLocation()

  // Full-screen routes that don't use the MainLayout
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register'
  const isInterviewRoute = location.pathname === '/interview'

  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  if (isInterviewRoute) {
    return (
      <Routes>
        <Route path="/interview" element={<CandidateInterviewLive />} />
        <Route path="*" element={<Navigate to="/interview" replace />} />
      </Routes>
    )
  }

  return (
    <MainLayout>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AssessmentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments"
          element={
            <ProtectedRoute>
              <AssessmentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidates"
          element={
            <ProtectedRoute>
              <CandidateManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluation/:sessionId"
          element={
            <ProtectedRoute>
              <EvaluationReportPage />
            </ProtectedRoute>
          }
        />
        <Route path="/interviews" element={<div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Interview Management Module Coming Soon</div>} />
        <Route path="/settings" element={<div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Platform Settings Coming Soon</div>} />
        {/* Default redirect for authenticated area */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  )
}

export default App
