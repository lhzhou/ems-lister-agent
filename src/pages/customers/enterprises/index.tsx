/** @route
meta:
  layout: default
  title: 企业管理
*/

import { CustomersDirectory } from "../components/customers-directory";

export default function EnterprisesPage() {
  return <CustomersDirectory title="企业管理" createLabel="新增企业" />;
}
