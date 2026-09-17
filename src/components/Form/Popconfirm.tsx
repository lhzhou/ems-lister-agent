import { Popconfirm as AntPopconfirm } from "antd";
import type { PopconfirmProps } from "antd";

export type AppPopconfirmProps = PopconfirmProps;

export function Popconfirm({ okText = "删除", cancelText = "取消", ...rest }: AppPopconfirmProps) {
  return <AntPopconfirm okText={okText} cancelText={cancelText} {...rest} />;
}
