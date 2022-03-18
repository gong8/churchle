import { FC } from "react";
import "./Modal.css";

interface ModalProps {
  active: boolean;
  onClose: () => void;
  text: string;
}

export const Modal: FC<ModalProps> = ({ active, onClose, text }) => {
  if (!active) return null;

  return (
    <div className="wrapper">
      <div className="modal">
        <p className="text">{text}</p>
        <div className="button" onClick={onClose}>
          Close
        </div>
      </div>
    </div>
  );
};
