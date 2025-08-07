import { BaseApiService } from "./base/BaseApiService";
import { PeerEvaluation, PeerEvaluationFormData } from "../@types/pa.dto";

class PeerEvaluationService extends BaseApiService {
  protected endpoint = "peerEvaluationLines";
  protected version = "v2.0";
  protected module = "hrpsolutions/hrmis";

  async getPeerEvaluations(companyId: string, filterQuery?: string) {
    return this.get<PeerEvaluation>({ companyId, filterQuery });
  }

  async getPeerEvaluation(companyId: string, systemId: string) {
    return this.getById<PeerEvaluation>({ companyId, systemId });
  }

  async createPeerEvaluation(companyId: string, data: PeerEvaluationFormData) {
    return this.create<PeerEvaluation>({ companyId, data });
  }

  async updatePeerEvaluation(
    companyId: string,
    data: Partial<PeerEvaluationFormData>,
    systemId: string,
    etag: string
  ) {
    return this.update<PeerEvaluation>({
      companyId,
      data,
      systemId,
      etag,
    });
  }

  async deletePeerEvaluation(companyId: string, systemId: string) {
    return this.delete({ companyId, systemId });
  }
}

export const peerEvaluationService = new PeerEvaluationService();
