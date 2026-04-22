import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import WhoPage from './pages/WhoPage'
import WhatPage from './pages/WhatPage'
import HowPage from './pages/HowPage'
import HowDetailPage from './pages/HowDetailPage'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/who" element={<WhoPage />} />
        <Route path="/what" element={<WhatPage />} />
        <Route path="/how" element={<HowPage />} />
        <Route path="/how/:slug" element={<HowDetailPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
