import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegistrationForm from "./components/RegistrationForm";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <Routes>
          <Route path="/" element={<RegistrationForm />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
