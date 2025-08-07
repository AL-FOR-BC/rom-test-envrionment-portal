import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "../../store/hook";
import { useEffect, useState } from "react";
import { apiPaymentRequisitionDetail } from "../../services/RequisitionServices";
import { toast } from "react-toastify";
import { decodeValue, getErrorMessage } from "../../utils/common";
import { PaymentRequisitionLineType } from "../../@types/paymentReq.dto";
import HeaderMui from "../../Components/ui/Header/HeaderMui";
import Lines from "../../Components/ui/Lines/Lines";
import { apiDimensionValue, apiWorkPlans } from "../../services/CommonServices";
import { numberFormatter } from "../../Components/ui/Table/TableUtils";
import { environmentType } from "../../configs/navigation.config/app.config";


function ApprovePaymentRequisition() {
  const navigate = useNavigate();
  const { documentNo } = useParams();
  const { companyId } = useAppSelector((state) => state.auth.session);
  // const { employeeNo, employeeName } = useAppSelector(state => state.auth.user);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [selectedWorkPlan, setSelectedWorkPlan] = useState<string>("");
  const [selectedPaymentCategory, setSelectedPaymentCategory] =
    useState<string>("");
  const [selectedDimension, setSelectedDimension] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [expectedReceiptDate, setExpectedReceiptDate] = useState<string>("");
  const [budgetCode, setBudgetCode] = useState<string>("");
  const [requestNo, setRequestNo] = useState<string>("");
  const [paymentRequisitionLines, setPaymentRequisitionLines] = useState<
    PaymentRequisitionLineType[]
  >([]);
  const [status, setStatus] = useState<string>("");
  const [payeeName, setPayeeName] = useState<string>("");
  const [requestorNo, setRequestorNo] = useState<string>("");
  const [requestorName, setRequestorName] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<string>("");

  const fields = [
    [
      {
        label: "Requisition No",
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
        label: environmentType === "HRP" ? "Department" : "Project Code",
        type: "text",
        value: selectedDimension,
        disabled: true,
        id: "projectCode",
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
        label: "Payee Name",
        type: "text",
        value: payeeName,
        disabled: true,
        id: "payeeName",
      },
      {
        label: "Currency Code",
        type: "text",
        value: selectedCurrency,
        disabled: true,
        id: "currencyCode",
      },
      {
        label: "Budget Code",
        type: "text",
        value: budgetCode,
        disabled: true,
        id: "budgetCode",
      },
      {
        label: "Document Date",
        type: "text",
        value: expectedReceiptDate,
        disabled: true,
        id: "documentDate",
      },
      {
        label: "Purpose",
        type: "textarea",
        value: purpose,
        disabled: true,
        id: "purpose",
        rows: 2,
      },
      {
        label: "Status",
        type: "text",
        value: status,
        disabled: true,
        id: "docStatus",
      },
      {
        label: "Total Amount",
        type: "text",
        value: totalAmount,
        disabled: true,
        id: "totalAmount",
      },
    ],
  ];

  const columns = [
    {
      dataField: "accountType",
      text: "Account Type",
      sort: true,
      formatter: (cell: any) => decodeValue(cell),
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
      dataField: "quantity",
      text: "Quantity",
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
      dataField: "ShortcutDimCode1",
      text: environmentType === "HRP" ? "Department" : "Project Code",
      sort: true,
    },
    {
      dataField: "ShortcutDimCode2",
      text: environmentType === "HRP" ? "Cost Center" : "Donor Code",
      sort: true,
    },
  ];

  const populateData = async () => {
    try {
      setIsLoading(true);
      if (documentNo) {
        const filter = `$expand=paymentRequestLines&$filter=no eq '${documentNo}'`;
        const response = await apiPaymentRequisitionDetail(
          companyId,
          undefined,
          documentNo,
          filter
        );
        const data = response.data.value[0];

        setPaymentRequisitionLines(data.paymentRequestLines);
        setSelectedCurrency(data.currencyCode || "UGX");
        setPurpose(data.purpose || "");
        setExpectedReceiptDate(data.documentDate || "");
        setRequestNo(data.no || "");
        setBudgetCode(data.budgetCode || "");
        setStatus(data.status || "");
        setPayeeName(data.payeeName || "");
        setSelectedPaymentCategory(data.paymentCategory || "");
        setSelectedSubCategory(data.paySubcategory || "");
        setRequestorNo(data.requisitionedBy || "");
        setRequestorName(data.requestorName || "");
        setTotalAmount(data.totalAmount.toLocaleString() || "");

        // Get dimension value
        const resDimension = await apiDimensionValue(companyId);
        resDimension.data.value.forEach((e) => {
          if (e.code === data.project) {
            setSelectedDimension(`${e.code}:${e.name}`);
          }
        });

        // Get work plan
        const resWorkPlan = await apiWorkPlans(companyId);
        resWorkPlan.data.value.forEach((e) => {
          if (e.no === data.workPlanNo) {
            setSelectedWorkPlan(`${e.no}:${e.description}`);
          }
        });
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
      title="Payment Requisition Approval"
      subtitle="Payment Requisition Approval"
      breadcrumbItem="Payment Requisition Approval"
      fields={fields}
      isLoading={isLoading}
      handleBack={() => navigate("/approvals")}
      pageType="approval"
      status={status}
      companyId={companyId}
      documentType="Payment Requisition"
      requestNo={requestNo}
      tableId={50108}
      lines={
        <Lines
          title="Payment Requisition Lines"
          subTitle="Payment Requisition Lines"
          breadcrumbItem="Payment Requisition Lines"
          data={paymentRequisitionLines}
          columns={columns}
          noDataMessage="No Payment Requisition Lines found"
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

export default ApprovePaymentRequisition;
