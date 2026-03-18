import { FiArrowLeft } from "react-icons/fi"
import styled from "./FormWrapSection.module.scss"
import { useState, type ReactNode } from "react";
import { FormTipsButton } from "@shared/ui/FormTipsButton";
import { FormTipsPanel } from "@shared/ui/FormTipsPanel";
import { useNavigate } from "react-router";

interface FormWrapSectionProps {
  title: string;
  tipsTitle: string;
  tips: string[];
  children: ReactNode;
}

export const FormWrapSection = (props: FormWrapSectionProps) => {
  const navigate = useNavigate();
  const [showTips, setShowTips] = useState(false);

  return (
    <section className={styled.FormWrapSection}>
      <div className={styled.header}>
        <button onClick={() => navigate(-1)} className={styled.goBack}>
          <FiArrowLeft /> Назад
        </button>

        <h1>{props.title}</h1>

        <FormTipsButton
          onClick={() => setShowTips(!showTips)}
          className={styled.infoButton}
        />
      </div>

      <FormTipsPanel
        show={showTips}
        title={props.tipsTitle}
        tips={props.tips}
      />

      {props.children}
    </section>
  )
}