import Button from '@material-ui/core/Button';
import FaceIcon from '@material-ui/icons/Face';

import SignIn from './components/SignIn'
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="App-logo" alt="logo">
          <FaceIcon style={{ fontSize: 200 }}/>
        </div>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <SignIn />
      <Button variant="contained" color="primary">
        Signup
      </Button>
    </div>
  );
}

export default App;
