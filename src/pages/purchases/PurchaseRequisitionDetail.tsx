import { useNavigate, useParams } from "react-router-dom";
// import Header from "../../Components/ui/Header/Header";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { useEffect, useState } from "react";
import { split } from "lodash";
import { options } from "../../@types/common.dto";
import {
  apiCreatePurchaseRequisitionLines,
  apiPurchaseRequisition,
  apiPurchaseRequisitionDetail,
  apiPurchaseRequisitionLines,
  apiUpdatePurchaseRequisition,
} from "../../services/RequisitionServices";
import {
  apiCurrencyCodes,
  apiDimensionValue,
  apiGLAccountsApi,
  apiItem,
  apiLocation,
  apiUnitOfMeasure,
  apiVendors,
  apiWorkPlanLines,
  apiWorkPlans,
} from "../../services/CommonServices";
import { toast } from "react-toastify";
import Lines from "../../Components/ui/Lines/Lines";
import {
  PurchaseRequisitionLinesSubmitData,
  PurchaseRequisitionLineType,
} from "../../@types/purchaseReq.dto";
import {
  cancelApprovalButton,
  decodeValue,
  getErrorMessage,
} from "../../utils/common";
import {
  ActionFormatterLines,
  numberFormatter,
} from "../../Components/ui/Table/TableUtils";
import Swal from "sweetalert2";
import {
  closeModalRequisition,
  editRequisitionLine,
  modelLoadingRequisition,
  openModalRequisition,
} from "../../store/slices/Requisitions";
import { handleSendForApproval } from "../../actions/actions";
import HeaderMui from "../../Components/ui/Header/HeaderMui";
import { environmentType } from "../../configs/navigation.config/app.config";

function PurchaseRequisitionDetail() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { email } = useAppSelector((state) => state.auth.user);
  const { id } = useParams();
  console.log("id:", id);

  const { companyId } = useAppSelector((state) => state.auth.session);
  const { employeeNo, employeeName } = useAppSelector(
    (state) => state.auth.user
  );
  const [isLoading, setIsLoading] = useState(false);
  const documentType = "Purchase Requisition";
  const [selectedCurrency, setSelectedCurrency] = useState<options[]>([]);
  const [selectedWorkPlan, setSelectedWorkPlan] = useState<options[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<options[]>([]);
  const [selectedDimension, setSelectedDimension] = useState<options[]>([]);
  const [unitOfMeasure, setUnitOfMeasure] = useState<options[]>([]);
  const [selectedUnitOfMeasure, setSelectedUnitOfMeasure] = useState<options[]>(
    []
  );
  const [currencyOptions, setCurrencyOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [workPlans, setWorkPlans] = useState<
    { label: string; value: string }[]
  >([]);
  const [locationOptions, setLocationOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [subjectOfProcurement, setSubjectOfProcurement] = useState<string>("");
  const [expectedReceiptDate, setExpectedReceiptDate] = useState<Date>(
    new Date()
  );
  const [budgetCode, setBudgetCode] = useState<string>("");
  const [dimensionValues, setDimensionValues] = useState<options[]>([]);
  const [requestNo, setRequestNo] = useState<string>("");
  const [purchaseRequisitionLines, setpurchaseRequisitionLines] = useState<
    PurchaseRequisitionLineType[]
  >([]);
  const [status, setStatus] = useState<string>("");
  const [lineSystemId, setLineSystemId] = useState<string>("");
  const [lineEtag, setLineEtag] = useState<string>("");

  const [selectedAccountNo, setSelectedAccountNo] = useState<options[]>([]);
  const [selectedWorkPlanLine, setSelectedWorkPlanLine] = useState<options[]>(
    []
  );
  const [selectedVendor, setSelectedVendor] = useState<options[]>([]);

  console.log("Selected Vendor", selectedVendor);
  const [accountType, setAccountType] = useState<options[]>([]);

  const [quantity, setQuantity] = useState<number>(0);
  const [directUnitCost, setDirectUnitCost] = useState<number>(0);
  const [description, setDescription] = useState<string>("");

  const [glAccounts, setGlAccounts] = useState<options[]>([]);
  const [workPlanLines, setWorkPlanLines] = useState<options[]>([]);

  const accountTypeOptions = [
    { label: "G/L Account", value: "G/L Account" },
    { label: "Item", value: "Item" },
  ];

  const [workPlansList, setWorkPlansList] = useState<any[]>([]);
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
        value: employeeNo,
        disabled: true,
        id: "empNo",
      },
      {
        label: "Requestor Name",
        type: "text",
        value: employeeName,
        disabled: true,
        id: "empName",
      },
      {
        label: environmentType === "HRP" ? "Department" : "Project Code",
        type: "select",
        value: selectedDimension,
        disabled: status === "Open" ? false : true,
        id: "departmentCode",
        options: dimensionValues,
        onChange: async (e: options) => {
          if (purchaseRequisitionLines.length > 0) {
            Swal.fire({
              title: "Are you sure?",
              text: "Changing the department code will delete all existing lines. This action cannot be undone!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Yes, delete all lines!",
            }).then((result) => {
              if (result.isConfirmed) {
                deleteAllLines();
                quickUpdate({ project: selectedDimension[0]?.value });
                setSelectedDimension([{ label: e.label, value: e.value }]);
                setSelectedWorkPlan([]);
                setBudgetCode("");
              }
            });
          } else if (selectedWorkPlan[0]?.value !== "") {
            Swal.fire({
              title: "Are you sure?",
              text: "Changing this will require you to re-select the work plan",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Yes, re-select work plan!",
            }).then((result) => {
              if (result.isConfirmed) {
                quickUpdate({ project: selectedDimension[0]?.value });
                setSelectedDimension([{ label: e.label, value: e.value }]);
                setSelectedWorkPlan([]);
                setBudgetCode("");
              }
            });
          } else {
            quickUpdate({ project: selectedDimension[0]?.value });
            setSelectedDimension([{ label: e.label, value: e.value }]);
          }
        },
      },
    ],
    [
      {
        label: "Expected Receipt Date",
        type: "date",
        value: expectedReceiptDate,
        onChange: (date: Date) => setExpectedReceiptDate(date),
        id: "requisitionDate",
        disabled: status === "Open" ? false : true,
      },
      {
        label: "Store Location",
        type: "select",
        options: locationOptions,
        value: selectedLocation,
        onChange: (e: options) =>
          setSelectedLocation([{ label: e.label, value: e.value }]),
        id: "location",
        disabled: status === "Open" ? false : true,
      },
      {
        label: "Currency",
        type: "select",
        options: currencyOptions,
        value: selectedCurrency,
        onChange: (e: options) =>
          setSelectedCurrency([{ label: e.label, value: e.value }]),
        id: "currency",
        disabled: status === "Open" ? false : true,
      },
      {
        label: "WorkPlan",
        type: "select",
        options: workPlans.filter(
          (plan) => split(plan.value, "::")[1] == selectedDimension[0]?.value
        ),
        value: selectedWorkPlan,
        onChange: (e: options) => {
          if (purchaseRequisitionLines.length > 0) {
            Swal.fire({
              title: "Are you sure?",
              text: "Changing the work plan will delete all existing lines. This action cannot be undone!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Yes, delete all lines!",
            }).then((result) => {
              if (result.isConfirmed) {
                deleteAllLines();
                setSelectedWorkPlan([{ label: e.label, value: e.value }]);
                setBudgetCode(
                  workPlansList.filter(
                    (workPlan) => workPlan.no == split(e.value, "::")[0]
                  )[0].budgetCode
                );
                quickUpdate({ workPlanNo: split(e.value, "::")[0].trim() });
              }
            });
          } else {
            setSelectedWorkPlan([{ label: e.label, value: e.value }]);
            setBudgetCode(
              workPlansList.filter(
                (workPlan) => workPlan.no == split(e.value, "::")[0]
              )[0].budgetCode
            );
            quickUpdate({ workPlanNo: split(e.value, "::")[0].trim() });
          }
        },
        id: "workPlan",
        disabled: status === "Open" ? false : true,
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
      {
        label: "Subject of Procurement",
        type: "textarea",
        value: subjectOfProcurement,
        id: "subjectOfProcurement",
        rows: 2,
        disabled: status === "Open" ? false : true,

        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          setSubjectOfProcurement(e.target.value);
          // quickUpdate({ procurementDescription: e.target.value });
        },
        onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => {
          quickUpdate({ procurementDescription: e.target.value });
        },
      },
    ],
  ];
  const populateData = async () => {
    try {
      setIsLoading(true);
      if (id) {
        const filterQueryPurhDetail = `$expand=purchaseRequisitionLines`;
        const res = await apiPurchaseRequisitionDetail(
          companyId,
          id,
          undefined,
          filterQueryPurhDetail
        );
        const data = res.data;

        if (data.no) {
          setpurchaseRequisitionLines(data.purchaseRequisitionLines);
          setSelectedCurrency(
            data.currencyCode
              ? [{ label: data.currencyCode, value: data.currencyCode }]
              : [{ label: "UGX", value: "" }]
          );
          if (data.workPlanNo !== "") {
            setSelectedWorkPlan([
              { label: `${data.workPlanNo}`, value: data.workPlanNo },
            ]);
          } else {
            setSelectedWorkPlan([{ label: "", value: "" }]);
          }

          setSubjectOfProcurement(data.procurementDescription);
          setExpectedReceiptDate(new Date(data.expectedReceiptDate));
          setRequestNo(data.no);
          // setBudgetCode(data.budgetCode);
          setSubjectOfProcurement(data.procurementDescription);
          setExpectedReceiptDate(new Date(data.expectedReceiptDate));
          setDimensionValues([{ label: data.project, value: data.project }]);
          setStatus(data.status);
          setTotalAmount(data.amount.toLocaleString());
        }

        const resCurrencyCodes = await apiCurrencyCodes(companyId);
        let currencyOptions = [{ label: "UGX", value: "" }]; // Add UGX as the first option
        resCurrencyCodes.data.value.map((e) => {
          currencyOptions.push({ label: e.code, value: e.code });
        });
        setCurrencyOptions(currencyOptions);

        const resWorkPlans = await apiWorkPlans(companyId);
        setWorkPlansList(resWorkPlans.data.value);
        let workPlansOptions: options[] = [];
        resWorkPlans.data.value.map((plan) => {
          if (plan.shortcutDimension1Code === data.project) {
            workPlansOptions.push({
              label: `${plan.no}::${plan.description}`,
              value: `${plan.no}::${plan.shortcutDimension1Code}`,
            });
          } else {
            setWorkPlans(workPlansOptions);
          }
          if (plan.no === data.workPlanNo) {
            if (plan.shortcutDimension1Code === data.project) {
              setSelectedWorkPlan([
                {
                  label: `${plan.no}::${plan.description}`,
                  value: `${plan.no}::${plan.shortcutDimension1Code}`,
                },
              ]);
              setBudgetCode(
                resWorkPlans.data.value.filter(
                  (workPlan) => workPlan.no == plan.no
                )[0].budgetCode
              );
            }
          }
        });

        const resLocationCodes = await apiLocation(companyId);
        let locationOptions: options[] = [];
        resLocationCodes.data.value.map((e) => {
          locationOptions.push({ label: `${e.code}:${e.name}`, value: e.code });
          if (e.code === data.locationCode) {
            setSelectedLocation([
              { label: `${e.code}:${e.name}`, value: e.code },
            ]);
          }
        });
        setLocationOptions(locationOptions);

        const dimensionFilter = `&$filter=globalDimensionNo eq 1`;
        const resDimensionValues = await apiDimensionValue(
          companyId,
          dimensionFilter
        );
        let dimensionValues: options[] = [];
        resDimensionValues.data.value.map((e) => {
          dimensionValues.push({
            label: `${e.code}::${e.name}`,
            value: e.code,
          });
          if (e.code === data.project) {
            setSelectedDimension([
              { label: `${e.code}::${e.name}`, value: e.code },
            ]);
          }
        });
        setDimensionValues(dimensionValues);

        const glAccounts = await apiGLAccountsApi(companyId);
        let glAccountsOptions: options[] = [];
        glAccounts.data.value.map((e) => {
          glAccountsOptions.push({ label: e.name, value: e.no });
        });
        setGlAccounts(glAccountsOptions);

        const unitOfMeasureRes = await apiUnitOfMeasure(companyId);
        const unitOfMeasureOptions = unitOfMeasureRes.data.value.map((e) => ({
          label: `${e.code}::${e.description}`,
          value: e.code,
        }));
        setUnitOfMeasure(unitOfMeasureOptions);

        // const vendors = await apiVendors(companyId);
        // let vendorsOptions: options[] = [];
        // vendors.data.value.map((e) => {
        //     vendorsOptions.push({ label: e.name, value: e.no })
        // });
        // setVendors(vendorsOptions)
      }
    } catch (error) {
      toast.error(`Error fetching data requisitions:${error}`);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    populateData();
  }, []);

  const columns =
    status == "Open"
      ? [
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
          // {
          //     dataField: 'faPostingGroup',
          //     text: 'FA Posting Group',
          //     sort: true,
          // },
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
          {
            dataField: "ShortcutDimCode4",
            text: "Activity Code",
            sort: true,
          },
          {
            dataField: "action",
            isDummyField: true,
            text: "Action",

            formatter: (cellContent: any, row: any) => {
              console.log("Cell Content:", cellContent);
              return (
                <ActionFormatterLines
                  row={row}
                  companyId={companyId}
                  apiHandler={apiPurchaseRequisitionLines}
                  handleDeleteLine={handleDelteLine}
                  handleEditLine={handleEditLine}
                  populateData={populateData}
                />
              );
            },
          },
        ]
      : [
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
          {
            dataField: "ShortcutDimCode4",
            text: "Activity Code",
            sort: true,
          },
        ];
  const modalFields = [
    [
      {
        label: "Account Type",
        type: "select",
        value: accountType,
        disabled: false,
        options: accountTypeOptions,
        onChange: async (e: options) => {
          if (e.value === "Item") {
            setSelectedAccountNo([]);
            setSelectedWorkPlanLine([]);
            setWorkPlanLines([]);

            dispatch(modelLoadingRequisition(true));
            const items = await apiItem(companyId);
            let itemOptions: options[] = [];
            items.data.value.map((e) => {
              itemOptions.push({
                label: `${e.no}::${e.name}`,
                value: e.no,
              });
            });
            setGlAccounts(itemOptions);
            dispatch(modelLoadingRequisition(false));
          }
          if (e.value === "G/L Account") {
            setSelectedAccountNo([]);
            setSelectedWorkPlanLine([]);
            dispatch(modelLoadingRequisition(true));
            const glAccounts = await apiGLAccountsApi(companyId);
            let glAccountsOptions: options[] = [];
            glAccounts.data.value.map((e) => {
              glAccountsOptions.push({
                label: `${e.no}::${e.name}`,
                value: e.no,
              });
            });
            setGlAccounts(glAccountsOptions);
            dispatch(modelLoadingRequisition(false));
          }
          setAccountType([{ label: e.label, value: e.value }]);
        },
      },
      {
        label: "Account No",
        type: "select",
        value: selectedAccountNo,
        onChange: async (e: options) => {
          setSelectedWorkPlanLine([]);

          if (accountType[0]?.value === "Item") {
            dispatch(modelLoadingRequisition(true));
            quickAddLines({
              accountType: accountType[0]?.value,
              accountNo: e.value,
            });

            setSelectedAccountNo([{ label: e.label, value: e.value }]);
            dispatch(modelLoadingRequisition(false));
          } else {
            setSelectedAccountNo([{ label: e.label, value: e.value }]);
            dispatch(modelLoadingRequisition(true));
            const filterQuery = `$filter=workPlanNo eq '${
              split(selectedWorkPlan[0].value, "::")[0]
            }' and accountNo eq '${e?.value}'`;
            const workPlanLines = await apiWorkPlanLines(
              companyId,
              filterQuery
            );
            let workPlanLinesOptions: options[] = [];
            workPlanLines.data.value.map((e) => {
              workPlanLinesOptions.push({
                label: e.entryNo + ":: " + e.activityDescription,
                value: `${e.entryNo}`,
              });
            });
            setWorkPlanLines(workPlanLinesOptions);
            dispatch(modelLoadingRequisition(false));
          }
        },
        options: glAccounts,
        isSearchable: true,
      },
      {
        label: "Work Entry No",
        type: "select",
        value: selectedWorkPlanLine,
        options: workPlanLines,
        disabled: false,
        onChange: (e: options) =>
          setSelectedWorkPlanLine([{ label: e.label, value: e.value }]),
      },
    ],
    [
      // {
      //     label: "Buy-from Vendor",
      //     type: 'select', value:
      //         selectedVendor,
      //     onChange: (e: options) => {
      //         setSelectedVendor([{ label: e.label, value: e.value }])
      //     },
      //     options: vendors,
      //     isSearchable: true
      // },
      {
        label: "Quantity",
        type: "number",
        value: quantity.toString(),
        onChange: (e) => {
          if (Number(e.target.value) < 0) {
            toast.error("Quantity cannot be negative");
            return;
          }
          setQuantity(Number(e.target.value));
        },
      },
      {
        label: "Unit of Measure",
        type: "select",
        value: selectedUnitOfMeasure,
        options: unitOfMeasure,
        onChange: (e: options) =>
          setSelectedUnitOfMeasure([{ label: e.label, value: e.value }]),
      },
      {
        label: "Direct Unit Cost",
        type: "text",
        value: directUnitCost.toLocaleString(),
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          if (Number(e.target.value) < 0) {
            toast.error("Direct Unit Cost cannot be negative");
            return;
          }
          setDirectUnitCost(Number(e.target.value.replace(/,/g, "")));
        },
      },
      {
        label: "Description",
        type: "textarea",
        rows: 2,
        value: description,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.value.length > 50) {
            toast.error(
              `The length of the string is ${e.target.value.length}, but it must be less than or equal to 50 characters`
            );
            return;
          }
          setDescription(e.target.value);
        },
      },
    ],
  ];
  const clearLineFields = () => {
    setAccountType([]);
    setSelectedAccountNo([]);
    setSelectedWorkPlanLine([]);
    setSelectedVendor([]);
    setQuantity(0);
    setDirectUnitCost(0);
    setDescription("");
    setSelectedUnitOfMeasure([]);
    setLineSystemId("");
    setLineEtag("");
  };

  const handleSubmitLines = async () => {
    if (
      selectedAccountNo[0]?.value == "" ||
      selectedWorkPlanLine[0]?.value == "" ||
      quantity == 0 ||
      directUnitCost == 0 ||
      description == ""
    ) {
      const missingField =
        selectedAccountNo[0]?.value == ""
          ? "Account No"
          : selectedWorkPlanLine[0]?.value == ""
          ? "Work Entry No"
          : quantity == 0
          ? "Quantity"
          : directUnitCost == 0
          ? "Direct Unit Cost"
          : "Description";
      toast.error(`Please fill in ${missingField}`);
      return;
    }
    try {
      const data: PurchaseRequisitionLinesSubmitData = {
        accountType: accountType[0]?.value,
        documentType: "Purchase Requisition",
        // buyfromVendorNo: selectedVendor[0]?.value,
        workPlanNo: split(selectedWorkPlan[0].value, "::")[0],
        documentNo: requestNo,
        no: selectedAccountNo[0]?.value,
        unitOfMeasure: selectedUnitOfMeasure[0]?.value,
      };

      const res = await apiCreatePurchaseRequisitionLines(companyId, data);

      if (res.status == 201) {
        updateLineAfterBudgetCheck(res.data.systemId, res.data["@odata.etag"]);
        // toast.success("Line added successfully")
        // populateData()
      }
    } catch (error) {
      toast.error(
        `Error adding line:${getErrorMessage(
          error.response.data.error.message
        )}`
      );
    }
  };

  const updateLineAfterBudgetCheck = async (systemId: string, etag: string) => {
    try {
      const data = {
        workPlanEntryNo: Number(selectedWorkPlanLine[0]?.value),
        description2: description,
        quantity: quantity,
        directUnitCost: directUnitCost,
      };
      const res = await apiPurchaseRequisitionLines(
        companyId,
        "PATCH",
        data,
        systemId,
        etag
      );
      if (res.status == 200) {
        toast.success("Line added successfully");
        populateData();
        dispatch(closeModalRequisition());
      }
    } catch (error) {
      toast.error(
        `Error updating line:${getErrorMessage(
          error.response.data.error.message
        )}`
      );
    }
  };

  const handleDelteLine = async (row: any) => {
    console.log(row);
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const resDelteLine = await apiPurchaseRequisitionLines(
          companyId,
          "DELETE",
          undefined,
          row.systemId,
          row["@odata.etag"]
        );
        if (resDelteLine.status == 204) {
          toast.success("Line deleted successfully");
        }
      }
    });
  };

  const handleEditLine = async (row: any) => {
    dispatch(openModalRequisition());
    dispatch(modelLoadingRequisition(true));

    dispatch(editRequisitionLine(true));

    console.log("Row data new", row);
    //clear all fields
    clearLineFields();
    // get data
    setLineSystemId(row.systemId);
    setLineEtag(row["@odata.etag"]);
    const vendorRes = await apiVendors(companyId);
    const vendors = vendorRes.data.value.map((vendor) => ({
      label: vendor.name,
      value: vendor.no,
    }));
    if (decodeValue(row.accountType) === "G/L Account") {
      const glAccounts = await apiGLAccountsApi(companyId);

      const glAccountsOptions = glAccounts.data.value.map((account) => ({
        label: `${account.no}::${account.name}`,
        value: account.no,
      }));
      setGlAccounts(glAccountsOptions);
      const glAccountData = glAccountsOptions.filter((e) => e.value === row.no);
      glAccountData.length > 0
        ? setSelectedAccountNo([
            { label: glAccountData[0].label, value: glAccountData[0].value },
          ])
        : setSelectedAccountNo([{ label: "", value: "" }]);

      const filterQuery = `$filter=workPlanNo eq '${
        split(selectedWorkPlan[0].value, "::")[0]
      }' and accountNo eq '${row.no}'`;
      const workPlanEntryNoRes = await apiWorkPlanLines(companyId, filterQuery);

      const workPlanLines = workPlanEntryNoRes.data.value.map((plan) => ({
        label: `${plan.entryNo}::${plan.activityDescription}`,
        value: `${plan.entryNo}`,
      }));
      setWorkPlanLines(workPlanLines);
    } else if (row.accountType === "Item") {
      const items = await apiItem(companyId);
      let itemOptions: options[] = [];
      items.data.value.map((e) => {
        itemOptions.push({ label: `${e.no}::${e.name}`, value: e.no });
      });
      setGlAccounts(itemOptions);
      const itemData = itemOptions.filter((e) => e.value === row.no);
      itemData.length > 0
        ? setSelectedAccountNo([
            { label: itemData[0].label, value: itemData[0].value },
          ])
        : setSelectedAccountNo([{ label: "", value: "" }]);

      const filterQuery = `$filter=workPlanNo eq '${
        split(selectedWorkPlan[0].value, "::")[0]
      }' and accountNo eq '${row.chargeAccount}'`;
      const workPlanEntryNoRes = await apiWorkPlanLines(companyId, filterQuery);

      const workPlanLines = workPlanEntryNoRes.data.value.map((plan) => ({
        label: `${plan.entryNo}::${plan.activityDescription}`,
        value: `${plan.entryNo}`,
      }));
      setWorkPlanLines(workPlanLines);
    }
    console.log("row.accountType", decodeValue(row.accountType));

    //set values
    const vendorData = vendors.filter((e) => e.value === row.buyFromVendorNo);
    vendorData.length > 0
      ? setSelectedVendor([
          { label: vendorData[0].label, value: vendorData[0].value },
        ])
      : setSelectedVendor([{ label: "", value: "" }]);

    const workPlanEntryNo = workPlanLines.filter(
      (e) => e.value === row.workPlanEntryNo.toString()
    );
    workPlanEntryNo.length > 0
      ? setSelectedWorkPlanLine([
          { label: workPlanEntryNo[0].label, value: workPlanEntryNo[0].value },
        ])
      : setSelectedWorkPlanLine([{ label: "", value: "" }]);

    const unitOfMeasureRes = await apiUnitOfMeasure(companyId);
    const unitOfMeasureOptions = unitOfMeasureRes.data.value.map((e) => ({
      label: `${e.code}::${e.description}`,
      value: e.code,
    }));
    setUnitOfMeasure(unitOfMeasureOptions);
    const unitOfMeasureData = unitOfMeasureOptions.filter(
      (e) => e.value === row.unitOfMeasure
    );
    unitOfMeasureData.length > 0
      ? setSelectedUnitOfMeasure([
          {
            label: unitOfMeasureData[0].label,
            value: unitOfMeasureData[0].value,
          },
        ])
      : setSelectedUnitOfMeasure([{ label: "", value: "" }]);

    setAccountType([
      {
        label: decodeValue(row.accountType),
        value: decodeValue(row.accountType),
      },
    ]);
    setQuantity(row.quantity);
    setDirectUnitCost(row.directUnitCost);
    setDescription(row.description2);

    dispatch(modelLoadingRequisition(false));
  };

  const handleSubmitUpdatedLine = async () => {
    if (
      selectedAccountNo[0]?.value == "" ||
      selectedWorkPlanLine[0]?.value == "" ||
      quantity == 0 ||
      directUnitCost == 0 ||
      description == "" ||
      selectedUnitOfMeasure[0]?.value == ""
    ) {
      const missingField =
        selectedAccountNo[0]?.value == ""
          ? "Account No"
          : selectedWorkPlanLine[0]?.value == ""
          ? "Work Entry No"
          : quantity == 0
          ? "Quantity"
          : directUnitCost == 0
          ? "Direct Unit Cost"
          : description == ""
          ? "Description"
          : selectedUnitOfMeasure[0]?.value == ""
          ? "Unit of Measure"
          : "";
      toast.error(`Please fill in ${missingField}`);
      return;
    }
    try {
      const data = {
        workPlanEntryNo: Number(selectedWorkPlanLine[0]?.value),
        description2: description,
        quantity: quantity,
        directUnitCost: directUnitCost,
        unitOfMeasure: selectedUnitOfMeasure[0]?.value,
      };
      dispatch(modelLoadingRequisition(true));
      const res = await apiPurchaseRequisitionLines(
        companyId,
        "PATCH",
        data,
        lineSystemId,
        lineEtag
      );
      if (res.status == 200) {
        toast.success("Line updated successfully");
        clearLineFields();
        dispatch(editRequisitionLine(false));
        dispatch(closeModalRequisition());
        populateData();
      }
    } catch (error) {
      toast.error(
        `Error updating line:${getErrorMessage(
          error.response.data.error.message
        )}`
      );
    } finally {
      dispatch(modelLoadingRequisition(false));
    }
  };

  const quickAddLines = async ({ accountType, accountNo }) => {
    try {
      if (accountType === "Item") {
        const response = await apiCreatePurchaseRequisitionLines(companyId, {
          accountType: accountType,
          documentType: "Purchase Requisition",
          // workPlanNo: split(selectedWorkPlan[0].value, '::')[0],
          documentNo: requestNo,
          no: accountNo,
        });

        if (response.status == 201) {
          const workPlanEntryNo = await apiWorkPlanLines(
            companyId,
            `$filter=workPlanNo eq '${
              split(selectedWorkPlan[0].value, "::")[0]
            }' and accountNo eq '${response.data.chargeAccount}'`
          );
          setWorkPlanLines(
            workPlanEntryNo.data.value.map((plan) => ({
              label: `${plan.entryNo}::${plan.activityDescription}`,
              value: `${plan.entryNo}`,
            }))
          );
          //delete created line
          const deleteCreatedLine = await apiPurchaseRequisitionLines(
            companyId,
            "DELETE",
            undefined,
            response.data.systemId,
            response["@odata.etag"]
          );
          if (deleteCreatedLine.status == 204) {
            // toast.success("Line added successfully")
            // populateData()
          }
        }
      }
    } catch (error) {}
  };

  const handleCancelApproval = async () => {
    const data = {
      documentNo: requestNo,
    };
    try {
      const response = await cancelApprovalButton({
        companyId,
        data,
        action: "cancelPurchaseHeaderApprovalReq",
        populateDoc: populateData,
        documentLines: purchaseRequisitionLines,
      });
      if (response) {
        console.log("cancel response", response);
      }
    } catch (error) {}
  };

  const handleDeletePurchaseRequisition = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await apiPurchaseRequisition(
          companyId,
          "DELETE",
          undefined,
          undefined,
          id,
          undefined
        );
        if (response.status == 204) {
          toast.success("Purchase Requisition deleted successfully");
          navigate("/purchase-requisitions");
        }
      }
    });
  };

  const quickUpdate = async (kwargs) => {
    try {
      if (id) {
        const response = await apiUpdatePurchaseRequisition(
          companyId,
          id,
          {
            ...kwargs,

            expectedReceiptDate: kwargs.expectedReceiptDate
              ? kwargs.expectedReceiptDate.toISOString()
              : undefined,
          },
          "*"
        );
        if (response.status === 200) {
          toast.success("Updated successfully");
        }
      }
    } catch (error) {
      toast.error(`Error updating: ${getErrorMessage(error.message)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAllLines = async () => {
    try {
      for (const line of purchaseRequisitionLines) {
        await apiPurchaseRequisitionLines(
          companyId,
          "DELETE",
          undefined,
          line.systemId,
          line["@odata.etag"]
        );
      }
      await populateData();
      toast.success("All lines deleted successfully");
    } catch (error) {
      toast.error(
        `Error deleting lines: ${getErrorMessage((error as Error).message)}`
      );
    }
  };

  const handleValidateHeaderFields = () => {
    if (
      subjectOfProcurement == null ||
      subjectOfProcurement == "" ||
      subjectOfProcurement == undefined ||
      selectedCurrency[0]?.value == null ||
      selectedCurrency[0]?.value == undefined ||
      selectedWorkPlan[0]?.value == null ||
      selectedWorkPlan[0]?.value == "" ||
      selectedWorkPlan[0]?.value == undefined ||
      selectedDimension[0]?.value == null ||
      selectedDimension[0]?.value == "" ||
      selectedDimension[0]?.value == undefined
    ) {
      const missingField =
        subjectOfProcurement == null ||
        subjectOfProcurement == "" ||
        subjectOfProcurement == undefined
          ? "Subject of Procurement"
          : selectedCurrency[0]?.value == null ||
            selectedCurrency[0]?.value == undefined
          ? "Currency"
          : selectedWorkPlan[0]?.value == null ||
            selectedWorkPlan[0]?.value == "" ||
            selectedWorkPlan[0]?.value == undefined
          ? "Work Plan"
          : selectedDimension[0]?.value == null ||
            selectedDimension[0]?.value == "" ||
            selectedDimension[0]?.value == undefined
          ? "Dimension"
          : "";
      if (missingField) {
        toast.error(`Please fill in ${missingField}`);
        return false;
      }
    }
    return true;
  };
  return (
    <>
      <HeaderMui
        title="Purchase Requisition Detail"
        subtitle="Purchase Requisition Detail"
        breadcrumbItem="Purchase Requisition Detail"
        fields={fields}
        isLoading={isLoading}
        tableId={50104}
        handleBack={() => navigate("/purchase-requisitions")}
        pageType="detail"
        status={status}
        handleSendApprovalRequest={async () => {
          const documentNo = requestNo;
          const documentLines = purchaseRequisitionLines;
          const link = "sendPurchaseHeaderApprovalReq";
          setIsLoading(true);
          try {
            await handleSendForApproval(
              documentNo,
              email,
              documentLines,
              companyId,
              link,
              populateData
            );
          } catch (error) {
            toast.error(
              `Error sending for approval:${getErrorMessage(
                error.response.data.error.message
              )}`
            );
          } finally {
            setIsLoading(false);
          }
        }}
        handleCancelApprovalRequest={handleCancelApproval}
        handleDeletePurchaseRequisition={handleDeletePurchaseRequisition}
        companyId={companyId}
        documentType={documentType}
        requestNo={requestNo}
        lines={
          <Lines
            clearLineFields={clearLineFields}
            title="Purchase Requisition Lines"
            subTitle="Purchase Requisition Lines"
            breadcrumbItem="Purchase Requisition Lines"
            addLink=""
            addLabel=""
            iconClassName=""
            data={purchaseRequisitionLines}
            columns={columns}
            noDataMessage="No Purchase Requisition Lines found"
            status={status}
            modalFields={modalFields}
            handleSubmitLines={handleSubmitLines}
            handleDeleteLines={handleDelteLine}
            handleSubmitUpdatedLine={handleSubmitUpdatedLine}
            handleValidateHeaderFields={handleValidateHeaderFields}
          />
        }
      />
    </>
  );
}

export default PurchaseRequisitionDetail;
