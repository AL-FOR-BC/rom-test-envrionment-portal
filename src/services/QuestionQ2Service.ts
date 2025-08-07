import BcApiService from "./BcApiServices";
import { QuestionQ2 } from "../@types/questionQ2.dto";

export async function fetchQuestionQ2(
  companyId: string,
  documentNo: string
): Promise<QuestionQ2[]> {
  const filter = `$filter=documentNo eq '${documentNo}'`;
  const res = await BcApiService.fetchData<{ value: QuestionQ2[] }>({
    url: `/api/hrpsolutions/hrmis/v2.0/questionQ2?Company=${companyId}&${filter}`,
    method: "get",
  });
  return res.data.value;
}

export async function updateQuestionQ2(
  companyId: string,
  systemId: string,
  data: Partial<QuestionQ2>
): Promise<any> {
  return BcApiService.fetchData<any>({
    url: `/api/hrpsolutions/hrmis/v2.0/questionQ2(${systemId})?Company=${companyId}`,
    method: "PATCH",
    data,
    headers: {
      "If-Match": "*",
    },
  });
}

export async function createQuestionQ2(
  companyId: string,
  data: Partial<QuestionQ2>
): Promise<any> {
  return BcApiService.fetchData<any>({
    url: `/api/hrpsolutions/hrmis/v2.0/questionQ2?Company=${companyId}`,
    method: "POST",
    data,
  });
}

export async function deleteQuestionQ2(
  companyId: string,
  systemId: string
): Promise<any> {
  return BcApiService.fetchData<any>({
    url: `/api/hrpsolutions/hrmis/v2.0/questionQ2(${systemId})?Company=${companyId}`,
    method: "DELETE",
  });
}
