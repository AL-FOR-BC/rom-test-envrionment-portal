import BcApiService from "./BcApiServices";
import { LanguageSkills } from "../@types/languageSkills.dto";

export async function fetchLanguageSkills(
  companyId: string,
  documentNo: string
): Promise<LanguageSkills[]> {
  const filter = `$filter=documentNo eq '${documentNo}'`;
  const res = await BcApiService.fetchData<{ value: LanguageSkills[] }>({
    url: `/api/hrpsolutions/hrmis/v2.0/languageSkills?Company=${companyId}&${filter}`,
    method: "get",
  });
  return res.data.value;
}

export async function updateLanguageSkills(
  companyId: string,
  systemId: string,
  data: Partial<LanguageSkills>
): Promise<any> {
  return BcApiService.fetchData<any>({
    url: `/api/hrpsolutions/hrmis/v2.0/languageSkills(${systemId})?Company=${companyId}`,
    method: "PATCH",
    data,
    headers: {
      "If-Match": "*",
    },
  });
}

export async function createLanguageSkills(
  companyId: string,
  data: Partial<LanguageSkills>
): Promise<any> {
  return BcApiService.fetchData<any>({
    url: `/api/hrpsolutions/hrmis/v2.0/languageSkills?Company=${companyId}`,
    method: "POST",
    data,
  });
}

export async function deleteLanguageSkills(
  companyId: string,
  systemId: string
): Promise<any> {
  return BcApiService.fetchData<any>({
    url: `/api/hrpsolutions/hrmis/v2.0/languageSkills(${systemId})?Company=${companyId}`,
    method: "DELETE",
    headers: {
      "If-Match": "*",
    },
  });
}
