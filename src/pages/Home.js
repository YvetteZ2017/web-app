import { Link } from 'react-router-dom';

import FaceIcon from '@material-ui/icons/Face';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import NavBar from '../components/NavBar';

import '../css/app.css';


const useStyles = makeStyles((theme) => ({
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  }));

function Home() {
    const classes = useStyles();
    return (
        <div className="App">
            <header className="App-header">
            <NavBar />
            <div className="App-logo" alt="logo">
                <FaceIcon style={{ fontSize: 200 }}/>
            </div>
            <p>
                Face App
            </p>
            <Grid container spacing={2} className="Home-btn">
                <Grid item xs={12} sm={6}>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        <Link to={'/signin' }>Sign In</Link>
                    </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        to={'/signup'}
                    >
                        <Link to={'/signup'}>Sign Up</Link>
                    </Button>
                </Grid>
            </Grid>
            </header>
        </div>
    );
}

export default Home;
