import { useState, useEffect } from "react";
import { peerEvaluationService } from "../../../../services/PeerEvaluationService";
import {
  PeerEvaluation,
  PeerEvaluationFormData,
} from "../../../../@types/pa.dto";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../../../utils/common";

export const usePeerEvaluation = (companyId: string, documentNo?: string) => {
  const [data, setData] = useState<PeerEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!documentNo) return;

    setLoading(true);
    setError(null);

    try {
      const filterQuery = `$filter=documentNo eq '${documentNo}'`;
      const result = await peerEvaluationService.getPeerEvaluations(
        companyId,
        filterQuery
      );

      // BaseApiService.get() returns the data directly, not wrapped in response.data
      if (result && Array.isArray(result)) {
        setData(result);
      } else {
        // Handle case where API returns empty or different structure
        setData([]);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      // Only show toast error for non-404 errors (API not found)
      if (
        !errorMessage.includes("404") &&
        !errorMessage.includes("Not Found")
      ) {
        toast.error(`Error fetching peer evaluations: ${errorMessage}`);
      }
      // Set empty data instead of showing error
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const createPeerEvaluation = async (
    peerEvaluationData: PeerEvaluationFormData
  ) => {
    try {
      setLoading(true);
      const result = await peerEvaluationService.createPeerEvaluation(
        companyId,
        peerEvaluationData
      );
      await fetchData(); // Refresh the data
      toast.success("Peer evaluation created successfully");
      return result.data;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(`Error creating peer evaluation: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePeerEvaluation = async (
    systemId: string,
    etag: string,
    updateData: Partial<PeerEvaluationFormData>
  ) => {
    try {
      setLoading(true);
      const result = await peerEvaluationService.updatePeerEvaluation(
        companyId,
        updateData,
        systemId,
        etag
      );
      await fetchData(); // Refresh the data
      toast.success("Peer evaluation updated successfully");
      return result.data;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(`Error updating peer evaluation: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePeerEvaluation = async (systemId: string) => {
    try {
      setLoading(true);
      await peerEvaluationService.deletePeerEvaluation(companyId, systemId);
      await fetchData(); // Refresh the data
      toast.success("Peer evaluation deleted successfully");
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(`Error deleting peer evaluation: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [documentNo]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    createPeerEvaluation,
    updatePeerEvaluation,
    deletePeerEvaluation,
  };
};
