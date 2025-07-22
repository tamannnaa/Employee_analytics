import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import EmpList from './components/Emplist'
import { AuthProvider, useAuth } from './context/Authcontext'
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

const ProtectedRoute=({children}:{children:React.ReactElement})=>{
  const context=useAuth();
  if(!context){
    throw new Error("Auth Context not found");
  }
  const {user,loading} =context;
  if(loading){
    return <p>Loading the page.</p>
  }
  if(!user){
    return <Login/>
  }
  return children;
}

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/' element={
             <ProtectedRoute>
              <Dashboard/>
             </ProtectedRoute> 
          }/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
