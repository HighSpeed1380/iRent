import { NotificationContainer } from 'react-notifications';
import Navigation from './components/Navigation';
import ReactTooltip from 'react-tooltip';
import Modal from 'react-modal';

import './Assets/scss/reactifyCss';
import './App.css';

Modal.setAppElement('#root');

function App() {
  return (
    <>
      <Navigation />
      <NotificationContainer />
      <ReactTooltip />
    </>
  )
}

export default App;
