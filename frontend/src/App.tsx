import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import LoginPage from './features/auth/components/LoginPage'
import RegisterPage from './features/auth/components/RegisterPage'
import ProtectedRoute from './features/auth/components/ProtectedRoute'
import AssessmentManagement from './features/assessment/components/AssessmentManagement'
import DashboardPage from './features/dashboard/DashboardPage'
import MainLayout from './components/layout/MainLayout'
import CandidateInterviewLive from './features/interview/components/CandidateInterviewLive'
import CandidateManagementPage from './features/candidate/CandidateManagementPage'
import EvaluationReportPage from './features/evaluation/EvaluationReportPage'

import InterviewWelcomePage from './features/interview/components/InterviewWelcomePage'
import InterviewInstructionsPage from './features/interview/components/InterviewInstructionsPage'
import InterviewTechCheckPage from './features/interview/components/InterviewTechCheckPage'

function App() {
  const location = useLocation()

  // Full-screen routes that don't use the MainLayout
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register'
  const isCandidateFlow = location.pathname.startsWith('/candidate/') || location.pathname === '/interview'

  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  if (isCandidateFlow) {
    return (
      <Routes>
        <Route path="/candidate/welcome" element={<InterviewWelcomePage />} />
        <Route path="/candidate/instructions" element={<InterviewInstructionsPage />} />
        <Route path="/candidate/tech-check" element={<InterviewTechCheckPage />} />
        <Route path="/candidate/room" element={<CandidateInterviewLive />} />
        <Route path="/interview" element={<Navigate to={`/candidate/welcome${location.search}`} replace />} />
        <Route path="*" element={<Navigate to={`/candidate/welcome${location.search}`} replace />} />
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
              <DashboardPage />
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
