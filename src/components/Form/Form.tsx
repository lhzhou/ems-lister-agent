import { Form as AntForm } from "antd";
import type { FormProps } from "antd";
import type { ReactNode } from "react";
import { CONTROL_SIZE } from "@/src/app/control-size";

export type AppFormProps = Omit<FormProps, "children"> & {
  children?: ReactNode;
};

function AppForm({
  layout = "horizontal",
  labelCol = { flex: "120px" },
  wrapperCol = { flex: "auto" },
  labelAlign = "right",
  colon = true,
  size = CONTROL_SIZE,
  children,
  ...rest
}: AppFormProps) {
  return (
    <AntForm
      layout={layout}
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      labelAlign={labelAlign}
      colon={colon}
      size={size}
      {...rest}
    >
      {children}
    </AntForm>
  );
}

export const Form = Object.assign(AppForm, {
  Item: AntForm.Item,
  List: AntForm.List,
  ErrorList: AntForm.ErrorList,
  Provider: AntForm.Provider,
  useForm: AntForm.useForm,
  useWatch: AntForm.useWatch,
  useFormInstance: AntForm.useFormInstance,
});
