import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { LangProvider } from './contexts/LangContext'
import HomePage from './pages/HomePage'
import WhoPage from './pages/WhoPage'
import WhatPage from './pages/WhatPage'
import WhatDetailPage from './pages/WhatDetailPage'
import HowPage from './pages/HowPage'
import HowDetailPage from './pages/HowDetailPage'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/ko" replace />} />
        <Route path="/:lang" element={<LangProvider />}>
          <Route index element={<HomePage />} />
          <Route path="who" element={<WhoPage />} />
          <Route path="what" element={<WhatPage />} />
          <Route path="what/:id" element={<WhatDetailPage />} />
          <Route path="how" element={<HowPage />} />
          <Route path="how/:slug" element={<HowDetailPage />} />
        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
