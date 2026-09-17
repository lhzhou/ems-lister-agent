import { Input } from "antd";
import type { TextAreaProps } from "antd/es/input";
import { CONTROL_SIZE } from "@/src/app/control-size";

export type AppTextAreaProps = TextAreaProps;

export function TextArea({ size = CONTROL_SIZE, ...rest }: AppTextAreaProps) {
  return <Input.TextArea size={size} {...rest} />;
}
