import BcApiService from "./BcApiServices";
import { QuestionQ3 } from "../@types/questionQ3.dto";

export async function fetchQuestionQ3(
  companyId: string,
  documentNo: string
): Promise<QuestionQ3[]> {
  const filter = `$filter=documentNo eq '${documentNo}'`;
  const res = await BcApiService.fetchData<{ value: QuestionQ3[] }>({
    url: `/api/hrpsolutions/hrmis/v2.0/questionQ3?Company=${companyId}&${filter}`,
    method: "get",
  });
  return res.data.value;
}

export async function updateQuestionQ3(
  companyId: string,
  systemId: string,
  data: Partial<QuestionQ3>
): Promise<any> {
  return BcApiService.fetchData<any>({
    url: `/api/hrpsolutions/hrmis/v2.0/questionQ3(${systemId})?Company=${companyId}`,
    method: "PATCH",
    data,
    headers: {
      "If-Match": "*",
    },
  });
}

export async function createQuestionQ3(
  companyId: string,
  data: Partial<QuestionQ3>
): Promise<any> {
  return BcApiService.fetchData<any>({
    url: `/api/hrpsolutions/hrmis/v2.0/questionQ3?Company=${companyId}`,
    method: "POST",
    data,
  });
}

export async function deleteQuestionQ3(
  companyId: string,
  systemId: string
): Promise<any> {
  return BcApiService.fetchData<any>({
    url: `/api/hrpsolutions/hrmis/v2.0/questionQ3(${systemId})?Company=${companyId}`,
    method: "DELETE",
  });
}
