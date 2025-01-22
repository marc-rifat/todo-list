import React from 'react';
import PropTypes from 'prop-types';

function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        {children}
      </div>
    </div>
  );
}

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthLayout; 