import BcApiService from "./BcApiServices";
import { Aspirations } from "../@types/aspirations.dto";

export async function fetchAspirations(
  companyId: string,
  documentNo: string
): Promise<Aspirations[]> {
  const filter = `$filter=documentNo eq '${documentNo}'`;
  const res = await BcApiService.fetchData<{ value: Aspirations[] }>({
    url: `/api/hrpsolutions/hrmis/v2.0/aspirations?Company=${companyId}&${filter}`,
    method: "get",
  });
  return res.data.value;
}

export async function updateAspirations(
  companyId: string,
  systemId: string,
  data: Partial<Aspirations>
): Promise<any> {
  return BcApiService.fetchData<any>({
    url: `/api/hrpsolutions/hrmis/v2.0/aspirations(${systemId})?Company=${companyId}`,
    method: "PATCH",
    data,
    headers: {
      "If-Match": "*",
    },
  });
}

export async function createAspirations(
  companyId: string,
  data: Partial<Aspirations>
): Promise<any> {
  return BcApiService.fetchData<any>({
    url: `/api/hrpsolutions/hrmis/v2.0/aspirations?Company=${companyId}`,
    method: "POST",
    data,
  });
}

export async function deleteAspirations(
  companyId: string,
  systemId: string
): Promise<any> {
  return BcApiService.fetchData<any>({
    url: `/api/hrpsolutions/hrmis/v2.0/aspirations(${systemId})?Company=${companyId}`,
    method: "DELETE",
  });
}
