import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "../../store/hook";
import { useEffect, useState } from "react";
import { apiPurchaseRequisitionDetail } from "../../services/RequisitionServices";
import { toast } from "react-toastify";
import { decodeValue, getErrorMessage } from "../../utils/common";
import { PurchaseRequisitionLineType } from "../../@types/purchaseReq.dto";
import HeaderMui from "../../Components/ui/Header/HeaderMui";
import Lines from "../../Components/ui/Lines/Lines";
import {
  apiDimensionValue,
  apiLocation,
  apiWorkPlans,
} from "../../services/CommonServices";
import { numberFormatter } from "../../Components/ui/Table/TableUtils";
import { environmentType } from "../../configs/navigation.config/app.config";

function ApprovePurchaseRequisition() {
  const navigate = useNavigate();
  const { documentNo } = useParams();
  console.log("documentNo:", documentNo);
  const { companyId } = useAppSelector((state) => state.auth.session);
  // const { employeeNo, employeeName } = useAppSelector(state => state.auth.user);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [selectedWorkPlan, setSelectedWorkPlan] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedDimension, setSelectedDimension] = useState<string>("");
  const [subjectOfProcurement, setSubjectOfProcurement] = useState<string>("");
  const [expectedReceiptDate, setExpectedReceiptDate] = useState<Date>(
    new Date()
  );
  const [budgetCode, setBudgetCode] = useState<string>("");
  const [requestNo, setRequestNo] = useState<string>("");
  const [purchaseRequisitionLines, setPurchaseRequisitionLines] = useState<
    PurchaseRequisitionLineType[]
  >([]);
  const [status, setStatus] = useState<string>("");
  const [requestorName, setRequestorName] = useState<string>("");
  const [requestorNo, setRequestorNo] = useState<string>("");
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
        type: "input",
        value: selectedDimension,
        disabled: true,
        id: "projectCode",
      },
    ],
    [
      {
        label: "Currency Code",
        type: "input",
        value: selectedCurrency,
        disabled: true,
        id: "currencyCode",
      },
      {
        label: "Work Plan",
        type: "input",
        value: selectedWorkPlan,
        disabled: true,
        id: "workPlan",
      },
      {
        label: "Store Location",
        type: "input",
        value: selectedLocation,
        disabled: true,
        id: "location",
      },
      {
        label: "Subject of Procurement",
        type: "textarea",
        value: subjectOfProcurement,
        disabled: true,
        rows: 2,
        id: "subjectOfProcurement",
      },
      {
        label: "Expected Receipt Date",
        type: "input",
        value: expectedReceiptDate,
        disabled: true,
        id: "expectedReceiptDate",
      },
      {
        label: "Budget Code",
        type: "text",
        value: budgetCode,
        disabled: true,
        id: "budgetCode",
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

  // Columns for the lines grid
  const columns = [
    {
      dataField: "accountType",
      text: "Account Type",
      sort: true,
      formatter: (cell: any) => decodeValue(cell),
    },
    {
      dataField: "no",
      text: "No",
      sort: true,
    },
    {
      dataField: "description",
      text: "Description",
      sort: true,
    },
    {
      dataField: "description2",
      text: "Activity Description",
      sort: true,
    },
    {
      dataField: "quantity",
      text: "Quantity",
      sort: true,
    },
    {
      dataField: "directUnitCost",
      text: "Direct Unit Cost",
      sort: true,
      formatter: numberFormatter,
    },
    {
      dataField: "lineAmount",
      text: "Line Amount",
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
        const filter = `$expand=purchaseRequisitionLines&$filter=no eq '${documentNo}'`;
        const response = await apiPurchaseRequisitionDetail(
          companyId,
          undefined,
          documentNo,
          filter
        );
        const data = response.data.value[0];
        console.log("data:", data);
        setPurchaseRequisitionLines(data.purchaseRequisitionLines);
        setSelectedCurrency(data.currencyCode ? data.currencyCode : "UGX");

        setSubjectOfProcurement(data.procurementDescription);
        setExpectedReceiptDate(new Date(data.expectedReceiptDate));
        setRequestNo(data.no || "");
        setBudgetCode(data.budgetCode || "");
        setSubjectOfProcurement(data.procurementDescription || "");
        setExpectedReceiptDate(data.expectedReceiptDate || "");
        setRequestorNo(data.requestorNo || "");
        setRequestorName(data.requestorName || "");

        setStatus(data.status || "");
        setTotalAmount(data.amount.toLocaleString() || "");

        const resLocationCodes = await apiLocation(companyId);
        console.log("resLocationCodes:", resLocationCodes);
        resLocationCodes.data.value.map((e) => {
          if (e.code === data.locationCode) {
            setSelectedLocation(`${e.code}:${e.name}`);
          }
        });

        const resWorkPlan = await apiWorkPlans(companyId);
        resWorkPlan.data.value.map((e) => {
          if (e.no === data.workPlanNo) {
            setSelectedWorkPlan(`${e.no}:${e.description}`);
          }
        });

        const resDimension = await apiDimensionValue(companyId);
        resDimension.data.value.map((e) => {
          if (e.code === data.project) {
            setSelectedDimension(`${e.code}:${e.name}`);
          }
        });
      }

      // const dimensionFilter = `&$filter=globalDimensionNo eq 1`
      // const resDimensionValues = await apiDimensionValue(companyId, dimensionFilter);
      // let dimensionValues: options[] = [];
      // resDimensionValues.data.value.map((e) => {
      //     dimensionValues.push({ label: `${e.code}::${e.name}`, value: e.code })
      //     if (e.code === data.projectCode) {
      //         setSelectedDimension([{ label: `${e.code}::${e.name}`, value: e.code }])
      //     }
      // });

      // const glAccounts = await apiGLAccountsApi(companyId);
      // let glAccountsOptions: options[] = [];
      // glAccounts.data.value.map((e) => {
      //     glAccountsOptions.push({ label: e.name, value: e.no })
      // });
      // setGlAccounts(glAccountsOptions)

      // const unitOfMeasureRes = await apiUnitOfMeasure(companyId)
      // const unitOfMeasureOptions = unitOfMeasureRes.data.value.map(e => ({ label: `${e.code}::${e.description}`, value: e.code }))
      // setUnitOfMeasure(unitOfMeasureOptions)
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
    <>
      <HeaderMui
        title="Purchase Requisition Approval"
        subtitle="Purchase Requisition Approval"
        breadcrumbItem="Purchase Requisition Approval"
        fields={fields}
        isLoading={isLoading}
        handleBack={() => navigate("/approvals")}
        pageType="approval"
        status={status}
        companyId={companyId}
        documentType="Purchase Requisition"
        requestNo={requestNo}
        tableId={50104}
        lines={
          <Lines
            title="Purchase Requisition Lines"
            subTitle="Purchase Requisition Lines"
            breadcrumbItem="Purchase Requisition Lines"
            data={purchaseRequisitionLines}
            columns={columns}
            noDataMessage="No Purchase Requisition Lines found"
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
    </>
  );
}

export default ApprovePurchaseRequisition;
