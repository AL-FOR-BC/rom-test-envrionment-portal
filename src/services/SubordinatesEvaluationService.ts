import { BaseApiService } from "./base/BaseApiService";
import {
  SubordinatesEvaluation,
  SubordinatesEvaluationFormData,
} from "../@types/subordinatesEvaluation.dto";

class SubordinatesEvaluationService extends BaseApiService {
  protected endpoint = "subordinatesEvaluationLines";
  protected version = "v2.0";
  protected module = "hrpsolutions/hrmis";

  async getSubordinatesEvaluations(companyId: string, filterQuery?: string) {
    return this.get<SubordinatesEvaluation>({ companyId, filterQuery });
  }

  async getSubordinatesEvaluation(companyId: string, systemId: string) {
    return this.getById<SubordinatesEvaluation>({ companyId, systemId });
  }

  async createSubordinatesEvaluation(
    companyId: string,
    data: SubordinatesEvaluationFormData
  ) {
    return this.create<SubordinatesEvaluation>({ companyId, data });
  }

  async updateSubordinatesEvaluation(
    companyId: string,
    data: Partial<SubordinatesEvaluationFormData>,
    systemId: string,
    etag: string
  ) {
    return this.update<SubordinatesEvaluation>({
      companyId,
      data,
      systemId,
      etag,
    });
  }

  async deleteSubordinatesEvaluation(companyId: string, systemId: string) {
    return this.delete({ companyId, systemId });
  }
}

export const subordinatesEvaluationService =
  new SubordinatesEvaluationService();

// Legacy functions for backward compatibility
export async function fetchSubordinatesEvaluation(
  companyId: string,
  documentNo: string
) {
  try {
    const filterQuery = `$filter=documentNo eq '${documentNo}'`;
    const result =
      await subordinatesEvaluationService.getSubordinatesEvaluations(
        companyId,
        filterQuery
      );

    // BaseApiService.get() returns the data directly, not wrapped in response.data
    if (result && Array.isArray(result)) {
      return result;
    } else {
      return [];
    }
  } catch (error) {
    // Return empty array if API doesn't exist yet
    console.warn("Subordinates Evaluation API not available yet:", error);
    return [];
  }
}

export async function updateSubordinatesEvaluation(
  companyId: string,
  systemId: string,
  data: Partial<SubordinatesEvaluation>
) {
  return subordinatesEvaluationService.updateSubordinatesEvaluation(
    companyId,
    data,
    systemId,
    "*"
  );
}
