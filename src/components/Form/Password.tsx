import { Input } from "antd";
import type { PasswordProps } from "antd/es/input";

export type AppPasswordProps = PasswordProps;

export function Password({ size = "large", ...rest }: AppPasswordProps) {
  return <Input.Password size={size} {...rest} />;
}
