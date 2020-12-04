import NavBar from '../components/NavBar';
import Upload from '../components/Upload';
import AllInputs from '../components/AllInputs';

import '../css/app.css';

function FaceApp() {
  return (
    <div className="App">
        <header className="App-header">
            <NavBar />  
            <Upload />
            <AllInputs />
            <a href="url">hello</a>
        </header>
    </div>
  );
}

export default FaceApp;
