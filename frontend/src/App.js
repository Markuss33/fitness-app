import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Workouts from './pages/Workouts';
import Exercises from './pages/Exercises';
import WorkoutBuilder from './pages/WorkoutBuilder';
import WorkoutDetail from './pages/WorkoutDetail';
import UserProfile from './pages/UserProfile';
import PublicWorkouts from './pages/PublicWorkouts';
import PublicWorkoutDetail from './pages/PublicWorkoutDetail';
import ExerciseDetail from './pages/ExerciseDetail';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Все защищенные маршруты с Layout */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/workouts" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Workouts />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/exercises" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Exercises />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/workout-builder" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <WorkoutBuilder />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/workout-builder/:id" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <WorkoutBuilder />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/workout/:id" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <WorkoutDetail />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/public-workouts" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <PublicWorkouts />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/public-workouts/:id" 
              element={
                <ProtectedRoute>
                    <PublicWorkoutDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
              <ProtectedRoute>
                <Layout>
                  <UserProfile />
                </Layout>
              </ProtectedRoute>
              } 
            />
            <Route 
              path="/exercises/:id" 
              element={
              <ProtectedRoute>
                <ExerciseDetail />
              </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
console.log('Текущий URL:', window.location.href);
console.log('Hostname:', window.location.hostname);
export default App;