import { Input as AntInput } from "antd";
import type { InputProps } from "antd";

export type AppInputProps = InputProps;

export function Input({ allowClear = true, size = "large", ...rest }: AppInputProps) {
  return <AntInput allowClear={allowClear} size={size} {...rest} />;
}
