import React from 'react';
import { routes } from '../../routes'; // Ensure the path to routes is correct

export const NavDesktop = () => {
  return (
    <ul style={{ display: 'flex', listStyle: 'none', justifyContent: 'space-around', padding: 0 }}>
      {routes.map((route) => (
        <li key={route.title} style={{ padding: '10px' }}>
          <a href={route.href} style={{ textDecoration: 'none', color: 'black', display: 'flex', alignItems: 'center' }}>
            {route.Icon && <route.Icon style={{ marginRight: '5px' }} />}
            {route.title}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default NavDesktop;
