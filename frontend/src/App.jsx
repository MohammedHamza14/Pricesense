import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Sales from './pages/Sales'
import ImportData from './pages/ImportData'

function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('pricesense-theme')
    return saved || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('pricesense-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <Layout theme={theme} toggleTheme={toggleTheme}>
      <Routes>
        <Route path="/"         element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/sales"    element={<Sales />} />
        <Route path="/import"   element={<ImportData />} />
      </Routes>
    </Layout>
  )
}

export default App