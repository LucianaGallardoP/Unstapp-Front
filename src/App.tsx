import { LoginForm } from './features/auth';
import { TopBar } from './components/common/TopBar';

function App() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50">
      <TopBar />
      <div className="flex-1 flex items-center justify-center p-4">
        <LoginForm />
      </div>
    </div>
  );
}

export default App;
