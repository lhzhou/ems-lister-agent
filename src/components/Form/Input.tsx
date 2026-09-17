import { Input as AntInput } from "antd";
import type { InputProps } from "antd";
import { CONTROL_SIZE } from "@/src/app/control-size";

export type AppInputProps = InputProps;

export function Input({ allowClear = true, size = CONTROL_SIZE, ...rest }: AppInputProps) {
  return <AntInput allowClear={allowClear} size={size} {...rest} />;
}
