import { Select as AntSelect } from "antd";
import type { SelectProps } from "antd";
import { CONTROL_SIZE } from "@/src/app/control-size";

export type AppSelectProps = SelectProps;

export function Select({ allowClear = true, size = CONTROL_SIZE, ...rest }: AppSelectProps) {
  return <AntSelect allowClear={allowClear} size={size} {...rest} />;
}
