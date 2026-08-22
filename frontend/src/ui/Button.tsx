import React from "react";
import "../styles/button.css";
interface ButtonProps {
  children: React.ReactNode; //accepte tout(les textes,icone,image etc)
  style?: React.CSSProperties;
  className?: string;
  type?: "submit" | "reset" | "button";
  disabled?: boolean; //activer/desactiver
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; //EXECUTE une action mais ne retourne rien
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  type,
  style,
  disabled = false,
  onClick,
  onMouseDown,
}) => {
  return (
    <button
      className={`btn ${className}`}
      style={style}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      {children}
    </button>
  );
};

export default Button;
