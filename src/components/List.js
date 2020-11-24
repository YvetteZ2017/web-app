import React from 'react';
import { Link } from 'react-router-dom';

const List = () => {
    const pages = [
        { url: '/', title: 'Home' },
        { url: '/app', title: 'App' },
        { url: '/signin', title: 'Signin' },
        { url: '/signup', title: 'Signup' },
    ];

    return (
      <ul>
        {
          pages.map((v, i) => (
            <li key={i}><Link to={v.url}>{v.title}</Link></li>
          ))
        }
      </ul>
    );
};

export default List;