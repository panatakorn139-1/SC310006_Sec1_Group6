// Import Components
import * as components from './components'

// Import React Router
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Import Main CSS
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<components.Login />} />
        <Route path='/signup' element={<components.Signup />} />
        <Route path='/dashboard' element={<components.Dashboard />} />
        <Route path='/profile' element={<components.Profile />} />
        <Route path='/classroom/:cid' element={<components.ManageClassroom />} />
        <Route path='/add-classroom' element={<components.AddClassroom />} />
        <Route path='/classroom/:cid/checkin/:cno' element={<components.CheckinClassroom />} />
      </Routes>
    </Router>
  )
}

export default App
