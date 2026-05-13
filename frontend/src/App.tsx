import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
