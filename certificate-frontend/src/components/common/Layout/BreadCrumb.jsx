import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-gray-700 hover:text-blue-600">
            <i className="fas fa-home mr-2"></i>
            Dashboard
          </Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
          return (
            <li key={name} className="inline-flex items-center">
              <i className="fas fa-chevron-right text-gray-400 mx-2"></i>
              {isLast ? (
                <span className="text-sm font-medium text-gray-500 capitalize">
                  {name.replace(/-/g, ' ')}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  className="text-sm text-gray-700 hover:text-blue-600 capitalize"
                >
                  {name.replace(/-/g, ' ')}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;