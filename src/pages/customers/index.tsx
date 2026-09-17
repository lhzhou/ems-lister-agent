/** @route
meta:
  layout: default
  title: 客户管理
*/

import { CustomersDirectory } from "./components/customers-directory";

export default function CustomersPage() {
  return <CustomersDirectory title="客户管理" createLabel="新增客户" variant="account" />;
}
