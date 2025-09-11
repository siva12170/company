import React from 'react';
import Header from './components/Header';
import Auth from './pages/auth.jsx';
import PostTopic from './pages/PostTopic.jsx';
import AcceptTopics from './pages/AcceptTopics.jsx';
import Messaging from './pages/Messaging.jsx';
import Profile from './pages/profile.jsx';
import EditProfile from './pages/edit-profile.jsx';
import Problems from './pages/problems.jsx';
import CreateProblem from './pages/create-problem.jsx';
import MyProblems from './pages/my-problems.jsx';
import ProblemDetail from './pages/problem-detail.jsx';
import EditProblem from './pages/edit-problem.jsx';
import SubmissionsPage from './pages/SubmissionsPage.jsx';
import Home from './pages/home.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import CreatorDashboard from './pages/CreatorDashboard.jsx';
import Dashboard from './pages/dashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Contests from './pages/Contests.jsx';
import ContestDetail from './pages/ContestDetail.jsx';
import ContestLeaderboard from './pages/ContestLeaderboard.jsx';
import ContestProblem from './pages/ContestProblem.jsx';
import AdminContestCreate from './pages/AdminContestCreate.jsx';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import RouteWrapper from './components/RouteWrapper.jsx';
import { ToastProvider } from './components/Toast.jsx';
import About from './pages/About.jsx';
import Careers from './pages/Careers.jsx';
import Contact from './pages/Contact.jsx';

function AppContent() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className='App'>
      <Header />
      <div className="pt-20"> {/* Add top padding to prevent header overlap */}
        <Routes>
          <Route 
            path='/' 
            element={
              <RouteWrapper title="Home">
                <Home />
              </RouteWrapper>
            } 
          />
          <Route 
            path='/about' 
            element={
              <RouteWrapper title="About">
                <About />
              </RouteWrapper>
            } 
          />
          <Route 
            path='/careers' 
            element={
              <RouteWrapper title="Careers">
                <Careers />
              </RouteWrapper>
            } 
          />
          <Route 
            path='/contact' 
            element={
              <RouteWrapper title="Contact">
                <Contact />
              </RouteWrapper>
            } 
          />
          <Route 
            path='/auth' 
            element={
              <RouteWrapper title="Authentication">
                <Auth />
              </RouteWrapper>
            } 
          />
          <Route 
            path='/signup' 
            element={
              <RouteWrapper title="Sign Up">
                <Auth initialView="register" />
              </RouteWrapper>
            } 
          />
          <Route 
            path='/dashboard' 
            element={<PrivateRoute element={<Dashboard />} title="Dashboard" />} 
          />
          <Route 
            path='/profile' 
            element={<PrivateRoute element={<Profile />} title="Profile" />} 
          />
          <Route 
            path='/edit-profile' 
            element={<PrivateRoute element={<EditProfile />} title="Edit Profile" />} 
          />
          <Route 
            path='/problems' 
            element={<PrivateRoute element={<Problems />} title="Problems" />} 
          />
          <Route 
            path='/problem/:id' 
            element={<PrivateRoute element={<ProblemDetail />} title="Problem" />} 
          />
          <Route 
            path='/create-problem' 
            element={<PrivateRoute element={<CreateProblem />} title="Create Problem" />} 
          />
          <Route 
            path='/edit-problem/:id' 
            element={<PrivateRoute element={<EditProblem />} title="Edit Problem" />} 
          />
          <Route 
            path='/my-problems' 
            element={<PrivateRoute element={<MyProblems />} title="My Problems" />} 
          />
          <Route 
            path='/submissions' 
            element={<PrivateRoute element={<SubmissionsPage />} title="Submissions" />} 
          />
          <Route 
            path='/user-communication' 
            element={<PrivateRoute element={<UserDashboard user={{ _id: 'user1' }} />} title="User Communication" />} 
          />
          <Route 
            path='/creator-communication' 
            element={<PrivateRoute element={<CreatorDashboard user={{ _id: 'creator1' }} />} title="Creator Communication" />} 
          />
          <Route 
            path='/accept-topics' 
            element={<PrivateRoute element={<AcceptTopics />} title="Accept Topics" />} 
          />
          <Route 
            path='/post-topic' 
            element={<PrivateRoute element={<PostTopic />} title="Post Topic" />} 
          />
          <Route 
            path='/messages' 
            element={
              <RouteWrapper title="Messaging">
                <Messaging />
              </RouteWrapper>
            } 
          />
          {/* Admin Routes */}
          <Route 
            path='/admin' 
            element={<PrivateRoute element={<AdminDashboard />} title="Admin Dashboard" />} 
          />
          {/* Contest Routes */}
          <Route 
            path='/contests' 
            element={<PrivateRoute element={<Contests />} title="Contests" />} 
          />
          <Route 
            path='/contests/:contestId' 
            element={<PrivateRoute element={<ContestDetail />} title="Contest" />} 
          />
          <Route 
            path='/contests/:contestId/leaderboard' 
            element={<PrivateRoute element={<ContestLeaderboard />} title="Leaderboard" />} 
          />
          <Route 
            path='/contests/:contestId/problems/:problemId' 
            element={<PrivateRoute element={<ContestProblem />} title="Contest Problem" />} 
          />
          <Route
            path='/admin/contests/create'
            element={<PrivateRoute element={<AdminContestCreate />} title="Create Contest" />} 
          />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
