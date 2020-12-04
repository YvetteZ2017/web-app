import React from 'react';
import List from './List';

class NavBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            menuOpened: false
        };
    }

    onClick(event) {
        this.setState({ menuOpened: !this.state.menuOpened });
    }

    render() {
        const cl = this.state.menuOpened ? 'menu-opened' : 'menu-closed';
        const clickHandler = (event) => this.onClick(event);

        return (
            <div className={cl}>
                <nav className="site-nav">
                <List/>
                </nav>
                <button type="button" className="btn-menu" onClick={clickHandler}>
                <span>Menu</span>
                </button>
            </div>
        );
    }
}

export default NavBar;