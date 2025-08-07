import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hook";
import { DocumentTypeMode } from "../../../../@types/documents/base.types";
import { apiPALInes, paService } from "../../../../services/PaServices";
import { options } from "../../../../@types/common.dto";
import { PAFormData, PALineFormData, PA } from "../../../../@types/pa.dto";
import { formatDate, getErrorMessage } from "../../../../utils/common";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  closeModalRequisition,
  editRequisitionLine,
  openModalRequisition,
  modelLoadingRequisition,
} from "../../../../store/slices/Requisitions";
import Swal from "sweetalert2";

// Extend PA type to allow arbitrary properties for API compatibility
interface PAWithAny extends PA {
  [key: string]: any;
}

export const usePA = ({
  mode,
}: {
  mode: DocumentTypeMode;
  systemId?: string;
}) => {
  const navigate = useNavigate();
  const { companyId } = useAppSelector((state) => state.auth.session);
  const { employeeNo, employeeName, jobTitle, email } = useAppSelector(
    (state) => state.auth.user
  );
  const currentDate = formatDate(new Date().toISOString());
  const dispatch = useAppDispatch();

  const initialFormData: PAFormData = {
    no: "",
    employeeNo: employeeNo || "",
    appraiser: "",
    headOfDepartment: "",
    departmentCode: "",
    postingDate: currentDate,
    status: "Open",
    appraisalPeriod: "",
    appraisalType: "Performance Appraisal",
    stage: "Performance Planning",
    performanceAppraisalState: "",
    appraisalCycle: "",
    performanceYear: "",
  };

  const initialLineFormData: PALineFormData = {
    lineNo: 0,
    documentNo: "",
    jobObjective: "",
    keyPerformanceIndicator: "",
    initiative: "",
    measuresDeliverables: "",
    byWhichTargetDate: "",
    targetValue: "",
    actualValue: "",
    comments: "",
  };

  const [state, setState] = useState({});
  const [formData, setFormData] = useState<PAFormData>(initialFormData);
  const [lineFormData, setLineFormData] =
    useState<PALineFormData>(initialLineFormData);
  const [lines, setLines] = useState<PALineFormData[]>([]);

  const getPA = async () => {
    const filterQuery = `EmployeeNo eq '${employeeNo}'`;
    const response = await paService.getPAS(companyId, filterQuery);
    return response;
  };

  const handleFieldUpdate = (
    field: keyof PAFormData,
    value: string | options
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInputChange = async (
    field: keyof PAFormData,
    value: string | options
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (mode === "detail") {
      if (!formData.systemId) {
        toast.error("PA systemId is required");
        return;
      }
      const response = await paService.updatePA(
        companyId,
        {
          [field]: value,
        },
        formData.systemId,
        formData["@odata.etag"]
      );
      if (response.status === 200) {
        toast.success("PA updated successfully");
        populateDocumentDetail(formData.systemId);
      }
    }
  };

  const handleLineFieldUpdate = (
    field: keyof PALineFormData,
    value: string | number | options
  ) => {
    setLineFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditLine = (line: PALineFormData) => {
    dispatch(editRequisitionLine(true));
    clearLineFields();
    dispatch(modelLoadingRequisition(true));
    setLineFormData({
      ...line,
      jobObjective: line.jobObjective,
      keyPerformanceIndicator: line.keyPerformanceIndicator,
      initiative: line.initiative,
      measuresDeliverables: line.measuresDeliverables,
      byWhichTargetDate: line.byWhichTargetDate,
      targetValue: line.targetValue,
      actualValue: line.actualValue,
      appraiseeRating: line.appraiseeRating,
      comments: line.comments,
    });
    setTimeout(() => {
      dispatch(openModalRequisition());
      dispatch(modelLoadingRequisition(false));
    }, 0);
  };

  const addLine = () => {
    setLines((prev) => [...prev, { ...lineFormData, lineNo: prev.length + 1 }]);
    setLineFormData(initialLineFormData);
  };

  const removeLine = (lineNo: number) => {
    setLines((prev) => prev.filter((line) => line.lineNo !== lineNo));
  };

  const getFormFields = () => {
    const isFieldDisabled =
      mode === "add" ||
      formData.status === "Open" ||
      (mode === "detail" && formData.status === "Open")
        ? false
        : true;
    console.log(isFieldDisabled);
    const basicFields = [
      {
        label: "PA No",
        type: "text",
        value: formData.no,
        disabled: true,
        id: "paNo",
      },
      {
        label: "Employee No",
        type: "text",
        value: employeeNo,
        disabled: true,
        id: "empNo",
      },
      {
        label: "Employee Name",
        type: "text",
        value: employeeName,
        disabled: true,
        id: "empName",
      },
      {
        label: "Employment Title",
        type: "text",
        value: jobTitle,
        disabled: true,
        id: "empTitle",
      },
      {
        label: "Status",
        type: "text",
        value: formData.status,
        disabled: true,
        id: "docStatus",
      },
      {
        label: "Stage",
        type: "text",
        value: formData.stage,
        disabled: true,
        id: "stage",
      },
      {
        label: "Posting Date",
        type: "date",
        value: formData.postingDate || currentDate,
        id: "postingDate",
        disabled: formData.stage === "Appraisee Rating" ? false : true,
        onChange: (date: any) => {
          const formattedDate = formatDate(date[0]);
          handleInputChange("postingDate", formattedDate);
          if (mode === "detail" && formattedDate) {
            handleFieldUpdate("postingDate", formattedDate);
          }
        },
        required: true,
      },
    ];

    const detailFields =
      mode === "detail" || mode === "approve"
        ? [
            {
              label: "Appraisal Type",
              type: "text",
              value: formData.appraisalType,
              id: "appraisalType",
              disabled: true,
            },
          ]
        : [];

    const editableFields = [
      {
        label: "Performance Year",
        type: "select",
        value: formData.performanceYear
          ? {
              value: formData.performanceYear.toString(),
              label: formData.performanceYear.toString(),
            }
          : { value: "", label: "Select year" },
        id: "performanceYear",
        disabled: formData.stage === "Appraisee Rating" ? false : true,
        onChange: (e: options) => {
          handleInputChange("performanceYear", e.value.toString());
          if (mode === "detail") {
            handleFieldUpdate("performanceYear", e.value.toString());
          }
        },
        options: [
          { value: "", label: "Select year" }, // Empty option
          ...Array.from({ length: 20 }, (_, i) => {
            const currentYear = new Date().getFullYear();
            const year = currentYear - i;
            const nextYear = year + 1;
            return {
              value: `1st Oct ${year} to 30th September ${nextYear}`,
              label: `1st Oct ${year} to 30th September ${nextYear}`,
            };
          }),
        ],
        required: true,
      },
      {
        label: "Appraisal Period",
        type: "select",
        value: formData.appraisalPeriod
          ? {
              value: formData.appraisalPeriod,
              label: formData.appraisalPeriod,
            }
          : { value: "", label: "Select" },
        id: "appraisalPeriod",
        disabled: formData.stage === "Appraisee Rating" ? false : true,
        onChange: (e: options) => {
          handleInputChange("appraisalPeriod", e.value);
        },
        options: [
          { value: "", label: "Select" },
          { value: "Probation Appraisal", label: "Probation Appraisal" },
          { value: "Full-Year Appraisal", label: "Full Year Appraisal" },
          { value: "Mid-Year Appraisal", label: "Mid-Year Appraisal" },
        ],
      },
      ...detailFields,
    ];

    const fields = [[...basicFields, ...editableFields]];
    return fields;
  };

  const getLineFields = () => {
    const isFieldDisabled =
      mode === "add" ||
      formData.status === "Open" ||
      (mode === "detail" && formData.status === "Open")
        ? false
        : true;

    return [
      [
        {
          label: "Job Objective",
          type: "textarea",
          rows: 3,
          value: lineFormData.jobObjective || "",
          id: "jobObjective",
          disabled: isFieldDisabled,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            handleLineFieldUpdate("jobObjective", e.target.value);
          },
          required: true,
        },
        {
          label: "Key Performance Indicator(s)",
          type: "textarea",
          rows: 3,
          value: lineFormData.keyPerformanceIndicator || "",
          id: "keyPerformanceIndicator",
          disabled: isFieldDisabled,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            handleLineFieldUpdate("keyPerformanceIndicator", e.target.value);
          },
          required: true,
        },
        {
          label: "Measures/Deliverables",
          type: "textarea",
          rows: 3,
          value: lineFormData.measuresDeliverables || "",
          id: "measuresDeliverables",
          disabled: isFieldDisabled,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            handleLineFieldUpdate("measuresDeliverables", e.target.value);
          },
          required: true,
        },
        {
          label: "By which Target Date?",
          type: "date",
          value: lineFormData.byWhichTargetDate || "",
          id: "byWhichTargetDate",
          disabled: isFieldDisabled,
          onChange: (date: any) => {
            const formattedDate = formatDate(date[0]);
            handleLineFieldUpdate("byWhichTargetDate", formattedDate);
          },
          required: true,
        },
        {
          label: "What has been your limiting Factor(s)",
          type: "textarea",
          rows: 2,
          value: lineFormData.limitingFactor || "",
          id: "limitingFactor",
          disabled: isFieldDisabled,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            handleLineFieldUpdate("limitingFactor", e.target.value);
          },
        },
        {
          label: "Suggestion for future enhanced Performance",
          type: "textarea",
          rows: 2,
          value: lineFormData.enhancedPerformance || "",
          id: "enhancedPerformance",
          disabled: isFieldDisabled,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            handleLineFieldUpdate("enhancedPerformance", e.target.value);
          },
        },
        {
          label: "Appraisee Rating",
          type: "number",
          value: lineFormData.appraiseeRating || 0,
          id: "appraiseeRating",
          disabled: isFieldDisabled,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            handleLineFieldUpdate(
              "appraiseeRating",
              parseInt(e.target.value) || 0
            );
          },
        },
        {
          label: "Appraisee Score",
          type: "number",
          value: lineFormData.appraiseeScore || 0,
          id: "appraiseeScore",
          disabled: isFieldDisabled,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            handleLineFieldUpdate(
              "appraiseeScore",
              parseInt(e.target.value) || 0
            );
          },
        },
        {
          label: "Appraiser Rating",
          type: "number",
          value: lineFormData.appraiserRating || 0,
          id: "appraiserRating",
          disabled: isFieldDisabled,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            handleLineFieldUpdate(
              "appraiserRating",
              parseInt(e.target.value) || 0
            );
          },
        },
        {
          label: "Agreed Score",
          type: "number",
          value: lineFormData.agreedScore || 0,
          id: "agreedScore",
          disabled: isFieldDisabled,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            handleLineFieldUpdate("agreedScore", parseInt(e.target.value) || 0);
          },
        },
      ],
    ];
  };

  const submitPA = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const missingFields: string[] = [];
      if (!formData.performanceYear) {
        missingFields.push("Performance Year");
      }
      if (!formData.appraisalPeriod) {
        missingFields.push("Appraisal Period");
      }
      console.log("missingFields", missingFields);
      if (missingFields.length > 0) {
        toast.error(`Missing fields: ${missingFields.join(", ")}`);
        return;
      }
      const data = {
        employeeNo: employeeNo,
        postingDate: formData.postingDate,
        appraisalPeriod: formData.performanceYear?.toString(),
        appraisalType: formData.appraisalType,
      };
      const response = await paService.createPA(companyId, data);
      toast.success("PA created successfully");
      navigate(`/pa-details/${response.data.systemId}`);
      return true;
    } catch (error) {
      toast.error(`Error creating PA: ${getErrorMessage(error)}`);
    }
  };

  const submitPALines = async (systemId: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const data = {
        ...lineFormData,
        documentNo: formData.no,
        jobObjective: lineFormData.jobObjective,
        keyPerformanceIndicator: lineFormData.keyPerformanceIndicator,
        initiative: lineFormData.initiative,
        measuresDeliverables: lineFormData.measuresDeliverables,
        byWhichTargetDate: lineFormData.byWhichTargetDate,
        targetValue: lineFormData.targetValue,
        actualValue: lineFormData.actualValue,
        appraiseeRating: lineFormData.appraiseeRating,
        comments: lineFormData.comments,
      };
      const response = await paService.createPALine(companyId, data);
      if (response.status === 201) {
        toast.success("PA line created successfully");
        console.log("systemId", systemId);
        if (systemId) {
          setTimeout(() => {
            populateDocumentDetail(systemId);
          }, 1000);
        }
        dispatch(closeModalRequisition());
        return true;
      }
      return false;
    } catch (error) {
      toast.error(`Error creating PA line: ${getErrorMessage(error)}`);
    }
  };

  const updatePALines = async (systemId: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const data = {
        documentNo: formData.no,
        jobObjective: lineFormData.jobObjective,
        keyPerformanceIndicator: lineFormData.keyPerformanceIndicator,
        initiative: lineFormData.initiative,
        deliverables: lineFormData.measuresDeliverables,
        byWhichTargetDate: lineFormData.byWhichTargetDate,
        targetValue: lineFormData.targetValue,
        actualValue: lineFormData.actualValue,
        rating: lineFormData.appraiseeRating,
        comments: lineFormData.comments,
      };
      const response = await apiPALInes(
        companyId,
        "PATCH",
        data,
        lineFormData.systemId,
        lineFormData["@odata.etag"]
      );
      if (response?.status === 200) {
        toast.success("PA line updated successfully");
        dispatch(closeModalRequisition());
        if (systemId) {
          setTimeout(() => {
            populateDocumentDetail(systemId);
          }, 1000);
        }
      }
      console.log(response);
    } catch (error) {
      toast.error(`Error updating PA line: ${getErrorMessage(error)}`);
    }
  };

  const deletePA = async (systemId: string) => {
    const response = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (response.isConfirmed) {
      try {
        const response = await paService.delete({ companyId, systemId });
        if (response.status == 204) {
          toast.success("PA deleted successfully");
          navigate("/performance-appraisal");
        }
      } catch (error) {
        toast.error(`Error deleting PA: ${error}`);
      }
    }
  };

  const populateDocumentDetail = async (systemId: string) => {
    const filterQuery = `$expand=paLines`;
    const data: PAWithAny = await paService.getPA(
      companyId,
      systemId,
      filterQuery
    );

    // Map API response to form data structure
    const mappedFormData: PAFormData = {
      no: data.no,
      employeeNo: data.employeeNo,
      appraiser: data.appraiser,
      headOfDepartment: data.headOfDepartment,
      departmentCode: data.departmentCode,
      postingDate: data.postingDate,
      status: data.status,
      appraisalPeriod: data.appraisalPeriod,
      appraisalCycle: data.appraisalCycle,
      performanceYear: data.performanceYear ? String(data.performanceYear) : "",
      appraisalType: data.appraisalType,
      stage: data.stage,
      performanceAppraisalState: data.performanceAppraisalState,
      systemId: data.systemId,
    };

    setFormData(mappedFormData);
    const rawLines = data.paLines || data.pALines || [];
    const mappedLines = rawLines.map((line) => ({
      ...line,
      jobObjective: line.jobObjective || "",
      measuresDeliverables: line.measuresDeliverables || "",
      byWhichTargetDate: line.byWhichTargetDate || "",
      limitingFactor: line.limitingFactor || "",
      enhancedPerformance: line.enhancedPerformance || "",
      appraiseeRating: line.appraiseeRating ?? undefined,
      appraiseeScore: line.appraiseeScore ?? undefined,
      appraiserRating: line.appraiserRating ?? undefined,
      agreedScore: line.agreedScore ?? undefined,
      agreedActionsInterventions: line.agreedActionsInterventions || "",
    }));
    setLines(mappedLines);
  };

  const clearLineFields = () => {
    setLineFormData(initialLineFormData);
  };

  const sendPAForApproval = async (systemId: string) => {
    if (!formData.no) {
      toast.error("PA No is required");
      return;
    }
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await paService.sendPAForApproval(companyId, {
        no: formData.no,
        senderEmailAddress: email,
      });
      if (response.status === 200) {
        toast.success("Approval request sent successfully");
        populateDocumentDetail(systemId);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      toast.error(`Error sending approval request: ${getErrorMessage(error)}`);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const cancelPAApprovalRequest = async (systemId: string) => {
    try {
      if (!formData.no) {
        toast.error("PA No is required");
        return;
      }
      setState((prev) => ({ ...prev, isLoading: true }));
      const response = await paService.cancelPAApprovalRequest(companyId, {
        no: formData.no,
      });
      if (response.status === 200) {
        toast.success("Approval request cancelled successfully");
        populateDocumentDetail(systemId);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      toast.error(
        `Error cancelling approval request: ${getErrorMessage(error)}`
      );
    }
  };

  const sendToAppraiser = async (systemId: string) => {
    try {
      if (!formData.no) {
        toast.error("PA No is required");
        return;
      }
      setState((prev) => ({ ...prev, isLoading: true }));
      const response = await paService.sendToAppraiser(companyId, {
        no: formData.no,
      });
      if (response.status === 200) {
        toast.success("Appraiser sent successfully");
        populateDocumentDetail(systemId);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      toast.error(`Error sending to appraiser: ${getErrorMessage(error)}`);
    }
  };

  const sendToHeadOfDepartment = async (systemId: string) => {
    try {
      if (!formData.no) {
        toast.error("PA No is required");
        return;
      }
      setState((prev) => ({ ...prev, isLoading: true }));
      const response = await paService.sendToHeadOfDepartment(companyId, {
        no: formData.no,
      });
      if (response.status === 200) {
        toast.success("Sent to Head of Department successfully");
        populateDocumentDetail(systemId);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      toast.error(
        `Error sending to Head of Department: ${getErrorMessage(error)}`
      );
    }
  };

  const sendBackToAppraisee = async (systemId: string) => {
    try {
      if (!formData.no) {
        toast.error("PA No is required");
        return;
      }
      setState((prev) => ({ ...prev, isLoading: true }));
      const response = await paService.sendBackToAppraisee(companyId, {
        no: formData.no,
      });
      if (response.status === 204) {
        toast.success("Sent back to Appraisee successfully");
        navigate("/performance-appraisal-review");
        populateDocumentDetail(systemId);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      toast.error(`Error sending back to Appraisee: ${getErrorMessage(error)}`);
    }
  };

  return {
    state,
    formData,
    lineFormData,
    lines,
    getFormFields,
    getLineFields,
    getPA,
    submitPA,
    submitPALines,
    addLine,
    removeLine,
    populateDocumentDetail,
    clearLineFields,
    deletePA,
    handleEditLine,
    updatePALines,
    sendPAForApproval,
    cancelPAApprovalRequest,
    sendToAppraiser,
    sendToHeadOfDepartment,
    sendBackToAppraisee,
    handleInputChange,
    handleFieldUpdate,
  };
};
