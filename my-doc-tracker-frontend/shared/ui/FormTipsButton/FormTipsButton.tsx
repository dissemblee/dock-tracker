import { FiInfo } from "react-icons/fi";

interface FormTipsButtonProps {
  onClick: () => void;
  className?: string;
}

export const FormTipsButton = ({ onClick, className }: FormTipsButtonProps) => {
  return (
    <button className={className} onClick={onClick}>
      <FiInfo />
    </button>
  )
}
