import { FiPlus } from "react-icons/fi"
import { Button } from "../Button/Button"

export const ButtonCreate = () => {
  return (
    <Button nonBlock variant="primary">
      <FiPlus /> Создать
    </Button>
  )
}