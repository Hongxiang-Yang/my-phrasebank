import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { AddPhrase } from './pages/AddPhrase';
import { CategoryBrowser } from './pages/CategoryBrowser';
import { SettingsPage } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="add" element={<AddPhrase />} />
          <Route path="browse" element={<CategoryBrowser />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
