import { Select as AntSelect } from "antd";
import type { SelectProps } from "antd";

export type AppSelectProps = SelectProps;

export function Select({ allowClear = true, size = "large", ...rest }: AppSelectProps) {
  return <AntSelect allowClear={allowClear} size={size} {...rest} />;
}
