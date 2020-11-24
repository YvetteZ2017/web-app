import NavBar from '../components/NavBar';
import Upload from '../components/Upload';
import Inputs from '../components/Inputs';

import '../css/app.css';

function FaceApp() {
  return (
    <div className="App">
      <header className="App-header">
      <NavBar />  
      <Upload />
      <Inputs />
      </header>
    </div>
  );
}

export default FaceApp;
