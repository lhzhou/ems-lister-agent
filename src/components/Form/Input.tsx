import { Input as AntInput } from "antd";
import type { InputProps } from "antd";

export type AppInputProps = InputProps;

export function Input({ allowClear = true, ...rest }: AppInputProps) {
  return <AntInput allowClear={allowClear} {...rest} />;
}
