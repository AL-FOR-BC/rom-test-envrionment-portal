import {
  PA,
  PALine,
  PartialPALineFormData,
  PartialPAFormData,
} from "../@types/pa.dto";
import { BaseApiService } from "./base/BaseApiService";
import BcApiService from "./BcApiServices";

class PaService extends BaseApiService {
  protected endpoint = "pas";
  protected version = "v2.0";
  protected module = "hrpsolutions/hrmis";

  /**
   * Fetches performance appraisals from the API
   * @async
   * @param {string} companyId - Company identifier
   * @param {string} [filterQuery] - Optional OData filter query
   * @returns {Promise<PA[]>} Array of performance appraisals
   */

  async getPAS(companyId: string, filterQuery?: string) {
    return this.get<PA>({ companyId, filterQuery });
  }

  async getPA(companyId: string, systemId: string, filterQuery?: string) {
    return this.getById<PA>({ companyId, systemId, filterQuery });
  }

  async createPA(companyId: string, data: PartialPAFormData) {
    return this.create<PA>({ companyId, data });
  }

  async createPALine(companyId: string, data: PartialPALineFormData) {
    return this.create<PALine>({
      companyId,
      data,
      customEndpoint: "paLines",
    });
  }

  async updatePA(
    companyId: string,
    data: PartialPALineFormData,
    systemId: string,
    etag: string
  ) {
    return this.update<PA>({
      companyId,
      data,
      systemId,
      etag: etag,
    });
  }

  async deletePALine(companyId: string, systemId: string) {
    return this.delete({ companyId, systemId, customEndpoint: "paLines" });
  }

  async sendPAForApproval(
    companyId: string,
    data: { no: string; senderEmailAddress: string }
  ) {
    return this.create<{ no: string }>({
      companyId,
      data,
      type: "approval",
      customEndpoint: "HRMISActions_SendPAApprovalRequest",
    });
  }

  async cancelPAApprovalRequest(companyId: string, data: { no: string }) {
    return this.create<{ no: string }>({
      companyId,
      data,
      type: "approval",
      customEndpoint: "HRMISActions_CancelPAApprovalRequest",
    });
  }

  async sendToAppraiser(companyId: string, data: { no: string }) {
    return this.create<{ no: string }>({
      companyId,
      data,
      type: "approval",
      customEndpoint: "HRMISActions_SendToAppraiser",
    });
  }

  async sendToHeadOfDepartment(companyId: string, data: { no: string }) {
    return this.create<{ no: string }>({
      companyId,
      data,
      type: "approval",
      customEndpoint: "HRMISActions_SendToHeadOfDepartment",
    });
  }

  async sendBackToAppraisee(companyId: string, data: { no: string }) {
    return this.create<{ no: string }>({
      companyId,
      data,
      type: "approval",
      customEndpoint: "HRMISActions_SendBackToAppraisee",
    });
  }
}

const paService = new PaService();

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export async function apiPALInes(
  companyId: string,
  method: HttpMethod | "DELETE" | "PATCH",
  data?: any,
  systemId?: string,
  etag?: string,
  filterQuery?: string
) {
  if (method === "PATCH" || method === "DELETE") {
    return BcApiService.fetchData<PALine>({
      url: `/api/hrpsolutions/hrmis/v2.0/paLines(${systemId})?Company=${companyId}&${filterQuery}`,
      method,
      data: data as any,
      headers: {
        "If-Match": etag,
      },
    });
  }
}

export { paService };
