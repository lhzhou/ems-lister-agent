import { Modal as AntModal } from "antd";
import type { ModalProps } from "antd";

export type AppModalSize = "small" | "medium" | "large" | "xlarge";

export const MODAL_SIZE_WIDTH: Record<AppModalSize, number> = {
  small: 416,
  medium: 640,
  large: 880,
  xlarge: 1200,
};

export type AppModalProps = Omit<ModalProps, "width" | "maskClosable"> & {
  size?: AppModalSize;
};

function resolveMask(mask: ModalProps["mask"]) {
  if (mask === false) return false;
  if (mask === true || mask == null) return { closable: false };
  return { closable: false, ...mask };
}

export function Modal({
  size = "medium",
  centered = true,
  destroyOnHidden = true,
  mask,
  okText = "保存",
  cancelText = "取消",
  ...rest
}: AppModalProps) {
  return (
    <AntModal
      centered={centered}
      destroyOnHidden={destroyOnHidden}
      mask={resolveMask(mask)}
      okText={okText}
      cancelText={cancelText}
      width={MODAL_SIZE_WIDTH[size] ?? MODAL_SIZE_WIDTH.medium}
      styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
      {...rest}
    />
  );
}

Modal.confirm = (props: Parameters<typeof AntModal.confirm>[0]) =>
  AntModal.confirm({
    centered: true,
    okText: "确定",
    cancelText: "取消",
    ...props,
  });
