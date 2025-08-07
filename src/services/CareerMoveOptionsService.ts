import BcApiService from "./BcApiServices";
import { CareerMoveOptions } from "../@types/careerMoveOptions.dto";

export async function fetchCareerMoveOptions(
  companyId: string,
  documentNo: string
): Promise<CareerMoveOptions[]> {
  const filter = `$filter=documentNo eq '${documentNo}'`;
  const res = await BcApiService.fetchData<{ value: CareerMoveOptions[] }>({
    url: `/api/hrpsolutions/hrmis/v2.0/careerMoveOptions?Company=${companyId}&${filter}`,
    method: "get",
  });
  return res.data.value;
}

export async function updateCareerMoveOptions(
  companyId: string,
  systemId: string,
  data: Partial<CareerMoveOptions>
): Promise<any> {
  return BcApiService.fetchData<any>({
    url: `/api/hrpsolutions/hrmis/v2.0/careerMoveOptions(${systemId})?Company=${companyId}`,
    method: "PATCH",
    data,
    headers: {
      "If-Match": "*",
    },
  });
}

export async function createCareerMoveOptions(
  companyId: string,
  data: Partial<CareerMoveOptions>
): Promise<any> {
  return BcApiService.fetchData<any>({
    url: `/api/hrpsolutions/hrmis/v2.0/careerMoveOptions?Company=${companyId}`,
    method: "POST",
    data,
  });
}

export async function deleteCareerMoveOptions(
  companyId: string,
  systemId: string
): Promise<any> {
  return BcApiService.fetchData<any>({
    url: `/api/hrpsolutions/hrmis/v2.0/careerMoveOptions(${systemId})?Company=${companyId}`,
    method: "DELETE",
    headers: {
      "If-Match": "*",
    },
  });
}
