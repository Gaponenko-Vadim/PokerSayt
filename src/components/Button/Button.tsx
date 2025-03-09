import React from "react";
import { Link } from "react-router-dom";

interface ButtonProps {
  label: string;
  to: string;
}

const Button: React.FC<ButtonProps> = ({ label, to }) => {
  if (!to.startsWith("/")) {
    return (
      <a href={to}>
        <button>{label}</button>
      </a>
    );
  }

  return (
    <Link to={to}>
      <button>{label}</button>
    </Link>
  );
};

export default Button;
