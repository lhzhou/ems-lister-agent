import { Input } from "antd";
import type { PasswordProps } from "antd/es/input";
import { CONTROL_SIZE } from "@/src/app/control-size";

export type AppPasswordProps = PasswordProps;

export function Password({ size = CONTROL_SIZE, ...rest }: AppPasswordProps) {
  return <Input.Password size={size} {...rest} />;
}
