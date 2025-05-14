import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from './context/auth'
import { usePathContext } from './context/path'
import { ROLES } from './config/roles'
import PersistLogin from './components/PersistLogin'
import RequireAuth from './components/RequireAuth'
import RequireRoles from './components/RequireRoles'
import TokenHandler from './components/TokenHandler'
import AuthDebugger from './components/AuthDebugger'
import Recaptcha from './pages/Recaptcha'
import Signup from './pages/Signup'
import Activate from './pages/auth/Activate'
import VerifyEmail from './pages/auth/recover-password/VerifyEmail'
import Navbar from './components/Navbar'
// Status component removed
import Add from './components/notes/Add'
import Edit from './components/notes/Edit'
import View from './components/notes/View'
import Home from './pages/Home'
import TokenLogin from './pages/TokenLogin'
import Note from './pages/Note'
import WorkingHours from './pages/WorkingHours'
import Task from './pages/Task'
import User from './pages/User'
import Assign from './pages/Assign'
import Error from './pages/error/Error'
import NotFound from './pages/error/NotFound'
import io from 'socket.io-client'

// This component decides whether to show TokenLogin or Home based on URL
const HomeRouter = () => {
  const location = useLocation();
  return location.search?.includes('token=') ? <TokenLogin /> : <Home />;
};

function App() {
  const { auth } = useAuthContext()
  const { link } = usePathContext()
  
  useEffect(() => {
    if (auth?.accessToken) {
      const socket = io(process.env.REACT_APP_SOCKET_URL)
      socket.emit('online', auth._id)

      return () => {
        socket.disconnect()
      }
    }
  }, [auth])

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className="mt-5 pt-3">
          {/* Status component removed */}
          
          <div className="container my-4">
            <Routes>
              {/* Use HomeRouter component to handle token in URL */}
              <Route path="/" element={<HomeRouter />} />
              <Route path="/activate/:activation_token" element={<Activate />} />
              <Route path="/recover-password" element={<VerifyEmail />} />

              <Route element={<PersistLogin />}>
                <Route path="/login" element={!auth ? <Recaptcha /> : <Navigate to={link} />} />
                <Route path="/signup" element={!auth ? <Signup /> : <Navigate to="/" />} />

                <Route element={<RequireAuth />}>
                  <Route element={<RequireRoles Roles={[...Object.values(ROLES)]} />}>
                    <Route path="/task" element={<Task />} />
                    <Route path="/note" element={<Note />} />
                    <Route path="/note/view/:id" element={<View />} />
                    <Route path="/note/add" element={<Add />} />
                    <Route path="/note/edit/:id" element={<Edit />} />
                    <Route path="/working-hours" element={<WorkingHours />} />
                    <Route path="/sleep" element={<Navigate to="/working-hours" replace />} />
                  </Route>

                  <Route element={<RequireRoles Roles={[ROLES.Root, ROLES.Admin]} />}>
                    <Route path="/user" element={<User />} />
                    <Route path="/assign" element={<Assign />} />
                  </Route>
                </Route>
              </Route>
              
              <Route path="/error" element={<Error />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
        <AuthDebugger />
      </BrowserRouter>
    </div>
  )
}

export default App