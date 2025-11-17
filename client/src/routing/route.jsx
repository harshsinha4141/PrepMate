import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Landing from '../pages/Landing';
import Credentials from '../pages/credentials';
import Home from '../pages/Home';
import InterviewerMeetings from '../pages/InterviewerMeetings';
import BookMeetingPage from '../pages/BookMeetingPage';
import InterviewerPage from '../pages/InterviewerPage';
import IntervieweeMeetings from '../pages/IntervieweeMeetings';
import MeetingDetails from '../pages/MeetingDetails';
import MeetingChat from '../pages/MeetingChat';
import VideoRoom from '../pages/VideoRoom';
import ReviewForm from '../pages/ReviewForm';
import Profile from '../pages/Profile';
const RouteComponent = () => {
  // Simple client-side guard: check for stored token
  const ProtectedRoute = ({ children }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return <Navigate to="/credentials" replace />;
      return children;
    } catch (e) {
      return <Navigate to="/credentials" replace />;
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/home"
        element={<ProtectedRoute><Home /></ProtectedRoute>}
      />
      <Route path="/credentials" element={<Credentials />} />
      <Route
        path="/interviewer"
        element={<ProtectedRoute><InterviewerPage /></ProtectedRoute>}
      />
      <Route
        path="/profile"
        element={<ProtectedRoute><Profile /></ProtectedRoute>}
      />
      <Route
        path="/interviewerprofile/:type"
        element={<ProtectedRoute><InterviewerMeetings /></ProtectedRoute>}
      />
      <Route
        path="/interviewee"
        element={<ProtectedRoute><BookMeetingPage /></ProtectedRoute>}
      />
      <Route
        path="/intervieweeprofile/:type"
        element={<ProtectedRoute><IntervieweeMeetings /></ProtectedRoute>}
      />

      <Route
        path="/meeting/:id"
        element={<ProtectedRoute><MeetingDetails /></ProtectedRoute>}
      />
      <Route
        path="/chat/:meetingId"
        element={<ProtectedRoute><MeetingChat /></ProtectedRoute>}
      />
      <Route
        path="/video/:id"
        element={<ProtectedRoute><VideoRoom /></ProtectedRoute>}
      />
      <Route
        path="/review/:id"
        element={<ProtectedRoute><ReviewForm /></ProtectedRoute>}
      />
    </Routes>
  );
}

export default RouteComponent;
