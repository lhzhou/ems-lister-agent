import { Input } from "antd";
import type { TextAreaProps } from "antd/es/input";

export type AppTextAreaProps = TextAreaProps;

export function TextArea({ size = "large", ...rest }: AppTextAreaProps) {
  return <Input.TextArea size={size} {...rest} />;
}
