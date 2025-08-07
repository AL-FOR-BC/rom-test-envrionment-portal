import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hook";
import { DocumentTypeMode } from "../../../../@types/documents/base.types";
import { apiIPALInes } from "../../../../services/IpaSerivces";
import { ipaService } from "../../../../services/IpaSerivces";
import { options } from "../../../../@types/common.dto";
import {
  IPAFormData,
  IPALineFormData,
  PartialIPAFormData,
} from "../../../../@types/ipa.dto";
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

export const useIPA = ({
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
  // const currentYear = new Date().getFullYear();
  const currentDate = formatDate(new Date().toISOString());
  const dispatch = useAppDispatch();

  const initialFormData: IPAFormData = {
    no: "",
    employeeNo: employeeNo || "",
    appraiser: "",
    departmentCode: "",
    postingDate: currentDate,
    status: "Open",
    appraisalPeriod: "",
    convertToAppraisal: "",
    performanceType: "",
    stage: "",
    performanceAppraisalState: "",
    appraisalCycle: "",
    performanceYear: "",
  };

  const initialLineFormData: IPALineFormData = {
    lineNo: 0,
    documentNo: "",
    jobObjective: "",
    keyPerformanceIndicators: "",
    deliverables: "",
    byWhichTargetDate: "",
  };

  const [state, setState] = useState({});
  const [formData, setFormData] = useState<IPAFormData>(initialFormData);
  const [lineFormData, setLineFormData] =
    useState<IPALineFormData>(initialLineFormData);
  const [lines, setLines] = useState<IPALineFormData[]>([]);
  const getIPA = async () => {
    const filterQuery = `$filter=employeeNo eq '${employeeNo}'`;
    const response = await ipaService.getIPAS(companyId, filterQuery);
    return response;
  };

  // const handleFieldUpdate = async (
  //   field: keyof IPAFormData,
  //   value: string | options
  // ) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     [field]: value,
  //   }));

  //   if (mode === "detail") {
  //     if (!formData.systemId) {
  //       toast.error("IPA systemId is required");
  //       return;
  //     }
  //     const response = await ipaService.updateIPA(
  //       companyId,
  //       {
  //         [field]: value,
  //       },
  //       formData.systemId,
  //       // formData["@odata.etag"]
  //       '*'
  //     );
  //     if (response.status === 200) {
  //       toast.success("IPA updated successfully");
  //       //reload the page
  //       populateDocumentDetail(formData.systemId);
  //     }
  //   }
  // };

  const handleInputChange = async (
    field: keyof IPAFormData,
    value: string | options
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (mode === "detail") {
      if (!formData.systemId) {
        toast.error("IPA systemId is required");
        return;
      }
      const response = await ipaService.updateIPA(
        companyId,
        {
          [field]: value,
        },
        formData.systemId,
        // formData["@odata.etag"]
        "*"
      );
      if (response.status === 200) {
        toast.success("IPA updated successfully");
        //reload the page
        populateDocumentDetail(formData.systemId);
      }
    }
  };

  const handleLineFieldUpdate = (
    field: keyof IPALineFormData,
    value: string | number | options
  ) => {
    setLineFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditLine = (line: IPALineFormData) => {
    dispatch(editRequisitionLine(true));
    clearLineFields();
    dispatch(modelLoadingRequisition(true));
    setLineFormData({
      ...line,
      jobObjective: line.jobObjective,
      keyPerformanceIndicators: line.keyPerformanceIndicators,
      deliverables: line.deliverables,
      byWhichTargetDate: line.byWhichTargetDate,
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

    const basicFields = [
      {
        label: "IPA No",
        type: "text",
        value: formData.no,
        disabled: true,
        id: "ipaNo",
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
        label: "Posting Date",
        type: "date",
        value: formData.postingDate || currentDate,
        id: "postingDate",
        disabled: isFieldDisabled,
        onChange: (date: any) => {
          const formattedDate = formatDate(date[0]);
          handleInputChange("postingDate", formattedDate);
        },
        required: true,
      },
    ];
    const detailFields =
      mode === "detail" || mode === "approve"
        ? [
            {
              label: "Converted to Appraisal",
              type: "text",
              value: formData.convertToAppraisal,
              id: "convertedToAppraisal",
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
        disabled: isFieldDisabled,
        onChange: (e: options) => {
          handleInputChange("performanceYear", e.value.toString());
        },
        options: [
          { value: "", label: "Select year" }, // Empty option
          ...Array.from({ length: 20 }, (_, i) => {
            const currentYear = new Date().getFullYear();
            const year = currentYear - i;
            const nextYear = year + 1;
            return {
              value: `1st Oct ${year} to 30th Sept ${nextYear}`,
              label: `1st Oct ${year} to 30th Sept ${nextYear}`,
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
        disabled: isFieldDisabled,
        onChange: (e: options) => {
          handleInputChange("appraisalPeriod", e.value);
        },
        options: [
          { value: "", label: "Select" },
          { value: "Probation", label: "Probation" },
          { value: "Full-Year Appraisal", label: "Full Year Appraisal" },
          { value: "Mid-Year Appraisal", label: "Mid-Year Appraisal" },
        ],
      },
      ...detailFields,
    ];
    // i want to merge the two arrays
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
          rows: 5,
          value: lineFormData.jobObjective || "",
          id: "jobObjective",
          disabled: isFieldDisabled,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            handleLineFieldUpdate("jobObjective", e.target.value);
          },
          required: true,
        },
        
        {
          label: "Measures/Deliverables",
          type: "textarea",
          rows: 5,
          value: lineFormData.deliverables || "",
          id: "measures",
          disabled: isFieldDisabled,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            handleLineFieldUpdate("deliverables", e.target.value);
          },
          required: true,
        },
        {
          label: "Key Performance Indicator(s)",
          type: "textarea",
          rows: 5,
          value: lineFormData.keyPerformanceIndicators || "",
          id: "keyPerformanceIndicators",
          disabled: isFieldDisabled,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            handleLineFieldUpdate("keyPerformanceIndicators", e.target.value);
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
      ],
    ];
  };

  const submitIPA = async () => {
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
      const data: PartialIPAFormData = {
        employeeNo: employeeNo || "",
        postingDate: formData.postingDate,
        performanceYear: formData.performanceYear,
        appraisalPeriod: formData.appraisalPeriod,
      };
      const response = await ipaService.createIPA(companyId, data);
      toast.success("IPA created successfully");
      navigate(`/ipa-details/${response.data.systemId}`);
      return true;
    } catch (error) {
      toast.error(`Error fetching data: ${getErrorMessage(error)}`);
    }
  };

  const submitIPALines = async (systemId: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const data = {
        ...lineFormData,

        documentNo: formData.no,
        jobObjective: lineFormData.jobObjective,
        keyPerformanceIndicators: lineFormData.keyPerformanceIndicators,
        deliverables: lineFormData.deliverables,
        byWhichTargetDate: lineFormData.byWhichTargetDate,
      };
      const response = await ipaService.createIPALine(companyId, data);
      if (response.status === 201) {
        toast.success("IPA line created successfully");
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
      toast.error(`Error fetching data: ${getErrorMessage(error)}`);
    }
  };

  const updateIPALines = async (systemId: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const data = {
        documentNo: formData.no,
        jobObjective: lineFormData.jobObjective,
        keyPerformanceIndicators: lineFormData.keyPerformanceIndicators,
        deliverables: lineFormData.deliverables,
        byWhichTargetDate: lineFormData.byWhichTargetDate,
      };
      const response = await apiIPALInes(
        companyId,
        "PATCH",
        data,
        lineFormData.systemId,
        lineFormData["@odata.etag"]
      );
      if (response?.status === 200) {
        toast.success("IPA line updated successfully");
        dispatch(closeModalRequisition());

        if (systemId) {
          setTimeout(() => {
            populateDocumentDetail(systemId);
          }, 1000);
        }
      }
      console.log(response);
    } catch (error) {
      toast.error(`Error fetching data: ${getErrorMessage(error)}`);
    }
  };

  const deleteIPA = async (systemId: string) => {
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
        const response = await ipaService.delete({ companyId, systemId });
        if (response.status == 204) {
          toast.success("IPA deleted successfully");
          navigate("/individual-performance-appraisal");
        }
      } catch (error) {
        toast.error(`Error deleting Payment Requisition:${error}`);
      }
    }
  };

  const populateDocumentDetail = async (systemId: string) => {
    const filterQuery = `$expand=IPALines`;
    const data = await ipaService.getIPA(companyId, systemId, filterQuery);

    // Map API response to form data structure
    const mappedFormData: IPAFormData = {
      no: data.no,
      employeeNo: data.employeeNo,
      appraiser: data.appraiser,
      departmentCode: data.departmentCode,
      postingDate: data.postingDate,
      status: data.status,
      appraisalPeriod: data.appraisalPeriod,
      appraisalCycle: data.appraisalCycle,
      performanceYear: data.performanceYear.toString(),
      convertToAppraisal: data.convertToAppraisal,
      performanceType: data.performanceType,
      stage: data.stage,
      performanceAppraisalState: data.performanceAppraisalState,
      systemId: data.systemId,
    };

    setFormData(mappedFormData);
    setLines(data.ipaLines || []);
  };

  const clearLineFields = () => {
    setLineFormData(initialLineFormData);
  };

  const sendIPAForApproval = async (systemId: string) => {
    if (!formData.no) {
      toast.error("IPA No is required");
      return;
    }
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await ipaService.sendIPAForApproval(companyId, {
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

  const cancelIPAApprovalRequest = async (systemId: string) => {
    try {
      if (!formData.no) {
        toast.error("IPA No is required");
        return;
      }
      setState((prev) => ({ ...prev, isLoading: true }));
      const response = await ipaService.cancelIPAApprovalRequest(companyId, {
        no: formData.no,
      });
      if (response.status === 200) {
        toast.success("Approval request cancelled successfully");
        populateDocumentDetail(systemId);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      toast.error(`Error fetching data: ${getErrorMessage(error)}`);
    }
  };

  const convertToPerformanceAppraisal = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await ipaService.convertToPerformanceAppraisal(
        companyId,
        {
          no: formData.no || "",
        }
      );
      if (response.status === 200) {
        console.log("response", response);
        toast.success("Performance appraisal converted successfully");
        navigate(`/performance-appraisal/`);
      }
    } catch (error) {
      console.error("Full error:", error);
      toast.error(
        `Error converting to performance appraisal: ${getErrorMessage(error)}`
      );
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return {
    state,
    formData,
    lineFormData,
    lines,
    getFormFields,
    getLineFields,
    getIPA,
    submitIPA,
    submitIPALines,
    addLine,
    removeLine,
    populateDocumentDetail,
    clearLineFields,
    deleteIPA,
    handleEditLine,
    updateIPALines,
    sendIPAForApproval,
    cancelIPAApprovalRequest,
    convertToPerformanceAppraisal,
  };
};
