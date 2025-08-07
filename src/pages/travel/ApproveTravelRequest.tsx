import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "../../store/hook";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/common";
import HeaderMui from "../../Components/ui/Header/HeaderMui";
import Lines from "../../Components/ui/Lines/Lines";
import {
  apiDimensionValue,
  apiEmployees,
  apiWorkPlans,
} from "../../services/CommonServices";
import { numberFormatter } from "../../Components/ui/Table/TableUtils";
import { apiTravelRequestDetail } from "../../services/TravelRequestsService";
import { environmentType } from "../../configs/navigation.config/app.config";

function ApproveTravelRequest() {
  const navigate = useNavigate();
  const { documentNo } = useParams();
  const { companyId } = useAppSelector((state) => state.auth.session);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [requestNo, setRequestNo] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [selectedPaymentCategory, setSelectedPaymentCategory] =
    useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [budgetCode, setBudgetCode] = useState<string>("");
  const [selectedDelegatee, setSelectedDelegatee] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedDimension, setSelectedDimension] = useState<string>("");
  const [selectedWorkPlan, setSelectedWorkPlan] = useState<string>("");
  const [requestorNo, setRequestorNo] = useState<string>("");
  const [requestorName, setRequestorName] = useState<string>("");
  const [travelRequisitionLines, setTravelRequisitionLines] = useState<any[]>(
    []
  );

  const fields = [
    [
      {
        label: "Request No",
        type: "text",
        value: requestNo,
        disabled: true,
        id: "requestNo",
      },
      {
        label: "Requestor No",
        type: "text",
        value: requestorNo,
        disabled: true,
        id: "requestorNo",
      },
      {
        label: "Requestor Name",
        type: "text",
        value: requestorName,
        disabled: true,
        id: "requestorName",
      },
      {
        label: "Document Date",
        type: "text",
        value: startDate,
        disabled: true,
        id: "startDate",
      },
    ],
    [
      {
        label: environmentType === "HRP" ? "Department" : "Project Code",
        type: "text",
        value: selectedDimension,
        disabled: true,
        id: "projectCode",
      },
      {
        label: "Payment Category",
        type: "text",
        value: selectedPaymentCategory,
        disabled: true,
        id: "paymentCategory",
      },
      {
        label: "Payment Subcategory",
        type: "text",
        value: selectedSubCategory,
        disabled: true,
        id: "subCategory",
      },
      {
        label: "Payee",
        type: "text",
        value: selectedEmployee,
        disabled: true,
        id: "payee",
      },
    ],
    [
      {
        label: "Work Plan",
        type: "text",
        value: selectedWorkPlan,
        disabled: true,
        id: "workPlan",
      },
      {
        label: "Budget Code",
        type: "text",
        value: budgetCode,
        disabled: true,
        id: "budgetCode",
      },
      {
        label: "Currency",
        type: "text",
        value: selectedCurrency,
        disabled: true,
        id: "currency",
      },
      {
        label: "Start Date",
        type: "text",
        value: startDate,
        disabled: true,
        id: "startDate",
      },
      {
        label: "End Date",
        type: "text",
        value: endDate,
        disabled: true,
        id: "endDate",
      },
      {
        label: "Delegatee",
        type: "text",
        value: selectedDelegatee,
        disabled: true,
        id: "delegatee",
      },
      {
        label: "Purpose",
        type: "textarea",
        value: description,
        disabled: true,
        id: "purpose",
        rows: 2,
      },
    ],
  ];

  const columns = [
    {
      dataField: "accountType",
      text: "Account Type",
      sort: true,
    },
    {
      dataField: "accountNo",
      text: "Account No",
      sort: true,
    },
    {
      dataField: "accountName",
      text: "Account Name",
      sort: true,
    },
    {
      dataField: "description",
      text: "Description",
      sort: true,
    },
    {
      dataField: "noOfNights",
      text: "No of Nights",
      sort: true,
    },
    {
      dataField: "rate",
      text: "Rate",
      sort: true,
      formatter: numberFormatter,
    },
    {
      dataField: "amount",
      text: "Amount",
      sort: true,
      formatter: numberFormatter,
    },
    {
      dataField: "ShortcutDimCode4",
      text: "Activity Code",
      sort: true,
    },
  ];

  const populateData = async () => {
    try {
      setIsLoading(true);
      if (documentNo) {
        const filterQuery = `$expand=travelRequisitionLines&$filter=no eq '${documentNo}'`;
        const res = await apiTravelRequestDetail(
          companyId,
          undefined,
          filterQuery,
          documentNo
        );

        const response = res.data.value[0];
        if (response) {
          console.log("liness", response.travelRequisitionLines);
          setRequestNo(response.no);
          setStatus(response.status);
          setDescription(response.purpose);
          setStartDate(response.travelStartDate?.split("T")[0] || "");
          setEndDate(response.travelEndDate?.split("T")[0] || "");
          setSelectedCurrency(response.currencyCode);
          setSelectedPaymentCategory(response.paymentCategory);
          setSelectedSubCategory(response.paySubcategory);
          setBudgetCode(response.budgetCode);

          setRequestorNo(response.requisitionedBy);
          setRequestorName(response.requisitionedBy);
          setTravelRequisitionLines(response.travelRequisitionLines);

          // Get dimension value
          const resDimension = await apiDimensionValue(companyId);
          resDimension.data.value.forEach((e) => {
            if (e.code === response.projectCode) {
              setSelectedDimension(`${e.code}::${e.name}`);
            }
          });

          // Get work plan
          const resWorkPlan = await apiWorkPlans(companyId);
          resWorkPlan.data.value.forEach((e) => {
            if (e.no === response.workPlanNo) {
              setSelectedWorkPlan(`${e.no}::${e.description}`);
            }
          });

          // Get employee
          const resEmployee = await apiEmployees(companyId);
          resEmployee.data.value.forEach((e) => {
            if (e.No === response.payeeNo) {
              setSelectedEmployee(`${e.No}::${e.FirstName} ${e.LastName}`);
            }
          });

          // Get delegatee
          const resDelegatee = await apiEmployees(companyId);
          resDelegatee.data.value.forEach((e) => {
            if (e.No === response.delegatee) {
              setSelectedDelegatee(`${e.No}::${e.FirstName} ${e.LastName}`);
            }
          });
        }
      }
    } catch (error) {
      toast.error(`Error fetching data: ${getErrorMessage(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    populateData();
  }, [documentNo, companyId]);

  return (
    <HeaderMui
      title="Travel Request Approval"
      subtitle="Travel Request Approval"
      breadcrumbItem="Travel Request Approval"
      tableId={50108}
      fields={fields}
      isLoading={isLoading}
      handleBack={() => navigate("/approvals")}
      pageType="approval"
      status={status}
      companyId={companyId}
      documentType="Travel Request"
      requestNo={requestNo}
      lines={
        <Lines
          title="Travel Request Lines"
          subTitle="Travel Request Lines"
          breadcrumbItem="Travel Request Lines"
          data={travelRequisitionLines}
          columns={columns}
          noDataMessage="No Travel Request Lines found"
          status={status}
          modalFields={[]}
          addLink={""}
          addLabel={""}
          iconClassName="fa fa-file-text"
          handleSubmitLines={() => {}}
          handleSubmitUpdatedLine={() => {}}
          clearLineFields={() => {}}
          handleValidateHeaderFields={() => {
            return true;
          }}
        />
      }
    />
  );
}

export default ApproveTravelRequest;
