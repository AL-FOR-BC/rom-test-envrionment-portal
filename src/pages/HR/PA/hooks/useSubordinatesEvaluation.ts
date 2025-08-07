import { useState, useEffect } from "react";
import { subordinatesEvaluationService } from "../../../../services/SubordinatesEvaluationService";
import {
  SubordinatesEvaluation,
  SubordinatesEvaluationFormData,
} from "../../../../@types/subordinatesEvaluation.dto";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../../../utils/common";

export const useSubordinatesEvaluation = (
  companyId: string,
  documentNo?: string
) => {
  const [data, setData] = useState<SubordinatesEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!documentNo) return;

    setLoading(true);
    setError(null);

    try {
      const filterQuery = `$filter=documentNo eq '${documentNo}'`;
      const result =
        await subordinatesEvaluationService.getSubordinatesEvaluations(
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
        toast.error(`Error fetching subordinates evaluations: ${errorMessage}`);
      }
      // Set empty data instead of showing error
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const createSubordinatesEvaluation = async (
    subordinatesEvaluationData: SubordinatesEvaluationFormData
  ) => {
    try {
      setLoading(true);
      const result =
        await subordinatesEvaluationService.createSubordinatesEvaluation(
          companyId,
          subordinatesEvaluationData
        );
      await fetchData(); // Refresh the data
      toast.success("Subordinates evaluation created successfully");
      return result.data;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(`Error creating subordinates evaluation: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSubordinatesEvaluation = async (
    systemId: string,
    etag: string,
    updateData: Partial<SubordinatesEvaluationFormData>
  ) => {
    try {
      setLoading(true);
      const result =
        await subordinatesEvaluationService.updateSubordinatesEvaluation(
          companyId,
          updateData,
          systemId,
          etag
        );
      await fetchData(); // Refresh the data
      toast.success("Subordinates evaluation updated successfully");
      return result.data;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(`Error updating subordinates evaluation: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSubordinatesEvaluation = async (systemId: string) => {
    try {
      setLoading(true);
      await subordinatesEvaluationService.deleteSubordinatesEvaluation(
        companyId,
        systemId
      );
      await fetchData(); // Refresh the data
      toast.success("Subordinates evaluation deleted successfully");
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(`Error deleting subordinates evaluation: ${errorMessage}`);
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
    createSubordinatesEvaluation,
    updateSubordinatesEvaluation,
    deleteSubordinatesEvaluation,
  };
};
