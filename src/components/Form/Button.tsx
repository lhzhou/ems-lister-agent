import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button as AntButton } from "antd";
import type { ButtonProps } from "antd";
import type { ReactNode } from "react";
import { CONTROL_SIZE } from "@/src/app/control-size";

export type AppButtonType =
  | "create"
  | "edit"
  | "delete"
  | "cancel"
  | "view"
  | "refresh"
  | "reset"
  | "primary"
  | "default"
  | "link"
  | "dashed"
  | "text";

export type AppButtonProps = Omit<ButtonProps, "type"> & {
  type?: AppButtonType;
};

export const BUTTON_TYPE_PRESETS: Record<
  AppButtonType,
  { antdType: ButtonProps["type"]; danger?: boolean; className?: string; icon?: ReactNode }
> = {
  create: { antdType: "primary", icon: <PlusOutlined /> },
  edit: { antdType: "link", className: "app-action-edit px-1", icon: <EditOutlined /> },
  delete: {
    antdType: "link",
    danger: true,
    className: "app-action-delete px-1",
    icon: <DeleteOutlined />,
  },
  cancel: { antdType: "default" },
  view: { antdType: "link", className: "app-action-view px-1", icon: <EyeOutlined /> },
  refresh: { antdType: "default", icon: <ReloadOutlined /> },
  reset: { antdType: "default" },
  primary: { antdType: "primary" },
  default: { antdType: "default" },
  link: { antdType: "link" },
  dashed: { antdType: "dashed" },
  text: { antdType: "text" },
};

export function Button({
  type = "default",
  icon,
  className,
  danger,
  size,
  ...rest
}: AppButtonProps) {
  const preset = BUTTON_TYPE_PRESETS[type] ?? BUTTON_TYPE_PRESETS.default;
  const resolvedSize =
    size ?? (preset.antdType === "link" || preset.antdType === "text" ? "middle" : CONTROL_SIZE);
  return (
    <AntButton
      type={preset.antdType}
      danger={danger ?? preset.danger}
      icon={icon === undefined ? preset.icon : icon}
      size={resolvedSize}
      className={[preset.className, className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
}
