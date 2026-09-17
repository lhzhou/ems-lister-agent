import { message } from "antd";

export type NotifyContent = string;

export const notify = {
  success(content: NotifyContent) {
    return message.success(content);
  },
  error(content: NotifyContent) {
    return message.error(content);
  },
  warning(content: NotifyContent) {
    return message.warning(content);
  },
  info(content: NotifyContent) {
    return message.info(content);
  },
};
