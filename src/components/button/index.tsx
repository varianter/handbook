import { and } from 'src/utils/css';
import style from './button.module.css';

export type ButtonProps = {
  mode?: 'primary' | 'secondary';
} & JSX.IntrinsicElements['button'];
export default function Button({
  children,
  mode = 'primary',
  ...props
}: ButtonProps) {
  const className = and(
    style.button,
    props['aria-selected'] ? style['button--selected'] : undefined,
    style[`button--${style[mode]}`],
    props.className,
  );
  return (
    <button className={className} type="button" {...props}>
      {children}
    </button>
  );
}
