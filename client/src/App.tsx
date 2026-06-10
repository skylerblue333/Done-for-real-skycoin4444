import { Router, Route } from 'wouter';
import { VoiceCommands } from './components/VoiceCommands';
import { Navigation } from './components/Navigation';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Router>
      <Navigation />
      <VoiceCommands />
      <Route path="/" component={Home} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/:rest*" component={NotFound} />
    </Router>
  );
}
