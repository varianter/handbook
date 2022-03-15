import { and } from "src/utils/css";
import style from "./button.module.css";

type ButtonProps = {
  mode?: "primary" | "secondary";
} & JSX.IntrinsicElements["button"];
export default function LoginForm({
  children,
  mode = "primary",
  ...props
}: ButtonProps) {
  const className = and(style.button, style[`button--${style[mode]}`]);
  return (
    <button className={className} type="button" {...props}>
      {children}
    </button>
  );
}
