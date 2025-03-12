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
        <Route path="/SC310006_Sec1_Group6/" element={<components.Login />} />
        <Route path='/SC310006_Sec1_Group6/signup' element={<components.Signup />} />
        <Route path='/SC310006_Sec1_Group6/dashboard' element={<components.Dashboard />} />
        <Route path='/SC310006_Sec1_Group6/profile' element={<components.Profile />} />
        <Route path='/SC310006_Sec1_Group6/classroom/:cid' element={<components.ManageClassroom />} />
        <Route path='/SC310006_Sec1_Group6/add-classroom' element={<components.AddClassroom />} />
      </Routes>
    </Router>
  )
}

export default App
