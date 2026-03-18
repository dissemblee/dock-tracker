import styled from "./FormTipsPanel.module.scss"

interface FormTipsPanelProps {
  show: boolean;
  title: string;
  tips: string[];
  variant?: 'default' | 'warning' | 'success' | 'info';
  icon?: React.ReactNode;
}

export const FormTipsPanel = ({ 
  show, 
  title, 
  tips,
  variant = 'default',
  icon = '✨'
}: FormTipsPanelProps) => {
  return (
    <div className={`${styled.tipsPanel} ${styled[variant]} ${show ? styled.show : styled.hide}`}>
      <h3>
        <span className={styled.icon}>{icon}</span>
        {title}
      </h3>
      <ul>
        {tips.map((tip, index) => (
          <li key={index}>{tip}</li>
        ))}
      </ul>
    </div>
  )
}