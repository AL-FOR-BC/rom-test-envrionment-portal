import {
  IPA,
  IPALine,
  PartialIPALineFormData,
  PartialIPAFormData,
} from "../@types/ipa.dto";
import { BaseApiService } from "./base/BaseApiService";
import BcApiService from "./BcApiServices";

class IpaService extends BaseApiService {
  protected endpoint = "ipas";
  protected version = "v2.0";
  protected module = "hrpsolutions/hrmis";

  /**
   * Fetches leave requests from the API
   * @async
   * @param {string} companyId - Company identifier
   * @param {string} [filterQuery] - Optional OData filter query
   * @returns {Promise<LeaveRequestValue[]>} Array of leave requests
   */

  async getIPAS(companyId: string, filterQuery?: string) {
    return this.get<IPA>({ companyId, filterQuery });
  }

  async getIPA(companyId: string, systemId: string, filterQuery?: string) {
    return this.getById<IPA>({ companyId, systemId, filterQuery });
  }

  async createIPA(companyId: string, data: PartialIPAFormData) {
    return this.create<IPA>({ companyId, data });
  }

  async createIPALine(companyId: string, data: PartialIPALineFormData) {
    return this.create<IPALine>({
      companyId,
      data,
      customEndpoint: "ipaLines",
    });
  }

  async updateIPA(companyId: string, data: PartialIPALineFormData, systemId: string, etag: string) {
    return this.update<IPA>({
      companyId,
      data,
      systemId,
      etag: etag,
    });
  }

  async deleteIPALine(companyId: string, systemId: string) {
    return this.delete({ companyId, systemId, customEndpoint: "ipaLines" });
  }

  async sendIPAForApproval(
    companyId: string,
    data: { no: string; senderEmailAddress: string }
  ) {
    return this.create<{ no: string }>({
      companyId,
      data,
      type: "approval",
      customEndpoint: "HRMISActions_SendIPAApprovalRequest",
    });
  }

  async cancelIPAApprovalRequest(companyId: string, data: { no: string }) {
    return this.create<{ no: string }>({
      companyId,
      data,
      type: "approval",
      customEndpoint: "HRMISActions_CancelIPAApprovalRequest",
    });
  }

  async convertToPerformanceAppraisal(companyId: string, data: { no: string }) {
    return this.create<{ no: string , systemId: string }>({
      companyId,
      data,
      type: "approval",
      customEndpoint: "HRMISActions_ConvertToPerformanceAppraisal",
    });
  }

  // async getLeaveRequests(companyId: string, filterQuery?: string) {
  //   return this.get<LeaveRequestValue>({ companyId, filterQuery });
  // }

  // async getLeaveRequest(companyId: string, systemId: string) {
  //   return this.getById<LeaveRequestValue>({ companyId, systemId });
  // }

  // async createLeaveRequest(companyId: string, data: LeaveFormData) {
  //   return this.create<LeaveRequestValue>({ companyId, data });
  // }

  // async updateLeaveRequest(
  //   companyId: string,
  //   method: "PATCH",
  //   data: LeaveFormUpdate,
  //   systemId: string,
  //   etag: string
  // ) {
  //   console.log(method);
  //   return this.update<LeaveRequestValue>({ companyId, data, systemId, etag });
  // }

  // async sendLeaveRequestForApproval(
  //   companyId: string,
  //   data: { no: string; senderEmailAddress: string }
  // ) {
  //   return this.create<{ no: string }>({
  //     companyId,
  //     data,
  //     type: "approval",
  //     customEndpoint: "HRMISActions_SendLeaveApprovalRequest",
  //   });
  // }

  // async cancelLeaveRequest(companyId: string, data: { no: string }) {
  //   return this.create<{ no: string }>({
  //     companyId,
  //     data,
  //     type: "approval",
  //     customEndpoint: "HRMISActions_CancelLeaveApprovalRequest",
  //   });
  // }

  // async deleteLeaveRequest(companyId: string, systemId: string) {
  //   return this.delete({ companyId, systemId });
  // }

  // // --------------------------------- leave plan ---------------------------------

  // async sendLeavePlanForApproval(
  //   companyId: string,
  //   data: { no: string; senderEmailAddress: string }
  // ) {
  //   return this.create<{ no: string }>({
  //     companyId,
  //     data,
  //     type: "approval",
  //     customEndpoint: "HRMISActions_SendLeavePlanApprovalRequest",
  //   });
  // }

  // async cancelLeavePlanRequest(companyId: string, data: { no: string }) {
  //   return this.create<{ no: string }>({
  //     companyId,
  //     data,
  //     type: "approval",
  //     customEndpoint: "HRMISActions_CancelLeavePlanApprovalRequest",
  //   });
  // }

  // async deleteLeavePlan(companyId: string, systemId: string) {
  //   return this.delete({ companyId, systemId,
  //     customEndpoint: "leavePlans"
  //    });
  // }
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export async function apiIPALInes(
  companyId: string,
  method: HttpMethod | "DELETE" | "PATCH",
  data?: any,
  systemId?: string,
  etag?: string,
  filterQuery?: string
) {
  if (method === "PATCH" || method === "DELETE") {
    return BcApiService.fetchData<IPALine>({
      url: `/api/hrpsolutions/hrmis/v2.0/ipaLines(${systemId})?Company=${companyId}&${filterQuery}`,
      method,
      data: data as any,
      headers: {
        "If-Match": etag,
      },
    });
  }
}

export const ipaService = new IpaService();
