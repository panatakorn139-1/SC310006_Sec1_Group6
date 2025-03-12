// Import Components
import * as components from './components'

// Import React Router
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Import Main CSS
import './App.css'

// Import Checkin & ScoreManagement
import Checkin from './components/Classroom/Checkin'
import ScoreManagement from './components/Classroom/ScoreManagement'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/SC310006_Sec1_Group6" element={<components.Login />} />
        <Route path='/SC310006_Sec1_Group6/signup' element={<components.Signup />} />
        <Route path='/SC310006_Sec1_Group6/dashboard' element={<components.Dashboard />} />
        <Route path='/SC310006_Sec1_Group6/profile' element={<components.Profile />} />
        <Route path='/SC310006_Sec1_Group6/classroom/:cid' element={<components.ManageClassroom />} />
        <Route path='/SC310006_Sec1_Group6/add-classroom' element={<components.AddClassroom />} />
        <Route path="/SC310006_Sec1_Group6/classroom/:cid/checkin" element={<Checkin />} /> 
        <Route path="/SC310006_Sec1_Group6/classroom/:cid/scores" element={<ScoreManagement />} />
      </Routes>
    </Router>
  )
}

export default App
